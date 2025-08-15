import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hostApplicationsAPI } from '../services/api';
import styled from 'styled-components';
import { 
  FaArrowLeft, 
  FaUser, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaCalendarAlt,
  FaIdCard,
  FaHome,
  FaCamera,
  FaCheck,
  FaSpinner,
  FaInfoCircle,
  FaFileAlt,
  FaCreditCard,
  FaBuilding,
  FaCheckCircle,
  FaEye,
  FaStar,
  FaEnvelope
} from 'react-icons/fa';
import { Spinner, Alert } from 'react-bootstrap';

// Modern Container with gradient background
const Container = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 40px 20px;
  
  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

// Clean Header with better spacing
const Header = styled.div`
  max-width: 1200px;
  margin: 0 auto 40px;
  display: flex;
  align-items: center;
  gap: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  gap: 16px;
  }
`;

const BackButton = styled.button`
  background: white;
  border: 2px solid #e9ecef;
  color: #222222;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  padding: 12px 20px;
  border-radius: 12px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  
  &:hover {
    background: #FF385C;
    color: white;
    border-color: #FF385C;
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(255, 56, 92, 0.3);
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #222222;
  margin: 0;
  background: linear-gradient(135deg, #FF385C 0%, #e31c5f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;



// Modern Form Card
const FormCard = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  overflow: hidden;
`;

// Enhanced Progress Bar
const ProgressBar = styled.div`
  display: flex;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 32px 40px;
  border-bottom: 1px solid #e9ecef;
  
  @media (max-width: 768px) {
    padding: 24px 20px;
    overflow-x: auto;
  }
`;

const StepIndicator = styled.div`
  flex: 1;
  text-align: center;
  position: relative;
  min-width: 120px;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 60%;
    width: 80%;
    height: 3px;
    background: ${props => props.active ? '#FF385C' : '#dee2e6'};
    transform: translateY(-50%);
    z-index: 1;
    border-radius: 2px;
  }
`;

const StepCircle = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.active ? 'linear-gradient(135deg, #FF385C 0%, #e31c5f 100%)' : '#dee2e6'};
  color: ${props => props.active ? 'white' : '#6c757d'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  margin: 0 auto 12px;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
  box-shadow: ${props => props.active ? '0 4px 16px rgba(255, 56, 92, 0.3)' : '0 2px 8px rgba(0, 0, 0, 0.1)'};
  
  &:hover {
    transform: ${props => props.active ? 'scale(1.1)' : 'scale(1.05)'};
  }
`;

const StepLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${props => props.active ? '#222222' : '#6c757d'};
  transition: all 0.3s ease;
`;

// Enhanced Form Content
const FormContent = styled.div`
  padding: 48px;
  
  @media (max-width: 768px) {
    padding: 32px 24px;
  }
`;

const StepTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: #222222;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  
  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

const StepSubtitle = styled.p`
  font-size: 1.1rem;
  color: #6c757d;
  margin-bottom: 40px;
  line-height: 1.6;
`;

// Modern Form Grid
const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
  margin-bottom: 40px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #222222;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const RequiredField = styled.span`
  color: #FF385C;
  font-weight: 700;
  font-size: 1.2rem;
`;

// Enhanced Input Fields
const Input = styled.input`
  padding: 16px 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
    box-shadow: 0 0 0 4px rgba(255, 56, 92, 0.1);
    transform: translateY(-1px);
  }
  
  &:hover {
    border-color: #dee2e6;
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: #adb5bd;
  }
`;

const Select = styled.select`
  padding: 16px 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
    box-shadow: 0 0 0 4px rgba(255, 56, 92, 0.1);
    transform: translateY(-1px);
  }
  
  &:hover {
    border-color: #dee2e6;
    transform: translateY(-1px);
  }
`;

const TextArea = styled.textarea`
  padding: 16px 20px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 1rem;
  resize: vertical;
  min-height: 120px;
  transition: all 0.3s ease;
  background: white;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
    box-shadow: 0 0 0 4px rgba(255, 56, 92, 0.1);
    transform: translateY(-1px);
  }
  
  &:hover {
    border-color: #dee2e6;
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: #adb5bd;
  }
`;

// Enhanced File Upload
const FileUploadArea = styled.div`
  border: 3px dashed #e9ecef;
  border-radius: 16px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
  
  &:hover {
    border-color: #FF385C;
    background: #fff5f5;
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(255, 56, 92, 0.1);
  }
  
  &.has-file {
    border-color: #28a745;
    background: #f8fff9;
    border-style: solid;
  }
