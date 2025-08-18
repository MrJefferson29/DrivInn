import React, { useEffect, useState } from 'react';
import { hostApplicationsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaArrowLeft, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaClock, 
  FaEdit, 
  FaFileAlt,
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaIdCard,
  FaCreditCard,
  FaHome,
  FaSpinner,
  FaInfoCircle,
  FaExclamationTriangle,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { Spinner, Alert, Badge } from 'react-bootstrap';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 60px 24px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  
  @media (max-width: 1024px) {
    max-width: 100%;
    padding: 50px 20px;
  }
  
  @media (max-width: 768px) {
    padding: 40px 20px;
  }
  
  @media (max-width: 480px) {
    padding: 32px 16px;
  }
  
  @media (max-width: 360px) {
    padding: 24px 12px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 40px;
  padding: 24px 0;
  
  @media (max-width: 1024px) {
    gap: 18px;
    margin-bottom: 36px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 16px;
    margin-bottom: 32px;
  }
  
  @media (max-width: 480px) {
    gap: 14px;
    margin-bottom: 28px;
    padding: 20px 0;
  }
  
  @media (max-width: 360px) {
    gap: 12px;
    margin-bottom: 24px;
    padding: 16px 0;
  }
`;

const BackButton = styled.button`
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid #e9ecef;
  color: #495057;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  padding: 12px 20px;
  border-radius: 12px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
  
  &:hover {
    background: white;
    color: #FF385C;
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 1024px) {
    padding: 11px 18px;
    font-size: 0.95rem;
  }
  
  @media (max-width: 768px) {
    padding: 10px 16px;
    font-size: 0.9rem;
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    padding: 9px 14px;
    font-size: 0.85rem;
    gap: 6px;
  }
  
  @media (max-width: 360px) {
    padding: 8px 12px;
    font-size: 0.8rem;
    gap: 5px;
  }
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  color: #2c3e50;
  margin: 0;
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 1024px) {
    font-size: 2.75rem;
  }
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
  
  @media (max-width: 480px) {
    font-size: 2rem;
  }
  
  @media (max-width: 360px) {
    font-size: 1.75rem;
  }
`;

const StatusCard = styled.div`
  background: white;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  margin-bottom: 32px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.16);
  }
  
  @media (max-width: 1024px) {
    border-radius: 20px;
    margin-bottom: 28px;
  }
  
  @media (max-width: 768px) {
    border-radius: 18px;
    margin-bottom: 24px;
  }
  
  @media (max-width: 480px) {
    border-radius: 16px;
    margin-bottom: 20px;
  }
  
  @media (max-width: 360px) {
    border-radius: 14px;
    margin-bottom: 16px;
  }
`;

const StatusHeader = styled.div`
  padding: 48px 40px;
  background: ${props => {
    if (props.status === 'approved') return 'linear-gradient(135deg, #28a745 0%, #20c997 100%)';
    if (props.status === 'declined') return 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)';
    return 'linear-gradient(135deg, #ffc107 0%, #ffca2c 100%)';
  }};
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }
  
  @media (max-width: 1024px) {
    padding: 40px 32px;
  }
  
  @media (max-width: 768px) {
    padding: 32px 24px;
  }
  
  @media (max-width: 480px) {
    padding: 28px 20px;
  }
  
  @media (max-width: 360px) {
    padding: 24px 16px;
  }
`;

const StatusTitle = styled.h2`
  font-size: 2.25rem;
  font-weight: 700;
  color: white;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 2;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  
  @media (max-width: 1024px) {
    font-size: 2rem;
    gap: 14px;
  }
  
  @media (max-width: 768px) {
    font-size: 1.875rem;
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.625rem;
    gap: 10px;
    margin-bottom: 12px;
  }
  
  @media (max-width: 360px) {
    font-size: 1.5rem;
    gap: 8px;
    margin-bottom: 10px;
  }
`;

const StatusSubtitle = styled.p`
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 20px 0;
  font-size: 1.25rem;
  font-weight: 500;
  line-height: 1.6;
  position: relative;
  z-index: 2;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
  
  @media (max-width: 1024px) {
    font-size: 1.2rem;
    margin-bottom: 18px;
  }
  
  @media (max-width: 768px) {
    font-size: 1.125rem;
    margin-bottom: 16px;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
    margin-bottom: 14px;
    line-height: 1.5;
  }
  
  @media (max-width: 360px) {
    font-size: 0.95rem;
    margin-bottom: 12px;
  }
