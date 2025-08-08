import React, { useState } from 'react';
import styled from 'styled-components';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const Bg = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
`;
const Card = styled.div`
  background: #fff;
  border-radius: 22px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.10);
  padding: 40px 28px 32px 28px;
  max-width: 600px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  @media (max-width: 600px) {
    padding: 24px 8px 20px 8px;
    max-width: 98vw;
  }
`;
const ProfileImageWrapper = styled.div`
  position: relative;
  margin-bottom: 18px;
`;
const ProfileImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  background: #f7f7f7;
  border: 4px solid #e0e7ef;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
`;
const ChangeImageButton = styled.label`
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: #FF385C;
  color: #fff;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
  border: 2px solid #fff;
  transition: background 0.2s;
  &:hover {
    background: #e11d48;
  }
`;
const HiddenInput = styled.input`
  display: none;
`;
const Title = styled.h2`
  font-size: 1.6rem;
  font-weight: 800;
  color: #222;
  margin-bottom: 18px;
`;
const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 8px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
`;
const Field = styled.div`
  position: relative;
  margin-bottom: 4px;
`;
const FloatingLabel = styled.label`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: #fff;
  padding: 0 4px;
  color: #888;
  font-size: 1rem;
  pointer-events: none;
  transition: 0.2s;
  z-index: 2;
  ${props => props.active && `
    top: -10px;
    left: 10px;
    font-size: 0.88rem;
    color: #FF385C;
    background: #fff;
  `}
`;
const Input = styled.input`
  width: 100%;
  padding: 14px 12px 14px 12px;
  border-radius: 8px;
  border: 1.5px solid #e0e7ef;
  font-size: 1.08rem;
  background: #f8fafc;
  outline: none;
  transition: border 0.2s;
  &:focus {
    border: 1.5px solid #FF385C;
  }
`;
const Button = styled.button`
  background: #FF385C;
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 13px 0;
  font-size: 1.13rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 10px;
  box-shadow: 0 2px 8px rgba(255,56,92,0.08);
  transition: background 0.2s;
  &:hover {
    background: #e11d48;
  }
`;
const ErrorMsg = styled.div`
  color: #c00;
  background: #fff0f0;
  border-radius: 8px;
  padding: 12px;
  margin: 12px 0 0 0;
  text-align: center;
  font-size: 1rem;
`;
const Loading = styled.div`
  text-align: center;
  margin: 30px 0;
  color: #FF385C;
