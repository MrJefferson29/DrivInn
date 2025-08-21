import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineCalendarDays, HiOutlineStar, HiOutlineMapPin, HiOutlineClock, HiOutlineUser, HiOutlineHeart, HiOutlineShare, HiOutlineArrowRight } from 'react-icons/hi2';
import { format } from 'date-fns';

const ExperienceContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 20px;
  padding-top: 100px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #484848;
  margin-bottom: 12px;
  background: linear-gradient(135deg, #FF385C 0%, #FF5A5F 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (max-width: 768px) {
    font-size: 2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: #767676;
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  }
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #FF385C;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #767676;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  color: #484848;
  margin-bottom: 24px;
  text-align: center;

  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const BookingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const BookingCard = styled.div`
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  }
`;

const ListingImage = styled.div`
  height: 200px;
  background: ${props => props.imageUrl ? `url(${props.imageUrl})` : 'linear-gradient(135deg, #FF385C 0%, #FF5A5F 100%)'};
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  font-weight: 600;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
  }
`;

const ImageOverlay = styled.div`
  position: relative;
  z-index: 2;
  text-align: center;
`;

const ListingType = styled.span`
  background: rgba(255, 255, 255, 0.9);
  color: #484848;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CardContent = styled.div`
  padding: 24px;
`;

const ListingTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  color: #484848;
  margin-bottom: 12px;
  line-height: 1.4;
`;

const LocationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #767676;
  font-size: 0.9rem;
  margin-bottom: 16px;
`;

const BookingDetails = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: #484848;
`;

const DetailLabel = styled.span`
  color: #767676;
  font-weight: 500;
`;

const ReviewSection = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border-left: 4px solid #FF385C;
`;

const ReviewHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StarIcon = styled(HiOutlineStar)`
  color: #FFD700;
  font-size: 1.1rem;
`;

const ReviewText = styled.p`
  color: #484848;
  line-height: 1.6;
  font-size: 0.9rem;
  margin: 0;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