`;

const StatusBadge = styled(Badge)`
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  z-index: 2;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 2px solid rgba(255, 255, 255, 0.3);
  
  &.pending {
    background: #ffc107 !important;
    color: #212529 !important;
  }
  
  &.approved {
    background: rgba(255, 255, 255, 0.2) !important;
    color: white !important;
    backdrop-filter: blur(10px);
  }
  
  &.declined {
    background: rgba(255, 255, 255, 0.2) !important;
    color: white !important;
    backdrop-filter: blur(10px);
  }
  
  @media (max-width: 1024px) {
    padding: 11px 22px;
    font-size: 0.95rem;
  }
  
  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
  
  @media (max-width: 480px) {
    padding: 9px 18px;
    font-size: 0.85rem;
    border-radius: 22px;
  }
  
  @media (max-width: 360px) {
    padding: 8px 16px;
    font-size: 0.8rem;
    border-radius: 20px;
  }
`;

const StatusContent = styled.div`
  padding: 40px;
  
  @media (max-width: 1024px) {
    padding: 36px 32px;
  }
  
  @media (max-width: 768px) {
    padding: 32px 24px;
  }
  
  @media (max-width: 480px) {
    padding: 24px 20px;
  }
  
  @media (max-width: 360px) {
    padding: 20px 16px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #222222;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.div`
  font-weight: 600;
  color: #6c757d;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.div`
  color: #222222;
  font-size: 1rem;
`;

const AdminNoteSection = styled.div`
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
  border: 1px solid #ffc107;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  box-shadow: 0 4px 16px rgba(255, 193, 7, 0.15);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, #ffc107, #ffca2c);
  }
  
  @media (max-width: 1024px) {
    padding: 20px;
    margin-bottom: 28px;
    border-radius: 14px;
  }
  
  @media (max-width: 768px) {
    padding: 18px;
    margin-bottom: 24px;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    margin-bottom: 20px;
    border-radius: 10px;
  }
  
  @media (max-width: 360px) {
    padding: 14px;
    margin-bottom: 16px;
    border-radius: 8px;
  }
`;

const AdminNoteHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #856404;
  
  @media (max-width: 480px) {
    gap: 6px;
    margin-bottom: 6px;
    font-size: 0.9rem;
  }
  
  @media (max-width: 360px) {
    gap: 5px;
    margin-bottom: 5px;
    font-size: 0.85rem;
  }
`;

const AdminNoteText = styled.div`
  color: #856404;
  line-height: 1.5;
  
  @media (max-width: 1024px) {
    line-height: 1.4;
  }
  
  @media (max-width: 768px) {
    line-height: 1.4;
  }
  
  @media (max-width: 480px) {
    line-height: 1.3;
    font-size: 0.9rem;
  }
  
  @media (max-width: 360px) {
    line-height: 1.3;
    font-size: 0.85rem;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 32px;
  flex-wrap: wrap;
  justify-content: center;
  
  @media (max-width: 1024px) {
    gap: 14px;
    margin-top: 28px;
  }
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 12px;
    margin-top: 24px;
  }
  
  @media (max-width: 480px) {
    gap: 10px;
    margin-top: 20px;
  }
  
  @media (max-width: 360px) {
    gap: 8px;
    margin-top: 16px;
  }
`;

const Button = styled.button`
  padding: 16px 32px;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &.primary {
    background: linear-gradient(135deg, #FF385C 0%, #e31c5f 100%);
    color: white;
    
    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #e31c5f 0%, #c81e3e 100%);
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(255, 56, 92, 0.4);
    }
  }
  
  &.secondary {
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    color: #495057;
    border: 1px solid #dee2e6;
    
    &:hover {
      background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 1024px) {
    padding: 14px 28px;
    font-size: 1rem;
    gap: 10px;
  }
  
  @media (max-width: 768px) {
    padding: 12px 24px;
    font-size: 0.95rem;
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    padding: 10px 20px;
    font-size: 0.9rem;
    gap: 6px;
    border-radius: 10px;
  }
  
  @media (max-width: 360px) {
    padding: 8px 16px;
    font-size: 0.85rem;
    gap: 5px;
    border-radius: 8px;
  }
`;