`;

const FileUploadIcon = styled(FaCamera)`
  font-size: 2.5rem;
  color: #6c757d;
  margin-bottom: 20px;
  transition: all 0.3s ease;
`;

const FileUploadText = styled.div`
  font-weight: 600;
  color: #222222;
  margin-bottom: 8px;
  font-size: 1.1rem;
`;

const FileUploadHint = styled.div`
  font-size: 0.9rem;
  color: #6c757d;
  margin-top: 8px;
`;

const FilePreview = styled.div`
  margin-top: 20px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  border: 2px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const FileName = styled.div`
  font-weight: 600;
  color: #222222;
  margin-bottom: 8px;
`;

const FileSize = styled.div`
  font-size: 0.9rem;
  color: #6c757d;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

// Enhanced Navigation
const StepNavigation = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32px 48px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-top: 1px solid #e9ecef;
  
  @media (max-width: 768px) {
    padding: 24px 32px;
    flex-direction: column;
    gap: 20px;
  }
`;

const StepButton = styled.button`
  padding: 16px 32px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #FF385C 0%, #e31c5f 100%);
    color: white;
  box-shadow: 0 4px 16px rgba(255, 56, 92, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(255, 56, 92, 0.4);
  }
`;

const SubmitButton = styled.button`
  padding: 16px 32px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(40, 167, 69, 0.3);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// Essential Info Box
const InfoBox = styled.div`
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border: 2px solid #2196f3;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  box-shadow: 0 4px 16px rgba(33, 150, 243, 0.1);
`;

const InfoIcon = styled(FaInfoCircle)`
  color: #2196f3;
  font-size: 1.4rem;
  margin-top: 4px;
  flex-shrink: 0;
`;

const InfoText = styled.div`
  color: #1976d2;
  font-size: 1rem;
  line-height: 1.6;
  font-weight: 500;
`;

// Enhanced Success Screen
const SuccessContainer = styled.div`
  text-align: center;
  padding: 80px 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const SuccessIcon = styled.div`
  font-size: 5rem;
  color: #28a745;
  margin-bottom: 32px;
  animation: bounceIn 0.8s ease;
`;

const SuccessTitle = styled.h1`
  font-size: 3rem;
  font-weight: 700;
  color: #222222;
  margin: 0 0 24px 0;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const SuccessMessage = styled.p`
  font-size: 1.2rem;
  color: #6c757d;
  margin: 0 0 48px 0;
  line-height: 1.6;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:first-child {
    background: linear-gradient(135deg, #FF385C 0%, #e31c5f 100%);
  color: white;
    box-shadow: 0 4px 16px rgba(255, 56, 92, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 56, 92, 0.4);
    }
  }
  
  &:last-child {
    background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
  color: white;
    box-shadow: 0 4px 16px rgba(108, 117, 125, 0.3);
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(108, 117, 125, 0.4);
    }
  }
`;

// Review Section Styling
const ReviewSection = styled.div`
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  border: 2px solid #e9ecef;
`;

const ReviewTitle = styled.h3`
  font-size: 1.4rem;
  font-weight: 600;
  color: #222222;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ReviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
`;

const ReviewItem = styled.div`
  background: white;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e9ecef;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const ReviewLabel = styled.div`
  font-weight: 600;
  color: #222222;
  margin-bottom: 8px;
`;

const ReviewValue = styled.div`
  color: #6c757d;
  font-size: 0.95rem;
`;

