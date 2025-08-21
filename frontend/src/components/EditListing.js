import React, { useState, useRef, useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert, Spinner } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import citiesList from 'cities-list';
import Fuse from 'fuse.js';
import worldCitiesAsia from '../data/worldCitiesAsia.json';
import worldCitiesEurope from '../data/worldCitiesEurope.json';
import worldCitiesAfricaMiddleEast from '../data/worldCitiesAfricaMiddleEast.json';
import worldCitiesAmericasOceania from '../data/worldCities.json';
import { 
  FaPlus, FaTrash, FaChevronLeft, FaChevronRight, FaCheckCircle, 
  FaHome, FaMapMarkerAlt, FaCog, FaStar, FaCamera, FaEdit, 
  FaDollarSign, FaShieldAlt, FaEye, FaUpload, FaTimes, FaSearch,
  FaGlobe, FaLocationArrow, FaCompass, FaClock, FaCar, FaBed,
  FaBath, FaUsers, FaWifi, FaTv, FaUtensils, FaParking, FaSnowflake,
  FaSwimmingPool, FaDumbbell, FaPaw, FaSmokingBan, FaWheelchair,
  FaFireExtinguisher, FaLeaf, FaGem, FaTools, FaKey, FaBolt,
  FaBluetooth, FaFlagCheckered, FaCarSide, FaGasPump, FaPalette,
  FaDoorOpen, FaRegClock, FaRegCalendarAlt, FaRegListAlt,
  FaApple, FaAndroid, FaChild, FaShoePrints, FaIdCard, FaUserTimes,
  FaUserSecret, FaRegStar
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
  
  @media (max-width: 768px) {
    font-size: 0.85rem;
    
    &:not(:last-child)::after {
      width: 20px;
      margin: 0 8px;
    }
    
    .step-icon {
      width: 28px;
      height: 28px;
      font-size: 12px;
    }
  }
  
  @media (max-width: 480px) {
    font-size: 0.8rem;
    
    &:not(:last-child)::after {
      width: 16px;
      margin: 0 6px;
    }
    
    .step-icon {
      width: 24px;
      height: 24px;
      font-size: 11px;
    }
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  margin-bottom: 40px;
  overflow: hidden;
  
  @media (max-width: 768px) {
    margin-bottom: 32px;
  }
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
    font-size: 1.75rem;
    margin-bottom: 20px;
  }
`;

const StepTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  color: ${airbnbDark};
  margin-bottom: 32px;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 1.5rem;
    margin-bottom: 24px;
  }
  
  @media (max-width: 480px) {
    font-size: 1.3rem;
    margin-bottom: 20px;
  }
`;

const FormSection = styled.div`
  margin-bottom: 40px;
  
  @media (max-width: 768px) {
    margin-bottom: 32px;
  }
`;

const FormField = styled.div`
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 16px;
  }
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${airbnbDark};
  font-size: 1rem;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    margin-bottom: 6px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin-bottom: 5px;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 16px 20px;
  border: 2px solid ${airbnbBorder};
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #fff;
  
  &:focus {
    outline: none;
    border-color: ${airbnbRed};
    box-shadow: 0 0 0 3px rgba(255, 90, 95, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
  
  @media (max-width: 768px) {
    padding: 14px 16px;
    font-size: 0.95rem;
  }
  
  @media (max-width: 480px) {
    padding: 12px 14px;
    font-size: 0.9rem;
  }
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 16px 20px;
  border: 2px solid ${airbnbBorder};
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #fff;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${airbnbRed};
    box-shadow: 0 0 0 3px rgba(255, 90, 95, 0.1);
  }
  
  @media (max-width: 768px) {
    padding: 14px 16px;
    font-size: 0.95rem;
  }
  
  @media (max-width: 480px) {
    padding: 12px 14px;
    font-size: 0.9rem;
  }
`;

const StyledTextarea = styled.textarea`
  width: 100%;
  padding: 16px 20px;
  border: 2px solid ${airbnbBorder};
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #fff;
  min-height: 120px;
  resize: vertical;
  font-family: inherit;
  
  &:focus {
    outline: none;
    border-color: ${airbnbRed};
    box-shadow: 0 0 0 3px rgba(255, 90, 95, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
  
  @media (max-width: 768px) {
    padding: 14px 16px;
    font-size: 0.95rem;
    min-height: 100px;
  }
  
  @media (max-width: 480px) {
    padding: 12px 14px;
    font-size: 0.9rem;
    min-height: 80px;
  }
`;

// Location input components
const LocationInputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const LocationIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  z-index: 2;
`;

const LocationInput = styled.input`
  width: 100%;
  padding: 16px 20px 16px 48px;
  border: 2px solid ${airbnbBorder};
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #fff;
  
  &:focus {
    outline: none;
    border-color: ${airbnbRed};
    box-shadow: 0 0 0 3px rgba(255, 90, 95, 0.1);
  }
  
  &::placeholder {
    color: #999;
  }
  
  @media (max-width: 768px) {
    padding: 14px 16px 14px 44px;
    font-size: 0.95rem;
  }
  
  @media (max-width: 480px) {
    padding: 12px 14px 12px 40px;
    font-size: 0.9rem;
  }
`;

const AutocompleteDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 2px solid ${airbnbRed};
  border-top: none;
  border-radius: 0 0 12px 12px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
`;

const AutocompleteItem = styled.div`
  padding: 12px 20px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s ease;
  
  &:hover {
    background: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const HighlightedText = ({ text, matches }) => {
  if (!matches || matches.length === 0) return text;
  
  const parts = [];
  let lastIndex = 0;
  
  matches.forEach(match => {
    const before = text.slice(lastIndex, match.indices[0]);
    const highlighted = text.slice(match.indices[0], match.indices[1] + 1);
    const after = text.slice(match.indices[1] + 1);
    
    if (before) parts.push(before);
    parts.push(<strong key={match.indices[0]} style={{ color: airbnbRed }}>{highlighted}</strong>);
    lastIndex = match.indices[1] + 1;
  });
  
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts;
};

// Image upload components
const ImageUploadSection = styled.div`
  margin-bottom: 24px;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
  }
