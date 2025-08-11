import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, Alert, Spinner } from 'react-bootstrap';
import { 
  MdCalendarToday, 
  MdPerson, 
  MdAttachMoney, 
  MdCancel, 
  MdCheckCircle, 
  MdPending, 
  MdError,
  MdLocationOn,
  MdStar,
  MdAccessTime,
  MdInfo,
  MdHome,
  MdExplore
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI } from '../services/api';
import styled from 'styled-components';
import './UserBookings.css';

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  const { user } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingsAPI.getUserBookings();
      setBookings(response.data);
    } catch (err) {
      setError('Failed to load bookings. Please try again.');
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setCancelError(null);
    setShowCancelModal(true);
  };

  const confirmCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      setCancelling(true);
      setCancelError(null);
      
      await bookingsAPI.cancelBooking(selectedBooking._id);
      
      // Update the bookings list
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === selectedBooking._id 
            ? { ...booking, status: 'cancelled' }
            : booking
        )
      );
      
      setShowCancelModal(false);
      setSelectedBooking(null);
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Failed to cancel booking. Please try again.');
      console.error('Error cancelling booking:', err);
    } finally {
      setCancelling(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', icon: <MdPending />, text: 'Pending' },
      reserved: { variant: 'info', icon: <MdCheckCircle />, text: 'Reserved' },
      'checked-in': { variant: 'success', icon: <MdCheckCircle />, text: 'Checked In' },
      'checked-out': { variant: 'secondary', icon: <MdCheckCircle />, text: 'Checked Out' },
      cancelled: { variant: 'danger', icon: <MdCancel />, text: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <Badge bg={config.variant} className="status-badge">
        {config.icon} {config.text}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const calculateNights = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isBookingCancellable = (booking) => {
    const now = new Date();
    const startDate = new Date(booking.checkIn);
    const daysUntilBooking = Math.ceil((startDate - now) / (1000 * 60 * 60 * 24));
    
    // Can cancel if booking is pending or reserved and more than 24 hours before start
    // Cannot cancel if already checked-in, checked-out, or cancelled
    return (booking.status === 'pending' || booking.status === 'reserved') && 
           daysUntilBooking > 1 && 
           booking.status !== 'checked-in' && 
           booking.status !== 'checked-out' && 
           booking.status !== 'cancelled';
  };

  if (loading) {
    return (
      <Container className="bookings-container">
        <div className="loading-container">
          <Spinner animation="border" role="status" className="loading-spinner">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p>Loading your bookings...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="bookings-container">
        <Alert variant="danger" className="error-alert">
          <MdError className="error-icon" />
          {error}
          <Button 
            variant="outline-danger" 
            size="sm" 
            className="retry-button"
            onClick={fetchBookings}
          >
            Try Again
          </Button>
        </Alert>
      </Container>
    );
  }

  return (
    <>
      <Container className="bookings-container">
        <Row>
          <Col>
            <div className="bookings-header">
              <div className="header-content">
                <h1>My Bookings</h1>
                <p className="bookings-subtitle">
                  Manage your upcoming and past bookings
                </p>
              </div>
            </div>

            {bookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-content">
                  <MdCalendarToday className="empty-icon" />
                  <h3>No bookings yet</h3>
                  <p>You haven't made any bookings yet. Start exploring amazing places!</p>
                  <div className="empty-actions">
                    <Button variant="primary" href="/" className="explore-btn">
                      <MdExplore /> Explore Listings
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bookings-content">
                <div className="bookings-stats">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <MdCalendarToday />
                    </div>
                    <div className="stat-info">
                      <h4>{bookings.length}</h4>
                      <p>Total Bookings</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon active">
                      <MdCheckCircle />
                    </div>
                    <div className="stat-info">
                      <h4>{bookings.filter(b => b.status === 'reserved').length}</h4>
                      <p>Reserved</p>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon pending">
                      <MdPending />
                    </div>
                    <div className="stat-info">
                      <h4>{bookings.filter(b => b.status === 'pending').length}</h4>
                      <p>Pending</p>
                    </div>
                  </div>
                </div>

                <div className="bookings-grid">
                  {bookings.map((booking) => (
                    <BookingCard key={booking._id} className="booking-card">
                      <div className="booking-header">
                        <div className="booking-status">
                          {getStatusBadge(booking.status)}
                        </div>
                        <div className="booking-dates">
                          <MdCalendarToday className="date-icon" />
                          <span>
                            {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                          </span>
                        </div>
                      </div>

                      <div className="listing-info">
                        {booking.home?.images?.[0] && (
                          <div className="listing-image">
                            <img 
                              src={booking.home.images[0]} 
                              alt={booking.home.title}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                              }}
                            />
                            <div className="image-overlay">
                              <MdHome className="overlay-icon" />
                            </div>
                          </div>
                        )}
                        
                        <div className="listing-details">
                          <h4 className="listing-title">{booking.home?.title || 'Unknown Listing'}</h4>
                          
                          <div className="listing-meta">
                            <div className="meta-item">
                              <MdLocationOn className="meta-icon" />
                              <span>
                                {booking.home?.city 
                                  ? `${booking.home.city}${booking.home?.country ? `, ${booking.home.country}` : ''}`
                                  : 'Location not available'}
                              </span>
                            </div>
                            
                            <div className="meta-item">
                              <MdPerson className="meta-icon" />
                              <span>{booking.guests || 1} guest{(booking.guests || 1) !== 1 ? 's' : ''}</span>
                            </div>
                            
                            <div className="meta-item">
                              <MdAccessTime className="meta-icon" />
                              <span>{calculateNights(booking.checkIn, booking.checkOut)} night{calculateNights(booking.checkIn, booking.checkOut) !== 1 ? 's' : ''}</span>
                            </div>
                          </div>

                          {booking.home?.rating && (
                            <div className="listing-rating">
                              <MdStar className="star-icon" />
                              <span>{booking.home.rating.toFixed(1)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="booking-footer">
                        <div className="price-info">
                          <MdAttachMoney className="price-icon" />
                          <span className="price-amount">{formatPrice(booking.totalPrice)}</span>
                          <span className="price-label">total</span>
                        </div>

                        {isBookingCancellable(booking) && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="cancel-button"
                            onClick={() => handleCancelBooking(booking)}
                          >
                            <MdCancel /> Cancel
                          </Button>
                        )}
                      </div>
                    </BookingCard>
                  ))}
                </div>
              </div>
            )}
          </Col>
        </Row>
      </Container>

      {/* Cancel Confirmation Modal */}
      <Modal show={showCancelModal} onHide={() => setShowCancelModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <MdCancel className="modal-icon" />
            Cancel Booking
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {cancelError && (
            <Alert variant="danger" className="mb-3">
              {cancelError}
            </Alert>
          )}
          
          <p>Are you sure you want to cancel this booking?</p>
          
                     {selectedBooking && (
             <div className="cancel-details">
               <h6>{selectedBooking.home?.title}</h6>
               <p>
                 <MdCalendarToday className="detail-icon" />
                 {formatDate(selectedBooking.checkIn)} - {formatDate(selectedBooking.checkOut)}
               </p>
               <p>
                 <MdAttachMoney className="detail-icon" />
                 {formatPrice(selectedBooking.totalPrice)} total
               </p>
             </div>
           )}
          
          <Alert variant="warning" className="mt-3">
            <MdInfo className="alert-icon" />
            <strong>Note:</strong> Cancellation policies may apply. Please check the listing's cancellation policy.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Keep Booking
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmCancelBooking}
            disabled={cancelling}
          >
            {cancelling ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Cancelling...
              </>
            ) : (
              'Cancel Booking'
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

const BookingCard = styled(Card)`
  border: none;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  margin-bottom: 24px;
  background: white;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

export default UserBookings; 