import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import ListingCard from '../ListingCard';
import { Spinner, Alert } from 'react-bootstrap';
import { FaStar, FaChevronRight } from 'react-icons/fa';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';

const airbnbRed = '#FF385C';
const airbnbDark = '#222222';
const airbnbGray = '#717171';

const Container = styled.div`
  padding: 40px 0;
  background: #fff;
  @media (max-width: 768px) { padding: 24px 0; }
  @media (max-width: 480px) { padding: 20px 0; }
`;
const SectionHeader = styled.div`
  text-align: center;
  margin-bottom: 32px;
  padding: 0 80px;
  @media (max-width: 1200px) { padding: 0 40px; }
  @media (max-width: 768px) { padding: 0 24px; margin-bottom: 24px; }
  @media (max-width: 480px) { padding: 0 12px; margin-bottom: 16px; }
`;
const SectionTitle = styled.h2`
  font-size: 1.6rem;
  font-weight: 300;
  color: ${airbnbDark};
  margin-bottom: 10px;
  letter-spacing: 0.05em;
  display: flex; align-items: center; justify-content: left; gap: 10px;
  margin-left: 5px;
  @media (max-width: 768px) { font-size: 1.5rem; }
  @media (max-width: 480px) { font-size: 1.1rem; }
`;
const SectionSubtitle = styled.p`
  font-size: 1.1rem;
  color: ${airbnbGray};
  margin-bottom: 0;
  line-height: 1.6;
  @media (max-width: 768px) { font-size: 1rem; }
  @media (max-width: 480px) { font-size: 0.9rem; }
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
  .results-count { font-size: 1.1rem; font-weight: 600; color: ${airbnbDark}; }
  .results-summary { color: ${airbnbGray}; font-size: 0.9rem; }
  @media (max-width: 1200px) { padding: 0 40px 20px 40px; }
  @media (max-width: 768px) {
    flex-direction: column; gap: 8px; align-items: flex-start; padding: 0 20px 16px 20px; margin-bottom: 16px;
  }
  @media (max-width: 480px) { padding: 0 12px 12px 12px; margin-bottom: 12px; }
`;
const ResponsiveListingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding: 0 40px 8px 40px;
  max-width: 1400px;
  margin: 0 auto;
  @media (max-width: 1200px) { grid-template-columns: repeat(3, 1fr); gap: 18px; padding: 0 20px 8px 20px; }
  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); gap: 14px; padding: 0 10px 8px 10px; }
  @media (max-width: 700px) {
    display: flex; flex-direction: row; overflow-x: auto; gap: 12px; padding: 0 8px 6px 8px; scroll-snap-type: x mandatory;
    & > div { scroll-snap-align: start; }
    
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
const LoadingContainer = styled.div`
  display: flex; justify-content: center; align-items: center; padding: 60px 20px;
  @media (max-width: 768px) { padding: 40px 16px; }
  @media (max-width: 480px) { padding: 30px 12px; }
`;
const LoadingSpinner = styled.div`
  text-align: center;
  .spinner-border { width: 3rem; height: 3rem; color: ${airbnbRed}; @media (max-width: 480px) { width: 2.5rem; height: 2.5rem; } }
  h4 { margin-top: 16px; color: ${airbnbGray}; font-weight: 500; @media (max-width: 768px) { font-size: 1rem; margin-top: 12px; } @media (max-width: 480px) { font-size: 0.9rem; margin-top: 10px; } }
`;
const ErrorContainer = styled.div`
  padding: 40px 20px; text-align: center;
  @media (max-width: 768px) { padding: 30px 16px; }
  @media (max-width: 480px) { padding: 24px 12px; }
`;
const EmptyState = styled.div`
  text-align: center; padding: 80px 20px; color: ${airbnbGray};
  .empty-icon { font-size: 4rem; color: #ddd; margin-bottom: 24px; @media (max-width: 768px) { font-size: 3rem; margin-bottom: 20px; } @media (max-width: 480px) { font-size: 2.5rem; margin-bottom: 16px; } }
  h3 { font-size: 1.5rem; font-weight: 600; margin-bottom: 12px; color: ${airbnbDark}; @media (max-width: 768px) { font-size: 1.25rem; margin-bottom: 10px; } @media (max-width: 480px) { font-size: 1.1rem; margin-bottom: 8px; } }
  p { font-size: 1rem; margin-bottom: 24px; line-height: 1.6; @media (max-width: 768px) { font-size: 0.9rem; margin-bottom: 20px; } @media (max-width: 480px) { font-size: 0.85rem; margin-bottom: 16px; } }
`;

const MostVisitedApartments = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isHorizontal = useMediaQuery({ maxWidth: 700 });
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
          fetch('https://drivinn.onrender.com/listings/most-visited-apartments')
      .then(async res => {
        if (!res.ok) throw new Error('Failed to fetch most visited apartments');
        return await res.json();
      })
      .then(data => {
        setApartments(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Error loading data');
        setLoading(false);
      });
  }, []);

  // Limit to 8 listings
  const displayedApartments = apartments.slice(0, 8);

  const handleTitleClick = () => {
    navigate('/more-like-this/most-visited-apartments');
  };

  if (loading) {
    return (
      <Container>
        <SectionHeader>
          <SectionTitle onClick={handleTitleClick}>
            <FaStar /> Most Visited Apartments <FaChevronRight />
          </SectionTitle>
        </SectionHeader>
        <LoadingContainer>
          <LoadingSpinner>
            <Spinner animation="border" />
            <h4>Loading most visited apartments...</h4>
          </LoadingSpinner>
        </LoadingContainer>
      </Container>
    );
  }
  if (error) {
    return (
      <Container>
        <SectionHeader>
          <SectionTitle onClick={handleTitleClick}>
            <FaStar /> Most Visited Apartments <FaChevronRight />
          </SectionTitle>
        </SectionHeader>
        <ErrorContainer>
          <Alert variant="danger">{error}</Alert>
        </ErrorContainer>
      </Container>
    );
  }
  if (apartments.length === 0) {
    return (
      <Container>
        <SectionHeader>
          <SectionTitle onClick={handleTitleClick}>
            <FaStar /> Most Visited Apartments <FaChevronRight />
          </SectionTitle>
        </SectionHeader>
        <EmptyState>
          <div className="empty-icon">🏢</div>
          <h3>No apartments found.</h3>
          <p>There are no most visited apartments at the moment. Check back soon!</p>
        </EmptyState>
      </Container>
    );
  }
  return (
    <Container>
      <SectionHeader>
    
      </SectionHeader>
      <ResultsInfo>
        <SectionTitle onClick={handleTitleClick}>
          Most Visited Apartments <FaChevronRight />
        </SectionTitle>
        <div className="results-summary">
          Based on booking popularity
        </div>
      </ResultsInfo>
      <ResponsiveListingsGrid>
        {displayedApartments.map((listing) => (
          <div key={listing._id || listing.id} style={isHorizontal ? { minWidth: '220px', maxWidth: '260px', flex: '0 0 auto' } : {}}>
            <ListingCard listing={listing} {...(isHorizontal ? { horizontal: true } : {})} />
          </div>
        ))}
      </ResponsiveListingsGrid>
    </Container>
  );
};

export default MostVisitedApartments; 