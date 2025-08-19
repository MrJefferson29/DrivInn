import React from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
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
  FaInstagram
} from 'react-icons/fa';
import './About.css';

const About = () => {
  const stats = [
    { number: '10K+', label: 'Happy Users', icon: <FaSmile /> },
    { number: '50+', label: 'Cities Covered', icon: <FaMapMarkerAlt /> },
    { number: '99%', label: 'Satisfaction Rate', icon: <FaStar /> },
    { number: '24/7', label: 'Support', icon: <FaHeadset /> }
  ];

  const features = [
    {
      icon: <FaHome />,
      title: 'Unique Accommodations',
      description: 'Discover handpicked homes, apartments, and unique stays that offer authentic local experiences.',
      color: '#FF385C'
    },
    {
      icon: <FaCar />,
      title: 'Premium Car Rentals',
      description: 'Access a diverse fleet of vehicles from economy to luxury, perfect for any journey.',
      color: '#00A699'
    },
    {
      icon: <FaShieldAlt />,
      title: 'Trusted & Secure',
      description: 'Advanced security measures, verified hosts, and comprehensive insurance coverage.',
      color: '#484848'
    },
    {
      icon: <FaGlobe />,
      title: 'Global Community',
      description: 'Connect with hosts and travelers from around the world in a vibrant community.',
      color: '#767676'
    }
  ];

  const values = [
    {
      icon: <FaHeart />,
      title: 'Passion for Travel',
      description: 'We believe everyone deserves to experience the world authentically and affordably.'
    },
    {
      icon: <FaHandshake />,
      title: 'Trust & Safety',
      description: 'Building lasting relationships through transparency, security, and mutual respect.'
    },
    {
      icon: <FaLeaf />,
      title: 'Sustainability',
      description: 'Promoting responsible tourism and supporting local communities worldwide.'
    },
    {
      icon: <FaRocket />,
      title: 'Innovation',
      description: 'Continuously improving our platform to provide the best user experience possible.'
    }
  ];

  const team = [
    {
      name: 'Sarah Chen',
      role: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face',
      bio: 'Former hospitality executive with 15+ years experience in creating exceptional guest experiences.'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'CTO',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      bio: 'Tech visionary with expertise in building scalable platforms and innovative solutions.'
    },
    {
      name: 'Priya Patel',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      bio: 'Operations expert dedicated to ensuring seamless experiences for hosts and guests.'
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <div className="hero-content">
                <Badge bg="light" text="dark" className="hero-badge">
                  <FaStar className="me-2" />
                  Trusted by 10,000+ Users
                </Badge>
                <h1 className="hero-title">About DrivInn</h1>
                <p className="hero-subtitle">
                  We're revolutionizing the way people travel and share their spaces. 
                  DrivInn connects adventurous travelers with unique accommodations and 
                  premium vehicles, creating unforgettable experiences worldwide.
                </p>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <Container>
          <Row className="justify-content-center">
            <Col lg={10}>
              <div className="mission-content text-center">
                <h2 className="section-title">Our Mission</h2>
                <p className="mission-text">
                  To democratize travel by making unique accommodations and premium vehicles 
                  accessible to everyone, while fostering meaningful connections between hosts 
                  and travelers across the globe.
                </p>
                <div className="mission-stats">
                  <Row>
                    {stats.map((stat, index) => (
                      <Col key={index} md={3} sm={6}>
                        <div className="stat-item">
                          <div className="stat-icon" style={{ color: features[index]?.color }}>
                            {stat.icon}
                          </div>
                          <div className="stat-number">{stat.number}</div>
                          <div className="stat-label">{stat.label}</div>
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

      {/* Features Section */}
      <section className="features-section">
        <Container>
          <h2 className="section-title text-center mb-5">What Makes Us Special</h2>
          <Row>
            {features.map((feature, index) => (
              <Col key={index} lg={3} md={6} className="mb-4">
                <Card className="feature-card h-100">
                  <Card.Body className="text-center">
                    <div className="feature-icon" style={{ color: feature.color }}>
                      {feature.icon}
                    </div>
                    <Card.Title className="feature-title">{feature.title}</Card.Title>
                    <Card.Text className="feature-description">
                      {feature.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Story Section */}
      <section className="story-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <div className="story-content">
                <h2 className="section-title">Our Story</h2>
                <p className="story-text">
                  DrivInn was born from a simple idea: travel should be more than just visiting 
                  places—it should be about experiencing them like a local. Founded in 2023, we 
                  started with a small team passionate about connecting people through authentic 
                  travel experiences.
                </p>
                <p className="story-text">
                  Today, we've grown into a global community of hosts and travelers, offering 
                  everything from cozy apartments in bustling cities to luxury cars for epic 
                  road trips. Our platform combines cutting-edge technology with human touch, 
                  ensuring every booking is secure, every stay is memorable, and every journey 
                  is extraordinary.
                </p>
                <div className="story-highlights">
                  <div className="highlight-item">
                    <FaCheckCircle className="highlight-icon" />
                    <span>Verified hosts and properties</span>
                  </div>
                  <div className="highlight-item">
                    <FaCheckCircle className="highlight-icon" />
                    <span>24/7 customer support</span>
                  </div>
                  <div className="highlight-item">
                    <FaCheckCircle className="highlight-icon" />
                    <span>Comprehensive insurance coverage</span>
                  </div>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="story-image">
                <img 
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop" 
                  alt="Team collaboration" 
                  className="img-fluid rounded"
                />
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <Container>
          <h2 className="section-title text-center mb-5">Our Core Values</h2>
          <Row>
            {values.map((value, index) => (
              <Col key={index} lg={3} md={6} className="mb-4">
                <Card className="value-card h-100">
                  <Card.Body className="text-center">
                    <div className="value-icon">
                      {value.icon}
                    </div>
                    <Card.Title className="value-title">{value.title}</Card.Title>
                    <Card.Text className="value-description">
                      {value.description}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <Container>
          <h2 className="section-title text-center mb-5">Meet Our Leadership</h2>
          <Row>
            {team.map((member, index) => (
              <Col key={index} lg={4} md={6} className="mb-4">
                <Card className="team-card h-100">
                  <div className="team-image-container">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="team-image"
                    />
                  </div>
                  <Card.Body className="text-center">
                    <Card.Title className="team-name">{member.name}</Card.Title>
                    <Badge bg="primary" className="team-role mb-3">
                      {member.role}
                    </Badge>
                    <Card.Text className="team-bio">
                      {member.bio}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* Technology Section */}
      <section className="tech-section">
        <Container>
          <Row className="align-items-center">
            <Col lg={6}>
              <div className="tech-image">
                <img 
                  src="https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400&fit=crop" 
                  alt="Technology platform" 
                  className="img-fluid rounded"
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="tech-content">
                <h2 className="section-title">Powered by Innovation</h2>
                <p className="tech-text">
                  Our platform leverages cutting-edge technology to provide seamless experiences 
                  for both hosts and travelers. From AI-powered matching algorithms to secure 
                  payment processing, we're constantly innovating to improve your journey.
                </p>
                <div className="tech-features">
                  <div className="tech-feature">
                    <FaMobile className="tech-icon" />
                    <span>Mobile-first responsive design</span>
                  </div>
                  <div className="tech-feature">
                    <FaLock className="tech-icon" />
                    <span>Bank-level security encryption</span>
                  </div>
                  <div className="tech-feature">
                    <FaChartLine className="tech-icon" />
                    <span>Real-time analytics and insights</span>
                  </div>
                  <div className="tech-feature">
                    <FaCreditCard className="tech-icon" />
                    <span>Seamless payment processing</span>
                  </div>
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
              <h2 className="cta-title">Ready to Start Your Journey?</h2>
              <p className="cta-text">
                Join thousands of travelers discovering unique experiences and hosts sharing 
                their world with the DrivInn community.
              </p>
              <div className="cta-buttons">
                <a href="/" className="btn btn-primary btn-lg me-3 cta-btn">
                  <FaHome className="me-2" />
                  Explore Stays
                </a>
                <a href="/experiences" className="btn btn-outline-primary btn-lg cta-btn">
                  <FaCar className="me-2" />
                  Rent a Car
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

export default About;
