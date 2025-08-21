import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash, 
  FaSignInAlt,
  FaGoogle,
  FaFacebook,
  FaHome,
  FaUserPlus
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(result.error || 'Login failed');
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
                    <h2 className="auth-title">Welcome back</h2>
                    <p className="auth-subtitle">Sign in to your account to continue</p>
                  </div>

                  {/* Error/Success Messages */}
                  {error && (
                    <Alert variant="danger" className="auth-alert">
                      <div className="alert-content">
                        <FaSignInAlt className="alert-icon" />
                        <span>{error}</span>
                      </div>
                    </Alert>
                  )}
                  {success && (
                    <Alert variant="success" className="auth-alert">
                      <div className="alert-content">
                        <FaSignInAlt className="alert-icon" />
                        <span>{success}</span>
                      </div>
                    </Alert>
                  )}

                  {/* Login Form */}
                  <Form onSubmit={handleSubmit} className="auth-form">
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
                          placeholder="Enter your password"
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
                    </Form.Group>

                    <div className="auth-options">
                      <Form.Check
                        type="checkbox"
                        label="Remember me"
                        className="auth-checkbox"
                      />
                      <Link to="/forgot-password" className="auth-link">
                        Forgot password?
                      </Link>
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
                          Signing in...
                        </span>
                      ) : (
                        <>
                          <FaSignInAlt className="me-2" />
                          Sign In
                        </>
                      )}
                    </Button>
                  </Form>

                  {/* Divider */}
                  <div className="auth-divider">
                    <span>or continue with</span>
                  </div>

                  {/* Social Login Buttons */}
                  <div className="social-login">
                    <Button 
                      variant="outline-dark" 
                      className="social-button"
                      onClick={() => window.location.href = 'https://drivinn.onrender.com/auth/google'}
                    >
                      <FaGoogle className="social-icon" />
                      Continue with Google
                    </Button>
                  </div>

                  {/* Footer */}
                  <div className="auth-footer">
                    <p>
                      Don't have an account?{' '}
                      <Link to="/register" className="auth-link">
                        <FaUserPlus className="me-1" />
                        Sign up
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

export default Login; 