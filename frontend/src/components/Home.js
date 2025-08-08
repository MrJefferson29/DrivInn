import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Container, Row, Col, Card, Button, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useListings } from '../context/ListingsContext';
import { FiltersProvider } from '../context/FiltersContext';
import FiltersBar from './FiltersBar';
import ListingsGrid from './ListingsGrid';
import NearbyListings from './listings/NearbyListings';
import LatestListings from './listings/LatestListings';
import RecommendedListings from './listings/RecommendedListings';
import MostVisitedApartments from './listings/MostVisitedApartments';
import MostBookedCars from './listings/MostBookedCars';
import { 
  FaHome, 
  FaCar, 
  FaStar, 
  FaMapMarkerAlt, 
  FaSearch,
  FaHeart,
  FaShare,
  FaFilter,
  FaCalendarAlt,
  FaUsers,
  FaShieldAlt,
  FaGlobe,
  FaChevronRight,
  FaChevronLeft,
  FaPlay,
  FaAward,
  FaCheckCircle,
  FaArrowRight,
  FaEye,
  FaBookmark,
  FaClock,
  FaMapPin,
  FaPhone,
  FaEnvelope,
  FaInstagram,
  FaTwitter,
  FaFacebook,
  FaBed,
  FaBath,
  FaWifi,
  FaParking,
  FaSnowflake,
  FaFire,
  FaUtensils,
  FaSwimmingPool,
  FaDumbbell,
  FaDog,
  FaBaby,
  FaWheelchair,
  FaSmoking,
  FaSmokingBan
} from 'react-icons/fa';
import './Home.css';

