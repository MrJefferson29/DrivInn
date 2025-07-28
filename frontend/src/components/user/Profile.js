import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';

const ProfileContainer = styled.div`
  max-width: 480px;
  margin: 40px auto;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.07);
  padding: 36px 28px 32px 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
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
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
`;

const Label = styled.span`
  color: #888;
  font-weight: 500;
`;

const Value = styled.span`
  color: #23272f;
  font-weight: 600;
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
      <InfoList>
        <InfoItem>
          <Label>Verified:</Label>
          <Value>{user.isVerified ? 'Yes' : 'No'}</Value>
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
      <ActionButtons>
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