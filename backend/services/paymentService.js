const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class PaymentService {
  // Calculate fees and amounts
  calculateFees(totalAmount) {
    const platformFee = totalAmount * 0.03; // 3% platform fee
    const stripeFee = totalAmount * 0.029 + 0.30; // Stripe fee (2.9% + $0.30)
    const processingFee = stripeFee;
    const hostAmount = totalAmount - platformFee - processingFee;
    
    return {
      totalAmount,
      platformFee: Math.round(platformFee * 100) / 100,
      processingFee: Math.round(processingFee * 100) / 100,
      hostAmount: Math.round(hostAmount * 100) / 100
    };
  }

  // Create Stripe payment intent
  async createStripePaymentIntent(booking, paymentMethod) {
    try {
      const fees = this.calculateFees(booking.totalPrice);
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(booking.totalPrice * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          bookingId: booking._id.toString(),
          listingId: booking.listing._id.toString(),
          guestId: booking.guests.toString(),
          hostId: booking.hosts.toString(),
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          nights: booking.nights
        },
        automatic_payment_methods: {
          enabled: true,
        },
        application_fee_amount: Math.round(fees.platformFee * 100), // Platform fee in cents
        transfer_data: {
          destination: booking.listing.owner.toString(), // Host's Stripe account
        },
      });

      return {
        paymentIntentId: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: booking.totalPrice,
        processingFee: fees.processingFee,
        platformFee: fees.platformFee,
        hostAmount: fees.hostAmount
      };
    } catch (error) {
      console.error('Stripe payment intent creation error:', error);
      throw new Error(`Payment intent creation failed: ${error.message}`);
    }
  }

  // Confirm Stripe payment
  async confirmStripePayment(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      
      if (paymentIntent.status === 'succeeded') {
        return {
          success: true,
          amount: paymentIntent.amount / 100, // Convert from cents
          paymentIntentId: paymentIntent.id
        };
      } else if (paymentIntent.status === 'requires_payment_method') {
        return {
          success: false,
          error: 'Payment method required'
        };
      } else if (paymentIntent.status === 'requires_confirmation') {
        return {
          success: false,
          error: 'Payment requires confirmation'
        };
      } else {
        return {
          success: false,
          error: `Payment status: ${paymentIntent.status}`
        };
      }
    } catch (error) {
      console.error('Stripe payment confirmation error:', error);
      throw new Error(`Payment confirmation failed: ${error.message}`);
    }
  }

  // Create PayPal order (simplified - would need PayPal SDK)
  async createPayPalOrder(booking) {
    try {
      const fees = this.calculateFees(booking.totalPrice);
      
      // Simulate PayPal order creation
      // In production, you would use PayPal SDK
      const paypalOrderId = `paypal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        paypalOrderId: paypalOrderId,
        amount: booking.totalPrice,
        processingFee: fees.processingFee,
        platformFee: fees.platformFee,
        hostAmount: fees.hostAmount
      };
    } catch (error) {
      console.error('PayPal order creation error:', error);
      throw new Error(`PayPal order creation failed: ${error.message}`);
    }
  }

  // Process Cash App payment (simplified)
  async processCashAppPayment(booking, cashAppId) {
    try {
      const fees = this.calculateFees(booking.totalPrice);
      
      // Simulate Cash App payment
      // In production, you would integrate with Cash App API
      const cashAppPaymentId = `cashapp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        cashAppPaymentId: cashAppPaymentId,
        amount: booking.totalPrice,
        processingFee: fees.processingFee,
        platformFee: fees.platformFee,
        hostAmount: fees.hostAmount
      };
    } catch (error) {
      console.error('Cash App payment error:', error);
      throw new Error(`Cash App payment failed: ${error.message}`);
    }
  }

  // Release payment to host through their preferred payout method
  async releasePaymentToHost(bookingId) {
    try {
      const booking = await require('../models/booking').findById(bookingId)
        .populate('listing')
        .populate('hosts');
      
      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.payment.status !== 'in_escrow') {
        throw new Error('Payment not in escrow');
      }

      const listing = booking.listing;
      const payoutMethod = listing.paymentPreferences?.hostPayoutMethod || 'stripe';
      const payoutDetails = listing.paymentPreferences?.hostPayoutDetails || {};

      let payoutResult;

      switch (payoutMethod) {
        case 'stripe':
          payoutResult = await this.processStripePayout(booking, payoutDetails);
          break;
        case 'paypal':
          payoutResult = await this.processPayPalPayout(booking, payoutDetails);
          break;
        case 'cash_app':
          payoutResult = await this.processCashAppPayout(booking, payoutDetails);
          break;
        case 'bank_transfer':
          payoutResult = await this.processBankTransferPayout(booking, payoutDetails);
          break;
        default:
          throw new Error(`Unsupported payout method: ${payoutMethod}`);
      }

      if (payoutResult.success) {
        // Update booking status
        booking.payment.status = 'released';
        booking.payment.releasedAt = new Date();
        booking.status = 'active';
        await booking.save();

        return {
          success: true,
          hostId: booking.hosts,
          amount: booking.payment.hostAmount,
          bookingId: booking._id,
          payoutMethod: payoutMethod,
          payoutId: payoutResult.payoutId
        };
      } else {
        throw new Error(payoutResult.error || 'Payout failed');
      }
    } catch (error) {
      console.error('Payment release error:', error);
      throw new Error(`Payment release failed: ${error.message}`);
    }
  }

  // Process Stripe payout
  async processStripePayout(booking, payoutDetails) {
    try {
      const stripeAccountId = payoutDetails.stripeAccountId;
      if (!stripeAccountId) {
        throw new Error('Stripe account ID not configured');
      }

      // Create a transfer to the host's Stripe account
      const transfer = await stripe.transfers.create({
        amount: Math.round(booking.payment.hostAmount * 100), // Convert to cents
        currency: 'usd',
        destination: stripeAccountId,
        description: `Payout for booking ${booking._id}`,
        metadata: {
          bookingId: booking._id.toString(),
          listingId: booking.listing._id.toString(),
          hostId: booking.hosts.toString()
        }
      });

      return {
        success: true,
        payoutId: transfer.id,
        amount: booking.payment.hostAmount
      };
    } catch (error) {
      console.error('Stripe payout error:', error);
      return {
        success: false,
        error: `Stripe payout failed: ${error.message}`
      };
    }
  }

  // Process PayPal payout
  async processPayPalPayout(booking, payoutDetails) {
    try {
      const paypalEmail = payoutDetails.paypalEmail;
      if (!paypalEmail) {
        throw new Error('PayPal email not configured');
      }

      // Simulate PayPal payout (in production, use PayPal API)
      const payoutId = `paypal_payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        payoutId: payoutId,
        amount: booking.payment.hostAmount
      };
    } catch (error) {
      console.error('PayPal payout error:', error);
      return {
        success: false,
        error: `PayPal payout failed: ${error.message}`
      };
    }
  }

  // Process Cash App payout
  async processCashAppPayout(booking, payoutDetails) {
    try {
      const cashAppId = payoutDetails.cashAppId;
      if (!cashAppId) {
        throw new Error('Cash App ID not configured');
      }

      // Simulate Cash App payout (in production, use Cash App API)
      const payoutId = `cashapp_payout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        payoutId: payoutId,
        amount: booking.payment.hostAmount
      };
    } catch (error) {
      console.error('Cash App payout error:', error);
      return {
        success: false,
        error: `Cash App payout failed: ${error.message}`
      };
    }
  }

  // Process bank transfer payout
  async processBankTransferPayout(booking, payoutDetails) {
    try {
      const bankAccount = payoutDetails.bankAccount;
      if (!bankAccount.accountNumber || !bankAccount.routingNumber) {
        throw new Error('Bank account details not configured');
      }

      // Simulate bank transfer (in production, use bank API)
      const payoutId = `bank_transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        success: true,
        payoutId: payoutId,
        amount: booking.payment.hostAmount
      };
    } catch (error) {
      console.error('Bank transfer payout error:', error);
      return {
        success: false,
        error: `Bank transfer failed: ${error.message}`
      };
    }
  }

  // Refund payment
  async refundPayment(bookingId, reason) {
    try {
      const booking = await require('../models/booking').findById(bookingId);
      
      if (!booking) {
        throw new Error('Booking not found');
      }

      let refundResult;

      if (booking.payment.stripePaymentIntentId) {
        // Refund Stripe payment
        const refund = await stripe.refunds.create({
          payment_intent: booking.payment.stripePaymentIntentId,
          reason: 'requested_by_customer',
          metadata: {
            bookingId: bookingId,
            reason: reason
          }
        });
        refundResult = refund;
      } else {
        // Simulate refund for other payment methods
        refundResult = {
          id: `refund_${Date.now()}`,
          amount: booking.payment.amount * 100,
          status: 'succeeded'
        };
      }

      // Update booking status
      booking.payment.status = 'refunded';
      booking.status = 'cancelled';
      await booking.save();

      return {
        success: true,
        refundId: refundResult.id,
        amount: refundResult.amount / 100,
        status: refundResult.status
      };
    } catch (error) {
      console.error('Payment refund error:', error);
      throw new Error(`Payment refund failed: ${error.message}`);
    }
  }

  // Get payment methods for a listing
  getPaymentMethodsForListing(listing) {
    const acceptedMethods = listing.paymentPreferences?.acceptedMethods || ['credit_card', 'paypal'];
    const preferredMethod = listing.paymentPreferences?.preferredMethod || 'credit_card';
    
    return {
      acceptedMethods,
      preferredMethod,
      methods: [
        {
          id: 'credit_card',
          name: 'Credit Card',
          description: 'Visa, Mastercard, American Express, Discover',
          icon: '💳',
          enabled: acceptedMethods.includes('credit_card')
        },
        {
          id: 'paypal',
          name: 'PayPal',
          description: 'Pay with your PayPal account',
          icon: '🔵',
          enabled: acceptedMethods.includes('paypal')
        },
        {
          id: 'cash_app',
          name: 'Cash App',
          description: 'Pay with Cash App',
          icon: '💚',
          enabled: acceptedMethods.includes('cash_app')
        },
        {
          id: 'apple_pay',
          name: 'Apple Pay',
          description: 'Pay with Apple Pay',
          icon: '🍎',
          enabled: acceptedMethods.includes('apple_pay')
        },
        {
          id: 'google_pay',
          name: 'Google Pay',
          description: 'Pay with Google Pay',
          icon: '🤖',
          enabled: acceptedMethods.includes('google_pay')
        },
        {
          id: 'bank_transfer',
          name: 'Bank Transfer',
          description: 'Direct bank transfer',
          icon: '🏦',
          enabled: acceptedMethods.includes('bank_transfer')
        }
      ].filter(method => method.enabled)
    };
  }
}

module.exports = new PaymentService(); 