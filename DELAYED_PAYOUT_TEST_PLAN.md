# DrivInn Delayed Payout System Test Plan

## Overview
This document outlines the testing procedures for the delayed payout system implementation. The system should now hold funds in the platform account and transfer them to hosts 1 hour after guest check-in.

## Test Scenarios

### 1. Payment Processing Without Immediate Transfer
**Objective**: Verify that payments are processed but funds are not immediately transferred to hosts

**Steps**:
1. Create a new booking through the frontend
2. Complete payment using Stripe Checkout
3. Check payment record in database
4. Verify that `payoutStatus` is 'pending'
5. Check Stripe dashboard to confirm funds are held in platform account

**Expected Results**:
- Payment status should be 'completed'
- Payout status should be 'pending'
- No immediate transfer to host account
- Funds held in platform account

### 2. Check-in Triggers Payout Scheduling
**Objective**: Verify that check-in schedules payout for 1 hour later

**Steps**:
1. Complete a booking and payment
2. Simulate check-in by updating booking status to 'checked_in'
3. Check payment record in database
4. Verify that `payoutStatus` is 'scheduled'
5. Verify that `scheduledPayoutAt` is set to 1 hour after check-in time

**Expected Results**:
- Payment payout status should be 'scheduled'
- Scheduled payout time should be 1 hour after check-in
- Payout scheduled flag should be true

### 3. Delayed Payout Processing
**Objective**: Verify that payouts are processed at the scheduled time

**Steps**:
1. Complete a booking, payment, and check-in
2. Advance system time to scheduled payout time
3. Wait for delayed payout processor to run (every 5 minutes)
4. Check payment record in database
5. Check Stripe dashboard for transfer to host account

**Expected Results**:
- Payment payout status should be 'completed'
- Transfer should be created in Stripe
- Host account should receive funds
- Platform fee should be deducted (10%)
- Transfer details should be recorded in payment record

### 4. Payout Failure Handling
**Objective**: Verify that payout failures are handled correctly

**Steps**:
1. Complete a booking, payment, and check-in
2. Configure host account to fail transfer (e.g., invalid account)
3. Advance system time to scheduled payout time
4. Wait for delayed payout processor to run
5. Check payment record in database

**Expected Results**:
- Payment payout status should be 'failed'
- Failure reason should be recorded
- Error details should be logged
- System should not crash or stop processing other payouts

### 5. Multiple Payouts Processing
**Objective**: Verify that multiple payouts can be processed correctly

**Steps**:
1. Create multiple bookings with payments and check-ins
2. Schedule payouts for different times
3. Advance system time to process multiple payouts
4. Check all payment records in database
5. Check Stripe dashboard for all transfers

**Expected Results**:
- All eligible payouts should be processed
- Each payout should have correct transfer details
- Platform fees should be calculated correctly for each
- System should handle concurrent processing without issues

## Manual Testing Commands

### Simulate Check-in
```bash
# Use MongoDB client to update booking status
db.bookings.updateOne(
  { _id: ObjectId("BOOKING_ID") },
  { 
    $set: { 
      status: "checked_in",
      checkedIn: true,
      checkInDate: new Date()
    }
  }
)
```

### Advance System Time
For testing purposes, you can modify the delayed payout processor to use a different time comparison:
```javascript
// In delayedPayoutProcessor.js, for testing you can use:
const paymentsToProcess = await Payment.find({
  payoutStatus: 'scheduled',
  scheduledPayoutAt: { $lte: new Date(Date.now() + 3600000) }, // Add 1 hour buffer for testing
  status: 'completed'
});
```

## Automated Testing

### Unit Tests for Delayed Payout Processor
Create unit tests for the `processDelayedPayouts` function:
- Test with valid host account and sufficient funds
- Test with invalid host account
- Test with insufficient funds
- Test with network errors
- Test with multiple concurrent payouts

### Integration Tests
- Test complete booking flow from creation to payout
- Test edge cases like same-day check-in/check-out
- Test timezone handling
- Test platform fee calculations

## Monitoring and Logging

### Key Metrics to Monitor
- Number of payouts processed per hour
- Payout success rate
- Average processing time
- Error rates and types
- Platform fee collection

### Log Messages to Check
- "💳 Scheduled payout for booking [ID] at [TIME]"
- "✅ Payout completed for payment [ID], transfer ID: [TRANSFER_ID]"
- "❌ Error processing payout for payment [ID]: [ERROR]"

## Rollback Plan

If issues are found during testing:
1. Revert changes to checkout session creation
2. Revert webhook handler changes
3. Disable delayed payout processor
4. Restore original booking status scheduler
5. Monitor system for any residual issues

## Success Criteria
- All test scenarios pass
- No funds are lost or double-transferred
- Error handling works correctly
- Performance is acceptable
- System is stable under load