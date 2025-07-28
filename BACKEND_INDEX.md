# Backend Files Index

## Root Files
- `package.json` - Backend dependencies and scripts configuration (638B)
- `package-lock.json` - Locked dependency versions (65KB)
- `server.js` - Main server entry point (496B)
- `connectDB.js` - Database connection configuration (352B)

## Models (Data Schema)
- `models/user.js` - User model with authentication fields (1.4KB)
- `models/listing.js` - Property listing model with comprehensive fields (2.4KB)
- `models/booking.js` - Booking/reservation model (771B)
- `models/review.js` - User review model (473B)
- `models/HostApplication.js` - Host application model (722B)
- `models/notification.js` - Notification model (618B)

## Controllers (Business Logic)
- `controllers/authController.js` - Authentication logic (login, register, logout) (2.0KB)
- `controllers/userController.js` - User management operations (5.1KB)
- `controllers/listingsController.js` - Listing CRUD operations and search (11KB)
- `controllers/bookingsController.js` - Booking management (2.6KB)
- `controllers/reviewsController.js` - Review operations (618B)
- `controllers/paymentsController.js` - Payment processing (872B)
- `controllers/hostApplicationController.js` - Host application management (3.7KB)

## Routes (API Endpoints)
- `routes/index.js` - Main router configuration (591B)
- `routes/auth.js` - Authentication routes (453B)
- `routes/users.js` - User management routes (1.4KB)
- `routes/listings.js` - Listing routes (1.4KB)
- `routes/bookings.js` - Booking routes (618B)
- `routes/reviews.js` - Review routes (466B)
- `routes/payments.js` - Payment routes (406B)
- `routes/hostApplications.js` - Host application routes (938B)

## Middleware
- `middleware/auth.js` - Authentication middleware and JWT verification (6.0KB)

## Data & Scripts
- `seeders/demoListings.js` - Demo data seeding script (9.4KB)
- `scripts/` - Additional utility scripts directory

## File Size Summary
- **Largest Files:**
  - `listingsController.js` (11KB) - Complex listing operations
  - `userController.js` (5.1KB) - User management
  - `hostApplicationController.js` (3.7KB) - Host applications
  - `bookingsController.js` (2.6KB) - Booking management
  - `authController.js` (2.0KB) - Authentication
  - `listing.js` (2.4KB) - Listing model
  - `demoListings.js` (9.4KB) - Seed data

- **Medium Files (1-2KB):**
  - `users.js` routes (1.4KB)
  - `listings.js` routes (1.4KB)
  - `user.js` model (1.4KB)
  - `hostApplications.js` routes (938B)
  - `paymentsController.js` (872B)
  - `booking.js` model (771B)
  - `HostApplication.js` model (722B)
  - `notification.js` model (618B)
  - `bookings.js` routes (618B)
  - `reviewsController.js` (618B)
  - `reviews.js` routes (466B)
  - `auth.js` routes (453B)
  - `payments.js` routes (406B)

- **Small Files (<500B):**
  - `server.js` (496B)
  - `connectDB.js` (352B)
  - `index.js` routes (591B)
  - `review.js` model (473B)

## API Endpoints Overview

### Authentication Routes (`/auth`)
- POST `/register` - User registration
- POST `/login` - User login
- POST `/logout` - User logout

### User Routes (`/users`)
- GET `/profile` - Get user profile
- PUT `/profile` - Update user profile
- GET `/` - Get all users (admin)
- GET `/:id` - Get specific user
- PUT `/:id` - Update user
- DELETE `/:id` - Delete user

### Listing Routes (`/listings`)
- GET `/` - Get all listings with filters
- POST `/` - Create new listing
- GET `/:id` - Get specific listing
- PUT `/:id` - Update listing
- DELETE `/:id` - Delete listing
- GET `/search` - Search listings

### Booking Routes (`/bookings`)
- GET `/` - Get user bookings
- POST `/` - Create booking
- GET `/:id` - Get specific booking
- PUT `/:id` - Update booking
- DELETE `/:id` - Cancel booking

### Review Routes (`/reviews`)
- GET `/` - Get reviews
- POST `/` - Create review
- GET `/:id` - Get specific review
- PUT `/:id` - Update review
- DELETE `/:id` - Delete review

### Payment Routes (`/payments`)
- POST `/` - Process payment
- GET `/` - Get payment history

### Host Application Routes (`/host-applications`)
- GET `/` - Get applications
- POST `/` - Submit application
- GET `/:id` - Get specific application
- PUT `/:id` - Update application status

## Database Models Overview

### User Model
- Authentication fields (email, password)
- Profile information (name, phone, etc.)
- Role management (user, host, admin)
- Timestamps

### Listing Model
- Property details (title, description, price)
- Location information (address, coordinates)
- Property type (apartment, car)
- Transaction type (rent, buy)
- Amenities and house rules
- Images and media
- Owner reference

### Booking Model
- Guest and listing references
- Date ranges
- Status tracking
- Payment information

### Review Model
- User and listing references
- Rating and comment
- Timestamps

### HostApplication Model
- Applicant information
- Application status
- Supporting documents
- Admin notes

### Notification Model
- User reference
- Message content
- Read status
- Timestamps

## Architecture Overview
The backend follows a Node.js/Express architecture with:
- **MVC pattern** with clear separation of concerns
- **RESTful API design** with proper HTTP methods
- **JWT authentication** for secure user sessions
- **MongoDB/Mongoose** for data persistence
- **Middleware-based** request processing
- **Modular routing** for organized endpoints
- **Comprehensive error handling**
- **Data validation** and sanitization
- **File upload support** for images
- **Search and filtering** capabilities 