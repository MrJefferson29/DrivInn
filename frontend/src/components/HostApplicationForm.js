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
  FaCreditCard,
  FaPaypal,
  FaHome,
  FaCamera,
  FaCheck,
  FaSpinner,
  FaExclamationTriangle,
  FaInfoCircle,
  FaFileAlt
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
    background: ${props => props.active ? '#FF385C' : '#DDDDDD'};
    transform: translateY(-50%);
  }
`;

const StepCircle = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.active ? '#FF385C' : '#DDDDDD'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin: 0 auto 8px;
  position: relative;
  z-index: 1;
  transition: all 0.3s ease;
`;

const StepLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: ${props => props.active ? '#FF385C' : '#717171'};
`;

const FormContent = styled.div`
  padding: 40px;
  
  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const StepTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 600;
  color: #222222;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StepSubtitle = styled.p`
  color: #717171;
  margin-bottom: 32px;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-weight: 600;
  color: #222222;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Required = styled.span`
  color: #FF385C;
  margin-left: 4px;
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
  
  &:disabled {
    background: #f7f7f7;
    color: #717171;
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
  font-size: 0.9rem;
  color: #717171;
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

const PaymentMethodCard = styled.div`
  border: 1px solid #DDDDDD;
  border-radius: 12px;
  padding: 24px;
  background: white;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #FF385C;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const PaymentMethodHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const PaymentIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: ${props => props.type === 'stripe' ? '#6772e5' : '#0070ba'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
`;

const PaymentTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #222222;
  margin: 0;
`;

const FormActions = styled.div`
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

const Button = styled.button`
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
  
  &.primary {
    background: #FF385C;
    color: white;
    
    &:hover:not(:disabled) {
      background: #e31c5f;
      transform: translateY(-1px);
    }
  }
  
  &.secondary {
    background: #f7f7f7;
    color: #222222;
    border: 1px solid #DDDDDD;
    
    &:hover {
      background: #e9e9e9;
    }
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

const steps = [
  { id: 0, label: 'Personal Info', icon: FaUser },
  { id: 1, label: 'Identity Verification', icon: FaIdCard },
  { id: 2, label: 'Payment Setup', icon: FaCreditCard },
  { id: 3, label: 'Property Info', icon: FaHome },
  { id: 4, label: 'Review & Submit', icon: FaCheck }
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
  // In formData, only keep stripeAccountId and creditCardLast4 for payment
  const [formData, setFormData] = useState({
    // Personal Information (pre-filled from user profile)
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    // Additional Personal Information
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
    // Payment Information
    stripeAccountId: '',
    creditCardLast4: '',
    // Property Information
    propertyType: '',
    propertyDescription: '',
    hostingExperience: ''
  });

  // Load existing application data if in edit mode
  useEffect(() => {
    if (isEditMode && existingApplication) {
      console.log('Loading existing application data:', existingApplication);
      setFormData({
        // Personal Information
        firstName: existingApplication.firstName || user?.firstName || '',
        lastName: existingApplication.lastName || user?.lastName || '',
        email: existingApplication.email || user?.email || '',
        // Additional Personal Information
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
        // Payment Information
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

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    if (!formData.stripeAccountId && !formData.creditCardLast4) {
      setError('At least one payment method (Stripe Account or Credit/Debit Card) is required.');
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();
      
      console.log('Submitting form data:', formData);
      
      // Add all form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          if (key.includes('Image') && formData[key] instanceof File) {
            console.log(`Adding file ${key}:`, formData[key].name);
            formDataToSend.append(key, formData[key]);
          } else {
            console.log(`Adding field ${key}:`, formData[key]);
            formDataToSend.append(key, formData[key]);
          }
        }
      });

      console.log('FormData entries:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, value);
      }

      await hostApplicationsAPI.submit(formDataToSend);
      navigate('/become-a-host/status');
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
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
      
      <InfoBox>
        <InfoIcon />
        <InfoText>
          Your name and email are pre-filled from your profile. Please verify and update if needed.
        </InfoText>
      </InfoBox>

      <FormGrid>
        <FormGroup>
          <Label>First Name<Required>*</Required></Label>
          <Input
            type="text"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Last Name<Required>*</Required></Label>
          <Input
            type="text"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Email<Required>*</Required></Label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label><FaPhone /> Phone Number<Required>*</Required></Label>
          <Input
            type="tel"
            value={formData.phoneNumber}
            onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
            placeholder="+1 (555) 123-4567"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label><FaCalendarAlt /> Date of Birth<Required>*</Required></Label>
          <Input
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
            required
          />
        </FormGroup>
      </FormGrid>

      <StepTitle style={{ marginTop: '32px' }}>
        <FaMapMarkerAlt /> Address Information
      </StepTitle>
      
      <FormGrid>
        <FormGroup>
          <Label>Street Address<Required>*</Required></Label>
          <Input
            type="text"
            value={formData.street}
            onChange={(e) => handleInputChange('street', e.target.value)}
            placeholder="123 Main Street"
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label>City<Required>*</Required></Label>
          <Input
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label>State/Province<Required>*</Required></Label>
          <Input
            type="text"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Postal Code<Required>*</Required></Label>
          <Input
            type="text"
            value={formData.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            required
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Country<Required>*</Required></Label>
          <Input
            type="text"
            value={formData.country}
            onChange={(e) => handleInputChange('country', e.target.value)}
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
        Please provide your government-issued ID and a selfie for verification.
      </StepSubtitle>
      
      <InfoBox>
        <InfoIcon />
        <InfoText>
          {isEditMode 
            ? "You're editing your existing application. Please re-upload your identity documents as they are required for verification."
            : "Your identity documents are securely stored and only used for verification purposes. We use industry-standard encryption to protect your information."
          }
        </InfoText>
      </InfoBox>

      <FormGrid>
        <FormGroup>
          <Label>ID Type<Required>*</Required></Label>
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
          <Label>ID Number<Required>*</Required></Label>
          <Input
            type="text"
            value={formData.idNumber}
            onChange={(e) => handleInputChange('idNumber', e.target.value)}
            placeholder="Enter your ID number"
            required
          />
        </FormGroup>
      </FormGrid>

      <div style={{ marginBottom: '32px' }}>
        <Label style={{ marginBottom: '16px' }}>ID Front Image<Required>*</Required></Label>
        <FileUploadArea
          className={formData.idFrontImage ? 'has-file' : ''}
          onClick={() => document.getElementById('idFrontImage').click()}
        >
          <FileUploadIcon />
          <FileUploadText>
            {formData.idFrontImage ? 'File Selected' : 'Click to upload ID front'}
          </FileUploadText>
          <FileUploadHint>
            Upload a clear photo of the front of your ID
          </FileUploadHint>
          {formData.idFrontImage && (
            <FilePreview>
              <FileName>{formData.idFrontImage.name}</FileName>
              <FileSize>{(formData.idFrontImage.size / 1024 / 1024).toFixed(2)} MB</FileSize>
            </FilePreview>
          )}
        </FileUploadArea>
        <HiddenFileInput
          id="idFrontImage"
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange('idFrontImage', e.target.files[0])}
        />
      </div>

      <div style={{ marginBottom: '32px' }}>
        <Label style={{ marginBottom: '16px' }}>ID Back Image<Required>*</Required></Label>
        <FileUploadArea
          className={formData.idBackImage ? 'has-file' : ''}
          onClick={() => document.getElementById('idBackImage').click()}
        >
          <FileUploadIcon />
          <FileUploadText>
            {formData.idBackImage ? 'File Selected' : 'Click to upload ID back'}
          </FileUploadText>
          <FileUploadHint>
            Upload a clear photo of the back of your ID
          </FileUploadHint>
          {formData.idBackImage && (
            <FilePreview>
              <FileName>{formData.idBackImage.name}</FileName>
              <FileSize>{(formData.idBackImage.size / 1024 / 1024).toFixed(2)} MB</FileSize>
            </FilePreview>
          )}
        </FileUploadArea>
        <HiddenFileInput
          id="idBackImage"
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange('idBackImage', e.target.files[0])}
        />
          </div>

      <div style={{ marginBottom: '32px' }}>
        <Label style={{ marginBottom: '16px' }}>Selfie<Required>*</Required></Label>
        <FileUploadArea
          className={formData.selfieImage ? 'has-file' : ''}
          onClick={() => document.getElementById('selfieImage').click()}
        >
          <FileUploadIcon />
          <FileUploadText>
            {formData.selfieImage ? 'File Selected' : 'Click to upload selfie'}
          </FileUploadText>
          <FileUploadHint>
            Upload a clear selfie for identity verification
          </FileUploadHint>
          {formData.selfieImage && (
            <FilePreview>
              <FileName>{formData.selfieImage.name}</FileName>
              <FileSize>{(formData.selfieImage.size / 1024 / 1024).toFixed(2)} MB</FileSize>
            </FilePreview>
          )}
        </FileUploadArea>
        <HiddenFileInput
          id="selfieImage"
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange('selfieImage', e.target.files[0])}
        />
      </div>
    </>
  );

  const renderPaymentSetupStep = () => (
    <>
      <StepTitle>
        <FaCreditCard /> Payment Setup
      </StepTitle>
      <StepSubtitle>
        Enter your Stripe Account ID and/or Credit/Debit Card Number (last 4 digits). At least one is required.
      </StepSubtitle>
      <InfoBox>
        <InfoIcon />
        <InfoText>
          You can provide either your Stripe Account ID, your credit/debit card number (last 4 digits), or both. At least one is required to receive payments.
        </InfoText>
      </InfoBox>
      <PaymentMethodCard>
        <PaymentMethodHeader>
          <PaymentIcon type="stripe">
            <FaCreditCard />
          </PaymentIcon>
          <PaymentTitle>Stripe Account</PaymentTitle>
        </PaymentMethodHeader>
        <FormGrid>
          <FormGroup>
            <Label>Stripe Account ID</Label>
            <Input
              type="text"
              value={formData.stripeAccountId}
              onChange={(e) => handleInputChange('stripeAccountId', e.target.value)}
              placeholder="acct_1234567890"
            />
          </FormGroup>
        </FormGrid>
      </PaymentMethodCard>
      <PaymentMethodCard style={{ marginTop: '24px' }}>
        <PaymentMethodHeader>
          <PaymentIcon type="credit">
            <FaCreditCard />
          </PaymentIcon>
          <PaymentTitle>Credit/Debit Card</PaymentTitle>
        </PaymentMethodHeader>
        <FormGrid>
          <FormGroup>
            <Label>Card Number (Last 4 Digits)</Label>
            <Input
              type="text"
              value={formData.creditCardLast4}
              onChange={(e) => handleInputChange('creditCardLast4', e.target.value)}
              placeholder="1234"
              maxLength="4"
            />
          </FormGroup>
        </FormGrid>
      </PaymentMethodCard>
    </>
  );

  const renderPropertyInfoStep = () => (
    <>
      <StepTitle>
        <FaHome /> Property Information
      </StepTitle>
      <StepSubtitle>
        Tell us about the property or vehicle you want to list.
      </StepSubtitle>

      <FormGrid>
        <FormGroup>
          <Label>Property Type<Required>*</Required></Label>
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
      </FormGrid>

      <FormGroup>
        <Label>Property Description<Required>*</Required></Label>
        <TextArea
          value={formData.propertyDescription}
          onChange={(e) => handleInputChange('propertyDescription', e.target.value)}
          placeholder="Describe your property, its features, location, and what makes it special..."
          required
        />
      </FormGroup>

      <FormGroup>
        <Label>Hosting Experience (Optional)</Label>
        <TextArea
          value={formData.hostingExperience}
          onChange={(e) => handleInputChange('hostingExperience', e.target.value)}
          placeholder="Tell us about your previous hosting experience, if any..."
        />
      </FormGroup>
    </>
  );

  const renderReviewStep = () => (
    <>
      <StepTitle>
        <FaCheck /> Review & {isEditMode ? 'Update' : 'Submit'}
      </StepTitle>
      <StepSubtitle>
        Please review your application before {isEditMode ? 'updating' : 'submitting'}.
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
        
        <h3 style={{ marginTop: '24px', marginBottom: '16px', color: '#222222' }}>Payment Methods</h3>
        <div><strong>Stripe Account:</strong> {formData.stripeAccountId || 'N/A'}</div>
        <div><strong>Credit/Debit Card (Last 4):</strong> {formData.creditCardLast4 || 'N/A'}</div>
        
        <h3 style={{ marginTop: '24px', marginBottom: '16px', color: '#222222' }}>Property Information</h3>
        <div><strong>Type:</strong> {formData.propertyType}</div>
        <div><strong>Description:</strong> {formData.propertyDescription}</div>
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
        return renderPaymentSetupStep();
      case 3:
        return renderPropertyInfoStep();
      case 4:
        return renderReviewStep();
      default:
        return null;
    }
  };

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

        <FormActions>
          <Button
            type="button"
            className="secondary"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            Previous
          </Button>

          {currentStep < steps.length - 1 ? (
            <Button
              type="button"
              className="primary"
              onClick={nextStep}
            >
              Next
            </Button>
          ) : (
            <Button
              type="button"
              className="primary"
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
            </Button>
          )}
        </FormActions>
      </FormCard>
    </Container>
  );
};

export default HostApplicationForm; 