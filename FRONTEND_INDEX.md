# Frontend Files Index

## Root Files
- `package.json` - Frontend dependencies and scripts configuration
- `package-lock.json` - Locked dependency versions
- `README.md` - Frontend project documentation
- `.gitignore` - Git ignore rules for frontend
- `cities500.json` - Large dataset of world cities (18MB)

## Public Directory
- `public/index.html` - Main HTML template
- `public/favicon.ico` - Site favicon
- `public/logo192.png` - App logo (192px)
- `public/logo512.png` - App logo (512px)
- `public/manifest.json` - PWA manifest
- `public/robots.txt` - SEO robots file

## Source Files

### Core Application Files
- `src/index.js` - Application entry point
- `src/index.css` - Global styles
- `src/App.js` - Main application component with routing
- `src/App.css` - App-level styles

### Context (State Management)
- `src/context/AuthContext.js` - Authentication state management
- `src/context/FiltersContext.js` - Search filters state management
- `src/context/ListingsContext.js` - Listings data state management

### Services
- `src/services/api.js` - API service layer for backend communication

### Data Files
- `src/data/worldCities.json` - World cities dataset (25KB)
- `src/data/worldCitiesComplete.json` - Complete world cities dataset (15KB)
- `src/data/worldCitiesAfricaMiddleEast.json` - Africa & Middle East cities (10KB)
- `src/data/worldCitiesEurope.json` - European cities dataset (22KB)
- `src/data/worldCitiesAsia.json` - Asian cities dataset (28KB)

## Components

### Authentication Components
- `src/components/auth/Login.js` - User login form (7.1KB)
- `src/components/auth/Register.js` - User registration form (14KB)
- `src/components/auth/Auth.css` - Authentication styles (8.4KB)

### Main Components
- `src/components/Home.js` - Homepage component (13KB)
- `src/components/Home.css` - Homepage styles (29KB)
- `src/components/Navbar.js` - Navigation bar component (10KB)
- `src/components/Navbar.css` - Navigation styles (13KB)
- `src/components/BottomNav.js` - Mobile bottom navigation (3.8KB)

### Listing Components
- `src/components/ListingCard.js` - Individual listing card component (14KB)
- `src/components/ListingDetails.js` - Detailed listing view (26KB)
- `src/components/ListingDetails.css` - Listing details styles (11KB)
- `src/components/ListingsGrid.js` - Grid layout for listings (9.5KB)
- `src/components/CreateListing.js` - Listing creation form (59KB)
- `src/components/EditListing.js` - Listing editing form (18KB)
- `src/components/MoreLikeThis.js` - Similar listings component (16KB)

### Listing Sub-Components
- `src/components/listings/LatestListings.js` - Latest listings section (11KB)
- `src/components/listings/MostBookedCars.js` - Popular cars section (7.5KB)
- `src/components/listings/MostVisitedApartments.js` - Popular apartments section (7.6KB)
- `src/components/listings/NearbyListings.js` - Nearby listings section (11KB)
- `src/components/listings/RecommendedListings.js` - Recommended listings section (9.8KB)
- `src/components/listings/NearbyListings.css` - Nearby listings styles (7.6KB)

### Filter Components
- `src/components/FiltersBar.js` - Main filters bar (8.8KB)
- `src/components/SearchFilters.js` - Advanced search filters (24KB)
- `src/components/filters/LocationFilter.js` - Location selection filter (5.1KB)
- `src/components/filters/PriceRangeSlider.js` - Price range filter (3.2KB)
- `src/components/filters/GuestsRangeSlider.js` - Guest count filter (4.0KB)
- `src/components/filters/DateRangeFilter.js` - Date range selection (3.7KB)
- `src/components/filters/AmenitiesMultiSelect.js` - Amenities selection (4.0KB)
- `src/components/filters/TypeMultiSelect.js` - Property type selection (3.4KB)
- `src/components/filters/ActiveFiltersChips.js` - Active filter display (2.0KB)

### User Components
- `src/components/user/Profile.js` - User profile page (3.1KB)
- `src/components/user/EditProfile.js` - Profile editing form (7.5KB)

### Host Components
- `src/components/BecomeAHostInfo.js` - Host application info page (14KB)
- `src/components/HostApplicationForm.js` - Host application form (4.3KB)
- `src/components/HostApplicationStatus.js` - Application status display (1.6KB)
- `src/components/AdminHostApplicationsPanel.js` - Admin panel for applications (3.6KB)

### Notification Components
- `src/components/UserNotifications.js` - User notifications list (2.1KB)
- `src/components/NotificationDetails.js` - Notification details view (1.9KB)

### Styling Files
- `src/components/FeaturedCarousel.css` - Carousel component styles (1.2KB)

## File Size Summary
- **Largest Files:**
  - `CreateListing.js` (59KB) - Complex listing creation form
  - `SearchFilters.js` (24KB) - Advanced search functionality
  - `ListingDetails.js` (26KB) - Detailed listing view
  - `Home.css` (29KB) - Extensive homepage styling
  - `cities500.json` (18MB) - Large cities dataset

- **Medium Files (10-20KB):**
  - `EditListing.js` (18KB)
  - `MoreLikeThis.js` (16KB)
  - `BecomeAHostInfo.js` (14KB)
  - `ListingCard.js` (14KB)
  - `Home.js` (13KB)
  - `Navbar.css` (13KB)
  - `NearbyListings.js` (11KB)
  - `ListingDetails.css` (11KB)
  - `ListingsGrid.js` (9.5KB)
  - `FiltersBar.js` (8.8KB)
  - `Auth.css` (8.4KB)
  - `MostVisitedApartments.js` (7.6KB)
  - `EditProfile.js` (7.5KB)
  - `MostBookedCars.js` (7.5KB)
  - `Register.js` (14KB)

## Architecture Overview
The frontend follows a React-based architecture with:
- **Component-based structure** with clear separation of concerns
- **Context API** for state management
- **Styled-components** for styling
- **Responsive design** with mobile-first approach
- **Modular organization** with grouped related components
- **Service layer** for API communication
- **Extensive filtering system** for property search
- **User authentication** and profile management
- **Host application system** for property owners 