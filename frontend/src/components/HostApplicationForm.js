import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hostApplicationsAPI } from '../services/api';
import styled, { keyframes } from 'styled-components';
import { FaCheckCircle, FaEye, FaHome, FaIdCard, FaBuilding, FaCreditCard, FaCheck, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaFileAlt, FaStar, FaInfoCircle, FaCamera } from 'react-icons/fa';
import usaCitiesData from '../data/usaCities.json';

// Airbnb-style Host Application Form Components
const Container = styled.div`
  min-height: 100vh;
  background: #ffffff;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
`;

const AirbnbCard = styled.div`
  max-width: 1120px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #ebebeb;
  margin-top: 32px;
  margin-bottom: 32px;
  overflow: hidden;
`;

const StickyStepper = styled.div`
  position: sticky;
  top: 0;
  background: #ffffff;
  z-index: 100;
  border-bottom: 1px solid #ebebeb;
`;

const StepperBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 80px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: #ebebeb;
    z-index: 1;
  }
  
  @media (max-width: 1024px) {
    padding: 32px 40px;
  }
  @media (max-width: 768px) {
    padding: 32px 24px;
    gap: 16px;
  }
  @media (max-width: 480px) {
    padding: 32px 16px;
    gap: 12px;
  }
`;

const StepperItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
  opacity: ${props => props.active ? 1 : 0.6};
  transition: opacity 0.2s ease;
`;

const Section = styled.div`
  padding: 48px 80px;
  @media (max-width: 1024px) {
    padding: 48px 40px;
  }
  @media (max-width: 768px) {
    padding: 32px 24px;
  }
  @media (max-width: 480px) {
    padding: 24px 16px;
  }
`;

const SectionHeader = styled.h2`
  font-size: 26px;
  font-weight: 600;
  color: #222222;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  @media (max-width: 768px) {
    font-size: 24px;
    gap: 10px;
  }
  @media (max-width: 480px) {
    font-size: 22px;
    gap: 8px;
  }
`;

const SectionSub = styled.p`
  font-size: 16px;
  color: #717171;
  margin-bottom: 40px;
  line-height: 1.5;
  @media (max-width: 768px) {
    font-size: 15px;
    margin-bottom: 32px;
  }
  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 24px;
  }
`;

const NavBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid #ebebeb;
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    margin-top: 32px;
    padding-top: 24px;
  }
  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const NavButton = styled.button`
  padding: 14px 24px;
  border: 1px solid #222222;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  background: #ffffff;
  color: #222222;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #222222;
    color: #ffffff;
  }
  
  &:disabled {
    opacity: 0.5;
    background: #f5f5f5;
    color: #b0b0b0;
    border-color: #ebebeb;
    cursor: not-allowed;
  }
`;

const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
  @media (max-width: 700px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 700;
  color: #222;
  font-size: 1rem;
  margin-bottom: 2px;
`;

const RequiredField = styled.span`
  color: #ff385c;
  font-weight: 600;
  font-size: 16px;
`;

const Input = styled.input`
  padding: 14px 18px;
  border: 1.5px solid #FFB800;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  color: #222;
  &:focus {
    outline: none;
    border-color: #FF385C;
    box-shadow: 0 0 0 2px rgba(255,56,92,0.09);
  }
`;

const Select = styled.select`
  padding: 14px 18px;
  border: 1.5px solid #FFB800;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  color: #222;
  &:focus {
    outline: none;
    border-color: #FF385C;
    box-shadow: 0 0 0 2px rgba(255,56,92,0.09);
  }
`;

const TextArea = styled.textarea`
  padding: 14px 18px;
  border: 1.5px solid #FFB800;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  color: #222;
  resize: vertical;
  min-height: 100px;
  &:focus {
    outline: none;
    border-color: #FF385C;
    box-shadow: 0 0 0 2px rgba(255,56,92,0.09);
  }
`;

const FileUploadArea = styled.div`
  border: 2px dashed #b0b0b0;
  border-radius: 12px;
  padding: 40px 24px;
  text-align: center;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    border-color: #FF385C;
    background: #fff5f7;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 56, 92, 0.1);
  }
  
  ${props => props.hasFile && `
    border-color: #00a699;
    background: #f0f9f8;
  `}
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 56, 92, 0.05);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

const FileUploadIcon = styled.div`
  font-size: 48px;
  color: #FF385C;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${FileUploadArea}:hover & {
    color: #e31c5f;
    transform: scale(1.1);
  }
`;

const FileUploadText = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #222222;
  margin-bottom: 8px;
  transition: color 0.3s ease;
  
  ${FileUploadArea}:hover & {
    color: #FF385C;
  }
`;

const FileUploadHint = styled.div`
  font-size: 14px;
  color: #717171;
  margin-top: 8px;
`;

const FilePreview = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: #f0f9f8;
  border-radius: 8px;
  border: 1px solid #00a699;
`;

