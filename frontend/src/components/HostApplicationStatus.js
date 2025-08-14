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

const StatusCard = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #DDDDDD;
  overflow: hidden;
  margin-bottom: 24px;
`;

const StatusHeader = styled.div`
  padding: 32px;
  background: ${props => {
    if (props.status === 'approved') return 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)';
    if (props.status === 'declined') return 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)';
    return 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)';
  }};
  border-bottom: 1px solid #DDDDDD;
`;

const StatusTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 600;
  color: #222222;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatusSubtitle = styled.p`
  color: #6c757d;
  margin: 0;
  font-size: 1.1rem;
`;

const StatusBadge = styled(Badge)`
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  
  &.pending {
    background: #ffc107 !important;
    color: #212529 !important;
  }
  
  &.approved {
    background: #28a745 !important;
    color: white !important;
  }
  
  &.declined {
    background: #dc3545 !important;
    color: white !important;
  }
`;

const StatusContent = styled.div`
  padding: 32px;
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
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
`;

const AdminNoteHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #856404;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const AdminNoteText = styled.div`
  color: #856404;
  line-height: 1.5;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
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

const StripeOnboardingButton = styled.button`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  margin: 20px 0;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    font-size: 1.2rem;
  }
`;

const StripeOnboardingSection = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 24px;
  margin-top: 24px;
  margin-bottom: 24px;
`;

const StripeOnboardingTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #222222;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StripeOnboardingDescription = styled.p`
  color: #6c757d;
  font-size: 1rem;
  margin-bottom: 20px;
  line-height: 1.6;
`;

const StripeOnboardingSteps = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StepItem = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StepNumber = styled.div`
  background: #FF385C;
  color: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
`;

const StepContent = styled.div`
  flex-grow: 1;
`;

const StepTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  color: #222222;
  margin-bottom: 4px;
`;

const StepDescription = styled.p`
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 0;
`;

const HostApplicationStatus = () => {
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
            Host Application Status
          </StatusTitle>
          <StatusSubtitle>{getStatusMessage(application.status)}</StatusSubtitle>
          <StatusBadge className={application.status}>
            {application.status}
          </StatusBadge>
        </StatusHeader>

        <StatusContent>
            <SectionTitle>
              <FaUser /> Personal Information
            </SectionTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Name</InfoLabel>
              <InfoValue>{application.firstName} {application.lastName}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Email</InfoLabel>
              <InfoValue>{application.email}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Phone</InfoLabel>
              <InfoValue>{application.phoneNumber}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Date of Birth</InfoLabel>
              <InfoValue>{new Date(application.dateOfBirth).toLocaleDateString()}</InfoValue>
              </InfoItem>
            </InfoGrid>

            <SectionTitle>
            <FaMapMarkerAlt /> Address
            </SectionTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Street</InfoLabel>
              <InfoValue>{application.postalAddress.street}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>City</InfoLabel>
              <InfoValue>{application.postalAddress.city}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>State</InfoLabel>
              <InfoValue>{application.postalAddress.state}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Postal Code</InfoLabel>
              <InfoValue>{application.postalAddress.postalCode}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Country</InfoLabel>
              <InfoValue>{application.postalAddress.country}</InfoValue>
              </InfoItem>
            </InfoGrid>

            <SectionTitle>
              <FaIdCard /> Identity Verification
            </SectionTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>ID Type</InfoLabel>
              <InfoValue>{application.identityDocuments.idType}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>ID Number</InfoLabel>
              <InfoValue>{application.identityDocuments.idNumber}</InfoValue>
              </InfoItem>
              <InfoItem>
              <InfoLabel>Documents Uploaded</InfoLabel>
                <InfoValue>
                {application.identityDocuments.idFrontImage ? '✓' : '✗'} Front, 
                {application.identityDocuments.idBackImage ? ' ✓' : ' ✗'} Back, 
                {application.identityDocuments.selfieImage ? ' ✓' : ' ✗'} Selfie
                </InfoValue>
              </InfoItem>
            </InfoGrid>

            <SectionTitle>
            <FaCreditCard /> Payment Methods
            </SectionTitle>
            <InfoGrid>
              <InfoItem>
              <InfoLabel>Stripe Account</InfoLabel>
              <InfoValue>{application.paymentMethods?.stripeAccountId || 'Not provided'}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Credit Card</InfoLabel>
                <InfoValue>
                {application.paymentMethods?.creditCard?.last4 ? `****${application.paymentMethods.creditCard.last4}` : 'Not provided'}
                </InfoValue>
              </InfoItem>
            </InfoGrid>

            <SectionTitle>
              <FaHome /> Property Information
            </SectionTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Property Type</InfoLabel>
              <InfoValue>{application.propertyType}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Description</InfoLabel>
              <InfoValue>{application.propertyDescription}</InfoValue>
              </InfoItem>
                <InfoItem>
                  <InfoLabel>Hosting Experience</InfoLabel>
              <InfoValue>{application.hostingExperience || 'Not provided'}</InfoValue>
                </InfoItem>
            </InfoGrid>

            <SectionTitle>
              <FaFileAlt /> Application Details
            </SectionTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Submitted</InfoLabel>
              <InfoValue>{new Date(application.submittedAt).toLocaleDateString()}</InfoValue>
              </InfoItem>
            {application.reviewedAt && (
                <InfoItem>
                <InfoLabel>Reviewed</InfoLabel>
                <InfoValue>{new Date(application.reviewedAt).toLocaleDateString()}</InfoValue>
                </InfoItem>
              )}
            </InfoGrid>

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
            <>
              <InfoBox>
                <InfoIcon />
                <InfoText>
                  <strong>Congratulations!</strong> Your application has been approved. You can now start 
                  creating listings and hosting guests. We'll help you set up your payment methods for 
                  receiving payouts.
                </InfoText>
              </InfoBox>
              
              {application.stripeRemediationLink && (
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
              

            </>
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
        </StatusContent>
      </StatusCard>
    </Container>
  );
};

export default HostApplicationStatus; 