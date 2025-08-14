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

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log('✅ Payment successful for booking:', session.metadata.bookingId);
        console.log('📋 Session metadata:', session.metadata);

        // Mark booking as reserved
        const Booking = require('./models/booking');
        const Payment = require('./models/payment');
        const HostApplication = require('./models/HostApplication');

        try {
          const updatedBooking = await Booking.findByIdAndUpdate(session.metadata.bookingId, {
            status: 'reserved',
          }, { new: true });

          console.log('✅ Booking status updated to reserved:', updatedBooking._id);

          // Update payment status
          if (session.metadata.paymentId) {
            const updatedPayment = await Payment.findByIdAndUpdate(session.metadata.paymentId, {
              status: 'completed',
              transactionId: session.payment_intent || session.id,
              stripePaymentIntentId: session.payment_intent,
              payoutMethod: 'stripe_connect',
              metadata: {
                stripeSessionId: session.id,
                paymentIntentId: session.payment_intent
              }
            }, { new: true });

            console.log('✅ Payment status updated to completed:', updatedPayment._id);
          }
        } catch (error) {
          console.error('❌ Error updating booking/payment:', error);
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