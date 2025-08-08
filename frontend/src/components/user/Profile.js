import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';

const ProfileContainer = styled.div`
  max-width: 600px;
  margin: 40px auto;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  padding: 36px 28px 32px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 768px) {
    max-width: 95%;
    padding: 24px 20px 20px 20px;
  }
`;

const ProfileImage = styled.img`
  width: 110px;
  height: 110px;
  border-radius: 50%;
  object-fit: cover;
  background: #f7f7f7;
  margin-bottom: 18px;
  border: 3px solid #FF385C22;
`;

const Name = styled.h2`
  font-size: 1.5rem;
  font-weight: 800;
  color: #222;
  margin-bottom: 6px;
`;

const Email = styled.div`
  font-size: 1.08rem;
  color: #555;
  margin-bottom: 8px;
`;

const Role = styled.div`
  font-size: 1rem;
  color: #FF385C;
  font-weight: 600;
  margin-bottom: 18px;
`;

const InfoList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 18px 0;
  width: 100%;
`;

const InfoItem = styled.li`
  font-size: 1.05rem;
  color: #444;
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    margin-bottom: 10px;
  }
`;

const Label = styled.span`
  color: #888;
  font-weight: 500;
  min-width: 120px;
  
  @media (max-width: 768px) {
    min-width: 100px;
    font-size: 0.9rem;
  }
`;

const Value = styled.span`
  color: #23272f;
  font-weight: 600;
  text-align: right;
  max-width: 60%;
  
  @media (max-width: 768px) {
    max-width: 55%;
    font-size: 0.9rem;
  }
`;

const Section = styled.div`
  width: 100%;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 10px;
  }
`;

const EmptyValue = styled.span`
  color: #ccc;
  font-style: italic;
`;

const Loading = styled.div`
  text-align: center;
  margin: 60px 0;
  color: #FF385C;
`;

const ErrorMsg = styled.div`
  color: #c00;
  background: #fff0f0;
  border-radius: 8px;
  padding: 16px;
  margin: 24px 0;
  text-align: center;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
  flex-wrap: wrap;
  justify-content: center;
`;

const ActionButton = styled.button`
  padding: 10px 24px;
  border-radius: 8px;
  font-weight: 700;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  
  &.primary {
    background: #FF385C;
    color: #fff;
    
    &:hover {
      background: #e31c5f;
    }
  }
  
  &.secondary {
    background: #f7f7f7;
    color: #222;
    border: 1px solid #ddd;
    
    &:hover {
      background: #e9e9e9;
    }
  }
`;

const Profile = () => {
  const { user, loading } = useAuth();
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  if (loading) return <Loading>Loading profile...</Loading>;
  if (error) return <ErrorMsg>{error}</ErrorMsg>;
  if (!user) return <ErrorMsg>User not found.</ErrorMsg>;

  return (
    <ProfileContainer>
      <ProfileImage src={user.profileImage || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.firstName + ' ' + user.lastName)} alt="Profile" />
      <Name>{user.firstName} {user.lastName}</Name>
      <Email>{user.email}</Email>
      <Role>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</Role>
      
      {/* Basic Information */}
      <Section>
        <SectionTitle>Basic Information</SectionTitle>
        <InfoList>
          <InfoItem>
            <Label>Phone Number:</Label>
            <Value>{user.phoneNumber || <EmptyValue>Not provided</EmptyValue>}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Date of Birth:</Label>
            <Value>
              {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : <EmptyValue>Not provided</EmptyValue>}
            </Value>
          </InfoItem>
          <InfoItem>
            <Label>Gender:</Label>
            <Value>
              {user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : <EmptyValue>Not provided</EmptyValue>}
            </Value>
          </InfoItem>
          <InfoItem>
            <Label>Bio:</Label>
            <Value>
              {user.bio || <EmptyValue>No bio added</EmptyValue>}
            </Value>
          </InfoItem>
        </InfoList>
      </Section>

      {/* Address Information */}
      <Section>
        <SectionTitle>Address</SectionTitle>
        <InfoList>
          <InfoItem>
            <Label>Street:</Label>
            <Value>{user.address?.street || <EmptyValue>Not provided</EmptyValue>}</Value>
          </InfoItem>
          <InfoItem>
            <Label>City:</Label>
            <Value>{user.address?.city || <EmptyValue>Not provided</EmptyValue>}</Value>
          </InfoItem>
          <InfoItem>
            <Label>State:</Label>
            <Value>{user.address?.state || <EmptyValue>Not provided</EmptyValue>}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Country:</Label>
            <Value>{user.address?.country || <EmptyValue>Not provided</EmptyValue>}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Zip Code:</Label>
            <Value>{user.address?.zipCode || <EmptyValue>Not provided</EmptyValue>}</Value>
          </InfoItem>
        </InfoList>
      </Section>



      {/* Social Links */}
      <Section>
        <SectionTitle>Social Links</SectionTitle>
        <InfoList>
          <InfoItem>
            <Label>Website:</Label>
            <Value>{user.socialLinks?.website || <EmptyValue>Not provided</EmptyValue>}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Facebook:</Label>
            <Value>{user.socialLinks?.facebook || <EmptyValue>Not provided</EmptyValue>}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Twitter:</Label>
            <Value>{user.socialLinks?.twitter || <EmptyValue>Not provided</EmptyValue>}</Value>
          </InfoItem>
          <InfoItem>
            <Label>Instagram:</Label>
            <Value>{user.socialLinks?.instagram || <EmptyValue>Not provided</EmptyValue>}</Value>
          </InfoItem>
          <InfoItem>
            <Label>LinkedIn:</Label>
            <Value>{user.socialLinks?.linkedin || <EmptyValue>Not provided</EmptyValue>}</Value>
          </InfoItem>
        </InfoList>
      </Section>

             {/* Account Information */}
       <Section>
         <SectionTitle>Account Information</SectionTitle>
         <InfoList>
           <InfoItem>
             <Label>Verified:</Label>
             <Value>
               {user.isVerified ? (
                 <span style={{ color: '#28a745', fontWeight: '600' }}>
                   Yes {user.role === 'host' && ' (via Host Application)'}
                 </span>
               ) : 'No'}
             </Value>
           </InfoItem>
           <InfoItem>
             <Label>Joined:</Label>
             <Value>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</Value>
           </InfoItem>
           <InfoItem>
             <Label>Permissions:</Label>
             <Value>{user.permissions && user.permissions.length > 0 ? user.permissions.join(', ') : 'None'}</Value>
           </InfoItem>
         </InfoList>
       </Section>
             <ActionButtons>
         {!user.isVerified && (
           <ActionButton 
             className="primary"
             onClick={() => navigate('/verify-account')}
           >
             Verify Account
           </ActionButton>
         )}
         {user.isVerified && user.role === 'host' && (
           <ActionButton 
             className="secondary"
             onClick={() => navigate('/become-a-host/status')}
           >
             View Host Application
           </ActionButton>
         )}
        <ActionButton 
          className="primary"
          onClick={() => navigate('/edit-profile')}
        >
          Edit Profile
        </ActionButton>
        <ActionButton 
          className="secondary"
          onClick={() => navigate('/liked-listings')}
        >
          <FaHeart /> Liked Listings
        </ActionButton>
      </ActionButtons>
    </ProfileContainer>
  );
};

export default Profile; 