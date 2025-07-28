import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { 
  FaEnvelope, 
  FaArrowLeft,
  FaHome,
  FaCheckCircle,
  FaSignInAlt
} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './Auth.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Basic validation
    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(data.message || 'Password reset link has been sent to your email address');
        setEmail('');
      } else {
        setError(data.message || 'Failed to send password reset email');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
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
                    <h2 className="auth-title">Reset your password</h2>
                    <p className="auth-subtitle">Enter your email to receive a reset link</p>
                  </div>

                  {/* Error/Success Messages */}
                  {error && (
                    <Alert variant="danger" className="auth-alert">
                      <div className="alert-content">
                        <FaEnvelope className="alert-icon" />
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

                  {/* Forgot Password Form */}
                  <Form onSubmit={handleSubmit} className="auth-form">
                    <Form.Group className="auth-form-group">
                      <Form.Label>Email address</Form.Label>
                      <div className="input-group-with-icon">
                        <FaEnvelope className="input-icon" />
                        <Form.Control
                          type="email"
                          name="email"
                          value={email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          className="auth-input"
                          required
                        />
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
                          Sending reset link...
                        </span>
                      ) : (
                        <>
                          <FaEnvelope className="me-2" />
                          Send Reset Link
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
                    <p style={{ marginTop: '12px', fontSize: '12px', color: '#999' }}>
                      <FaArrowLeft className="me-1" />
                      <Link to="/" className="auth-link" style={{ fontSize: '12px' }}>
                        Back to home
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

export default ForgotPassword; 