`;

const ImageItem = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: #f8f9fa;
  border: 2px dashed ${airbnbBorder};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${airbnbRed};
    transform: translateY(-2px);
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const ImageActions = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
`;

const ImageActionButton = styled.button`
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

const UploadButton = styled.button`
  background: ${airbnbRed};
  color: white;
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  font-size: 1rem;
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
  
  @media (max-width: 768px) {
    padding: 10px 20px;
    font-size: 0.9rem;
  }
`;

// Checkbox components
const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 8px;
  }
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid ${airbnbBorder};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  
  &:hover {
    border-color: ${airbnbRed};
    background: #fff5f5;
  }
  
  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    accent-color: ${airbnbRed};
  }
  
  @media (max-width: 768px) {
    padding: 10px;
    font-size: 0.85rem;
  }
`;

// Review section components
const ReviewSection = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
`;

const ReviewItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e9ecef;
  
  &:last-child {
    border-bottom: none;
  }
`;

const ReviewLabel = styled.span`
  font-weight: 600;
  color: ${airbnbDark};
`;

const ReviewValue = styled.span`
  color: #666;
`;

const StepNav = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid ${airbnbBorder};
  
  @media (max-width: 768px) {
    margin-top: 32px;
    padding-top: 20px;
  }
  
  @media (max-width: 480px) {
    margin-top: 24px;
    padding-top: 16px;
  }
`;

const StyledButton = styled.button`
  background: ${({secondary}) => secondary ? '#fff' : airbnbRed};
  color: ${({secondary}) => secondary ? airbnbRed : '#fff'};
  border: 2px solid ${airbnbRed};
  border-radius: 12px;
  padding: 14px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0 8px;
  cursor: pointer;
  box-shadow: ${({secondary}) => secondary ? 'none' : '0 2px 12px rgba(255,90,95,0.15)'};
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({secondary}) => secondary ? '0 2px 12px rgba(255,90,95,0.15)' : '0 4px 20px rgba(255,90,95,0.25)'};
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
    margin: 0 4px;
  }
  
  @media (max-width: 480px) {
    padding: 10px 20px;
    font-size: 0.9rem;
    margin: 0 2px;
  }
