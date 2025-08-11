import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaCheckCircle, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaDollarSign,
  FaArrowLeft,
  FaHome
} from 'react-icons/fa';
import { bookingsAPI } from '../services/api';

// Airbnb color palette
const airbnbRed = '#FF385C';
const airbnbDark = '#222222';
const airbnbGray = '#717171';
const airbnbLightGray = '#F7F7F7';
const airbnbBorder = '#DDDDDD';

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  background: ${airbnbLightGray};
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const SuccessCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 600px;
  width: 100%;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 24px;
    margin: 16px;
  }
`;

const SuccessIcon = styled.div`
  color: #28a745;
  font-size: 4rem;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    font-size: 3rem;
    margin-bottom: 20px;
  }
`;

const Title = styled.h1`
  color: ${airbnbDark};
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled.p`
  color: ${airbnbGray};
  font-size: 1.1rem;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 24px;
  }
`;

const BookingDetails = styled.div`
  background: ${airbnbLightGray};
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 32px;
  text-align: left;
  
  @media (max-width: 768px) {
    padding: 20px;
    margin-bottom: 24px;
  }
`;

const DetailRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 12px;
  }
`;

const DetailIcon = styled.div`
  color: ${airbnbRed};
  margin-right: 12px;
  font-size: 1.2rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-right: 10px;
  }
`;

const DetailText = styled.div`
  color: ${airbnbDark};
  font-size: 1rem;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const Button = styled.button`
  padding: 14px 28px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    padding: 12px 24px;
    font-size: 0.9rem;
  }
`;

const PrimaryButton = styled(Button)`
  background: ${airbnbRed};
  color: white;
  
  &:hover {
    background: #e31c5f;
  }
`;

const SecondaryButton = styled(Button)`
  background: white;
  color: ${airbnbDark};
  border: 2px solid ${airbnbBorder};
  
  &:hover {
    background: ${airbnbLightGray};
    border-color: ${airbnbGray};
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: ${airbnbGray};
`;

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setError('No session ID provided');
        setLoading(false);
        return;
      }

      try {
        // Verify the payment with the backend
        const response = await bookingsAPI.verifyPayment(sessionId);
        setBooking(response.data.booking || response.data);
      } catch (err) {
        console.error('Error verifying payment:', err);
        setError('Failed to verify payment. Please contact support.');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewBookings = () => {
    navigate('/bookings');
  };

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>
          <div>Verifying your payment...</div>
        </LoadingSpinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <SuccessCard>
          <div style={{ color: '#dc3545', fontSize: '3rem', marginBottom: '24px' }}>
            ❌
          </div>
          <Title>Payment Verification Failed</Title>
          <Subtitle>{error}</Subtitle>
          <ButtonGroup>
            <PrimaryButton onClick={handleGoHome}>
              <FaHome /> Go Home
            </PrimaryButton>
          </ButtonGroup>
        </SuccessCard>
      </Container>
    );
  }

  return (
    <Container>
      <SuccessCard>
        <SuccessIcon>
          <FaCheckCircle />
        </SuccessIcon>
        
        <Title>Payment Successful!</Title>
        <Subtitle>
          Your booking has been confirmed and payment has been processed successfully.
        </Subtitle>

        {booking && (
          <BookingDetails>
                         <DetailRow>
               <DetailIcon>
                 <FaMapMarkerAlt />
               </DetailIcon>
               <DetailText>
                 <strong>Property:</strong> {booking.home?.title || booking.listing?.title || 'N/A'}
               </DetailText>
             </DetailRow>
            
            <DetailRow>
              <DetailIcon>
                <FaCalendarAlt />
              </DetailIcon>
              <DetailText>
                <strong>Check-in:</strong> {new Date(booking.checkIn).toLocaleDateString()}
              </DetailText>
            </DetailRow>
            
            <DetailRow>
              <DetailIcon>
                <FaCalendarAlt />
              </DetailIcon>
              <DetailText>
                <strong>Check-out:</strong> {new Date(booking.checkOut).toLocaleDateString()}
              </DetailText>
            </DetailRow>
            
            <DetailRow>
              <DetailIcon>
                <FaDollarSign />
              </DetailIcon>
              <DetailText>
                <strong>Total Paid:</strong> ${booking.totalPrice}
              </DetailText>
            </DetailRow>
          </BookingDetails>
        )}

        <ButtonGroup>
          <PrimaryButton onClick={handleViewBookings}>
            <FaCalendarAlt /> View My Bookings
          </PrimaryButton>
          <SecondaryButton onClick={handleGoHome}>
            <FaHome /> Go Home
          </SecondaryButton>
        </ButtonGroup>
      </SuccessCard>
    </Container>
  );
};

export default BookingSuccess;
