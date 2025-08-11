import React, { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { Spinner, Alert, Button } from 'react-bootstrap';
import {
  FaArrowLeft, 
  FaMapMarkerAlt, 
  FaStar, 
  FaHeart, 
  FaShare, 
  FaUser, 
  FaPhone, 
  FaEnvelope,
  FaBed,
  FaBath,
  FaUsers,
  FaHome,
  FaCar,
  FaCalendarAlt,
  FaDollarSign,
  FaWifi,
  FaParking,
  FaSnowflake,
  FaUtensils,
  FaTv,
  FaSwimmingPool,
  FaDumbbell,
  FaDog,
  FaSmokingBan,
  FaCheck,
  FaBan,
  FaClock,
  FaEye,
  FaLeaf,
  FaGem,
  FaSyncAlt,
  FaKey,
  FaRegCalendarCheck,
  FaRegListAlt,
  FaRegStar,
  FaBolt,
  FaFireExtinguisher,
  FaWheelchair,
  FaHotTub,
  FaCoffee,
  FaBriefcase,
  FaPaw,
  FaUserShield,
  FaCamera,
  FaBell,
  FaChild,
  FaShoePrints,
  FaIdCard,
  FaRedo,
  FaUserFriends,
  FaUserCheck,
  FaUserTimes,
  FaUserSecret,
  FaCarCrash,
  FaApple,
  FaAndroid,
  FaSun,
  FaCloud,
  FaUmbrellaBeach,
  FaBacon,
  FaShieldAlt,
  FaChevronLeft,
  FaChevronRight,
  FaCheckCircle,
  FaGlobe,
  FaCompass,
  FaTrash,
  FaUpload,
  FaEdit,
  FaArrowUp,
  FaBluetooth,
  FaFlagCheckered,
  FaCarSide,
  FaGasPump,
  FaRoad,
  FaPalette,
  FaTools,
  FaDoorOpen,
  FaRegClock,
  FaRegCalendarAlt,
  FaTimes,
  FaCog,
  FaChartBar,
  FaHistory
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useMediaQuery } from 'react-responsive';
import BookingForm from './BookingForm';
import LikeButton from './LikeButton';
import ChatScreen from './ChatScreen';

// Airbnb color palette
const airbnbRed = '#FF385C';
const airbnbDark = '#222222';
const airbnbGray = '#717171';
const airbnbLightGray = '#F7F7F7';
const airbnbBorder = '#DDDDDD';

// Styled Components
const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px;
  
  @media (max-width: 1200px) {
    padding: 0 24px;
  }
  
  @media (max-width: 768px) {
    padding: 0 16px;
    padding-bottom: 200px; /* More space for fixed booking card */
  }
  
  @media (max-width: 480px) {
    padding: 0 12px;
    padding-bottom: 180px; /* More space for smaller screens */
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${airbnbDark};
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  padding: 12px 0;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${airbnbRed};
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 12px;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  
  .spinner-border {
    color: ${airbnbRed};
  }
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 60px 20px;
  
  @media (max-width: 768px) {
    padding: 40px 16px;
  }
`;

// Hero Section
const HeroSection = styled.section`
  margin-bottom: 48px;
  
  @media (max-width: 768px) {
    margin-bottom: 32px;
  }
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 8px;
  height: 600px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 32px;
  position: relative;
  
  @media (max-width: 1200px) {
    height: 500px;
  }
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    height: 450px;
  }
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    grid-template-rows: repeat(4, 1fr);
    height: 350px;
    gap: 4px;
    border-radius: 12px;
  }
`;

const MasonryImageGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 8px;
  height: 600px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 32px;
  position: relative;
  
  /* Masonry layout for 5 images */
  .main-image {
    grid-column: 1;
    grid-row: 1 / 3;
  }
  
  .top-right {
    grid-column: 2;
    grid-row: 1;
  }
  
  .bottom-right {
    grid-column: 2;
    grid-row: 2;
  }
  
  .bottom-left {
    grid-column: 3;
    grid-row: 1;
  }
  
  .fifth-image {
    grid-column: 3;
    grid-row: 2;
  }
  
  @media (max-width: 1200px) {
    height: 500px;
  }
  
  @media (max-width: 900px) {
    height: 450px;
    gap: 6px;
    
    .main-image {
      grid-column: 1;
      grid-row: 1 / 3;
    }
    
    .top-right {
      grid-column: 2;
      grid-row: 1;
    }
    
    .bottom-right {
      grid-column: 2;
      grid-row: 2;
    }
    
    .bottom-left {
      grid-column: 3;
      grid-row: 1;
    }
    
    .fifth-image {
      grid-column: 3;
      grid-row: 2;
    }
  }
  
  @media (max-width: 600px) {
    height: 300px;
    gap: 4px;
    border-radius: 12px;
    
    .main-image {
      grid-column: 1;
      grid-row: 1 / 3;
    }
    
    .top-right {
      grid-column: 2;
      grid-row: 1;
    }
    
    .bottom-right {
      grid-column: 2;
      grid-row: 2;
    }
    
    .bottom-left {
      grid-column: 3;
      grid-row: 1;
    }
    
    .fifth-image {
      grid-column: 3;
      grid-row: 2;
    }
  }
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
  }
`;

const MainImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
  }
`;

const SideImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.02);
  }
`;

const ShowAllPhotosButton = styled.button`
  position: absolute;
  bottom: 24px;
  right: 24px;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
  
  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
    padding: 10px 16px;
    font-size: 14px;
  }
`;

const HeroContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 32px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
    margin-bottom: 24px;
  }
