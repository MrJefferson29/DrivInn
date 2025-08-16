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
  FaSmokingBan,
  FaMoneyBillWave
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
          <div className="hero-content">
            <h1 className="hero-title">Find your next adventure</h1>
            <h3 className="hero-subtitle">
              Discover unique stays and experiences around the world.
            </h3>
            <Button variant="light" size="lg" className="hero-search-btn">
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
              <img src="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800&h=600&fit=crop&crop=center" alt="New York City" loading="lazy" />
              <div className="inspiration-content">
                <h3>New York City</h3>
                <p>New York, USA</p>
              </div>
            </div>
            <div className="inspiration-item">
              <img src="https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop&crop=center" alt="San Francisco" loading="lazy" />
              <div className="inspiration-content">
                <h3>San Francisco</h3>
                <p>California, USA</p>
              </div>
            </div>
            <div className="inspiration-item">
              <img src="https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=400&h=300&fit=crop&crop=center" alt="Los Angeles" loading="lazy" />
              <div className="inspiration-content">
                <h3>Los Angeles</h3>
                <p>California, USA</p>
              </div>
            </div>
            <div className="inspiration-item">
              <img src="https://images.unsplash.com/photo-1565967511849-76a60a516170?w=400&h=300&fit=crop&crop=center" alt="Miami" loading="lazy" />
              <div className="inspiration-content">
                <h3>Miami</h3>
                <p>Florida, USA</p>
              </div>
            </div>
            <div className="inspiration-item">
              <img src="https://images.unsplash.com/photo-1502602898534-47d22c0d8060?w=400&h=300&fit=crop&crop=center" alt="Chicago" loading="lazy" />
              <div className="inspiration-content">
                <h3>Chicago</h3>
                <p>Illinois, USA</p>
              </div>
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
                <p>Share your space and create unforgettable experiences for travelers around the world. Whether you have a cozy apartment, a unique car, or a special place to stay, you can turn your property into a source of income while connecting with amazing people.</p>
                <div className="host-benefits">
                  <div className="benefit-item">
                    <FaMoneyBillWave className="benefit-icon" />
                    <div>
                      <h4>Earn Extra Income</h4>
                      <p>Turn your space into a profitable venture with flexible hosting options</p>
                    </div>
                  </div>
                  <div className="benefit-item">
                    <FaShieldAlt className="benefit-icon" />
                    <div>
                      <h4>Safe & Secure</h4>
                      <p>Our platform provides comprehensive protection and support for all hosts</p>
                    </div>
                  </div>
                </div>
                <Button variant="outline-dark" size="lg" className="host-btn" onClick={() => navigate('/become-a-host-info')}>
                  Learn more
                </Button>
              </div>
            </Col>
            <Col lg={6}>
              <div className="host-image">
                <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&crop=center" alt="Become a Host" loading="lazy" />
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
              <div className="discover-category-badge">Adventure</div>
              <img src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=450&fit=crop&crop=center" alt="Outdoor Adventures" loading="lazy" />
              <div className="discover-content">
                <h3>Outdoor Adventures</h3>
                <p>Explore nature trails, hiking, and outdoor activities near you.</p>
                <Button variant="link" className="discover-btn">
                  Learn more <FaArrowRight />
                </Button>
              </div>
            </div>
            <div className="discover-item">
              <div className="discover-category-badge">Culture</div>
              <img src="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=600&h=450&fit=crop&crop=center" alt="Cultural Experiences" loading="lazy" />
              <div className="discover-content">
                <h3>Cultural Experiences</h3>
                <p>Immerse yourself in local culture, art, and traditions.</p>
                <Button variant="link" className="discover-btn">
                  Learn more <FaArrowRight />
                </Button>
              </div>
            </div>
            <div className="discover-item">
              <div className="discover-category-badge">Food</div>
              <img src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc12?w=600&h=450&fit=crop&crop=center" alt="Food & Dining" loading="lazy" />
              <div className="discover-content">
                <h3>Food & Dining</h3>
                <p>Discover local cuisine, cooking classes, and food tours.</p>
                <Button variant="link" className="discover-btn">
                  Learn more <FaArrowRight />
                </Button>
              </div>
            </div>
            <div className="discover-item">
              <div className="discover-category-badge">Water</div>
              <img src="https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600&h=450&fit=crop&crop=center" alt="Water Activities" loading="lazy" />
              <div className="discover-content">
                <h3>Water Activities</h3>
                <p>Swimming, boating, fishing, and water sports adventures.</p>
                <Button variant="link" className="discover-btn">
                  Learn more <FaArrowRight />
                </Button>
              </div>
            </div>
            <div className="discover-item">
              <div className="discover-category-badge">Wellness</div>
              <img src="https://images.unsplash.com/photo-1548013146-72479768bada?w=600&h=450&fit=crop&crop=center" alt="Wellness & Spa" loading="lazy" />
              <div className="discover-content">
                <h3>Wellness & Spa</h3>
                <p>Relaxation, yoga, meditation, and wellness retreats.</p>
                <Button variant="link" className="discover-btn">
                  Learn more <FaArrowRight />
                </Button>
              </div>
            </div>
            <div className="discover-item">
              <div className="discover-category-badge">Tours</div>
              <img src="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=450&fit=crop&crop=center" alt="City Tours" loading="lazy" />
              <div className="discover-content">
                <h3>City Tours</h3>
                <p>Guided tours, historical sites, and urban exploration.</p>
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