const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    // Common fields
    type: {
        type: String,
        enum: ['car', 'apartment'],
        required: true
    },
    transactionType: {
        type: String,
        enum: ['rent', 'sale'],
        required: true
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    images: [{ type: String }], // Cloudinary URLs
    address: { type: String },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], // [lng, lat]
            required: true
        }
    },
    city: { type: String },
    country: { type: String },
    lat: { type: Number },
    lng: { type: Number },
    bookingCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },

    // Apartment/Room fields
    propertyType: { type: String }, // e.g., Apartment, House, Villa
    roomType: { type: String }, // e.g., Entire place, Private room, Shared room
    guests: { type: Number },
    bedrooms: { type: Number },
    beds: { type: Number },
    bathrooms: { type: Number },
    bedTypes: [String],
    amenities: [String],
    highlights: [String],
    cleaningFee: { type: Number },
    minNights: { type: Number },
    maxNights: { type: Number },
    calendar: [{ from: Date, to: Date }],
    houseRules: [String],
    cancellationPolicy: { type: String },
    checkIn: { type: String }, // e.g., '14:00'
    checkOut: { type: String }, // e.g., '11:00'

    // Car fields
    carDetails: {
        make: String,
        model: String,
        year: Number,
        color: String,
        transmission: String,
        fuelType: String,
        features: [String],
        seats: Number,
        pickupLocation: String,
        minRentalDays: Number,
        maxRentalDays: Number,
        calendar: [{ from: Date, to: Date }],
        rules: [String],
        cancellationPolicy: String
    }
});

listingSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Listing', listingSchema); 