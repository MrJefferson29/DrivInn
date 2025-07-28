# Airbnb Clone - Listings System

A comprehensive Airbnb clone with a modern listings system that supports both apartments and cars, featuring advanced search, filtering, and real-time data management.

## 🚀 Features

### Frontend Components
- **SearchFilters**: Advanced search interface with location autocomplete, date picker, guest selector, and comprehensive filters
- **ListingCard**: Reusable card component displaying individual listings with interactive elements
- **ListingsGrid**: Responsive grid layout with infinite scroll and loading states
- **ListingsContext**: Global state management for listings data with filtering and caching

### Backend API
- **RESTful API**: Complete CRUD operations for listings
- **Image Upload**: Cloudinary integration for image storage
- **Authentication**: JWT-based authentication with role-based access
- **Filtering**: Server-side filtering and pagination support

### Key Features
- ✅ Real-time search and filtering
- ✅ Location autocomplete with world cities data
- ✅ Responsive design for all devices
- ✅ Infinite scroll pagination
- ✅ Favorites and sharing functionality
- ✅ Advanced filtering by type, price, amenities, etc.
- ✅ Support for both apartments and cars
- ✅ Image upload and management
- ✅ Rating and review system

## 📁 Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SearchFilters.js      # Advanced search interface
│   │   │   ├── ListingCard.js        # Individual listing display
│   │   │   ├── ListingsGrid.js       # Grid layout with infinite scroll
│   │   │   ├── Home.js              # Updated home page
│   │   │   └── CreateListing.js     # Listing creation form
│   │   ├── context/
│   │   │   ├── AuthContext.js       # Authentication context
│   │   │   └── ListingsContext.js   # Listings state management
│   │   ├── services/
│   │   │   └── api.js              # API service layer
│   │   └── data/
│   │       └── worldCitiesComplete.json  # Location data
├── backend/
│   ├── models/
│   │   └── listing.js              # Listing data model
│   ├── controllers/
│   │   └── listingsController.js   # Listing business logic
│   ├── routes/
│   │   └── listings.js            # API routes
│   └── seeders/
│       └── demoListings.js        # Demo data seeder
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Cloudinary account (for image uploads)

### Backend Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/airbnb-clone
   JWT_SECRET=your_jwt_secret_here
   CLOUD_NAME=your_cloudinary_cloud_name
   API_KEY=your_cloudinary_api_key
   API_SECRET=your_cloudinary_api_secret
   ```

3. **Seed demo data:**
   ```bash
   node seeders/demoListings.js
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

### Frontend Setup

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

## 🎯 Usage

### Search and Filter Listings

The `SearchFilters` component provides a comprehensive search interface:

```jsx
import SearchFilters from './components/SearchFilters';

// In your component
<SearchFilters />
```

**Features:**
- Location search with autocomplete
- Date range selection
- Guest count selector
- Advanced filters (price, amenities, type, etc.)
- Sort options (price, rating, newest)

### Display Listings

Use the `ListingsGrid` component to display listings:

```jsx
import ListingsGrid from './components/ListingsGrid';

// In your component
<ListingsGrid onListingClick={(listing) => console.log(listing)} />
```

**Features:**
- Responsive grid layout
- Infinite scroll pagination
- Loading states
- Error handling
- Empty state display

### Individual Listing Cards

The `ListingCard` component displays individual listings:

```jsx
import ListingCard from './components/ListingCard';

// In your component
<ListingCard 
  listing={listingData} 
  onCardClick={(listing) => handleListingClick(listing)} 
/>
```

**Features:**
- Image display with hover effects
- Type badges (apartment/car)
- Action buttons (favorite, share)
- Rating and review display
- Amenities and details
- Booking button

### State Management

The `ListingsContext` provides global state management:

```jsx
import { useListings } from './context/ListingsContext';

// In your component
const { 
  filteredListings, 
  loading, 
  error, 
  setFilters, 
  setSearchQuery,
  toggleFavorite 
} = useListings();
```

**Available Actions:**
- `fetchListings()` - Load listings from API
- `setFilters(filters)` - Apply filters
- `setSearchQuery(query)` - Set search query
- `clearFilters()` - Clear all filters
- `toggleFavorite(id)` - Toggle favorite status
- `loadMoreListings()` - Load more listings (pagination)

## 🔧 API Endpoints

### Listings

- `GET /api/listings` - Get all listings (with query parameters)
- `GET /api/listings/:id` - Get specific listing
- `POST /api/listings` - Create new listing (requires authentication)
- `PUT /api/listings/:id` - Update listing (requires authentication)
- `DELETE /api/listings/:id` - Delete listing (requires authentication)

### Query Parameters

```
GET /api/listings?type=apartment&price_min=100&price_max=200&location=New York&amenities=WiFi,Pool
```

**Available filters:**
- `type`: 'apartment' or 'car'
- `price_min` / `price_max`: Price range
- `location`: Location search
- `amenities`: Comma-separated amenities
- `guests`: Minimum guest count
- `bedrooms`: Minimum bedroom count
- `bathrooms`: Minimum bathroom count
- `rating`: Minimum rating
- `sort`: 'price_low', 'price_high', 'rating', 'newest'
- `page`: Page number for pagination
- `limit`: Items per page

## 🎨 Styling

The components use styled-components for styling and follow Airbnb's design patterns:

- **Color Palette**: Airbnb's signature red (#FF385C) and neutral grays
- **Typography**: Modern, clean fonts with proper hierarchy
- **Spacing**: Consistent spacing using a modular scale
- **Animations**: Smooth transitions and hover effects
- **Responsive**: Mobile-first design with breakpoints

## 🔒 Authentication

The system uses JWT-based authentication with role-based access:

- **Guests**: Can view and search listings
- **Hosts**: Can create, edit, and delete their own listings
- **Admins**: Full access to all listings

## 📱 Responsive Design

All components are fully responsive and work on:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🚀 Performance Features

- **Lazy Loading**: Images load as needed
- **Infinite Scroll**: Efficient pagination
- **Caching**: Context-based state caching
- **Optimized Images**: Cloudinary image optimization
- **Debounced Search**: Prevents excessive API calls

## 🧪 Testing

To test the system:

1. **Start both servers** (backend and frontend)
2. **Seed demo data** using the seeder script
3. **Create a user account** or log in
4. **Test search and filtering** functionality
5. **Create new listings** using the create form
6. **Test responsive design** on different screen sizes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support or questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

---

**Happy coding! 🎉** #   D r i v I n n  
 #   D r i v I n n  
 #   D r i v I n n  
 #   D r i v I n n  
 