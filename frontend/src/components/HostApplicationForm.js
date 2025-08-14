import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hostApplicationsAPI } from '../services/api';
import styled from 'styled-components';
import { 
  FaArrowLeft, 
  FaArrowRight,
  FaUser, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaCalendarAlt,
  FaIdCard,
  FaHome,
  FaCamera,
  FaCheck,
  FaSpinner,
  FaExclamationTriangle,
  FaInfoCircle,
  FaFileAlt,
  FaCreditCard,
  FaBuilding,
  FaCheckCircle,
  FaExternalLinkAlt,
  FaEye
} from 'react-icons/fa';
import { Spinner, Alert } from 'react-bootstrap';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  
  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 32px;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #222222;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #f7f7f7;
    color: #FF385C;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #222222;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const FormCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #DDDDDD;
  overflow: hidden;
`;

const ProgressBar = styled.div`
  display: flex;
  background: #f7f7f7;
  padding: 20px;
  border-bottom: 1px solid #DDDDDD;
`;

const StepIndicator = styled.div`
  flex: 1;
  text-align: center;
  position: relative;
  
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 2px;
    background: #DDDDDD;
    transform: translateY(-50%);
    z-index: 1;
  }
`;

const StepCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.active ? '#FF385C' : '#DDDDDD'};
  color: ${props => props.active ? 'white' : '#717171'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin: 0 auto 8px;
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
`;

const StepLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${props => props.active ? '#222222' : '#717171'};
  transition: all 0.3s ease;
`;

const FormContent = styled.div`
  padding: 40px;
  
  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const StepTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: #222222;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StepSubtitle = styled.p`
  font-size: 1.1rem;
  color: #717171;
  margin-bottom: 32px;
  line-height: 1.6;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #222222;
  font-size: 0.95rem;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 1px solid #DDDDDD;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
    box-shadow: 0 0 0 3px rgba(255, 56, 92, 0.1);
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 1px solid #DDDDDD;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
    box-shadow: 0 0 0 3px rgba(255, 56, 92, 0.1);
  }
`;

const TextArea = styled.textarea`
  padding: 12px 16px;
  border: 1px solid #DDDDDD;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
    box-shadow: 0 0 0 3px rgba(255, 56, 92, 0.1);
  }
`;

const FileUploadArea = styled.div`
  border: 2px dashed #DDDDDD;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f9f9f9;
  
  &:hover {
    border-color: #FF385C;
    background: #fff5f5;
  }
  
  &.has-file {
    border-color: #28a745;
    background: #f8fff9;
  }
`;

const FileUploadIcon = styled(FaCamera)`
  font-size: 2rem;
  color: #717171;
  margin-bottom: 16px;
`;

const FileUploadText = styled.div`
  font-weight: 600;
  color: #222222;
  margin-bottom: 8px;
`;

const FileUploadHint = styled.div`
  font-size: 0.8rem;
  color: #6c757d;
  margin-top: 4px;
  text-align: center;
`;

// Success Screen Styled Components
const SuccessContainer = styled.div`
  text-align: center;
  padding: 60px 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const SuccessIcon = styled.div`
  font-size: 4rem;
  color: #28a745;
  margin-bottom: 24px;
`;

const SuccessTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #222222;
  margin: 0 0 16px 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const SuccessMessage = styled.p`
  font-size: 1.1rem;
  color: #6c757d;
  margin: 0 0 40px 0;
  line-height: 1.6;
`;

const StripeOnboardingSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #DDDDDD;
  margin-bottom: 32px;
  text-align: left;
`;

const StripeOnboardingTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 600;
  color: #222222;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1976d2;
`;

const StripeOnboardingDescription = styled.p`
  color: #6c757d;
  margin: 0 0 32px 0;
  line-height: 1.6;
`;

const StripeOnboardingSteps = styled.div`
  margin-bottom: 32px;
`;

const StepItem = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
  align-items: flex-start;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const StepNumber = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #1976d2;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitleText = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #222222;
  margin: 0 0 8px 0;
`;

const StepDescription = styled.p`
  color: #6c757d;
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const OnboardingButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: #1976d2;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  
  &:hover {
    background: #1565c0;
    color: white;
    text-decoration: none;
    transform: translateY(-1px);
  }
`;

const StripeAccountInfo = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid #e9ecef;
`;

const InfoTitle = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #222222;
  margin: 0 0 16px 0;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.span`
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
`;

const InfoValue = styled.span`
  font-size: 1rem;
  color: #222222;
  font-weight: 600;
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => props.status === 'active' ? '#d4edda' : '#fff3cd'};
  color: ${props => props.status === 'active' ? '#155724' : '#856404'};
  border: 1px solid ${props => props.status === 'active' ? '#c3e6cb' : '#ffeaa7'};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:first-child {
    background: #FF385C;
    color: white;
    
    &:hover {
      background: #e31c5f;
    }
  }
  
  &:last-child {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #5a6268;
    }
  }
`;

