import React from 'react';
import styled from 'styled-components';

const SuccessMessage = styled.div`
  color: #155724;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  padding: 12px;
  margin-top: 16px;
  font-size: 0.9rem;
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 12px;
  margin-top: 16px;
  font-size: 0.9rem;
`;

const StatusMessage = ({ type, message }) => {
  if (!message) return null;

  return type === 'success' ? (
    <SuccessMessage>{message}</SuccessMessage>
  ) : (
    <ErrorMessage>{message}</ErrorMessage>
  );
};

export default StatusMessage; 