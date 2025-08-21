import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User,
  Edit3,
  Home,
  Calendar,
  Star,
  DollarSign,
  Shield,
  Settings,
  Heart,
  Eye,
  BarChart3,
  Upload,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  MapPin,
  Phone,
  Mail,
  Building2,
  CreditCard,
  RefreshCw,
  Info,
  Plus
} from 'lucide-react';
import { usersAPI } from '../../services/api';
import './Profile.css';

const Profile = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (user && !authLoading) {
      fetchProfileData();
    }
  }, [user, authLoading, retryCount]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Fetching profile data for user:', user._id);
      
      // Fetch profile data first, then stats separately to handle errors gracefully
      try {
        const profileResponse = await usersAPI.getMyProfile();
        console.log('✅ Profile response:', profileResponse);
        setProfileData(profileResponse.data);
      } catch (profileErr) {
        console.error('❌ Error fetching profile:', profileErr);
        // Don't fail completely if profile fails
      }
      
      try {
        const statsResponse = await usersAPI.getUserStats();
      console.log('✅ Stats response:', statsResponse);
      setStats(statsResponse.data);
      } catch (statsErr) {
        console.error('❌ Error fetching stats:', statsErr);
        // Set empty stats if stats fail
        setStats({});
      }
      
      setLoading(false);
    } catch (err) {
      console.error('❌ Error in fetchProfileData:', err);
      console.error('❌ Error details:', err.response?.data || err.message);
      setError(`Failed to load profile data: ${err.response?.data?.message || err.message}`);
      setLoading(false);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('📸 Uploading profile image:', file.name);
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      const formData = new FormData();
      formData.append('image', file);
      
      usersAPI.uploadProfileImage(user._id || user.id, formData)
        .then(response => {
          console.log('✅ Image upload successful:', response);
          // Update the user context with new profile image
          window.location.reload(); // Simple refresh for now
        })
        .catch(err => {
          console.error('❌ Error uploading image:', err);
          console.error('❌ Upload error details:', err.response?.data || err.message);
          setError(`Failed to upload image: ${err.response?.data?.message || err.message}`);
        });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner">
          <BarChart3 size={48} />
        </div>
        <p>Loading profile...</p>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="profile-error">
        <Alert variant="danger">
          <Alert.Heading>User Not Found</Alert.Heading>
          <p>Unable to load user profile information.</p>
        </Alert>
      </div>
    );
  }
  
  // Show error with retry option
  if (error) {
    return (
      <div className="profile-container">
        <Container>
          <Alert variant="danger" className="error-alert">
            <Alert.Heading>Error Loading Profile</Alert.Heading>
            <p>{error}</p>
            <hr />
            <Button 
              variant="outline-danger"
            onClick={() => {
              setError(null);
              setRetryCount(prev => prev + 1);
              fetchProfileData();
            }}
              className="retry-button"
          >
              <RefreshCw size={16} />
            Retry ({retryCount + 1})
            </Button>
          </Alert>
        </Container>
      </div>
    );
  }

  const isHost = user.role === 'host';
  const isAdmin = user.role === 'admin';
  const isGuest = user.role === 'guest';

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <Container>
          <div className="header-content">
            <div className="profile-image-section">
              <div className="profile-image-container">
                <img 
                  className="profile-image"
                  src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&size=140&background=FF385C&color=fff`} 
              alt="Profile" 
            />
                <button 
                  className="image-upload-button"
                  onClick={() => document.getElementById('imageUpload').click()}
                >
                  <Upload size={20} />
                </button>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
              </div>
              
              <div className="profile-info">
                <h1 className="profile-name">{user.firstName} {user.lastName}</h1>
                <p className="profile-email">{user.email}</p>
                <div className="profile-role">
                  {isHost && <Home size={20} />}
                  {isAdmin && <Shield size={20} />}
                  {isGuest && <User size={20} />}
                  <span>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Profile Content */}
      <Container className="profile-content">
        <Row>
        {/* Left Column */}
          <Col lg={6} className="mb-4">
          {/* Basic Information */}
            <Card className="profile-card">
              <Card.Header className="card-header">
                <h2 className="section-title">
                  <User size={24} />
              Basic Information
                </h2>
              </Card.Header>
              <Card.Body>
                <div className="info-grid">
                  <div className="info-item">
                    <div className="info-label">
                      <User size={18} />
                  Full Name
                    </div>
                    <div className="info-value">{user.firstName} {user.lastName}</div>
                  </div>
                                    <div className="info-item">
                    <div className="info-label">
                      <Mail size={18} />
                  Email
                    </div>
                    <div className="info-value">{user.email}</div>
                  </div>
                  
                  <div className="info-item">
                    <div className="info-label">
                      <Phone size={18} />
                      Phone Number
                    </div>
                    <div className="info-value">{user.phoneNumber || 'N/A'}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">
                      <CheckCircle size={18} />
                  Verification Status
                    </div>
                    <div className="info-value">
                  {user.isVerified ? (
                        <Badge bg="success" className="status-badge">
                          <CheckCircle size={16} />
                          Verified
                        </Badge>
                      ) : (
                        <Badge bg="warning" text="dark" className="status-badge">
                          <AlertTriangle size={16} />
                          Not Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="info-item">
                    <div className="info-label">
                      <Clock size={18} />
                  Member Since
                    </div>
                    <div className="info-value">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                    </div>
                  </div>
                </div>
                
                <div className="action-buttons">
                  <Button 
                    variant="primary"
                onClick={() => navigate('/edit-profile')}
                    className="action-button primary"
              >
                    <Edit3 size={18} />
                Edit Profile
                  </Button>
                </div>
              </Card.Body>
            </Card>

          {/* Statistics */}
            <Card className="profile-card">
              <Card.Header className="card-header">
                <h2 className="section-title">
                  <BarChart3 size={24} />
              Statistics
                </h2>
              </Card.Header>
              <Card.Body>
            {!stats || Object.keys(stats).length === 0 ? (
                  <div className="empty-stats">
                    <BarChart3 size={24} />
                    <p>No statistics available</p>
                    <small>Statistics will appear here once you have activity</small>
              </div>
            ) : (
                  <div className="stats-grid">
              {isHost && (
                <>
                        <div className="stat-card">
                          <div className="stat-value">{stats?.totalListings || 0}</div>
                          <div className="stat-label">Listings</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-value">{stats?.totalBookings || 0}</div>
                          <div className="stat-label">Bookings</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-value">${(stats?.totalRevenue || 0).toLocaleString()}</div>
                          <div className="stat-label">Total Revenue</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-value">{stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}</div>
                          <div className="stat-label">Avg Rating</div>
                        </div>
                </>
              )}
              
              {isGuest && (
                <>
                        <div className="stat-card">
                          <div className="stat-value">{stats?.totalBookings || 0}</div>
                          <div className="stat-label">Bookings</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-value">{stats?.totalReviews || 0}</div>
                          <div className="stat-label">Reviews</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-value">${(stats?.totalSpent || 0).toLocaleString()}</div>
                          <div className="stat-label">Total Spent</div>
                        </div>
                </>
              )}
              
              {isAdmin && (
                <>
                        <div className="stat-card">
                          <div className="stat-value">Admin</div>
                          <div className="stat-label">Role</div>
                        </div>
                        <div className="stat-card">
                          <div className="stat-value">{user.permissions?.length || 0}</div>
                          <div className="stat-label">Permissions</div>
                        </div>
                </>
              )}
                  </div>
            )}
              </Card.Body>
            </Card>
          </Col>

        {/* Right Column */}
          <Col lg={6} className="mb-4">
            {/* Quick Actions */}
            <Card className="profile-card">
              <Card.Header className="card-header">
                <h2 className="section-title">
                  <Settings size={24} />
                  Quick Actions
                </h2>
              </Card.Header>
              <Card.Body>
                <div className="action-buttons">
                  <Button 
                    variant="primary"
                    onClick={() => navigate('/liked-listings')}
                    className="action-button primary"
                  >
                    <Heart size={18} />
                    Liked Listings
                  </Button>
                  
                  <Button 
                    variant="outline-secondary"
                    onClick={() => navigate('/bookings')}
                    className="action-button secondary"
                  >
                    <Calendar size={18} />
                    My Bookings
                  </Button>
                  
                  {isHost && (
                    <Button 
                      variant="success"
                      onClick={() => navigate('/listings')}
                      className="action-button success"
                    >
                      <Home size={18} />
                      My Listings
                    </Button>
                  )}
                  
                  {isAdmin && (
                    <Button 
                      variant="warning"
                      onClick={() => navigate('/admin/host-applications')}
                      className="action-button warning"
                    >
                      <Shield size={18} />
                      Admin Panel
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
            
            {/* Host Application Status - For all users */}
            {!isHost && (
              <Card className="profile-card">
                <Card.Header className="card-header">
                  <h2 className="section-title">
                    <Shield size={24} />
                    Become a Host
                  </h2>
                </Card.Header>
                <Card.Body>
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-label">
                        <User size={18} />
                        Current Role
                      </div>
                      <div className="info-value">
                        <Badge bg="secondary" className="status-badge">
                          <User size={16} />
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-label">
                        <Info size={18} />
                        Host Status
                      </div>
                      <div className="info-value">
                        <Badge bg="info" className="status-badge">
                          <Info size={16} />
                          Not Applied
                        </Badge>
                      </div>
                    </div>
        </div>

                  <div className="action-buttons">
                    <Button 
                      variant="primary"
                      onClick={() => navigate('/become-a-host-info')}
                      className="action-button primary"
                    >
                      <Plus size={18} />
                      Apply to Become a Host
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            )}
            
            {/* Host Application Status - Only for hosts */}
          {isHost && (
              <Card className="profile-card">
                <Card.Header className="card-header">
                  <h2 className="section-title">
                    <Shield size={24} />
                    Host Application Status
                  </h2>
                </Card.Header>
                <Card.Body>
                  {profileData?.hostProfile ? (
                    <div className="info-grid">
                      <div className="info-item">
                        <div className="info-label">
                          <CheckCircle size={18} />
                          Application Status
                        </div>
                        <div className="info-value">
                          <Badge bg="success" className="status-badge">
                            <CheckCircle size={16} />
                            Approved
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">
                          <Calendar size={18} />
                          Approved Date
                        </div>
                        <div className="info-value">
                          {profileData.hostProfile.applicationApprovedAt ? 
                            new Date(profileData.hostProfile.applicationApprovedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) :
                      'N/A'
                    }
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">
                          <Shield size={18} />
                          Stripe Onboarding
                        </div>
                        <div className="info-value">
                          <Badge 
                            bg={profileData.hostProfile.stripeConnectStatus === 'active' ? 'success' : 
                                profileData.hostProfile.stripeConnectStatus === 'pending' ? 'warning' : 'danger'}
                            className="status-badge"
                          >
                            {profileData.hostProfile.stripeConnectStatus === 'active' && <CheckCircle size={16} />}
                            {profileData.hostProfile.stripeConnectStatus === 'pending' && <AlertTriangle size={16} />}
                            {profileData.hostProfile.stripeConnectStatus === 'restricted' && <XCircle size={16} />}
                            {profileData.hostProfile.stripeConnectStatus === 'disabled' && <XCircle size={16} />}
                            {profileData.hostProfile.stripeConnectStatus ? 
                              profileData.hostProfile.stripeConnectStatus.charAt(0).toUpperCase() + profileData.hostProfile.stripeConnectStatus.slice(1) :
                              'Pending'
                            }
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-host-profile">
                      <Shield size={24} />
                      <p>Loading application status...</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}
            
            {/* Host Profile Section - Only for hosts */}
            {isHost && (
              <Card className="profile-card">
                <Card.Header className="card-header">
                  <h2 className="section-title">
                    <Home size={24} />
                    Host Profile
                  </h2>
                </Card.Header>
                <Card.Body>
                  {profileData?.hostProfile ? (
                    <div className="info-grid">
                      {/* Business Information */}
                      <div className="info-item">
                        <div className="info-label">
                          <Building2 size={18} />
                          Business Structure
                        </div>
                        <div className="info-value">
                          {profileData.hostProfile.businessStructure ? 
                            profileData.hostProfile.businessStructure.charAt(0).toUpperCase() + profileData.hostProfile.businessStructure.slice(1) :
                            'Individual'
                          }
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">
                          <Phone size={18} />
                          Phone Number
                        </div>
                        <div className="info-value">
                          {profileData.hostProfile.phoneNumber || 'N/A'}
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">
                          <Home size={18} />
                    Property Type
                        </div>
                        <div className="info-value">
                    {profileData.hostProfile.propertyType ? 
                      profileData.hostProfile.propertyType.charAt(0).toUpperCase() + profileData.hostProfile.propertyType.slice(1) :
                      'N/A'
                    }
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">
                          <Eye size={18} />
                          Property Description
                        </div>
                        <div className="info-value">
                          {profileData.hostProfile.propertyDescription || 'N/A'}
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">
                          <Star size={18} />
                          Hosting Experience
                        </div>
                        <div className="info-value">
                          {profileData.hostProfile.hostingExperience || 'N/A'}
                        </div>
                      </div>
                      
                      {/* Financial Information */}
                      <div className="info-item">
                        <div className="info-label">
                          <CreditCard size={18} />
                          Stripe Account ID
                        </div>
                        <div className="info-value">
                          {profileData.hostProfile.stripeConnectAccountId ? 
                            `${profileData.hostProfile.stripeConnectAccountId.substring(0, 8)}...` :
                            'N/A'
                          }
                        </div>
                      </div>
                      
                      <div className="info-item">
                        <div className="info-label">
                          <Shield size={18} />
                    Stripe Status
                        </div>
                        <div className="info-value">
                          <Badge 
                            bg={profileData.hostProfile.stripeConnectStatus === 'active' ? 'success' : 
                                profileData.hostProfile.stripeConnectStatus === 'pending' ? 'warning' : 'danger'}
                            className="status-badge"
                          >
                            {profileData.hostProfile.stripeConnectStatus === 'active' && <CheckCircle size={16} />}
                            {profileData.hostProfile.stripeConnectStatus === 'pending' && <AlertTriangle size={16} />}
                            {profileData.hostProfile.stripeConnectStatus === 'restricted' && <XCircle size={16} />}
                            {profileData.hostProfile.stripeConnectStatus === 'disabled' && <XCircle size={16} />}
                      {profileData.hostProfile.stripeConnectStatus ? 
                        profileData.hostProfile.stripeConnectStatus.charAt(0).toUpperCase() + profileData.hostProfile.stripeConnectStatus.slice(1) :
                        'Pending'
                      }
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Application Approval Information */}
                      <div className="info-item">
                        <div className="info-label">
                          <CheckCircle size={18} />
                          Application Approved
                        </div>
                        <div className="info-value">
                          {profileData.hostProfile.applicationApprovedAt ? 
                            new Date(profileData.hostProfile.applicationApprovedAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) :
                            'N/A'
                          }
                        </div>
                </div>
                      
                      {/* Bank Account Information (if available) */}
                      {profileData.hostProfile.bankAccount && (
                        <>
                          <div className="info-item">
                            <div className="info-label">
                              <CreditCard size={18} />
                              Bank Account Type
                            </div>
                            <div className="info-value">
                              {profileData.hostProfile.bankAccount.accountType ? 
                                profileData.hostProfile.bankAccount.accountType.charAt(0).toUpperCase() + profileData.hostProfile.bankAccount.accountType.slice(1) :
                                'N/A'
                              }
                            </div>
                          </div>
                          
                          <div className="info-item">
                            <div className="info-label">
                              <CreditCard size={18} />
                              Account Number
                            </div>
                            <div className="info-value">
                              {profileData.hostProfile.bankAccount.accountNumber ? 
                                `****${profileData.hostProfile.bankAccount.accountNumber.slice(-4)}` :
                                'N/A'
                              }
                            </div>
                          </div>
                          
                          <div className="info-item">
                            <div className="info-label">
                              <CreditCard size={18} />
                              Routing Number
                            </div>
                            <div className="info-value">
                              {profileData.hostProfile.bankAccount.routingNumber ? 
                                `****${profileData.hostProfile.bankAccount.routingNumber.slice(-4)}` :
                                'N/A'
                              }
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <div className="empty-host-profile">
                      <Home size={24} />
                      <p>Loading host profile...</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
        </div>
  );
};

export default Profile; 