const FilePreview = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  border: 1px solid #DDDDDD;
`;

const FileName = styled.div`
  font-weight: 600;
  color: #222222;
  margin-bottom: 4px;
`;

const FileSize = styled.div`
  font-size: 0.9rem;
  color: #717171;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const StepNavigation = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 40px;
  background: #f9f9f9;
  border-top: 1px solid #DDDDDD;
  
  @media (max-width: 768px) {
    padding: 20px 24px;
    flex-direction: column;
    gap: 16px;
  }
`;

const StepButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  background: #FF385C;
  color: white;
  
  &:hover:not(:disabled) {
    background: #e31c5f;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SubmitButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  background: #28a745;
  color: white;
  
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

const InfoBox = styled.div`
  background: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const InfoIcon = styled(FaInfoCircle)`
  color: #2196f3;
  font-size: 1.2rem;
  margin-top: 2px;
`;

const InfoText = styled.div`
  color: #1976d2;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const PaymentInfoBox = styled.div`
  background: #fff3e0;
  border: 1px solid #ff9800;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const PaymentIcon = styled(FaCreditCard)`
  color: #ff9800;
  font-size: 1.2rem;
  margin-top: 2px;
`;

const PaymentText = styled.div`
  color: #e65100;
  font-size: 0.9rem;
  line-height: 1.5;
`;

const Hint = styled.div`
  font-size: 0.85rem;
  color: #6c757d;
  margin-top: 4px;
  font-style: italic;
  line-height: 1.4;
`;

const FieldGuide = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  border-left: 4px solid #17a2b8;
`;

const GuideTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #17a2b8;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const GuideText = styled.p`
  font-size: 0.9rem;
  color: #495057;
  margin: 0;
  line-height: 1.5;
`;

const GuideList = styled.ul`
  margin: 8px 0 0 0;
  padding-left: 20px;
  font-size: 0.9rem;
  color: #495057;
`;

const GuideListItem = styled.li`
  margin-bottom: 4px;
  line-height: 1.4;
`;

const RequiredField = styled.span`
  color: #FF385C;
  font-weight: 600;
`;

const ProTip = styled.div`
  background: #d1ecf1;
  border: 1px solid #bee5eb;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  border-left: 4px solid #17a2b8;
`;

const ProTipTitle = styled.h5`
  color: #0c5460;
  margin: 0 0 8px 0;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ProTipText = styled.p`
  color: #0c5460;
  margin: 0;
  line-height: 1.5;
  font-size: 0.9rem;
`;

const ApplicationOverview = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 32px;
  color: white;
  text-align: center;
`;

const OverviewTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: white;
`;

const OverviewDescription = styled.p`
  font-size: 1.1rem;
  margin: 0 0 24px 0;
  line-height: 1.6;
  opacity: 0.95;
`;

const OverviewSteps = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 24px;
`;

const OverviewStep = styled.div`
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
`;

const OverviewStepNumber = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0 auto 12px auto;
`;

const OverviewStepTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: white;
`;

const OverviewStepText = styled.p`
  font-size: 0.9rem;
  margin: 0;
  opacity: 0.9;
  line-height: 1.4;
`;

const SecurityNotice = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  border-left: 4px solid #f39c12;
`;

const SecurityIcon = styled(FaExclamationTriangle)`
  color: #f39c12;
  font-size: 1.2rem;
  margin-right: 8px;
`;

const SecurityTitle = styled.h4`
  color: #856404;
  margin: 0 0 8px 0;
  font-size: 1.1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
`;

const SecurityText = styled.p`
  color: #856404;
  margin: 0;
  line-height: 1.5;
  font-size: 0.95rem;
`;

const FAQSection = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #DDDDDD;
  padding: 32px;
  margin-top: 32px;
`;

const FAQTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #222222;
  margin: 0 0 24px 0;
  text-align: center;
`;

const FAQItem = styled.div`
  margin-bottom: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 12px;
  border: 1px solid #e9ecef;
`;

