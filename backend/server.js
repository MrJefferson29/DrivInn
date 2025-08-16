const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const connectDB = require('./connectDB');
const IndexRoute = require('./routes/index');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
const http = require('http');
const socketio = require('socket.io');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Import models to ensure they are registered with Mongoose
require('./models/user');
require('./models/listing');
require('./models/booking');
require('./models/payment');
require('./models/HostApplication');
require('./models/notification');
require('./models/chat');
require('./models/review');

// Import payout scheduler
const { startPayoutScheduler, runInitialPayoutCheck } = require('./services/payoutScheduler');

dotenv.config({ path: './.env' });

const app = express();
connectDB();

// Start payout scheduler after database connection
connectDB().then(() => {
  console.log('🚀 Starting payout scheduler...');
  startPayoutScheduler();
  runInitialPayoutCheck();
}).catch(err => {
  console.error('❌ Failed to start payout scheduler:', err);
});

// Passport configuration
require('./config/passport');

// Stripe Webhook must use raw body parser
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const sig = req.headers['stripe-signature'];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      console.log('📋 Webhook received:', event.type);

      // Handle Connect events (events on connected accounts)
      if (event.account) {
        console.log('🔗 Connect webhook event for account:', event.account);
        console.log('📋 Event type:', event.type);
        
        // Handle Connect-specific events
        if (event.type === 'account.updated') {
          console.log('✅ Connected account updated:', event.account);
          // You can add logic here to sync account status changes
        }
        
        if (event.type === 'account.external_account.updated') {
          console.log('✅ Connected account external account updated:', event.account);
          // Handle bank account updates
        }
        
        if (event.type === 'payout.failed') {
          console.log('❌ Connected account payout failed:', event.account);
          // Handle payout failures
        }
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log('✅ Checkout session completed:', session.id);
        console.log('📋 Session metadata:', session.metadata);

        // Find booking by payment session ID
        const Booking = require('./models/booking');
        const Payment = require('./models/payment');
        const HostApplication = require('./models/HostApplication');

        try {
          const booking = await Booking.findOne({ paymentSessionId: session.id });
          
          if (!booking) {
            console.log('⚠️ No booking found for session:', session.id);
            return res.json({ received: true });
          }

          console.log('✅ Found booking for session:', booking._id);

          // Find the listing and host application to get Stripe Connect account
          const Listing = require('./models/listing');
          const listing = await Listing.findById(booking.home).populate('owner');
          
          if (!listing) {
            console.log('❌ No listing found for booking:', booking._id);
            return res.json({ received: true });
          }

          const hostApplication = await HostApplication.findOne({ 
            user: listing.owner._id, 
            status: 'approved' 
          });

          if (!hostApplication || !hostApplication.stripeConnect?.accountId) {
            console.log('❌ No approved host application with Stripe Connect account found for:', listing.owner._id);
            return res.json({ received: true });
          }

          console.log('✅ Found host application with Stripe Connect account:', hostApplication.stripeConnect.accountId);

          // Update booking status to reserved
          const updatedBooking = await Booking.findByIdAndUpdate(booking._id, {
            status: 'reserved',
            updatedAt: new Date()
          }, { new: true });

          console.log('✅ Booking status updated to reserved:', updatedBooking._id);

          // Find and update payment record
          const payment = await Payment.findOne({ stripeSessionId: session.id });
          if (payment) {
            // Capture payment with transfer_data to enable automatic payout
            try {
              console.log('💳 Capturing payment with transfer_data for automatic payout...');
              
              const paymentIntent = await stripe.paymentIntents.capture(
                session.payment_intent,
                {
                  stripeAccount: hostApplication.stripeConnect.accountId
                }
              );

              console.log('✅ Payment captured with transfer_data successfully:', paymentIntent.id);
              console.log('💸 Transfer ID:', paymentIntent.latest_charge?.transfer);

              // Update payment with transfer details
              const updatedPayment = await Payment.findByIdAndUpdate(payment._id, {
                status: 'completed',
                transactionId: paymentIntent.id,
                stripePaymentIntentId: session.payment_intent,
                payoutMethod: 'stripe_connect',
                payoutStatus: 'completed',
                stripeTransferId: paymentIntent.latest_charge?.transfer,
                payoutCompletedAt: new Date(),
                completedAt: new Date(),
                transferStatus: 'completed',
                transferCompletedAt: new Date(),
                metadata: {
                  ...payment.metadata,
                  stripeSessionId: session.id,
                  paymentIntentId: session.payment_intent,
                  webhookProcessed: true,
                  transferProcessed: true,
                  transferId: paymentIntent.latest_charge?.transfer
                }
              }, { new: true });

              console.log('✅ Payment updated with transfer details:', updatedPayment._id);
              console.log('💸 Automatic payout to host completed successfully');

            } catch (captureError) {
              console.error('❌ Error capturing payment with transfer_data:', captureError);
              
              // Update payment status to failed
              await Payment.findByIdAndUpdate(payment._id, {
                status: 'failed',
                payoutStatus: 'failed',
                payoutFailureReason: 'Transfer capture failed',
                payoutFailureDetails: captureError.message,
                failedAt: new Date(),
                transferStatus: 'failed',
                metadata: {
                  ...payment.metadata,
                  webhookProcessed: true,
                  transferProcessed: false,
                  transferError: captureError.message
                }
              });

              // Update booking status to payment failed
              await Booking.findByIdAndUpdate(booking._id, {
                status: 'payment_failed',
                paymentFailureReason: 'Transfer capture failed',
                updatedAt: new Date()
              });

              console.error('❌ Payment capture failed, booking marked as payment_failed');
            }
          }

          // Send notification to host about new booking
          try {
            const NotificationService = require('./services/notificationService');
            await NotificationService.createBookingNotification(booking._id, 'new_booking');
            console.log('✅ Host notification created for new booking');
          } catch (notificationError) {
            console.error('❌ Error creating host notification:', notificationError);
          }

        } catch (error) {
          console.error('❌ Error updating booking/payment:', error);
        }
      }

      // Handle payment intent events for additional payment status updates
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        console.log('✅ Payment intent succeeded:', paymentIntent.id);

        // Find payment by payment intent ID
        const Payment = require('./models/payment');
        try {
          const payment = await Payment.findOne({ 
            'metadata.stripePaymentIntentId': paymentIntent.id 
          });

          if (payment) {
            console.log('✅ Found payment for payment intent:', payment._id);
            
            // Update payment with additional details
            await Payment.findByIdAndUpdate(payment._id, {
              status: 'completed',
              transactionId: paymentIntent.id,
              completedAt: new Date(),
              metadata: {
                ...payment.metadata,
                paymentIntentStatus: paymentIntent.status,
                webhookProcessed: true
              }
            });

            console.log('✅ Payment updated with payment intent details');
          }
        } catch (error) {
          console.error('❌ Error updating payment with payment intent:', error);
        }
      }

      // Handle payment intent capture (when we manually capture the payment)
      if (event.type === 'payment_intent.payment_failed') {
        const paymentIntent = event.data.object;
        console.log('❌ Payment intent failed:', paymentIntent.id);

        // Find payment and update status
        const Payment = require('./models/payment');
        try {
          const payment = await Payment.findOne({ 
            'metadata.stripePaymentIntentId': paymentIntent.id 
          });

          if (payment) {
            console.log('✅ Found payment for failed payment intent:', payment._id);
            
            // Update payment status to failed
            await Payment.findByIdAndUpdate(payment._id, {
              status: 'failed',
              failedAt: new Date(),
              metadata: {
                ...payment.metadata,
                paymentIntentStatus: paymentIntent.status,
                failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
                webhookProcessed: true
              }
            });

            // Update booking status to cancelled
            const Booking = require('./models/booking');
            const booking = await Booking.findById(payment.booking);
            if (booking) {
              await Booking.findByIdAndUpdate(booking._id, {
                status: 'cancelled',
                updatedAt: new Date()
              });
              console.log('✅ Booking status updated to cancelled due to payment failure');
            }

            console.log('✅ Payment updated with failure details');
          }
        } catch (error) {
          console.error('❌ Error updating failed payment:', error);
        }
      }

      res.json({ received: true });
    } catch (err) {
      console.error('❌ Webhook Error:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

// JSON parser for all other routes
app.use(express.json());
app.use(morgan('dev'));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Session configuration for OAuth
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use('/', IndexRoute);

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = socketio(server, { cors: { origin: '*' } });
app.set('io', io);

io.on('connection', (socket) => {
  socket.on('joinRoom', ({ chatRoomId }) => {
    socket.join(chatRoomId);
  });

  socket.on('sendMessage', (msg) => {
    if (msg.type === 'location') {
      io.to(msg.chatRoomId).emit('receiveMessage', msg);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});