const Home = () => {
  console.log('Home component is rendering');
  
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { listings, loading, error } = useListings();
  const [isVisible, setIsVisible] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const observerRef = useRef();
  const scrollTopRef = useRef();

  // Scroll handling
  useEffect(() => {
    const handleScroll = () => {
      const position = window.scrollY;
      setScrollPosition(position);
      setIsScrolled(position > 100);
      setShowScrollTop(position > 500);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Loading component
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner">
            <Spinner animation="border" variant="primary" />
          </div>
          <h3>Loading amazing experiences...</h3>
          <p>Discovering the best places and rides for you</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`home-page ${isVisible ? 'visible' : ''}`}>
      {/* Hero Section - Only for unauthenticated users */}
      {!isAuthenticated && (
        <section className="hero-section">
          <div className="hero-background">
            <div className="hero-overlay"></div>
          </div>
          <div className="hero-content" style={{ position: 'relative', zIndex: 3, textAlign: 'center', width: '100%' }}>
            <h1 className="hero-title">Find your next adventure</h1>
            <h3 className="hero-subtitle" style={{ color: 'var(--color-surface)', fontWeight: 400, marginBottom: 32, fontSize: '1.6rem', textShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
              Discover unique stays and experiences around the world.
            </h3>
            <Button variant="light" size="lg" className="hero-search-btn" style={{ background: 'var(--color-surface)', color: 'var(--color-primary)', fontWeight: 700, border: 'none', borderRadius: 40, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
              <FaSearch style={{ marginRight: 8 }} /> Start your adventure
                  </Button>
                </div>
        </section>
      )}

      {/* New Filters Bar */}
      <FiltersBar />

      {/* Recommended Listings (filtered by context) */}
          <RecommendedListings />

      {/* Other sections remain unchanged */}

          <NearbyListings />
          <LatestListings />
          <MostVisitedApartments />
          <MostBookedCars />
      {/* Inspiration Section */}
        <section className="inspiration-section">
          <Container fluid>
            <div className="section-header">
              <h2 className="section-title">Inspiration for your next trip</h2>
              <p className="section-subtitle">Discover amazing destinations across the United States</p>
            </div>
            <div className="inspiration-grid">
              <div className="inspiration-item large">
                <img src="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop" alt="New York City" loading="lazy" />
                <div className="inspiration-content">
                  <h3>New York City</h3>
                  <p>New York, USA</p>
                  <span className="inspiration-badge">Trending</span>
                </div>
              </div>
              <div className="inspiration-item">
                <img src="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=300&h=200&fit=crop" alt="San Francisco" loading="lazy" />
                <div className="inspiration-content">
                  <h3>San Francisco</h3>
                  <p>California, USA</p>
                </div>
              </div>
              <div className="inspiration-item">
                <img src="https://images.unsplash.com/photo-1514565131-fce0801e5785?w=300&h=200&fit=crop" alt="Miami Beach" loading="lazy" />
                <div className="inspiration-content">
                  <h3>Miami Beach</h3>
                  <p>Florida, USA</p>
                </div>
              </div>
              <div className="inspiration-item">
                <img src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=200&fit=crop" alt="Los Angeles" loading="lazy" />
                <div className="inspiration-content">
                  <h3>Los Angeles</h3>
                  <p>California, USA</p>
                </div>
              </div>
              <div className="inspiration-item">
                <img src="https://images.unsplash.com/photo-1502602898534-47d22c0d8060?w=300&h=200&fit=crop" alt="Chicago" loading="lazy" />
                <div className="inspiration-content">
                  <h3>Chicago</h3>
                  <p>Illinois, USA</p>
                </div>
              </div>
            </div>
          </Container>
        </section>

      {/* Live Anywhere Section */}
        <section className="live-anywhere-section">
          <Container fluid>
            <div className="section-header">
              <h2 className="section-title">Live anywhere in the USA</h2>
              <Button variant="link" className="see-all-btn">
                See all <FaArrowRight />
              </Button>
            </div>
            <div className="live-anywhere-grid">
              <div className="live-anywhere-item">
                <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&h=200&fit=crop" alt="Mountain Getaways" loading="lazy" />
                <div className="live-anywhere-content">
                  <h3>Mountain Getaways</h3>
                  <p>Colorado Rockies</p>
                </div>
              </div>
              <div className="live-anywhere-item">
                <img src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&h=200&fit=crop" alt="Beach Houses" loading="lazy" />
                <div className="live-anywhere-content">
                  <h3>Beach Houses</h3>
                  <p>California Coast</p>
                </div>
              </div>
              <div className="live-anywhere-item">
                <img src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=200&fit=crop" alt="City Apartments" loading="lazy" />
                <div className="live-anywhere-content">
                  <h3>City Apartments</h3>
                  <p>Urban Centers</p>
                </div>
              </div>
              <div className="live-anywhere-item">
                <img src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=300&h=200&fit=crop" alt="Pet-Friendly" loading="lazy" />
                <div className="live-anywhere-content">
                  <h3>Pet-Friendly</h3>
                  <p>Nationwide</p>
                </div>
              </div>
            </div>
          </Container>
        </section>

      {/* Host Section */}
        <section className="host-section">
          <Container fluid>
            <Row className="align-items-center">
              <Col lg={6} className="host-content-col">
                <div className="host-content">
                  <h2>Become a Host</h2>
                  <p>Share your space and earn extra income. Join thousands of successful hosts across the United States.</p>
                  <div className="host-stats">
                    <div className="host-stat">
                      <h4>$2,000+</h4>
                      <p>Average monthly earnings</p>
                    </div>
                    <div className="host-stat">
                      <h4>24/7</h4>
                      <p>Support available</p>
                    </div>
                  </div>
                  <Button variant="outline-dark" size="lg" className="host-btn" onClick={() => navigate('/become-a-host-info')}>
                    Learn more
                  </Button>
                </div>
              </Col>
              <Col lg={6}>
                <div className="host-image">
                  <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop" alt="Become a Host" loading="lazy" />
                  <div className="host-overlay">
                    <div className="host-overlay-content">
                      <h3>Become a Host</h3>
                      <p>Share your space and earn extra income. Join thousands of successful hosts across the United States.</p>
                      <div className="host-overlay-stats">
                        <div className="host-overlay-stat">
                          <h4>$2,000+</h4>
                          <p>Average monthly earnings</p>
                        </div>
                        <div className="host-overlay-stat">
                          <h4>24/7</h4>
                          <p>Support available</p>
                        </div>
                      </div>
                      <Button variant="light" size="lg" className="host-overlay-btn">
                        Learn more
                      </Button>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </Container>
        </section>

      {/* Discover Section */}
        <section className="discover-section">
          <Container fluid>
            <div className="section-header">
              <h2 className="section-title">Discover things to do</h2>
              <p className="section-subtitle">Unique experiences across America</p>
            </div>
            <div className="discover-grid">
              <div className="discover-item">
                <img src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop" alt="Local Experiences" loading="lazy" />
                <div className="discover-content">
                  <h3>Local Experiences</h3>
                  <p>Discover authentic experiences led by local hosts across the United States.</p>
                  <div className="discover-features">
                    <span className="discover-feature">Food Tours</span>
                    <span className="discover-feature">City Walks</span>
                    <span className="discover-feature">Art Classes</span>
                  </div>
                  <Button variant="link" className="discover-btn">
                    Explore experiences <FaArrowRight />
                  </Button>
                </div>
              </div>
              <div className="discover-item">
                <img src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop" alt="Virtual Experiences" loading="lazy" />
                <div className="discover-content">
                  <h3>Virtual Experiences</h3>
                  <p>Connect with hosts from anywhere in the world through interactive online experiences.</p>
                  <div className="discover-features">
                    <span className="discover-feature">Cooking Classes</span>
                    <span className="discover-feature">Music Sessions</span>
                    <span className="discover-feature">Fitness Training</span>
                  </div>
                  <Button variant="link" className="discover-btn">
                    Join online <FaArrowRight />
                  </Button>
                </div>
              </div>
            </div>
          </Container>
        </section>

      {/* Trust Section */}
        <section className="trust-section">
          <Container fluid>
            <div className="trust-content">
              <h2>Trusted by travelers across America</h2>
              <div className="trust-stats">
                <div className="trust-stat">
                  <FaAward className="trust-icon" />
                  <h3>4.9</h3>
                  <p>Average rating</p>
                </div>
                <div className="trust-stat">
                  <FaCheckCircle className="trust-icon" />
                  <h3>500K+</h3>
                  <p>Happy guests</p>
                </div>
                <div className="trust-stat">
                  <FaShieldAlt className="trust-icon" />
                  <h3>100%</h3>
                  <p>Verified hosts</p>
                </div>
              </div>
            </div>
          </Container>
        </section>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button 
          ref={scrollTopRef}
          className="scroll-top-btn"
          onClick={scrollToTop}
          aria-label="Scroll to top"
        >
          <FaChevronRight />
        </button>
      )}

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
                  <li><FaGlobe /> About Us</li>
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

export default Home; 