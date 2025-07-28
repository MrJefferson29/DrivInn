import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaCheckCircle,
  FaHome,
  FaSignInAlt,
  FaCheck,
  FaTimes
} from 'react-icons/fa';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import './Auth.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenValid, setTokenValid] = useState(false);
  const [token, setToken] = useState('');
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      verifyToken(tokenFromUrl);
    } else {
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, [searchParams]);

  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await fetch(`http://localhost:5000/auth/verify-reset-token/${tokenToVerify}`);
      const data = await response.json();

      if (response.ok) {
        setTokenValid(true);
      } else {
        setError(data.message || 'Invalid or expired reset link');
      }
    } catch (err) {
      setError('Failed to verify reset link. Please try again.');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

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
    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
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
      const response = await fetch('http://localhost:5000/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          newPassword: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Password has been reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(data.message || 'Failed to reset password');
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

  if (!tokenValid && !error) {
    return (
      <div className="auth-page">
        <Container>
          <Row className="justify-content-center">
            <Col md={6} lg={5} xl={4}>
              <div className="auth-container">
                <Card className="auth-card">
                  <Card.Body className="auth-card-body">
                    <div className="loading-container">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p>Verifying reset link...</p>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={5} xl={4}>
            <div className="auth-container">
              <Card className="auth-card">
                <Card.Body className="auth-card-body">
                  {/* Header */}
                  <div className="auth-header">
                    <div className="auth-logo">
                      <FaHome className="logo-icon" />
                    </div>
                    <h2 className="auth-title">Reset your password</h2>
                    <p className="auth-subtitle">Enter your new password</p>
                  </div>

                  {/* Error/Success Messages */}
                  {error && (
                    <Alert variant="danger" className="auth-alert">
                      <div className="alert-content">
                        <FaLock className="alert-icon" />
                        <span>{error}</span>
                      </div>
                    </Alert>
                  )}
                  {success && (
                    <Alert variant="success" className="auth-alert">
                      <div className="alert-content">
                        <FaCheckCircle className="alert-icon" />
                        <span>{success}</span>
                      </div>
                    </Alert>
                  )}

                  {/* Reset Password Form */}
                  <Form onSubmit={handleSubmit} className="auth-form">
                    <Form.Group className="auth-form-group">
                      <Form.Label>New password</Form.Label>
                      <div className="input-group-with-icon">
                        <FaLock className="input-icon" />
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          placeholder="Enter your new password"
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
                      <Form.Label>Confirm new password</Form.Label>
                      <div className="input-group-with-icon">
                        <FaLock className="input-icon" />
                        <Form.Control
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          placeholder="Confirm your new password"
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
                          Resetting password...
                        </span>
                      ) : (
                        <>
                          <FaLock className="me-2" />
                          Reset Password
                        </>
                      )}
                    </Button>
                  </Form>

                  {/* Footer */}
                  <div className="auth-footer">
                    <p>
                      Remember your password?{' '}
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

export default ResetPassword; 