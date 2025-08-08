import React from 'react';
import styled from 'styled-components';
import PaymentInfo from './payment/PaymentInfo';
import CheckInAction from './payment/CheckInAction';
import CheckInHeader from './payment/CheckInHeader';
import StatusMessage from './payment/StatusMessage';
import { useCheckIn } from '../hooks/useCheckIn';

// Styled Components
const CheckInContainer = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  margin: 16px 0;
  border: 1px solid #e9ecef;
`;

// Main Check-In Button Component
const CheckInButtonComponent = ({ booking, onCheckInSuccess }) => {
  const { loading, success, error, handleCheckIn } = useCheckIn(booking, onCheckInSuccess);

  // Only show if payment is in escrow
  if (!booking || booking.payment.status !== 'in_escrow') {
    return null;
  }

  return (
    <CheckInContainer>
      <CheckInHeader 
        title="Guest Check-In"
        description="Confirm that the guest has checked in to release the payment to your account."
      />
      
      <PaymentInfo booking={booking} />
      
      <CheckInAction onCheckIn={handleCheckIn} loading={loading} />
      
      <StatusMessage type="success" message={success} />
      <StatusMessage type="error" message={error} />
    </CheckInContainer>
  );
};

export default CheckInButtonComponent;