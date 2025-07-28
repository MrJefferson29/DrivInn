import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { 
  FaUser, 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaUserPlus,
  FaCheck,
  FaTimes,
  FaGoogle,
  FaFacebook,
  FaHome,
  FaSignInAlt
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear errors when user starts typing
    if (error) setError('');

    // Check password strength
    if (name === 'password') {
      setPasswordStrength({
        length: value.length >= 8,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /\d/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
      });
    }
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (formData.firstName.length < 2) {
      setError('First name must be at least 2 characters long');
      return false;
    }

    if (formData.lastName.length < 2) {
      setError('Last name must be at least 2 characters long');
      return false;
    }

    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    const allStrengthChecks = Object.values(passwordStrength);
    if (!allStrengthChecks.every(check => check)) {
      setError('Password does not meet all requirements');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const result = await register(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password
      );
      
      if (result.success) {
        setSuccess('Registration successful! Please sign in.');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const getPasswordStrengthColor = (isValid) => {
    return isValid ? '#28a745' : '#dc3545';
  };

  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <div className="auth-container">
              <Card className="auth-card">
                <Card.Body className="auth-card-body">
                  {/* Header */}
                  <div className="auth-header">
                    <div className="auth-logo">
                      <FaHome className="logo-icon" />
                    </div>
                    <h2 className="auth-title">Create your account</h2>
                    <p className="auth-subtitle">Join thousands of users worldwide</p>
                  </div>

                  {/* Error/Success Messages */}
                  {error && (
                    <Alert variant="danger" className="auth-alert">
                      <div className="alert-content">
                        <FaUserPlus className="alert-icon" />
                        <span>{error}</span>
                      </div>
                    </Alert>
                  )}
                  {success && (
                    <Alert variant="success" className="auth-alert">
                      <div className="alert-content">
                        <FaUserPlus className="alert-icon" />
                        <span>{success}</span>
                      </div>
                    </Alert>
                  )}

                  {/* Registration Form */}
                  <Form onSubmit={handleSubmit} className="auth-form">
                    <Row>
                      <Col md={6}>
                        <Form.Group className="auth-form-group">
                          <Form.Label>First name</Form.Label>
                          <div className="input-group-with-icon">
                            <FaUser className="input-icon" />
                            <Form.Control
                              type="text"
                              name="firstName"
                              value={formData.firstName}
                              onChange={handleChange}
                              placeholder="Enter your first name"
                              className="auth-input"
                              required
                            />
                          </div>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="auth-form-group">
                          <Form.Label>Last name</Form.Label>
                          <div className="input-group-with-icon">
                            <FaUser className="input-icon" />
                            <Form.Control
                              type="text"
                              name="lastName"
                              value={formData.lastName}
                              onChange={handleChange}
                              placeholder="Enter your last name"
                              className="auth-input"
                              required
                            />
                          </div>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="auth-form-group">
                      <Form.Label>Email address</Form.Label>
                      <div className="input-group-with-icon">
                        <FaEnvelope className="input-icon" />
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          className="auth-input"
                          required
                        />
                      </div>
                    </Form.Group>

                    <Form.Group className="auth-form-group">
                      <Form.Label>Password</Form.Label>
                      <div className="input-group-with-icon">
                        <FaLock className="input-icon" />
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Create a password"
                          className="auth-input"
                          required
                        />
                        <Button
                          type="button"
                          variant="link"
                          className="password-toggle"
                          onClick={togglePasswordVisibility}
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      {formData.password && (
                        <div className="password-strength">
                          <div className="strength-item">
                            <span style={{ color: getPasswordStrengthColor(passwordStrength.length) }}>
                              {passwordStrength.length ? <FaCheck /> : <FaTimes />}
                            </span>
                            At least 8 characters
                          </div>
                          <div className="strength-item">
                            <span style={{ color: getPasswordStrengthColor(passwordStrength.uppercase) }}>
                              {passwordStrength.uppercase ? <FaCheck /> : <FaTimes />}
                            </span>
                            One uppercase letter
                          </div>
                          <div className="strength-item">
                            <span style={{ color: getPasswordStrengthColor(passwordStrength.lowercase) }}>
                              {passwordStrength.lowercase ? <FaCheck /> : <FaTimes />}
                            </span>
                            One lowercase letter
                          </div>
                          <div className="strength-item">
                            <span style={{ color: getPasswordStrengthColor(passwordStrength.number) }}>
                              {passwordStrength.number ? <FaCheck /> : <FaTimes />}
                            </span>
                            One number
                          </div>
                          <div className="strength-item">
                            <span style={{ color: getPasswordStrengthColor(passwordStrength.special) }}>
                              {passwordStrength.special ? <FaCheck /> : <FaTimes />}
                            </span>
                            One special character
                          </div>
                        </div>
                      )}
                    </Form.Group>

                    <Form.Group className="auth-form-group">
                      <Form.Label>Confirm password</Form.Label>
                      <div className="input-group-with-icon">
                        <FaLock className="input-icon" />
                        <Form.Control
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm your password"
                          className="auth-input"
                          required
                        />
                        <Button
                          type="button"
                          variant="link"
                          className="password-toggle"
                          onClick={toggleConfirmPasswordVisibility}
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </Button>
                      </div>
                    </Form.Group>

                    <div className="auth-options">
                      <Form.Check
                        type="checkbox"
                        label="I agree to the Terms of Service and Privacy Policy"
                        className="auth-checkbox"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      className="auth-button"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="loading-spinner">
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          Creating account...
                        </span>
                      ) : (
                        <>
                          <FaUserPlus className="me-2" />
                          Create Account
                        </>
                      )}
                    </Button>
                  </Form>

                  {/* Divider */}
                  <div className="auth-divider">
                    <span>or continue with</span>
                  </div>

                  {/* Social Registration Buttons */}
                  <div className="social-login">
                    <Button 
                      variant="outline-dark" 
                      className="social-button"
                      onClick={() => window.location.href = 'http://localhost:5000/auth/google'}
                    >
                      <FaGoogle className="social-icon" />
                      Continue with Google
                    </Button>
                  </div>

                  {/* Footer */}
                  <div className="auth-footer">
                    <p>
                      Already have an account?{' '}
                      <Link to="/login" className="auth-link">
                        <FaSignInAlt className="me-1" />
                        Sign in
                      </Link>
                    </p>
                  </div>
                </Card.Body>
              </Card>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register; 