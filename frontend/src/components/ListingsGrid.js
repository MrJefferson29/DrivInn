import React, { useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { Spinner, Alert } from 'react-bootstrap';
import { useListings } from '../context/ListingsContext';
import { useFilters } from '../context/FiltersContext';
import ListingCard from './ListingCard';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  padding: 0 80px;
  margin-top: 40px;
  
  @media (max-width: 1200px) {
    padding: 0 40px;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }
  
  @media (max-width: 992px) {
    padding: 0 32px;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 18px;
  }
  
  @media (max-width: 768px) {
    padding: 0 20px;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
    margin-top: 24px;
  }
  
  @media (max-width: 576px) {
    padding: 0 16px;
    grid-template-columns: 1fr;
    gap: 12px;
    margin-top: 20px;
  }
  
  @media (max-width: 480px) {
    padding: 0 12px;
    gap: 10px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
  grid-column: 1 / -1;
  
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
    color: #FF385C;
    
    @media (max-width: 480px) {
      width: 2.5rem;
      height: 2.5rem;
    }
  }
  
  h4 {
    margin-top: 16px;
    color: #717171;
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
  grid-column: 1 / -1;
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
  grid-column: 1 / -1;
  text-align: center;
  padding: 80px 20px;
  color: #717171;
  
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
    color: #222;
    
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
    
    @media (max-width: 768px) {
      font-size: 0.9rem;
      margin-bottom: 20px;
    }
    
    @media (max-width: 480px) {
      font-size: 0.85rem;
      margin-bottom: 16px;
    }
  }
  
  .retry-button {
    background: #FF385C;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 14px;
    
    &:hover {
      background: #e31c5f;
      transform: translateY(-2px);
    }
    
    @media (max-width: 768px) {
      padding: 10px 20px;
      font-size: 13px;
    }
    
    @media (max-width: 480px) {
      padding: 8px 16px;
      font-size: 12px;
    }
  }
`;

const LoadMoreContainer = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 20px;
  
  @media (max-width: 768px) {
    padding: 30px 16px;
  }
  
  @media (max-width: 480px) {
    padding: 24px 12px;
  }
`;

const LoadMoreButton = styled.button`
  background: transparent;
  border: 2px solid #FF385C;
  color: #FF385C;
  padding: 12px 32px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  
  &:hover {
    background: #FF385C;
    color: white;
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 10px 24px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 20px;
    font-size: 12px;
  }
`;

const ResultsInfo = styled.div`
  grid-column: 1 / -1;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  .results-count {
    font-size: 1.1rem;
    font-weight: 600;
    color: #222;
    
    @media (max-width: 768px) {
      font-size: 1rem;
    }
    
    @media (max-width: 480px) {
      font-size: 0.9rem;
    }
  }
  
  .results-summary {
    color: #717171;
    font-size: 0.9rem;
    
    @media (max-width: 768px) {
      font-size: 0.85rem;
    }
    
    @media (max-width: 480px) {
      font-size: 0.8rem;
    }
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
    padding: 16px 0;
    margin-bottom: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px 0;
    margin-bottom: 12px;
  }
`;

const ListingsGrid = ({ onListingClick }) => {
  const {
    listings,
    loading,
    error,
    pagination,
    loadMoreListings,
    fetchListings
  } = useListings();
  const { filters } = useFilters();

  // Filtering logic using new filters context
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

  const observerRef = useRef();
  const lastListingRef = useCallback(node => {
    if (loading) return;
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pagination.hasMore) {
        loadMoreListings();
      }
    });
    if (node) observerRef.current.observe(node);
  }, [loading, pagination.hasMore, loadMoreListings]);

  const handleRetry = () => {
    fetchListings();
  };

  const handleListingClick = (listing) => {
    if (onListingClick) {
      onListingClick(listing);
    }
  };

  if (loading && filteredListings.length === 0) {
    return (
      <LoadingContainer>
        <LoadingSpinner>
          <Spinner animation="border" />
          <h4>Loading amazing places...</h4>
        </LoadingSpinner>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <Alert variant="danger">
          <Alert.Heading>Oops! Something went wrong</Alert.Heading>
          <p>{error}</p>
          <button className="retry-button" onClick={handleRetry}>
            Try Again
          </button>
        </Alert>
      </ErrorContainer>
    );
  }

  if (filteredListings.length === 0) {
    return (
      <EmptyState>
        <div className="empty-icon">🏠</div>
        <h3>No listings found</h3>
        <p>Try adjusting your search criteria or filters</p>
        <button className="retry-button" onClick={handleRetry}>
          Refresh Results
        </button>
      </EmptyState>
    );
  }

  return (
    <GridContainer>
      <ResultsInfo>
        <div className="results-count">
          {filteredListings.length} {filteredListings.length === 1 ? 'listing' : 'listings'}
        </div>
        <div className="results-summary">
          Showing results for your search
        </div>
      </ResultsInfo>

      {filteredListings.map((listing, index) => (
        <div
          key={listing._id || listing.id}
          ref={index === filteredListings.length - 1 ? lastListingRef : null}
        >
          <ListingCard
            listing={listing}
            onClick={() => handleListingClick(listing)}
          />
        </div>
      ))}

      {loading && filteredListings.length > 0 && (
        <LoadMoreContainer>
          <LoadingSpinner>
            <Spinner animation="border" size="sm" />
            <h4>Loading more...</h4>
          </LoadingSpinner>
        </LoadMoreContainer>
      )}

      {!loading && pagination.hasMore && (
        <LoadMoreContainer>
          <LoadMoreButton onClick={loadMoreListings}>
            Load More Listings
          </LoadMoreButton>
        </LoadMoreContainer>
      )}
    </GridContainer>
  );
};

export default ListingsGrid; 