const InfoBox = styled.div`
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border: 1px solid #2196f3;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  box-shadow: 0 4px 16px rgba(33, 150, 243, 0.15);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(33, 150, 243, 0.2);
  }
  
  @media (max-width: 1024px) {
    padding: 20px;
    margin-bottom: 28px;
    gap: 14px;
  }
  
  @media (max-width: 768px) {
    padding: 18px;
    margin-bottom: 24px;
    gap: 12px;
    border-radius: 14px;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    margin-bottom: 20px;
    gap: 10px;
    border-radius: 12px;
    flex-direction: column;
    text-align: center;
  }
  
  @media (max-width: 360px) {
    padding: 14px;
    margin-bottom: 16px;
    gap: 8px;
    border-radius: 10px;
  }
`;

const InfoIcon = styled(FaInfoCircle)`
  color: #2196f3;
  font-size: 1.5rem;
  margin-top: 4px;
  flex-shrink: 0;
  
  @media (max-width: 1024px) {
    font-size: 1.4rem;
  }
  
  @media (max-width: 768px) {
    font-size: 1.3rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.2rem;
    margin-top: 0;
  }
  
  @media (max-width: 360px) {
    font-size: 1.1rem;
  }
`;

const InfoText = styled.div`
  color: #1976d2;
  font-size: 1rem;
  line-height: 1.6;
  font-weight: 500;
  
  strong {
    color: #1565c0;
    font-weight: 700;
  }
  
  @media (max-width: 1024px) {
    font-size: 0.95rem;
    line-height: 1.5;
  }
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    line-height: 1.5;
  }
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
    line-height: 1.4;
  }
  
  @media (max-width: 360px) {
    font-size: 0.8rem;
    line-height: 1.4;
  }
`;

const StripeOnboardingButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 20px 40px;
  border-radius: 16px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.4);
  margin: 24px 0;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px rgba(102, 126, 234, 0.5);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(-2px);
  }
  
  svg {
    font-size: 1.3rem;
  }
  
  @media (max-width: 1024px) {
    padding: 18px 36px;
    font-size: 1.1rem;
    gap: 14px;
    margin: 20px 0;
  }
  
  @media (max-width: 768px) {
    padding: 16px 32px;
    font-size: 1rem;
    gap: 12px;
    margin: 18px 0;
    border-radius: 14px;
  }
  
  @media (max-width: 480px) {
    padding: 14px 28px;
    font-size: 0.95rem;
    gap: 10px;
    margin: 16px 0;
    border-radius: 12px;
    flex-direction: column;
    text-align: center;
  }
  
  @media (max-width: 360px) {
    padding: 12px 24px;
    font-size: 0.9rem;
    gap: 8px;
    margin: 14px 0;
    border-radius: 10px;
  }
`;

const StripeOnboardingSection = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  border-radius: 20px;
  padding: 32px;
  margin-top: 32px;
  margin-bottom: 32px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea, #764ba2, #667eea);
    background-size: 200% 100%;
    animation: shimmer 2s ease-in-out infinite;
  }
  
  @keyframes shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }
`;

const StripeOnboardingTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 1;
`;

const StripeOnboardingDescription = styled.p`
  color: #495057;
  font-size: 1.1rem;
  margin-bottom: 24px;
  line-height: 1.7;
  font-weight: 500;
  position: relative;
  z-index: 1;
`;

const StripeOnboardingSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-top: 24px;
`;

const StepItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 16px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.9);
    transform: translateX(8px);
    box-shadow: 0 4px 16px rgba(102, 126, 234, 0.15);
  }
  
  @media (max-width: 1024px) {
    gap: 18px;
    padding: 18px;
    border-radius: 14px;
  }
  
  @media (max-width: 768px) {
    gap: 16px;
    padding: 16px;
    border-radius: 12px;
    
    &:hover {
      transform: translateX(4px);
    }
  }
  
  @media (max-width: 480px) {
    gap: 14px;
    padding: 14px;
    border-radius: 10px;
    flex-direction: column;
    text-align: center;
    
    &:hover {
      transform: translateY(-2px);
    }
  }
  
  @media (max-width: 360px) {
    gap: 12px;
    padding: 12px;
    border-radius: 8px;
  }
