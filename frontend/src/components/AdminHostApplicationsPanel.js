import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { hostApplicationsAPI } from '../services/api';
import { 
  FaArrowLeft, 
  FaEye, 
  FaCheck, 
  FaTimes, 
  FaClock, 
  FaCheckCircle, 
  FaTimesCircle,
  FaUser,
  FaEnvelope,
  FaCalendar,
  FaFileAlt,
  FaComments,
  FaSpinner,
  FaFilter,
  FaSearch,
  FaIdCard,
  FaCreditCard,
  FaPaypal,
  FaHome,
  FaMapMarkerAlt,
  FaPhone,
  FaImage,
  FaExpand,
  FaTimes as FaClose
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Spinner, Alert, Badge } from 'react-bootstrap';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
  
  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;
  }
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
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.75rem;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #DDDDDD;
  text-align: center;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #FF385C;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #717171;
  font-weight: 500;
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 1px solid #DDDDDD;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
    box-shadow: 0 0 0 3px rgba(255, 56, 92, 0.1);
  }
`;

const SearchInput = styled.input`
  padding: 12px 16px;
  border: 1px solid #DDDDDD;
  border-radius: 8px;
  font-size: 1rem;
  flex: 1;
  min-width: 250px;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
    box-shadow: 0 0 0 3px rgba(255, 56, 92, 0.1);
  }
`;

const ApplicationsTable = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #DDDDDD;
  overflow: hidden;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 20px;
  padding: 20px 24px;
  background: #f9f9f9;
  border-bottom: 1px solid #DDDDDD;
  font-weight: 600;
  color: #222222;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const ApplicationCard = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #DDDDDD;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f9f9f9;
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const ApplicationHeader = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 20px;
  align-items: center;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const UserAvatar = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: #FF385C;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
`;

const UserDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #222222;
  font-size: 1rem;
`;

const UserEmail = styled.div`
  color: #717171;
  font-size: 0.9rem;
`;

const StatusBadge = styled(Badge)`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  
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

const DateInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #717171;
  font-size: 0.9rem;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &.primary {
    background: #FF385C;
    color: white;
    
    &:hover {
      background: #e31c5f;
    }
  }
  
  &.success {
    background: #28a745;
    color: white;
    
    &:hover {
      background: #218838;
    }
  }
  
  &.danger {
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
    }
  }
  
  &.secondary {
    background: #6c757d;
    color: white;
    
    &:hover {
      background: #5a6268;
    }
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  padding: 24px 32px;
  border-bottom: 1px solid #DDDDDD;
  background: #f9f9f9;
  
  @media (max-width: 768px) {
    padding: 20px 24px;
  }
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: #222222;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ModalSubtitle = styled.p`
  color: #717171;
  margin: 0;
  font-size: 1rem;
`;

const ModalBody = styled.div`
  padding: 32px;
  
  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const Label = styled.label`
  font-weight: 600;
  color: #222222;
  margin-bottom: 12px;
  display: block;
  font-size: 1rem;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #DDDDDD;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
    box-shadow: 0 0 0 3px rgba(255, 56, 92, 0.1);
  }
`;

const ModalActions = styled.div`
  padding: 24px 32px;
  border-top: 1px solid #DDDDDD;
  background: #f9f9f9;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  
  @media (max-width: 768px) {
    padding: 20px 24px;
    flex-direction: column;
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

const EmptyTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #222222;
  margin-bottom: 12px;
`;

const EmptyText = styled.p`
  color: #717171;
  margin-bottom: 24px;
`;

// New styled components for image display
const ImageSection = styled.div`
  margin-bottom: 24px;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 12px;
`;

const ImageCard = styled.div`
  border: 1px solid #DDDDDD;
  border-radius: 8px;
  overflow: hidden;
  background: white;
  transition: all 0.2s ease;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
  }
`;

const ImageHeader = styled.div`
  padding: 12px 16px;
  background: #f9f9f9;
  border-bottom: 1px solid #DDDDDD;
  font-weight: 600;
  color: #222222;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ImageContainer = styled.div`
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
  cursor: pointer;
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: scale(1.05);
  }
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

