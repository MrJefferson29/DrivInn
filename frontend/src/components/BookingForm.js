import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Alert, Spinner } from 'react-bootstrap';
import { 
  FaCalendarAlt, 
  FaUsers, 
  FaDollarSign, 
  FaTimes, 
  FaCheck,
  FaClock,
  FaShieldAlt,
  FaCreditCard
} from 'react-icons/fa';
import { FaMobileAlt } from 'react-icons/fa';
import { bookingsAPI } from '../services/api';

// Airbnb color palette
const airbnbRed = '#FF385C';
const airbnbDark = '#222222';
const airbnbGray = '#717171';
const airbnbLightGray = '#F7F7F7';
const airbnbBorder = '#DDDDDD';

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @media (max-width: 768px) {
    max-height: 95vh;
    border-radius: 12px;
  }
`;

const ModalHeader = styled.div`
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid ${airbnbBorder};
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    padding: 20px 20px 0 20px;
    margin-bottom: 20px;
  }
  
  @media (max-width: 480px) {
    padding: 16px 16px 0 16px;
    margin-bottom: 16px;
  }
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${airbnbDark};
  margin: 0 0 8px 0;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const ModalSubtitle = styled.p`
  color: ${airbnbGray};
  font-size: 1rem;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${airbnbGray};
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${airbnbLightGray};
    color: ${airbnbDark};
  }
  
  @media (max-width: 768px) {
    top: 16px;
    right: 16px;
    width: 28px;
    height: 28px;
    font-size: 1.25rem;
  }
`;

const FormContent = styled.div`
  padding: 0 24px 24px 24px;
  
  @media (max-width: 768px) {
    padding: 0 20px 20px 20px;
  }
  
  @media (max-width: 480px) {
    padding: 0 16px 16px 16px;
  }
`;

const FormSection = styled.div`
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${airbnbDark};
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 10px;
  }
`;

const DateInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${airbnbBorder};
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.2s ease;
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${airbnbRed};
    box-shadow: 0 0 0 3px rgba(255, 56, 92, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 10px 14px;
    font-size: 0.9rem;
  }
`;

const GuestSelector = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: 2px solid ${airbnbBorder};
  border-radius: 12px;
  background: white;
  
  @media (max-width: 768px) {
    padding: 10px 14px;
  }
`;

const GuestCount = styled.span`
  font-size: 1rem;
  font-weight: 600;
  color: ${airbnbDark};
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const GuestControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const GuestButton = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid ${airbnbBorder};
  border-radius: 50%;
  background: white;
  color: ${airbnbDark};
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    border-color: ${airbnbRed};
    color: ${airbnbRed};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    font-size: 1rem;
  }
`;

const PriceBreakdown = styled.div`
  background: ${airbnbLightGray};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    padding: 16px;
    margin-bottom: 20px;
  }
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
    padding-top: 12px;
    border-top: 1px solid ${airbnbBorder};
    font-weight: 600;
    font-size: 1.1rem;
  }
  
  @media (max-width: 768px) {
    margin-bottom: 10px;
    font-size: 0.9rem;
    
    &:last-child {
      font-size: 1rem;
    }
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  background: ${airbnbRed};
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #e31c5f;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: ${airbnbGray};
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 14px;
    font-size: 1rem;
  }
`;

const InfoText = styled.p`
  color: ${airbnbGray};
  font-size: 0.9rem;
  margin: 8px 0 0 0;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const PaymentMethodSection = styled.div`
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const PaymentMethodGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 12px;
  
  @media (max-width: 768px) {
    gap: 10px;
  }
`;

const PaymentMethodOption = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  border: 2px solid ${props => props.selected ? airbnbRed : airbnbBorder};
  border-radius: 12px;
  background: ${props => props.selected ? '#fff5f5' : 'white'};
  color: ${props => props.selected ? airbnbRed : airbnbDark};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${airbnbRed};
    background: #fff5f5;
  }
  
  @media (max-width: 768px) {
    padding: 14px;
    font-size: 0.9rem;
  }
`;

