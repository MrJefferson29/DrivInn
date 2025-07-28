const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Listing",
    required: true,
  },
  guest: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  hosts: { type: mongoose.Schema.ObjectId, ref: "User", required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  guests: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "reserved", "checked-in", "checked-out", "cancelled"],
    default: "pending",
  },
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  checkInTime: { type: String, default: "14:00" }, // Default check-in time
  checkOutTime: { type: String, default: "11:00" }, // Default check-out time
});

// Pre-save middleware to automatically update booking status based on dates
bookingSchema.pre('save', function(next) {
  const now = new Date();
  const startDate = new Date(this.startDate);
  const endDate = new Date(this.endDate);
  
  // Only update status if it's not cancelled
  if (this.status !== 'cancelled') {
    // Get check-in and check-out times from listing or use defaults
    const checkInTime = this.checkInTime || "14:00";
    const checkOutTime = this.checkOutTime || "11:00";
    
    // Create datetime objects for check-in and check-out
    const checkInDateTime = new Date(startDate);
    const [checkInHour, checkInMinute] = checkInTime.split(':').map(Number);
    checkInDateTime.setHours(checkInHour, checkInMinute, 0, 0);
    
    const checkOutDateTime = new Date(endDate);
    const [checkOutHour, checkOutMinute] = checkOutTime.split(':').map(Number);
    checkOutDateTime.setHours(checkOutHour, checkOutMinute, 0, 0);
    
    // Update status based on current time
    if (now >= checkOutDateTime) {
      this.status = 'checked-out';
    } else if (now >= checkInDateTime) {
      this.status = 'checked-in';
    } else if (this.status === 'pending') {
      this.status = 'reserved';
    }
  }
  
  next();
});

// Static method to update all booking statuses
bookingSchema.statics.updateAllStatuses = async function() {
  const now = new Date();
  
  // Update bookings that should be checked-in
  await this.updateMany(
    {
      status: { $in: ['reserved'] },
      startDate: { $lte: now },
      $expr: {
        $gte: [
          now,
          {
            $dateAdd: {
              startDate: "$startDate",
              unit: "hour",
              amount: 14 // Default check-in hour
            }
          }
        ]
      }
    },
    { status: 'checked-in' }
  );
  
  // Update bookings that should be checked-out
  await this.updateMany(
    {
      status: { $in: ['checked-in'] },
      endDate: { $lte: now },
      $expr: {
        $gte: [
          now,
          {
            $dateAdd: {
              startDate: "$endDate",
              unit: "hour",
              amount: 11 // Default check-out hour
            }
          }
        ]
      }
    },
    { status: 'checked-out' }
  );
};

module.exports = mongoose.model("Booking", bookingSchema);