`;

const TitleSection = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 2.75rem;
  font-weight: 600;
  color: ${airbnbDark};
  margin-bottom: 12px;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 8px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
`;

const Location = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: ${airbnbGray};
  font-size: 1.2rem;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
    margin-bottom: 16px;
  }
`;

const RatingSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    margin-bottom: 16px;
  }
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 600;
  color: ${airbnbDark};
  font-size: 1.1rem;
`;

const StarIcon = styled(FaStar)`
  color: ${airbnbRed};
  font-size: 1.2rem;
`;

const ReviewsCount = styled.span`
  color: ${airbnbGray};
  text-decoration: underline;
  cursor: pointer;
  font-size: 1.1rem;
  
  &:hover {
    color: ${airbnbDark};
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  
  @media (max-width: 768px) {
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: 1px solid ${airbnbBorder};
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    border-color: ${airbnbDark};
    background: ${airbnbLightGray};
  }
  
  @media (max-width: 480px) {
    padding: 10px 16px;
    font-size: 14px;
    gap: 6px;
  }
`;

// Image Modal
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
`;

const ModalImage = styled.img`
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: -40px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  padding: 8px;
  
  &:hover {
    opacity: 0.8;
  }
`;

const ModalNavButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: white;
  }
  
  &.prev {
    left: -50px;
  }
  
  &.next {
    right: -50px;
  }
  
  @media (max-width: 768px) {
    &.prev {
      left: 10px;
    }
    
    &.next {
      right: 10px;
    }
  }
`;

// Main Content Sections
const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 80px;
  margin-bottom: 40px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  @media (max-width: 768px) {
    gap: 24px;
    margin-bottom: 24px;
  }
`;

const MainContent = styled.div`
  /* Main content area */
`;

const Sidebar = styled.div`
  position: sticky;
  top: 100px;
  height: fit-content;
  
  @media (max-width: 1024px) {
    position: static;
  }
`;

// Info Grid
const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
    margin-bottom: 24px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 10px;
  }
`;

const InfoCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid ${airbnbBorder};
  
  @media (max-width: 768px) {
    padding: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const InfoLabel = styled.div`
  color: ${airbnbGray};
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    margin-bottom: 6px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin-bottom: 4px;
  }
`;

const InfoValue = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${airbnbDark};
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

// Description Section
const DescriptionSection = styled.section`
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${airbnbDark};
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
    margin-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.1rem;
    margin-bottom: 10px;
  }
`;

const Description = styled.p`
  font-size: 1.1rem;
  line-height: 1.6;
  color: ${airbnbDark};
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

// Host Section
const HostSection = styled.section`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid ${airbnbBorder};
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    padding: 20px;
    margin-bottom: 24px;
  }
`;

const HostInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    gap: 12px;
    margin-bottom: 16px;
  }
`;

const HostAvatar = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, ${airbnbRed} 0%, #e31c5f 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  font-weight: 600;
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    font-size: 1.25rem;
  }
`;

const HostDetails = styled.div`
  flex: 1;
`;

const HostName = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${airbnbDark};
  margin-bottom: 4px;
`;

const HostStatus = styled.div`
  color: ${airbnbGray};
  font-size: 0.9rem;
`;

const HostActions = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const HostButton = styled.button`
  background: none;
  border: 1px solid ${airbnbBorder};
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &:hover {
    border-color: ${airbnbDark};
  }
  
  &.primary {
    background: ${airbnbRed};
    color: white;
    border-color: ${airbnbRed};
    
    &:hover {
      background: #e31c5f;
    }
  }
  
  @media (max-width: 480px) {
    padding: 6px 12px;
    font-size: 0.85rem;
  }
`;

// Booking Card
const BookingCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid ${airbnbBorder};
  position: sticky;
  top: 100px;
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  }
  
  @media (max-width: 1024px) {
    position: static;
    margin-top: 32px;
  }
  
  @media (max-width: 768px) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: auto;
    border-radius: 16px 16px 0 0;
    box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
    border: 1px solid ${airbnbBorder};
    border-bottom: none;
    z-index: 1000;
    padding: 20px;
    margin-top: 0;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
    border-radius: 12px 12px 0 0;
  }
  
  @media (max-width: 480px) {
    display: none;
  }
`;

const PriceSection = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 20px;
`;

const Price = styled.span`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${airbnbDark};
`;

const PricePeriod = styled.span`
  color: ${airbnbGray};
  font-size: 1rem;
`;

const BookingButton = styled.button`
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
  
  &:hover {
    background: #e31c5f;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: ${airbnbGray};
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 12px;
    font-size: 0.95rem;
  }
  
  @media (max-width: 480px) {
    padding: 10px;
    font-size: 0.9rem;
  }
`;

// Amenities Section
const AmenitiesSection = styled.section`
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`;

const AmenitiesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const AmenityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  
  &:hover {
    background: ${airbnbLightGray};
    border-color: ${airbnbBorder};
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    padding: 12px;
    gap: 8px;
  }
  
  @media (max-width: 480px) {
    padding: 10px;
    gap: 6px;
  }
`;

const AmenityIcon = styled.div`
  color: ${airbnbRed};
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    width: 20px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    width: 18px;
  }
`;

const AmenityText = styled.span`
  font-size: 1rem;
  color: ${airbnbDark};
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
    font-weight: 500;
  }
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
    font-weight: 400;
  }
`;

// Mobile Amenities Modal
const MobileAmenitiesModal = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 20px 20px 0 0;
  padding: 24px;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15);
  z-index: 2000;
  transform: translateY(${props => props.isOpen ? '0' : '100%'});
  transition: transform 0.3s ease;
  max-height: 80vh;
  overflow-y: auto;
  
  @media (max-width: 480px) {
    padding: 20px;
    border-radius: 16px 16px 0 0;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid ${airbnbBorder};
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${airbnbDark};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${airbnbGray};
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: ${airbnbDark};
  }
`;