`;

const StepNumber = styled.div`
  background: linear-gradient(135deg, #FF385C 0%, #e31c5f 100%);
  color: white;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(255, 56, 92, 0.3);
  flex-shrink: 0;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: -2px;
    left: -2px;
    right: -2px;
    bottom: -2px;
    background: linear-gradient(135deg, #FF385C, #e31c5f);
    border-radius: 50%;
    z-index: -1;
    opacity: 0.3;
  }
  
  @media (max-width: 1024px) {
    width: 34px;
    height: 34px;
    font-size: 1rem;
  }
  
  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    font-size: 0.95rem;
  }
  
  @media (max-width: 480px) {
    width: 30px;
    height: 30px;
    font-size: 0.9rem;
    align-self: center;
  }
  
  @media (max-width: 360px) {
    width: 28px;
    height: 28px;
    font-size: 0.85rem;
  }
`;

const StepContent = styled.div`
  flex-grow: 1;
`;

const StepTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
  position: relative;
  z-index: 1;
`;

const StepDescription = styled.p`
  color: #6c757d;
  font-size: 1rem;
  margin-bottom: 0;
  line-height: 1.6;
  font-weight: 500;
  position: relative;
  z-index: 1;
`;

const HostApplicationStatus = () => {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const response = await hostApplicationsAPI.getMy();
        if (response.data) {
          setApplication(response.data);
        } else {
          setError('No application found');
        }
    } catch (err) {
        console.error('Error fetching application:', err);
        setError('Failed to load application');
    } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FaCheckCircle />;
      case 'declined':
        return <FaTimesCircle />;
      default:
        return <FaClock />;
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'approved':
        return 'Your application has been approved! You can now start hosting.';
      case 'declined':
        return 'Your application has been declined. Please review the feedback and consider applying again.';
      default:
        return 'Your application is currently under review. We\'ll notify you once a decision has been made.';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'declined':
        return 'danger';
      default:
        return 'warning';
    }
  };

  if (loading) {
    return (
      <Container>
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <FaSpinner className="fa-spin" style={{ fontSize: '2rem', color: '#FF385C' }} />
          <p style={{ marginTop: '16px', color: '#6c757d' }}>Loading application status...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </BackButton>
          <Title>Application Status</Title>
        </Header>

        <Alert variant="danger">
          {error}
        </Alert>
        
        <Button className="secondary" onClick={() => navigate('/become-a-host')}>
          Apply Now
          </Button>
      </Container>
    );
  }

  if (!application) {
  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </BackButton>
        <Title>Application Status</Title>
      </Header>

        <Alert variant="info">
          No application found. Please submit an application to get started.
        </Alert>
        
        <Button className="primary" onClick={() => navigate('/become-a-host')}>
          Apply Now
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <FaArrowLeft /> Back
        </BackButton>
        <Title>Application Status</Title>
      </Header>

      <StatusCard>
        <StatusHeader status={application.status}>
          <StatusTitle>
            {getStatusIcon(application.status)}
            Application Status
          </StatusTitle>
          <StatusSubtitle>{getStatusMessage(application.status)}</StatusSubtitle>
          <StatusBadge className={application.status}>
            {application.status}
          </StatusBadge>
        </StatusHeader>

        <StatusContent>
          {/* Step 1: Basic Status Information */}
          {!showDetails && (
            <>
              {application.adminNote && (
                <AdminNoteSection>
                  <AdminNoteHeader>
                    {application.status === 'approved' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                    {application.status === 'approved' ? 'Approval Note' : 'Admin Note'}
                  </AdminNoteHeader>
                  <AdminNoteText>{application.adminNote}</AdminNoteText>
                </AdminNoteSection>
              )}

              {application.status === 'pending' && (
                <InfoBox>
                  <InfoIcon />
                  <InfoText>
                    <strong>What happens next?</strong> Your application is currently under review by our team. 
                    We typically review applications within 2-3 business days. You'll receive a notification 
                    once a decision has been made.
                  </InfoText>
                </InfoBox>
              )}

              {application.status === 'approved' && (
                <InfoBox>
                  <InfoIcon />
                  <InfoText>
                    <strong>Congratulations!</strong> Your application has been approved.follow the next steps before you can start 
                    creating listings and hosting guests. We'll help you set up your payment methods for 
                    receiving payouts.
                  </InfoText>
                </InfoBox>
              )}

              {application.status === 'declined' && (
                <InfoBox>
                  <InfoIcon />
                  <InfoText>
                    <strong>Next steps:</strong> Please review the feedback provided and consider applying again 
                    with updated information. If you have questions about the decision, please contact our support team.
                  </InfoText>
                </InfoBox>
              )}

              <ActionButtons>
                {application.status === 'approved' && (
                  <Button 
                    className="primary" 
                    onClick={() => setShowDetails(true)}
                  >
                    Next Step
                  </Button>
                )}
                
                {application.status === 'pending' && (
                  <Button 
                    className="primary" 
                    onClick={() => navigate('/become-a-host/edit', { 
                      state: { editMode: true, applicationData: application } 
                    })}
                  >
                    <FaEdit /> Edit Application
                  </Button>
                )}
                
                {application.status === 'declined' && (
                  <Button 
                    className="primary" 
                    onClick={() => navigate('/become-a-host', { 
                      state: { editMode: true, applicationData: application } 
                    })}
                  >
                    <FaEdit /> Apply Again
                  </Button>
                )}
                
                <Button className="secondary" onClick={() => navigate(-1)}>
                  Back
                </Button>
              </ActionButtons>
            </>
          )}

                        {/* Step 2: Stripe Setup Only */}
              {showDetails && (
                <>
                  <Button 
                    className="secondary" 
                    onClick={() => setShowDetails(false)}
                    style={{ marginBottom: '24px' }}
                  >
                    ← Back to Status
                  </Button>

                  {/* Stripe Setup Section for Approved Applications */}
                  {application.status === 'approved' && application.stripeRemediationLink && (
                    <StripeOnboardingSection>
                      <StripeOnboardingTitle>
                        <FaCreditCard /> Complete Your Stripe Account Setup
                      </StripeOnboardingTitle>
                      <StripeOnboardingDescription>
                        Your application has been approved! To start receiving payments from guests, you need to complete your Stripe Connect account setup.
                        This process includes identity verification and bank account setup.
                      </StripeOnboardingDescription>
                      
                      <StripeOnboardingButton 
                        onClick={() => window.open(application.stripeRemediationLink, '_blank')}
                      >
                        <FaExternalLinkAlt />
                        Complete Stripe Verification & Start Earning
                      </StripeOnboardingButton>
                      
                      <StripeOnboardingSteps>
                        <StepItem>
                          <StepNumber>1</StepNumber>
                          <StepContent>
                            <StepTitle>Click the Button Above</StepTitle>
                            <StepDescription>
                              This will open Stripe's secure onboarding process in a new tab
                            </StepDescription>
                          </StepContent>
                        </StepItem>
                        
                        <StepItem>
                          <StepNumber>2</StepNumber>
                          <StepContent>
                            <StepTitle>Verify Your Identity</StepTitle>
                            <StepDescription>
                              Stripe will guide you through identity verification, including document uploads
                            </StepDescription>
                          </StepContent>
                        </StepItem>
                        
                        <StepItem>
                          <StepNumber>3</StepNumber>
                          <StepContent>
                            <StepTitle>Add Bank Account</StepTitle>
                            <StepDescription>
                              Connect your bank account to receive payouts from guest bookings
                            </StepDescription>
                          </StepContent>
                        </StepItem>
                        
                        <StepItem>
                          <StepNumber>4</StepNumber>
                          <StepContent>
                            <StepTitle>Start Hosting!</StepTitle>
                            <StepDescription>
                              Once complete, you can start listing your property and accepting bookings
                            </StepDescription>
                          </StepContent>
                        </StepItem>
                      </StripeOnboardingSteps>
                    </StripeOnboardingSection>
                  )}

              <ActionButtons>
                <Button className="secondary" onClick={() => navigate(-1)}>
                  Back
                </Button>
              </ActionButtons>
            </>
          )}
        </StatusContent>
      </StatusCard>
    </Container>
  );
};

export default HostApplicationStatus; 