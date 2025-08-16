# Automatic Payout Verification Guide

## 🎯 **Testing Automatic Payouts to Hosts**

### **Prerequisites**
- ✅ Stripe Connect webhook configured with "Events on Connected accounts"
- ✅ Host has completed Stripe Connect onboarding
- ✅ Host account has `charges_enabled: true` and `payouts_enabled: true`
- ✅ Webhook secret updated in `.env` file

---

## 🧪 **Step 1: Test Webhook Configuration**

### **1.1 Send Test Webhook**
1. **Stripe Dashboard > Developers > Webhooks**
2. **Click your webhook endpoint**
3. **Click "Send test webhook"**
4. **Select "Events on Connected accounts"**
5. **Choose event:** `account.updated`
6. **Select connected account:** Choose a host's account ID
7. **Click "Send test webhook"**

### **1.2 Check Server Logs**
Look for these log messages in your server console:
```
📋 Webhook received: account.updated
🔗 Connect webhook event for account: acct_xxx
✅ Connected account updated: acct_xxx
```

### **1.3 Verify Webhook Response**
- **Expected:** `200 OK` response
- **Check:** Stripe Dashboard shows "Delivered" status
- **If failed:** Check webhook logs for error details

---

## 💳 **Step 2: Test Payment Flow**

### **2.1 Create Test Booking**
1. **Frontend:** Go through booking flow as a guest
2. **Payment:** Use Stripe test card: `4242 4242 4242 4242`
3. **Complete:** Finish checkout process

### **2.2 Monitor Webhook Events**
Watch your server console for these events:
```
📋 Webhook received: checkout.session.completed
✅ Checkout session completed: cs_test_xxx
✅ Found booking for session: [booking_id]
✅ Found host application with Stripe Connect account: acct_xxx
💳 Capturing payment with transfer_data for automatic payout...
✅ Payment captured with transfer_data successfully: pi_xxx
💸 Transfer ID: tr_xxx
✅ Payment updated with transfer details: [payment_id]
💸 Automatic payout to host completed successfully
```

### **2.3 Check Database Records**
Verify these records were created/updated:

#### **Booking Status:**
```javascript
// Should be 'reserved'
const booking = await Booking.findById(bookingId);
console.log('Booking status:', booking.status); // Should be 'reserved'
```

#### **Payment Record:**
```javascript
// Should have transfer details
const payment = await Payment.findOne({ stripeSessionId: sessionId });
console.log('Payment status:', payment.status); // Should be 'completed'
console.log('Transfer ID:', payment.stripeTransferId); // Should have tr_xxx
console.log('Payout status:', payment.payoutStatus); // Should be 'completed'
```

---

## 🔍 **Step 3: Verify Stripe Dashboard**

### **3.1 Platform Dashboard**
1. **Go to:** [dashboard.stripe.com](https://dashboard.stripe.com)
2. **Check:** Payments > Payment intents
3. **Look for:** Payment with `transfer_data` and `application_fee_amount`
4. **Verify:** Transfer was created to connected account

### **3.2 Connected Account Dashboard**
1. **Go to:** [connect.stripe.com/app/express#acct_xxx/overview](https://connect.stripe.com/app/express#acct_xxx/overview)
2. **Replace:** `acct_xxx` with actual host account ID
3. **Check:** Payments received
4. **Verify:** Transfer amount matches booking total minus platform fee

---

## 🚨 **Step 4: Troubleshooting Common Issues**

### **Issue 1: Webhook Not Receiving Events**
**Symptoms:**
- No webhook logs in server console
- Stripe Dashboard shows "Failed" delivery status

**Solutions:**
1. **Check webhook URL:** Must be publicly accessible
2. **Verify HTTPS:** Production must use HTTPS
3. **Check "Events on Connected accounts":** Must be selected
4. **Test with Stripe CLI:**
   ```bash
   stripe listen --forward-connect-to localhost:3000/webhook
   ```

### **Issue 2: Payment Capture Fails**
**Symptoms:**
- Error: "Payment capture failed"
- Transfer not created

**Solutions:**
1. **Check host account status:**
   ```javascript
   const account = await stripe.accounts.retrieve(accountId);
   console.log('Charges enabled:', account.charges_enabled);
   console.log('Payouts enabled:', account.payouts_enabled);
   ```
2. **Verify account ID:** Check `hostApplication.stripeConnect.accountId`
3. **Check account requirements:** Complete any pending verifications

### **Issue 3: Transfer Not Created**
**Symptoms:**
- Payment captured but no transfer
- Host doesn't receive funds

**Solutions:**
1. **Check transfer_data configuration:**
   ```javascript
   transfer_data: {
     destination: hostApplication.stripeConnect.accountId, // Must be valid account ID
   }
   ```
2. **Verify application_fee_amount:** Must be less than total amount
3. **Check Stripe logs:** Look for transfer creation errors

### **Issue 4: Host Account Not Found**
**Symptoms:**
- Error: "No approved host application with Stripe Connect account"
- Payment processing fails

**Solutions:**
1. **Check host application status:** Must be 'approved'
2. **Verify Stripe Connect setup:** Account must be created
3. **Check user association:** Host must own the listing

---

## 📊 **Step 5: Monitoring & Alerts**

### **5.1 Set Up Monitoring**
1. **Webhook delivery:** Monitor success/failure rates
2. **Payment processing:** Track capture success rates
3. **Transfer creation:** Monitor automatic payout success
4. **Error rates:** Alert on high failure rates

### **5.2 Key Metrics to Track**
- **Webhook delivery rate:** Should be >99%
- **Payment capture success:** Should be >99%
- **Transfer creation success:** Should be >99%
- **Average processing time:** Should be <5 seconds

### **5.3 Error Alerting**
Set up alerts for:
- Webhook delivery failures
- Payment capture failures
- Transfer creation failures
- High error rates (>5%)

---

## ✅ **Step 6: Verification Checklist**

### **Webhook Configuration:**
- [ ] Webhook endpoint is publicly accessible
- [ ] "Events on Connected accounts" is selected
- [ ] Required events are enabled
- [ ] Webhook secret is updated in `.env`
- [ ] Test webhook delivers successfully

### **Host Account Setup:**
- [ ] Host has completed Stripe Connect onboarding
- [ ] Account has `charges_enabled: true`
- [ ] Account has `payouts_enabled: true`
- [ ] No pending requirements
- [ ] Bank account is linked

### **Payment Flow:**
- [ ] Test booking creates payment session
- [ ] Webhook receives `checkout.session.completed`
- [ ] Payment is captured with `transfer_data`
- [ ] Transfer is created to host account
- [ ] Host receives funds (minus platform fee)

### **Database Records:**
- [ ] Booking status updated to 'reserved'
- [ ] Payment status updated to 'completed'
- [ ] Transfer ID is recorded
- [ ] Payout status is 'completed'
- [ ] All timestamps are recorded

---

## 🚀 **Next Steps After Verification**

1. **Monitor production:** Set up logging and alerting
2. **Test edge cases:** Failed payments, refunds, disputes
3. **Performance testing:** High-volume payment processing
4. **Security review:** Verify webhook signature validation
5. **Documentation:** Update team on payout process

---

## 📞 **Support & Resources**

- **Stripe Connect Documentation:** [stripe.com/docs/connect](https://stripe.com/docs/connect)
- **Webhook Testing:** Use Stripe CLI for local development
- **Dashboard Access:** [dashboard.stripe.com](https://dashboard.stripe.com)
- **Connect Dashboard:** [connect.stripe.com](https://connect.stripe.com)

---

**Last Updated:** $(date)
**Version:** 1.0
