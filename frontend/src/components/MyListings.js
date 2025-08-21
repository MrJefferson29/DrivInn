import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';
import ListingCard from './ListingCard';
import { Spinner, Alert, Button } from 'react-bootstrap';
import { FaPlus, FaArrowLeft, FaHome, FaChartBar } from 'react-icons/fa';
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
  justify-content: space-between;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
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

const HomeIcon = styled(FaHome)`
  color: #FF385C;
  font-size: 2rem;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const HeaderRight = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const ActionButton = styled.button`
  background: #FF385C;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #e31c5f;
    transform: translateY(-1px);
  }
  
  &.secondary {
    background: #f7f7f7;
    color: #222;
    border: 1px solid #ddd;
    
    &:hover {
      background: #e9e9e9;
    }
  }
  
  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 0.9rem;
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const StatCard = styled.div`
  background: #f7f7f7;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  border: 1px solid #ddd;
  
  @media (max-width: 768px) {
    padding: 20px;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #FF385C;
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #717171;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
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

const EmptyIcon = styled(FaHome)`
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

const MyListings = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    totalBookings: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (user?.role !== 'host' && user?.role !== 'admin') {
      navigate('/');
      return;
    }

    const fetchMyListings = async () => {
      try {
        setLoading(true);
        const response = await fetch(`https://drivinn.onrender.com/listings?owner=${user.id || user._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch listings');
        }
        
        const data = await response.json();
        setListings(data);
        
        // Calculate stats
        const total = data.length;
        const active = data.filter(listing => listing.isActive).length;
        const totalBookings = data.reduce((sum, listing) => sum + (listing.bookingCount || 0), 0);
        const totalRevenue = data.reduce((sum, listing) => {
          // This would need to be calculated from actual booking data
          return sum + (listing.bookingCount || 0) * (listing.price || 0);
        }, 0);
        
        setStats({ total, active, totalBookings, totalRevenue });
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to load your listings');
      } finally {
        setLoading(false);
      }
    };

    fetchMyListings();
  }, [isAuthenticated, user, navigate]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleCreateListing = () => {
    navigate('/create-listing');
  };

  const handleViewDashboard = () => {
    // This would navigate to a more detailed dashboard
    navigate('/dashboard');
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
        <HeaderLeft>
          <BackButton onClick={handleBackClick}>
            <FaArrowLeft /> Back
          </BackButton>
          <Title>
            <HomeIcon /> My Listings
          </Title>
        </HeaderLeft>
        <HeaderRight>
          <ActionButton onClick={handleViewDashboard}>
            <FaChartBar /> Dashboard
          </ActionButton>
          <ActionButton onClick={handleCreateListing}>
            <FaPlus /> Create Listing
          </ActionButton>
        </HeaderRight>
      </Header>

      <Subtitle>
        {listings.length === 0 
          ? "You haven't created any listings yet."
          : `You have ${listings.length} listing${listings.length === 1 ? '' : 's'}`
        }
      </Subtitle>

      {/* Stats Section */}
      {listings.length > 0 && (
        <StatsGrid>
          <StatCard>
            <StatValue>{stats.total}</StatValue>
            <StatLabel>Total Listings</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.active}</StatValue>
            <StatLabel>Active Listings</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{stats.totalBookings}</StatValue>
            <StatLabel>Total Bookings</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>${stats.totalRevenue.toLocaleString()}</StatValue>
            <StatLabel>Total Revenue</StatLabel>
          </StatCard>
        </StatsGrid>
      )}

      {listings.length === 0 ? (
        <EmptyState>
          <EmptyIcon />
          <EmptyTitle>No listings yet</EmptyTitle>
          <EmptyText>
            Start hosting by creating your first listing and sharing your space with travelers.
          </EmptyText>
          <ActionButton onClick={handleCreateListing}>
            <FaPlus /> Create Your First Listing
          </ActionButton>
        </EmptyState>
      ) : (
        <ListingsGrid>
          {listings.map((listing) => (
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

export default MyListings; 