import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaTimesCircle, 
  FaArrowLeft,
  FaHome,
  FaCalendarAlt
} from 'react-icons/fa';

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

const CancelCard = styled.div`
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

const CancelIcon = styled.div`
  color: ${airbnbRed};
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

const InfoBox = styled.div`
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

const InfoText = styled.p`
  color: ${airbnbDark};
  font-size: 1rem;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
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

const BookingCancel = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  const handleGoHome = () => {
    navigate('/');
  };

  const handleTryAgain = () => {
    // Go back to the previous page or home
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <Container>
      <CancelCard>
        <CancelIcon>
          <FaTimesCircle />
        </CancelIcon>
        
        <Title>Payment Cancelled</Title>
        <Subtitle>
          Your payment was cancelled and no charges were made to your account.
        </Subtitle>

        <InfoBox>
          <InfoText>
            <strong>What happened?</strong>
          </InfoText>
          <InfoText>
            • You cancelled the payment process before it was completed
          </InfoText>
          <InfoText>
            • No booking was created and no money was charged
          </InfoText>
          <InfoText>
            • Your booking request has been cancelled
          </InfoText>
        </InfoBox>

        <ButtonGroup>
          <PrimaryButton onClick={handleTryAgain}>
            <FaArrowLeft /> Try Again
          </PrimaryButton>
          <SecondaryButton onClick={handleGoHome}>
            <FaHome /> Go Home
          </SecondaryButton>
        </ButtonGroup>
      </CancelCard>
    </Container>
  );
};

export default BookingCancel;
