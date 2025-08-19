import React from 'react';
import styled from 'styled-components';
import { Spinner, Alert } from 'react-bootstrap';
import { 
  FaStar, 
  FaMapMarkerAlt, 
  FaHome, 
  FaCar,
  FaCalendarAlt,
  FaAward,
  FaCheckCircle,
  FaChevronRight
} from 'react-icons/fa';
import { useListings } from '../../context/ListingsContext';
import { useFilters } from '../../context/FiltersContext';
import ListingCard from '../ListingCard';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';

// Airbnb color palette
const airbnbRed = '#FF385C';
const airbnbDark = '#222222';
const airbnbGray = '#717171';
const airbnbLightGray = '#F7F7F7';
const airbnbBorder = '#DDDDDD';

// Styled Components
const RecommendedContainer = styled.div`
  padding: 40px 0;
  background: #FFFFFF;
  
  @media (max-width: 768px) {
    padding: 24px 0;
  }
  
  @media (max-width: 480px) {
    padding: 20px 0;
  }
`;

const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
  padding: 0 80px;
  
  @media (max-width: 1200px) {
    padding: 0 40px;
  }
  
  @media (max-width: 768px) {
    padding: 0 24px;
    margin-bottom: 32px;
  }
  
  @media (max-width: 480px) {
    padding: 0 16px;
    margin-bottom: 24px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 300;
  color: ${airbnbDark};
  margin-bottom: 16px;
  letter-spacing: 0.05em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${airbnbRed};
  }
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
    margin-bottom: 10px;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 1.1rem;
  color: ${airbnbGray};
  margin-bottom: 24px;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 20px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin-bottom: 16px;
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

const ResultsInfo = styled.div`
  padding: 20px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
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
    & > div { scroll-snap-align: start; }
    margin-left: 5px;
    
    /* Hide scrollbar for webkit browsers */
    &::-webkit-scrollbar {
      display: none;
    }
    
    /* Hide scrollbar for Firefox */
    scrollbar-width: none;
    
    /* Hide scrollbar for IE/Edge */
    -ms-overflow-style: none;
  }
`;

const RecommendedListings = () => {
  const { listings, loading, error } = useListings();
  const { filters } = useFilters();
  const navigate = useNavigate();

  // Apply filters from FiltersContext to all listings
  const filteredListings = listings.filter(listing => {
    // Location
    if (filters.location && !(
      (listing.city && listing.city.toLowerCase().includes(filters.location.toLowerCase())) ||
      (listing.country && listing.country.toLowerCase().includes(filters.location.toLowerCase())) ||
      (listing.address && listing.address.toLowerCase().includes(filters.location.toLowerCase()))
    )) return false;
    // Date range (not implemented in backend, so skip for now)
    // Price
    if (listing.price < filters.price[0] || listing.price > filters.price[1]) return false;
    // Type
    if (filters.type.length > 0 && !filters.type.includes(listing.type)) return false;
    // Amenities
    if (filters.amenities.length > 0) {
        const amenities = listing.amenities || listing.carDetails?.features || [];
      if (!filters.amenities.every(a => amenities.includes(a))) return false;
    }
    // Guests
    if ((listing.guests || 1) < filters.guests[0] || (listing.guests || 1) > filters.guests[1]) return false;
    return true;
  });

  // Limit to 8 listings
  const displayedListings = filteredListings.slice(0, 8);
  const isHorizontal = useMediaQuery({ maxWidth: 700 });

  const handleTitleClick = () => {
    navigate('/more-like-this/recommended');
  };

  if (loading) {
    return (
      <RecommendedContainer>
        <SectionHeader>
          <SectionTitle onClick={handleTitleClick}>
            Recommended Listings <FaChevronRight />
          </SectionTitle>
          <SectionSubtitle>Discover amazing places tailored to your preferences</SectionSubtitle>
        </SectionHeader>
        <LoadingContainer>
          <LoadingSpinner>
            <Spinner animation="border" />
            <h4>Loading recommendations...</h4>
          </LoadingSpinner>
        </LoadingContainer>
      </RecommendedContainer>
    );
  }

  if (error) {
    return (
      <RecommendedContainer>
        <SectionHeader>
          <SectionTitle onClick={handleTitleClick}>
            Recommended Listings <FaChevronRight />
          </SectionTitle>
          <SectionSubtitle>Discover amazing places tailored to your preferences</SectionSubtitle>
        </SectionHeader>
        <ErrorContainer>
          <Alert variant="danger">
            <Alert.Heading>Error Loading Listings</Alert.Heading>
            <p>{error}</p>
          </Alert>
        </ErrorContainer>
      </RecommendedContainer>
    );
  }

  if (filteredListings.length === 0) {
    return (
      <RecommendedContainer>
        <SectionHeader>
          <SectionTitle onClick={handleTitleClick}>
            Recommended Listings <FaChevronRight />
          </SectionTitle>
          <SectionSubtitle>Discover amazing places tailored to your preferences</SectionSubtitle>
        </SectionHeader>
        <EmptyState>
          <div className="empty-icon">🔍</div>
          <h3>No listings found</h3>
          <p>Try adjusting your filters to see more recommendations.</p>
        </EmptyState>
      </RecommendedContainer>
    );
  }

  return (
    <RecommendedContainer>
      <SectionHeader>
      </SectionHeader>

      <ResultsInfo>
      <SectionTitle onClick={handleTitleClick}>
          Recommended Listings <FaChevronRight />
        </SectionTitle>
        <div className="results-summary">
          Based on your current filters
        </div>
      </ResultsInfo>

      <ResponsiveListingsGrid>
        {displayedListings.map((listing) => (
          <div key={listing._id || listing.id} style={isHorizontal ? { minWidth: '220px', maxWidth: '260px', flex: '0 0 auto' } : {}}>
            <ListingCard
              listing={listing}
              {...(isHorizontal ? { horizontal: true } : {})}
              onClick={() => console.log('Recommended listing clicked:', listing)}
            />
          </div>
        ))}
      </ResponsiveListingsGrid>
    </RecommendedContainer>
  );
};

export default RecommendedListings; 