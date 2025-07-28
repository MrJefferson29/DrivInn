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
  FaPaypal,
  FaHome,
  FaSpinner,
  FaInfoCircle,
  FaExclamationTriangle
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
  color: #717171;
  margin: 0;
  font-size: 1rem;
`;

const StatusBadge = styled(Badge)`
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  margin-left: 12px;
  
  &.pending {
    background: #fff3cd !important;
    color: #856404 !important;
  }
  
  &.approved {
    background: #d4edda !important;
    color: #155724 !important;
  }
  
  &.declined {
    background: #f8d7da !important;
    color: #721c24 !important;
  }
`;

const StatusContent = styled.div`
  padding: 32px;
`;

const InfoSection = styled.div`
  margin-bottom: 32px;
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
  gap: 16px;
  margin-bottom: 16px;
`;

const InfoItem = styled.div`
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #DDDDDD;
`;

const InfoLabel = styled.div`
  font-weight: 600;
  color: #222222;
  margin-bottom: 4px;
  font-size: 0.9rem;
`;

const InfoValue = styled.div`
  color: #717171;
  font-size: 1rem;
`;

const DocumentLink = styled.a`
  color: #FF385C;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const AdminNote = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;
`;

const AdminNoteTitle = styled.div`
  font-weight: 600;
  color: #856404;
  margin-bottom: 8px;
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
  
  &.success {
    background: #28a745;
    color: white;
    
    &:hover:not(:disabled) {
      background: #218838;
      transform: translateY(-1px);
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #717171;
`;

const EmptyIcon = styled(FaFileAlt)`
  font-size: 4rem;
  color: #DDDDDD;
  margin-bottom: 24px;
`;

const EmptyTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #222222;
  margin-bottom: 12px;
`;

const EmptyText = styled.p`
  color: #717171;
  margin-bottom: 24px;
`;

const getStatusIcon = (status) => {
  switch (status) {
    case 'pending': return <FaClock />;
    case 'approved': return <FaCheckCircle />;
    case 'declined': return <FaTimesCircle />;
    default: return <FaClock />;
  }
};

const getStatusType = (status) => {
  switch (status) {
    case 'pending': return 'pending';
    case 'approved': return 'approved';
    case 'declined': return 'declined';
    default: return 'pending';
  }
};

const getStatusMessage = (status) => {
  switch (status) {
    case 'pending':
      return 'Your application is currently under review. We will notify you once a decision has been made.';
    case 'approved':
      return 'Congratulations! Your application has been approved. You can now create listings and start hosting.';
    case 'declined':
      return 'Your application was not approved. You can review the admin note below and reapply if needed.';
    default:
      return 'Your application status is being processed.';
  }
};

const HostApplicationStatus = () => {
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    hostApplicationsAPI.getMy()
      .then(res => {
        console.log('Application data:', res.data);
        setApp(res.data);
      })
      .catch((err) => {
        console.error('Error fetching application:', err);
        setApp(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleEditApplication = () => {
    // Navigate to edit form with application data
    navigate('/become-a-host/apply', { 
      state: { 
        editMode: true, 
        applicationData: app 
      } 
    });
  };

  const handleNewApplication = () => {
    navigate('/become-a-host/apply');
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <Spinner animation="border" variant="primary" />
        </LoadingContainer>
      </Container>
    );
  }

  if (!app) {
    return (
      <Container>
        <Header>
          <BackButton onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </BackButton>
          <Title>Host Application Status</Title>
        </Header>

        <EmptyState>
          <EmptyIcon />
          <EmptyTitle>No Application Found</EmptyTitle>
          <EmptyText>
            You haven't submitted a host application yet. Start your hosting journey today!
          </EmptyText>
          <Button className="primary" onClick={handleNewApplication}>
            <FaFileAlt /> Apply to Become a Host
          </Button>
        </EmptyState>
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

      {error && (
        <Alert variant="danger" style={{ marginBottom: '24px' }}>
          {error}
        </Alert>
      )}

      <StatusCard>
        <StatusHeader status={app.status}>
          <StatusTitle>
            {getStatusIcon(app.status)} Application Status
            <StatusBadge className={getStatusType(app.status)}>
              {app.status}
            </StatusBadge>
          </StatusTitle>
          <StatusSubtitle>
            {getStatusMessage(app.status)}
          </StatusSubtitle>
        </StatusHeader>

        <StatusContent>
          {/* Personal Information */}
          <InfoSection>
            <SectionTitle>
              <FaUser /> Personal Information
            </SectionTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Name</InfoLabel>
                <InfoValue>{app.firstName} {app.lastName}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Email</InfoLabel>
                <InfoValue>{app.email}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Phone</InfoLabel>
                <InfoValue>{app.phoneNumber}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Date of Birth</InfoLabel>
                <InfoValue>{new Date(app.dateOfBirth).toLocaleDateString()}</InfoValue>
              </InfoItem>
            </InfoGrid>
          </InfoSection>

          {/* Address Information */}
          <InfoSection>
            <SectionTitle>
              <FaMapMarkerAlt /> Address Information
            </SectionTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Street</InfoLabel>
                <InfoValue>{app.postalAddress?.street}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>City</InfoLabel>
                <InfoValue>{app.postalAddress?.city}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>State</InfoLabel>
                <InfoValue>{app.postalAddress?.state}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Postal Code</InfoLabel>
                <InfoValue>{app.postalAddress?.postalCode}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Country</InfoLabel>
                <InfoValue>{app.postalAddress?.country}</InfoValue>
              </InfoItem>
            </InfoGrid>
          </InfoSection>

          {/* Identity Verification */}
          <InfoSection>
            <SectionTitle>
              <FaIdCard /> Identity Verification
            </SectionTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>ID Type</InfoLabel>
                <InfoValue>{app.identityDocuments?.idType}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>ID Number</InfoLabel>
                <InfoValue>{app.identityDocuments?.idNumber}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>ID Front</InfoLabel>
                <InfoValue>
                  <DocumentLink href={app.identityDocuments?.idFrontImage} target="_blank" rel="noopener noreferrer">
                    View Image
                  </DocumentLink>
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>ID Back</InfoLabel>
                <InfoValue>
                  <DocumentLink href={app.identityDocuments?.idBackImage} target="_blank" rel="noopener noreferrer">
                    View Image
                  </DocumentLink>
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Selfie</InfoLabel>
                <InfoValue>
                  <DocumentLink href={app.identityDocuments?.selfieImage} target="_blank" rel="noopener noreferrer">
                    View Image
                  </DocumentLink>
                </InfoValue>
              </InfoItem>
            </InfoGrid>
          </InfoSection>

          {/* Payment Information */}
          <InfoSection>
            <SectionTitle>
              <FaCreditCard /> Payment Information
            </SectionTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Stripe Account ID</InfoLabel>
                <InfoValue>{app.paymentMethods?.stripeAccountId}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Credit Card</InfoLabel>
                <InfoValue>
                  {app.paymentMethods?.creditCard?.brand} ending in {app.paymentMethods?.creditCard?.last4}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Card Expiry</InfoLabel>
                <InfoValue>
                  {app.paymentMethods?.creditCard?.expiryMonth}/{app.paymentMethods?.creditCard?.expiryYear}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>PayPal Email</InfoLabel>
                <InfoValue>{app.paymentMethods?.paypalEmail}</InfoValue>
              </InfoItem>
            </InfoGrid>
          </InfoSection>

          {/* Property Information */}
          <InfoSection>
            <SectionTitle>
              <FaHome /> Property Information
            </SectionTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Property Type</InfoLabel>
                <InfoValue>{app.propertyType}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Description</InfoLabel>
                <InfoValue>{app.propertyDescription}</InfoValue>
              </InfoItem>
              {app.hostingExperience && (
                <InfoItem>
                  <InfoLabel>Hosting Experience</InfoLabel>
                  <InfoValue>{app.hostingExperience}</InfoValue>
                </InfoItem>
              )}
            </InfoGrid>
          </InfoSection>

          {/* Application Details */}
          <InfoSection>
            <SectionTitle>
              <FaFileAlt /> Application Details
            </SectionTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Submitted</InfoLabel>
                <InfoValue>{new Date(app.createdAt).toLocaleString()}</InfoValue>
              </InfoItem>
              {app.updatedAt && (
                <InfoItem>
                  <InfoLabel>Last Updated</InfoLabel>
                  <InfoValue>{new Date(app.updatedAt).toLocaleString()}</InfoValue>
                </InfoItem>
              )}
            </InfoGrid>
          </InfoSection>

          {/* Admin Note */}
          {app.adminNote && (
            <AdminNote>
              <AdminNoteTitle>
                <FaExclamationTriangle /> Admin Note
              </AdminNoteTitle>
              <AdminNoteText>{app.adminNote}</AdminNoteText>
            </AdminNote>
          )}

          {/* Action Buttons */}
          <ActionButtons>
            {app.status === 'declined' && (
              <>
                <Button className="primary" onClick={handleEditApplication}>
                  <FaEdit /> Edit & Resubmit
                </Button>
                <Button className="secondary" onClick={handleNewApplication}>
                  <FaFileAlt /> Submit New Application
                </Button>
              </>
            )}
            {app.status === 'pending' && (
              <Button className="primary" onClick={handleEditApplication}>
                <FaEdit /> Edit Application
              </Button>
            )}
            {app.status === 'approved' && (
              <Button className="success" onClick={() => navigate('/create-listing')}>
                <FaHome /> Create Your First Listing
              </Button>
            )}
            <Button className="secondary" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </ActionButtons>
        </StatusContent>
      </StatusCard>
    </Container>
  );
};

export default HostApplicationStatus; 