const BookingForm = ({ listing, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    guests: 1
  });
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate dates
  const today = new Date().toISOString().split('T')[0];
  const maxGuests = listing.type === 'car' ? (listing.carDetails?.seats || 5) : (listing.guests || 10);
  
  // Calculate price
  const calculatePrice = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    const basePrice = days * listing.price;
    const cleaningFee = listing.cleaningFee || 0;
    
    return basePrice + cleaningFee;
  };

  const totalPrice = calculatePrice();

  const handleDateChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleGuestChange = (increment) => {
    const newCount = formData.guests + increment;
    if (newCount >= 1 && newCount <= maxGuests) {
      setFormData(prev => ({
        ...prev,
        guests: newCount
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError('End date must be after start date');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const bookingData = {
        listing: listing._id,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        guests: formData.guests,
        totalPrice: totalPrice,
        paymentMethod: paymentMethod
      };

      const response = await bookingsAPI.createBooking(bookingData);
      onSuccess(response.data);
      onClose();
    } catch (err) {
      console.error('Booking error:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Error creating booking. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Book this {listing.type === 'car' ? 'car' : 'place'}</ModalTitle>
          <ModalSubtitle>{listing.title}</ModalSubtitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <FormContent>
          <form onSubmit={handleSubmit}>
            {/* Date Selection */}
            <FormSection>
              <SectionTitle>
                <FaCalendarAlt /> Select dates
              </SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: airbnbGray }}>
                    Check-in
                  </label>
                  <DateInput
                    type="date"
                    min={today}
                    value={formData.startDate}
                    onChange={(e) => handleDateChange('startDate', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', color: airbnbGray }}>
                    Check-out
                  </label>
                  <DateInput
                    type="date"
                    min={formData.startDate || today}
                    value={formData.endDate}
                    onChange={(e) => handleDateChange('endDate', e.target.value)}
                    required
                  />
                </div>
              </div>
              <InfoText>
                {listing.type === 'car' ? 
                  `Minimum rental: ${listing.carDetails?.minRentalDays || 1} day(s)` :
                  `Minimum stay: ${listing.minNights || 1} night(s)`
                }
              </InfoText>
            </FormSection>

            {/* Guest Selection */}
            <FormSection>
              <SectionTitle>
                <FaUsers /> Number of {listing.type === 'car' ? 'passengers' : 'guests'}
              </SectionTitle>
              <GuestSelector>
                <GuestCount>{formData.guests} {listing.type === 'car' ? 'passenger(s)' : 'guest(s)'}</GuestCount>
                <GuestControls>
                  <GuestButton
                    type="button"
                    onClick={() => handleGuestChange(-1)}
                    disabled={formData.guests <= 1}
                  >
                    -
                  </GuestButton>
                  <GuestButton
                    type="button"
                    onClick={() => handleGuestChange(1)}
                    disabled={formData.guests >= maxGuests}
                  >
                    +
                  </GuestButton>
                </GuestControls>
              </GuestSelector>
              <InfoText>
                Maximum {maxGuests} {listing.type === 'car' ? 'passengers' : 'guests'}
              </InfoText>
            </FormSection>

            {/* Payment Method Selection */}
            <PaymentMethodSection>
              <SectionTitle>
                <FaDollarSign /> Payment method
              </SectionTitle>
              <PaymentMethodGrid>
                <PaymentMethodOption
                  type="button"
                  selected={paymentMethod === 'card'}
                  onClick={() => setPaymentMethod('card')}
                >
                  <FaCreditCard />
                  Credit Card
                </PaymentMethodOption>
                <PaymentMethodOption
                  type="button"
                  selected={paymentMethod === 'cashapp'}
                  onClick={() => setPaymentMethod('cashapp')}
                >
                  <FaMobileAlt />
                  Cash App Pay
                </PaymentMethodOption>
              </PaymentMethodGrid>
              <InfoText>
                {paymentMethod === 'cashapp' 
                  ? 'You will be redirected to Cash App to complete your payment securely.'
                  : 'Your payment will be processed securely through Stripe.'
                }
              </InfoText>
            </PaymentMethodSection>

            {/* Price Breakdown */}
            {totalPrice > 0 && (
              <PriceBreakdown>
                <SectionTitle>
                  <FaDollarSign /> Price breakdown
                </SectionTitle>
                <PriceRow>
                  <span>${listing.price} × {formData.startDate && formData.endDate ? 
                    Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) : 0} {listing.type === 'car' ? 'days' : 'nights'}</span>
                  <span>${formData.startDate && formData.endDate ? 
                    Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24)) * listing.price : 0}</span>
                </PriceRow>
                {listing.cleaningFee && (
                  <PriceRow>
                    <span>Cleaning fee</span>
                    <span>${listing.cleaningFee}</span>
                  </PriceRow>
                )}
                <PriceRow>
                  <span>Total</span>
                  <span>${totalPrice}</span>
                </PriceRow>
              </PriceBreakdown>
            )}

            {/* Cancellation Policy */}
            {listing.cancellationPolicy && (
              <FormSection>
                <SectionTitle>
                  <FaShieldAlt /> Cancellation policy
                </SectionTitle>
                <InfoText style={{ color: airbnbDark, fontWeight: 500 }}>
                  {listing.cancellationPolicy}
                </InfoText>
              </FormSection>
            )}

            {/* Error Message */}
            {error && (
              <Alert variant="danger" style={{ marginBottom: '16px' }}>
                {error}
              </Alert>
            )}

            {/* Submit Button */}
            <SubmitButton type="submit" disabled={loading || totalPrice === 0}>
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" style={{ marginRight: '8px' }} />
                  Creating booking...
                </>
              ) : (
                `Book now with ${paymentMethod === 'cashapp' ? 'Cash App Pay' : 'Credit Card'} • $${totalPrice}`
              )}
            </SubmitButton>
          </form>
        </FormContent>
      </ModalContent>
    </ModalOverlay>
  );
};

export default BookingForm; 