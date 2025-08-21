import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useListings } from '../context/ListingsContext';
import { 
  FaArrowLeft, 
  FaMapMarkerAlt, 
  FaStar, 
  FaHeart, 
  FaShare, 
  FaBed, 
  FaBath, 
  FaUsers,
  FaCar,
  FaHome,
  FaFilter,
  FaSearch
} from 'react-icons/fa';
import './CityListings.css';

const CityListings = () => {
  const { cityName } = useParams();
  const navigate = useNavigate();
  const { listings, loading, error } = useListings();
  const [filteredListings, setFilteredListings] = useState([]);
  const [filterType, setFilterType] = useState('all'); // 'all', 'apartment', 'car'
  const [sortBy, setSortBy] = useState('relevance'); // 'relevance', 'price-low', 'price-high', 'rating'

  useEffect(() => {
    if (listings && cityName) {
      console.log('CityListings: Processing listings for city:', cityName);
      console.log('CityListings: Total listings available:', listings.length);
      
      // Create a mapping of URL parameters to possible city names in listings
      const cityNameMapping = {
        'new-york': ['new york', 'nyc', 'new york city', 'manhattan', 'brooklyn', 'queens'],
        'san-francisco': ['san francisco', 'sf', 'bay area', 'san fran'],
        'los-angeles': ['los angeles', 'la', 'l.a.', 'hollywood', 'beverly hills'],
        'miami': ['miami', 'miami beach', 'south beach', 'brickell'],
        'chicago': ['chicago', 'chicago il', 'chicago, il', 'downtown chicago']
      };
      
      // Get the search terms for the current city
      const searchTerms = cityNameMapping[cityName] || [cityName];
      console.log('CityListings: Searching for terms:', searchTerms);
      
      // Filter listings by city name (case-insensitive)
      const cityListings = listings.filter(listing => {
        // Ensure listing and listing.location exist and are strings
        if (!listing || typeof listing.location !== 'string') {
          console.log('CityListings: Skipping invalid listing:', listing);
          return false;
        }
        
        const listingLocation = listing.location.toLowerCase();
        
        // Check if any of the search terms match
        const matches = searchTerms.some(term => listingLocation.includes(term));
        
        if (matches) {
          console.log('CityListings: Found matching listing:', listing.title, 'in', listing.location);
        }
        
        return matches;
      });
      
      console.log('CityListings: Filtered listings count:', cityListings.length);
      
      // Debug: Show some sample listing locations
      if (listings.length > 0) {
        console.log('CityListings: Sample listing locations:', 
          listings.slice(0, 5).map(l => l.location).filter(Boolean)
        );
      }
      
      setFilteredListings(cityListings);
    }
  }, [listings, cityName]);

  // Apply filters and sorting
  const getFilteredAndSortedListings = () => {
    let filtered = [...filteredListings];

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(listing => listing && listing.type === filterType);
    }

    // Apply sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => {
          const priceA = typeof a?.price === 'number' ? a.price : 0;
          const priceB = typeof b?.price === 'number' ? b.price : 0;
          return priceA - priceB;
        });
        break;
      case 'price-high':
        filtered.sort((a, b) => {
          const priceA = typeof a?.price === 'number' ? a.price : 0;
          const priceB = typeof b?.price === 'number' ? b.price : 0;
          return priceB - priceA;
        });
        break;
      case 'rating':
        filtered.sort((a, b) => {
          const ratingA = typeof a?.rating === 'number' ? a.rating : 0;
          const ratingB = typeof b?.rating === 'number' ? b.rating : 0;
          return ratingB - ratingA;
        });
        break;
      default: // relevance - keep original order
        break;
    }

    return filtered;
  };

  const finalListings = getFilteredAndSortedListings();

  const handleListingClick = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  const getCityDisplayName = () => {
    // Convert URL parameter back to proper city name
    const cityDisplayNames = {
      'new-york': 'New York City',
      'san-francisco': 'San Francisco',
      'los-angeles': 'Los Angeles',
      'miami': 'Miami',
      'chicago': 'Chicago'
    };
    
    return cityDisplayNames[cityName] || cityName?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'City';
  };

  const getListingTypeIcon = (type) => {
    return type === 'car' ? <FaCar /> : <FaHome />;
  };

  const getListingTypeLabel = (type) => {
    return type === 'car' ? 'Car Rental' : 'Accommodation';
  };

  if (loading) {
    return (
      <div className="city-listings-loading">
        <div className="loading-content">
          <Spinner animation="border" variant="primary" />
          <h3>Discovering amazing places in {getCityDisplayName()}...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="city-listings-error">
        <Alert variant="danger">
          <h4>Error loading listings</h4>
          <p>{error}</p>
          <Button variant="outline-danger" onClick={() => navigate('/')}>
            Return to Home
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="city-listings-page">
      {/* Header Section */}
      <div className="city-header">
        <Container fluid>
          <div className="header-content">
            <Button 
              variant="outline-light" 
              className="back-btn"
              onClick={() => navigate('/')}
            >
              <FaArrowLeft /> Back to Home
            </Button>
            <div className="city-info">
              <h1 className="city-title">
                <FaMapMarkerAlt className="city-icon" />
                {getCityDisplayName()}
              </h1>
              <p className="city-subtitle">
                Discover amazing places and experiences in {getCityDisplayName()}
              </p>
              <div className="city-stats">
                <span className="stat">
                  <strong>{finalListings.length}</strong> listings available
                </span>
                {finalListings.length > 0 && (
                  <span className="stat">
                    <strong>${Math.min(...finalListings.map(l => typeof l?.price === 'number' ? l.price : Infinity).filter(price => price !== Infinity))}</strong> starting price
                  </span>
                )}
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Filters and Controls */}
      <div className="filters-section">
        <Container fluid>
          <Row className="align-items-center">
            <Col md={6}>
              <div className="filter-controls">
                <Button
                  variant={filterType === 'all' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setFilterType('all')}
                  className="filter-btn"
                >
                  All Types
                </Button>
                <Button
                  variant={filterType === 'apartment' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setFilterType('apartment')}
                  className="filter-btn"
                >
                  <FaHome /> Accommodations
                </Button>
                <Button
                  variant={filterType === 'car' ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => setFilterType('car')}
                  className="filter-btn"
                >
                  <FaCar /> Car Rentals
                </Button>
              </div>
            </Col>
            <Col md={6}>
              <div className="sort-controls">
                <label htmlFor="sort-select">Sort by:</label>
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sort-select"
                >
                  <option value="relevance">Relevance</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Listings Grid */}
      <div className="listings-section">
        <Container fluid>
          {finalListings.length === 0 ? (
            <div className="no-listings">
              <div className="no-listings-content">
                <FaMapMarkerAlt className="no-listings-icon" />
                <h3>No listings found in {getCityDisplayName()}</h3>
                <p>This could mean:</p>
                <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto 24px auto' }}>
                  <li>No listings have been created for this city yet</li>
                  <li>The city name in listings doesn't match our search terms</li>
                  <li>Listings are using different location formats</li>
                </ul>
                <p>Try searching for a different city or check back later for new listings.</p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button variant="primary" onClick={() => navigate('/')}>
                    Explore Other Cities
                  </Button>
                  <Button variant="outline-secondary" onClick={() => window.location.reload()}>
                    Refresh Page
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Row>
              {finalListings.filter(listing => listing && listing._id).map((listing) => (
                <Col key={listing._id} lg={4} md={6} className="mb-4">
                  <Card 
                    className="listing-card"
                    onClick={() => handleListingClick(listing._id)}
                  >
                    <div className="listing-image-container">
                      <img
                        src={listing.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'}
                        alt={listing.title || 'Listing Image'}
                        className="listing-image"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                        }}
                      />
                      <div className="listing-overlay">
                        <Badge className="listing-type-badge">
                          {getListingTypeIcon(listing.type || 'apartment')}
                          {getListingTypeLabel(listing.type || 'apartment')}
                        </Badge>
                        <div className="listing-actions">
                          <Button variant="light" size="sm" className="action-btn">
                            <FaHeart />
                          </Button>
                          <Button variant="light" size="sm" className="action-btn">
                            <FaShare />
                          </Button>
                        </div>
                      </div>
                    </div>
                    <Card.Body className="listing-content">
                      <Card.Title className="listing-title">
                        {listing.title || 'Untitled Listing'}
                      </Card.Title>
                      <div className="listing-location">
                        <FaMapMarkerAlt />
                        <span>{listing.location || 'Location not specified'}</span>
                      </div>
                      {listing.rating && typeof listing.rating === 'number' && (
                        <div className="listing-rating">
                          <FaStar className="star-icon" />
                          <span className="rating-number">{listing.rating}</span>
                          <span className="reviews-count">
                            ({listing.reviewCount || 0} reviews)
                          </span>
                        </div>
                      )}
                      {listing.type === 'apartment' && (
                        <div className="listing-details">
                          <span><FaUsers /> {listing.guests || 'N/A'} guests</span>
                          <span><FaBed /> {listing.bedrooms || 'N/A'} bedrooms</span>
                          <span><FaBath /> {listing.bathrooms || 'N/A'} bathrooms</span>
                        </div>
                      )}
                      {listing.type === 'car' && listing.carDetails && (
                        <div className="listing-details">
                          <span>{listing.carDetails.year || 'N/A'} {listing.carDetails.make || 'N/A'}</span>
                          <span>{listing.carDetails.model || 'N/A'}</span>
                          <span><FaUsers /> {listing.carDetails.seats || 'N/A'} seats</span>
                        </div>
                      )}
                      <div className="listing-price">
                        <span className="price-amount">${listing.price || 'N/A'}</span>
                        <span className="price-period">
                          per {listing.type === 'car' ? 'day' : 'night'}
                        </span>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Container>
      </div>

      {/* Call to Action */}
      {finalListings.length > 0 && (
        <div className="cta-section">
          <Container fluid>
            <div className="cta-content">
              <h3>Can't find what you're looking for?</h3>
              <p>Explore more cities or become a host to share your space with travelers.</p>
              <div className="cta-buttons">
                <Button variant="outline-primary" onClick={() => navigate('/')}>
                  Explore More Cities
                </Button>
                <Button variant="primary" onClick={() => navigate('/become-a-host-info')}>
                  Become a Host
                </Button>
              </div>
            </div>
          </Container>
        </div>
      )}
    </div>
  );
};

export default CityListings;
