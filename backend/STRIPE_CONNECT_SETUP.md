# Stripe Connect Webhook Setup Guide

## 🔗 **Webhook Configuration for Connect Events**

### **1. Create Connect Webhook Endpoint**

In your Stripe Dashboard:
1. Go to **Developers > Webhooks**
2. Click **"Add endpoint"**
3. **Endpoint URL:** `https://yourdomain.com/webhook` (must be HTTPS)
4. **Listen to:** Select **"Events on Connected accounts"** ⚠️ **CRITICAL**
5. **Events to send:** Select the events you want to receive

### **2. Required Connect Events**

#### **Essential Events:**
- `account.updated` - Account status changes
- `account.external_account.updated` - Bank account updates
- `payout.failed` - Payout failures
- `payment_intent.succeeded` - Successful payments
- `balance.available` - Balance updates

#### **Optional Events:**
- `person.updated` - Person requirement updates
- `account.application.deauthorized` - Account disconnections

### **3. Webhook Secret**

1. After creating the webhook, copy the **Signing secret**
2. Add to your `.env` file:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxx
   ```

### **4. Testing Connect Webhooks**

#### **Using Stripe CLI:**
```bash
# Listen to Connect events
stripe listen --forward-connect-to localhost:3000/webhook

# Trigger specific Connect events
stripe trigger --stripe-account acct_xxx account.updated
stripe trigger --stripe-account acct_xxx payout.failed
```

#### **Using Stripe Dashboard:**
1. Go to your webhook endpoint
2. Click **"Send test webhook"**
3. Select **"Events on Connected accounts"**
4. Choose event type and connected account

### **5. Webhook Event Structure**

Connect events include an `account` field identifying the connected account:

```json
{
  "id": "evt_xxx",
  "livemode": true,
  "object": "event",
  "type": "account.updated",
  "account": "acct_xxx",  // Connected account ID
  "data": {
    "object": {
      "id": "acct_xxx",
      "charges_enabled": true,
      "payouts_enabled": true
    }
  }
}
```

### **6. Handling Connect Events**

#### **Account Updates:**
```javascript
if (event.type === 'account.updated') {
  const account = event.data.object;
  console.log('Account updated:', account.id);
  console.log('Charges enabled:', account.charges_enabled);
  console.log('Payouts enabled:', account.payouts_enabled);
}
```

#### **External Account Updates:**
```javascript
if (event.type === 'account.external_account.updated') {
  const externalAccount = event.data.object;
  console.log('External account updated:', externalAccount.id);
  console.log('Account type:', externalAccount.object);
}
```

#### **Payout Failures:**
```javascript
if (event.type === 'payout.failed') {
  const payout = event.data.object;
  console.log('Payout failed:', payout.id);
  console.log('Failure reason:', payout.failure_code);
}
```

### **7. Security Best Practices**

#### **Verify Webhook Signatures:**
```javascript
const sig = req.headers['stripe-signature'];
const event = stripe.webhooks.constructEvent(
  req.body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

#### **Check Event Source:**
```javascript
// Verify this is a Connect event
if (event.account) {
  console.log('Connect event for account:', event.account);
  // Handle as connected account event
} else {
  console.log('Platform event');
  // Handle as platform event
}
```

### **8. Error Handling**

#### **Return 200 Quickly:**
```javascript
// Acknowledge receipt immediately
res.json({ received: true });

// Process event asynchronously
setTimeout(() => {
  processWebhookEvent(event);
}, 0);
```

#### **Handle Retries:**
```javascript
// Stripe will retry failed webhooks
// Return 200 to acknowledge receipt
// Log errors for debugging
try {
  await processWebhookEvent(event);
} catch (error) {
  console.error('Webhook processing error:', error);
  // Still return 200 to prevent retries
}
```

### **9. Environment-Specific Setup**

#### **Development:**
- Use Stripe CLI for local testing
- Webhook URL: `http://localhost:3000/webhook` (with CLI forwarding)

#### **Production:**
- Webhook URL must be HTTPS
- Must be publicly accessible
- Consider webhook endpoint redundancy

### **10. Monitoring & Debugging**

#### **Webhook Logs:**
- Check Stripe Dashboard > Webhooks > Endpoint details
- Monitor delivery attempts and failures
- Set up alerts for webhook failures

#### **Common Issues:**
- **404 errors:** Endpoint not accessible
- **Signature verification failures:** Wrong webhook secret
- **Timeout errors:** Endpoint too slow to respond
- **Connect events not received:** Wrong webhook configuration

### **11. Testing Checklist**

- [ ] Webhook endpoint is publicly accessible
- [ ] HTTPS enabled (production)
- [ ] "Events on Connected accounts" selected
- [ ] Webhook secret configured in environment
- [ ] Signature verification implemented
- [ ] Connect events being received
- [ ] Event processing working correctly
- [ ] Error handling implemented
- [ ] Monitoring set up

---

## 🚀 **Next Steps**

1. **Configure webhook endpoint** in Stripe Dashboard
2. **Test with Stripe CLI** locally
3. **Deploy to production** with HTTPS
4. **Monitor webhook delivery** and errors
5. **Implement event handling** for your use case

For more information, see [Stripe Connect Webhooks Documentation](https://stripe.com/docs/connect/webhooks).
