import React from 'react';
import styled from 'styled-components';
import { FaMoneyBillWave } from 'react-icons/fa';

const CheckInHeaderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const CheckInTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #222222;
  margin: 0;
`;

const CheckInDescription = styled.p`
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 16px 0;
`;

const CheckInHeader = ({ title, description }) => (
  <>
    <CheckInHeaderContainer>
      <FaMoneyBillWave style={{ color: '#28a745' }} />
      <CheckInTitle>{title}</CheckInTitle>
    </CheckInHeaderContainer>
    
    <CheckInDescription>
      {description}
    </CheckInDescription>
  </>
);

export default CheckInHeader; 