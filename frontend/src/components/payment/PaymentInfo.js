import React from 'react';
import styled from 'styled-components';

const PaymentInfoContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  border: 1px solid #e9ecef;
`;

const PaymentRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
    border-top: 1px solid #e9ecef;
    padding-top: 8px;
    font-weight: 600;
  }
`;

const PaymentInfo = ({ booking }) => {
  if (!booking || !booking.payment) return null;

  return (
    <PaymentInfoContainer>
      <PaymentRow>
        <span>Payment Amount:</span>
        <span>${booking.payment.amount}</span>
      </PaymentRow>
      <PaymentRow>
        <span>Platform Fee:</span>
        <span>${booking.payment.platformFee}</span>
      </PaymentRow>
      <PaymentRow>
        <span>Processing Fee:</span>
        <span>${booking.payment.processingFee}</span>
      </PaymentRow>
      <PaymentRow>
        <span>Your Payout:</span>
        <span>${booking.payment.hostAmount}</span>
      </PaymentRow>
    </PaymentInfoContainer>
  );
};

export default PaymentInfo; 