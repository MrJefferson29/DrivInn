const express = require('express');
const router = express.Router();
const listingsController = require('../controllers/listingsController');
const { verifyToken, authorizeRole } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer config for image uploads
const storage = multer.memoryStorage(); // Use memory storage for Cloudinary
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.webp') {
    cb(null, true);
  } else {
    cb(new Error('Only images are allowed'));
  }
};
const upload = multer({ storage, fileFilter });

// Public endpoints
router.get('/', listingsController.getAllListings);
router.get('/most-visited-apartments', listingsController.getMostVisitedApartments);
router.get('/most-booked-cars', listingsController.getMostBookedCars);
router.get('/:id', listingsController.getListingById);

// Protected endpoints
router.post('/', verifyToken, authorizeRole('host', 'admin'), upload.array('images', 10), listingsController.createListing);
router.put('/:id', verifyToken, authorizeRole('host', 'admin'), upload.array('images', 10), listingsController.updateListing);
router.delete('/:id', verifyToken, authorizeRole('host', 'admin'), listingsController.deleteListing);

module.exports = router; 