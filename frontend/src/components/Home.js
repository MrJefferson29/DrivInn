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
            </div>
            <div className="inspiration-grid">
              <div className="inspiration-item large">
                <img src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc12?w=600&h=400&fit=crop" alt="New York" loading="lazy" />
                <div className="inspiration-content">
                  <h3>New York</h3>
                  <p>United States</p>
                </div>
              </div>
              <div className="inspiration-item">
                <img src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=300&h=200&fit=crop" alt="London" loading="lazy" />
                <div className="inspiration-content">
                  <h3>London</h3>
                  <p>United Kingdom</p>
                </div>
              </div>
              <div className="inspiration-item">
                <img src="https://images.unsplash.com/photo-1502602898534-47d22c0d8060?w=300&h=200&fit=crop" alt="Paris" loading="lazy" />
                <div className="inspiration-content">
                  <h3>Paris</h3>
                  <p>France</p>
                </div>
              </div>
              <div className="inspiration-item">
                <img src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=300&h=200&fit=crop" alt="Venice" loading="lazy" />
                <div className="inspiration-content">
                  <h3>Venice</h3>
                  <p>Italy</p>
                </div>
              </div>
              <div className="inspiration-item">
                <img src="https://images.unsplash.com/photo-1548013146-72479768bada?w=300&h=200&fit=crop" alt="Tokyo" loading="lazy" />
                <div className="inspiration-content">
                  <h3>Tokyo</h3>
                  <p>Japan</p>
                </div>
              </div>
            </div>
          </Container>
        </section>

      {/* Live Anywhere Section */}
        <section className="live-anywhere-section">
          <Container fluid>
            <div className="section-header">
              <h2 className="section-title">Live anywhere</h2>
              <Button variant="link" className="see-all-btn">
                See all <FaArrowRight />
              </Button>
            </div>
            <div className="live-anywhere-grid">
              <div className="live-anywhere-item">
                <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=300&h=200&fit=crop" alt="Outdoor getaways" loading="lazy" />
                <h3>Outdoor getaways</h3>
              </div>
              <div className="live-anywhere-item">
                <img src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=300&h=200&fit=crop" alt="Unique stays" loading="lazy" />
                <h3>Unique stays</h3>
              </div>
              <div className="live-anywhere-item">
                <img src="https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=200&fit=crop" alt="Entire homes" loading="lazy" />
                <h3>Entire homes</h3>
              </div>
              <div className="live-anywhere-item">
                <img src="https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=300&h=200&fit=crop" alt="Pets allowed" loading="lazy" />
                <h3>Pets allowed</h3>
              </div>
            </div>
          </Container>
        </section>

      {/* Host Section */}
        <section className="host-section">
          <Container fluid>
            <Row className="align-items-center">
              <Col lg={6}>
                <div className="host-content">
                  <h2>Become a Host</h2>
                  <p>Share your space to let us build that to the world.</p>
                  <Button variant="outline-dark" size="lg" className="host-btn" onClick={() => navigate('/become-a-host-info')}>
                    Learn more
                  </Button>
                </div>
              </Col>
              <Col lg={6}>
                <div className="host-image">
                  <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop" alt="Become a Host" loading="lazy" />
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
            </div>
            <div className="discover-grid">
              <div className="discover-item">
                <img src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc12?w=400&h=300&fit=crop" alt="Experiences" loading="lazy" />
                <div className="discover-content">
                  <h3>Experiences</h3>
                  <p>Find unforgettable activities near you.</p>
                  <Button variant="link" className="discover-btn">
                    Learn more <FaArrowRight />
                  </Button>
                </div>
              </div>
              <div className="discover-item">
                <img src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&h=300&fit=crop" alt="Online Experiences" loading="lazy" />
                <div className="discover-content">
                  <h3>Online Experiences</h3>
                  <p>Interactive activities you can do together online.</p>
                  <Button variant="link" className="discover-btn">
                    Learn more <FaArrowRight />
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
              <h2>Trusted by travelers worldwide</h2>
              <div className="trust-stats">
                <div className="trust-stat">
                  <FaAward className="trust-icon" />
                  <h3>4.8</h3>
                  <p>Average rating</p>
                </div>
                <div className="trust-stat">
                  <FaCheckCircle className="trust-icon" />
                  <h3>2M+</h3>
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