const SeeMoreButton = styled.button`
  background: none;
  border: 1px solid ${airbnbBorder};
  padding: 12px 20px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: ${airbnbDark};
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 16px;
  width: 100%;
  
  &:hover {
    border-color: ${airbnbDark};
    background: ${airbnbLightGray};
  }
  
  @media (max-width: 480px) {
    padding: 10px 16px;
    font-size: 0.85rem;
  }
`;

const AmenitiesModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1999;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
`;

// Host Dashboard Components
const DashboardSection = styled.section`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid ${airbnbBorder};
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    padding: 24px;
    margin-bottom: 24px;
  }
  
  @media (max-width: 480px) {
    padding: 20px;
  }
`;

const DashboardTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 600;
  color: ${airbnbDark};
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const StatCard = styled.div`
  background: ${airbnbLightGray};
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  border: 1px solid ${airbnbBorder};
  
  @media (max-width: 768px) {
    padding: 20px;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${airbnbRed};
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: ${airbnbGray};
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const BookingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

const BookingList = styled.div`
  background: ${airbnbLightGray};
  border-radius: 12px;
  padding: 20px;
  border: 1px solid ${airbnbBorder};
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const BookingListTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${airbnbDark};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 12px;
  }
`;

const BookingItem = styled.div`
  background: white;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  border: 1px solid ${airbnbBorder};
  
  &:last-child {
    margin-bottom: 0;
  }
  
  @media (max-width: 768px) {
    padding: 12px;
    margin-bottom: 8px;
  }
`;

const BookingGuest = styled.div`
  font-weight: 600;
  color: ${airbnbDark};
  margin-bottom: 4px;
  
  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const BookingDates = styled.div`
  font-size: 0.9rem;
  color: ${airbnbGray};
  margin-bottom: 4px;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const BookingPrice = styled.div`
  font-weight: 600;
  color: ${airbnbRed};
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${airbnbGray};
  
  @media (max-width: 768px) {
    padding: 30px 16px;
  }
`;

const DashboardActions = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const HostActionButton = styled.button`
  background: ${airbnbRed};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #e31c5f;
    transform: translateY(-1px);
  }
  
  &.secondary {
    background: white;
    color: ${airbnbDark};
    border: 1px solid ${airbnbBorder};
    
    &:hover {
      background: ${airbnbLightGray};
    }
  }
  
  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
`;

// Rules Section
const RulesSection = styled.section`
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    margin-bottom: 24px;
  }
`;

const RulesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const RuleItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: 12px;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  
  &:hover {
    background: ${airbnbLightGray};
    border-color: ${airbnbBorder};
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const RuleIcon = styled.div`
  color: ${airbnbGray};
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
`;

const RuleText = styled.span`
  font-size: 1rem;
  color: ${airbnbDark};
`;

// Map Section
const MapSection = styled.section`
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
  margin-bottom: 24px;
  }
`;

const MapContainer = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid ${airbnbBorder};
  height: 300px;
  
  @media (max-width: 768px) {
    height: 250px;
  }
`;

const MapPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${airbnbLightGray};
  color: ${airbnbGray};
  font-size: 1.1rem;
`;

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatRoomId, setChatRoomId] = useState(null);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Fetch listing data
  useEffect(() => {
    setLoading(true);
    setError('');
    
    fetch(`http://localhost:5000/listings/${id}`)
      .then(async res => {
        if (!res.ok) {
          let message = res.statusText;
          try {
            const data = await res.json();
            message = data.message || message;
          } catch {
            // Not JSON, ignore
          }
          throw new Error(message || 'Listing not found');
        }
        return res.json();
      })
      .then(data => {
        setListing(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Error loading listing');
        setLoading(false);
      });
  }, [id]);

  // Fetch bookings if user is the host
  useEffect(() => {
    if (listing && user && listing.owner && (user.id === listing.owner._id || user._id === listing.owner._id)) {
      setBookingsLoading(true);
      fetch(`http://localhost:5000/bookings?listingId=${listing._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(async res => {
          if (!res.ok) {
            throw new Error('Failed to fetch bookings');
          }
          return res.json();
        })
        .then(data => {
          setBookings(data);
          setBookingsLoading(false);
        })
        .catch(err => {
          console.error('Error fetching bookings:', err);
          setBookingsLoading(false);
        });
    }
  }, [listing, user]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleImageClick = (index) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
  };

  const nextImage = () => {
    const images = listing.images || [listing.image] || [];
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    const images = listing.images || [listing.image] || [];
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleBooking = () => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      navigate('/login');
      return;
    }
    
    // Check if user is trying to book their own listing
    if (user && listing.owner && user.id === listing.owner._id) {
      alert('You cannot book your own listing.');
      return;
    }
    
    // Open booking form
    setShowBookingForm(true);
  };

  const handleBookingSuccess = (bookingData) => {
    // Check if we have a checkout URL for payment
    if (bookingData.checkoutUrl) {
      // Redirect to Stripe checkout for payment
      window.location.href = bookingData.checkoutUrl;
    } else {
      // Fallback for successful booking without payment
      setBookingSuccess('Booking created successfully!');
      setShowBookingForm(false);
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setBookingSuccess('');
      }, 5000);
    }
  };

  const handleChat = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isHost) {
      alert('You cannot message yourself.');
      return;
    }

    try {
      // Create or get chat room
      const response = await fetch('http://localhost:5000/chat/room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          listingId: listing._id,
          otherUserId: listing.owner._id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create chat room');
      }

      const chatRoom = await response.json();
      setChatRoomId(chatRoom._id);
      setShowChatModal(true);
    } catch (error) {
      console.error('Error creating chat room:', error);
      alert('Failed to start chat. Please try again.');
    }
  };

  // Helper functions for host dashboard
  const isHost = user && listing && listing.owner && (user.id === listing.owner._id || user._id === listing.owner._id);
  
  const getDashboardStats = () => {
    if (!bookings.length) return { total: 0, upcoming: 0, past: 0, revenue: 0 };
    
    const now = new Date();
    const total = bookings.length;
    const upcoming = bookings.filter(b => new Date(b.startDate) > now && b.status !== 'cancelled').length;
    const past = bookings.filter(b => new Date(b.endDate) < now && b.status !== 'cancelled').length;
    const revenue = bookings
      .filter(b => b.status !== 'cancelled')
      .reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    
    return { total, upcoming, past, revenue };
  };

  const getUpcomingBookings = () => {
    if (!bookings.length) return [];
    const now = new Date();
    return bookings
      .filter(b => new Date(b.startDate) > now && b.status !== 'cancelled')
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, 5);
  };

  const getPastBookings = () => {
    if (!bookings.length) return [];
    const now = new Date();
    return bookings
      .filter(b => new Date(b.endDate) < now && b.status !== 'cancelled')
      .sort((a, b) => new Date(b.endDate) - new Date(a.endDate))
      .slice(0, 5);
  };

  // Handle keyboard navigation
  useEffect(() => {
    if (!showImageModal) return;
    
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeImageModal();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showImageModal]);

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <Spinner animation="border" />
        </LoadingContainer>
      </Container>
    );
  }

  if (error || !listing) {
    return (
      <Container>
        <ErrorContainer>
          <Alert variant="danger">
            <Alert.Heading>Error Loading Listing</Alert.Heading>
            <p>{error || 'Listing not found.'}</p>
          </Alert>
        </ErrorContainer>
      </Container>
    );
  }

  const images = listing.images || [listing.image] || [];
  const mainImage = images[0] || 'https://via.placeholder.com/800x500?text=No+Image';
  const sideImages = images.slice(1, 5);

  // Comprehensive info data
  const infoData = [
    { label: 'Price', value: `$${listing.price}`, icon: <FaDollarSign /> },
    { label: 'Type', value: listing.type === 'car' ? 'Car' : 'Apartment', icon: listing.type === 'car' ? <FaCar /> : <FaHome /> },
    { label: 'Transaction', value: listing.transactionType === 'rent' ? 'Rent' : 'Sale', icon: <FaRegListAlt /> },
    ...(listing.type === 'apartment' ? [
      { label: 'Bedrooms', value: listing.bedrooms, icon: <FaBed /> },
      { label: 'Bathrooms', value: listing.bathrooms, icon: <FaBath /> },
      { label: 'Guests', value: listing.guests, icon: <FaUsers /> },
      { label: 'Beds', value: listing.beds, icon: <FaBed /> },
      ...(listing.cleaningFee ? [{ label: 'Cleaning Fee', value: `$${listing.cleaningFee}`, icon: <FaShieldAlt /> }] : []),
      ...(listing.minNights ? [{ label: 'Min Nights', value: listing.minNights, icon: <FaRegCalendarAlt /> }] : []),
    ] : []),
    ...(listing.type === 'car' && listing.carDetails ? [
      { label: 'Make', value: listing.carDetails.make, icon: <FaCar /> },
      { label: 'Model', value: listing.carDetails.model, icon: <FaCarSide /> },
      { label: 'Year', value: listing.carDetails.year, icon: <FaCalendarAlt /> },
      ...(listing.carDetails.color ? [{ label: 'Color', value: listing.carDetails.color, icon: <FaPalette /> }] : []),
      ...(listing.carDetails.transmission ? [{ label: 'Transmission', value: listing.carDetails.transmission, icon: <FaCog /> }] : []),
      ...(listing.carDetails.fuelType ? [{ label: 'Fuel Type', value: listing.carDetails.fuelType, icon: <FaGasPump /> }] : []),
      ...(listing.carDetails.seats ? [{ label: 'Seats', value: listing.carDetails.seats, icon: <FaUsers /> }] : []),
      ...(listing.carDetails.pickupLocation ? [{ label: 'Pickup Location', value: listing.carDetails.pickupLocation, icon: <FaMapMarkerAlt /> }] : []),
    ] : []),
  ];

  // Comprehensive amenities and features mapping
const amenityIcons = {
  // Apartment Amenities
  'WiFi': <FaWifi />,
  'TV': <FaTv />,
  'Kitchen': <FaUtensils />,
  'Washer': <FaSyncAlt />,
  'Dryer': <FaRedo />,
  'Air conditioning': <FaSnowflake />,
  'Heating': <FaSun />,
  'Pool': <FaSwimmingPool />,
  'Free parking': <FaParking />,
  'Gym': <FaDumbbell />,
  'Elevator': <FaArrowUp />,
  'Hot tub': <FaHotTub />,
  'Breakfast': <FaCoffee />,
  'Workspace': <FaBriefcase />,
  'Pets allowed': <FaPaw />,
  'Smoking allowed': <FaSmokingBan />,
  'Wheelchair accessible': <FaWheelchair />,
  'Fireplace': <FaFireExtinguisher />,
  'BBQ grill': <FaBacon />,
  'Balcony': <FaUmbrellaBeach />,
  'Garden': <FaLeaf />,
  'Security cameras': <FaCamera />,
  'Smoke alarm': <FaBell />,
  'Carbon monoxide alarm': <FaBell />,
  
  // Car Features
  'GPS': <FaCompass />,
  'Bluetooth': <FaBluetooth />,
  'Heated seats': <FaSun />,
  'Backup camera': <FaCamera />,
  'Cruise control': <FaFlagCheckered />,
  'Sunroof': <FaUmbrellaBeach />,
  'Child seat': <FaChild />,
  'All-wheel drive': <FaCarSide />,
  'USB charger': <FaBolt />,
  'Apple CarPlay': <FaApple />,
  'Android Auto': <FaAndroid />,
  'Roof rack': <FaCarSide />,
  'Pet friendly': <FaPaw />
};

// Highlights mapping
const highlightIcons = {
  'Great view': <FaEye />,
  'Pet friendly': <FaPaw />,
  'Family friendly': <FaChild />,
  'Central location': <FaMapMarkerAlt />,
  'Quiet area': <FaLeaf />,
  'Unique design': <FaPalette />,
  'Eco-friendly': <FaLeaf />,
  'Luxury': <FaGem />,
  'Newly renovated': <FaTools />,
  'Self check-in': <FaKey />
};

  // Rules data
  const ruleIcons = {
    'No smoking': <FaSmokingBan />,
    'No pets': <FaBan />,
    'No parties or events': <FaUserTimes />,
    'No unregistered guests': <FaUserSecret />,
    'Quiet hours': <FaRegClock />,
    'No shoes indoors': <FaShoePrints />,
    'ID required at check-in': <FaIdCard />
  };

  // Get all amenities and features
  const apartmentAmenities = listing.amenities || [];
  const carFeatures = listing.carDetails?.features || [];
  const highlights = listing.highlights || [];
  const houseRules = listing.houseRules || [];
  const carRules = listing.carDetails?.rules || [];
  
  // Combine all amenities/features for display
  const allAmenities = [...apartmentAmenities, ...carFeatures];
  const allRules = listing.type === 'car' ? carRules : houseRules;

    return (
    <Container>
      <BackButton onClick={handleBackClick}>
        <FaArrowLeft /> Back
      </BackButton>

            <HeroSection>
        <MasonryImageGrid>
          {/* Main large image (top left) */}
          <MainImage 
            className="main-image"
            src={images[0] || mainImage} 
            alt={listing.title}
            onClick={() => handleImageClick(0)}
          />
          
          {/* Top right image */}
          {images[1] && (
            <SideImage 
              className="top-right"
              src={images[1]} 
              alt={`${listing.title} 2`}
              onClick={() => handleImageClick(1)}
            />
          )}
          
          {/* Bottom right image */}
          {images[2] && (
            <SideImage 
              className="bottom-right"
              src={images[2]} 
              alt={`${listing.title} 3`}
              onClick={() => handleImageClick(2)}
            />
          )}
          
          {/* Bottom left image */}
          {images[3] && (
            <SideImage 
              className="bottom-left"
              src={images[3]} 
              alt={`${listing.title} 4`}
              onClick={() => handleImageClick(3)}
            />
          )}
          
          {/* Fifth image with overlay if more images exist */}
          {images[4] && (
            <div className="fifth-image" style={{ position: 'relative' }}>
              <SideImage 
                src={images[4]} 
                alt={`${listing.title} 5`}
                onClick={() => handleImageClick(4)}
              />
              {images.length > 5 && (
                <ImageOverlay onClick={() => handleImageClick(0)}>
                  +{images.length - 5}
                </ImageOverlay>
              )}
            </div>
          )}
          
          {/* Show all photos button for mobile */}
          {images.length > 5 && (
            <ShowAllPhotosButton onClick={() => handleImageClick(0)}>
              <FaCamera /> Show all photos
            </ShowAllPhotosButton>
          )}
        </MasonryImageGrid>

            <HeroContent>
          <TitleSection>
            <Title>{listing.title}</Title>
            <Location>
              <FaMapMarkerAlt />
              {listing.address || `${listing.city}, ${listing.country}` || 'Location not specified'}
            </Location>
            <RatingSection>
              <Rating>
                <StarIcon />
                4.8
              </Rating>
              <ReviewsCount>24 reviews</ReviewsCount>
            </RatingSection>
            
            {/* Mobile Price and Status for Host */}
            {isHost && isMobile && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px',
                background: airbnbLightGray,
                borderRadius: '12px',
                marginTop: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '600', color: airbnbDark }}>
                    ${listing.price}
                    <span style={{ fontSize: '0.9rem', color: airbnbGray, fontWeight: '400' }}>
                      / {listing.type === 'car' ? (listing.transactionType === 'rent' ? 'day' : 'car') : (listing.transactionType === 'rent' ? 'night' : 'apartment')}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: airbnbGray, marginTop: '4px' }}>
                    {getDashboardStats().total} bookings • ${getDashboardStats().revenue.toLocaleString()} revenue
                  </div>
                </div>
                <div style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  color: 'white',
                  background: listing.isActive ? '#28a745' : airbnbGray
                }}>
                  {listing.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            )}
          </TitleSection>

          <ActionButtons>
            {isHost && isMobile ? (
              <HostActionButton 
                onClick={() => navigate(`/edit-listing/${listing._id}`)}
                style={{ 
                  background: airbnbRed, 
                  color: 'white', 
                  border: 'none', 
                  padding: '12px 20px', 
                  borderRadius: '12px', 
                  fontSize: '15px', 
                  fontWeight: '600', 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FaEdit /> Edit Listing
              </HostActionButton>
            ) : (
              <>
                <ActionButton>
                  <FaShare /> Share
                </ActionButton>
                <LikeButton 
                  listingId={listing._id}
                  likeCount={listing.likeCount || 0}
                  showCount={true}
                />
              </>
            )}
          </ActionButtons>
            </HeroContent>
      </HeroSection>

      <ContentGrid>
        <MainContent>
          <InfoGrid>
            {infoData.map((item, index) => (
              <InfoCard key={index}>
                <InfoLabel>
                  {item.icon} {item.label}
                </InfoLabel>
                <InfoValue>{item.value}</InfoValue>
              </InfoCard>
            ))}
          </InfoGrid>

          {/* Mobile Host Summary */}
          {isHost && isMobile && (
            <div style={{
              background: airbnbLightGray,
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
              border: `1px solid ${airbnbBorder}`
            }}>
              <div style={{ 
                fontSize: '1.1rem', 
                fontWeight: '600', 
                color: airbnbDark, 
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <FaChartBar /> Listing Performance
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', color: airbnbGray }}>Total Bookings</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '600', color: airbnbDark }}>{getDashboardStats().total}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', color: airbnbGray }}>Total Revenue</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '600', color: airbnbDark }}>${getDashboardStats().revenue.toLocaleString()}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', color: airbnbGray }}>Upcoming</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '600', color: airbnbDark }}>{getDashboardStats().upcoming}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.9rem', color: airbnbGray }}>Completed</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '600', color: airbnbDark }}>{getDashboardStats().past}</div>
                </div>
              </div>
            </div>
          )}

          <DescriptionSection>
            <SectionTitle>About this place</SectionTitle>
            <Description>{listing.description}</Description>
          </DescriptionSection>

          {/* Highlights Section */}
          {highlights.length > 0 && (
            <AmenitiesSection>
              <SectionTitle>What makes this place special</SectionTitle>
              <AmenitiesGrid>
                {(isMobile ? highlights.slice(0, 5) : highlights).map((highlight, index) => (
                  <AmenityItem key={index}>
                    <AmenityIcon>
                      {highlightIcons[highlight] || <FaStar />}
                    </AmenityIcon>
                    <AmenityText>{highlight}</AmenityText>
                  </AmenityItem>
                ))}
              </AmenitiesGrid>
              {isMobile && highlights.length > 5 && (
                <SeeMoreButton onClick={() => setShowAmenitiesModal(true)}>
                  Show all {highlights.length} highlights
                </SeeMoreButton>
              )}
            </AmenitiesSection>
          )}

          {/* Amenities Section */}
          {allAmenities.length > 0 && (
            <AmenitiesSection>
              <SectionTitle>What this {listing.type === 'car' ? 'car' : 'place'} offers</SectionTitle>
              <AmenitiesGrid>
                {(isMobile ? allAmenities.slice(0, 5) : allAmenities).map((amenity, index) => (
                  <AmenityItem key={index}>
                    <AmenityIcon>
                      {amenityIcons[amenity] || <FaCheck />}
                    </AmenityIcon>
                    <AmenityText>{amenity}</AmenityText>
                  </AmenityItem>
                ))}
              </AmenitiesGrid>
              {isMobile && allAmenities.length > 5 && (
                <SeeMoreButton onClick={() => setShowAmenitiesModal(true)}>
                  Show all {allAmenities.length} amenities
                </SeeMoreButton>
              )}
            </AmenitiesSection>
          )}

          {/* Rules Section */}
          {allRules.length > 0 && (
            <RulesSection>
              <SectionTitle>{listing.type === 'car' ? 'Car rules' : 'House rules'}</SectionTitle>
              <RulesGrid>
                {(isMobile ? allRules.slice(0, 5) : allRules).map((rule, index) => (
                  <RuleItem key={index}>
                    <RuleIcon>
                      {ruleIcons[rule] || <FaBan />}
                    </RuleIcon>
                    <RuleText>{rule}</RuleText>
                  </RuleItem>
                ))}
              </RulesGrid>
              {isMobile && allRules.length > 5 && (
                <SeeMoreButton onClick={() => setShowAmenitiesModal(true)}>
                  Show all {allRules.length} rules
                </SeeMoreButton>
              )}
            </RulesSection>
          )}

          <MapSection>
            <SectionTitle>Location</SectionTitle>
            <MapContainer>
          {listing.lat && listing.lng ? (
            <iframe
              title="map"
              width="100%"
                  height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${listing.lng-0.01}%2C${listing.lat-0.01}%2C${listing.lng+0.01}%2C${listing.lat+0.01}&layer=mapnik&marker=${listing.lat}%2C${listing.lng}`}
              allowFullScreen
            />
          ) : (
                <MapPlaceholder>
                  <FaMapMarkerAlt /> Location unavailable
                </MapPlaceholder>
              )}
            </MapContainer>
          </MapSection>

          <HostSection>
            <SectionTitle>Hosted by {listing.owner?.name || listing.owner?.firstName || 'Host'}</SectionTitle>
            <HostInfo>
              <HostAvatar>
                {listing.owner?.profileImage ? (
                  <img
                    src={listing.owner.profileImage}
                    alt={listing.owner?.name || listing.owner?.firstName || 'Host'}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  (listing.owner?.name?.charAt(0) || listing.owner?.firstName?.charAt(0) || 'H')
                )}
              </HostAvatar>
              <HostDetails>
                <HostName>
                  {listing.owner?.name || 
                   `${listing.owner?.firstName || ''} ${listing.owner?.lastName || ''}`.trim() || 
                   'Host'}
                </HostName>
                <HostStatus>
                  {listing.owner?.email && `${listing.owner.email} • `}
                  {listing.owner?.role === 'host' ? 'Superhost' : 'Host'} • 
                  {listing.owner?.createdAt ? 
                    `${Math.floor((new Date() - new Date(listing.owner.createdAt)) / (1000 * 60 * 60 * 24 * 365))} years hosting` : 
                    'Experienced host'
                  }
                </HostStatus>
              </HostDetails>
            </HostInfo>
            <HostActions>
              <HostButton>
                <FaPhone /> Contact
              </HostButton>
              <HostButton className="primary" onClick={async () => {
                if (!isAuthenticated) {
                  navigate('/login');
                  return;
                }
                if (isHost) {
                  alert('You cannot message yourself.');
                  return;
                }
                try {
                  const response = await fetch('http://localhost:5000/chat/room', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({
                      listingId: listing._id,
                      otherUserId: listing.owner._id
                    })
                  });
                  if (!response.ok) throw new Error('Failed to create chat room');
                  const chatRoom = await response.json();
                  navigate(`/messages/${chatRoom._id}`);
                } catch (error) {
                  alert('Failed to start chat. Please try again.');
                }
              }}>
                <FaEnvelope /> Message
              </HostButton>
            </HostActions>
          </HostSection>

          {/* Additional Details Section */}
          {(listing.checkIn || listing.checkOut || listing.bedTypes || listing.propertyType || listing.roomType) && (
            <section style={{
              background: 'white',
              borderRadius: '16px',
              padding: '32px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              border: `1px solid ${airbnbBorder}`,
              marginBottom: '40px'
            }}>
              <SectionTitle>Additional details</SectionTitle>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                {listing.checkIn && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ color: airbnbRed, fontSize: '1.2rem' }}><FaRegClock /></div>
                    <div>
                      <div style={{ fontWeight: '600', color: airbnbDark }}>Check-in</div>
                      <div style={{ color: airbnbGray }}>{listing.checkIn}</div>
                    </div>
                  </div>
                )}
                {listing.checkOut && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ color: airbnbRed, fontSize: '1.2rem' }}><FaRegClock /></div>
                    <div>
                      <div style={{ fontWeight: '600', color: airbnbDark }}>Check-out</div>
                      <div style={{ color: airbnbGray }}>{listing.checkOut}</div>
                    </div>
                  </div>
                )}
                {listing.propertyType && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ color: airbnbRed, fontSize: '1.2rem' }}><FaHome /></div>
                    <div>
                      <div style={{ fontWeight: '600', color: airbnbDark }}>Property type</div>
                      <div style={{ color: airbnbGray }}>{listing.propertyType}</div>
                    </div>
                  </div>
                )}
                {listing.roomType && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ color: airbnbRed, fontSize: '1.2rem' }}><FaDoorOpen /></div>
                    <div>
                      <div style={{ fontWeight: '600', color: airbnbDark }}>Room type</div>
                      <div style={{ color: airbnbGray }}>{listing.roomType}</div>
                    </div>
                  </div>
                )}
                {listing.bedTypes && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ color: airbnbRed, fontSize: '1.2rem' }}><FaBed /></div>
                    <div>
                      <div style={{ fontWeight: '600', color: airbnbDark }}>Bed types</div>
                      <div style={{ color: airbnbGray }}>{listing.bedTypes}</div>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Host Dashboard */}
          {isHost && (
            <DashboardSection>
              <DashboardTitle>
                <FaChartBar /> Dashboard Overview
              </DashboardTitle>
              
              {/* Statistics */}
              <StatsGrid>
                <StatCard>
                  <StatValue>{getDashboardStats().total}</StatValue>
                  <StatLabel>Total Bookings</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{getDashboardStats().upcoming}</StatValue>
                  <StatLabel>Upcoming Bookings</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>{getDashboardStats().past}</StatValue>
                  <StatLabel>Past Bookings</StatLabel>
                </StatCard>
                <StatCard>
                  <StatValue>${getDashboardStats().revenue.toLocaleString()}</StatValue>
                  <StatLabel>Total Revenue</StatLabel>
                </StatCard>
              </StatsGrid>

              {/* Bookings Lists */}
              <BookingsGrid>
                <BookingList>
                  <BookingListTitle>
                    <FaCalendarAlt /> Upcoming Bookings
                  </BookingListTitle>
                  {bookingsLoading ? (
                    <EmptyState>Loading bookings...</EmptyState>
                  ) : getUpcomingBookings().length > 0 ? (
                    getUpcomingBookings().map((booking, index) => (
                      <BookingItem key={booking._id || index}>
                        <BookingGuest>
                          {booking.guest?.firstName} {booking.guest?.lastName}
                        </BookingGuest>
                        <BookingDates>
                          {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </BookingDates>
                        <BookingPrice>${booking.totalPrice}</BookingPrice>
                      </BookingItem>
                    ))
                  ) : (
                    <EmptyState>No upcoming bookings</EmptyState>
                  )}
                </BookingList>

                <BookingList>
                  <BookingListTitle>
                    <FaHistory /> Recent Bookings
                  </BookingListTitle>
                  {bookingsLoading ? (
                    <EmptyState>Loading bookings...</EmptyState>
                  ) : getPastBookings().length > 0 ? (
                    getPastBookings().map((booking, index) => (
                      <BookingItem key={booking._id || index}>
                        <BookingGuest>
                          {booking.guest?.firstName} {booking.guest?.lastName}
                        </BookingGuest>
                        <BookingDates>
                          {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                        </BookingDates>
                        <BookingPrice>${booking.totalPrice}</BookingPrice>
                      </BookingItem>
                    ))
                  ) : (
                    <EmptyState>No past bookings</EmptyState>
                  )}
                </BookingList>
              </BookingsGrid>

              {/* Host Actions */}
              <DashboardActions>
                <HostActionButton onClick={() => navigate(`/edit-listing/${listing._id}`)}>
                  <FaEdit /> Edit Listing
                </HostActionButton>
                <HostActionButton className="secondary" onClick={() => window.open(`/listing/${listing._id}`, '_blank')}>
                  <FaEye /> View Public Page
                </HostActionButton>
                <HostActionButton className="secondary" onClick={() => navigate('/dashboard')}>
                  <FaChartBar /> Full Dashboard
                </HostActionButton>
              </DashboardActions>
            </DashboardSection>
          )}
        </MainContent>

        <Sidebar>
          {isHost ? (
            <BookingCard>
              <PriceSection>
                <Price>${listing.price}</Price>
                <PricePeriod>
                  / {listing.type === 'car' ? (listing.transactionType === 'rent' ? 'day' : 'car') : (listing.transactionType === 'rent' ? 'night' : 'apartment')}
                </PricePeriod>
              </PriceSection>
              
              {/* Host Stats */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '16px',
                fontSize: '0.9rem',
                color: airbnbGray 
              }}>
                <span>Total bookings</span>
                <span>{getDashboardStats().total}</span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '16px',
                fontSize: '0.9rem',
                color: airbnbGray 
              }}>
                <span>Total revenue</span>
                <span>${getDashboardStats().revenue.toLocaleString()}</span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '24px',
                paddingTop: '16px',
                borderTop: `1px solid ${airbnbBorder}`,
                fontSize: '1.1rem',
                fontWeight: '600',
                color: airbnbDark 
              }}>
                <span>Status</span>
                <span style={{ color: listing.isActive ? '#28a745' : airbnbGray }}>
                  {listing.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              
              <HostActionButton onClick={() => navigate(`/edit-listing/${listing._id}`)}>
                <FaEdit /> Edit Listing
              </HostActionButton>
            </BookingCard>
          ) : (
            <BookingCard>
              <PriceSection>
                <Price>${listing.price}</Price>
                <PricePeriod>
                  / {listing.type === 'car' ? (listing.transactionType === 'rent' ? 'day' : 'car') : (listing.transactionType === 'rent' ? 'night' : 'apartment')}
                </PricePeriod>
              </PriceSection>
              
              {/* Additional pricing info */}
              {listing.cleaningFee && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  color: airbnbGray 
                }}>
                  <span>Cleaning fee</span>
                  <span>${listing.cleaningFee}</span>
                </div>
              )}
              
              {/* Total price */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: '24px',
                paddingTop: '16px',
                borderTop: `1px solid ${airbnbBorder}`,
                fontSize: '1.1rem',
                fontWeight: '600',
                color: airbnbDark 
              }}>
                <span>Total</span>
                <span>${listing.cleaningFee ? parseInt(listing.price) + parseInt(listing.cleaningFee) : listing.price}</span>
              </div>
              
              <BookingButton onClick={handleBooking}>
                {listing.transactionType === 'rent' ? 'Book now' : 'Buy now'}
              </BookingButton>
            </BookingCard>
          )}
        </Sidebar>
      </ContentGrid>

      {/* Image Modal */}
      {showImageModal && (
        <ModalOverlay onClick={closeImageModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalCloseButton onClick={closeImageModal}>
              <FaTimes />
            </ModalCloseButton>
            <ModalImage 
              src={images[currentImageIndex]} 
              alt={`${listing.title} ${currentImageIndex + 1}`}
            />
            {images.length > 1 && (
              <>
                <ModalNavButton className="prev" onClick={prevImage}>
                  <FaChevronLeft />
                </ModalNavButton>
                <ModalNavButton className="next" onClick={nextImage}>
                  <FaChevronRight />
                </ModalNavButton>
                </>
              )}
            </ModalContent>
          </ModalOverlay>
        )}

      {/* Amenities Modal */}
      <AmenitiesModalOverlay isOpen={showAmenitiesModal} onClick={() => setShowAmenitiesModal(false)} />
      <MobileAmenitiesModal isOpen={showAmenitiesModal}>
        <ModalHeader>
          <ModalTitle>All Amenities</ModalTitle>
          <CloseButton onClick={() => setShowAmenitiesModal(false)}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>
        <AmenitiesGrid>
          {allAmenities.map((amenity, index) => (
            <AmenityItem key={index}>
              <AmenityIcon>
                {amenityIcons[amenity] || <FaCheck />}
              </AmenityIcon>
              <AmenityText>{amenity}</AmenityText>
            </AmenityItem>
          ))}
        </AmenitiesGrid>
      </MobileAmenitiesModal>

      {/* Booking Form */}
      {listing && (
        <BookingForm
          listing={listing}
          isOpen={showBookingForm}
          onClose={() => setShowBookingForm(false)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* Success Message */}
      {bookingSuccess && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#28a745',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
          zIndex: 3001,
          animation: 'slideInRight 0.3s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaCheckCircle />
            {bookingSuccess}
          </div>
        </div>
      )}

      {/* Chat Modal */}
      {showChatModal && chatRoomId && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '600px',
            height: '80vh',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
          }}>
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ margin: 0, color: airbnbDark }}>
                Chat with {listing.owner?.name || listing.owner?.firstName || 'Host'}
              </h3>
              <button
                onClick={() => setShowChatModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: airbnbGray
                }}
              >
                <FaTimes />
              </button>
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <ChatScreen 
                chatRoomId={chatRoomId} 
                userId={user?.id || user?._id}
              />
            </div>
          </div>
        </div>
      )}
    </Container>
  );
};

export default ListingDetails; 