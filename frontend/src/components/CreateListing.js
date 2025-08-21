import React, { useState, useRef, useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Alert, Spinner } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Fuse from 'fuse.js';
import usaCities from '../data/usaCities.json';
import { 
  FaPlus, FaTrash, FaChevronLeft, FaChevronRight, FaCheckCircle, 
  FaHome, FaMapMarkerAlt, FaCog, FaStar, FaCamera, FaEdit, 
  FaDollarSign, FaShieldAlt, FaEye, FaUpload, FaTimes, FaSearch,
  FaGlobe, FaLocationArrow, FaCompass, FaClock
} from 'react-icons/fa';

// Airbnb color palette and style variables
const airbnbRed = '#FF5A5F';
const airbnbDark = '#222222';
const airbnbGray = '#F7F7F7';
const airbnbBorder = '#EBEBEB';
const airbnbShadow = '0 2px 16px rgba(0,0,0,0.07)';
const airbnbRadius = '18px';
const airbnbFont = `'Circular', 'Helvetica Neue', Arial, sans-serif`;

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(30px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

// Styled Components
const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${airbnbGray};
  font-family: ${airbnbFont};
  padding: 20px 0;
  
  @media (max-width: 768px) {
    padding: 10px 0;
  }
  
  @media (max-width: 480px) {
    padding: 5px 0;
  }
`;

const CenteredCard = styled.div`
  background: #fff;
  border-radius: ${airbnbRadius};
  box-shadow: ${airbnbShadow};
  max-width: 800px;
  margin: 0 auto;
  padding: 48px 40px 40px 40px;
  position: relative;
  animation: ${fadeIn} 0.6s ease-out;
  
  @media (max-width: 768px) {
    margin: 0 16px;
    padding: 32px 24px 24px 24px;
    border-radius: 12px;
  }
  
  @media (max-width: 480px) {
    margin: 0 12px;
    padding: 24px 16px 16px 16px;
    border-radius: 8px;
  }
`;

const ModernStepper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 48px;
  position: relative;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 32px;
  }
  
  @media (max-width: 480px) {
    gap: 12px;
    margin-bottom: 24px;
  }
`;

const StepItem = styled.div`
  display: flex;
  align-items: center;
  color: ${({active, completed}) => completed ? airbnbRed : active ? airbnbDark : '#bbb'};
  font-weight: ${({active, completed}) => (active || completed) ? 600 : 400};
  font-size: 0.95rem;
  position: relative;
  transition: all 0.3s ease;
  
  &:not(:last-child)::after {
    content: '';
    display: block;
    width: 40px;
    height: 2px;
    background: ${({completed}) => completed ? airbnbRed : '#ddd'};
    margin: 0 16px;
    transition: background 0.3s ease;
    
    @media (max-width: 768px) {
      display: none;
    }
  }
  
  .step-icon {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 8px;
    background: ${({active, completed}) => completed ? airbnbRed : active ? airbnbDark : '#f0f0f0'};
    color: ${({active, completed}) => (active || completed) ? '#fff' : '#999'};
    font-size: 14px;
    transition: all 0.3s ease;
  }
  
  &:hover {
    color: ${({active, completed}) => (active || completed) ? airbnbDark : airbnbRed};
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  margin-bottom: 40px;
  overflow: hidden;
`;

const Progress = styled.div`
  height: 100%;
  background: linear-gradient(90deg, ${airbnbRed} 0%, #ff7a7f 100%);
  width: ${({percent}) => percent}%;
  transition: width 0.6s ease;
  border-radius: 2px;
`;

const SectionTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${airbnbDark};
  margin-bottom: 32px;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 24px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
`;

const StepTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  color: ${airbnbDark};
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 20px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.25rem;
    margin-bottom: 16px;
  }
`;

const StyledButton = styled.button`
  background: ${({secondary, danger}) => 
    danger ? '#dc3545' : 
    secondary ? '#fff' : airbnbRed};
  color: ${({secondary, danger}) => 
    danger ? '#fff' : 
    secondary ? airbnbRed : '#fff'};
  border: 2px solid ${({secondary, danger}) => 
    danger ? '#dc3545' : 
    secondary ? airbnbRed : airbnbRed};
  border-radius: 12px;
  padding: 14px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 8px;
  cursor: pointer;
  box-shadow: ${({secondary, danger}) => 
    danger ? '0 2px 8px rgba(220,53,69,0.2)' :
    secondary ? 'none' : '0 2px 12px rgba(255,90,95,0.15)'};
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({secondary, danger}) => 
      danger ? '0 4px 16px rgba(220,53,69,0.3)' :
      secondary ? '0 2px 12px rgba(255,90,95,0.15)' : '0 4px 20px rgba(255,90,95,0.25)'};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 12px 24px;
    font-size: 1rem;
    margin: 4px;
  }
  
  @media (max-width: 480px) {
    padding: 10px 20px;
    font-size: 0.9rem;
    margin: 2px;
    border-radius: 8px;
  }
`;

const FormField = styled.div`
  margin-bottom: 24px;
  animation: ${slideIn} 0.4s ease-out;
`;

const Label = styled.label`
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  color: ${airbnbDark};
  margin-bottom: 8px;
  
  .required {
    color: ${airbnbRed};
    margin-left: 4px;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 16px 20px;
  border: 2px solid ${airbnbBorder};
  border-radius: 12px;
  font-size: 1.1rem;
  font-family: ${airbnbFont};
  transition: all 0.2s ease;
  background: #fff;
  
  &:focus {
    outline: none;
    border-color: ${airbnbRed};
    box-shadow: 0 0 0 3px rgba(255,90,95,0.1);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 16px 20px;
  border: 2px solid ${airbnbBorder};
  border-radius: 12px;
  font-size: 1.1rem;
  font-family: ${airbnbFont};
  background: #fff;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${airbnbRed};
    box-shadow: 0 0 0 3px rgba(255,90,95,0.1);
  }
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  padding: 16px 20px;
  border: 2px solid ${airbnbBorder};
  border-radius: 12px;
  font-size: 1.1rem;
  font-family: ${airbnbFont};
  resize: vertical;
  min-height: 120px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: ${airbnbRed};
    box-shadow: 0 0 0 3px rgba(255,90,95,0.1);
  }
`;

const CustomCheckbox = styled.label`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  margin: 8px;
  border: 2px solid ${airbnbBorder};
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #fff;
  font-size: 1rem;
  font-weight: 500;
  
  &:hover {
    border-color: ${airbnbRed};
    background: #fff5f5;
  }
  
  input[type="checkbox"] {
    display: none;
  }
  
  .checkbox-custom {
    width: 20px;
    height: 20px;
    border: 2px solid ${airbnbBorder};
    border-radius: 6px;
    margin-right: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    background: #fff;
  }
  
  input[type="checkbox"]:checked + .checkbox-custom {
    background: ${airbnbRed};
    border-color: ${airbnbRed};
    color: #fff;
  }
  
  input[type="checkbox"]:checked ~ span {
    color: ${airbnbDark};
    font-weight: 600;
  }
`;

const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 12px;
  margin-top: 16px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ImageUploadArea = styled.div`
  border: 3px dashed ${airbnbBorder};
  border-radius: 16px;
  padding: 40px 20px;
  text-align: center;
  background: #fafafa;
  transition: all 0.2s ease;
  cursor: pointer;
  margin-bottom: 24px;
  
  &:hover {
    border-color: ${airbnbRed};
    background: #fff5f5;
  }
  
  .upload-icon {
    font-size: 3rem;
    color: ${airbnbRed};
    margin-bottom: 16px;
  }
  
  .upload-text {
    font-size: 1.2rem;
    font-weight: 600;
    color: ${airbnbDark};
    margin-bottom: 8px;
  }
  
  .upload-subtext {
    color: #666;
    font-size: 1rem;
  }
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 24px;
`;

const ImagePreview = styled.div`
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  }
  
  img {
    width: 100%;
    height: 150px;
    object-fit: cover;
  }
  
  .image-actions {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    gap: 4px;
  }
  
  .action-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: rgba(255,255,255,0.9);
    color: ${airbnbRed};
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &:hover {
      background: ${airbnbRed};
      color: #fff;
    }
  }
`;

const FormSection = styled.div`
  margin-bottom: 40px;
`;

const StepNav = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid ${airbnbBorder};
`;

const ReviewBox = styled.div`
  background: #fafafa;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  border: 1px solid ${airbnbBorder};
`;

const ReviewItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  
  &:last-child {
    border-bottom: none;
  }
  
  .label {
    font-weight: 600;
    color: ${airbnbDark};
  }
  
  .value {
    color: #666;
  }
`;

// Location Autocomplete Components
const LocationInputContainer = styled.div`
  position: relative;
  margin-bottom: 24px;
`;

const LocationInput = styled.input`
  width: 100%;
  padding: 16px 20px 16px 50px;
  border: 2px solid ${airbnbBorder};
  border-radius: 12px;
  font-size: 1.1rem;
  font-family: ${airbnbFont};
  transition: all 0.2s ease;
  background: #fff;
  
  &:focus {
    outline: none;
    border-color: ${airbnbRed};
    box-shadow: 0 0 0 3px rgba(255,90,95,0.1);
  }
  
  &::placeholder {
    color: #999;
  }
`;

const LocationIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${airbnbRed};
  font-size: 1.2rem;
  z-index: 2;
`;

const AutocompleteDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 2px solid ${airbnbRed};
  border-top: none;
  border-radius: 0 0 12px 12px;
  max-height: 400px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
  animation: ${slideIn} 0.2s ease-out;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${airbnbRed};
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #e31c5f;
  }
`;

const AutocompleteItem = styled.div`
  padding: 16px 20px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &:hover {
    background: #f8f9fa;
    transform: translateX(4px);
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  .location-icon {
    margin-right: 16px;
    color: ${airbnbRed};
    flex-shrink: 0;
    font-size: 1.2rem;
  }
  
  .city-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  .city-name {
    font-weight: 600;
    color: ${airbnbDark};
    font-size: 1.1rem;
    margin-bottom: 4px;
  }
  
  .country-name {
    color: #666;
    font-size: 0.9rem;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .timezone {
    color: #999;
    font-size: 0.8rem;
    font-style: italic;
  }
  
  .population {
    color: #666;
    font-size: 0.85rem;
    font-weight: 500;
    flex-shrink: 0;
    text-align: right;
  }
  
  .coordinates {
    color: #999;
    font-size: 0.75rem;
    margin-top: 2px;
  }
  
  .relevance-score {
    color: #FF385C;
    font-size: 0.7rem;
    font-weight: 600;
    margin-top: 2px;
  }
`;

const StyledMapContainer = styled.div`
  height: 300px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 24px;
  border: 2px solid ${airbnbBorder};
  position: relative;
  background: #f8f9fa;
`;

const MapContent = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const MapMarker = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: ${airbnbRed};
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  animation: bounce 1s infinite;
`;

const MapInfo = styled.div`
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  background: rgba(255,255,255,0.95);
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 0.9rem;
  color: ${airbnbDark};
  text-align: center;
  backdrop-filter: blur(10px);
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% {
    transform: translate(-50%, -50%);
  }
  40% {
    transform: translate(-50%, -60%);
  }
  60% {
    transform: translate(-50%, -55%);
  }
`;

// Component to highlight matched text from Fuse.js
const HighlightedText = ({ text, matches }) => {
  if (!text || !matches || !matches.indices || matches.indices.length === 0) {
    return <span>{text || ''}</span>;
  }

  const parts = [];
  let lastIndex = 0;

  try {
    matches.indices.forEach(([start, end]) => {
      // Validate indices
      if (typeof start !== 'number' || typeof end !== 'number' || 
          start < 0 || end < start || start >= text.length) {
        return;
      }
      
      // Add text before the match
      if (start > lastIndex) {
        parts.push(
          <span key={`text-${lastIndex}`}>
            {text.slice(lastIndex, start)}
          </span>
        );
      }
      
      // Add highlighted match
      parts.push(
        <span 
          key={`highlight-${start}`} 
          style={{ 
            backgroundColor: '#FF385C', 
            color: 'white', 
            fontWeight: 'bold',
            padding: '1px 2px',
            borderRadius: '2px'
          }}
        >
          {text.slice(start, Math.min(end + 1, text.length))}
        </span>
      );
      
      lastIndex = end + 1;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.slice(lastIndex)}
        </span>
      );
    }
  } catch (error) {
    console.error('Error highlighting text:', error);
    return <span>{text}</span>;
  }

  return <span>{parts}</span>;
};

const MapPlaceholder = styled.div`
  height: 240px;
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #666;
  margin-bottom: 24px;
  border: 2px dashed ${airbnbBorder};
  
  .map-icon {
    font-size: 3rem;
    color: ${airbnbRed};
    margin-bottom: 16px;
  }
  
  .map-text {
    font-size: 1.1rem;
    font-weight: 600;
  }
`;

const PROPERTY_TYPES = [
  'Apartment', 'House', 'Villa', 'Condo', 'Loft', 'Townhouse', 'Bungalow', 'Cabin', 'Other'
];
const ROOM_TYPES = [
  'Entire place', 'Private room', 'Shared room'
];
const AMENITIES = [
  'WiFi', 'TV', 'Kitchen', 'Washer', 'Dryer', 'Air conditioning', 'Heating', 'Pool', 'Free parking', 'Gym', 'Elevator', 'Hot tub', 'Breakfast', 'Workspace', 'Pets allowed', 'Smoking allowed', 'Wheelchair accessible', 'Fireplace', 'BBQ grill', 'Balcony', 'Garden', 'Security cameras', 'Smoke alarm', 'Carbon monoxide alarm'
];
const HIGHLIGHTS = [
  'Great view', 'Pet friendly', 'Family friendly', 'Central location', 'Quiet area', 'Unique design', 'Eco-friendly', 'Luxury', 'Newly renovated', 'Self check-in'
];
const HOUSE_RULES = [
  'No smoking', 'No pets', 'No parties or events', 'No unregistered guests', 'Quiet hours', 'No shoes indoors', 'ID required at check-in'
];
const CANCELLATION_POLICIES = [
  'Flexible', 'Moderate', 'Strict', 'Super Strict'
];
const CAR_FEATURES = [
  'Air conditioning', 'GPS', 'Bluetooth', 'Heated seats', 'Backup camera', 'Cruise control', 'Sunroof', 'Child seat', 'All-wheel drive', 'USB charger', 'Apple CarPlay', 'Android Auto', 'Roof rack', 'Pet friendly'
];
const CAR_RULES = [
  'No smoking', 'No pets', 'No off-roading', 'No racing', 'Return with full tank', 'No eating/drinking', 'Valid license required'
];

// Enhanced location search with comprehensive world cities data
// Configure Fuse.js for fuzzy searching
const fuseOptions = {
  keys: ['name', 'country', 'altName'],
  threshold: 0.3,
  distance: 100,
  includeScore: true,
  includeMatches: true
};

// Use only US cities data
const allCities = usaCities;

// Remove duplicates based on name and country
const uniqueCities = allCities.filter((city, index, self) => 
  city && city.name && city.country && // Ensure city has required properties
  index === self.findIndex(c => 
    c && c.name && c.country && // Ensure comparison city has required properties
    c.name.toLowerCase() === city.name.toLowerCase() && 
    c.country.toLowerCase() === city.country.toLowerCase()
  )
);

// Sort by population (larger cities first)
const sortedCities = uniqueCities.sort((a, b) => (b.population || 0) - (a.population || 0));

// Initialize Fuse instance with error handling
let fuse;
try {
  fuse = new Fuse(sortedCities, fuseOptions);
} catch (error) {
  console.error('Error initializing Fuse.js:', error);
  // Fallback to basic search if Fuse.js fails
  fuse = null;
}

const initialState = {
  // Common
  type: 'apartment',
  transactionType: 'rent',
  propertyType: '',
  roomType: '',
  title: '',
  description: '',
  price: '',
  cleaningFee: '',
  minNights: '',
  maxNights: '',
  guests: '',
  bedrooms: '',
  beds: '',
  bathrooms: '',
  bedTypes: '', // comma separated
  amenities: [],
  highlights: [],
  address: '',
  location: '',
  images: [],
  imagePreviews: [],
  calendar: [],
  houseRules: [],
  cancellationPolicy: '',
  checkIn: '',
  checkOut: '',
  // Car
  carDetails: {
    make: '',
    model: '',
    year: '',
    color: '',
    transmission: '',
    fuelType: '',
    features: [],
    seats: '',
    pickupLocation: '',
    minRentalDays: '',
    maxRentalDays: '',
    calendar: [],
    rules: [],
    cancellationPolicy: ''
  },

};

const steps = [
  'Type', 'Location', 'Details', 'Amenities', 'Photos', 'Description', 'Pricing', 'Rules', 'Review'
];

const CreateListing = () => {
  const { user, token } = useAuth();
  const [form, setForm] = useState(initialState);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  // Autocomplete and map state
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const locationInputRef = useRef();

  // Fallback search function when Fuse.js is not available
  const performBasicSearch = (query) => {
    const q = query.toLowerCase();
    return sortedCities
      .filter(city => {
        if (!city || !city.name || !city.country) return false;
        
        const cityName = city.name.toLowerCase();
        const countryName = city.country.toLowerCase();
        const fullName = `${cityName}, ${countryName}`.toLowerCase();
        
        return cityName.includes(q) || 
               countryName.includes(q) || 
               fullName.includes(q) ||
               cityName.startsWith(q) ||
               countryName.startsWith(q);
      })
      .slice(0, 15);
  };

  useEffect(() => {
    if (form.location) {
      setLocationQuery(form.location);
    }
  }, [form.location]);

  useEffect(() => {
    if (locationQuery.length > 1) {
      let filtered = [];
      
      if (fuse) {
        // Use Fuse.js for fuzzy searching
        try {
          const searchResults = fuse.search(locationQuery);
          
          // Extract and sort results
          filtered = searchResults
            .map(result => ({
              ...result.item,
              score: result.score,
              matches: result.matches
            }))
            .sort((a, b) => {
              // Sort by relevance score first (lower is better)
              if (a.score !== b.score) {
                return a.score - b.score;
              }
              // Then by population
        return (b.population || 0) - (a.population || 0);
            })
            .slice(0, 20); // Show more results with Fuse.js
        } catch (error) {
          console.error('Error with Fuse.js search:', error);
          // Fallback to basic search
          filtered = performBasicSearch(locationQuery);
        }
      } else {
        // Fallback to basic search if Fuse.js is not available
        filtered = performBasicSearch(locationQuery);
      }
      
      setLocationSuggestions(filtered);
    } else if (locationQuery.length === 0) {
      // Show popular cities when input is empty
      const popularCities = sortedCities.slice(0, 15);
      setLocationSuggestions(popularCities);
    } else {
      setLocationSuggestions([]);
    }
  }, [locationQuery]);

  const handleLocationSelect = (city) => {
    const locationString = `${city.name}, ${city.country}`;
    setForm(f => ({ ...f, location: locationString }));
    setLocationQuery(locationString);
    setSelectedCity(city);
    setLocationSuggestions([]);
    setHighlightedIndex(-1);
    
    // Save to recent searches (keep only last 5)
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item.name !== city.name);
      return [city, ...filtered].slice(0, 5);
    });
  };

  const handleKeyDown = (e) => {
    if (locationSuggestions.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < locationSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : locationSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < locationSuggestions.length) {
          handleLocationSelect(locationSuggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setLocationSuggestions([]);
        setHighlightedIndex(-1);
        break;
    }
  };

  if (!user || (user.role !== 'host' && user.role !== 'admin')) {
    return <Alert variant="danger">You do not have permission to create listings.</Alert>;
  }

  // Step validation
  const validateCurrentStep = () => {
    switch (step) {
      case 0: // Type
        return form.type && form.transactionType && 
               (form.type === 'apartment' ? (form.propertyType && form.roomType) : 
                form.type === 'car' ? (form.carDetails.make && form.carDetails.model && form.carDetails.year) : true);
      case 1: // Location
        return form.address && form.location;
      case 2: // Details
        if (form.type === 'apartment') {
          return form.guests && form.bedrooms && form.beds && form.bathrooms;
        } else {
          return form.carDetails.seats;
        }
      case 3: // Amenities
        return true; // Optional
      case 4: // Photos
        return form.images.length > 0;
      case 5: // Description
        return form.title && form.description;
      case 6: // Pricing
        return form.price;
      case 7: // Rules
        return true; // Optional
      default:
        return true;
    }
  };

  // Step navigation
  const nextStep = () => {
    if (validateCurrentStep()) {
      setStep(s => Math.min(s + 1, steps.length - 1));
    } else {
      setError('Please fill in all required fields before proceeding.');
    }
  };
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  // Field handlers
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Clear error message when user starts typing
    if (error) {
      setError('');
    }
    if (name.startsWith('carDetails.')) {
      setForm({
        ...form,
        carDetails: { ...form.carDetails, [name.replace('carDetails.', '')]: value }
      });
    } else if (type === 'checkbox' && AMENITIES.includes(name)) {
      setForm({
        ...form,
        amenities: checked ? [...form.amenities, name] : form.amenities.filter(a => a !== name)
      });
    } else if (type === 'checkbox' && HIGHLIGHTS.includes(name)) {
      setForm({
        ...form,
        highlights: checked ? [...form.highlights, name] : form.highlights.filter(h => h !== name)
      });
    } else if (type === 'checkbox' && HOUSE_RULES.includes(name)) {
      setForm({
        ...form,
        houseRules: checked ? [...form.houseRules, name] : form.houseRules.filter(r => r !== name)
      });
    } else if (type === 'checkbox' && CAR_FEATURES.includes(name)) {
      setForm({
        ...form,
        carDetails: {
          ...form.carDetails,
          features: checked ? [...form.carDetails.features, name] : form.carDetails.features.filter(f => f !== name)
        }
      });
    } else if (type === 'checkbox' && CAR_RULES.includes(name)) {
      setForm({
        ...form,
        carDetails: {
          ...form.carDetails,
          rules: checked ? [...form.carDetails.rules, name] : form.carDetails.rules.filter(r => r !== name)
        }
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Image upload/preview/reorder
  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setForm(f => ({
      ...f,
      images: files,
      imagePreviews: files.map(file => URL.createObjectURL(file))
    }));
  };
  const removeImage = (idx) => {
    setForm(f => ({
      ...f,
      images: f.images.filter((_, i) => i !== idx),
      imagePreviews: f.imagePreviews.filter((_, i) => i !== idx)
    }));
  };
  const moveImage = (from, to) => {
    setForm(f => {
      const imgs = [...f.images];
      const prevs = [...f.imagePreviews];
      const [img] = imgs.splice(from, 1);
      const [prev] = prevs.splice(from, 1);
      imgs.splice(to, 0, img);
      prevs.splice(to, 0, prev);
      return { ...f, images: imgs, imagePreviews: prevs };
    });
  };

  // Step content
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <StepTitle>What are you listing?</StepTitle>
            <FormField>
              <Label>Listing Type<span className="required">*</span></Label>
              <StyledSelect name="type" value={form.type} onChange={handleChange} required>
                <option value="apartment">Apartment/Room</option>
                <option value="car">Car</option>
              </StyledSelect>
            </FormField>
            <FormField>
              <Label>Transaction Type<span className="required">*</span></Label>
              <StyledSelect name="transactionType" value={form.transactionType} onChange={handleChange} required>
                <option value="rent">Rent</option>
                <option value="sale">Sale</option>
              </StyledSelect>
            </FormField>
            {form.type === 'apartment' && (
              <>
                <FormField>
                  <Label>Property Type<span className="required">*</span></Label>
                  <StyledSelect name="propertyType" value={form.propertyType} onChange={handleChange} required>
                    <option value="">Select property type...</option>
                    {PROPERTY_TYPES.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                  </StyledSelect>
                </FormField>
                <FormField>
                  <Label>Room Type<span className="required">*</span></Label>
                  <StyledSelect name="roomType" value={form.roomType} onChange={handleChange} required>
                    <option value="">Select room type...</option>
                    {ROOM_TYPES.map(rt => <option key={rt} value={rt}>{rt}</option>)}
                  </StyledSelect>
                </FormField>
              </>
            )}
            {form.type === 'car' && (
              <>
                <FormField>
                  <Label>Make</Label>
                  <StyledInput name="carDetails.make" value={form.carDetails.make} onChange={handleChange} placeholder="e.g., Toyota" required />
                </FormField>
                <FormField>
                  <Label>Model</Label>
                  <StyledInput name="carDetails.model" value={form.carDetails.model} onChange={handleChange} placeholder="e.g., Camry" required />
                </FormField>
                <FormField>
                  <Label>Year</Label>
                  <StyledInput name="carDetails.year" type="number" value={form.carDetails.year} onChange={handleChange} placeholder="e.g., 2020" required />
                </FormField>
                <FormField>
                  <Label>Color</Label>
                  <StyledInput name="carDetails.color" value={form.carDetails.color} onChange={handleChange} placeholder="e.g., Silver" />
                </FormField>
                <FormField>
                  <Label>Transmission</Label>
                  <StyledInput name="carDetails.transmission" value={form.carDetails.transmission} onChange={handleChange} placeholder="e.g., Automatic" />
                </FormField>
                <FormField>
                  <Label>Fuel Type</Label>
                  <StyledInput name="carDetails.fuelType" value={form.carDetails.fuelType} onChange={handleChange} placeholder="e.g., Gasoline" />
                </FormField>
                <FormField>
                  <Label>Number of Seats</Label>
                  <StyledInput name="carDetails.seats" type="number" value={form.carDetails.seats} onChange={handleChange} placeholder="e.g., 5" />
                </FormField>
              </>
            )}
          </>
        );
      case 1:
        return (
          <>
            <StepTitle>Where is your listing located?</StepTitle>
            <FormField>
              <Label>Address</Label>
              <StyledInput name="address" value={form.address} onChange={handleChange} placeholder="Enter full address" required />
            </FormField>
            <FormField>
              <Label>
                Location (City/Area)
                <span style={{ 
                  fontSize: '0.8rem', 
                  color: '#666', 
                  fontWeight: '400',
                  marginLeft: '8px'
                }}>
                  • {sortedCities.length.toLocaleString()} cities worldwide
                </span>
              </Label>
              <LocationInputContainer>
                <LocationIcon><FaCompass /></LocationIcon>
                <LocationInput
                  ref={locationInputRef}
                  type="text"
                  value={locationQuery}
                  onChange={e => {
                    setLocationQuery(e.target.value);
                    setForm(f => ({ ...f, location: e.target.value }));
                    setHighlightedIndex(-1);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search for US cities..."
                  autoComplete="off"
                  required
                />
                                {locationSuggestions.length > 0 && (
                  <AutocompleteDropdown>
                    {locationQuery.length === 0 && (
                      <>
                        {recentSearches.length > 0 && (
                      <div style={{ 
                            padding: '12px 20px', 
                            background: '#fff5f5', 
                            borderBottom: '1px solid #e9ecef',
                            fontSize: '0.9rem',
                            color: '#666',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <FaClock /> Recent searches
                          </div>
                        )}
                        <div style={{ 
                          padding: '12px 20px', 
                        background: '#f8f9fa', 
                        borderBottom: '1px solid #e9ecef',
                          fontSize: '0.9rem',
                        color: '#666',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                      }}>
                          <FaGlobe /> Popular destinations worldwide
                        </div>
                      </>
                    )}
                    {locationQuery.length > 1 && (
                      <div style={{ 
                        padding: '8px 20px', 
                        background: '#e8f4fd', 
                        borderBottom: '1px solid #e9ecef',
                        fontSize: '0.85rem',
                        color: '#0066cc',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <span>
                          <FaSearch /> Found {locationSuggestions.length} results
                        </span>
                        <span>
                          Fuzzy search powered by Fuse.js
                        </span>
                      </div>
                    )}
                    {locationSuggestions.map((city, idx) => (
                      <AutocompleteItem 
                        key={idx} 
                        onClick={() => handleLocationSelect(city)}
                        style={{
                          background: idx === highlightedIndex ? '#f0f0f0' : 'transparent'
                        }}
                      >
                        <span className="location-icon"><FaMapMarkerAlt /></span>
                        <div className="city-info">
                            <span className="city-name">
                              {city.matches && city.matches.find(m => m.key === 'name') ? (
                                <HighlightedText 
                                  text={city.name} 
                                  matches={city.matches.find(m => m.key === 'name')} 
                                />
                              ) : city.name}
                            </span>
                            <div className="country-name">
                              <span>
                                {city.matches && city.matches.find(m => m.key === 'country') ? (
                                  <HighlightedText 
                                    text={city.country} 
                                    matches={city.matches.find(m => m.key === 'country')} 
                                  />
                                ) : city.country}
                              </span>
                              {city.timezone && (
                                <span className="timezone">• {city.timezone}</span>
                              )}
                        </div>
                            <span className="coordinates">
                              {city.lat.toFixed(2)}°, {city.lng.toFixed(2)}°
                        </span>
                            {city.score && (
                              <span className="relevance-score">
                                Relevance: {((1 - city.score) * 100).toFixed(0)}%
                              </span>
                            )}
                          </div>
                          <div className="population">
                            {city.population ? (
                              <div>
                                <div style={{ fontWeight: '600', color: '#222' }}>
                                  {city.population >= 1000000 
                                    ? `${(city.population / 1000000).toFixed(1)}M`
                                    : `${(city.population / 1000).toFixed(0)}K`
                                  }
                                </div>
                                <div style={{ fontSize: '0.75rem', color: '#999' }}>
                                  people
                                </div>
                              </div>
                            ) : (
                              <div style={{ fontSize: '0.8rem', color: '#999' }}>
                                Population data unavailable
                              </div>
                            )}
                          </div>
                      </AutocompleteItem>
                    ))}
                  </AutocompleteDropdown>
                )}
              </LocationInputContainer>
            </FormField>
            <StyledMapContainer>
              <MapContainer style={{ height: '100%', width: '100%' }} center={selectedCity ? [selectedCity.lat, selectedCity.lng] : [20, 0]} zoom={selectedCity ? 10 : 2} scrollWheelZoom={false}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {selectedCity && (
                  <Marker position={[selectedCity.lat, selectedCity.lng]}>
                    <Popup>
                      {selectedCity.name}, {selectedCity.country}
                    </Popup>
                  </Marker>
                )}
              </MapContainer>
            </StyledMapContainer>
            {form.type === 'car' && (
              <FormField>
                <Label>Pickup Location</Label>
                <StyledInput name="carDetails.pickupLocation" value={form.carDetails.pickupLocation} onChange={handleChange} placeholder="Where can guests pick up the car?" required />
              </FormField>
            )}
          </>
        );
      case 2:
        return (
          <>
            <StepTitle>Tell us about your {form.type === 'car' ? 'car' : 'space'}</StepTitle>
            {form.type === 'apartment' && (
              <>
                <FormField>
                  <Label>Number of Guests</Label>
                  <StyledInput name="guests" type="number" value={form.guests} onChange={handleChange} placeholder="e.g., 4" required />
                </FormField>
                <FormField>
                  <Label>Bedrooms</Label>
                  <StyledInput name="bedrooms" type="number" value={form.bedrooms} onChange={handleChange} placeholder="e.g., 2" required />
                </FormField>
                <FormField>
                  <Label>Beds</Label>
                  <StyledInput name="beds" type="number" value={form.beds} onChange={handleChange} placeholder="e.g., 3" required />
                </FormField>
                <FormField>
                  <Label>Bathrooms</Label>
                  <StyledInput name="bathrooms" type="number" value={form.bathrooms} onChange={handleChange} placeholder="e.g., 2" required />
                </FormField>
                <FormField>
                  <Label>Bed Types (comma separated)</Label>
                  <StyledInput name="bedTypes" value={form.bedTypes} onChange={handleChange} placeholder="e.g., Queen, Twin, King" />
                </FormField>
              </>
            )}
            {form.type === 'car' && (
              <FormField>
                <Label>Car Features</Label>
                <CheckboxGrid>
                  {CAR_FEATURES.map(f => (
                    <CustomCheckbox key={f}>
                      <input
                        type="checkbox"
                        name={f}
                        checked={form.carDetails.features.includes(f)}
                        onChange={handleChange}
                      />
                      <div className="checkbox-custom">
                        {form.carDetails.features.includes(f) && <FaCheckCircle />}
                      </div>
                      <span>{f}</span>
                    </CustomCheckbox>
                  ))}
                </CheckboxGrid>
              </FormField>
            )}
          </>
        );
      case 3:
        return (
          <>
            <StepTitle>What makes your {form.type === 'car' ? 'car' : 'space'} special?</StepTitle>
            {form.type === 'apartment' && (
              <>
                <FormField>
                  <Label>Amenities</Label>
                  <CheckboxGrid>
                    {AMENITIES.map(a => (
                      <CustomCheckbox key={a}>
                        <input
                          type="checkbox"
                          name={a}
                          checked={form.amenities.includes(a)}
                          onChange={handleChange}
                        />
                        <div className="checkbox-custom">
                          {form.amenities.includes(a) && <FaCheckCircle />}
                        </div>
                        <span>{a}</span>
                      </CustomCheckbox>
                    ))}
                  </CheckboxGrid>
                </FormField>
                <FormField>
                  <Label>Highlights</Label>
                  <CheckboxGrid>
                    {HIGHLIGHTS.map(h => (
                      <CustomCheckbox key={h}>
                        <input
                          type="checkbox"
                          name={h}
                          checked={form.highlights.includes(h)}
                          onChange={handleChange}
                        />
                        <div className="checkbox-custom">
                          {form.highlights.includes(h) && <FaCheckCircle />}
                        </div>
                        <span>{h}</span>
                      </CustomCheckbox>
                    ))}
                  </CheckboxGrid>
                </FormField>
              </>
            )}
            {form.type === 'car' && (
              <FormField>
                <Label>Car Rules</Label>
                <CheckboxGrid>
                  {CAR_RULES.map(r => (
                    <CustomCheckbox key={r}>
                      <input
                        type="checkbox"
                        name={r}
                        checked={form.carDetails.rules.includes(r)}
                        onChange={handleChange}
                      />
                      <div className="checkbox-custom">
                        {form.carDetails.rules.includes(r) && <FaCheckCircle />}
                      </div>
                      <span>{r}</span>
                    </CustomCheckbox>
                  ))}
                </CheckboxGrid>
              </FormField>
            )}
          </>
        );
      case 4:
        return (
          <>
            <StepTitle>Add photos of your {form.type === 'car' ? 'car' : 'space'}</StepTitle>
            <ImageUploadArea onClick={() => document.getElementById('image-upload').click()}>
              <div className="upload-icon">
                <FaUpload />
              </div>
              <div className="upload-text">Upload photos</div>
              <div className="upload-subtext">Drag and drop or click to browse</div>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
                style={{ display: 'none' }}
              />
            </ImageUploadArea>
            {form.imagePreviews.length > 0 && (
              <ImageGrid>
                {form.imagePreviews.map((src, idx) => (
                  <ImagePreview key={idx}>
                    <img src={src} alt="preview" />
                    <div className="image-actions">
                      <button className="action-btn" onClick={() => removeImage(idx)}>
                        <FaTrash />
                      </button>
                      {idx > 0 && (
                        <button className="action-btn" onClick={() => moveImage(idx, idx - 1)}>
                          <FaChevronLeft />
                        </button>
                      )}
                      {idx < form.images.length - 1 && (
                        <button className="action-btn" onClick={() => moveImage(idx, idx + 1)}>
                          <FaChevronRight />
                        </button>
                      )}
                    </div>
                  </ImagePreview>
                ))}
              </ImageGrid>
            )}
          </>
        );
      case 5:
        return (
          <>
            <StepTitle>Describe your {form.type === 'car' ? 'car' : 'space'}</StepTitle>
            <FormField>
              <Label>Title</Label>
              <StyledInput name="title" value={form.title} onChange={handleChange} placeholder="Write a catchy title" required />
            </FormField>
            <FormField>
              <Label>Description</Label>
              <StyledTextarea name="description" value={form.description} onChange={handleChange} placeholder="Tell guests what makes your listing special..." required />
            </FormField>
          </>
        );
      case 6:
        return (
          <>
            <StepTitle>Set your pricing</StepTitle>
            <FormField>
              <Label>Price per {form.type === 'car' ? 'day' : 'night'}</Label>
              <StyledInput name="price" type="number" value={form.price} onChange={handleChange} placeholder="e.g., 150" required />
            </FormField>
            {form.type === 'apartment' && (
              <>
                <FormField>
                  <Label>Cleaning Fee</Label>
                  <StyledInput name="cleaningFee" type="number" value={form.cleaningFee} onChange={handleChange} placeholder="e.g., 50" />
                </FormField>
                <FormField>
                  <Label>Minimum Nights</Label>
                  <StyledInput name="minNights" type="number" value={form.minNights} onChange={handleChange} placeholder="e.g., 2" />
                </FormField>
                <FormField>
                  <Label>Maximum Nights</Label>
                  <StyledInput name="maxNights" type="number" value={form.maxNights} onChange={handleChange} placeholder="e.g., 30" />
                </FormField>
              </>
            )}
            {form.type === 'car' && (
              <>
                <FormField>
                  <Label>Minimum Rental Days</Label>
                  <StyledInput name="carDetails.minRentalDays" type="number" value={form.carDetails.minRentalDays} onChange={handleChange} placeholder="e.g., 1" />
                </FormField>
                <FormField>
                  <Label>Maximum Rental Days</Label>
                  <StyledInput name="carDetails.maxRentalDays" type="number" value={form.carDetails.maxRentalDays} onChange={handleChange} placeholder="e.g., 14" />
                </FormField>
              </>
            )}
          </>
        );
      case 7:
        return (
          <>
            <StepTitle>Set your rules and policies</StepTitle>
            
            {/* Payout Information */}
            <Alert variant="info" style={{ marginBottom: '24px' }}>
              <strong>Automatic Payouts:</strong> Since you're an approved host, all payments will be automatically 
              transferred to your Stripe Connect Express account after guest check-ins. The platform fee (10%) is automatically deducted.
            </Alert>
            
            <div style={{ 
              background: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '12px', 
              border: '1px solid #dee2e6',
              textAlign: 'center',
              marginBottom: '32px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>💳</div>
              <h4 style={{ color: '#28a745', marginBottom: '12px' }}>Your payout account is ready!</h4>
              <p style={{ color: '#6c757d', margin: 0 }}>
                No additional setup required. All payouts are handled automatically through your approved host account.
              </p>
            </div>
            
            <FormField>
              <Label>{form.type === 'car' ? 'Car Rules' : 'House Rules'}</Label>
              <CheckboxGrid>
                {(form.type === 'car' ? CAR_RULES : HOUSE_RULES).map(r => (
                  <CustomCheckbox key={r}>
                    <input
                      type="checkbox"
                      name={r}
                      checked={form.type === 'car' ? form.carDetails.rules.includes(r) : form.houseRules.includes(r)}
                      onChange={handleChange}
                    />
                    <div className="checkbox-custom">
                      {(form.type === 'car' ? form.carDetails.rules.includes(r) : form.houseRules.includes(r)) && <FaCheckCircle />}
                    </div>
                    <span>{r}</span>
                  </CustomCheckbox>
                ))}
              </CheckboxGrid>
            </FormField>
            <FormField>
              <Label>Cancellation Policy</Label>
              <StyledSelect name={form.type === 'car' ? 'carDetails.cancellationPolicy' : 'cancellationPolicy'} value={form.type === 'car' ? form.carDetails.cancellationPolicy : form.cancellationPolicy} onChange={handleChange} required>
                <option value="">Select cancellation policy...</option>
                {CANCELLATION_POLICIES.map(p => <option key={p} value={p}>{p}</option>)}
              </StyledSelect>
            </FormField>
            {form.type === 'apartment' && (
              <>
                <FormField>
                  <Label>Check-in Time</Label>
                  <StyledInput name="checkIn" type="time" value={form.checkIn} onChange={handleChange} />
                </FormField>
                <FormField>
                  <Label>Check-out Time</Label>
                  <StyledInput name="checkOut" type="time" value={form.checkOut} onChange={handleChange} />
                </FormField>
              </>
            )}
          </>
        );
      case 8:
        return (
          <>
            <StepTitle>Review your listing</StepTitle>
            <ReviewBox>
              <ReviewItem>
                <span className="label">Type:</span>
                <span className="value">{form.type === 'car' ? 'Car' : 'Apartment/Room'}</span>
              </ReviewItem>
              {form.type === 'apartment' && (
                <>
                  <ReviewItem>
                    <span className="label">Property Type:</span>
                    <span className="value">{form.propertyType}</span>
                  </ReviewItem>
                  <ReviewItem>
                    <span className="label">Room Type:</span>
                    <span className="value">{form.roomType}</span>
                  </ReviewItem>
                </>
              )}
              {form.type === 'car' && (
                <>
                  <ReviewItem>
                    <span className="label">Make:</span>
                    <span className="value">{form.carDetails.make}</span>
                  </ReviewItem>
                  <ReviewItem>
                    <span className="label">Model:</span>
                    <span className="value">{form.carDetails.model}</span>
                  </ReviewItem>
                  <ReviewItem>
                    <span className="label">Year:</span>
                    <span className="value">{form.carDetails.year}</span>
                  </ReviewItem>
                </>
              )}
              <ReviewItem>
                <span className="label">Location:</span>
                <span className="value">{form.location}</span>
              </ReviewItem>
              <ReviewItem>
                <span className="label">Address:</span>
                <span className="value">{form.address}</span>
              </ReviewItem>
              <ReviewItem>
                <span className="label">Title:</span>
                <span className="value">{form.title}</span>
              </ReviewItem>
              <ReviewItem>
                <span className="label">Description:</span>
                <span className="value">{form.description}</span>
              </ReviewItem>
              <ReviewItem>
                <span className="label">Price:</span>
                <span className="value">${form.price} {form.type === 'car' ? 'per day' : 'per night'}</span>
              </ReviewItem>
              <ReviewItem>
                <span className="label">Payout Method:</span>
                <span className="value">Stripe Connect (Automatic)</span>
              </ReviewItem>
              <ReviewItem>
                <span className="label">Payout Status:</span>
                <span className="value" style={{ color: '#28a745' }}>✓ Ready - No setup required</span>
              </ReviewItem>
              <ReviewItem>
                <span className="label">Images:</span>
                <span className="value">{form.images.length} photos</span>
              </ReviewItem>
            </ReviewBox>
            {form.imagePreviews.length > 0 && (
              <ImageGrid>
                {form.imagePreviews.map((src, idx) => (
                  <ImagePreview key={idx}>
                    <img src={src} alt="preview" />
                  </ImagePreview>
                ))}
              </ImageGrid>
            )}
            <StepNav>
              <StyledButton secondary onClick={prevStep}>
                <FaChevronLeft /> Back
              </StyledButton>
              <StyledButton onClick={handleSubmit} disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : <><FaCheckCircle /> Submit Listing</>}
              </StyledButton>
            </StepNav>
          </>
        );
      default:
        return null;
    }
  };

  // Submission logic
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'price', 'location'];
    const missingFields = requiredFields.filter(field => !form[field]);
    
    if (missingFields.length > 0) {
      setError(`Please fill in all required fields: ${missingFields.join(', ')}`);
      setLoading(false);
      return;
    }
    
    if (form.type === 'apartment') {
      const apartmentRequired = ['propertyType', 'roomType', 'guests', 'bedrooms', 'beds', 'bathrooms'];
      const missingApartment = apartmentRequired.filter(field => !form[field]);
      if (missingApartment.length > 0) {
        setError(`Please fill in apartment details: ${missingApartment.join(', ')}`);
        setLoading(false);
        return;
      }
    } else {
      const carRequired = ['make', 'model', 'year'];
      const missingCar = carRequired.filter(field => !form.carDetails[field]);
      if (missingCar.length > 0) {
        setError(`Please fill in car details: ${missingCar.join(', ')}`);
        setLoading(false);
        return;
      }
    }
    
    try {
      const data = new FormData();
      // Common fields
      data.append('type', form.type);
      data.append('transactionType', form.transactionType);
      data.append('title', form.title);
      data.append('description', form.description);
      data.append('price', form.price);
      data.append('address', form.address);
      data.append('location', form.location);
      
      if (form.type === 'apartment') {
        data.append('propertyType', form.propertyType);
        data.append('roomType', form.roomType);
        data.append('guests', form.guests);
        data.append('bedrooms', form.bedrooms);
        data.append('beds', form.beds);
        data.append('bathrooms', form.bathrooms);
        data.append('bedTypes', form.bedTypes);
        data.append('amenities', JSON.stringify(form.amenities));
        data.append('highlights', JSON.stringify(form.highlights));
        data.append('cleaningFee', form.cleaningFee);
        data.append('minNights', form.minNights);
        data.append('maxNights', form.maxNights);
        data.append('calendar', JSON.stringify(form.calendar));
        data.append('houseRules', JSON.stringify(form.houseRules));
        data.append('cancellationPolicy', form.cancellationPolicy);
        data.append('checkIn', form.checkIn);
        data.append('checkOut', form.checkOut);
      } else {
        data.append('carDetails', JSON.stringify({
          make: form.carDetails.make,
          model: form.carDetails.model,
          year: form.carDetails.year,
          color: form.carDetails.color,
          transmission: form.carDetails.transmission,
          fuelType: form.carDetails.fuelType,
          features: form.carDetails.features,
          seats: form.carDetails.seats,
          pickupLocation: form.carDetails.pickupLocation,
          minRentalDays: form.carDetails.minRentalDays,
          maxRentalDays: form.carDetails.maxRentalDays,
          calendar: form.carDetails.calendar,
          rules: form.carDetails.rules,
          cancellationPolicy: form.carDetails.cancellationPolicy
        }));
      }
      
      form.images.forEach(img => data.append('images', img));

      // Enforce Stripe Connect-only payouts
      data.append('payoutMethod', 'stripe_connect');
      if (form.stripeAccountId) {
        data.append('stripeAccountId', form.stripeAccountId);
      }
      
      // Log what's being sent for debugging
      console.log('Submitting listing data:', {
        type: form.type,
        title: form.title,
        description: form.description,
        price: form.price,
        location: form.location,
        images: form.images.length,
        carDetails: form.type === 'car' ? form.carDetails : null
      });
      
      // Log FormData contents for debugging
      for (let [key, value] of data.entries()) {
        console.log(`FormData - ${key}:`, value);
      }
      
      const res = await axios.post(
        'http://localhost:5000/listings',
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setSuccess('Listing created successfully!');
      setForm(initialState);
      setStep(0);
    } catch (err) {
      console.error('Submission error:', err);
      console.error('Response data:', err.response?.data);
      console.error('Response status:', err.response?.status);
      
      let errorMessage = 'Error creating listing';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <CenteredCard>
        <ModernStepper>
          {steps.map((label, idx) => (
            <StepItem key={label} active={idx === step} completed={idx < step}>
              <div className="step-icon">
                {idx < step ? <FaCheckCircle /> : 
                 idx === 0 ? <FaHome /> :
                 idx === 1 ? <FaMapMarkerAlt /> :
                 idx === 2 ? <FaCog /> :
                 idx === 3 ? <FaStar /> :
                 idx === 4 ? <FaCamera /> :
                 idx === 5 ? <FaEdit /> :
                 idx === 6 ? <FaDollarSign /> :
                 idx === 7 ? <FaShieldAlt /> :
                 idx === 8 ? <FaEye /> :
                 <FaEye />}
              </div>
              <span>{label}</span>
            </StepItem>
          ))}
        </ModernStepper>
        <ProgressBar>
          <Progress percent={((step + 1) / steps.length) * 100} />
        </ProgressBar>
        <SectionTitle>Create a New Listing</SectionTitle>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        <FormSection>
          {renderStep()}
        </FormSection>
        {step < steps.length - 1 && (
          <StepNav>
            <StyledButton secondary onClick={prevStep} disabled={step === 0}>
              <FaChevronLeft /> Back
            </StyledButton>
            <StyledButton onClick={nextStep}>
              Next <FaChevronRight />
            </StyledButton>
          </StepNav>
        )}
      </CenteredCard>
    </PageWrapper>
  );
};

export default CreateListing; 