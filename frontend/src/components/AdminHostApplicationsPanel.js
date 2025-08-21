import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner, Alert } from 'react-bootstrap';
import { hostApplicationsAPI } from '../services/api';
import './AdminHostApplicationsPanel.css';
import { 
  Eye, 
  Check, 
  X, 
  Clock, 
  CheckCircle, 
  XCircle,
  User,
  Mail,
  Calendar,
  FileText,
  RefreshCw,
  Filter,
  Search,
  CreditCard,
  Home,
  MapPin,
  Phone,
  Image,
  AlertCircle,
  DollarSign,
  Shield
} from 'lucide-react';

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



  // Loading State
  if (loading) {
    return (
      <div className="admin-applications-container">
      <Container>
          <div className="admin-loading-container">
            <div className="admin-loading-spinner">
              <RefreshCw size={48} />
            </div>
            <div className="admin-loading-text">
              Loading applications...
            </div>
          </div>
      </Container>
      </div>
    );
  }

  // Empty State
  if (filteredApplications.length === 0 && !loading) {
  return (
      <div className="admin-applications-container">
    <Container>

          {/* Error Display */}
        {error && (
            <div className="admin-error-container">
              <AlertCircle size={20} />
            {error}
            </div>
          )}

          {/* Empty State */}
          <Card className="admin-empty-state">
            <div className="admin-empty-icon">
              <FileText size={48} />
            </div>
            <h3 className="admin-empty-title">
              No Applications Found
            </h3>
            <p className="admin-empty-message">
            {statusFilter || searchTerm 
              ? 'No applications match your current filters. Try adjusting your search criteria.'
              : 'There are no host applications to review at this time.'
            }
            </p>
          </Card>
      </Container>
      </div>
    );
  }

  return (
    <div className="admin-applications-container">
    <Container>


        {/* Error Display */}
      {error && (
          <Alert variant="danger" style={{ marginBottom: '32px' }}>
            <AlertCircle size={20} style={{ marginRight: '8px' }} />
          {error}
        </Alert>
      )}

        {/* Controls Section */}
        <Card className="admin-controls-container">
          <Card.Body>
            <h3 className="admin-controls-title">
              <Filter size={20} /> Search & Filters
            </h3>
            <div className="admin-controls-row">
              <select 
                className="admin-filter-select"
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="declined">Declined</option>
              </select>
          
              <input
                className="admin-search-input"
          type="text"
          placeholder="Search by name or email..."
          value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
            </div>
          </Card.Body>
        </Card>

        {/* Applications Table */}
        <Card className="admin-table-container">
          <div className="admin-table-header">
            <h3 className="admin-table-title">
              <FileText size={20} /> Applications Overview
            </h3>
          </div>
          
          {/* Table Header Row */}
          <div className="admin-table-header-row">
            <div className="admin-table-cell">Applicant</div>
            <div className="admin-table-cell">Contact</div>
            <div className="admin-table-cell">Property</div>
            <div className="admin-table-cell">Business Info</div>
            <div className="admin-table-cell">Payment Method</div>
            <div className="admin-table-cell">Documents</div>
            <div className="admin-table-cell">Status</div>
            <div className="admin-table-cell">Actions</div>
          </div>
          
          {/* Table Data Rows */}
        {filteredApplications.map((application) => (
            <div key={application._id} className="admin-table-row">
              {/* Applicant Column */}
              <div className="admin-table-cell">
                <User size={18} />
                <strong>{application.firstName} {application.lastName}</strong>
              </div>
              
              {/* Contact Column */}
              <div className="admin-table-cell">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={16} />
                    {application.email}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Phone size={16} />
                    {application.phoneNumber || 'N/A'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Calendar size={16} />
                    {new Date(application.dateOfBirth).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {/* Property Column */}
              <div className="admin-table-cell">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Home size={16} />
                    {application.propertyType || 'N/A'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={16} />
                    {application.postalAddress?.city && application.postalAddress?.state 
                      ? `${application.postalAddress.city}, ${application.postalAddress.state}`
                      : 'N/A'
                    }
                  </div>
                </div>
              </div>
            
              {/* Business Info Column */}
              <div className="admin-table-cell">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div><strong>Account Type:</strong> Individual</div>
                <div><strong>Structure:</strong> Individual</div>
                </div>
              </div>
            
              {/* Payment Method Column */}
              <div className="admin-table-cell">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {application.stripeConnect?.accountId ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <DollarSign size={16} />
                      Stripe Account: {application.stripeConnect.accountId.substring(0, 8)}...
                    </div>
                ) : application.paymentMethods?.stripeAccountId ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <DollarSign size={16} />
                      Stripe: {application.paymentMethods.stripeAccountId.substring(0, 8)}...
                    </div>
                ) : application.paymentMethods?.creditCard?.last4 ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CreditCard size={16} />
                      Card: ****{application.paymentMethods.creditCard.last4}
                    </div>
                ) : (
                  <div>No payment method</div>
                )}
                </div>
              </div>
              
              {/* Documents Column */}
              <div className="admin-table-cell">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={16} />
                    Front: {application.identityDocuments?.idFrontImage ? '✓' : '✗'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Shield size={16} />
                    Back: {application.identityDocuments?.idBackImage ? '✓' : '✗'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Image size={16} />
                    Selfie: {application.identityDocuments?.selfieImage ? '✓' : '✗'}
                  </div>
                </div>
              </div>
              
              {/* Status Column */}
              <div className="admin-table-cell">
                <span className={`admin-status-badge ${application.status}`}>
                  {application.status === 'pending' && <Clock size={14} />}
                  {application.status === 'approved' && <CheckCircle size={14} />}
                  {application.status === 'declined' && <XCircle size={14} />}
                {application.status}
                </span>
              </div>
            
              {/* Actions Column */}
              <div className="admin-table-cell">
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    className="admin-action-button view"
                  onClick={() => openModal('view', application)}
                >
                    <Eye size={16} /> View
                  </button>
                
                {application.status === 'pending' && (
                  <>
                      <button
                        className="admin-action-button approve"
                      onClick={() => openModal('approve', application)}
                    >
                        <Check size={16} /> Approve
                      </button>
                    
                      <button
                        className="admin-action-button decline"
                      onClick={() => openModal('decline', application)}
                    >
                        <X size={16} /> Decline
                      </button>
                  </>
                )}
                </div>
              </div>
            </div>
        ))}
        </Card>

        {/* Application Details Modal */}
      {showModal && (
          <div className="admin-modal">
            <div className="admin-modal-content">
              <div className="admin-modal-header">
                <h3 className="admin-modal-title">
                {modalType === 'approve' && 'Approve Application'}
                {modalType === 'decline' && 'Decline Application'}
                {modalType === 'view' && 'Application Details'}
                </h3>
                <button className="admin-modal-close" onClick={closeModal}>
                  <X size={24} />
                </button>
              </div>
              
              <div className="admin-modal-body">
                {/* View Application Details */}
              {modalType === 'view' && selectedApplication && (
                <div>
                  <h4>Personal Information</h4>
                  <p><strong>Name:</strong> {selectedApplication.firstName} {selectedApplication.lastName}</p>
                  <p><strong>Email:</strong> {selectedApplication.email}</p>
                    <p><strong>Phone:</strong> {selectedApplication.phoneNumber || 'N/A'}</p>
                  <p><strong>Date of Birth:</strong> {new Date(selectedApplication.dateOfBirth).toLocaleDateString()}</p>
                  
                  <h4>Address</h4>
                    <p>
                      {selectedApplication.postalAddress?.street && 
                       selectedApplication.postalAddress?.city && 
                       selectedApplication.postalAddress?.state && 
                       selectedApplication.postalAddress?.postalCode && 
                       selectedApplication.postalAddress?.country
                        ? `${selectedApplication.postalAddress.street}, ${selectedApplication.postalAddress.city}, ${selectedApplication.postalAddress.state} ${selectedApplication.postalAddress.postalCode}, ${selectedApplication.postalAddress.country}`
                        : 'Address not provided'
                      }
                    </p>
                  
                  <h4>Business Information</h4>
                  <p><strong>Account Type:</strong> Individual</p>
                  <p><strong>Structure:</strong> Individual</p>
                  
                  <h4>Financial Information</h4>
                  <p><strong>SSN Last 4:</strong> {selectedApplication.ssnLast4 ? '****' : 'Not provided'}</p>
                  <p><strong>Support Phone:</strong> {selectedApplication.supportPhone || 'Not provided'}</p>
                  <p><strong>Bank Account Type:</strong> {selectedApplication.bankAccount?.accountType || 'Not selected'}</p>
                  <p><strong>Bank Routing Number:</strong> {selectedApplication.bankAccount?.routingNumber ? '****' : 'Not provided'}</p>
                  <p><strong>Bank Account Number:</strong> {selectedApplication.bankAccount?.accountNumber ? '****' : 'Not provided'}</p>
                  
                  <h4>Property Information</h4>
                    <p><strong>Type:</strong> {selectedApplication.propertyType || 'N/A'}</p>
                    <p><strong>Description:</strong> {selectedApplication.propertyDescription || 'N/A'}</p>
                    <p><strong>Experience:</strong> {selectedApplication.hostingExperience || 'N/A'}</p>
                  
                  <h4>Payment Methods</h4>
                  <p><strong>Stripe Account:</strong> {selectedApplication.stripeConnect?.accountId || selectedApplication.paymentMethods?.stripeAccountId || 'Not provided'}</p>
                  <p><strong>Credit Card:</strong> {selectedApplication.paymentMethods?.creditCard?.last4 ? `****${selectedApplication.paymentMethods.creditCard.last4}` : 'Not provided'}</p>
                  
                  {selectedApplication.stripeConnect && (
                    <>
                      <h4>Stripe Connect Status</h4>
                        <p><strong>Account Status:</strong> {selectedApplication.stripeConnect.accountStatus || 'N/A'}</p>
                      <p><strong>Onboarding Completed:</strong> {selectedApplication.stripeConnect.onboardingCompleted ? 'Yes' : 'No'}</p>
                    </>
                  )}
                </div>
              )}
              
                {/* Approve Application Form */}
              {modalType === 'approve' && (
                <div>
                  <p>Are you sure you want to approve this application?</p>
                  <p><strong>Applicant:</strong> {selectedApplication?.firstName} {selectedApplication?.lastName}</p>
                  <p>This will grant the user host privileges and allow them to create listings.</p>
                  <p><strong>Note:</strong> You must provide a Stripe remediation link for the user to complete their account setup.</p>
                  
                    <div className="admin-form-group">
                      <label className="admin-label">Admin Note (Optional)</label>
                      <textarea
                        className="admin-textarea"
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Add any notes about this application..."
                    />
                    <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>
                      Note: Stripe Connect account is created when the user submits their application. You can find the account in your Stripe dashboard.
                    </small>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">Stripe Remediation Link (Required)</label>
                      <textarea
                        className="admin-textarea"
                      value={stripeRemediationLink}
                      onChange={(e) => setStripeRemediationLink(e.target.value)}
                      placeholder="Paste the remediation link from Stripe dashboard..."
                      required
                    />
                    <small style={{ color: '#6c757d', fontSize: '0.85rem' }}>
                      <strong>Instructions:</strong> 
                      <br />1. Go to the Stripe Dashboard for this host's account (created when they submitted their application)
                      <br />2. Copy the remediation/onboarding link from the account setup section
                      <br />3. Paste the link here - this will be provided to the user to complete their verification
                      <br /><br />
                      <strong>Note:</strong> The user will need this link to complete their Stripe Connect account setup and start receiving payments.
                    </small>
                    </div>
                </div>
              )}

                {/* Decline Application Form */}
              {modalType === 'decline' && (
                <div>
                  <p>Please provide a reason for declining this application:</p>
                    <div className="admin-form-group">
                      <label className="admin-label">Admin Note (Required)</label>
                      <textarea
                        className="admin-textarea"
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder="Provide a reason for declining the application..."
                      required
                    />
                    </div>
                </div>
              )}
              </div>

              {/* Modal Actions */}
              <div className="admin-modal-actions">
              {modalType === 'approve' && (
                <Button
                    variant="danger"
                  onClick={() => handleApprove(selectedApplication._id)}
                  disabled={processing || !adminNote.trim() || !stripeRemediationLink.trim()}
                    style={{ backgroundColor: '#FF385C', borderColor: '#FF385C' }}
                >
                    {processing ? <RefreshCw size={16} className="fa-spin" /> : <Check size={16} />}
                  {processing ? 'Approving...' : 'Approve'}
                </Button>
              )}
              
              {modalType === 'decline' && (
                <Button
                    variant="danger"
                  onClick={() => handleDecline(selectedApplication._id)}
                  disabled={processing || !adminNote.trim()}
                    style={{ backgroundColor: '#FF385C', borderColor: '#FF385C' }}
                >
                    {processing ? <RefreshCw size={16} className="fa-spin" /> : <X size={16} />}
                  {processing ? 'Declining...' : 'Decline'}
                </Button>
              )}
              
                <Button variant="secondary" onClick={closeModal}>
                Cancel
              </Button>
              </div>
            </div>
          </div>
      )}
    </Container>
    </div>
  );
};

export default AdminHostApplicationsPanel;