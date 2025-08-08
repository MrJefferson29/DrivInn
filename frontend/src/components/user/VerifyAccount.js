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
  padding: 20px;
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

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 800;
  color: #222;
  margin-bottom: 8px;
  text-align: center;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #666;
  margin-bottom: 32px;
  text-align: center;
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

const SuccessMsg = styled.div`
  color: #28a745;
  background: #f0fff0;
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

const SectionTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: #222;
  margin: 24px 0 12px 0;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 8px;
`;

const VerifyAccount = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [dateOfBirth, setDateOfBirth] = useState(user?.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '');
  const [gender, setGender] = useState(user?.gender || '');
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
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  if (!user) return <ErrorMsg>User not found.</ErrorMsg>;

  // If user is already verified, show a message
  if (user.isVerified) {
    return (
      <Bg>
        <Card>
          <Title>Account Already Verified</Title>
          <Subtitle>
            {user.role === 'host' 
              ? 'Your account was automatically verified when your host application was approved.'
              : 'Your account is already verified.'
            }
          </Subtitle>
          <Button onClick={() => navigate('/profile')} style={{ marginTop: '20px' }}>
            Back to Profile
          </Button>
        </Card>
      </Bg>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Validate required fields
      if (!phoneNumber || !dateOfBirth || !gender || !address.street || !address.city || !address.country) {
        setError('Please fill in all required fields marked with *');
        setLoading(false);
        return;
      }

      const verificationData = {
        phoneNumber,
        dateOfBirth: new Date(dateOfBirth + 'T00:00:00.000Z'),
        gender,
        bio,
        address: {
          street: address.street,
          city: address.city,
          state: address.state,
          country: address.country,
          zipCode: address.zipCode
        },
        socialLinks: {
          website: socialLinks.website,
          facebook: socialLinks.facebook,
          twitter: socialLinks.twitter,
          instagram: socialLinks.instagram,
          linkedin: socialLinks.linkedin
        },
        isVerified: true
      };

      const res = await api.put(`/users/${user._id}`, verificationData);
      
      if (res.data) {
        setUser(res.data);
        setSuccess('Account verified successfully! You can now access all features.');
        setTimeout(() => {
          navigate('/profile');
        }, 2000);
      }
    } catch (err) {
      console.log('Error details:', err.response?.data);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to verify account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Bg>
      <Card>
        <Title>Verify Your Account</Title>
        <Subtitle>
          Complete your profile to get verified and unlock all features
        </Subtitle>
        
        <Form onSubmit={handleSubmit}>
          <SectionTitle>Personal Information</SectionTitle>
          
          <Field>
            <Input 
              id="phoneNumber" 
              value={phoneNumber} 
              onChange={e => setPhoneNumber(e.target.value)} 
              required 
              autoComplete="off" 
            />
            <FloatingLabel htmlFor="phoneNumber" active={!!phoneNumber}>
              Phone Number *
            </FloatingLabel>
          </Field>
          
          <Field>
            <Input 
              id="dateOfBirth" 
              type="date" 
              value={dateOfBirth} 
              onChange={e => setDateOfBirth(e.target.value)} 
              required
            />
            <FloatingLabel htmlFor="dateOfBirth" active={!!dateOfBirth}>
              Date of Birth *
            </FloatingLabel>
          </Field>
          
          <Field>
            <select 
              id="gender" 
              value={gender} 
              onChange={e => setGender(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '14px 12px',
                borderRadius: '8px',
                border: '1.5px solid #e0e7ef',
                fontSize: '1.08rem',
                background: '#f8fafc',
                outline: 'none'
              }}
            >
              <option value="">Select Gender *</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
            <FloatingLabel htmlFor="gender" active={!!gender}>
              Gender *
            </FloatingLabel>
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
            <FloatingLabel htmlFor="bio" active={!!bio}>
              Bio
            </FloatingLabel>
          </Field>
          
          <SectionTitle>Address Information</SectionTitle>
          
          <Field>
            <Input 
              id="street" 
              value={address.street} 
              onChange={e => setAddress({...address, street: e.target.value})} 
              required 
              autoComplete="off" 
            />
            <FloatingLabel htmlFor="street" active={!!address.street}>
              Street Address *
            </FloatingLabel>
          </Field>
          
          <Field>
            <Input 
              id="city" 
              value={address.city} 
              onChange={e => setAddress({...address, city: e.target.value})} 
              required 
              autoComplete="off" 
            />
            <FloatingLabel htmlFor="city" active={!!address.city}>
              City *
            </FloatingLabel>
          </Field>
          
          <Field>
            <Input 
              id="state" 
              value={address.state} 
              onChange={e => setAddress({...address, state: e.target.value})} 
              autoComplete="off" 
            />
            <FloatingLabel htmlFor="state" active={!!address.state}>
              State/Province
            </FloatingLabel>
          </Field>
          
          <Field>
            <Input 
              id="country" 
              value={address.country} 
              onChange={e => setAddress({...address, country: e.target.value})} 
              required 
              autoComplete="off" 
            />
            <FloatingLabel htmlFor="country" active={!!address.country}>
              Country *
            </FloatingLabel>
          </Field>
          
          <Field>
            <Input 
              id="zipCode" 
              value={address.zipCode} 
              onChange={e => setAddress({...address, zipCode: e.target.value})} 
              autoComplete="off" 
            />
            <FloatingLabel htmlFor="zipCode" active={!!address.zipCode}>
              Zip Code
            </FloatingLabel>
          </Field>
          
          <SectionTitle>Social Links (Optional)</SectionTitle>
          
          <Field>
            <Input 
              id="website" 
              value={socialLinks.website} 
              onChange={e => setSocialLinks({...socialLinks, website: e.target.value})} 
              autoComplete="off" 
            />
            <FloatingLabel htmlFor="website" active={!!socialLinks.website}>
              Website
            </FloatingLabel>
          </Field>
          
          <Field>
            <Input 
              id="facebook" 
              value={socialLinks.facebook} 
              onChange={e => setSocialLinks({...socialLinks, facebook: e.target.value})} 
              autoComplete="off" 
            />
            <FloatingLabel htmlFor="facebook" active={!!socialLinks.facebook}>
              Facebook
            </FloatingLabel>
          </Field>
          
          <Field>
            <Input 
              id="twitter" 
              value={socialLinks.twitter} 
              onChange={e => setSocialLinks({...socialLinks, twitter: e.target.value})} 
              autoComplete="off" 
            />
            <FloatingLabel htmlFor="twitter" active={!!socialLinks.twitter}>
              Twitter
            </FloatingLabel>
          </Field>
          
          <Field>
            <Input 
              id="instagram" 
              value={socialLinks.instagram} 
              onChange={e => setSocialLinks({...socialLinks, instagram: e.target.value})} 
              autoComplete="off" 
            />
            <FloatingLabel htmlFor="instagram" active={!!socialLinks.instagram}>
              Instagram
            </FloatingLabel>
          </Field>
          
          <Field>
            <Input 
              id="linkedin" 
              value={socialLinks.linkedin} 
              onChange={e => setSocialLinks({...socialLinks, linkedin: e.target.value})} 
              autoComplete="off" 
            />
            <FloatingLabel htmlFor="linkedin" active={!!socialLinks.linkedin}>
              LinkedIn
            </FloatingLabel>
          </Field>
          
          {error && <ErrorMsg>{error}</ErrorMsg>}
          {success && <SuccessMsg>{success}</SuccessMsg>}
          <Button type="submit" disabled={loading}>
            {loading ? 'Verifying...' : 'Verify Account'}
          </Button>
        </Form>
        {loading && <Loading>Verifying your account...</Loading>}
      </Card>
    </Bg>
  );
};

export default VerifyAccount; 