`;

const ErrorMsg = styled.div`
  color: #c00;
  background: #fff0f0;
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0;
  text-align: center;
  border: 1px solid #ffcccc;
`;

const SuccessMsg = styled.div`
  color: #27ae60;
  background: #f0fff0;
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0;
  text-align: center;
  border: 1px solid #ccffcc;
`;

// Constants
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

// Combine all city data
const allCities = [
  ...Object.values(citiesList)
    .filter(city => city && city.name && city.country)
    .map(city => ({
      name: city.name,
      country: city.country,
      lat: parseFloat(city.lat) || 0,
      lng: parseFloat(city.lng) || 0,
      population: city.population || 0,
      timezone: city.timezone || null,
      altName: city.altName || null
    })),
  ...worldCitiesAsia,
  ...worldCitiesEurope,
  ...worldCitiesAfricaMiddleEast,
  ...worldCitiesAmericasOceania
];

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

const steps = [
  'Type', 'Location', 'Details', 'Amenities', 'Photos', 'Description', 'Pricing', 'Rules', 'Review'
];

const initialState = {
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
  bedTypes: '',
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
  }
};

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState(initialState);
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [listing, setListing] = useState(null);
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const fileInputRef = useRef();

  // Location autocomplete state
  const [locationQuery, setLocationQuery] = useState('');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState([]);
  const locationInputRef = useRef();

  // Load listing data
  useEffect(() => {
    setLoading(true);
          fetch(`https://drivinn.onrender.com/listings/${id}`)
      .then(async res => {
        if (!res.ok) {
          throw new Error('Failed to load listing');
        }
        return res.json();
      })
      .then(data => {
        setListing(data);
        // Parse and populate all fields
        setForm({
          ...initialState,
          ...data,
          location: typeof data.location === 'string'
            ? data.location
            : (data.location?.city && data.location?.country
                ? `${data.location.city}, ${data.location.country}`
                : ''),
          amenities: Array.isArray(data.amenities) ? data.amenities : [],
          highlights: Array.isArray(data.highlights) ? data.highlights : [],
          bedTypes: Array.isArray(data.bedTypes) ? data.bedTypes.join(', ') : '',
          houseRules: Array.isArray(data.houseRules) ? data.houseRules : [],
          images: data.images || [],
          imagePreviews: data.images || [],
          carDetails: {
            ...initialState.carDetails,
            ...data.carDetails
          }
        });
        setImages(data.images || []);
        setLocationQuery(data.location || '');
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load listing');
        setLoading(false);
      });
  }, [id]);

  // Location search functionality
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
    setLocationSuggestions([]);
    setHighlightedIndex(-1);
    
    // Save to recent searches (keep only last 5)
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item.name !== city.name);
      return [city, ...filtered].slice(0, 5);
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < locationSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleLocationSelect(locationSuggestions[highlightedIndex]);
    }
  };

  // Form handlers
  const nextStep = () => setStep(s => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm(f => ({
        ...f,
        [parent]: {
          ...f[parent],
          [child]: value
        }
      }));
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(prev => [...prev, ...files]);
  };

  const removeImage = (idx) => {
    setImages(imgs => imgs.filter((_, i) => i !== idx));
  };

  const removeNewImage = (idx) => {
    setNewImages(imgs => imgs.filter((_, i) => i !== idx));
  };

  const moveImage = (from, to) => {
    setImages(imgs => {
      const newImages = [...imgs];
      const [moved] = newImages.splice(from, 1);
      newImages.splice(to, 0, moved);
      return newImages;
    });
  };

  // Submit handler
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const data = new FormData();
      
      // Always send location as a string
      const locationString = typeof form.location === 'string'
        ? form.location
        : (form.location?.city && form.location?.country
            ? `${form.location.city}, ${form.location.country}`
            : '');
      
      data.append('location', locationString);
      data.append('title', form.title);
      data.append('description', form.description);
      data.append('price', form.price);
      data.append('type', form.type);
      data.append('transactionType', form.transactionType);
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
      data.append('address', form.address);
      
      // Car details
      data.append('carDetails', JSON.stringify(form.carDetails));
      
      // Images
      if (images.length !== (listing.images || []).length) {
        data.append('images', JSON.stringify(images));
      }
      newImages.forEach(img => data.append('images', img));
      
      const response = await fetch(`https://drivinn.onrender.com/listings/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: data
      });
      
      if (!response.ok) {
        throw new Error('Failed to update listing');
      }
      
      const result = await response.json();
      setSuccess('Listing updated successfully!');
      setListing(result);
      
      setTimeout(() => navigate(`/listing/${id}`), 1200);
    } catch (err) {
      setError(err.message || 'Failed to update listing');
    } finally {
      setLoading(false);
    }
  };

  // Render step function
  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <StepTitle>What are you listing?</StepTitle>
            <FormField>
              <Label>Listing Type</Label>
              <StyledSelect name="type" value={form.type} onChange={handleChange} required>
                <option value="apartment">Apartment/Room</option>
                <option value="car">Car</option>
              </StyledSelect>
            </FormField>
            <FormField>
              <Label>Transaction Type</Label>
              <StyledSelect name="transactionType" value={form.transactionType} onChange={handleChange} required>
                <option value="rent">Rent</option>
                <option value="sale">Sale</option>
              </StyledSelect>
            </FormField>
            {form.type === 'apartment' && (
              <>
                <FormField>
                  <Label>Property Type</Label>
                  <StyledSelect name="propertyType" value={form.propertyType} onChange={handleChange} required>
                    <option value="">Select property type...</option>
                    {PROPERTY_TYPES.map(pt => <option key={pt} value={pt}>{pt}</option>)}
                  </StyledSelect>
                </FormField>
                <FormField>
                  <Label>Room Type</Label>
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
                  placeholder="Search for any city worldwide..."
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
                        <div style={{ fontWeight: '600', color: airbnbDark }}>
                          <HighlightedText text={city.name} matches={fuse && fuse.search(locationQuery).find(r => r.item.name === city.name)?.matches} />
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          {city.country}
                        </div>
                      </AutocompleteItem>
                    ))}
                  </AutocompleteDropdown>
                )}
              </LocationInputContainer>
            </FormField>
          </>
        );
      case 2:
        return (
          <>
            <StepTitle>Tell us about your {form.type === 'car' ? 'car' : 'place'}</StepTitle>
            <FormField>
              <Label>Title</Label>
              <StyledInput name="title" value={form.title} onChange={handleChange} placeholder={`Enter a catchy title for your ${form.type === 'car' ? 'car' : 'place'}`} required />
            </FormField>
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
              <>
                <FormField>
                  <Label>Pickup Location</Label>
                  <StyledInput name="carDetails.pickupLocation" value={form.carDetails.pickupLocation} onChange={handleChange} placeholder="e.g., Airport, Downtown, Hotel" />
                </FormField>
                <FormField>
                  <Label>Minimum Rental Days</Label>
                  <StyledInput name="carDetails.minRentalDays" type="number" value={form.carDetails.minRentalDays} onChange={handleChange} placeholder="e.g., 1" />
                </FormField>
                <FormField>
                  <Label>Maximum Rental Days</Label>
                  <StyledInput name="carDetails.maxRentalDays" type="number" value={form.carDetails.maxRentalDays} onChange={handleChange} placeholder="e.g., 30" />
                </FormField>
              </>
            )}
          </>
        );
      case 3:
        return (
          <>
            <StepTitle>What does your {form.type === 'car' ? 'car' : 'place'} offer?</StepTitle>
            <FormField>
              <Label>Amenities & Features</Label>
              <CheckboxGrid>
                {(form.type === 'apartment' ? AMENITIES : CAR_FEATURES).map(amenity => (
                  <CheckboxItem key={amenity}>
                    <input
                      type="checkbox"
                      checked={form.type === 'apartment' ? form.amenities.includes(amenity) : form.carDetails.features.includes(amenity)}
                      onChange={e => {
                        if (form.type === 'apartment') {
                          setForm(f => ({
                            ...f,
                            amenities: e.target.checked 
                              ? [...f.amenities, amenity] 
                              : f.amenities.filter(x => x !== amenity)
                          }));
                        } else {
                          setForm(f => ({
                            ...f,
                            carDetails: {
                              ...f.carDetails,
                              features: e.target.checked 
                                ? [...f.carDetails.features, amenity] 
                                : f.carDetails.features.filter(x => x !== amenity)
                            }
                          }));
                        }
                      }}
                    />
                    {amenity}
                  </CheckboxItem>
                ))}
              </CheckboxGrid>
            </FormField>
            <FormField>
              <Label>Highlights (What makes it special?)</Label>
              <CheckboxGrid>
                {HIGHLIGHTS.map(highlight => (
                  <CheckboxItem key={highlight}>
                    <input
                      type="checkbox"
                      checked={form.highlights.includes(highlight)}
                      onChange={e => {
                        setForm(f => ({
                          ...f,
                          highlights: e.target.checked 
                            ? [...f.highlights, highlight] 
                            : f.highlights.filter(x => x !== highlight)
                        }));
                      }}
                    />
                    {highlight}
                  </CheckboxItem>
                ))}
              </CheckboxGrid>
            </FormField>
          </>
        );
      case 4:
        return (
          <>
            <StepTitle>Add photos of your {form.type === 'car' ? 'car' : 'place'}</StepTitle>
            <ImageUploadSection>
              <ImageGrid>
                {images.map((img, idx) => (
                  <ImageItem key={idx}>
                    <img src={img} alt={`Listing ${idx + 1}`} />
                    <ImageActions>
                      <ImageActionButton onClick={() => removeImage(idx)}>
                        <FaTrash />
                      </ImageActionButton>
                    </ImageActions>
                  </ImageItem>
                ))}
                {newImages.map((img, idx) => (
                  <ImageItem key={`new-${idx}`}>
                    <img src={URL.createObjectURL(img)} alt={`New ${idx + 1}`} />
                    <ImageActions>
                      <ImageActionButton onClick={() => removeNewImage(idx)}>
                        <FaTrash />
                      </ImageActionButton>
                    </ImageActions>
                  </ImageItem>
                ))}
                <ImageItem onClick={() => fileInputRef.current.click()}>
                  <div style={{ textAlign: 'center', color: '#666' }}>
                    <FaUpload style={{ fontSize: '2rem', marginBottom: '8px' }} />
                    <div>Add Photos</div>
                  </div>
                </ImageItem>
              </ImageGrid>
              <input
                type="file"
                multiple
                accept="image/*"
                style={{ display: 'none' }}
                ref={fileInputRef}
                onChange={handleImagesChange}
              />
              <UploadButton onClick={() => fileInputRef.current.click()}>
                <FaUpload /> Upload More Photos
              </UploadButton>
            </ImageUploadSection>
          </>
        );
      case 5:
        return (
          <>
            <StepTitle>Describe your {form.type === 'car' ? 'car' : 'place'}</StepTitle>
            <FormField>
              <Label>Description</Label>
              <StyledTextarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder={`Tell guests what makes your ${form.type === 'car' ? 'car' : 'place'} special...`}
                required
              />
            </FormField>
          </>
        );
      case 6:
        return (
          <>
            <StepTitle>Set your pricing</StepTitle>
            <FormField>
              <Label>Price per {form.transactionType === 'rent' ? (form.type === 'car' ? 'day' : 'night') : 'item'}</Label>
              <StyledInput
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g., 100"
                required
              />
            </FormField>
            {form.type === 'apartment' && form.transactionType === 'rent' && (
              <>
                <FormField>
                  <Label>Cleaning Fee (optional)</Label>
                  <StyledInput
                    name="cleaningFee"
                    type="number"
                    value={form.cleaningFee}
                    onChange={handleChange}
                    placeholder="e.g., 50"
                  />
                </FormField>
                <FormField>
                  <Label>Minimum Nights</Label>
                  <StyledInput
                    name="minNights"
                    type="number"
                    value={form.minNights}
                    onChange={handleChange}
                    placeholder="e.g., 2"
                  />
                </FormField>
                <FormField>
                  <Label>Maximum Nights</Label>
                  <StyledInput
                    name="maxNights"
                    type="number"
                    value={form.maxNights}
                    onChange={handleChange}
                    placeholder="e.g., 30"
                  />
                </FormField>
              </>
            )}
            {form.type === 'apartment' && (
              <>
                <FormField>
                  <Label>Check-in Time</Label>
                  <StyledInput
                    name="checkIn"
                    value={form.checkIn}
                    onChange={handleChange}
                    placeholder="e.g., 3:00 PM"
                  />
                </FormField>
                <FormField>
                  <Label>Check-out Time</Label>
                  <StyledInput
                    name="checkOut"
                    value={form.checkOut}
                    onChange={handleChange}
                    placeholder="e.g., 11:00 AM"
                  />
                </FormField>
              </>
            )}
          </>
        );
      case 7:
        return (
          <>
            <StepTitle>Set your rules</StepTitle>
            <FormField>
              <Label>{form.type === 'car' ? 'Car' : 'House'} Rules</Label>
              <CheckboxGrid>
                {(form.type === 'car' ? CAR_RULES : HOUSE_RULES).map(rule => (
                  <CheckboxItem key={rule}>
                    <input
                      type="checkbox"
                      checked={form.type === 'car' ? form.carDetails.rules.includes(rule) : form.houseRules.includes(rule)}
                      onChange={e => {
                        if (form.type === 'car') {
                          setForm(f => ({
                            ...f,
                            carDetails: {
                              ...f.carDetails,
                              rules: e.target.checked 
                                ? [...f.carDetails.rules, rule] 
                                : f.carDetails.rules.filter(x => x !== rule)
                            }
                          }));
                        } else {
                          setForm(f => ({
                            ...f,
                            houseRules: e.target.checked 
                              ? [...f.houseRules, rule] 
                              : f.houseRules.filter(x => x !== rule)
                          }));
                        }
                      }}
                    />
                    {rule}
                  </CheckboxItem>
                ))}
              </CheckboxGrid>
            </FormField>
            <FormField>
              <Label>Cancellation Policy</Label>
              <StyledSelect
                name={form.type === 'car' ? 'carDetails.cancellationPolicy' : 'cancellationPolicy'}
                value={form.type === 'car' ? form.carDetails.cancellationPolicy : form.cancellationPolicy}
                onChange={handleChange}
                required
              >
                <option value="">Select cancellation policy...</option>
                {CANCELLATION_POLICIES.map(policy => (
                  <option key={policy} value={policy}>{policy}</option>
                ))}
              </StyledSelect>
            </FormField>
          </>
        );
      case 8:
        return (
          <>
            <StepTitle>Review your listing</StepTitle>
            <ReviewSection>
              <ReviewItem>
                <ReviewLabel>Type:</ReviewLabel>
                <ReviewValue>{form.type === 'car' ? 'Car' : 'Apartment/Room'} - {form.transactionType === 'rent' ? 'Rent' : 'Sale'}</ReviewValue>
              </ReviewItem>
              <ReviewItem>
                <ReviewLabel>Title:</ReviewLabel>
                <ReviewValue>{form.title}</ReviewValue>
              </ReviewItem>
              <ReviewItem>
                <ReviewLabel>Location:</ReviewLabel>
                <ReviewValue>{form.location}</ReviewValue>
              </ReviewItem>
              <ReviewItem>
                <ReviewLabel>Price:</ReviewLabel>
                <ReviewValue>${form.price} per {form.transactionType === 'rent' ? (form.type === 'car' ? 'day' : 'night') : 'item'}</ReviewValue>
              </ReviewItem>
              {form.type === 'apartment' && (
                <>
                  <ReviewItem>
                    <ReviewLabel>Property Type:</ReviewLabel>
                    <ReviewValue>{form.propertyType}</ReviewValue>
                  </ReviewItem>
                  <ReviewItem>
                    <ReviewLabel>Room Type:</ReviewLabel>
                    <ReviewValue>{form.roomType}</ReviewValue>
                  </ReviewItem>
                  <ReviewItem>
                    <ReviewLabel>Guests:</ReviewLabel>
                    <ReviewValue>{form.guests}</ReviewValue>
                  </ReviewItem>
                  <ReviewItem>
                    <ReviewLabel>Bedrooms:</ReviewLabel>
                    <ReviewValue>{form.bedrooms}</ReviewValue>
                  </ReviewItem>
                  <ReviewItem>
                    <ReviewLabel>Beds:</ReviewLabel>
                    <ReviewValue>{form.beds}</ReviewValue>
                  </ReviewItem>
                  <ReviewItem>
                    <ReviewLabel>Bathrooms:</ReviewLabel>
                    <ReviewValue>{form.bathrooms}</ReviewValue>
                  </ReviewItem>
                </>
              )}
              {form.type === 'car' && (
                <>
                  <ReviewItem>
                    <ReviewLabel>Make/Model:</ReviewLabel>
                    <ReviewValue>{form.carDetails.make} {form.carDetails.model}</ReviewValue>
                  </ReviewItem>
                  <ReviewItem>
                    <ReviewLabel>Year:</ReviewLabel>
                    <ReviewValue>{form.carDetails.year}</ReviewValue>
                  </ReviewItem>
                  <ReviewItem>
                    <ReviewLabel>Color:</ReviewLabel>
                    <ReviewValue>{form.carDetails.color}</ReviewValue>
                  </ReviewItem>
                </>
              )}
              <ReviewItem>
                <ReviewLabel>Photos:</ReviewLabel>
                <ReviewValue>{images.length + newImages.length} photos</ReviewValue>
              </ReviewItem>
              <ReviewItem>
                <ReviewLabel>Amenities:</ReviewLabel>
                <ReviewValue>{form.type === 'apartment' ? form.amenities.length : form.carDetails.features.length} selected</ReviewValue>
              </ReviewItem>
              <ReviewItem>
                <ReviewLabel>Rules:</ReviewLabel>
                <ReviewValue>{form.type === 'car' ? form.carDetails.rules.length : form.houseRules.length} selected</ReviewValue>
              </ReviewItem>
            </ReviewSection>
          </>
        );
      default:
        return <div>Step not found</div>;
    }
  };

  // Loading state
  if (loading && !listing) {
    return (
      <PageWrapper>
        <CenteredCard>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spinner animation="border" variant="primary" />
            <p style={{ marginTop: '20px', color: '#666' }}>Loading listing...</p>
          </div>
        </CenteredCard>
      </PageWrapper>
    );
  }

  // Error state
  if (error && !listing) {
    return (
      <PageWrapper>
        <CenteredCard>
          <ErrorMsg>{error}</ErrorMsg>
          <StyledButton onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </StyledButton>
        </CenteredCard>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <CenteredCard>
        <ModernStepper>
          {steps.map((stepName, index) => (
            <StepItem
              key={index}
              active={step === index}
              completed={step > index}
            >
              <div className="step-icon">
                {step > index ? <FaCheckCircle /> : index + 1}
              </div>
              {stepName}
            </StepItem>
          ))}
        </ModernStepper>

        <ProgressBar>
          <Progress percent={((step + 1) / steps.length) * 100} />
        </ProgressBar>

        <SectionTitle>Edit Your Listing</SectionTitle>

        {error && <ErrorMsg>{error}</ErrorMsg>}
        {success && <SuccessMsg>{success}</SuccessMsg>}

        <form onSubmit={handleSubmit}>
          {renderStep()}
          
          <StepNav>
            <StyledButton
              type="button"
              secondary
              onClick={prevStep}
              disabled={step === 0}
            >
              <FaChevronLeft /> Previous
            </StyledButton>
            
            {step === steps.length - 1 ? (
              <StyledButton
                type="submit"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Listing'}
              </StyledButton>
            ) : (
              <StyledButton
                type="button"
                onClick={nextStep}
              >
                Next <FaChevronRight />
              </StyledButton>
            )}
          </StepNav>
        </form>
      </CenteredCard>
    </PageWrapper>
  );
};

export default EditListing; 