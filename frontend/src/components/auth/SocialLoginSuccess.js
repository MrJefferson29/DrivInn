import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaHome,
  FaSignInAlt
} from 'react-icons/fa';
import './Auth.css';

const SocialLoginSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const handleSocialLogin = async () => {
      try {
        const token = searchParams.get('token');
        const provider = searchParams.get('provider');
        const error = searchParams.get('error');

        if (error) {
          setError(`Authentication failed: ${error}`);
          setLoading(false);
          return;
        }

        if (!token) {
          setError('No authentication token received');
          setLoading(false);
          return;
        }

        // Store the token
        localStorage.setItem('token', token);

        // Fetch user data
        const response = await fetch('http://localhost:5000/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const userData = await response.json();
          setSuccess(`Successfully signed in with ${provider}!`);
          
          // Redirect to home page after a short delay
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          setError('Failed to fetch user data');
        }
      } catch (err) {
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    handleSocialLogin();
  }, [searchParams, navigate]);

  if (loading) {
    return (
      <div className="auth-page">
        <Container>
          <Row className="justify-content-center">
            <Col md={6} lg={5} xl={4}>
              <div className="auth-container">
                <Card className="auth-card">
                  <Card.Body className="auth-card-body">
                    <div className="loading-container">
                      <div className="auth-logo">
                        <FaHome className="logo-icon" />
                      </div>
                      <h2 className="auth-title">Completing sign in...</h2>
                      <div className="loading-spinner">
                        <Spinner animation="border" variant="primary" />
                      </div>
                      <p>Please wait while we complete your authentication</p>
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
                    <h2 className="auth-title">
                      {error ? 'Authentication Failed' : 'Welcome!'}
                    </h2>
                    <p className="auth-subtitle">
                      {error ? 'Something went wrong with your sign in' : 'You have been successfully signed in'}
                    </p>
                  </div>

                  {/* Error/Success Messages */}
                  {error && (
                    <Alert variant="danger" className="auth-alert">
                      <div className="alert-content">
                        <FaExclamationTriangle className="alert-icon" />
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

                  {/* Action Buttons */}
                  <div className="auth-footer">
                    {error ? (
                      <p>
                        <FaSignInAlt className="me-1" />
                        <a href="/login" className="auth-link">
                          Try signing in again
                        </a>
                      </p>
                    ) : (
                      <p>
                        <FaHome className="me-1" />
                        <a href="/" className="auth-link">
                          Go to home page
                        </a>
                      </p>
                    )}
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

export default SocialLoginSuccess; 