// Animation keyframes
const bounceIn = `
  @keyframes bounceIn {
    0% {
      opacity: 0;
      transform: scale(0.3);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
    70% {
      transform: scale(0.9);
    }
    100% {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

// Add animations to styled components
const StyledComponents = styled.div`
  ${bounceIn}
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
    // Business Information
    businessName: '',
    businessTaxId: '',
    businessStreet: '',
    businessCity: '',
    businessState: '',
    businessPostalCode: '',
    businessCountry: '',
    businessPhone: '',
    businessStructure: 'individual',
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
        // Business Information
        businessName: existingApplication.businessName || '',
        businessTaxId: existingApplication.businessTaxId || '',
        businessStreet: existingApplication.businessAddress?.street || '',
        businessCity: existingApplication.businessAddress?.city || '',
        businessState: existingApplication.businessAddress?.state || '',
        businessPostalCode: existingApplication.businessAddress?.postalCode || '',
        businessCountry: existingApplication.businessAddress?.country || '',
        businessPhone: existingApplication.businessPhone || '',
        businessStructure: existingApplication.businessStructure || 'individual',
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
  };

  const handleFileChange = (field, file) => {
    console.log(`File change for ${field}:`, file);
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const canProceedToNextStep = () => {
    // Allow users to navigate freely through all steps
        return true;
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
    if (canProceedToNextStep()) {
      nextStep();
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
      
      // Business Information
      formDataToSend.append('businessName', formData.businessName);
      formDataToSend.append('businessTaxId', formData.businessTaxId);
      formDataToSend.append('businessStreet', formData.businessStreet);
      formDataToSend.append('businessCity', formData.businessCity);
      formDataToSend.append('businessState', formData.businessState);
      formDataToSend.append('businessPostalCode', formData.businessPostalCode);
      formDataToSend.append('businessCountry', formData.businessCountry);
      formDataToSend.append('businessPhone', formData.businessPhone);
      formDataToSend.append('businessStructure', formData.businessStructure);
      
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
        
        <FormGroup>
          <Label><FaMapMarkerAlt /> City <RequiredField>*</RequiredField></Label>
          <Input
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="City"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label><FaMapMarkerAlt /> State/Province <RequiredField>*</RequiredField></Label>
          <Input
            type="text"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            placeholder="State or Province"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label><FaMapMarkerAlt /> Postal Code <RequiredField>*</RequiredField></Label>
          <Input
            type="text"
            value={formData.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            placeholder="12345 or A1B 2C3"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label><FaMapMarkerAlt /> Country <RequiredField>*</RequiredField></Label>
          <Input
            type="text"
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            placeholder="United States"
            required
          />
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
          className={formData.idFrontImage ? 'has-file' : ''}
          onClick={() => document.getElementById('idFrontImage').click()}
        >
          <FileUploadIcon />
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
          className={formData.idBackImage ? 'has-file' : ''}
          onClick={() => document.getElementById('idBackImage').click()}
        >
          <FileUploadIcon />
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
          className={formData.selfieImage ? 'has-file' : ''}
          onClick={() => document.getElementById('selfieImage').click()}
        >
          <FileUploadIcon />
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
        Please provide your business and financial details for Stripe integration.
      </StepSubtitle>

      <StepTitle style={{ marginTop: '32px', fontSize: '1.5rem' }}>
        <FaBuilding /> Business Information
      </StepTitle>
      
        <FormGrid>
          <FormGroup>
          <Label><FaBuilding /> Business Name (Optional)</Label>
            <Input
              type="text"
            value={formData.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            placeholder="Your business name or leave blank for individual"
          />
        </FormGroup>
        
        <FormGroup>
          <Label><FaBuilding /> Business Tax ID (EIN) - Optional</Label>
          <Input
            type="text"
            value={formData.businessTaxId}
            onChange={(e) => handleInputChange('businessTaxId', e.target.value)}
            placeholder="12-3456789 (leave blank if individual)"
            />
        </FormGroup>

        <FormGroup>
          <Label><FaBuilding /> Business Structure <RequiredField>*</RequiredField></Label>
          <Select
            value={formData.businessStructure}
            onChange={(e) => handleInputChange('businessStructure', e.target.value)}
            required
          >
            <option value="">Select Business Structure</option>
            <option value="individual">Individual (Sole Proprietor)</option>
            <option value="single_member_llc">Single Member LLC</option>
            <option value="multi_member_llc">Multi Member LLC</option>
            <option value="private_partnership">Private Partnership</option>
            <option value="private_corporation">Private Corporation</option>
            <option value="public_corporation">Public Corporation</option>
            <option value="incorporated_non_profit">Incorporated Non-Profit</option>
            <option value="unincorporated_non_profit">Unincorporated Non-Profit</option>
          </Select>
          </FormGroup>
        </FormGrid>

      <StepTitle style={{ marginTop: '32px', fontSize: '1.5rem' }}>
        <FaMapMarkerAlt /> Business Address (if different from personal)
      </StepTitle>
      
        <FormGrid>
          <FormGroup>
          <Label><FaMapMarkerAlt /> Business Street Address</Label>
            <Input
              type="text"
            value={formData.businessStreet}
            onChange={(e) => handleInputChange('businessStreet', e.target.value)}
            placeholder="Leave blank if same as personal address"
          />
        </FormGroup>
        
        <FormGroup>
          <Label><FaMapMarkerAlt /> Business City</Label>
          <Input
            type="text"
            value={formData.businessCity}
            onChange={(e) => handleInputChange('businessCity', e.target.value)}
            placeholder="Leave blank if same as personal address"
          />
        </FormGroup>
        
        <FormGroup>
          <Label><FaMapMarkerAlt /> Business State</Label>
          <Input
            type="text"
            value={formData.businessState}
            onChange={(e) => handleInputChange('businessState', e.target.value)}
            placeholder="Leave blank if same as personal address"
          />
        </FormGroup>
        
        <FormGroup>
          <Label><FaMapMarkerAlt /> Business Postal Code</Label>
          <Input
            type="text"
            value={formData.businessPostalCode}
            onChange={(e) => handleInputChange('businessPostalCode', e.target.value)}
            placeholder="Leave blank if same as personal address"
          />
        </FormGroup>
        
        <FormGroup>
          <Label><FaMapMarkerAlt /> Business Country</Label>
          <Input
            type="text"
            value={formData.businessCountry}
            onChange={(e) => handleInputChange('businessCountry', e.target.value)}
            placeholder="Leave blank if same as personal address"
          />
        </FormGroup>
        
        <FormGroup>
          <Label><FaPhone /> Business Phone</Label>
          <Input
            type="tel"
            value={formData.businessPhone}
            onChange={(e) => handleInputChange('businessPhone', e.target.value)}
            placeholder="Leave blank if same as personal phone"
          />
        </FormGroup>
      </FormGrid>

      <StepTitle style={{ marginTop: '32px', fontSize: '1.5rem' }}>
        <FaCreditCard /> Financial Information for Payouts
      </StepTitle>
      
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
            <ReviewLabel>Business Information</ReviewLabel>
            <ReviewValue>Business Name: {formData.businessName || 'Individual (no business name)'}</ReviewValue>
            <ReviewValue>Business Tax ID: {formData.businessTaxId || 'Not provided'}</ReviewValue>
            <ReviewValue>Business Structure: {formData.businessStructure || 'Individual'}</ReviewValue>
            <ReviewValue>Business Address: {formData.businessStreet ? `${formData.businessStreet}, ${formData.businessCity}, ${formData.businessState} ${formData.businessPostalCode}, ${formData.businessCountry}` : 'Same as personal address'}</ReviewValue>
            <ReviewValue>Business Phone: {formData.businessPhone || 'Same as personal phone'}</ReviewValue>
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
          
          <InfoBox style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', borderColor: '#2196f3', marginBottom: '32px' }}>
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
    <StyledComponents>
    <Container>
      <Header>
          <BackButton onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </BackButton>
          <Title>
            <FaFileAlt /> {isEditMode ? 'Edit Host Application' : 'Become a Host'}
          </Title>
      </Header>



      <FormCard>
        <ProgressBar>
          {steps.map((step, index) => (
            <StepIndicator key={step.id} active={index <= currentStep}>
              <StepCircle active={index <= currentStep}>
                {index < currentStep ? <FaCheck /> : step.id + 1}
              </StepCircle>
              <StepLabel active={index <= currentStep}>{step.label}</StepLabel>
            </StepIndicator>
          ))}
        </ProgressBar>

        <FormContent>
          {error && (
            <Alert variant="danger" style={{ marginBottom: '24px' }}>
              {error}
            </Alert>
          )}

          <InfoBox style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', borderColor: '#6c757d', marginBottom: '24px' }}>
            <InfoIcon style={{ color: '#6c757d' }} />
            <InfoText style={{ color: '#495057' }}>
              <strong>Tip:</strong> You can navigate freely between steps using the Previous and Next buttons. Fill out the form at your own pace!
            </InfoText>
          </InfoBox>

          {renderStepContent()}
        </FormContent>

        <StepNavigation>
          <StepButton
            type="button"
            onClick={handlePreviousStep}
            disabled={currentStep === 0}
          >
            Previous
          </StepButton>

          {currentStep < steps.length - 1 ? (
            <StepButton
              type="button"
              onClick={handleNextStep}
            >
              Next
            </StepButton>
          ) : (
            <SubmitButton
              type="button"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <FaSpinner className="fa-spin" /> Submitting...
                </>
              ) : (
                <>
                  <FaCheck /> {isEditMode ? 'Update Application' : 'Submit Application'}
                </>
              )}
            </SubmitButton>
          )}
        </StepNavigation>
      </FormCard>


    </Container>
      </StyledComponents>
  );
};

export default HostApplicationForm; 