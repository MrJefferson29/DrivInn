import React from 'react';
import styled from 'styled-components';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';

const CheckInButton = styled.button`
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover:not(:disabled) {
    background: #218838;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const CheckInAction = ({ onCheckIn, loading }) => (
  <CheckInButton onClick={onCheckIn} disabled={loading}>
    {loading ? (
      <>
        <FaSpinner className="fa-spin" />
        Processing...
      </>
    ) : (
      <>
        <FaCheckCircle />
        Confirm Check-In & Release Payment
      </>
    )}
  </CheckInButton>
);

export default CheckInAction; 