import React, { useState } from 'react';
import { Container, Row, Col, Card, Badge, Accordion, Button } from 'react-bootstrap';
import { 
      FaBook, FaSearch, FaRocket, FaCalendarAlt, FaHome, FaCreditCard, 
      FaShieldAlt, FaUser, FaQuestionCircle, FaInfoCircle, FaPlay, FaDownload,
      FaPhone, FaEnvelope, FaComments, FaArrowRight, FaHeadset
    } from 'react-icons/fa';
import './Help.css';

const Help = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const helpCategories = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      icon: <FaRocket />,
      color: '#FF385C'
    },
    {
      id: 'booking',
      title: 'Booking & Reservations',
      icon: <FaCalendarAlt />,
      color: '#00A699'
    },
    {
      id: 'hosting',
      title: 'Hosting',
      icon: <FaHome />,
      color: '#484848'
    },
    {
      id: 'payments',
      title: 'Payments & Billing',
      icon: <FaCreditCard />,
      color: '#767676'
    }
  ];

  const helpArticles = {
    'getting-started': [
      {
        question: 'How do I create an account?',
        answer: 'Click the "Sign Up" button and complete the registration form with your email and password.',
        tags: ['account', 'signup']
      },
      {
        question: 'How do I search for accommodations?',
        answer: 'Use the search bar to enter your destination, dates, and number of guests.',
        tags: ['search', 'accommodation']
      }
    ],
    'booking': [
      {
        question: 'How do I make a booking?',
        answer: 'Select your dates, review details, and click "Book Now" to complete your reservation.',
        tags: ['booking', 'reservation']
      },
      {
        question: 'What is your cancellation policy?',
        answer: 'Most bookings can be cancelled up to 24 hours before check-in for a full refund.',
        tags: ['cancellation', 'refund']
      }
    ]
  };

  const quickActions = [
    {
      title: 'Contact Support',
      description: 'Get help from our team',
      icon: <FaHeadset />,
      action: 'Contact Us',
      link: '/contact',
      color: '#FF385C'
    },
    {
      title: 'Safety Center',
      description: 'Learn about safety measures',
      icon: <FaShieldAlt />,
      action: 'Learn More',
      link: '/safety',
      color: '#00A699'
    }
  ];

  return (
    <div className="help-page">
      {/* Hero Section */}
      <section className="help-hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <div className="hero-content">
                <Badge bg="light" text="dark" className="hero-badge">
                  <FaBook className="me-2" />
                  Comprehensive Help Center
                </Badge>
                <h1 className="hero-title">How Can We Help?</h1>
                <p className="hero-subtitle">
                  Find answers to common questions and get the support you need.
                </p>
                
                {/* Search Bar */}
                <div className="help-search-container">
                  <div className="search-input-wrapper">
                    <FaSearch className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search for help articles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="help-search-input"
                    />
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Quick Actions Section */}
      <section className="quick-actions-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <div className="quick-actions-content text-center">
                <h2 className="section-title">Quick Actions</h2>
                <div className="quick-actions-grid">
                  <Row>
                    {quickActions.map((action, index) => (
                      <Col key={index} md={6}>
                        <div className="quick-action-item">
                          <div className="quick-action-icon" style={{ color: action.color }}>
                            {action.icon}
                          </div>
                          <div className="quick-action-title">{action.title}</div>
                          <div className="quick-action-description">{action.description}</div>
                          <a href={action.link} className="quick-action-button">
                            {action.action} <FaArrowRight size={14} />
                          </a>
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

      {/* Help Categories Section */}
      <section className="help-categories-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <div className="help-categories-content text-center">
                <h2 className="section-title">Browse Help by Category</h2>
                
                {/* Category Filter Buttons */}
                <div className="category-filter-buttons mb-4">
                  <Button
                    variant={selectedCategory === 'all' ? 'primary' : 'outline-primary'}
                    onClick={() => setSelectedCategory('all')}
                    className="category-filter-btn"
                  >
                    All Topics
                  </Button>
                  {helpCategories.map(category => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? 'primary' : 'outline-primary'}
                      onClick={() => setSelectedCategory(category.id)}
                      className="category-filter-btn"
                    >
                      {category.icon} {category.title}
                    </Button>
                  ))}
                </div>

                {/* Help Articles */}
                <div className="help-articles-container">
                  <Accordion className="help-accordion">
                    {Object.values(helpArticles).flat().map((article, index) => (
                      <Accordion.Item key={index} eventKey={index.toString()} className="help-accordion-item">
                        <Accordion.Header className="help-accordion-header">
                          <div className="accordion-question">
                            <FaQuestionCircle className="me-2" />
                            {article.question}
                          </div>
                        </Accordion.Header>
                        <Accordion.Body className="help-accordion-body">
                          <div className="accordion-answer">
                            <FaInfoCircle className="me-2" />
                            {article.answer}
                          </div>
                          <div className="article-tags">
                            {article.tags.map((tag, tagIndex) => (
                              <Badge key={tagIndex} bg="light" text="dark" className="article-tag">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Still Need Help Section */}
      <section className="still-need-help-section">
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <div className="still-need-help-content">
                <h2 className="section-title">Still Need Help?</h2>
                <p className="still-need-help-text">
                  Can't find what you're looking for? Our support team is here to help.
                </p>
                <div className="help-contact-options">
                  <Row>
                    <Col md={4}>
                      <div className="help-contact-option">
                        <FaPhone className="help-contact-icon" />
                        <h4>Call Us</h4>
                        <a href="tel:+15551234567" className="help-contact-button">
                          +1 (555) 123-4567
                        </a>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="help-contact-option">
                        <FaEnvelope className="help-contact-icon" />
                        <h4>Email Support</h4>
                        <a href="mailto:support@drivinn.com" className="help-contact-button">
                          support@drivinn.com
                        </a>
                      </div>
                    </Col>
                    <Col md={4}>
                      <div className="help-contact-option">
                        <FaComments className="help-contact-icon" />
                        <h4>Live Chat</h4>
                        <Button variant="primary" className="help-contact-button">
                          Start Chat
                        </Button>
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
              <h2 className="cta-title">Ready to Get Started?</h2>
              <p className="cta-text">
                Now that you have all the information you need, start exploring on DrivInn.
              </p>
              <div className="cta-buttons">
                <a href="/" className="btn btn-primary btn-lg me-3 cta-btn">
                  <FaHome className="me-2" />
                  Start Exploring
                </a>
                <a href="/become-a-host-info" className="btn btn-outline-primary btn-lg cta-btn">
                  <FaHome className="me-2" />
                  Become a Host
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
                <li><FaUser /> Community Guidelines</li>
              </ul>
            </Col>
            <Col lg={3} md={6}>
              <h4>Hosting</h4>
              <ul>
                <li><FaHome /> Host your home</li>
                <li><FaHome /> Host your car</li>
                <li><FaHome /> Superhost</li>
                <li><FaHome /> Resource Center</li>
              </ul>
            </Col>
            <Col lg={3} md={6}>
              <h4>About</h4>
              <ul>
                <li><a href="/about">About Us</a></li>
                <li>Press</li>
                <li>Careers</li>
                <li>Awards</li>
              </ul>
            </Col>
            <Col lg={3} md={6}>
              <h4>Connect</h4>
              <div className="social-links">
                <a href="#" aria-label="Facebook">FB</a>
                <a href="#" aria-label="Twitter">TW</a>
                <a href="#" aria-label="Instagram">IG</a>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default Help;
