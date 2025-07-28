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
  max-width: 420px;
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
      if (firstName !== user.firstName) updates.firstName = firstName;
      if (lastName !== user.lastName) updates.lastName = lastName;
      if (email !== user.email) updates.email = email;
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
      console.log(err);
      setError(err.response?.data?.message || 'Failed to update profile');
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
          {error && <ErrorMsg>{error}</ErrorMsg>}
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</Button>
        </Form>
        {loading && <Loading>Saving changes...</Loading>}
      </Card>
    </Bg>
  );
};

export default EditProfile; 