const InfoSection = styled.div`
  background: #f9f9f9;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoLabel = styled.span`
  font-weight: 600;
  color: #222222;
  font-size: 0.9rem;
  margin-bottom: 4px;
`;

const InfoValue = styled.span`
  color: #717171;
  font-size: 1rem;
`;

const InfoLink = styled.a`
  color: #FF385C;
  text-decoration: none;
  font-weight: 500;
  
  &:hover {
    text-decoration: underline;
  }
`;

const AdminHostApplicationsPanel = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);
  const [status, setStatus] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    try {
    setLoading(true);
      const response = await hostApplicationsAPI.list();
      console.log('Fetched applications:', response.data);
      setApplications(response.data);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
    await hostApplicationsAPI.approve(id);
      setSelected(null);
    fetchApps();
    } catch (err) {
      setError('Failed to approve application');
    }
  };

  const handleDecline = async (id) => {
    try {
      await hostApplicationsAPI.decline(id, adminNote);
      setSelected(null);
      setAdminNote('');
      fetchApps();
    } catch (err) {
      console.error('Decline error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to decline application';
      setError(errorMessage);
    }
  };

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

  const filteredApps = applications.filter(app => {
    const matchesStatus = !status || app.status === status;
    const matchesSearch = !searchTerm || 
      app.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    declined: applications.filter(app => app.status === 'declined').length,
    total: applications.length
  };

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </BackButton>
          <Title>
            <FaFileAlt /> Host Applications
          </Title>
        </HeaderLeft>
      </Header>

      {/* Statistics */}
      <StatsContainer>
        <StatCard>
          <StatValue>{stats.pending}</StatValue>
          <StatLabel>Pending</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.approved}</StatValue>
          <StatLabel>Approved</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.declined}</StatValue>
          <StatLabel>Declined</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.total}</StatValue>
          <StatLabel>Total</StatLabel>
        </StatCard>
      </StatsContainer>

      {/* Controls */}
      <ControlsContainer>
        <FilterSelect value={status} onChange={e => setStatus(e.target.value)}>
          <option value="pending">Pending Applications</option>
          <option value="approved">Approved Applications</option>
          <option value="declined">Declined Applications</option>
          <option value="">All Applications</option>
        </FilterSelect>
        <SearchInput
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </ControlsContainer>

      {/* Error Alert */}
      {error && (
        <Alert variant="danger" style={{ marginBottom: '24px' }}>
          {error}
        </Alert>
      )}

      {/* Applications Table */}
      <ApplicationsTable>
        <TableHeader>
          <div>Applicant</div>
          <div>Status</div>
          <div>Submitted</div>
          <div>Actions</div>
        </TableHeader>

        {loading ? (
          <LoadingContainer>
            <Spinner animation="border" variant="primary" />
          </LoadingContainer>
        ) : filteredApps.length === 0 ? (
          <EmptyState>
            <EmptyIcon />
            <EmptyTitle>No applications found</EmptyTitle>
            <EmptyText>
              {searchTerm ? 'Try adjusting your search terms' : 'No applications match the current filter'}
            </EmptyText>
          </EmptyState>
        ) : (
          filteredApps.map(app => (
            <ApplicationCard key={app._id} onClick={() => setSelected(app)}>
              <ApplicationHeader>
                <UserInfo>
                  <UserAvatar>
                    {app.firstName?.charAt(0) || 'U'}
                  </UserAvatar>
                  <UserDetails>
                    <UserName>
                      {app.firstName} {app.lastName}
                    </UserName>
                    <UserEmail>
                      {app.email}
                    </UserEmail>
                  </UserDetails>
                </UserInfo>
                <StatusBadge className={getStatusType(app.status)}>
                  {getStatusIcon(app.status)} {app.status}
                </StatusBadge>
                <DateInfo>
                  <FaCalendar />
                  {new Date(app.createdAt).toLocaleDateString()}
                </DateInfo>
                <ActionButton className="primary">
                  <FaEye /> View Details
                </ActionButton>
              </ApplicationHeader>
            </ApplicationCard>
          ))
        )}
      </ApplicationsTable>

      {/* Application Details Modal */}
      {selected && (
        <Modal onClick={() => setSelected(null)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <FaFileAlt /> Application Details
              </ModalTitle>
              <ModalSubtitle>
                Review application from {selected.firstName} {selected.lastName}
              </ModalSubtitle>
            </ModalHeader>
            
            <ModalBody>
              {/* Applicant Information */}
              <FormGroup>
                <Label>
                  <FaUser /> Applicant Information
                </Label>
                <InfoSection>
                  <InfoGrid>
                    <InfoItem>
                      <InfoLabel>Name</InfoLabel>
                      <InfoValue>{selected.firstName} {selected.lastName}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>Email</InfoLabel>
                      <InfoValue>{selected.email}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>Phone</InfoLabel>
                      <InfoValue>{selected.phoneNumber}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>Date of Birth</InfoLabel>
                      <InfoValue>{new Date(selected.dateOfBirth).toLocaleDateString()}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>Status</InfoLabel>
                      <InfoValue>
                        <StatusBadge className={getStatusType(selected.status)}>
                          {selected.status}
                        </StatusBadge>
                      </InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>Submitted</InfoLabel>
                      <InfoValue>{new Date(selected.createdAt).toLocaleString()}</InfoValue>
                    </InfoItem>
                  </InfoGrid>
                </InfoSection>
              </FormGroup>

              {/* Address Information */}
              <FormGroup>
                <Label>
                  <FaMapMarkerAlt /> Address Information
                </Label>
                <InfoSection>
                  <InfoGrid>
                    <InfoItem>
                      <InfoLabel>Street</InfoLabel>
                      <InfoValue>{selected.postalAddress?.street}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>City</InfoLabel>
                      <InfoValue>{selected.postalAddress?.city}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>State</InfoLabel>
                      <InfoValue>{selected.postalAddress?.state}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>Postal Code</InfoLabel>
                      <InfoValue>{selected.postalAddress?.postalCode}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>Country</InfoLabel>
                      <InfoValue>{selected.postalAddress?.country}</InfoValue>
                    </InfoItem>
                  </InfoGrid>
                </InfoSection>
              </FormGroup>

              {/* Identity Verification Images */}
              <FormGroup>
                <Label>
                  <FaIdCard /> Identity Verification Documents
                </Label>
                <ImageSection>
                  <ImageGrid>
                    <ImageCard>
                      <ImageHeader>
                        <FaImage /> ID Front
                      </ImageHeader>
                      <ImageContainer>
                        <Image 
                          src={selected.identityDocuments?.idFrontImage} 
                          alt="ID Front"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div style={{ 
                          display: 'none', 
                          position: 'absolute', 
                          top: '50%', 
                          left: '50%', 
                          transform: 'translate(-50%, -50%)',
                          color: '#717171',
                          fontSize: '0.9rem'
                        }}>
                          Image not available
          </div>
                        <ImageOverlay onClick={() => window.open(selected.identityDocuments?.idFrontImage, '_blank')}>
                          <FaExpand />
                        </ImageOverlay>
                      </ImageContainer>
                    </ImageCard>

                    <ImageCard>
                      <ImageHeader>
                        <FaImage /> ID Back
                      </ImageHeader>
                      <ImageContainer>
                        <Image 
                          src={selected.identityDocuments?.idBackImage} 
                          alt="ID Back"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div style={{ 
                          display: 'none', 
                          position: 'absolute', 
                          top: '50%', 
                          left: '50%', 
                          transform: 'translate(-50%, -50%)',
                          color: '#717171',
                          fontSize: '0.9rem'
                        }}>
                          Image not available
          </div>
                        <ImageOverlay onClick={() => window.open(selected.identityDocuments?.idBackImage, '_blank')}>
                          <FaExpand />
                        </ImageOverlay>
                      </ImageContainer>
                    </ImageCard>

                    <ImageCard>
                      <ImageHeader>
                        <FaImage /> Selfie
                      </ImageHeader>
                      <ImageContainer>
                        <Image 
                          src={selected.identityDocuments?.selfieImage} 
                          alt="Selfie"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div style={{ 
                          display: 'none', 
                          position: 'absolute', 
                          top: '50%', 
                          left: '50%', 
                          transform: 'translate(-50%, -50%)',
                          color: '#717171',
                          fontSize: '0.9rem'
                        }}>
                          Image not available
          </div>
                        <ImageOverlay onClick={() => window.open(selected.identityDocuments?.selfieImage, '_blank')}>
                          <FaExpand />
                        </ImageOverlay>
                      </ImageContainer>
                    </ImageCard>
                  </ImageGrid>
                </ImageSection>
              </FormGroup>

              {/* Identity Verification Details */}
              <FormGroup>
                <Label>
                  <FaIdCard /> Identity Verification Details
                </Label>
                <InfoSection>
                  <InfoGrid>
                    <InfoItem>
                      <InfoLabel>ID Type</InfoLabel>
                      <InfoValue>{selected.identityDocuments?.idType}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>ID Number</InfoLabel>
                      <InfoValue>{selected.identityDocuments?.idNumber}</InfoValue>
                    </InfoItem>
                  </InfoGrid>
                </InfoSection>
              </FormGroup>

              {/* Payment Information */}
              <FormGroup>
                <Label>
                  <FaCreditCard /> Payment Information
                </Label>
                <InfoSection>
                  <InfoGrid>
                    <InfoItem>
                      <InfoLabel>Stripe Account ID</InfoLabel>
                      <InfoValue>{selected.paymentMethods?.stripeAccountId}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>Credit Card</InfoLabel>
                      <InfoValue>
                        {selected.paymentMethods?.creditCard?.brand} ending in {selected.paymentMethods?.creditCard?.last4}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>Card Expiry</InfoLabel>
                      <InfoValue>
                        {selected.paymentMethods?.creditCard?.expiryMonth}/{selected.paymentMethods?.creditCard?.expiryYear}
                      </InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>PayPal Email</InfoLabel>
                      <InfoValue>{selected.paymentMethods?.paypalEmail}</InfoValue>
                    </InfoItem>
                  </InfoGrid>
                </InfoSection>
              </FormGroup>

              {/* Property Information */}
              <FormGroup>
                <Label>
                  <FaHome /> Property Information
                </Label>
                <InfoSection>
                  <InfoGrid>
                    <InfoItem>
                      <InfoLabel>Property Type</InfoLabel>
                      <InfoValue>{selected.propertyType}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                      <InfoLabel>Description</InfoLabel>
                      <InfoValue>{selected.propertyDescription}</InfoValue>
                    </InfoItem>
                    {selected.hostingExperience && (
                      <InfoItem>
                        <InfoLabel>Hosting Experience</InfoLabel>
                        <InfoValue>{selected.hostingExperience}</InfoValue>
                      </InfoItem>
                    )}
                  </InfoGrid>
                </InfoSection>
              </FormGroup>

              {selected.status === 'pending' && (
                <FormGroup>
                  <Label>Admin Note (optional)</Label>
                  <TextArea
                    value={adminNote}
                    onChange={e => setAdminNote(e.target.value)}
                    placeholder="Add a note about your decision..."
                  />
                </FormGroup>
              )}
            </ModalBody>

            <ModalActions>
              {selected.status === 'pending' && (
                <>
                  <ActionButton className="success" onClick={() => handleApprove(selected._id)}>
                    <FaCheck /> Approve
                  </ActionButton>
                  <ActionButton className="danger" onClick={() => handleDecline(selected._id)}>
                    <FaTimes /> Decline
                  </ActionButton>
                </>
              )}
              <ActionButton className="secondary" onClick={() => setSelected(null)}>
                <FaClose /> Close
              </ActionButton>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default AdminHostApplicationsPanel; 