`;

const EditProfile = () => {
  const { user, setUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [address, setAddress] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    country: user?.address?.country || '',
    zipCode: user?.address?.zipCode || ''
  });

  const [socialLinks, setSocialLinks] = useState({
    website: user?.socialLinks?.website || '',
    facebook: user?.socialLinks?.facebook || '',
    twitter: user?.socialLinks?.twitter || '',
    instagram: user?.socialLinks?.instagram || '',
    linkedin: user?.socialLinks?.linkedin || ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.profileImage || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.firstName + ' ' + user?.lastName));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  if (!user) return <ErrorMsg>User not found.</ErrorMsg>;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(user?.profileImage || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.firstName + ' ' + user?.lastName));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const updates = {};
      
             // Basic info updates
       if (firstName !== user.firstName) updates.firstName = firstName;
       if (lastName !== user.lastName) updates.lastName = lastName;
       if (email !== user.email) updates.email = email;
       if (bio !== user.bio) updates.bio = bio;
      
             // Address updates
       const currentAddress = user.address || {};
       const cleanAddress = {
         street: address.street || '',
         city: address.city || '',
         state: address.state || '',
         country: address.country || '',
         zipCode: address.zipCode || ''
       };
       if (JSON.stringify(cleanAddress) !== JSON.stringify(currentAddress)) {
         updates.address = cleanAddress;
       }
      
      
      
             // Social links updates
       const currentSocialLinks = user.socialLinks || {};
       const cleanSocialLinks = {
         website: socialLinks.website || '',
         facebook: socialLinks.facebook || '',
         twitter: socialLinks.twitter || '',
         instagram: socialLinks.instagram || '',
         linkedin: socialLinks.linkedin || ''
       };
       if (JSON.stringify(cleanSocialLinks) !== JSON.stringify(currentSocialLinks)) {
         updates.socialLinks = cleanSocialLinks;
       }
      
      let updatedUser = user;
      if (Object.keys(updates).length === 0 && !profileImage) {
        setError('No changes to update.');
        setLoading(false);
        return;
      }
      
      if (Object.keys(updates).length > 0) {
        const res = await api.put(`/users/${user._id}`, updates);
        if (res.data) updatedUser = res.data;
      }
      
      if (profileImage) {
        const formData = new FormData();
        formData.append('image', profileImage);
        const imgRes = await api.put(`/users/${user._id}/profile-image`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (imgRes.data && imgRes.data.user) updatedUser = imgRes.data.user;
        else if (imgRes.data && imgRes.data.profileImage) {
          updatedUser = { ...updatedUser, profileImage: imgRes.data.profileImage };
        } else {
          setError('Unexpected response from image upload.');
          setLoading(false);
          return;
        }
      }
      
      if (!updatedUser || !updatedUser._id) {
        setError('Failed to update user profile.');
        setLoading(false);
        return;
      }
      
      setUser(updatedUser);
      navigate('/profile');
      return;
    } catch (err) {
      console.log('Error details:', err.response?.data);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Bg>
      <Card>
        <Title>Edit Profile</Title>
        <ProfileImageWrapper>
          <ProfileImage src={imagePreview} alt="Profile Preview" />
          <ChangeImageButton htmlFor="profileImage" title="Change profile image">
            <span role="img" aria-label="camera">📷</span>
            <HiddenInput id="profileImage" type="file" accept="image/*" onChange={handleImageChange} />
          </ChangeImageButton>
        </ProfileImageWrapper>
        <Form onSubmit={handleSubmit}>
          {/* Basic Information */}
          <Field>
            <Input id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} required autoComplete="off" />
            <FloatingLabel htmlFor="firstName" active={!!firstName}>First Name</FloatingLabel>
          </Field>
          <Field>
            <Input id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} required autoComplete="off" />
            <FloatingLabel htmlFor="lastName" active={!!lastName}>Last Name</FloatingLabel>
          </Field>
          <Field>
            <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="off" />
            <FloatingLabel htmlFor="email" active={!!email}>Email</FloatingLabel>
          </Field>
          
          <Field>
            <textarea 
              id="bio" 
              value={bio} 
              onChange={e => setBio(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 12px',
                borderRadius: '8px',
                border: '1.5px solid #e0e7ef',
                fontSize: '1.08rem',
                background: '#f8fafc',
                outline: 'none',
                minHeight: '80px',
                resize: 'vertical'
              }}
              placeholder="Tell us about yourself..."
            />
            <FloatingLabel htmlFor="bio" active={!!bio}>Bio</FloatingLabel>
          </Field>
          
          {/* Address Information */}
          <Field>
            <Input id="street" value={address.street} onChange={e => setAddress({...address, street: e.target.value})} autoComplete="off" />
            <FloatingLabel htmlFor="street" active={!!address.street}>Street Address</FloatingLabel>
          </Field>
          <Field>
            <Input id="city" value={address.city} onChange={e => setAddress({...address, city: e.target.value})} autoComplete="off" />
            <FloatingLabel htmlFor="city" active={!!address.city}>City</FloatingLabel>
          </Field>
          <Field>
            <Input id="state" value={address.state} onChange={e => setAddress({...address, state: e.target.value})} autoComplete="off" />
            <FloatingLabel htmlFor="state" active={!!address.state}>State/Province</FloatingLabel>
          </Field>
          <Field>
            <Input id="country" value={address.country} onChange={e => setAddress({...address, country: e.target.value})} autoComplete="off" />
            <FloatingLabel htmlFor="country" active={!!address.country}>Country</FloatingLabel>
          </Field>
          <Field>
            <Input id="zipCode" value={address.zipCode} onChange={e => setAddress({...address, zipCode: e.target.value})} autoComplete="off" />
            <FloatingLabel htmlFor="zipCode" active={!!address.zipCode}>Zip Code</FloatingLabel>
          </Field>
          
          {/* Social Links */}
          <Field>
            <Input id="website" value={socialLinks.website} onChange={e => setSocialLinks({...socialLinks, website: e.target.value})} autoComplete="off" />
            <FloatingLabel htmlFor="website" active={!!socialLinks.website}>Website</FloatingLabel>
          </Field>
          <Field>
            <Input id="facebook" value={socialLinks.facebook} onChange={e => setSocialLinks({...socialLinks, facebook: e.target.value})} autoComplete="off" />
            <FloatingLabel htmlFor="facebook" active={!!socialLinks.facebook}>Facebook</FloatingLabel>
          </Field>
          <Field>
            <Input id="twitter" value={socialLinks.twitter} onChange={e => setSocialLinks({...socialLinks, twitter: e.target.value})} autoComplete="off" />
            <FloatingLabel htmlFor="twitter" active={!!socialLinks.twitter}>Twitter</FloatingLabel>
          </Field>
          <Field>
            <Input id="instagram" value={socialLinks.instagram} onChange={e => setSocialLinks({...socialLinks, instagram: e.target.value})} autoComplete="off" />
            <FloatingLabel htmlFor="instagram" active={!!socialLinks.instagram}>Instagram</FloatingLabel>
          </Field>
          <Field>
            <Input id="linkedin" value={socialLinks.linkedin} onChange={e => setSocialLinks({...socialLinks, linkedin: e.target.value})} autoComplete="off" />
            <FloatingLabel htmlFor="linkedin" active={!!socialLinks.linkedin}>LinkedIn</FloatingLabel>
          </Field>
          
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
        </Form>
        {loading && <Loading>Saving changes...</Loading>}
      </Card>
    </Bg>
  );
};

export default EditProfile; 