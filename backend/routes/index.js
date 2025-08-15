const express = require('express');
const authRoute = require('./auth')
const socialAuth = require('./socialAuth');
const bookings = require('./bookings')
const listings = require('./listings');
const reviews = require('./reviews')
const users = require('./users');
const hostApplications = require('./hostApplications');
const likes = require('./likes');
const notifications = require('./notifications');
const payments = require('./payments')

const router = express.Router()

router.use('/auth', authRoute)
router.use('/auth', socialAuth);
router.use('/bookings', bookings)
router.use('/listings', listings)
router.use('/reviews', reviews)
router.use('/users', users);
router.use('/host-applications', hostApplications);
router.use('/likes', likes);
router.use('/notifications', notifications);
router.use('/chat', require('./chat'));
router.use('/payments', payments);

// Test endpoint for payout scheduler (remove in production)
router.post('/test-payout-scheduler', async (req, res) => {
  try {
    console.log('🧪 Manually triggering payout scheduler for testing...');
    const { processDuePayouts } = require('../services/payoutScheduler');
    await processDuePayouts();
    res.json({ message: 'Payout scheduler test completed successfully' });
  } catch (error) {
    console.error('❌ Error testing payout scheduler:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router