const FileName = styled.div`
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #222222;
`;

const FileSize = styled.div`
  font-size: 13px;
  color: #717171;
`;

const StepNavigation = styled.div`
  padding: 32px 80px;
  background: #ffffff;
  border-top: 1px solid #ebebeb;
  display: flex;
  justify-content: space-between;
  align-items: center;
  @media (max-width: 1024px) {
    padding: 32px 40px;
  }
  @media (max-width: 768px) {
    padding: 32px 24px;
    flex-direction: column;
    gap: 16px;
  }
  @media (max-width: 480px) {
    padding: 24px 16px;
  }
`;

const StepButton = styled.button`
  padding: 14px 24px;
  border: 1px solid #222222;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  background: #ffffff;
  color: #222222;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #222222;
    color: #ffffff;
  }
  
  &:disabled {
    opacity: 0.5;
    background: #f5f5f5;
    color: #b0b0b0;
    border-color: #ebebeb;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  padding: 14px 24px;
  border: 1px solid #ff385c;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  background: #ff385c;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #e31c5f;
  }
  
  &:disabled {
    opacity: 0.5;
    background: #f5f5f5;
    color: #b0b0b0;
    border-color: #ebebeb;
    cursor: not-allowed;
  }
`;

const InfoBox = styled.div`
  background: #f7f7f7;
  border: 1px solid #ebebeb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 32px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const InfoIcon = styled.div`
  color: #717171;
  font-size: 18px;
  margin-top: 2px;
`;

const InfoText = styled.div`
  color: #717171;
  font-size: 14px;
  line-height: 1.5;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const SuccessContainer = styled.div`
  padding: 80px 24px;
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
`;

const SuccessIcon = styled.div`
  font-size: 64px;
  color: #00a699;
  margin-bottom: 32px;
`;

const SuccessTitle = styled.h2`
  font-size: 32px;
  font-weight: 600;
  color: #222222;
  margin: 0 0 16px 0;
  line-height: 1.2;
`;

const SuccessMessage = styled.p`
  font-size: 16px;
  color: #717171;
  margin: 0 0 40px 0;
  line-height: 1.5;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  @media (max-width: 480px) {
    flex-direction: column;
    align-items: center;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border: 1px solid #222222;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  background: #ffffff;
  color: #222222;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #222222;
    color: #ffffff;
  }
`;

const ReviewSection = styled.div`
  background: #f7f7f7;
  border-radius: 8px;
  padding: 32px;
  margin-bottom: 32px;
  border: 1px solid #ebebeb;
`;

const ReviewTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #222222;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ReviewGrid = styled.div`
  display: grid;
  gap: 20px;
`;

const ReviewItem = styled.div`
  background: #ffffff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ebebeb;
`;

const ReviewLabel = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #222222;
  margin-bottom: 8px;
`;

const ReviewValue = styled.div`
  color: #717171;
  font-size: 14px;
  line-height: 1.4;
`;

// Animation keyframes
const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const StyledComponents = styled.div`
  animation: ${fadeIn} 0.6s ease-out;
`;


const StepLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.active ? '#222222' : '#717171'};
  text-align: center;
  transition: color 0.2s ease;
  // margin-top: 40px;
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
  @media (max-width: 480px) {
    font-size: 11px;
    min-width: 60px;
  }
`;

const StepCircle = styled.div`
  margin-top: 40px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.active ? '#222222' : '#ffffff'};
  color: ${props => props.active ? '#ffffff' : '#222222'};
  border: 2px solid ${props => props.active ? '#222222' : '#ebebeb'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 12px;
  position: relative;
  z-index: 2;
  transition: all 0.2s ease;
  
  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
    font-size: 14px;
  }
  @media (max-width: 480px) {
    width: 32px;
    height: 32px;
    font-size: 12px;
    min-width: 32px;
  }
`;

const StepTitle = styled.h2`
  font-size: 26px;
  font-weight: 600;
  color: #222222;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  @media (max-width: 768px) {
    font-size: 24px;
    gap: 10px;
  }
  @media (max-width: 480px) {
    font-size: 22px;
    gap: 8px;
  }
