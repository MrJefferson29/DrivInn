import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Form, Button, Alert } from 'react-bootstrap';
import { 
  FaHome, 
  FaCar, 
  FaStar, 
  FaShieldAlt, 
  FaGlobe, 
  FaUsers, 
  FaHeart,
  FaMapMarkerAlt,
  FaCheckCircle,
  FaAward,
  FaRocket,
  FaHandshake,
  FaLeaf,
  FaMobile,
  FaCreditCard,
  FaHeadset,
  FaChartLine,
  FaLock,
  FaClock,
  FaSmile,
  FaPhone,
  FaEnvelope,
  FaBookmark,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaMap,
  FaBuilding,
  FaComments,
  FaTicketAlt,
  FaQuestionCircle,
  FaInfoCircle,
  FaTools,
  FaUserTie,
  FaCalendarAlt,
  FaGlobeAmericas
} from 'react-icons/fa';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 1500);
  };

  const contactMethods = [
    { 
      icon: <FaPhone />, 
      title: 'Phone Support', 
      value: '+1 (555) 123-4567',
      description: 'Available Monday-Friday, 9AM-6PM EST',
      color: '#FF385C'
    },
    { 
      icon: <FaEnvelope />, 
      title: 'Email Support', 
      value: 'support@drivinn.com',
      description: 'We respond within 24 hours',
      color: '#00A699'
    },
    { 
      icon: <FaComments />, 
      title: 'Live Chat', 
      value: 'Available 24/7',
      description: 'Get instant help from our team',
      color: '#484848'
    },
    { 
      icon: <FaTicketAlt />, 
      title: 'Help Center', 
      value: 'help.drivinn.com',
      description: 'Find answers to common questions',
      color: '#767676'
    }
  ];

  const departments = [
    {
      icon: <FaUsers />,
      title: 'Customer Support',
      description: 'General inquiries, booking issues, and account help',
      email: 'support@drivinn.com',
      phone: '+1 (555) 123-4567'
    },
    {
      icon: <FaHome />,
      title: 'Host Relations',
      description: 'Hosting questions, property management, and payments',
      email: 'hosts@drivinn.com',
      phone: '+1 (555) 123-4568'
    },
    {
      icon: <FaCar />,
      title: 'Vehicle Services',
      description: 'Car rental inquiries, fleet management, and vehicle support',
      email: 'vehicles@drivinn.com',
      phone: '+1 (555) 123-4569'
    },
    {
      icon: <FaBuilding />,
      title: 'Business Development',
      description: 'Partnerships, corporate accounts, and enterprise solutions',
      email: 'business@drivinn.com',
      phone: '+1 (555) 123-4570'
    }
  ];

  const locations = [
    {
      city: 'New York',
      country: 'United States',
      address: '123 Innovation Drive, Manhattan, NY 10001',
      phone: '+1 (555) 123-4567',
      email: 'nyc@drivinn.com',
      icon: <FaMapMarkerAlt />
    },
    {
      city: 'London',
      country: 'United Kingdom',
      address: '456 Tech Street, Shoreditch, London EC2A 4BX',
      phone: '+44 20 1234 5678',
      email: 'london@drivinn.com',
      icon: <FaMapMarkerAlt />
    },
    {
      city: 'Tokyo',
      country: 'Japan',
      address: '789 Digital Avenue, Shibuya, Tokyo 150-0002',
      phone: '+81 3 1234 5678',
      email: 'tokyo@drivinn.com',
      icon: <FaMapMarkerAlt />
    }
  ];

  const faqItems = [
    {
      question: 'How do I book accommodation or a vehicle?',
      answer: 'Simply browse our listings, select your dates, and complete the booking process. You can book through our website or mobile app.'
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'We offer flexible cancellation policies. Most bookings can be cancelled up to 24 hours before check-in for a full refund.'
    },
    {
      question: 'How do I become a host?',
      answer: 'Visit our "Become a Host" page to submit an application. We\'ll guide you through the verification process and help you get started.'
    },
    {
      question: 'Is my payment information secure?',
      answer: 'Yes, we use bank-level encryption and secure payment processing to protect your financial information.'
    }
  ];

  return (
    <div className="contact-page">
      {/* Hero Section */}
      <section className="contact-hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <div className="hero-content">
                <Badge bg="light" text="dark" className="hero-badge">
                  <FaHeadset className="me-2" />
                  24/7 Customer Support
                </Badge>
                <h1 className="hero-title">Contact Us</h1>
                <p className="hero-subtitle">
                  We're here to help! Get in touch with our team for any questions, 
                  support, or feedback. We're committed to providing exceptional 
                  service and ensuring your experience is smooth and enjoyable.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Contact Methods Section */}
      <section className="contact-methods-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <div className="contact-methods-content text-center">
                <h2 className="section-title">Get in Touch</h2>
                <p className="contact-methods-text">
                  Choose the most convenient way to reach us. Our dedicated team is ready 
                  to assist you with any questions or concerns.
                </p>
                <div className="contact-methods-grid">
                  <Row>
                    {contactMethods.map((method, index) => (
                      <Col key={index} md={3} sm={6}>
                        <div className="contact-method-item">
                          <div className="contact-method-icon" style={{ color: method.color }}>
                            {method.icon}
                          </div>
                          <div className="contact-method-title">{method.title}</div>
                          <div className="contact-method-value">{method.value}</div>
                          <div className="contact-method-description">{method.description}</div>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Contact Form Section */}
      <section className="contact-form-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <Card className="contact-form-card">
                <Card.Body className="p-5">
                  <div className="text-center mb-4">
                    <h2 className="section-title">Send us a Message</h2>
                    <p className="contact-form-subtitle">
                      Fill out the form below and we'll get back to you as soon as possible.
                    </p>
                  </div>

                  {submitted && (
                    <Alert variant="success" className="mb-4">
                      <FaCheckCircle className="me-2" />
                      Thank you for your message! We'll get back to you within 24 hours.
                    </Alert>
                  )}

                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Full Name *</Form.Label>
                          <Form.Control
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter your full name"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Email Address *</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter your email address"
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-3">
                      <Form.Label>Subject *</Form.Label>
                      <Form.Control
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="What is this regarding?"
                      />
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Message *</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        placeholder="Tell us how we can help you..."
                      />
                    </Form.Group>

                    <div className="text-center">
                      <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        disabled={loading}
                        className="contact-submit-btn"
                      >
                        {loading ? (
                          <>
                            <FaClock className="me-2" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <FaEnvelope className="me-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Departments Section */}
      <section className="departments-section">
        <Container>
          <h2 className="section-title text-center mb-5">Contact by Department</h2>
          <Row>
            {departments.map((dept, index) => (
              <Col key={index} lg={3} md={6} className="mb-4">
                <Card className="department-card h-100">
                  <Card.Body className="text-center">
                    <div className="department-icon">
                      {dept.icon}
                    </div>
                    <Card.Title className="department-title">{dept.title}</Card.Title>
                    <Card.Text className="department-description">
                      {dept.description}
                    </Card.Text>
                    <div className="department-contact">
                      <div className="dept-email">
                        <FaEnvelope className="me-2" />
                        {dept.email}
                      </div>
                      <div className="dept-phone">
                        <FaPhone className="me-2" />
                        {dept.phone}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Global Offices Section */}
      <section className="offices-section">
        <Container>
          <h2 className="section-title text-center mb-5">Our Global Offices</h2>
          <Row>
            {locations.map((location, index) => (
              <Col key={index} lg={4} md={6} className="mb-4">
                <Card className="office-card h-100">
                  <Card.Body>
                    <div className="office-header">
                      <div className="office-icon">
                        {location.icon}
                      </div>
                      <div>
                        <Card.Title className="office-city">{location.city}</Card.Title>
                        <div className="office-country">{location.country}</div>
                      </div>
                    </div>
                    <div className="office-details">
                      <div className="office-address">
                        <FaMap className="me-2" />
                        {location.address}
                      </div>
                      <div className="office-phone">
                        <FaPhone className="me-2" />
                        {location.phone}
                      </div>
                      <div className="office-email">
                        <FaEnvelope className="me-2" />
                        {location.email}
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="faq-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <h2 className="section-title text-center mb-5">Frequently Asked Questions</h2>
              <div className="faq-list">
                {faqItems.map((item, index) => (
                  <Card key={index} className="faq-item mb-3">
                    <Card.Body>
                      <div className="faq-question">
                        <FaQuestionCircle className="me-2" />
                        <strong>{item.question}</strong>
                      </div>
                      <div className="faq-answer">
                        <FaInfoCircle className="me-2" />
                        {item.answer}
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Response Time Section */}
      <section className="response-time-section">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <div className="response-time-content">
                <h2 className="section-title">Our Response Promise</h2>
                <div className="response-time-grid">
                  <Row>
                    <Col md={4}>
                      <div className="response-time-item">
                        <FaClock className="response-time-icon" />
                        <div className="response-time-value">2 Hours</div>
                        <div className="response-time-label">Live Chat Response</div>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="response-time-item">
                        <FaEnvelope className="response-time-icon" />
                        <div className="response-time-value">24 Hours</div>
                        <div className="response-time-label">Email Response</div>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="response-time-item">
                        <FaPhone className="response-time-icon" />
                        <div className="response-time-value">Immediate</div>
                        <div className="response-time-label">Phone Support</div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h2 className="cta-title">Still Need Help?</h2>
              <p className="cta-text">
                Can't find what you're looking for? Our support team is here to help 
                you with any questions or concerns.
              </p>
              <div className="cta-buttons">
                <a href="/help" className="btn btn-primary btn-lg me-3 cta-btn">
                  <FaQuestionCircle className="me-2" />
                  Visit Help Center
                </a>
                <a href="tel:+15551234567" className="btn btn-outline-primary btn-lg cta-btn">
                  <FaPhone className="me-2" />
                  Call Us Now
                </a>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <Container fluid>
          <Row>
            <Col lg={3} md={6}>
              <h4>Support</h4>
              <ul>
                <li><FaPhone /> Help Center</li>
                <li><FaEnvelope /> Contact Us</li>
                <li><FaShieldAlt /> Safety Information</li>
                <li><FaUsers /> Community Guidelines</li>
              </ul>
            </Col>
            <Col lg={3} md={6}>
              <h4>Hosting</h4>
              <ul>
                <li><FaHome /> Host your home</li>
                <li><FaCar /> Host your car</li>
                <li><FaAward /> Superhost</li>
                <li><FaBookmark /> Resource Center</li>
              </ul>
            </Col>
            <Col lg={3} md={6}>
              <h4>About</h4>
              <ul>
                <li><a href="/about"><FaGlobe /> About Us</a></li>
                <li><FaStar /> Press</li>
                <li><FaUsers /> Careers</li>
                <li><FaAward /> Awards</li>
              </ul>
            </Col>
            <Col lg={3} md={6}>
              <h4>Connect</h4>
              <div className="social-links">
                <a href="#" aria-label="Facebook"><FaFacebook /></a>
                <a href="#" aria-label="Twitter"><FaTwitter /></a>
                <a href="#" aria-label="Instagram"><FaInstagram /></a>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default Contact;
