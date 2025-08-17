// This file is now deprecated as we're using automatic payouts
// The payout scheduler is no longer needed since Stripe handles payouts automatically
// This file is kept for compatibility but only contains basic logging

const cron = require('node-cron');

// Run payout scheduler every hour (deprecated - only for logging)
const startPayoutScheduler = () => {
  console.log('⏰ Payout scheduler is deprecated - automatic payouts are handled by Stripe');
  
  // Schedule a simple log message to indicate the scheduler is running
  cron.schedule('0 * * * *', () => {
    console.log('⏰ Payout scheduler running (deprecated - automatic payouts are handled by Stripe)');
  });
};

// Run initial payout check when server starts (deprecated)
const runInitialPayoutCheck = async () => {
  console.log('🚀 Initial payout check (deprecated - automatic payouts are handled by Stripe)');
};

module.exports = {
  startPayoutScheduler,
  runInitialPayoutCheck
};
