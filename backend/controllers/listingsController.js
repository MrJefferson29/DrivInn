const Listing = require('../models/listing');
const cloudinary = require('cloudinary').v2;
const NotificationService = require('../services/notificationService');
require('dotenv').config();
const worldCities = require('../../frontend/src/data/worldCitiesComplete.json');
const Booking = require('../models/booking');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Helper to get lat/lng from location string
function getLatLngFromLocation(location) {
  if (!location) return null;
  const [city, country] = location.split(',').map(s => s.trim());
  let found = null;
  if (city && country) {
    found = worldCities.find(
      c => c.name.toLowerCase() === city.toLowerCase() && c.country.toLowerCase() === country.toLowerCase()
    );
  }
  if (!found && city) {
    found = worldCities.find(
      c => c.name.toLowerCase() === city.toLowerCase()
    );
  }
  return found ? { lat: parseFloat(found.lat), lng: parseFloat(found.lng) } : null;
}

exports.getAllListings = async (req, res) => {
  try {
    const { owner } = req.query;
    let query = {};
    
    // If owner parameter is provided, filter by owner
    if (owner) {
      query.owner = owner;
    }
    
    const listings = await Listing.find(query).populate('owner', 'firstName lastName email profileImage');
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getListingById = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('owner', 'name email profileImage');
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.createListing = async (req, res) => {
  try {
    console.log('Create listing request received');
    console.log('Files:', req.files ? req.files.length : 'No files');
    console.log('Body keys:', Object.keys(req.body));
    console.log('carDetails value:', req.body.carDetails);
    
    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      console.log('Processing', req.files.length, 'files');
      for (const file of req.files) {
        console.log('Processing file:', file.originalname, 'Size:', file.size, 'Buffer:', !!file.buffer);
        
        // Convert buffer to base64 for Cloudinary upload
        const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        
        try {
          const result = await cloudinary.uploader.upload(base64String, {
          folder: 'airbnb-listings',
            resource_type: 'auto'
        });
          console.log('Upload successful:', result.secure_url);
        imageUrls.push(result.secure_url);
        } catch (uploadError) {
          console.error('Cloudinary upload error:', uploadError);
          throw new Error(`Failed to upload image ${file.originalname}: ${uploadError.message}`);
        }
      }
    } else {
      console.log('No files to process');
    }
    
    // Parse carDetails if present with better error handling
    let carDetails = req.body.carDetails;
    if (carDetails && typeof carDetails === 'string' && carDetails.trim() !== '') {
      try {
        carDetails = JSON.parse(carDetails);
        console.log('Parsed carDetails:', carDetails);
      } catch (parseError) {
        console.error('Error parsing carDetails:', parseError);
        console.error('carDetails string:', carDetails);
        throw new Error(`Invalid carDetails JSON: ${parseError.message}`);
      }
    } else if (!carDetails || carDetails === '') {
      carDetails = null;
    }
    
    // Parse arrays from comma-separated or JSON with better error handling
    const parseArray = (val) => {
      if (!val || val === '') return [];
      if (Array.isArray(val)) return val;
      try { 
        return JSON.parse(val); 
      } catch (parseError) {
        console.log('Failed to parse as JSON, trying comma-separated:', val);
        return val.split(',').map(x => x.trim()).filter(Boolean);
      }
    };
    
    // Parse calendar with better error handling
    let calendar = [];
    if (req.body.calendar && req.body.calendar.trim() !== '') {
      try {
        calendar = JSON.parse(req.body.calendar);
      } catch (parseError) {
        console.error('Error parsing calendar:', parseError);
        calendar = [];
      }
    }
    
    const listingData = {
      ...req.body,
      images: imageUrls,
      owner: req.user.id,
      amenities: parseArray(req.body.amenities),
      highlights: parseArray(req.body.highlights),
      bedTypes: parseArray(req.body.bedTypes),
      houseRules: parseArray(req.body.houseRules),
      calendar: calendar,
      carDetails: carDetails ? {
        ...carDetails,
        features: parseArray(carDetails.features),
        rules: parseArray(carDetails.rules),
        calendar: carDetails.calendar ? (() => {
          try {
            return JSON.parse(carDetails.calendar);
          } catch (parseError) {
            console.error('Error parsing carDetails.calendar:', parseError);
            return [];
          }
        })() : [],
      } : undefined
    };
    
    // Add geocoded lat/lng if possible
    const coords = getLatLngFromLocation(listingData.location);
    if (!coords) {
      return res.status(400).json({ message: 'Location not recognized. Please select a valid city from the list.' });
    }
      listingData.lat = coords.lat;
      listingData.lng = coords.lng;
    listingData.location = {
      type: 'Point',
      coordinates: [coords.lng, coords.lat]
    };
    // Also store city and country for easier nearby queries
    if (typeof req.body.location === 'string') {
      const [city, ...rest] = req.body.location.split(',').map(s => s.trim());
      listingData.city = city || '';
      listingData.country = rest.join(', ') || '';
    } else {
      listingData.city = '';
      listingData.country = '';
    }
    
    console.log('Creating listing with data:', {
      type: listingData.type,
      title: listingData.title,
      images: listingData.images.length,
      owner: listingData.owner,
      carDetails: !!listingData.carDetails
    });
    
    const listing = new Listing(listingData);
    await listing.save();
    
    // Create notification for listing creation
    try {
      await NotificationService.createListingNotification(listing._id, 'listing_created', req.user.id);
    } catch (notificationError) {
      console.error('Error creating listing notification:', notificationError);
      // Don't fail the listing creation if notification fails
    }
    
    res.status(201).json(listing);
  } catch (err) {
    console.error('Create listing error:', err);
    res.status(400).json({ message: 'Error creating listing', error: err.message });
  }
};

exports.updateListing = async (req, res) => {
  try {
    // Find the existing listing
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });

    // Handle image uploads (add new images to Cloudinary)
    let imageUrls = listing.images || [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const base64String = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
        try {
          const result = await cloudinary.uploader.upload(base64String, {
            folder: 'airbnb-listings',
            resource_type: 'auto'
          });
          imageUrls.push(result.secure_url);
        } catch (uploadError) {
          console.error('Cloudinary upload error:', uploadError);
          throw new Error(`Failed to upload image ${file.originalname}: ${uploadError.message}`);
        }
      }
    }

    // If images array is sent in body, use it (for removal)
    if (req.body.images) {
      try {
        // Accept both JSON string and array
        imageUrls = Array.isArray(req.body.images) ? req.body.images : JSON.parse(req.body.images);
      } catch {
        // fallback: comma-separated
        imageUrls = req.body.images.split(',').map(x => x.trim()).filter(Boolean);
      }
    }

    // Parse carDetails if present
    let carDetails = req.body.carDetails;
    if (carDetails && typeof carDetails === 'string' && carDetails.trim() !== '') {
      try {
        carDetails = JSON.parse(carDetails);
      } catch (parseError) {
        throw new Error(`Invalid carDetails JSON: ${parseError.message}`);
      }
    } else if (!carDetails || carDetails === '') {
      carDetails = null;
    }

    // Parse arrays
    const parseArray = (val) => {
      if (!val || val === '') return [];
      if (Array.isArray(val)) return val;
      try { return JSON.parse(val); } catch {
        return val.split(',').map(x => x.trim()).filter(Boolean);
      }
    };

    // Parse calendar
    let calendar = [];
    if (req.body.calendar && req.body.calendar.trim() !== '') {
      try {
        calendar = JSON.parse(req.body.calendar);
      } catch {
        calendar = [];
      }
    }

    // Build update object
    const updateData = {
      ...req.body,
      images: imageUrls,
      amenities: parseArray(req.body.amenities),
      highlights: parseArray(req.body.highlights),
      bedTypes: parseArray(req.body.bedTypes),
      houseRules: parseArray(req.body.houseRules),
      calendar: calendar,
      carDetails: carDetails ? {
        ...carDetails,
        features: parseArray(carDetails.features),
        rules: parseArray(carDetails.rules),
        calendar: carDetails.calendar ? (() => { try { return JSON.parse(carDetails.calendar); } catch { return []; } })() : [],
      } : undefined
    };

    // Add geocoded lat/lng if possible
    const coords = getLatLngFromLocation(updateData.location);
    if (!coords) {
      return res.status(400).json({ message: 'Location not recognized. Please select a valid city from the list.' });
    }
    updateData.lat = coords.lat;
    updateData.lng = coords.lng;
    updateData.location = {
      type: 'Point',
      coordinates: [coords.lng, coords.lat]
    };

    // Actually update the listing
    const updated = await Listing.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    console.error('Update listing error:', err);
    res.status(400).json({ message: 'Error updating listing', error: err.message });
  }
};

exports.deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findByIdAndDelete(req.params.id);
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    res.json({ message: 'Listing deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 

exports.getNearbyListings = async (req, res) => {
  const { lat, lng, radius = 50 } = req.query;
  if (!lat || !lng) return res.status(400).json({ message: 'lat and lng required' });
  try {
    const listings = await Listing.find({
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseFloat(radius) * 1000 // meters
        }
      }
    });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ message: 'Error finding nearby listings', error: err.message });
  }
}; 

exports.getMostVisitedApartments = async (req, res) => {
  try {
    const apartments = await Listing.find({ type: 'apartment' })
      .sort({ bookingCount: -1 })
      .limit(12);
    console.log('Most visited apartments:', apartments);
    res.json(apartments);
  } catch (err) {
    console.error('Error fetching most visited apartments:', err);
    res.status(500).json({ message: 'Error fetching most visited apartments', error: err.message });
  }
}; 

exports.getMostBookedCars = async (req, res) => {
  try {
    const cars = await Listing.find({ type: 'car' })
      .sort({ bookingCount: -1 })
      .limit(12);
    res.json(cars);
  } catch (err) {
    console.error('Error fetching most booked cars:', err);
    res.status(500).json({ message: 'Error fetching most booked cars', error: err.message });
  }
}; 