const FAQQuestion = styled.h4`
  font-size: 1.1rem;
  font-weight: 600;
  color: #222222;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FAQAnswer = styled.p`
  color: #6c757d;
  margin: 0;
  line-height: 1.6;
  font-size: 0.95rem;
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
  const [showStripeOnboarding, setShowStripeOnboarding] = useState(false);

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
    switch (currentStep) {
      case 0: // Personal Information
        return formData.firstName && formData.lastName && formData.email && 
               formData.phoneNumber && formData.street && formData.city && 
               formData.state && formData.postalCode && formData.country && 
               formData.dateOfBirth;
      case 1: // Identity Verification
        return formData.idType && formData.idNumber && 
               formData.idFrontImage && formData.idBackImage && formData.selfieImage;
      case 2: // Business & Financial
        return formData.businessStructure && formData.ssn && formData.ssnLast4 && 
               formData.supportPhone && formData.bankAccountType && 
               formData.bankRoutingNumber && formData.bankAccountNumber;
      case 3: // Payment Methods (optional, can always proceed)
        return true;
      case 4: // Property Information
        return formData.propertyType && formData.propertyDescription;
      case 5: // Review & Submit
        return true;
      default:
        return false;
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
        
        // If this is a new submission (not an edit), show Stripe onboarding info
        if (!isEditMode && response.data.stripeAccount) {
          setShowStripeOnboarding(true);
        }
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
      
      <FieldGuide>
        <GuideTitle>
          <FaInfoCircle /> Personal Information Guide
        </GuideTitle>
        <GuideText>
          This section collects your basic contact and address information. All fields marked with <RequiredField>*</RequiredField> are required.
        </GuideText>
        <GuideList>
          <GuideListItem><strong>Names:</strong> Use your legal name as it appears on official documents</GuideListItem>
          <GuideListItem><strong>Email:</strong> Must be active and accessible for important communications</GuideListItem>
          <GuideListItem><strong>Phone:</strong> Include country code for international numbers (e.g., +1 for US)</GuideListItem>
          <GuideListItem><strong>Address:</strong> Use your current residential address where you receive mail</GuideListItem>
          <GuideListItem><strong>Date of Birth:</strong> You must be at least 18 years old to become a host</GuideListItem>
        </GuideList>
      </FieldGuide>

      <InfoBox>
        <InfoIcon />
        <InfoText>
          Your name and email are pre-filled from your profile. Please verify and update if needed.
        </InfoText>
      </InfoBox>

      <FormGrid>
        <FormGroup>
          <Label>First Name <RequiredField>*</RequiredField></Label>
          <Input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="First Name"
            required
          />
          <Hint>Enter your legal first name exactly as it appears on your ID documents</Hint>
        </FormGroup>

        <FormGroup>
          <Label>Last Name <RequiredField>*</RequiredField></Label>
          <Input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            placeholder="Last Name"
            required
          />
          <Hint>Enter your legal last name exactly as it appears on your ID documents</Hint>
        </FormGroup>

        <FormGroup>
          <Label>Email <RequiredField>*</RequiredField></Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="Email"
            required
          />
          <Hint>This email will be used for all communications about your application and hosting account</Hint>
        </FormGroup>

        <FormGroup>
          <Label>Phone Number <RequiredField>*</RequiredField></Label>
          <Input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            placeholder="+1 (555) 123-4567"
            required
          />
          <Hint>Include country code if international (e.g., +1 for US). This number will be used for urgent communications.</Hint>
        </FormGroup>

        <FormGroup>
          <Label>Street Address <RequiredField>*</RequiredField></Label>
          <Input
            type="text"
            value={formData.street}
            onChange={(e) => handleInputChange('street', e.target.value)}
            placeholder="123 Main Street, Apt 4B"
            required
          />
          <Hint>Include apartment/unit number if applicable. Use your current residential address.</Hint>
        </FormGroup>

        <FormGroup>
          <Label>City <RequiredField>*</RequiredField></Label>
          <Input
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="City"
            required
          />
          <Hint>Enter the full city name (e.g., "New York" not "NYC")</Hint>
        </FormGroup>

        <FormGroup>
          <Label>State/Province <RequiredField>*</RequiredField></Label>
          <Input
            type="text"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            placeholder="State or Province"
            required
          />
          <Hint>Use full state name (e.g., "California" not "CA") or province name for international addresses</Hint>
        </FormGroup>

        <FormGroup>
          <Label>Postal Code <RequiredField>*</RequiredField></Label>
          <Input
            type="text"
            value={formData.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            placeholder="12345 or A1B 2C3"
            required
          />
          <Hint>Enter your ZIP code (US) or postal code (international). Include letters and numbers as shown on mail.</Hint>
        </FormGroup>

        <FormGroup>
          <Label>Country <RequiredField>*</RequiredField></Label>
          <Input
            type="text"
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
            placeholder="United States"
            required
          />
          <Hint>Use the full country name (e.g., "United States" not "USA" or "US")</Hint>
        </FormGroup>

        <FormGroup>
          <Label>Date of Birth <RequiredField>*</RequiredField></Label>
          <Input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            required
          />
          <Hint>You must be at least 18 years old to become a host. Use the date picker or enter in YYYY-MM-DD format.</Hint>
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
        Please provide your identity verification documents. These are required for security purposes.
      </StepSubtitle>

      <FieldGuide>
        <GuideTitle>
          <FaInfoCircle /> Identity Verification Guide
        </GuideTitle>
        <GuideText>
          Identity verification is required by law and helps protect both hosts and guests. All documents must be current and valid.
        </GuideText>
        <GuideList>
          <GuideListItem><strong>ID Type:</strong> Choose the most recent and valid form of government-issued identification</GuideListItem>
          <GuideListItem><strong>ID Number:</strong> Enter the complete number exactly as it appears on your document</GuideListItem>
          <GuideListItem><strong>Document Images:</strong> Upload clear, high-quality photos of both sides of your ID</GuideListItem>
          <GuideListItem><strong>Selfie:</strong> Take a recent photo in good lighting to verify your identity</GuideListItem>
          <GuideListItem><strong>File Requirements:</strong> Images must be clear, readable, and under 10MB each</GuideListItem>
        </GuideList>
      </FieldGuide>

      <FormGrid>
        <FormGroup>
          <Label>ID Type <RequiredField>*</RequiredField></Label>
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
          <Hint>Choose the most recent and valid form of identification. Passport is preferred for international hosts.</Hint>
        </FormGroup>

        <FormGroup>
          <Label>ID Number <RequiredField>*</RequiredField></Label>
          <Input
            type="text"
            value={formData.idNumber}
            onChange={(e) => handleInputChange('idNumber', e.target.value)}
            placeholder="ID Number"
            required
          />
          <Hint>Enter the complete ID number exactly as it appears on your document. Include all letters, numbers, and special characters.</Hint>
        </FormGroup>
      </FormGrid>

      <FormGrid>
        <FormGroup>
          <Label>ID Front Image <RequiredField>*</RequiredField></Label>
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
          <Hint>Take a clear photo of the front of your ID. Ensure all text is readable and the image is well-lit.</Hint>
        </FormGroup>

        <FormGroup>
          <Label>ID Back Image <RequiredField>*</RequiredField></Label>
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
          <Hint>Take a clear photo of the back of your ID. Many IDs have important information on the reverse side.</Hint>
        </FormGroup>

        <FormGroup>
          <Label>Selfie Image <RequiredField>*</RequiredField></Label>
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
          <Hint>Take a recent selfie in good lighting. This helps verify that you are the person in the ID documents.</Hint>
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

      <FieldGuide>
        <GuideTitle>
          <FaInfoCircle /> Business & Financial Information Guide
        </GuideTitle>
        <GuideText>
          This information is required to create your Stripe Connect account for receiving payouts. All data is encrypted and secure.
        </GuideText>
        <GuideList>
          <GuideListItem><strong>Business Structure:</strong> Choose the legal structure that matches your business registration</GuideListItem>
          <GuideListItem><strong>Business Address:</strong> Only fill if different from your personal address</GuideListItem>
          <GuideListItem><strong>SSN:</strong> Required for tax purposes and identity verification</GuideListItem>
          <GuideListItem><strong>Bank Information:</strong> Used to set up automatic payouts to your account</GuideListItem>
          <GuideListItem><strong>Security:</strong> All sensitive information is encrypted and never stored in plain text</GuideListItem>
        </GuideList>
      </FieldGuide>

      <InfoBox>
        <InfoIcon />
        <InfoText>
          <strong>Important:</strong> This information is required to create your Stripe Connect account for receiving payouts. 
          All data is encrypted and secure.
        </InfoText>
      </InfoBox>

      <StepTitle style={{ marginTop: '32px', fontSize: '1.5rem' }}>
        Business Information
      </StepTitle>
      
      <FormGrid>
        <FormGroup>
          <Label>Business Name (Optional)</Label>
          <Input
            type="text"
            value={formData.businessName}
            onChange={(e) => handleInputChange('businessName', e.target.value)}
            placeholder="Your business name or leave blank for individual"
          />
          <Hint>Leave blank if you're operating as an individual (sole proprietor). Use your registered business name if you have one.</Hint>
        </FormGroup>

        <FormGroup>
          <Label>Business Tax ID (EIN) - Optional</Label>
          <Input
            type="text"
            value={formData.businessTaxId}
            onChange={(e) => handleInputChange('businessTaxId', e.target.value)}
            placeholder="12-3456789 (leave blank if individual)"
          />
          <Hint>Required for businesses, leave blank for individual hosts. Format: XX-XXXXXXX (e.g., 12-3456789)</Hint>
        </FormGroup>

        <FormGroup>
          <Label>Business Structure <RequiredField>*</RequiredField></Label>
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
          <Hint>Select the legal structure that matches your business registration. If unsure, choose "Individual (Sole Proprietor)".</Hint>
        </FormGroup>
      </FormGrid>

      <StepTitle style={{ marginTop: '32px', fontSize: '1.5rem' }}>
        Business Address (if different from personal)
      </StepTitle>
      
      <FormGrid>
        <FormGroup>
          <Label>Business Street Address</Label>
          <Input
            type="text"
            value={formData.businessStreet}
            onChange={(e) => handleInputChange('businessStreet', e.target.value)}
            placeholder="Leave blank if same as personal address"
          />
          <Hint>Only fill this if your business address is different from your personal address. Leave blank if they're the same.</Hint>
        </FormGroup>

        <FormGroup>
          <Label>Business City</Label>
          <Input
            type="text"
            value={formData.businessCity}
            onChange={(e) => handleInputChange('businessCity', e.target.value)}
            placeholder="Leave blank if same as personal address"
          />
          <Hint>Only fill this if your business city is different from your personal address.</Hint>
        </FormGroup>

        <FormGroup>
          <Label>Business State</Label>
          <Input
            type="text"
            value={formData.businessState}
            onChange={(e) => handleInputChange('businessState', e.target.value)}
            placeholder="Leave blank if same as personal address"
          />
          <Hint>Only fill this if your business state is different from your personal address.</Hint>
        </FormGroup>

        <FormGroup>
          <Label>Business Postal Code</Label>
          <Input
            type="text"
            value={formData.businessPostalCode}
            onChange={(e) => handleInputChange('businessPostalCode', e.target.value)}
            placeholder="Leave blank if same as personal address"
          />
          <Hint>Only fill this if your business postal code is different from your personal address.</Hint>
        </FormGroup>

        <FormGroup>
          <Label>Business Country</Label>
          <Input
            type="text"
            value={formData.businessCountry}
            onChange={(e) => handleInputChange('businessCountry', e.target.value)}
            placeholder="Leave blank if same as personal address"
          />
          <Hint>Only fill this if your business country is different from your personal address.</Hint>
        </FormGroup>

        <FormGroup>
          <Label>Business Phone</Label>
          <Input
            type="tel"
            value={formData.businessPhone}
            onChange={(e) => handleInputChange('businessPhone', e.target.value)}
            placeholder="Leave blank if same as personal phone"
          />
          <Hint>Only fill this if you have a separate business phone number. Include country code if international.</Hint>
        </FormGroup>
      </FormGrid>

      <StepTitle style={{ marginTop: '32px', fontSize: '1.5rem' }}>
        Financial Information for Payouts
      </StepTitle>
      
      <ProTip>
        <ProTipTitle>
          <FaInfoCircle /> Pro Tip: Bank Account Setup
        </ProTipTitle>
        <ProTipText>
          <strong>Use a checking account for payouts</strong> - Most hosts prefer checking accounts over savings accounts for receiving payouts 
          because they typically have fewer withdrawal restrictions and faster access to funds. Make sure your account is active and can receive 
          electronic deposits.
        </ProTipText>
      </ProTip>
      
      <InfoBox>
        <InfoIcon />
        <InfoText>
          <strong>Security Note:</strong> Your SSN and bank information are encrypted and only used to create your Stripe Connect account. 
          We never store or access this information directly.
        </InfoText>
      </InfoBox>
      
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
          <Hint>Format: XXX-XX-XXXX (e.g., 123-45-6789). This is required for tax purposes and identity verification.</Hint>
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
          <Hint>Last 4 digits of your SSN for verification purposes. Must match the last 4 digits of your full SSN above.</Hint>
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
          <Hint>Phone number where you can be reached for account support and verification calls. Include country code if international.</Hint>
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
          <Hint>Choose the account type where you want to receive payouts. Most hosts use checking accounts for easier access to funds.</Hint>
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
          <Hint>9-digit routing number found on your checks or bank statement. This identifies your bank and branch.</Hint>
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
          <Hint>Your bank account number (numbers only, no spaces or dashes). This is where your payouts will be deposited.</Hint>
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

      <FieldGuide>
        <GuideTitle>
          <FaInfoCircle /> Payment Methods Guide
        </GuideTitle>
        <GuideText>
          This section is for additional payment methods. Your primary payout method is the bank account you provided in the previous step.
        </GuideText>
        <GuideList>
          <GuideListItem><strong>Stripe Account:</strong> If you already have a Stripe account, you can link it here</GuideListItem>
          <GuideListItem><strong>Credit Card:</strong> Optional backup payment method for certain transactions</GuideListItem>
          <GuideListItem><strong>Primary Method:</strong> Your bank account from the previous step will be your main payout method</GuideListItem>
          <GuideListItem><strong>Not Required:</strong> These fields are optional - you can leave them blank</GuideListItem>
        </GuideList>
      </FieldGuide>

      <PaymentInfoBox>
        <PaymentIcon />
        <PaymentText>
          <strong>Payment Setup:</strong> You can provide either a Stripe account ID or credit card information. 
          After approval, we'll help you set up automatic payouts.
        </PaymentText>
      </PaymentInfoBox>

      <FormGrid>
        <FormGroup>
          <Label>Stripe Account ID (Optional)</Label>
          <Input
            type="text"
            value={formData.stripeAccountId}
            onChange={(e) => handleInputChange('stripeAccountId', e.target.value)}
            placeholder="acct_xxxxxxxxxxxxx"
          />
          <Hint>If you already have a Stripe account, enter your account ID (starts with 'acct_'). This field is completely optional.</Hint>
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
          <Hint>Last 4 digits of a credit card for backup payment method. This field is completely optional.</Hint>
        </FormGroup>
      </FormGrid>

      <InfoBox>
        <InfoIcon />
        <InfoText>
          <strong>Note:</strong> At least one payment method is required. If you don't have a Stripe account, 
          you can provide credit card information and we'll help you set up payments after approval.
        </InfoText>
      </InfoBox>
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

      <ProTip>
        <ProTipTitle>
          <FaInfoCircle /> Pro Tip: Property Description
        </ProTipTitle>
        <ProTipText>
          <strong>Be detailed and honest</strong> - A comprehensive property description helps guests understand exactly what to expect and 
          can improve your booking rates. Include unique features, nearby attractions, and any special amenities. Honest descriptions lead 
          to better guest satisfaction and fewer issues.
        </ProTipText>
      </ProTip>

      <FieldGuide>
        <GuideTitle>
          <FaInfoCircle /> Property Information Guide
        </GuideTitle>
        <GuideText>
          This section helps us understand what you plan to host and your experience level. Be detailed and honest in your descriptions.
        </GuideText>
        <GuideList>
          <GuideListItem><strong>Property Type:</strong> Choose the primary type of property you plan to list</GuideListItem>
          <GuideListItem><strong>Property Description:</strong> Be detailed about amenities, location, and unique features</GuideListItem>
          <GuideListItem><strong>Hosting Experience:</strong> Share any relevant background, even if it's not directly related to hosting</GuideListItem>
          <GuideListItem><strong>Be Honest:</strong> Accurate information helps us provide better support and improves guest satisfaction</GuideListItem>
        </GuideList>
      </FieldGuide>

      <FormGrid>
        <FormGroup>
          <Label>Property Type <RequiredField>*</RequiredField></Label>
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
          <Hint>Select the primary type of property you plan to list. You can list multiple types later, but choose your main one.</Hint>
        </FormGroup>

        <FormGroup>
          <Label>Property Description <RequiredField>*</RequiredField></Label>
          <TextArea
            value={formData.propertyDescription}
            onChange={(e) => handleInputChange('propertyDescription', e.target.value)}
            placeholder="Describe your property, amenities, and what makes it special..."
            required
          />
          <Hint>Provide a detailed description of your property and its unique features. Include amenities, location highlights, and what makes it special.</Hint>
        </FormGroup>

        <FormGroup>
          <Label>Hosting Experience</Label>
          <TextArea
            value={formData.hostingExperience}
            onChange={(e) => handleInputChange('hostingExperience', e.target.value)}
            placeholder="Tell us about your experience with hosting or customer service..."
          />
          <Hint>Share any previous hosting experience, customer service skills, or relevant background. Even if you're new to hosting, tell us about your customer service experience.</Hint>
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

      <div style={{ background: '#f9f9f9', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
        <h3 style={{ marginBottom: '16px', color: '#222222' }}>Personal Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div><strong>Name:</strong> {formData.firstName} {formData.lastName}</div>
          <div><strong>Email:</strong> {formData.email}</div>
          <div><strong>Phone:</strong> {formData.phoneNumber}</div>
          <div><strong>Date of Birth:</strong> {formData.dateOfBirth}</div>
        </div>
        
        <h3 style={{ marginTop: '24px', marginBottom: '16px', color: '#222222' }}>Address</h3>
        <div>{formData.street}, {formData.city}, {formData.state} {formData.postalCode}, {formData.country}</div>
        
        <h3 style={{ marginTop: '24px', marginBottom: '16px', color: '#222222' }}>Identity Verification</h3>
        <div><strong>ID Type:</strong> {formData.idType}</div>
        <div><strong>ID Number:</strong> {formData.idNumber}</div>
        <div><strong>Documents:</strong> {formData.idFrontImage ? 'Front ✓' : 'Front ✗'}, {formData.idBackImage ? 'Back ✓' : 'Back ✗'}, {formData.selfieImage ? 'Selfie ✓' : 'Selfie ✗'}</div>
        
        <h3 style={{ marginTop: '24px', marginBottom: '16px', color: '#222222' }}>Business Information</h3>
        <div><strong>Business Name:</strong> {formData.businessName || 'Individual (no business name)'}</div>
        <div><strong>Business Tax ID:</strong> {formData.businessTaxId || 'Not provided'}</div>
        <div><strong>Business Structure:</strong> {formData.businessStructure || 'Individual'}</div>
        <div><strong>Business Address:</strong> {formData.businessStreet ? `${formData.businessStreet}, ${formData.businessCity}, ${formData.businessState} ${formData.businessPostalCode}, ${formData.businessCountry}` : 'Same as personal address'}</div>
        <div><strong>Business Phone:</strong> {formData.businessPhone || 'Same as personal phone'}</div>
        
        <h3 style={{ marginTop: '24px', marginBottom: '16px', color: '#222222' }}>Financial Information</h3>
        <div><strong>SSN:</strong> {formData.ssn ? '****' : 'Not provided'}</div>
        <div><strong>SSN Last 4:</strong> {formData.ssnLast4 ? '****' : 'Not provided'}</div>
        <div><strong>Support Phone:</strong> {formData.supportPhone || 'Not provided'}</div>
        <div><strong>Bank Account Type:</strong> {formData.bankAccountType || 'Not selected'}</div>
        <div><strong>Bank Routing Number:</strong> {formData.bankRoutingNumber ? '****' : 'Not provided'}</div>
        <div><strong>Bank Account Number:</strong> {formData.bankAccountNumber ? '****' : 'Not provided'}</div>
        
        <h3 style={{ marginTop: '24px', marginBottom: '16px', color: '#222222' }}>Payment Methods</h3>
        <div><strong>Stripe Account:</strong> {formData.stripeAccountId || 'Not provided'}</div>
        <div><strong>Credit Card:</strong> {formData.creditCardLast4 ? `****${formData.creditCardLast4}` : 'Not provided'}</div>
        
        <h3 style={{ marginTop: '24px', marginBottom: '16px', color: '#222222' }}>Property Information</h3>
        <div><strong>Type:</strong> {formData.propertyType}</div>
        <div><strong>Description:</strong> {formData.propertyDescription}</div>
        <div><strong>Experience:</strong> {formData.hostingExperience || 'Not provided'}</div>
      </div>

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
      <Container>
        <SuccessContainer>
          <SuccessIcon>
            <FaCheckCircle />
          </SuccessIcon>
          <SuccessTitle>Application Submitted Successfully!</SuccessTitle>
          <SuccessMessage>
            Your host application has been submitted and is currently under review. 
            We'll notify you via email once the review is complete.
          </SuccessMessage>
          
          {showStripeOnboarding && applicationData.stripeAccount && (
            <StripeOnboardingSection>
              <StripeOnboardingTitle>
                <FaCreditCard /> Complete Your Stripe Account Setup
              </StripeOnboardingTitle>
              <StripeOnboardingDescription>
                To start receiving payments from guests, you need to complete your Stripe Connect account setup.
                This process includes identity verification and bank account setup.
              </StripeOnboardingDescription>
              
              <StripeOnboardingSteps>
                <StepItem>
                  <StepNumber>1</StepNumber>
                  <StepContent>
                                         <StepTitleText>Click the Onboarding Link</StepTitleText>
                    <StepDescription>
                      Use the link below to complete your Stripe account setup. This will open Stripe's secure onboarding process.
                    </StepDescription>
                    <OnboardingButton 
                      href={applicationData.stripeAccount.onboardingUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <FaExternalLinkAlt /> Complete Stripe Setup
                    </OnboardingButton>
                  </StepContent>
                </StepItem>
                
                <StepItem>
                  <StepNumber>2</StepNumber>
                  <StepContent>
                                         <StepTitleText>Verify Your Identity</StepTitleText>
                    <StepDescription>
                      Stripe will guide you through identity verification, including document uploads and business information.
                    </StepDescription>
                  </StepContent>
                </StepItem>
                
                <StepItem>
                  <StepNumber>3</StepNumber>
                  <StepContent>
                                         <StepTitleText>Add Bank Account</StepTitleText>
                    <StepDescription>
                      Connect your bank account to receive payouts from guest bookings.
                    </StepDescription>
                  </StepContent>
                </StepItem>
                
                <StepItem>
                  <StepNumber>4</StepNumber>
                  <StepContent>
                                         <StepTitleText>Wait for Approval</StepTitleText>
                    <StepDescription>
                      Once complete, our team will review your application and Stripe account setup.
                    </StepDescription>
                  </StepContent>
                </StepItem>
              </StripeOnboardingSteps>
              
              <StripeAccountInfo>
                <InfoTitle>Your Stripe Account Details:</InfoTitle>
                <InfoGrid>
                  <InfoItem>
                    <InfoLabel>Account ID:</InfoLabel>
                    <InfoValue>{applicationData.stripeAccount.id}</InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Status:</InfoLabel>
                    <InfoValue>
                      <StatusBadge status={applicationData.stripeAccount.status}>
                        {applicationData.stripeAccount.status}
                      </StatusBadge>
                    </InfoValue>
                  </InfoItem>
                  <InfoItem>
                    <InfoLabel>Dashboard:</InfoLabel>
                    <InfoValue>
                      <a 
                        href={applicationData.stripeAccount.dashboardUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: '#1976d2', textDecoration: 'underline' }}
                      >
                        View Stripe Dashboard
                      </a>
                    </InfoValue>
                  </InfoItem>
                </InfoGrid>
              </StripeAccountInfo>
            </StripeOnboardingSection>
          )}
          
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
    );
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </BackButton>
          <Title>
            <FaFileAlt /> {isEditMode ? 'Edit Host Application' : 'Become a Host'}
          </Title>
        </HeaderLeft>
      </Header>

      <ApplicationOverview>
        <OverviewTitle>🚀 Become a Host on DrivInn</OverviewTitle>
        <OverviewDescription>
          Complete this application to start hosting and earning money. The process takes about 10-15 minutes and includes identity verification and Stripe Connect setup for secure payments.
        </OverviewDescription>
        
        <OverviewSteps>
          <OverviewStep>
            <OverviewStepNumber>1</OverviewStepNumber>
            <OverviewStepTitle>Personal Information</OverviewStepTitle>
            <OverviewStepText>Provide your contact details and address information</OverviewStepText>
          </OverviewStep>
          
          <OverviewStep>
            <OverviewStepNumber>2</OverviewStepNumber>
            <OverviewStepTitle>Identity Verification</OverviewStepTitle>
            <OverviewStepText>Upload ID documents and take a selfie for verification</OverviewStepText>
          </OverviewStep>
          
          <OverviewStep>
            <OverviewStepNumber>3</OverviewStepNumber>
            <OverviewStepTitle>Business & Financial</OverviewStepTitle>
            <OverviewStepText>Set up your business structure and bank account for payouts</OverviewStepText>
          </OverviewStep>
          
          <OverviewStep>
            <OverviewStepNumber>4</OverviewStepNumber>
            <OverviewStepTitle>Payment Methods</OverviewStepTitle>
            <OverviewStepText>Optional additional payment methods (bank account is primary)</OverviewStepText>
          </OverviewStep>
          
          <OverviewStep>
            <OverviewStepNumber>5</OverviewStepNumber>
            <OverviewStepTitle>Property Details</OverviewStepTitle>
            <OverviewStepText>Tell us about what you plan to host and your experience</OverviewStepText>
          </OverviewStep>
          
          <OverviewStep>
            <OverviewStepNumber>6</OverviewStepNumber>
            <OverviewStepTitle>Review & Submit</OverviewStepTitle>
            <OverviewStepText>Review your application and submit for approval</OverviewStepText>
          </OverviewStep>
        </OverviewSteps>
      </ApplicationOverview>

      <SecurityNotice>
        <SecurityTitle>
          <SecurityIcon />
          Security & Privacy Notice
        </SecurityTitle>
        <SecurityText>
          <strong>Your data security is our top priority.</strong> All sensitive information (SSN, bank details, ID documents) is encrypted using bank-level security. 
          We use this information solely to create your Stripe Connect account and verify your identity. We never store or access your sensitive data in plain text, 
          and all information is transmitted securely using HTTPS encryption.
        </SecurityText>
      </SecurityNotice>

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
              disabled={!canProceedToNextStep()}
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

      <FAQSection>
        <FAQTitle>❓ Frequently Asked Questions</FAQTitle>
        
        <FAQItem>
          <FAQQuestion>
            <FaInfoCircle /> How long does the application process take?
          </FAQQuestion>
          <FAQAnswer>
            The application form takes about 10-15 minutes to complete. After submission, our team reviews applications within 2-3 business days. 
            You'll receive email notifications at each step of the process.
          </FAQAnswer>
        </FAQItem>

        <FAQItem>
          <FAQQuestion>
            <FaInfoCircle /> What happens after I submit my application?
          </FAQQuestion>
          <FAQAnswer>
            After submission, we'll create your Stripe Connect account and send you an onboarding link. You'll need to complete Stripe's 
            verification process, then our team will review everything. Once approved, you can start listing your property and accepting bookings.
          </FAQAnswer>
        </FAQItem>

        <FAQItem>
          <FAQQuestion>
            <FaInfoCircle /> Is my personal information secure?
          </FAQQuestion>
          <FAQAnswer>
            Absolutely. We use bank-level encryption for all sensitive data. Your SSN, bank details, and ID documents are encrypted and 
            only used to create your Stripe Connect account. We never store or access this information in plain text.
          </FAQAnswer>
        </FAQItem>

        <FAQItem>
          <FAQQuestion>
            <FaInfoCircle /> What if I don't have a business?
          </FAQQuestion>
          <FAQAnswer>
            No problem! Most hosts operate as individuals (sole proprietors). Simply select "Individual (Sole Proprietor)" as your business 
            structure and leave the business fields blank. Your personal information will be used for the Stripe account.
          </FAQAnswer>
        </FAQItem>

        <FAQItem>
          <FAQQuestion>
            <FaInfoCircle /> Can I edit my application after submission?
          </FAQQuestion>
          <FAQAnswer>
            You can edit your application while it's being reviewed by contacting our support team. However, once approved, you'll need to 
            update your information through your host dashboard.
          </FAQAnswer>
        </FAQItem>

        <FAQItem>
          <FAQQuestion>
            <FaInfoCircle /> What if I need help during the process?
          </FAQQuestion>
          <FAQAnswer>
            We're here to help! If you encounter any issues or have questions, contact our support team at support@drivinn.com or 
            use the chat feature on our website. We typically respond within a few hours.
          </FAQAnswer>
        </FAQItem>
      </FAQSection>
    </Container>
  );
};

export default HostApplicationForm; 