`;

const PrimaryButton = styled.button`
  flex: 1;
  background: linear-gradient(135deg, #FF385C 0%, #FF5A5F 100%);
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 56, 92, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled.button`
  background: white;
  color: #484848;
  border: 2px solid #e9ecef;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    border-color: #FF385C;
    color: #FF385C;
    transform: translateY(-2px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  color: #FF385C;
  margin-bottom: 20px;
`;

const EmptyTitle = styled.h3`
  font-size: 1.5rem;
  color: #484848;
  margin-bottom: 12px;
`;

const EmptyText = styled.p`
  color: #767676;
  margin-bottom: 24px;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
`;

const ExploreButton = styled.button`
  background: linear-gradient(135deg, #FF385C 0%, #FF5A5F 100%);
  color: white;
  border: none;
  padding: 14px 28px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 56, 92, 0.3);
  }
`;

const Experience = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalReviews: 0,
    averageRating: 0,
    totalSpent: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      console.log('🔄 Fetching user bookings for Experience screen...');
      
      const response = await fetch('https://drivinn.onrender.com/bookings/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 All bookings received:', data.length);
        console.log('📊 Sample booking:', data[0] ? {
          id: data[0]._id,
          status: data[0].status,
          checkIn: data[0].checkIn,
          checkOut: data[0].checkOut,
          home: data[0].home ? {
            title: data[0].home.title,
            type: data[0].home.type
          } : null,
          reviewId: data[0].reviewId ? {
            rating: data[0].reviewId.rating,
            content: data[0].reviewId.content
          } : null
        } : 'No bookings');
        
        // Store all bookings for reference
        setAllBookings(data);
        
        // Filter for completed/past bookings
        const pastBookings = data.filter(booking => 
          ['completed', 'checked_out'].includes(booking.status)
        );
        
        console.log('✅ Filtered past bookings:', pastBookings.length);
        console.log('✅ Past booking statuses:', pastBookings.map(b => b.status));
        
        setBookings(pastBookings);
        calculateStats(pastBookings);
        setError(''); // Clear any previous errors
      } else {
        console.error('❌ Failed to fetch bookings:', response.status, response.statusText);
        setError(`Failed to fetch bookings: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      setError('Failed to fetch bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (bookings) => {
    console.log('📊 Calculating stats for', bookings.length, 'bookings');
    
    const totalBookings = bookings.length;
    const totalReviews = bookings.filter(booking => booking.reviewId).length;
    const totalSpent = bookings.reduce((sum, booking) => sum + (booking.totalPrice || 0), 0);
    
    let totalRating = 0;
    let ratedBookings = 0;
    
    bookings.forEach(booking => {
      if (booking.reviewId && booking.reviewId.rating) {
        totalRating += booking.reviewId.rating;
        ratedBookings++;
        console.log('⭐ Review found:', {
          bookingId: booking._id,
          rating: booking.reviewId.rating,
          content: booking.reviewId.content?.substring(0, 50) + '...'
        });
      }
    });
    
    const averageRating = ratedBookings > 0 ? (totalRating / ratedBookings).toFixed(1) : 0;
    
    const stats = {
      totalBookings,
      totalReviews,
      averageRating,
      totalSpent
    };
    
    console.log('📊 Stats calculated:', stats);
    setStats(stats);
  };

  const handleBookAgain = (listingId) => {
    navigate(`/listing/${listingId}`);
  };

  const handleShare = (listing) => {
    // Implement sharing functionality
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Check out this amazing ${listing.type} on DrivInn!`,
        url: window.location.origin + `/listing/${listing._id}`
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(window.location.origin + `/listing/${listing._id}`);
      alert('Link copied to clipboard!');
    }
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <ExperienceContainer>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '2rem', color: '#FF385C' }}>Loading...</div>
        </div>
      </ExperienceContainer>
    );
  }

  return (
    <ExperienceContainer>
             <Header>
         <Title>Your Travel Experiences</Title>
         <Subtitle>
           Relive your adventures and discover new destinations to explore
         </Subtitle>
         <button 
           onClick={fetchUserBookings}
           disabled={loading}
           style={{
             background: loading ? '#ccc' : 'linear-gradient(135deg, #FF385C 0%, #FF5A5F 100%)',
             color: 'white',
             border: 'none',
             padding: '8px 16px',
             borderRadius: '8px',
             fontSize: '0.9rem',
             cursor: loading ? 'not-allowed' : 'pointer',
             marginTop: '16px',
             opacity: loading ? 0.7 : 1
           }}
         >
           {loading ? '⏳ Loading...' : '🔄 Refresh'}
         </button>
       </Header>

       {error && (
         <div style={{
           background: '#fef2f2',
           border: '1px solid #fecaca',
           color: '#dc2626',
           padding: '16px',
           borderRadius: '8px',
           marginBottom: '24px',
           textAlign: 'center'
         }}>
           ❌ {error}
           <button 
             onClick={() => setError('')}
             style={{
               background: 'none',
               border: 'none',
               color: '#dc2626',
               marginLeft: '12px',
               cursor: 'pointer',
               textDecoration: 'underline'
             }}
           >
             Dismiss
           </button>
         </div>
       )}

      <StatsContainer>
        <StatCard>
          <StatNumber>{stats.totalBookings}</StatNumber>
          <StatLabel>Total Trips</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.totalReviews}</StatNumber>
          <StatLabel>Reviews Written</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.averageRating}</StatNumber>
          <StatLabel>Average Rating</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{formatCurrency(stats.totalSpent)}</StatNumber>
          <StatLabel>Total Spent</StatLabel>
        </StatCard>
      </StatsContainer>

      <ContentContainer>
        <SectionTitle>Your Past Adventures</SectionTitle>
        
                 {bookings.length === 0 ? (
           <EmptyState>
             <EmptyIcon>🌟</EmptyIcon>
             <EmptyTitle>No experiences yet</EmptyTitle>
             <EmptyText>
               Start your journey by booking your first trip or rental. 
               Your experiences will appear here once completed.
             </EmptyText>
             <ExploreButton onClick={() => navigate('/')}>
               Explore Listings
             </ExploreButton>
           </EmptyState>
         ) : (
           <>
             <div style={{ 
               background: 'rgba(0,0,0,0.05)', 
               padding: '12px', 
               borderRadius: '8px', 
               marginBottom: '20px',
               fontSize: '0.9rem',
               color: '#666'
             }}>
               📊 Debug Info: Showing {bookings.length} completed/checked-out bookings out of {allBookings.length} total bookings
               <br />
               📋 Status breakdown: {Object.entries(allBookings.reduce((acc, b) => {
                 acc[b.status] = (acc[b.status] || 0) + 1;
                 return acc;
               }, {})).map(([status, count]) => `${status}: ${count}`).join(', ')}
             </div>
             <BookingsGrid>
               {bookings.map((booking) => (
                 <BookingCard key={booking._id}>
                                 <ListingImage imageUrl={booking.home?.images?.[0]}>
                   <ImageOverlay>
                     <ListingType>{booking.home?.type || 'Property'}</ListingType>
                     {!booking.home?.images?.[0] && (
                       <div style={{ 
                         fontSize: '1rem', 
                         marginTop: '8px',
                         opacity: 0.8 
                       }}>
                         No Image Available
                       </div>
                     )}
                   </ImageOverlay>
                 </ListingImage>
                
                <CardContent>
                  <ListingTitle>{booking.home?.title || 'Amazing Property'}</ListingTitle>
                  
                  <LocationInfo>
                    <HiOutlineMapPin />
                    {booking.home?.location?.city}, {booking.home?.location?.state}
                  </LocationInfo>
                  
                  <BookingDetails>
                    <DetailItem>
                      <HiOutlineCalendarDays />
                      <div>
                        <DetailLabel>Check-in:</DetailLabel>
                        <div>{formatDate(booking.checkIn)}</div>
                      </div>
                    </DetailItem>
                    <DetailItem>
                      <HiOutlineCalendarDays />
                      <div>
                        <DetailLabel>Check-out:</DetailLabel>
                        <div>{formatDate(booking.checkOut)}</div>
                      </div>
                    </DetailItem>
                    <DetailItem>
                      <HiOutlineUser />
                      <div>
                        <DetailLabel>Guests:</DetailLabel>
                        <div>{booking.guests}</div>
                      </div>
                    </DetailItem>
                    <DetailItem>
                      <HiOutlineClock />
                      <div>
                        <DetailLabel>Duration:</DetailLabel>
                        <div>{Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))} days</div>
                      </div>
                    </DetailItem>
                  </BookingDetails>

                                     {booking.reviewId && (
                     <ReviewSection>
                       <ReviewHeader>
                         <Rating>
                           {[...Array(5)].map((_, i) => (
                             <StarIcon 
                               key={i} 
                               style={{ 
                                 color: i < booking.reviewId.rating ? '#FFD700' : '#e9ecef',
                                 fill: i < booking.reviewId.rating ? '#FFD700' : 'none'
                               }} 
                             />
                           ))}
                         </Rating>
                         <span style={{ color: '#767676', fontSize: '0.9rem' }}>
                           {formatDate(booking.reviewId.createdAt)}
                         </span>
                       </ReviewHeader>
                       <ReviewText>{booking.reviewId.content}</ReviewText>
                     </ReviewSection>
                   )}

                                     {!booking.reviewId && (
                     <div style={{
                       background: '#f8f9fa',
                       border: '1px solid #e9ecef',
                       borderRadius: '8px',
                       padding: '12px',
                       marginBottom: '16px',
                       textAlign: 'center',
                       color: '#6c757d',
                       fontSize: '0.9rem'
                     }}>
                       💭 No review yet for this booking
                     </div>
                   )}
                   
                   <ActionButtons>
                     <PrimaryButton onClick={() => handleBookAgain(booking.home._id)}>
                       <HiOutlineHeart />
                       Book Again
                     </PrimaryButton>
                     <SecondaryButton onClick={() => handleShare(booking.home)}>
                       <HiOutlineShare />
                       Share
                     </SecondaryButton>
                   </ActionButtons>
                                 </CardContent>
               </BookingCard>
             ))}
           </BookingsGrid>
           </>
         )}
       </ContentContainer>
    </ExperienceContainer>
  );
};

export default Experience;
