# 🔧 Payment Webhook Debugging Guide

## 🚨 Current Issue
When a user creates a booking, the payment is sent successfully to the host's Stripe Connect account, but the system doesn't update the payment and booking statuses.

## 🔍 Root Causes & Solutions

### 1. **Webhook Endpoint Configuration**
**Problem**: Stripe needs to know where to send webhooks.
**Solution**: Configure webhook endpoint in Stripe Dashboard.

**Steps**:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Set endpoint URL: `https://yourdomain.com/webhook` (or `http://localhost:5000/webhook` for development)
4. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `transfer.created`
   - `account.updated`
   - `account.external_account.updated`
   - `payout.failed`
5. Copy the webhook signing secret to your `.env` file

### 2. **Environment Variables**
**Problem**: Missing or incorrect webhook secret.
**Solution**: Verify environment variables.

**Required in `.env`**:
```bash
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
FRONTEND_URL=http://localhost:3000
```

### 3. **Webhook Signature Verification**
**Problem**: Webhook signature verification failing.
**Solution**: Ensure webhook secret is correct and webhook endpoint is properly configured.

### 4. **Database Connection Issues**
**Problem**: Webhook can't update database.
**Solution**: Check database connection and models.

## 🧪 Testing & Debugging Steps

### Step 1: Check Webhook Endpoint
```bash
# Test if webhook endpoint is accessible
curl -X POST http://localhost:5000/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

### Step 2: Check Server Logs
Look for these log messages in your server console:
```
📋 Webhook received: checkout.session.completed
✅ Checkout session completed: cs_xxxxxxxxxxxxx
✅ Found booking for session: [booking_id]
✅ Booking status updated to reserved
✅ Payment updated to completed status
```

### Step 3: Test Manual Payment Verification
Use the new manual verification endpoint:
```bash
# Replace [payment_id] with actual payment ID
curl -X POST http://localhost:5000/payments/manual-check/[payment_id] \
  -H "Authorization: Bearer [your_token]" \
  -H "Content-Type: application/json"
```

### Step 4: Check Stripe Dashboard
1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Check if webhook events are being sent
3. Look for failed webhook attempts
4. Check webhook endpoint status

### Step 5: Verify Database Records
Check if payment and booking records exist and their current statuses:
```javascript
// In your database
db.payments.findOne({ stripeSessionId: "cs_xxxxxxxxxxxxx" })
db.bookings.findOne({ paymentSessionId: "cs_xxxxxxxxxxxxx" })
```

## 🔧 Manual Fixes

### Fix 1: Update All Pending Payments
```javascript
// Run this in your database or create an admin endpoint
db.payments.updateMany(
  { status: "pending" },
  { 
    $set: { 
      status: "completed",
      payoutStatus: "completed",
      completedAt: new Date()
    }
  }
);
```

### Fix 2: Update All Pending Bookings
```javascript
// Run this in your database or create an admin endpoint
db.bookings.updateMany(
  { status: "pending", paymentStatus: "pending" },
  { 
    $set: { 
      status: "reserved",
      paymentStatus: "completed"
    }
  }
);
```

## 🚀 Prevention Measures

### 1. **Add Webhook Health Check**
Create a simple endpoint to verify webhook configuration:
```javascript
app.get('/webhook-health', (req, res) => {
  res.json({
    status: 'healthy',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ? 'configured' : 'missing',
    stripeKey: process.env.STRIPE_SECRET_KEY ? 'configured' : 'missing'
  });
});
```

### 2. **Add Payment Status Monitoring**
Create a cron job to check pending payments:
```javascript
// Check pending payments every hour
cron.schedule('0 * * * *', async () => {
  const pendingPayments = await Payment.find({ status: 'pending' });
  console.log(`Found ${pendingPayments.length} pending payments`);
  
  for (const payment of pendingPayments) {
    try {
      // Check Stripe status and update if needed
      const session = await stripe.checkout.sessions.retrieve(payment.stripeSessionId);
      if (session.payment_status === 'paid') {
        // Update payment status
      }
    } catch (error) {
      console.error(`Error checking payment ${payment._id}:`, error);
    }
  }
});
```

### 3. **Enhanced Logging**
Add more detailed logging to track webhook processing:
```javascript
console.log('📋 Webhook processing started:', new Date().toISOString());
console.log('📋 Webhook body length:', req.body.length);
console.log('📋 Webhook headers:', req.headers);
```

## 📋 Checklist

- [ ] Webhook endpoint configured in Stripe Dashboard
- [ ] Webhook secret in `.env` file
- [ ] Webhook events selected (checkout.session.completed, etc.)
- [ ] Server logs showing webhook reception
- [ ] Database models properly imported
- [ ] Payment and booking records exist
- [ ] Manual verification endpoint working
- [ ] Stripe webhook events being sent successfully

## 🆘 Emergency Fix

If webhooks are still not working, use the manual verification endpoint to update payment statuses:

```javascript
// Frontend: Call this after successful payment
const verifyPayment = async (paymentId) => {
  try {
    const response = await paymentsAPI.manualPaymentStatusCheck(paymentId);
    console.log('Payment verified:', response.data);
  } catch (error) {
    console.error('Payment verification failed:', error);
  }
};
```

## 📞 Support

If issues persist:
1. Check Stripe webhook logs in dashboard
2. Verify webhook endpoint accessibility
3. Test with Stripe CLI webhook forwarding
4. Check server error logs
5. Verify database connectivity
