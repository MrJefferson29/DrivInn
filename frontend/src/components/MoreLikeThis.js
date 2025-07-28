import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Spinner, Alert, Button } from 'react-bootstrap';
import { FaArrowLeft, FaStar, FaCar, FaMapMarkerAlt, FaHome, FaClock } from 'react-icons/fa';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useListings } from '../context/ListingsContext';
import { useFilters } from '../context/FiltersContext';
import ListingCard from './ListingCard';
import { useMediaQuery } from 'react-responsive';

const airbnbRed = '#FF385C';
const airbnbDark = '#222222';
const airbnbGray = '#717171';

const Container = styled.div`
  padding: 40px 0;
  background: #fff;
  min-height: 100vh;
  
  @media (max-width: 768px) {
    padding: 24px 0;
  }
  
  @media (max-width: 480px) {
    padding: 20px 0;
  }
`;

const Header = styled.div`
  padding: 0 80px 32px 80px;
  border-bottom: 1px solid #eee;
  margin-bottom: 32px;
  
  @media (max-width: 1200px) {
    padding: 0 40px 24px 40px;
  }
  
  @media (max-width: 768px) {
    padding: 0 24px 20px 24px;
    margin-bottom: 24px;
  }
  
  @media (max-width: 480px) {
    padding: 0 16px 16px 16px;
    margin-bottom: 20px;
  }
`;

const BackButton = styled(Button)`
  background: none;
  border: none;
  color: ${airbnbGray};
  padding: 8px 0;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  
  &:hover {
    background: none;
    color: ${airbnbRed};
  }
  
  &:focus {
    background: none;
    color: ${airbnbRed};
    box-shadow: none;
  }
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 600;
  color: ${airbnbDark};
  margin-bottom: 12px;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const PageSubtitle = styled.p`
  font-size: 1.1rem;
  color: ${airbnbGray};
  margin-bottom: 0;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const ResultsInfo = styled.div`
  padding: 20px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto 20px auto;
  padding: 0 80px 20px 80px;
  
  .results-count {
    font-size: 1.1rem;
    font-weight: 600;
    color: ${airbnbDark};
    
    @media (max-width: 768px) {
      font-size: 1rem;
    }
    
    @media (max-width: 480px) {
      font-size: 0.9rem;
    }
  }
  
  .results-summary {
    color: ${airbnbGray};
    font-size: 0.9rem;
    
    @media (max-width: 768px) {
      font-size: 0.85rem;
    }
    
    @media (max-width: 480px) {
      font-size: 0.8rem;
    }
  }
  
  @media (max-width: 1200px) {
    padding: 0 40px 20px 40px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
    padding: 0 20px 16px 20px;
    margin-bottom: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 0 12px 12px 12px;
    margin-bottom: 12px;
  }
`;

const ResponsiveListingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding: 0 40px 8px 40px;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 18px;
    padding: 0 20px 8px 20px;
  }
  
  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 14px;
    padding: 0 10px 8px 10px;
  }
  
  @media (max-width: 700px) {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    gap: 12px;
    padding: 0 8px 6px 8px;
    scroll-snap-type: x mandatory;
    
    & > div {
      scroll-snap-align: start;
    }
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  
  @media (max-width: 768px) {
    padding: 40px 16px;
  }
  
  @media (max-width: 480px) {
    padding: 30px 12px;
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  
  .spinner-border {
    width: 3rem;
    height: 3rem;
    color: ${airbnbRed};
    
    @media (max-width: 480px) {
      width: 2.5rem;
      height: 2.5rem;
    }
  }
  
  h4 {
    margin-top: 16px;
    color: ${airbnbGray};
    font-weight: 500;
    
    @media (max-width: 768px) {
      font-size: 1rem;
      margin-top: 12px;
    }
    
    @media (max-width: 480px) {
      font-size: 0.9rem;
      margin-top: 10px;
    }
  }
`;

const ErrorContainer = styled.div`
  padding: 40px 20px;
  text-align: center;
  
  @media (max-width: 768px) {
    padding: 30px 16px;
  }
  
  @media (max-width: 480px) {
    padding: 24px 12px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: ${airbnbGray};
  
  .empty-icon {
    font-size: 4rem;
    color: #ddd;
    margin-bottom: 24px;
    
    @media (max-width: 768px) {
      font-size: 3rem;
      margin-bottom: 20px;
    }
    
    @media (max-width: 480px) {
      font-size: 2.5rem;
      margin-bottom: 16px;
    }
  }
  
  h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 12px;
    color: ${airbnbDark};
    
    @media (max-width: 768px) {
      font-size: 1.25rem;
      margin-bottom: 10px;
    }
    
    @media (max-width: 480px) {
      font-size: 1.1rem;
      margin-bottom: 8px;
    }
  }
  
  p {
    font-size: 1rem;
    margin-bottom: 24px;
    line-height: 1.6;
    
    @media (max-width: 768px) {
      font-size: 0.9rem;
      margin-bottom: 20px;
    }
    
    @media (max-width: 480px) {
      font-size: 0.85rem;
      margin-bottom: 16px;
    }
  }
`;

const MoreLikeThis = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { listings, loading, error } = useListings();
  const { filters } = useFilters();
  const [filteredListings, setFilteredListings] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [categoryError, setCategoryError] = useState('');
  const isHorizontal = useMediaQuery({ maxWidth: 700 });

  // Get URL parameters for nearby listings
  const urlParams = new URLSearchParams(location.search);
  const cityParam = urlParams.get('city');
  const countryParam = urlParams.get('country');

  // Get category info
  const getCategoryInfo = () => {
    switch (category) {
      case 'recommended':
        return {
          title: 'Recommended Listings',
          icon: <FaHome />,
          subtitle: 'Discover amazing places tailored to your preferences',
          description: 'Based on your current filters'
        };
      case 'nearby':
        return {
          title: 'Nearby Listings',
          icon: <FaMapMarkerAlt />,
          subtitle: cityParam && countryParam 
            ? `Find amazing stays and experiences close to ${cityParam}, ${countryParam}`
            : 'Find amazing stays and experiences close to your location',
          description: cityParam && countryParam 
            ? `Based on location: ${cityParam}, ${countryParam}`
            : 'Based on your current location'
        };
      case 'latest':
        return {
          title: 'Latest Listings',
          icon: <FaClock />,
          subtitle: 'Discover the newest places added to our platform',
          description: 'Added in the last 30 days'
        };
      case 'most-visited-apartments':
        return {
          title: 'Most Visited Apartments',
          icon: <FaStar />,
          subtitle: 'These apartments have the highest number of bookings',
          description: 'Based on booking popularity'
        };
      case 'most-booked-cars':
        return {
          title: 'Most Booked Cars',
          icon: <FaCar />,
          subtitle: 'These cars have the highest number of bookings',
          description: 'Based on booking popularity'
        };
      default:
        return {
          title: 'Listings',
          icon: <FaHome />,
          subtitle: 'Discover amazing places',
          description: 'All available listings'
        };
    }
  };

  // Fetch listings based on category
  useEffect(() => {
    const fetchCategoryListings = async () => {
      setCategoryLoading(true);
      setCategoryError('');

      try {
        let categoryListings = [];

        switch (category) {
          case 'recommended':
            // Apply filters from FiltersContext to all listings
            categoryListings = listings.filter(listing => {
              if (filters.location && !(
                (listing.city && listing.city.toLowerCase().includes(filters.location.toLowerCase())) ||
                (listing.country && listing.country.toLowerCase().includes(filters.location.toLowerCase())) ||
                (listing.address && listing.address.toLowerCase().includes(filters.location.toLowerCase()))
              )) return false;
              if (listing.price < filters.price[0] || listing.price > filters.price[1]) return false;
              if (filters.type.length > 0 && !filters.type.includes(listing.type)) return false;
              if (filters.amenities.length > 0) {
                const amenities = listing.amenities || listing.carDetails?.features || [];
                if (!filters.amenities.every(a => amenities.includes(a))) return false;
              }
              if ((listing.guests || 1) < filters.guests[0] || (listing.guests || 1) > filters.guests[1]) return false;
              return true;
            });
            break;

          case 'nearby':
            // Filter by location if provided in URL parameters
            if (cityParam && countryParam) {
              categoryListings = listings.filter(l =>
                l.city && l.country &&
                l.city.toLowerCase() === cityParam.toLowerCase() &&
                l.country.toLowerCase() === countryParam.toLowerCase()
              );
              if (categoryListings.length === 0) {
                categoryListings = listings.filter(l =>
                  l.country && l.country.toLowerCase() === countryParam.toLowerCase()
                );
              }
            } else {
              // If no location provided, show all listings
              categoryListings = listings;
            }
            break;

          case 'latest':
            // Filter for latest listings (created in the last 30 days)
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            categoryListings = listings
              .filter(listing => {
                const createdAt = listing.createdAt || listing.created_at || listing.dateCreated || listing.date_created;
                
                if (!createdAt) {
                  return true; // Assume recent if no date
                }
                
                const createdDate = new Date(createdAt);
                return createdDate >= thirtyDaysAgo;
              })
              .sort((a, b) => {
                const dateA = new Date(a.createdAt || a.created_at || a.dateCreated || a.date_created || Date.now());
                const dateB = new Date(b.createdAt || b.created_at || b.dateCreated || b.date_created || Date.now());
                return dateB - dateA; // Newest first
              });
            break;

          case 'most-visited-apartments':
            const apartmentsRes = await fetch('http://localhost:5000/listings/most-visited-apartments');
            if (!apartmentsRes.ok) throw new Error('Failed to fetch most visited apartments');
            categoryListings = await apartmentsRes.json();
            break;

          case 'most-booked-cars':
            const carsRes = await fetch('http://localhost:5000/listings/most-booked-cars');
            if (!carsRes.ok) throw new Error('Failed to fetch most booked cars');
            categoryListings = await carsRes.json();
            break;

          default:
            categoryListings = listings;
        }

        setFilteredListings(categoryListings);
        setCategoryLoading(false);
      } catch (err) {
        setCategoryError(err.message || 'Error loading listings');
        setCategoryLoading(false);
      }
    };

    if (!loading) {
      fetchCategoryListings();
    }
  }, [category, listings, loading, filters, cityParam, countryParam]);

  const categoryInfo = getCategoryInfo();

  if (loading || categoryLoading) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate('/')}>
            <FaArrowLeft /> Back to Home
          </BackButton>
          <PageTitle>
            {categoryInfo.icon} {categoryInfo.title}
          </PageTitle>
          <PageSubtitle>{categoryInfo.subtitle}</PageSubtitle>
        </Header>
        <LoadingContainer>
          <LoadingSpinner>
            <Spinner animation="border" />
            <h4>Loading {categoryInfo.title.toLowerCase()}...</h4>
          </LoadingSpinner>
        </LoadingContainer>
      </Container>
    );
  }

  if (error || categoryError) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate('/')}>
            <FaArrowLeft /> Back to Home
          </BackButton>
          <PageTitle>
            {categoryInfo.icon} {categoryInfo.title}
          </PageTitle>
          <PageSubtitle>{categoryInfo.subtitle}</PageSubtitle>
        </Header>
        <ErrorContainer>
          <Alert variant="danger">
            <Alert.Heading>Error Loading Listings</Alert.Heading>
            <p>{error || categoryError}</p>
          </Alert>
        </ErrorContainer>
      </Container>
    );
  }

  if (filteredListings.length === 0) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate('/')}>
            <FaArrowLeft /> Back to Home
          </BackButton>
          <PageTitle>
            {categoryInfo.icon} {categoryInfo.title}
          </PageTitle>
          <PageSubtitle>{categoryInfo.subtitle}</PageSubtitle>
        </Header>
        <EmptyState>
          <div className="empty-icon">🔍</div>
          <h3>No listings found</h3>
          <p>There are no {categoryInfo.title.toLowerCase()} available at the moment.</p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate('/')}>
          <FaArrowLeft /> Back to Home
        </BackButton>
        <PageTitle>
          {categoryInfo.icon} {categoryInfo.title}
        </PageTitle>
        <PageSubtitle>{categoryInfo.subtitle}</PageSubtitle>
      </Header>

      <ResultsInfo>
        <div className="results-count">
          {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'} found
        </div>
        <div className="results-summary">
          {categoryInfo.description}
        </div>
      </ResultsInfo>

      <ResponsiveListingsGrid>
        {filteredListings.map((listing) => (
          <div key={listing._id || listing.id} style={isHorizontal ? { minWidth: '220px', maxWidth: '260px', flex: '0 0 auto' } : {}}>
            <ListingCard
              listing={listing}
              {...(isHorizontal ? { horizontal: true } : {})}
            />
          </div>
        ))}
      </ResponsiveListingsGrid>
    </Container>
  );
};

export default MoreLikeThis; 