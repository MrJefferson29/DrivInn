import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  FaHeart, 
  FaEdit, 
  FaUser, 
  FaHome, 
  FaCar, 
  FaCalendarAlt, 
  FaStar, 
  FaDollarSign, 
  FaCreditCard, 
  FaBuilding, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaExclamationTriangle,
  FaCog,
  FaBell,
  FaShieldAlt,
  FaChartBar,
  FaHistory,
  FaUpload,
  FaTrash,
  FaEye,
  FaRedo
} from 'react-icons/fa';
import { usersAPI } from '../../services/api';

const ProfileContainer = styled.div`
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
`;

const ProfileHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 40px;
  color: white;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.1);
    z-index: 1;
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const ProfileImageContainer = styled.div`
  position: relative;
`;

const ProfileImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.3);
  background: #f7f7f7;
`;

const ImageUploadButton = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  background: #FF385C;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  
  &:hover {
    background: #e31c5f;
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const Name = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 8px 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const Email = styled.div`
  font-size: 1.2rem;
  opacity: 0.9;
  margin-bottom: 12px;
`;

const Role = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 1rem;
`;

const ProfileContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  @media (max-width: 768px) {
    gap: 20px;
  }
`;

const ProfileSection = styled.div`
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #eee;
  
  @media (max-width: 768px) {
    padding: 24px;
  }
  
  @media (max-width: 480px) {
    padding: 20px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #222;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 16px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const StatCard = styled.div`
  background: #f8f9fa;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  border: 1px solid #e9ecef;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 800;
  color: #FF385C;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
`;

const InfoGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const InfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const InfoLabel = styled.span`
  color: #6c757d;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InfoValue = styled.span`
  color: #222;
  font-weight: 600;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;
`;

const ActionButton = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  
  &.primary {
    background: #FF385C;
    color: white;
    
    &:hover {
      background: #e31c5f;
      transform: translateY(-2px);
    }
  }
  
  &.secondary {
    background: #f8f9fa;
    color: #222;
    border: 1px solid #dee2e6;
    
    &:hover {
      background: #e9ecef;
      transform: translateY(-2px);
    }
  }
  
  &.success {
    background: #28a745;
    color: white;
    
    &:hover {
      background: #218838;
      transform: translateY(-2px);
    }
  }
  
  &.warning {
    background: #ffc107;
    color: #212529;
    
    &:hover {
      background: #e0a800;
      transform: translateY(-2px);
    }
  }
`;

const StatusBadge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  
  &.active {
    background: #d4edda;
    color: #155724;
  }
  
  &.pending {
    background: #fff3cd;
    color: #856404;
  }
  
  &.restricted {
    background: #f8d7da;
    color: #721c24;
  }
  
  &.disabled {
    background: #e2e3e5;
    color: #383d41;
  }
`;

const Loading = styled.div`
  text-align: center;
  margin: 60px 0;
  color: #FF385C;
  font-size: 1.2rem;
`;

const ErrorMsg = styled.div`
  color: #c00;
  background: #fff0f0;
  border-radius: 8px;
  padding: 16px;
  margin: 24px 0;
  text-align: center;
`;

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
      
      // Fetch detailed profile data and statistics
      const [profileResponse, statsResponse] = await Promise.all([
        usersAPI.getMyProfile(),
        usersAPI.getUserStats()
      ]);
      
      console.log('✅ Profile response:', profileResponse);
      console.log('✅ Stats response:', statsResponse);
      
      setProfileData(profileResponse.data);
      setStats(statsResponse.data);
      
      setLoading(false);
    } catch (err) {
      console.error('❌ Error fetching profile data:', err);
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

  if (authLoading || loading) return <Loading>Loading profile...</Loading>;
  if (!user) return <ErrorMsg>User not found.</ErrorMsg>;
  
  // Show error with retry option
  if (error) {
    return (
      <ProfileContainer>
        <ErrorMsg>
          <div style={{ marginBottom: '16px' }}>{error}</div>
          <ActionButton 
            className="primary"
            onClick={() => {
              setError(null);
              setRetryCount(prev => prev + 1);
              fetchProfileData();
            }}
          >
            <FaRedo />
            Retry ({retryCount + 1})
          </ActionButton>
        </ErrorMsg>
      </ProfileContainer>
    );
  }

  const isHost = user.role === 'host';
  const isAdmin = user.role === 'admin';
  const isGuest = user.role === 'guest';

  // Debug information
  console.log('🔍 Profile component render:', {
    user: user ? { id: user._id, role: user.role, email: user.email } : null,
    profileData: profileData ? 'loaded' : 'not loaded',
    stats: stats ? Object.keys(stats) : 'not loaded',
    loading,
    error
  });

  return (
    <ProfileContainer>
      {/* Profile Header */}
      <ProfileHeader>
        <HeaderContent>
          <ProfileImageContainer>
            <ProfileImage 
              src={user.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&size=120&background=FF385C&color=fff`} 
              alt="Profile" 
            />
            <ImageUploadButton onClick={() => document.getElementById('imageUpload').click()}>
              <FaUpload size={16} />
            </ImageUploadButton>
            <input
              id="imageUpload"
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </ProfileImageContainer>
          
          <ProfileInfo>
            <Name>{user.firstName} {user.lastName}</Name>
            <Email>{user.email}</Email>
            <Role>
              {isHost && <FaHome />}
              {isAdmin && <FaShieldAlt />}
              {isGuest && <FaUser />}
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Role>
          </ProfileInfo>
        </HeaderContent>
      </ProfileHeader>

      {/* Profile Content */}
      <ProfileContent>
        {/* Left Column */}
        <div>
          {/* Basic Information */}
          <ProfileSection>
            <SectionTitle>
              <FaUser />
              Basic Information
            </SectionTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>
                  <FaUser />
                  Full Name
                </InfoLabel>
                <InfoValue>{user.firstName} {user.lastName}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>
                  <FaUser />
                  Email
                </InfoLabel>
                <InfoValue>{user.email}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>
                  <FaCheckCircle />
                  Verification Status
                </InfoLabel>
                <InfoValue>
                  {user.isVerified ? (
                    <span style={{ color: '#28a745' }}>✓ Verified</span>
                  ) : (
                    <span style={{ color: '#ffc107' }}>⚠ Not Verified</span>
                  )}
                </InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>
                  <FaCalendarAlt />
                  Member Since
                </InfoLabel>
                <InfoValue>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'N/A'}
                </InfoValue>
              </InfoItem>
            </InfoGrid>
            
            <ActionButtons>
              <ActionButton 
                className="primary"
                onClick={() => navigate('/edit-profile')}
              >
                <FaEdit />
                Edit Profile
              </ActionButton>
            </ActionButtons>
          </ProfileSection>

          {/* Statistics */}
          <ProfileSection>
            <SectionTitle>
              <FaChartBar />
              Statistics
            </SectionTitle>
            {!stats || Object.keys(stats).length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                <FaChartBar size={24} style={{ marginBottom: '8px' }} />
                <div>Loading statistics...</div>
              </div>
            ) : (
            <StatsGrid>
              {isHost && (
                <>
                  <StatCard>
                    <StatValue>{stats?.totalListings || 0}</StatValue>
                    <StatLabel>Listings</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatValue>{stats?.totalBookings || 0}</StatValue>
                    <StatLabel>Bookings</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatValue>${(stats?.totalRevenue || 0).toLocaleString()}</StatValue>
                    <StatLabel>Total Revenue</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatValue>{stats?.averageRating ? stats.averageRating.toFixed(1) : '0.0'}</StatValue>
                    <StatLabel>Avg Rating</StatLabel>
                  </StatCard>
                </>
              )}
              
              {isGuest && (
                <>
                  <StatCard>
                    <StatValue>{stats?.totalBookings || 0}</StatValue>
                    <StatLabel>Bookings</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatValue>{stats?.totalReviews || 0}</StatValue>
                    <StatLabel>Reviews</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatValue>${(stats?.totalSpent || 0).toLocaleString()}</StatValue>
                    <StatLabel>Total Spent</StatLabel>
                  </StatCard>
                </>
              )}
              
              {isAdmin && (
                <>
                  <StatCard>
                    <StatValue>Admin</StatValue>
                    <StatLabel>Role</StatLabel>
                  </StatCard>
                  <StatCard>
                    <StatValue>{user.permissions?.length || 0}</StatValue>
                    <StatLabel>Permissions</StatLabel>
                  </StatCard>
                </>
              )}
            </StatsGrid>
            )}
          </ProfileSection>
        </div>

        {/* Right Column */}
        <div>
          {/* Role-Specific Information */}
          {isHost && (
            profileData?.hostProfile ? (
            <ProfileSection>
              <SectionTitle>
                <FaHome />
                Host Profile
              </SectionTitle>
              <InfoGrid>
                <InfoItem>
                  <InfoLabel>
                    <FaBuilding />
                    Business Name
                  </InfoLabel>
                  <InfoValue>{profileData.hostProfile.businessName || 'N/A'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>
                    <FaPhone />
                    Business Phone
                  </InfoLabel>
                  <InfoValue>{profileData.hostProfile.businessPhone || 'N/A'}</InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>
                    <FaMapMarkerAlt />
                    Business Address
                  </InfoLabel>
                  <InfoValue>
                    {profileData.hostProfile.businessAddress ? 
                      `${profileData.hostProfile.businessAddress.street}, ${profileData.hostProfile.businessAddress.city}, ${profileData.hostProfile.businessAddress.state}` :
                      'N/A'
                    }
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>
                    <FaHome />
                    Property Type
                  </InfoLabel>
                  <InfoValue>
                    {profileData.hostProfile.propertyType ? 
                      profileData.hostProfile.propertyType.charAt(0).toUpperCase() + profileData.hostProfile.propertyType.slice(1) :
                      'N/A'
                    }
                  </InfoValue>
                </InfoItem>
                <InfoItem>
                  <InfoLabel>
                    <FaCreditCard />
                    Stripe Status
                  </InfoLabel>
                  <InfoValue>
                    <StatusBadge className={profileData.hostProfile.stripeConnectStatus || 'pending'}>
                      {profileData.hostProfile.stripeConnectStatus === 'active' && <FaCheckCircle />}
                      {profileData.hostProfile.stripeConnectStatus === 'pending' && <FaExclamationTriangle />}
                      {profileData.hostProfile.stripeConnectStatus === 'restricted' && <FaTimesCircle />}
                      {profileData.hostProfile.stripeConnectStatus === 'disabled' && <FaTimesCircle />}
                      {profileData.hostProfile.stripeConnectStatus ? 
                        profileData.hostProfile.stripeConnectStatus.charAt(0).toUpperCase() + profileData.hostProfile.stripeConnectStatus.slice(1) :
                        'Pending'
                      }
                    </StatusBadge>
                  </InfoValue>
                </InfoItem>
              </InfoGrid>
              
              <ActionButtons>
                <ActionButton 
                  className="secondary"
                  onClick={() => navigate('/edit-profile')}
                >
                  <FaEdit />
                  Edit Host Profile
                </ActionButton>
                <ActionButton 
                  className="success"
                  onClick={() => navigate('/my-listings')}
                >
                  <FaEye />
                  View My Listings
                </ActionButton>
              </ActionButtons>
            </ProfileSection>
            ) : (
              <ProfileSection>
                <SectionTitle>
                  <FaHome />
                  Host Profile
                </SectionTitle>
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  <FaHome size={24} style={{ marginBottom: '8px' }} />
                  <div>Loading host profile...</div>
                </div>
              </ProfileSection>
            )
          )}

          {/* Permissions */}
          {user.permissions && user.permissions.length > 0 && (
            <ProfileSection>
              <SectionTitle>
                <FaShieldAlt />
                Permissions
              </SectionTitle>
              <InfoGrid>
                {user.permissions.map((permission, index) => (
                  <InfoItem key={index}>
                    <InfoLabel>
                      <FaCheckCircle style={{ color: '#28a745' }} />
                      {permission.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </InfoLabel>
                  </InfoItem>
                ))}
              </InfoGrid>
            </ProfileSection>
          )}

          {/* Quick Actions */}
          <ProfileSection>
            <SectionTitle>
              <FaCog />
              Quick Actions
            </SectionTitle>
            <ActionButtons>
              <ActionButton 
                className="primary"
                onClick={() => navigate('/liked-listings')}
              >
                <FaHeart />
                Liked Listings
              </ActionButton>
              
              <ActionButton 
                className="secondary"
                onClick={() => navigate('/my-bookings')}
              >
                <FaCalendarAlt />
                My Bookings
              </ActionButton>
              
              {isHost && (
                <ActionButton 
                  className="success"
                  onClick={() => navigate('/my-listings')}
                >
                  <FaHome />
                  My Listings
                </ActionButton>
              )}
              
              {isAdmin && (
                <ActionButton 
                  className="warning"
                  onClick={() => navigate('/admin')}
                >
                  <FaShieldAlt />
                  Admin Panel
                </ActionButton>
              )}
            </ActionButtons>
          </ProfileSection>
        </div>
      </ProfileContent>
    </ProfileContainer>
  );
};

export default Profile; 