// Test timezone conversion logic
console.log('🧪 Testing timezone conversion...\n');

// Simulate the booking data - Cameroon timezone (GMT+1)
const checkInDate = new Date('Sat Aug 16 2025 08:00:00 GMT+0100');
const checkInTime = '12:03'; // 12:03 PM

console.log(`📅 Original check-in date: ${checkInDate.toString()}`);
console.log(`⏰ Check-in time: ${checkInTime}`);

// Parse the time
const [checkInHour, checkInMinute] = checkInTime.split(':').map(Number);

// Create datetime object in Cameroon timezone
const checkInDateTime = new Date(
  checkInDate.getFullYear(),
  checkInDate.getMonth(),
  checkInDate.getDate(),
  checkInHour,
  checkInMinute,
  0,
  0
);

console.log(`\n🔍 Before timezone conversion:`);
console.log(`  - Local datetime: ${checkInDateTime.toString()}`);
console.log(`  - ISO string: ${checkInDateTime.toISOString()}`);

// Convert to UTC by subtracting Cameroon offset (GMT+1)
const cameroonOffset = 1 * 60; // 1 hour in minutes
checkInDateTime.setMinutes(checkInDateTime.getMinutes() - cameroonOffset);

console.log(`\n✅ After timezone conversion (UTC):`);
console.log(`  - UTC datetime: ${checkInDateTime.toString()}`);
console.log(`  - ISO string: ${checkInDateTime.toISOString()}`);

// Calculate check-in window
const checkInWindowStart = new Date(checkInDateTime.getTime() - 60 * 60 * 1000);
const checkInWindowEnd = new Date(checkInDateTime.getTime() + 60 * 60 * 1000);

console.log(`\n⏰ Check-in window:`);
console.log(`  - Start: ${checkInWindowStart.toISOString()}`);
console.log(`  - End: ${checkInWindowEnd.toISOString()}`);

// Test current time
const now = new Date();
console.log(`\n🕐 Current time: ${now.toISOString()}`);

const isCheckInTime = now >= checkInWindowStart && now <= checkInWindowEnd;
console.log(`\n🎯 Is check-in time? ${isCheckInTime}`);

if (isCheckInTime) {
  console.log(`  ✅ Should trigger check-in!`);
} else {
  console.log(`  ❌ Not check-in time yet`);
  const timeUntilCheckIn = checkInWindowStart.getTime() - now.getTime();
  const hoursUntilCheckIn = Math.floor(timeUntilCheckIn / (1000 * 60 * 60));
  const minutesUntilCheckIn = Math.floor((timeUntilCheckIn % (1000 * 60 * 60)) / (1000 * 60));
  console.log(`  ⏳ Time until check-in: ${hoursUntilCheckIn}h ${minutesUntilCheckIn}m`);
}

// Test with a future date to show the conversion working
console.log(`\n🧪 Testing with future date (tomorrow):`);
const tomorrowCheckInDate = new Date('Sun Aug 17 2025 08:00:00 GMT+0100');
const tomorrowCheckInDateTime = new Date(
  tomorrowCheckInDate.getFullYear(),
  tomorrowCheckInDate.getMonth(),
  tomorrowCheckInDate.getDate(),
  12, // 12 PM
  3,  // 03 minutes
  0,
  0
);

console.log(`  - Tomorrow check-in (Cameroon): ${tomorrowCheckInDateTime.toString()}`);
console.log(`  - Tomorrow check-in (UTC): ${tomorrowCheckInDateTime.toISOString()}`);

// Convert to UTC
tomorrowCheckInDateTime.setMinutes(tomorrowCheckInDateTime.getMinutes() - cameroonOffset);
console.log(`  - After conversion (UTC): ${tomorrowCheckInDateTime.toISOString()}`);
console.log(`  - This should be 11:03 AM UTC (12:03 PM Cameroon - 1 hour)`);
