# DrivInn Delayed Payout System Implementation

## Overview
This document outlines the implementation plan to modify the DrivInn payment system to delay payouts to hosts until 1 hour after guest check-in, instead of processing them immediately after payment.

## Current System Analysis
The current system uses `transfer_data` in Stripe Checkout sessions to immediately transfer funds to hosts when payments are completed. This needs to be changed to hold funds in the platform account and transfer them later.

## Implementation Steps

### 1. Remove Immediate Transfer from Checkout Session
**File: backend/controllers/bookingsController.js**
- Remove the `transfer_data` section from the Stripe Checkout session configuration
- Update metadata to indicate delayed payout processing

### 2. Update Payment Model for Delayed Payouts
**File: backend/models/payment.js**
Add new fields to track delayed payouts:
- `scheduledPayoutAt`: When payout is scheduled for
- `payoutScheduled`: Whether payout is scheduled

### 3. Modify Webhook Handling
**File: backend/server.js**
- Update the `checkout.session.completed` webhook handler to NOT mark payout as completed
- Keep payment status as 'completed' but leave payout status as 'pending'

### 4. Create New Payout Processing Service
**New File: backend/services/delayedPayoutProcessor.js**
This service will:
- Run on a cron schedule (every 5 minutes)
- Find payments with `payoutStatus: 'pending'` and `scheduledPayoutAt` <= current time
- Process Stripe transfers to host accounts
- Update payment records with transfer details
- Handle errors and retries

### 5. Update Booking Status Scheduler
**File: backend/services/bookingStatusScheduler.js**
- Modify the `updatePayoutStatus` function to schedule payouts for 1 hour after check-in
- Set `scheduledPayoutAt` to check-in time + 1 hour
- Update payment `payoutStatus` to 'scheduled'

## Detailed Implementation

### 1. Modified Checkout Session Creation
In `bookingsController.js`, remove the `transfer_data` section:
```javascript
// BEFORE (lines 241-247):
payment_intent_data: {
  transfer_data: {
    destination: hostApplication.stripeConnect.accountId,
  }
}

// AFTER:
// No transfer_data - funds will be held in platform account
```

### 2. Updated Webhook Handler
In `server.js`, modify the `checkout.session.completed` handler:
```javascript
// BEFORE (lines 148-154):
payoutMethod: 'stripe_connect',
payoutStatus: 'completed',
payoutCompletedAt: new Date(),

// AFTER:
payoutMethod: 'stripe_connect',
payoutStatus: 'pending', // Keep as pending for delayed processing
// Remove payoutCompletedAt
```

