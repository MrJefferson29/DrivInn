import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import { getLikedListings } from '../services/likesService';
import ListingCard from './ListingCard';
import { Spinner, Alert } from 'react-bootstrap';
import { FaHeart, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
  
  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #222222;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #f7f7f7;
    color: #FF385C;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #222222;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
`;

const HeartIcon = styled(FaHeart)`
  color: #FF385C;
  font-size: 2rem;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #717171;
  margin: 0 0 32px 0;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 24px;
  }
`;

const ListingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  
  .spinner-border {
    color: #FF385C;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 80px 20px;
  color: #717171;
  
  @media (max-width: 768px) {
    padding: 60px 16px;
  }
`;

const EmptyIcon = styled(FaHeart)`
  font-size: 4rem;
  color: #DDDDDD;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    font-size: 3rem;
    margin-bottom: 20px;
  }
`;

const EmptyTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #222222;
  margin-bottom: 12px;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const EmptyText = styled.p`
  font-size: 1rem;
  color: #717171;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const ExploreButton = styled.button`
  background: #FF385C;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #e31c5f;
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
`;

const LikedListings = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [likedListings, setLikedListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchLikedListings = async () => {
      try {
        setLoading(true);
        const data = await getLikedListings();
        setLikedListings(data);
      } catch (err) {
        console.error('Error fetching liked listings:', err);
        setError('Failed to load liked listings');
      } finally {
        setLoading(false);
      }
    };

    fetchLikedListings();
  }, [isAuthenticated, navigate]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleExploreClick = () => {
    navigate('/');
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <Spinner animation="border" />
        </LoadingContainer>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={handleBackClick}>
          <FaArrowLeft /> Back
        </BackButton>
        <Title>
          <HeartIcon /> Liked Listings
        </Title>
      </Header>

      <Subtitle>
        {likedListings.length === 0 
          ? "You haven't liked any listings yet."
          : `You have ${likedListings.length} liked listing${likedListings.length === 1 ? '' : 's'}`
        }
      </Subtitle>

      {likedListings.length === 0 ? (
        <EmptyState>
          <EmptyIcon />
          <EmptyTitle>No liked listings yet</EmptyTitle>
          <EmptyText>
            Start exploring amazing places and cars to build your collection of favorites.
          </EmptyText>
          <ExploreButton onClick={handleExploreClick}>
            Explore Listings
          </ExploreButton>
        </EmptyState>
      ) : (
        <ListingsGrid>
          {likedListings.map((listing) => (
            <ListingCard 
              key={listing._id} 
              listing={listing}
            />
          ))}
        </ListingsGrid>
      )}
    </Container>
  );
};

export default LikedListings; 