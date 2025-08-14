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
  FaHome,
  FaMapMarkerAlt,
  FaPhone,
  FaImage,
  FaExpand,
  FaTimes as FaClose,
  FaPaypal
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Spinner, Alert, Badge } from 'react-bootstrap';

const Container = styled.div`
  max-width: 1400px;
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
`;

const StatCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #DDDDDD;
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #FF385C;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  color: #6c757d;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ControlsContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #DDDDDD;
  margin-bottom: 24px;
`;

const ControlsTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #222222;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ControlsRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #DDDDDD;
  border-radius: 6px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
  }
`;

const SearchInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #DDDDDD;
  border-radius: 6px;
  font-size: 0.9rem;
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
  }
`;

const TableHeader = styled.div`
  background: white;
  border-radius: 12px 12px 0 0;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #DDDDDD;
  border-bottom: none;
`;

const TableTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #222222;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ApplicationsTable = styled.div`
  background: white;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #DDDDDD;
  border-top: none;
  overflow: hidden;
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: 16px;
  padding: 16px 20px;
  align-items: center;
  border-bottom: 1px solid #DDDDDD;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  }
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
    padding: 12px 16px;
  }
`;

const TableHeaderRow = styled(TableRow)`
  background: #f8f9fa;
  font-weight: 600;
  color: #6c757d;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

const TableCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
`;

const StatusBadge = styled(Badge)`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
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

const ActionButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &.approve {
    background: #28a745;
    color: white;
    
    &:hover:not(:disabled) {
      background: #218838;
    }
  }
  
  &.decline {
    background: #dc3545;
    color: white;
    
    &:hover:not(:disabled) {
      background: #c82333;
    }
  }
  
  &.view {
    background: #6c757d;
    color: white;
    
    &:hover:not(:disabled) {
      background: #5a6268;
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
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
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  max-width: 600px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: #222222;
  margin: 0;
`;

const ModalClose = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  
  &:hover {
    color: #222222;
  }
`;

const ModalBody = styled.div`
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #222222;
  margin-bottom: 6px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #DDDDDD;
  border-radius: 6px;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 100px;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: #FF385C;
    color: white;
    
    &:hover:not(:disabled) {
      background: #e31c5f;
    }
  }
  
  &.secondary {
    background: #6c757d;
    color: white;
    
    &:hover:not(:disabled) {
      background: #5a6268;
    }
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 60px 20px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
`;

const EmptyIcon = styled(FaFileAlt)`
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #6c757d;
`;

const EmptyText = styled.p`
  font-size: 1rem;
  color: #6c757d;
`;

const AdminHostApplicationsPanel = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [stripeRemediationLink, setStripeRemediationLink] = useState('');
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await hostApplicationsAPI.list();
      setApplications(response.data || []);
    } catch (err) {
      console.error('Error fetching applications:', err);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId) => {
    if (!adminNote.trim()) {
      alert('Please provide an admin note for approval');
      return;
    }
    
    if (!stripeRemediationLink.trim()) {
      alert('Please provide the Stripe remediation link');
      return;
    }

    try {
      setProcessing(true);
      await hostApplicationsAPI.approve(applicationId, { adminNote, stripeRemediationLink });
      await fetchApplications();
      setShowModal(false);
      setSelectedApplication(null);
      setAdminNote('');
      setStripeRemediationLink('');
    } catch (err) {
      console.error('Error approving application:', err);
      alert('Failed to approve application');
    } finally {
      setProcessing(false);
    }
  };

  const handleDecline = async (applicationId) => {
    if (!adminNote.trim()) {
      alert('Please provide a reason for declining the application');
      return;
    }

    try {
      setProcessing(true);
      await hostApplicationsAPI.decline(applicationId, adminNote);
      await fetchApplications();
      setShowModal(false);
      setSelectedApplication(null);
      setAdminNote('');
    } catch (err) {
      console.error('Error declining application:', err);
      alert('Failed to decline application');
    } finally {
      setProcessing(false);
    }
  };

  const openModal = (type, application) => {
    setModalType(type);
    setSelectedApplication(application);
    setShowModal(true);
    if (type === 'decline') {
      setAdminNote('');
    } else if (type === 'approve') {
      setAdminNote('');
      setStripeRemediationLink('');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedApplication(null);
    setModalType('');
    setAdminNote('');
    setStripeRemediationLink('');
  };

  const filteredApplications = applications.filter(app => {
    const matchesStatus = !statusFilter || app.status === statusFilter;
    const matchesSearch = !searchTerm || 
      app.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    approved: applications.filter(app => app.status === 'approved').length,
    declined: applications.filter(app => app.status === 'declined').length
  };

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <FaSpinner className="fa-spin" style={{ fontSize: '2rem', color: '#FF385C' }} />
          <p style={{ marginTop: '16px', color: '#6c757d' }}>Loading applications...</p>
        </LoadingContainer>
      </Container>
    );
  }

  if (filteredApplications.length === 0 && !loading) {
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

        {error && (
          <Alert variant="danger" style={{ marginBottom: '24px' }}>
            {error}
          </Alert>
        )}

        <EmptyState>
          <EmptyIcon />
          <EmptyTitle>No Applications Found</EmptyTitle>
          <EmptyText>
            {statusFilter || searchTerm 
              ? 'No applications match your current filters. Try adjusting your search criteria.'
              : 'There are no host applications to review at this time.'
            }
          </EmptyText>
        </EmptyState>
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
            <FaFileAlt /> Host Applications
          </Title>
        </HeaderLeft>
      </Header>

      {error && (
        <Alert variant="danger" style={{ marginBottom: '24px' }}>
          {error}
        </Alert>
      )}

      <StatsContainer>
        <StatCard>
          <StatNumber>{stats.total}</StatNumber>
          <StatLabel>Total Applications</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.pending}</StatNumber>
          <StatLabel>Pending Review</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.approved}</StatNumber>
          <StatLabel>Approved</StatLabel>
        </StatCard>
        <StatCard>
          <StatNumber>{stats.declined}</StatNumber>
          <StatLabel>Declined</StatLabel>
        </StatCard>
      </StatsContainer>

      <ControlsContainer>
        <ControlsTitle>
          <FaFilter /> Filters
        </ControlsTitle>
        <ControlsRow>
          <FilterSelect 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
          </FilterSelect>
          
          <SearchInput
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </ControlsRow>
      </ControlsContainer>

      <TableHeader>
        <TableTitle>
          <FaFileAlt /> Applications Overview
        </TableTitle>
      </TableHeader>

      <ApplicationsTable>
        <TableHeaderRow>
          <TableCell>Applicant</TableCell>
          <TableCell>Contact</TableCell>
          <TableCell>Property</TableCell>
          <TableCell>Business Info</TableCell>
          <TableCell>Payment Method</TableCell>
          <TableCell>Documents</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Actions</TableCell>
        </TableHeaderRow>
        
        {filteredApplications.map((application) => (
          <TableRow key={application._id}>
            <TableCell>
              <FaUser />
              {application.firstName} {application.lastName}
            </TableCell>
            
            <TableCell>
              <div>
                <div><FaEnvelope /> {application.email}</div>
                <div><FaPhone /> {application.phoneNumber}</div>
                <div><FaCalendar /> {new Date(application.dateOfBirth).toLocaleDateString()}</div>
              </div>
            </TableCell>
            
            <TableCell>
              <div>
                <div><FaHome /> {application.propertyType}</div>
                <div><FaMapMarkerAlt /> {application.postalAddress?.city}, {application.postalAddress?.state}</div>
              </div>
            </TableCell>
            
            <TableCell>
              <div>
                <div><strong>Business:</strong> {application.businessName || 'Individual'}</div>
                <div><strong>Structure:</strong> {application.businessStructure || 'N/A'}</div>
                <div><strong>Tax ID:</strong> {application.businessTaxId || 'N/A'}</div>
              </div>
            </TableCell>
            
            <TableCell>
              <div>
                {application.stripeConnect?.accountId ? (
                  <div><FaPaypal /> Stripe Account: {application.stripeConnect.accountId.substring(0, 8)}...</div>
                ) : application.paymentMethods?.stripeAccountId ? (
                  <div><FaPaypal /> Stripe: {application.paymentMethods.stripeAccountId.substring(0, 8)}...</div>
                ) : application.paymentMethods?.creditCard?.last4 ? (
                  <div><FaCreditCard /> Card: ****{application.paymentMethods.creditCard.last4}</div>
                ) : (
                  <div>No payment method</div>
                )}
              </div>
            </TableCell>
            
            <TableCell>
              <div>
                <div><FaIdCard /> Front: {application.identityDocuments?.idFrontImage ? '✓' : '✗'}</div>
                <div><FaIdCard /> Back: {application.identityDocuments?.idBackImage ? '✓' : '✗'}</div>
                <div><FaImage /> Selfie: {application.identityDocuments?.selfieImage ? '✓' : '✗'}</div>
              </div>
            </TableCell>
            
            <TableCell>
              <StatusBadge className={application.status}>
                {application.status}
              </StatusBadge>
            </TableCell>
            
            <TableCell>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <ActionButton
                  className="view"
                  onClick={() => openModal('view', application)}
                >
                  <FaEye /> View
                </ActionButton>
                
                {application.status === 'pending' && (
                  <>
                    <ActionButton
                      className="approve"
                      onClick={() => openModal('approve', application)}
                    >
                      <FaCheck /> Approve
                    </ActionButton>
                    
                    <ActionButton
                      className="decline"
                      onClick={() => openModal('decline', application)}
                    >
                      <FaTimes /> Decline
                    </ActionButton>
                  </>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </ApplicationsTable>

      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {modalType === 'approve' && 'Approve Application'}
                {modalType === 'decline' && 'Decline Application'}
                {modalType === 'view' && 'Application Details'}
              </ModalTitle>
              <ModalClose onClick={closeModal}>
                <FaClose />
              </ModalClose>
            </ModalHeader>
            
            <ModalBody>
              {modalType === 'view' && selectedApplication && (
                <div>
                  <h4>Personal Information</h4>
                  <p><strong>Name:</strong> {selectedApplication.firstName} {selectedApplication.lastName}</p>
                  <p><strong>Email:</strong> {selectedApplication.email}</p>
                  <p><strong>Phone:</strong> {selectedApplication.phoneNumber}</p>
                  <p><strong>Date of Birth:</strong> {new Date(selectedApplication.dateOfBirth).toLocaleDateString()}</p>
                  
                  <h4>Address</h4>
                  <p>{selectedApplication.postalAddress?.street}, {selectedApplication.postalAddress?.city}, {selectedApplication.postalAddress?.state} {selectedApplication.postalAddress?.postalCode}, {selectedApplication.postalAddress?.country}</p>
                  
                  <h4>Business Information</h4>
                  <p><strong>Business Name:</strong> {selectedApplication.businessName || 'Individual (no business name)'}</p>
                  <p><strong>Business Tax ID:</strong> {selectedApplication.businessTaxId || 'Not provided'}</p>
                  <p><strong>Business Structure:</strong> {selectedApplication.businessStructure || 'Individual'}</p>
                  <p><strong>Business Address:</strong> {selectedApplication.businessAddress?.street ? `${selectedApplication.businessAddress.street}, ${selectedApplication.businessAddress.city}, ${selectedApplication.businessAddress.state} ${selectedApplication.businessAddress.postalCode}, ${selectedApplication.businessAddress.country}` : 'Same as personal address'}</p>
                  <p><strong>Business Phone:</strong> {selectedApplication.businessPhone || 'Same as personal phone'}</p>
                  
                  <h4>Financial Information</h4>
                  <p><strong>SSN Last 4:</strong> {selectedApplication.ssnLast4 ? '****' : 'Not provided'}</p>
                  <p><strong>Support Phone:</strong> {selectedApplication.supportPhone || 'Not provided'}</p>
                  <p><strong>Bank Account Type:</strong> {selectedApplication.bankAccount?.accountType || 'Not selected'}</p>
                  <p><strong>Bank Routing Number:</strong> {selectedApplication.bankAccount?.routingNumber ? '****' : 'Not provided'}</p>
                  <p><strong>Bank Account Number:</strong> {selectedApplication.bankAccount?.accountNumber ? '****' : 'Not provided'}</p>
                  
                  <h4>Property Information</h4>
                  <p><strong>Type:</strong> {selectedApplication.propertyType}</p>
                  <p><strong>Description:</strong> {selectedApplication.propertyDescription}</p>
                  <p><strong>Experience:</strong> {selectedApplication.hostingExperience || 'Not provided'}</p>
                  
                  <h4>Payment Methods</h4>
                  <p><strong>Stripe Account:</strong> {selectedApplication.stripeConnect?.accountId || selectedApplication.paymentMethods?.stripeAccountId || 'Not provided'}</p>
                  <p><strong>Credit Card:</strong> {selectedApplication.paymentMethods?.creditCard?.last4 ? `****${selectedApplication.paymentMethods.creditCard.last4}` : 'Not provided'}</p>
                  
                  {selectedApplication.stripeConnect && (
                    <>
                      <h4>Stripe Connect Status</h4>
                      <p><strong>Account Status:</strong> {selectedApplication.stripeConnect.accountStatus}</p>
                      <p><strong>Onboarding Completed:</strong> {selectedApplication.stripeConnect.onboardingCompleted ? 'Yes' : 'No'}</p>
                    </>
                  )}
                </div>
              )}
              
              {modalType === 'approve' && (
                <div>
                  <p>Are you sure you want to approve this application?</p>
                  <p><strong>Applicant:</strong> {selectedApplication?.firstName} {selectedApplication?.lastName}</p>
                  <p>This will grant the user host privileges and allow them to create listings.</p>
                  <p><strong>Note:</strong> A Stripe Connect account will be created automatically for this host.</p>
                  
                  <FormGroup>
                    <Label>Admin Note (Required)</Label>
                    <TextArea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Provide a note about the approval..."
                      required
                    />
                  </FormGroup>
                  
                  <FormGroup>
                    <Label>Stripe Remediation Link (Required)</Label>
                    <TextArea
                      value={stripeRemediationLink}
                      onChange={(e) => setStripeRemediationLink(e.target.value)}
                      placeholder="Paste the remediation link from Stripe dashboard..."
                      required
                    />
                    <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>
                      This link will be provided to the user to complete their Stripe verification.
                    </small>
                  </FormGroup>
                </div>
              )}
              
              {modalType === 'decline' && (
                <div>
                  <p>Please provide a reason for declining this application:</p>
                  <FormGroup>
                    <Label>Admin Note (Required)</Label>
                    <TextArea
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Provide a reason for declining the application..."
                      required
                    />
                  </FormGroup>
                </div>
              )}
            </ModalBody>
            
            <ModalActions>
              {modalType === 'approve' && (
                <Button
                  className="primary"
                  onClick={() => handleApprove(selectedApplication._id)}
                  disabled={processing || !adminNote.trim() || !stripeRemediationLink.trim()}
                >
                  {processing ? <FaSpinner className="fa-spin" /> : <FaCheck />}
                  {processing ? 'Approving...' : 'Approve'}
                </Button>
              )}
              
              {modalType === 'decline' && (
                <Button
                  className="primary"
                  onClick={() => handleDecline(selectedApplication._id)}
                  disabled={processing || !adminNote.trim()}
                >
                  {processing ? <FaSpinner className="fa-spin" /> : <FaTimes />}
                  {processing ? 'Declining...' : 'Decline'}
                </Button>
              )}
              
              <Button className="secondary" onClick={closeModal}>
                Cancel
              </Button>
            </ModalActions>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default AdminHostApplicationsPanel; 