### 3. New Delayed Payout Processor Service
Create `backend/services/delayedPayoutProcessor.js`:
```javascript
const cron = require('node-cron');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/payment');
const Booking = require('../models/booking');
const HostApplication = require('../models/HostApplication');

const processDelayedPayouts = async () => {
  try {
    console.log('🔄 Processing delayed payouts...');
    
    // Find payments that are ready for payout (scheduled time has passed)
    const now = new Date();
    const paymentsToProcess = await Payment.find({
      payoutStatus: 'scheduled',
      scheduledPayoutAt: { $lte: now },
      status: 'completed'
    }).populate('booking');
    
    console.log(`📋 Found ${paymentsToProcess.length} payments ready for payout`);
    
    for (const payment of paymentsToProcess) {
      try {
        // Get booking and host information
        const booking = payment.booking;
        if (!booking) {
          console.log(`⚠️ No booking found for payment ${payment._id}`);
          continue;
        }
        
        // Get listing and host application
        const Listing = require('../models/listing');
        const listing = await Listing.findById(booking.home).populate('owner');
        if (!listing) {
          console.log(`⚠️ No listing found for booking ${booking._id}`);
          continue;
        }
        
        const hostApplication = await HostApplication.findOne({ 
          user: listing.owner._id, 
          status: 'approved' 
        });
        
        if (!hostApplication || !hostApplication.stripeConnect?.accountId) {
          console.log(`⚠️ No approved host application with Stripe Connect account found for host ${listing.owner._id}`);
          continue;
        }
        
        // Calculate platform fee (10%)
        const platformFee = Math.round(payment.amount * 0.10 * 100); // In cents
        const hostAmount = Math.round(payment.amount * 0.90 * 100); // In cents
        
        // Create transfer to host
        console.log(`💳 Creating transfer for payment ${payment._id} to host ${hostApplication.stripeConnect.accountId}`);
        const transfer = await stripe.transfers.create({
          amount: hostAmount,
          currency: payment.currency,
          destination: hostApplication.stripeConnect.accountId,
          description: `Payout for booking ${booking._id}`,
          metadata: {
            bookingId: booking._id.toString(),
            paymentId: payment._id.toString(),
            platformFee: platformFee
          }
        });
        
        // Update payment record
        payment.payoutStatus = 'completed';
        payment.payoutCompletedAt = new Date();
        payment.stripeTransferId = transfer.id;
        payment.transferStatus = 'completed';
        payment.transferCompletedAt = new Date();
        payment.platformFee = platformFee / 100; // Convert back to dollars
        payment.metadata = {
          ...(payment.metadata || {}),
          transferId: transfer.id,
          transferAmount: hostAmount,
          transferCurrency: transfer.currency
        };
        
        await payment.save();
        console.log(`✅ Payout completed for payment ${payment._id}, transfer ID: ${transfer.id}`);
        
      } catch (error) {
        console.error(`❌ Error processing payout for payment ${payment._id}:`, error.message);
        
        // Update payment with failure details
        payment.payoutStatus = 'failed';
        payment.payoutFailureReason = error.message;
        payment.payoutFailureDetails = error.stack;
        await payment.save();
      }
    }
    
    console.log('✅ Delayed payout processing completed');
  } catch (error) {
    console.error('❌ Error in delayed payout processing:', error);
  }
};

// Start the payout processor
const startDelayedPayoutProcessor = () => {
  console.log('⏰ Starting delayed payout processor...');
  
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    console.log('🔄 Running delayed payout processor (every 5 minutes)...');
    await processDelayedPayouts();
  });
  
  console.log('✅ Delayed payout processor started (runs every 5 minutes)');
};

module.exports = {
  startDelayedPayoutProcessor,
  processDelayedPayouts
};
```

### 4. Update Booking Status Scheduler
In `backend/services/bookingStatusScheduler.js`, modify the `updatePayoutStatus` function:
```javascript
// Updated function to schedule payouts for 1 hour after check-in
const updatePayoutStatus = async (booking) => {
  try {
    // Find the payment record for this booking
    const Payment = require('../models/payment');
    const payment = await Payment.findOne({ 
      booking: booking._id,
      status: 'completed'
    });
    
    if (payment && payment.payoutStatus === 'pending') {
      // Schedule payout for 1 hour after check-in
      const scheduledPayoutAt = new Date(booking.checkInDate.getTime() + 60 * 60 * 1000); // 1 hour later
      
      // Update payout status to scheduled
      payment.payoutStatus = 'scheduled';
      payment.scheduledPayoutAt = scheduledPayoutAt;
      payment.payoutScheduled = true;
      await payment.save();
      
      console.log(`💳 Scheduled payout for booking ${booking._id} at ${scheduledPayoutAt.toISOString()}`);
    }
  } catch (error) {
    console.error('❌ Error updating payout status:', error);
  }
};
```

### 5. Update Payment Model
Add new fields to `backend/models/payment.js`:
```javascript
// Add these fields to the payment schema (around line 32)
scheduledPayoutAt: { type: Date }, // When payout is scheduled for
payoutScheduled: { type: Boolean, default: false }, // Whether payout is scheduled

// Add index for scheduled payouts
paymentSchema.index({ scheduledPayoutAt: 1, payoutStatus: 1 });
```

## Testing Plan
1. Create a test booking and complete payment
2. Verify that funds are held in platform account (no immediate transfer)
3. Simulate check-in and verify payout is scheduled for 1 hour later
4. Advance system time and verify payout is processed
5. Check Stripe dashboard to confirm transfer to host account
6. Verify payment record updates correctly

## Rollout Considerations
1. Deploy changes to staging environment first
2. Monitor webhook processing and payout scheduling
3. Test with small transactions before full deployment
4. Have rollback plan ready in case of issues
5. Update documentation for support team