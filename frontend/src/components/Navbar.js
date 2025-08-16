import React, { useState, useRef, useEffect } from 'react';
import { Navbar, Nav, Container, Button, Dropdown, Badge, Modal } from 'react-bootstrap';
import { 
  MdTravelExplore,
  MdEmojiEvents,
  MdHome,
  MdFavorite,
  MdMenu,
  MdPerson,
  MdLogin,
  MdPersonAdd,
  MdSettings,
  MdLogout,
  MdNotifications,
  MdCalendarMonth,
  MdCardGiftcard,
  MdHelp,
  MdBookmark,
  MdAdminPanelSettings,
  MdAddCircle,
  MdExplore,
  MdShield,
  MdInfo,
  MdPhone,
  MdEmail,
  MdLanguage,
  MdMessage,
  MdDashboard
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { useListings } from '../context/ListingsContext';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import styled from 'styled-components';
import { hostApplicationsAPI } from '../services/api';

const NavbarComponent = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [pendingHostApps, setPendingHostApps] = useState(0);
  const [stripeConnectAccount, setStripeConnectAccount] = useState(null);
  const [isLoadingStripeAccount, setIsLoadingStripeAccount] = useState(false);
  const [showDashboardModal, setShowDashboardModal] = useState(false);
  const [dashboardModalUrl, setDashboardModalUrl] = useState('');

  const { user, isAuthenticated, logout, isAdmin } = useAuth();
  const { favorites } = useListings();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setShowNotifications(false);
        setShowLanguageMenu(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  useEffect(() => {
    if (isAdmin) {
      hostApplicationsAPI.list('pending').then(res => setPendingHostApps(res.data.length)).catch(() => setPendingHostApps(0));
    }
  }, [isAdmin]);

  // Fetch Stripe Connect account information for hosts
  useEffect(() => {
    if (user?.role === 'host' && isAuthenticated) {
      setIsLoadingStripeAccount(true);
      hostApplicationsAPI.getStripeSetupStatus()
        .then(res => {
          if (res.data && res.data.accountId && (res.data.onboardingUrl || res.data.dashboardUrl)) {
            // Prefer onboarding URL over dashboard URL for better user experience
            setStripeConnectAccount({
              accountId: res.data.accountId,
              dashboardUrl: res.data.onboardingUrl || res.data.dashboardUrl,
              isOnboardingLink: !!res.data.onboardingUrl
            });
          } else {
            console.log('Stripe Connect account not fully configured');
            setStripeConnectAccount(null);
          }
        })
        .catch(err => {
          console.log('Could not fetch Stripe Connect account info:', err);
          setStripeConnectAccount(null);
        })
        .finally(() => {
          setIsLoadingStripeAccount(false);
        });
    }
  }, [user?.role, isAuthenticated]);

  const handleLogout = () => {
    logout();
  };

  const handleDashboardClick = (e, dashboardUrl) => {
    e.preventDefault();
    
    // Try to open the dashboard in a new tab
    try {
      const newWindow = window.open(dashboardUrl, '_blank', 'noopener,noreferrer');
      
      // Check if the window was blocked
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        // If popup was blocked, show modal with copyable URL
        setDashboardModalUrl(dashboardUrl);
        setShowDashboardModal(true);
      }
      
      // Set a timeout to check if the dashboard loads successfully
      setTimeout(() => {
        if (newWindow && !newWindow.closed) {
          try {
            // Try to access the window to see if it loaded
            if (newWindow.location.href.includes('stripe.com')) {
              console.log('Dashboard opened successfully');
            }
          } catch (error) {
            // If we can't access the window due to CORS, that's normal
            console.log('Dashboard window opened (CORS prevents status check)');
          }
        }
      }, 2000);
      
    } catch (error) {
      console.error('Error opening dashboard:', error);
      // Fallback: show modal with copyable URL
      setDashboardModalUrl(dashboardUrl);
      setShowDashboardModal(true);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here if you want
      console.log('URL copied to clipboard');
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      console.log('URL copied to clipboard (fallback method)');
    }
  };

  const getFavoritesCount = () => {
    return favorites ? favorites.length : 0;
  };

  // Notifications click handler for admin
  const handleNotificationsClick = () => {
    if (isAdmin) {
      navigate('/notifications');
    } else {
      navigate('/notifications');
    }
  };

  // Render the main action button based on user status and role (desktop only)
  const renderMainActionButton = () => {
    if (!isAuthenticated) {
      return (
        <Nav.Link as={Link} to="/login" className="host-link desktop-only">
          <MdLogin /> Log in
        </Nav.Link>
      );
    }

    if (user?.role === 'admin') {
      return (
        <Nav.Link as={Link} to="/admin/host-applications" className="host-link desktop-only">
          <MdAdminPanelSettings /> Admin Panel
          {pendingHostApps > 0 && (
            <Badge bg="danger" className="notification-badge" style={{ marginLeft: '8px' }}>
              {pendingHostApps}
            </Badge>
          )}
        </Nav.Link>
      );
    }

    if (user?.role === 'host') {
      if (isLoadingStripeAccount) {
        return (
          <Nav.Link className="host-link desktop-only" style={{ opacity: 0.7 }}>
            <MdDashboard /> Loading...
          </Nav.Link>
        );
             } else if (stripeConnectAccount?.dashboardUrl) {
         return (
                         <Nav.Link 
                href={stripeConnectAccount.dashboardUrl} 
                onClick={(e) => handleDashboardClick(e, stripeConnectAccount.dashboardUrl)}
                className="host-link desktop-only dashboard-link"
              >
                                 <MdDashboard /> Dashboard
              </Nav.Link>
         );
             } else {
         return (
           <div className="host-link desktop-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
             <Nav.Link as={Link} to="/listings" style={{ margin: 0 }}>
               <MdHome /> My Listings
             </Nav.Link>
                           <span 
                className="setup-required"
                title="Your Stripe Connect account needs to be fully verified to access the Dashboard. This includes completing identity verification, bank account setup, and business verification. Once verified, you'll get access to your Stripe dashboard."
              >
                ⚠️ Setup Required
              </span>
           </div>
         );
       }
    }

    // Default for guests
    return (
      <Nav.Link as={Link} to="/become-a-host-info" className="host-link desktop-only">
        <MdAddCircle /> Become a Host
      </Nav.Link>
    );
  };

  return (
    <>
      <ResponsiveNavbarWrapper>
        <Navbar 
          bg="white" 
          expand="lg" 
          className={`airbnb-navbar ${isScrolled ? 'scrolled' : ''}`} 
          fixed="top"
          style={{ height: '80px' }}
        >
          <Container fluid>
            {/* Logo */}
            <Navbar.Brand href="/" className="navbar-brand">
              <svg
                viewBox="0 0 1000 1000"
                role="img"
                aria-hidden="true"
                focusable="false"
                style={{
                  height: '32px',
                  width: '102px',
                  display: 'block',
                  fill: 'currentColor'
                }}
              >
                <path d="m499.3 736.7c-51-64-81-120.1-91-168.1-10-39-6-70.3 11-93.3 17-22.3 43.7-33.8 79.4-33.8 35.7 0 62.4 11.5 79.4 33.8 17 23 21 54.3 11 93.3-11 49.1-40.1 105.1-91 168.1zm362.2 43c-7 47.2-30.5 98.2-70.3 153.3-37.1 52.3-84.1 93.6-139.3 123.7-54.1 29.4-113.4 44.3-175.8 44.3-61.6 0-120.1-15.6-172.2-44.3-56.5-30.7-104.7-72.4-142.6-125.2-37.1-52.3-60.6-103.3-70.3-150.6-9.8-47.8-13.2-98.2-9.8-151.6 3.4-53.4 11.8-102.5 25.2-147.1 13.4-44.6 33.3-85.1 59.4-121.1 26.7-36.6 57.4-64.1 93.4-82.2 35.1-17.6 75.4-26.8 121.4-26.8 46.6 0 86.9 9.3 122.9 27.1 35.1 17.8 65.1 44.7 90.4 80.7 25.9 36.7 45.8 77.4 59.7 122.4 13.9 44.3 21.7 93.2 23.2 146.9 1.7 53.4-2.3 104.4-11.8 153.1z"></path>
              </svg>
            </Navbar.Brand>

            {/* Navigation Links */}
            <Nav className="navbar-nav me-auto">
              <Nav.Link as={Link} to="/" className="nav-link">
                <MdTravelExplore /> Explore
              </Nav.Link>
              <Nav.Link as={Link} to="/messages" className="nav-link">
                <MdMessage /> Messages
              </Nav.Link>
              <Nav.Link as={Link} to="/experiences" className="nav-link">
                <MdEmojiEvents /> Experiences
              </Nav.Link>
              <Nav.Link as={Link} to="/about" className="nav-link">
                <MdInfo /> About
              </Nav.Link>
              <Nav.Link as={Link} to="/contact" className="nav-link">
                <MdPhone /> Contact
              </Nav.Link>
            </Nav>

            {/* Right Side Menu */}
            <div className="navbar-right">
              {/* Favorites - Only show for authenticated users */}
              {isAuthenticated && (
                <Nav.Link as={Link} to="/liked-listings" className="favorites-link">
                  <MdFavorite />
                  {getFavoritesCount() > 0 && (
                    <Badge bg="danger" className="favorites-badge">
                      {getFavoritesCount()}
                    </Badge>
                  )}
                </Nav.Link>
              )}

              {/* Main Action Button - Dynamic based on user status and role (desktop only) */}
              {renderMainActionButton()}

              {/* Language/Globe */}
              <div className="globe-container">
                <MdLanguage className="globe-icon" />
              </div>

              {/* Notifications (if logged in) */}
              {isAuthenticated && (
                <div className="notifications-container" onClick={handleNotificationsClick} style={{ cursor: isAdmin ? 'pointer' : 'default', position: 'relative' }}>
                  <MdNotifications className="notifications-icon" />
                  {isAdmin && pendingHostApps > 0 && (
                    <Badge bg="danger" className="notification-badge" style={{ position: 'absolute', top: -6, right: -6 }}>{pendingHostApps}</Badge>
                  )}
                  {!isAdmin && user?.notifications > 0 && (
                    <Badge bg="danger" className="notification-badge">
                      {user.notifications}
                    </Badge>
                  )}
                </div>
              )}

              {/* User Menu */}
              <div className="user-menu-container">
                {isAuthenticated ? (
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="light" className="user-menu-toggle">
                      <div className="user-menu-content">
                        <MdMenu className="menu-icon" />
                        <div className="user-avatar">
                          {user?.profileImage ? (
                            <img src={user.profileImage} alt={`${user.firstName} ${user.lastName}`} />
                          ) : (
                            <MdPerson />
                          )}
                        </div>
                      </div>
                    </Dropdown.Toggle>

                    <Dropdown.Menu container={document.body} className="user-dropdown-menu">
                      <Dropdown.Item as={Link} to="/profile">
                        <MdPerson /> Profile
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/bookings">
                        <MdCalendarMonth /> My Bookings
                      </Dropdown.Item>
                      {user?.role === 'host' && (
                        isLoadingStripeAccount ? (
                          <Dropdown.Item disabled>
                            <MdDashboard /> Loading Dashboard...
                          </Dropdown.Item>
                                                 ) : stripeConnectAccount?.dashboardUrl ? (
                                                       <Dropdown.Item 
                              href={stripeConnectAccount.dashboardUrl} 
                              onClick={(e) => handleDashboardClick(e, stripeConnectAccount.dashboardUrl)}
                            >
                              <MdDashboard /> Dashboard
                            </Dropdown.Item>
                                                 ) : (
                           <>
                             <Dropdown.Item as={Link} to="/listings">
                               <MdHome /> My Listings
                             </Dropdown.Item>
                             <Dropdown.Item as={Link} to="/become-a-host-info" style={{ fontSize: '0.9rem', color: '#666' }}>
                               <MdInfo /> Complete Stripe Setup
                             </Dropdown.Item>
                           </>
                         )
                      )}
                      {(user?.role === 'host' || user?.role === 'admin') && (
                        <Dropdown.Item as={Link} to="/create-listing">
                          <MdAddCircle /> Create Listing
                        </Dropdown.Item>
                      )}
                      {user?.role === 'admin' && (
                        <Dropdown.Item as={Link} to="/admin/host-applications" className="admin-panel-link">
                          <MdAdminPanelSettings /> Admin Panel
                          {pendingHostApps > 0 && (
                            <Badge bg="danger" className="dropdown-badge">
                              {pendingHostApps}
                            </Badge>
                          )}
                        </Dropdown.Item>
                      )}
                      {!isAuthenticated && (
                        <Dropdown.Item as={Link} to="/login">
                          <MdLogin /> Log in
                        </Dropdown.Item>
                      )}
                      {user?.role === 'guest' && (
                        <Dropdown.Item as={Link} to="/become-a-host-info">
                          <MdAddCircle /> Become a Host
                        </Dropdown.Item>
                      )}
                      <Dropdown.Item as={Link} to="/settings">
                        <MdSettings /> Settings
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/help">
                        <MdHelp /> Help
                      </Dropdown.Item>
                      <Dropdown.Item onClick={handleLogout}>
                        <MdLogout /> Logout
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                ) : (
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="light" className="user-menu-toggle">
                      <div className="user-menu-content">
                        <MdMenu className="menu-icon" />
                        <MdPerson className="user-icon" />
                      </div>
                    </Dropdown.Toggle>

                    <Dropdown.Menu container={document.body} className="user-dropdown-menu">
                      <Dropdown.Item as={Link} to="/login">
                        <MdLogin /> Sign in
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/register">
                        <MdPersonAdd /> Sign up
                      </Dropdown.Item>
                      <Dropdown.Divider />
                      <Dropdown.Item as={Link} to="/host">
                        <MdHome /> Host your home
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/help">
                        <MdHelp /> Help
                      </Dropdown.Item>
                      <Dropdown.Item as={Link} to="/gift">
                        <MdCardGiftcard /> Gift cards
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown>
                )}
              </div>
            </div>
          </Container>
                 </Navbar>
       </ResponsiveNavbarWrapper>

               {/* Dashboard URL Modal */}
        <Modal show={showDashboardModal} onHide={() => setShowDashboardModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>
              <MdDashboard style={{ marginRight: '8px' }} />
                             Dashboard Access
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Your Stripe Connect dashboard couldn't be opened automatically. Please use one of these options:
            </p>
           
           <div style={{ marginBottom: '20px' }}>
             <Button 
               variant="primary" 
               onClick={() => window.open(dashboardModalUrl, '_blank', 'noopener,noreferrer')}
               style={{ marginRight: '10px' }}
             >
               <MdDashboard /> Try Opening Again
             </Button>
             
             <Button 
               variant="outline-secondary" 
               onClick={() => copyToClipboard(dashboardModalUrl)}
             >
               📋 Copy URL
             </Button>
           </div>
           
           <div style={{ 
             backgroundColor: '#f8f9fa', 
             padding: '15px', 
             borderRadius: '8px',
             border: '1px solid #dee2e6'
           }}>
             <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>
               Dashboard URL:
             </label>
             <input
               type="text"
               value={dashboardModalUrl}
               readOnly
               style={{
                 width: '100%',
                 padding: '8px',
                 border: '1px solid #ced4da',
                 borderRadius: '4px',
                 backgroundColor: 'white',
                 fontFamily: 'monospace',
                 fontSize: '12px'
               }}
               onClick={(e) => e.target.select()}
             />
           </div>
           
                       <div style={{ marginTop: '15px', fontSize: '14px', color: '#6c757d' }}>
              <p><strong>Note:</strong> If you continue to have issues accessing your dashboard, please:</p>
              <ul style={{ marginBottom: '0', paddingLeft: '20px' }}>
                <li>Complete your Stripe Connect account verification</li>
                <li>Ensure your bank account is properly linked</li>
                <li>Contact support if the issue persists</li>
              </ul>
            </div>
         </Modal.Body>
         <Modal.Footer>
           <Button variant="secondary" onClick={() => setShowDashboardModal(false)}>
             Close
           </Button>
         </Modal.Footer>
       </Modal>
     </>
   );
 };

const ResponsiveNavbarWrapper = styled.div`
  .airbnb-navbar {
    background: var(--color-surface) !important;
    color: var(--color-text) !important;
    border-bottom: 1.5px solid var(--color-border);
  }

  .dashboard-link {
    color: var(--color-primary) !important;
    font-weight: 600;
    transition: all 0.3s ease;
    
    &:hover {
      color: var(--color-primary-dark) !important;
      transform: translateY(-1px);
    }
  }

  .host-link {
    .setup-required {
      font-size: 0.8rem;
      color: #666;
      cursor: help;
      border-bottom: 1px dotted #666;
      transition: color 0.3s ease;
      
      &:hover {
        color: #333;
      }
    }
  }

  // Modal styling
  .modal-content {
    border-radius: 12px;
    border: none;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  }

  .modal-header {
    border-bottom: 1px solid #e9ecef;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 12px 12px 0 0;
  }

  .modal-title {
    color: #333;
    font-weight: 600;
  }

  .modal-body {
    padding: 24px;
  }

  .modal-footer {
    border-top: 1px solid #e9ecef;
    padding: 16px 24px;
  }
`;

export default NavbarComponent; 