`;

const StepSubtitle = styled.p`
  font-size: 16px;
  color: #717171;
  margin-bottom: 40px;
  line-height: 1.5;
  @media (max-width: 768px) {
    font-size: 15px;
    margin-bottom: 32px;
  }
  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 24px;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
  @media (max-width: 768px) {
    gap: 20px;
    margin-bottom: 32px;
  }
  @media (max-width: 480px) {
    gap: 16px;
    margin-bottom: 24px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ConditionalField = styled.div`
  transition: all 0.3s ease;
  opacity: ${props => props.visible ? 1 : 0.7};
  
  ${props => props.visible && `
    animation: ${fadeIn} 0.3s ease-out;
  `}
`;

const CountrySelect = styled(Select)`
  ${props => props.selected && `
    border-color: #00a699;
    background-color: #f0f9f8;
  `}
`;

const StateCityGroup = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const steps = [
  { id: 0, label: 'Personal Info', icon: FaUser },
  { id: 1, label: 'Identity Verification', icon: FaIdCard },
  { id: 2, label: 'Business & Financial', icon: FaBuilding },
  { id: 3, label: 'Payment Methods', icon: FaCreditCard },
  { id: 4, label: 'Property Info', icon: FaHome },
  { id: 5, label: 'Review & Submit', icon: FaCheck }
];

const HostApplicationForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isEditMode = location.state?.editMode;
  const existingApplication = location.state?.applicationData;
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    // Personal Information
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    dateOfBirth: '',
    // Identity Verification
    idType: '',
    idNumber: '',
    idFrontImage: null,
    idBackImage: null,
    selfieImage: null,
    // Financial Information
    ssn: '',
    ssnLast4: '',
    supportPhone: '',
    bankAccountNumber: '',
    bankRoutingNumber: '',
    bankAccountType: '',
    // Payment Methods
    stripeAccountId: '',
    creditCardLast4: '',
    // Property Information
    propertyType: '',
    propertyDescription: '',
    hostingExperience: ''
  });
  const [success, setSuccess] = useState(false);
  const [applicationData, setApplicationData] = useState(null);

  // US States and Cities data
  const [usStates, setUsStates] = useState([]);
  const [usCities, setUsCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);

  // Process US cities data to extract unique states and cities
  useEffect(() => {
    if (usaCitiesData && usaCitiesData.length > 0) {
      // Extract unique states
      const uniqueStates = [...new Set(usaCitiesData.map(city => city.state))].sort();
      setUsStates(uniqueStates);
      
      // Store all cities
      setUsCities(usaCitiesData);
    }
  }, []);

  // Filter cities when state changes
  useEffect(() => {
    if (formData.state && formData.country === 'United States') {
      const citiesInState = usCities
        .filter(city => city.state === formData.state)
        .map(city => city.name)
        .sort();
      setFilteredCities(citiesInState);
    } else {
      setFilteredCities([]);
    }
  }, [formData.state, formData.country, usCities]);

  // Load existing application data if in edit mode
  useEffect(() => {
    if (isEditMode && existingApplication) {
      console.log('Loading existing application data:', existingApplication);
      setFormData({
        // Personal Information
        firstName: existingApplication.firstName || user?.firstName || '',
        lastName: existingApplication.lastName || user?.lastName || '',
        email: existingApplication.email || user?.email || '',
        phoneNumber: existingApplication.phoneNumber || '',
        street: existingApplication.postalAddress?.street || '',
        city: existingApplication.postalAddress?.city || '',
        state: existingApplication.postalAddress?.state || '',
        postalCode: existingApplication.postalAddress?.postalCode || '',
        country: existingApplication.postalAddress?.country || '',
        dateOfBirth: existingApplication.dateOfBirth ? new Date(existingApplication.dateOfBirth).toISOString().split('T')[0] : '',
        // Identity Verification
        idType: existingApplication.identityDocuments?.idType || '',
        idNumber: existingApplication.identityDocuments?.idNumber || '',
        idFrontImage: null, // Files need to be re-uploaded
        idBackImage: null,
        selfieImage: null,
        // Financial Information
        ssn: existingApplication.ssn || '',
        ssnLast4: existingApplication.ssnLast4 || '',
        supportPhone: existingApplication.supportPhone || '',
        bankAccountNumber: existingApplication.bankAccount?.accountNumber || '',
        bankRoutingNumber: existingApplication.bankAccount?.routingNumber || '',
        bankAccountType: existingApplication.bankAccount?.accountType || '',
        // Payment Methods
        stripeAccountId: existingApplication.paymentMethods?.stripeAccountId || '',
        creditCardLast4: existingApplication.paymentMethods?.creditCard?.last4 || '',
        // Property Information
        propertyType: existingApplication.propertyType || '',
        propertyDescription: existingApplication.propertyDescription || '',
        hostingExperience: existingApplication.hostingExperience || ''
      });
    }
  }, [isEditMode, existingApplication, user]);

  // Check if user already has an application (not in edit mode)
  useEffect(() => {
    const checkExistingApplication = async () => {
      if (!isEditMode && user) {
        try {
          const response = await hostApplicationsAPI.getMy();
          if (response.data && response.data.length > 0) {
            // User has an existing application, redirect to status page
            navigate('/become-a-host/status');
          }
        } catch (err) {
          console.log('No existing application found or error checking:', err);
        }
      }
    };

    checkExistingApplication();
  }, [isEditMode, user, navigate]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // If country changes, reset state and city
    if (field === 'country') {
      setFormData(prev => ({ 
        ...prev, 
        [field]: value,
        state: '',
        city: ''
      }));
    }
    
    // If state changes, reset city
    if (field === 'state') {
      setFormData(prev => ({ 
        ...prev, 
        [field]: value,
        city: ''
      }));
    }
  };

  const handleFileChange = (field, file) => {
    console.log(`File change for ${field}:`, file);
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const canProceedToNextStep = () => {
    // Allow users to navigate freely through all steps
    return true;
  };

  const validateCurrentStep = () => {
    switch (currentStep) {
      case 0: // Personal Info
        if (formData.country === 'United States') {
          // For US addresses, ensure state and city are selected from dropdowns
          if (!formData.state || !formData.city) {
            return false;
          }
        }
        
        // Basic validation for required fields
        const basicFieldsValid = formData.firstName && formData.lastName && formData.email && 
               formData.phoneNumber && formData.street && formData.city && 
               formData.state && formData.postalCode && formData.country && 
               formData.dateOfBirth;
        
        if (!basicFieldsValid) return false;
        
        // Country-specific validation
        if (formData.country === 'United States') {
          // US postal code should be 5 digits or 5+4 format
          const usPostalCodeRegex = /^\d{5}(-\d{4})?$/;
          if (!usPostalCodeRegex.test(formData.postalCode)) {
            return false;
          }
        } else if (formData.country === 'United Kingdom') {
          // UK postal code format validation
          const ukPostalCodeRegex = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;
          if (!ukPostalCodeRegex.test(formData.postalCode)) {
            return false;
          }
        }
        
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      nextStep();
    } else {
      let errorMessage = 'Please fill in all required fields correctly.';
      
      if (formData.country === 'United States') {
        if (!formData.state || !formData.city) {
          errorMessage = 'For US addresses, please select both state and city from the dropdowns.';
        } else if (!/^\d{5}(-\d{4})?$/.test(formData.postalCode)) {
          errorMessage = 'Please enter a valid US postal code (e.g., 12345 or 12345-6789).';
        }
      } else if (formData.country === 'United Kingdom') {
        if (!/^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i.test(formData.postalCode)) {
          errorMessage = 'Please enter a valid UK postal code (e.g., SW1A 1AA).';
        }
      }
      
      setError(errorMessage);
    }
  };

  const handlePreviousStep = () => {
    prevStep();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (currentStep !== steps.length - 1) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formDataToSend = new FormData();
      
      // Personal Information
      formDataToSend.append('firstName', formData.firstName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('phoneNumber', formData.phoneNumber);
      formDataToSend.append('dateOfBirth', formData.dateOfBirth);
      formDataToSend.append('idType', formData.idType);
      formDataToSend.append('idNumber', formData.idNumber);
      
      // Address Information
      formDataToSend.append('street', formData.street);
      formDataToSend.append('city', formData.city);
      formDataToSend.append('state', formData.state);
      formDataToSend.append('postalCode', formData.postalCode);
      formDataToSend.append('country', formData.country);
      
      // Financial Information
      formDataToSend.append('ssn', formData.ssn);
      formDataToSend.append('ssnLast4', formData.ssnLast4);
      formDataToSend.append('supportPhone', formData.supportPhone);
      formDataToSend.append('bankAccountNumber', formData.bankAccountNumber);
      formDataToSend.append('bankRoutingNumber', formData.bankRoutingNumber);
      formDataToSend.append('bankAccountType', formData.bankAccountType);
      
      // Property Information
      formDataToSend.append('propertyType', formData.propertyType);
      formDataToSend.append('propertyDescription', formData.propertyDescription);
      formDataToSend.append('hostingExperience', formData.hostingExperience);
      
      // Append files
      if (formData.idFrontImage) {
        formDataToSend.append('idFrontImage', formData.idFrontImage);
      }
      if (formData.idBackImage) {
        formDataToSend.append('idBackImage', formData.idBackImage);
      }
      if (formData.selfieImage) {
        formDataToSend.append('selfieImage', formData.selfieImage);
      }

      const response = await hostApplicationsAPI.submit(formDataToSend);
      
      if (response.data) {
        setLoading(false);
        setSuccess(true);
        setApplicationData(response.data);
      }
    } catch (err) {
      console.error('Error submitting application:', err);
      setError(err.response?.data?.message || 'Failed to submit application. Please try again.');
      setLoading(false);
    }
  };

  const renderPersonalInfoStep = () => (
    <>
      <StepTitle>
        <FaUser /> Personal Information
      </StepTitle>
      <StepSubtitle>
        Please provide your contact information and address details.
      </StepSubtitle>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#222222', marginBottom: '16px' }}>
          Personal Details
        </h3>
      </div>

      <FormGrid>
        <FormGroup>
          <Label><FaUser /> First Name <RequiredField>*</RequiredField></Label>
          <Input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="First Name"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label><FaUser /> Last Name <RequiredField>*</RequiredField></Label>
          <Input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Last Name"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label><FaEnvelope /> Email <RequiredField>*</RequiredField></Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Email"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label><FaPhone /> Phone Number <RequiredField>*</RequiredField></Label>
          <Input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            placeholder="+1 (555) 123-4567"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label><FaMapMarkerAlt /> Street Address <RequiredField>*</RequiredField></Label>
          <Input
            type="text"
            value={formData.street}
            onChange={(e) => handleInputChange('street', e.target.value)}
            placeholder="123 Main Street, Apt 4B"
            required
          />
        </FormGroup>
        
        <StateCityGroup>
          <FormGroup>
            <Label><FaMapMarkerAlt /> City <RequiredField>*</RequiredField></Label>
            <ConditionalField visible={formData.country === 'United States' && formData.state}>
              {formData.country === 'United States' && formData.state ? (
                <CountrySelect
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  selected={!!formData.city}
                  required
                >
                  <option value="">Select City</option>
                  {filteredCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </CountrySelect>
              ) : (
                <Input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="City"
                  required
                />
              )}
            </ConditionalField>
          </FormGroup>
          
          <FormGroup>
            <Label><FaMapMarkerAlt /> State/Province <RequiredField>*</RequiredField></Label>
            <ConditionalField visible={formData.country === 'United States'}>
              {formData.country === 'United States' ? (
                <CountrySelect
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  selected={!!formData.state}
                  required
                >
                  <option value="">Select State</option>
                  {usStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </CountrySelect>
              ) : (
                <Input
                  type="text"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="State or Province"
                  required
                />
              )}
            </ConditionalField>
          </FormGroup>
        </StateCityGroup>
        
        <FormGroup>
          <Label><FaMapMarkerAlt /> Postal Code <RequiredField>*</RequiredField></Label>
          <Input
            type="text"
            value={formData.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            placeholder={formData.country === 'United States' ? '12345 or 12345-6789' : 
                        formData.country === 'United Kingdom' ? 'SW1A 1AA' : 
                        '12345 or A1B 2C3'}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label><FaMapMarkerAlt /> Country <RequiredField>*</RequiredField></Label>
          <CountrySelect
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            selected={!!formData.country}
            required
          >
            <option value="">Select Country</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
          </CountrySelect>
        </FormGroup>

        <FormGroup>
          <Label><FaCalendarAlt /> Date of Birth <RequiredField>*</RequiredField></Label>
          <Input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            required
          />
        </FormGroup>
      </FormGrid>

      {formData.country === 'United States' && (
        <InfoBox>
          <InfoIcon>ℹ️</InfoIcon>
          <InfoText>
            <strong>US Address Help:</strong> When you select "United States", you can use the dropdown menus to easily select your state and city. 
            This helps ensure accurate address information and faster processing of your application.
          </InfoText>
        </InfoBox>
      )}
      
      {formData.country === 'United Kingdom' && (
        <InfoBox>
          <InfoIcon>ℹ️</InfoIcon>
          <InfoText>
            <strong>UK Address Help:</strong> For UK addresses, please use the standard UK format. 
            Postal codes should follow the format like "SW1A 1AA" or "M1 1AA".
          </InfoText>
        </InfoBox>
      )}
    </>
  );

  const renderIdentityVerificationStep = () => (
    <>
      <StepTitle>
        <FaIdCard /> Identity Verification
      </StepTitle>
      <StepSubtitle>
        Please provide your identity verification documents.
      </StepSubtitle>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#222222', marginBottom: '16px' }}>
          Document Information
        </h3>
      </div>

      <FormGrid>
        <FormGroup>
          <Label><FaIdCard /> ID Type <RequiredField>*</RequiredField></Label>
          <Select
            value={formData.idType}
            onChange={(e) => handleInputChange('idType', e.target.value)}
            required
          >
            <option value="">Select ID Type</option>
            <option value="passport">Passport</option>
            <option value="national_id">National ID</option>
            <option value="tax_id">Tax ID</option>
            <option value="driving_license">Driving License</option>
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label><FaIdCard /> ID Number <RequiredField>*</RequiredField></Label>
          <Input
            type="text"
            value={formData.idNumber}
            onChange={(e) => handleInputChange('idNumber', e.target.value)}
            placeholder="ID Number"
            required
          />
        </FormGroup>
      </FormGrid>

      <FormGrid>
        <FormGroup>
          <Label><FaCamera /> ID Front Image <RequiredField>*</RequiredField></Label>
          <FileUploadArea
            hasFile={formData.idFrontImage}
            onClick={() => document.getElementById('idFrontImage').click()}
          >
            <FileUploadIcon>
              <FaCamera />
            </FileUploadIcon>
            <FileUploadText>
              {formData.idFrontImage ? 'File Selected' : 'Click to Upload'}
            </FileUploadText>
            <FileUploadHint>
              Upload the front of your ID document
            </FileUploadHint>
          </FileUploadArea>
          <HiddenFileInput
            id="idFrontImage"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange('idFrontImage', e.target.files[0])}
          />
          {formData.idFrontImage && (
            <FilePreview>
              <FileName>{formData.idFrontImage.name}</FileName>
              <FileSize>{(formData.idFrontImage.size / 1024 / 1024).toFixed(2)} MB</FileSize>
            </FilePreview>
          )}
        </FormGroup>

        <FormGroup>
          <Label><FaCamera /> ID Back Image <RequiredField>*</RequiredField></Label>
          <FileUploadArea
            hasFile={formData.idBackImage}
            onClick={() => document.getElementById('idBackImage').click()}
          >
            <FileUploadIcon>
              <FaCamera />
            </FileUploadIcon>
            <FileUploadText>
              {formData.idBackImage ? 'File Selected' : 'Click to Upload'}
            </FileUploadText>
            <FileUploadHint>
              Upload the back of your ID document
            </FileUploadHint>
          </FileUploadArea>
          <HiddenFileInput
            id="idBackImage"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange('idBackImage', e.target.files[0])}
          />
          {formData.idBackImage && (
            <FilePreview>
              <FileName>{formData.idBackImage.name}</FileName>
              <FileSize>{(formData.idBackImage.size / 1024 / 1024).toFixed(2)} MB</FileSize>
            </FilePreview>
          )}
        </FormGroup>

        <FormGroup>
          <Label><FaCamera /> Selfie Image <RequiredField>*</RequiredField></Label>
          <FileUploadArea
            hasFile={formData.selfieImage}
            onClick={() => document.getElementById('selfieImage').click()}
          >
            <FileUploadIcon>
              <FaCamera />
            </FileUploadIcon>
            <FileUploadText>
              {formData.selfieImage ? 'File Selected' : 'Click to Upload'}
            </FileUploadText>
            <FileUploadHint>
              Upload a clear selfie photo
            </FileUploadHint>
          </FileUploadArea>
          <HiddenFileInput
            id="selfieImage"
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange('selfieImage', e.target.files[0])}
          />
          {formData.selfieImage && (
            <FilePreview>
              <FileName>{formData.selfieImage.name}</FileName>
              <FileSize>{(formData.selfieImage.size / 1024 / 1024).toFixed(2)} MB</FileSize>
            </FilePreview>
          )}
        </FormGroup>
      </FormGrid>
    </>
  );

  const renderBusinessFinancialStep = () => (
    <>
      <StepTitle>
        <FaBuilding /> Business & Financial Information
      </StepTitle>
      <StepSubtitle>
        Please provide your financial details for Stripe integration and payouts.
      </StepSubtitle>

      <StepTitle style={{ marginTop: '32px', fontSize: '1.5rem' }}>
        <FaCreditCard /> Financial Information for Payouts
      </StepTitle>
      
      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#222222', marginBottom: '16px' }}>
          Bank Account Information
        </h3>
      </div>

      <FormGrid>
        <FormGroup>
          <Label>Full Social Security Number (SSN) <RequiredField>*</RequiredField></Label>
          <Input
            type="password"
            value={formData.ssn}
            onChange={(e) => handleInputChange('ssn', e.target.value)}
            placeholder="XXX-XX-XXXX"
            maxLength="11"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label>SSN Last 4 Digits (for verification) <RequiredField>*</RequiredField></Label>
          <Input
            type="text"
            value={formData.ssnLast4}
            onChange={(e) => handleInputChange('ssnLast4', e.target.value)}
            placeholder="XXXX"
            maxLength="4"
            pattern="[0-9]{4}"
            title="Please enter exactly 4 digits"
            required
          />
        </FormGroup>

        <FormGroup>
          <Label>Support Phone Number <RequiredField>*</RequiredField></Label>
          <Input
            type="tel"
            value={formData.supportPhone}
            onChange={(e) => handleInputChange('supportPhone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Bank Account Type <RequiredField>*</RequiredField></Label>
          <Select
            value={formData.bankAccountType}
            onChange={(e) => handleInputChange('bankAccountType', e.target.value)}
            required
          >
            <option value="">Select Account Type</option>
            <option value="checking">Checking</option>
            <option value="savings">Savings</option>
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label>Bank Routing Number <RequiredField>*</RequiredField></Label>
          <Input
            type="text"
            value={formData.bankRoutingNumber}
            onChange={(e) => handleInputChange('bankRoutingNumber', e.target.value)}
            placeholder="123456789"
            maxLength="9"
            pattern="[0-9]{9}"
            title="Please enter exactly 9 digits"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Bank Account Number <RequiredField>*</RequiredField></Label>
          <Input
            type="text"
            value={formData.bankAccountNumber}
            onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
            placeholder="1234567890"
            maxLength="17"
            pattern="[0-9]+"
            title="Please enter only numbers"
            required
          />
        </FormGroup>
      </FormGrid>
    </>
  );

  const renderPaymentMethodsStep = () => (
    <>
      <StepTitle>
        <FaCreditCard /> Payment Methods
      </StepTitle>
      <StepSubtitle>
        Please provide at least one payment method for receiving payouts.
      </StepSubtitle>

      <FormGrid>
        <FormGroup>
          <Label>Stripe Account ID (Optional)</Label>
          <Input
            type="text"
            value={formData.stripeAccountId}
            onChange={(e) => handleInputChange('stripeAccountId', e.target.value)}
            placeholder="acct_xxxxxxxxxxxxx"
          />
        </FormGroup>

        <FormGroup>
          <Label>Credit Card Last 4 Digits (Optional)</Label>
          <Input
            type="text"
            value={formData.creditCardLast4}
            onChange={(e) => handleInputChange('creditCardLast4', e.target.value)}
            placeholder="1234"
            maxLength="4"
          />
        </FormGroup>
      </FormGrid>
    </>
  );

  const renderPropertyInfoStep = () => (
    <>
      <StepTitle>
        <FaHome /> Property Information
      </StepTitle>
      <StepSubtitle>
        Tell us about the property you want to list and your hosting experience.
      </StepSubtitle>

      <div style={{ marginBottom: '32px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#222222', marginBottom: '16px' }}>
          Property Details
        </h3>
      </div>

      <FormGrid>
        <FormGroup>
          <Label><FaHome /> Property Type <RequiredField>*</RequiredField></Label>
          <Select
            value={formData.propertyType}
            onChange={(e) => handleInputChange('propertyType', e.target.value)}
            required
          >
            <option value="">Select Property Type</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="car">Car</option>
            <option value="other">Other</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label><FaFileAlt /> Property Description <RequiredField>*</RequiredField></Label>
          <TextArea
            value={formData.propertyDescription}
            onChange={(e) => handleInputChange('propertyDescription', e.target.value)}
            placeholder="Describe your property, amenities, and what makes it special..."
            required
          />
        </FormGroup>

        <FormGroup>
          <Label><FaStar /> Hosting Experience</Label>
          <TextArea
            value={formData.hostingExperience}
            onChange={(e) => handleInputChange('hostingExperience', e.target.value)}
            placeholder="Tell us about your experience with hosting or customer service..."
          />
        </FormGroup>
      </FormGrid>
    </>
  );

  const renderReviewStep = () => (
    <>
      <StepTitle>
        <FaCheck /> Review & Submit
      </StepTitle>
      <StepSubtitle>
        Please review your application before submitting.
      </StepSubtitle>

      <ReviewSection>
        <ReviewTitle>
          <FaInfoCircle /> Application Overview
        </ReviewTitle>
        <ReviewGrid>
          <ReviewItem>
            <ReviewLabel>Name</ReviewLabel>
            <ReviewValue>{formData.firstName} {formData.lastName}</ReviewValue>
          </ReviewItem>
          <ReviewItem>
            <ReviewLabel>Email</ReviewLabel>
            <ReviewValue>{formData.email}</ReviewValue>
          </ReviewItem>
          <ReviewItem>
            <ReviewLabel>Phone</ReviewLabel>
            <ReviewValue>{formData.phoneNumber}</ReviewValue>
          </ReviewItem>
          <ReviewItem>
            <ReviewLabel>Date of Birth</ReviewLabel>
            <ReviewValue>{formData.dateOfBirth}</ReviewValue>
          </ReviewItem>
        </ReviewGrid>
        
        <ReviewGrid>
          <ReviewItem>
            <ReviewLabel>Address</ReviewLabel>
            <ReviewValue>{formData.street}, {formData.city}, {formData.state} {formData.postalCode}, {formData.country}</ReviewValue>
          </ReviewItem>
        </ReviewGrid>

        <ReviewGrid>
          <ReviewItem>
            <ReviewLabel>Identity Verification</ReviewLabel>
            <ReviewValue>ID Type: {formData.idType}</ReviewValue>
            <ReviewValue>ID Number: {formData.idNumber}</ReviewValue>
            <ReviewValue>Documents: {formData.idFrontImage ? 'Front ✓' : 'Front ✗'}, {formData.idBackImage ? 'Back ✓' : 'Back ✗'}, {formData.selfieImage ? 'Selfie ✓' : 'Selfie ✗'}</ReviewValue>
          </ReviewItem>
        </ReviewGrid>

        <ReviewGrid>
          <ReviewItem>
            <ReviewLabel>Financial Information</ReviewLabel>
            <ReviewValue>SSN: {formData.ssn ? '****' : 'Not provided'}</ReviewValue>
            <ReviewValue>SSN Last 4: {formData.ssnLast4 ? '****' : 'Not provided'}</ReviewValue>
            <ReviewValue>Support Phone: {formData.supportPhone || 'Not provided'}</ReviewValue>
            <ReviewValue>Bank Account Type: {formData.bankAccountType || 'Not selected'}</ReviewValue>
            <ReviewValue>Bank Routing Number: {formData.bankAccountNumber ? '****' : 'Not provided'}</ReviewValue>
            <ReviewValue>Bank Account Number: {formData.bankAccountNumber ? '****' : 'Not provided'}</ReviewValue>
          </ReviewItem>
        </ReviewGrid>

        <ReviewGrid>
          <ReviewItem>
            <ReviewLabel>Payment Methods</ReviewLabel>
            <ReviewValue>Stripe Account: {formData.stripeAccountId || 'Not provided'}</ReviewValue>
            <ReviewValue>Credit Card: {formData.creditCardLast4 ? `****${formData.creditCardLast4}` : 'Not provided'}</ReviewValue>
          </ReviewItem>
        </ReviewGrid>

        <ReviewGrid>
          <ReviewItem>
            <ReviewLabel>Property Information</ReviewLabel>
            <ReviewValue>Type: {formData.propertyType}</ReviewValue>
            <ReviewValue>Description: {formData.propertyDescription}</ReviewValue>
            <ReviewValue>Experience: {formData.hostingExperience || 'Not provided'}</ReviewValue>
          </ReviewItem>
        </ReviewGrid>
      </ReviewSection>

      <InfoBox>
        <InfoIcon />
        <InfoText>
          By submitting this application, you agree to our terms of service and privacy policy. 
          Your application will be reviewed within 2-3 business days.
        </InfoText>
      </InfoBox>
    </>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderPersonalInfoStep();
      case 1:
        return renderIdentityVerificationStep();
      case 2:
        return renderBusinessFinancialStep();
      case 3:
        return renderPaymentMethodsStep();
      case 4:
        return renderPropertyInfoStep();
      case 5:
        return renderReviewStep();
      default:
        return null;
    }
  };

  if (success && applicationData) {
    return (
      <StyledComponents>
        <Container>
          <SuccessContainer>
            <SuccessIcon>
              <FaCheckCircle />
            </SuccessIcon>
            <SuccessTitle>Application Submitted Successfully!</SuccessTitle>
            <SuccessMessage>
              Your host application has been submitted and is currently under review by our team. 
              We'll notify you via email once the review is complete.
            </SuccessMessage>
            
            <InfoBox>
              <InfoIcon />
              <InfoText>
                <strong>What happens next?</strong> Our team will review your application within 2-3 business days. 
                You'll receive email notifications at each step of the process.
              </InfoText>
            </InfoBox>
            
            <ActionButtons>
              <ActionButton onClick={() => navigate('/host-application-status')}>
                <FaEye /> View Application Status
              </ActionButton>
              <ActionButton onClick={() => navigate('/')}>
                <FaHome /> Return to Home
              </ActionButton>
            </ActionButtons>
          </SuccessContainer>
        </Container>
      </StyledComponents>
    );
  }

  return (
    <AirbnbCard>
      <StickyStepper>
        <StepperBar>
          {steps.map((step, idx) => (
            <StepperItem key={step.id} active={idx === currentStep}>
              <StepCircle active={idx === currentStep}>{idx + 1}</StepCircle>
              <StepLabel>{step.label}</StepLabel>
            </StepperItem>
          ))}
        </StepperBar>
      </StickyStepper>
      <Section>
        <SectionHeader>{steps[currentStep].label}</SectionHeader>
        <SectionSub>{/* Add a short description for each step here if desired */}</SectionSub>
        {/* Render step content using FieldsGrid, FieldGroup, Label, Input, Select, TextArea, etc. Use your existing logic for fields and handlers. */}
        {error && (
          <div style={{ 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca', 
            color: '#dc2626',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '24px'
          }}>
            {error}
          </div>
        )}

        <InfoBox>
          <InfoIcon>ℹ️</InfoIcon>
          <InfoText>
            <strong>Tip:</strong> The application process is designed to be straightforward. Some of the information collected here is used to verify your identity, set up your Stripe account to ensure a smooth hosting experience.
            If you have any questions, please refer to our <a href="/help" style={{ color: '#007bff', textDecoration: 'underline' }}>Help Center</a> or contact our support team.
          </InfoText>
        </InfoBox>

        {renderStepContent()}

        <NavBar>
          <NavButton onClick={handlePreviousStep} disabled={currentStep === 0}>Previous</NavButton>
          {currentStep < steps.length - 1 ? (
            <NavButton onClick={handleNextStep}>Next</NavButton>
          ) : (
            <SubmitButton onClick={handleSubmit} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </SubmitButton>
          )}
        </NavBar>
      </Section>
    </AirbnbCard>
  );
};

export default HostApplicationForm;