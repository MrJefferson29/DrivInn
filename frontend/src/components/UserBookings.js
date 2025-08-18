import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
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
  MdExplore,
  MdPayment,
  MdRateReview,
  MdCheckCircleOutline
} from 'react-icons/md';
import { useAuth } from '../context/AuthContext';
import { bookingsAPI } from '../services/api';
import { reviewsAPI } from '../services/api';
import styled from 'styled-components';
import './UserBookings.css';
import ReviewForm from './ReviewForm';

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [cancelSuccess, setCancelSuccess] = useState(null);
  
  // Review-related state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewingBooking, setReviewingBooking] = useState(null);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleImageClick = (listingId) => {
    if (listingId) {
      navigate(`/listing/${listingId}`);
    }
  };

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
      
      const response = await bookingsAPI.cancelBooking(selectedBooking._id);
      
      // Update the bookings list with cancellation details
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === selectedBooking._id 
            ? { 
                ...booking, 
                status: 'cancelled',
                paymentStatus: 'refunded',
                refundInfo: response.data.refund
              }
            : booking
        )
      );
      
      // Show success message with refund details
      const refundInfo = response.data.refund;
      const successMessage = `Booking cancelled successfully! ${
        refundInfo.amount > 0 
          ? `Refund of $${refundInfo.amount} (${refundInfo.percentage}%) will be processed according to the ${refundInfo.policy} cancellation policy.`
          : 'No refund available for this cancellation.'
      }`;
      
      setCancelSuccess(successMessage);
      setShowCancelModal(false);
      setSelectedBooking(null);
      
      // Clear success message after 5 seconds
      setTimeout(() => setCancelSuccess(null), 5000);
    } catch (err) {
      setCancelError(err.response?.data?.message || 'Failed to cancel booking. Please try again.');
      console.error('Error cancelling booking:', err);
    } finally {
      setCancelling(false);
    }
  };

  // Review handling functions
  const handleWriteReview = (booking) => {
    setReviewingBooking(booking);
    setReviewError(null);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      setSubmittingReview(true);
      setReviewError(null);
      
      await reviewsAPI.createReview(reviewData);
      
      // Update the booking to mark it as reviewed
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking._id === reviewingBooking._id 
            ? { ...booking, hasReview: true }
            : booking
        )
      );
      
      setShowReviewModal(false);
      setReviewingBooking(null);
      
      // Show success message or refresh bookings
      fetchBookings();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review. Please try again.');
      console.error('Error submitting review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleCancelReview = () => {
    setShowReviewModal(false);
    setReviewingBooking(null);
    setReviewError(null);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'warning', icon: <MdPending />, text: 'Pending' },
      reserved: { variant: 'info', icon: <MdCheckCircle />, text: 'Reserved' },
      confirmed: { variant: 'primary', icon: <MdCheckCircle />, text: 'Confirmed' },
      checked_in: { variant: 'success', icon: <MdCheckCircle />, text: 'Checked In' },
      checked_out: { variant: 'secondary', icon: <MdCheckCircle />, text: 'Checked Out' },
      completed: { variant: 'success', icon: <MdCheckCircleOutline />, text: 'Completed' },
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
    // Cannot cancel if already checked_in, checked_out, or cancelled
    return (booking.status === 'pending' || booking.status === 'reserved') && 
           daysUntilBooking > 1 && 
           booking.status !== 'checked_in' && 
           booking.status !== 'checked_out' && 
           booking.status !== 'cancelled';
  };

  const canReviewBooking = (booking) => {
    // Can review if booking is completed and hasn't been reviewed yet
    return (booking.status === 'completed' || booking.status === 'checked_out') && !booking.hasReview;
  };

  const hasReviewedBooking = (booking) => {
    return booking.hasReview;
  };

  // Helper function to get cancellation policy details
  const getCancellationPolicyDetails = (policy, checkInDate) => {
    const now = new Date();
    const checkIn = new Date(checkInDate);
    const daysUntilCheckIn = Math.ceil((checkIn - now) / (1000 * 60 * 60 * 24));
    
    switch (policy) {
      case 'Flexible':
        if (daysUntilCheckIn >= 1) {
          return `Full refund if cancelled at least 1 day before check-in (${daysUntilCheckIn} days remaining)`;
        } else if (daysUntilCheckIn >= 0) {
          return `50% refund if cancelled same day (${daysUntilCheckIn} days remaining)`;
        } else {
          return 'No refund available - check-in has passed';
        }
        
      case 'Moderate':
        if (daysUntilCheckIn >= 5) {
          return `Full refund if cancelled at least 5 days before check-in (${daysUntilCheckIn} days remaining)`;
        } else if (daysUntilCheckIn >= 1) {
          return `50% refund if cancelled at least 1 day before check-in (${daysUntilCheckIn} days remaining)`;
        } else {
          return 'No refund available - check-in is too close';
        }
        
      case 'Strict':
        if (daysUntilCheckIn >= 7) {
          return `Full refund if cancelled at least 7 days before check-in (${daysUntilCheckIn} days remaining)`;
        } else if (daysUntilCheckIn >= 1) {
          return `50% refund if cancelled at least 1 day before check-in (${daysUntilCheckIn} days remaining)`;
        } else {
          return 'No refund available - check-in is too close';
        }
        
      case 'Super Strict':
        if (daysUntilCheckIn >= 14) {
          return `Full refund if cancelled at least 14 days before check-in (${daysUntilCheckIn} days remaining)`;
        } else if (daysUntilCheckIn >= 7) {
          return `50% refund if cancelled at least 7 days before check-in (${daysUntilCheckIn} days remaining)`;
        } else {
          return 'No refund available - check-in is too close';
        }
        
      default:
        return 'Cancellation policy not specified';
    }
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
                {/* Success Message */}
                {cancelSuccess && (
                  <Alert variant="success" className="mb-4" onClose={() => setCancelSuccess(null)} dismissible>
                    <MdCheckCircle className="me-2" />
                    {cancelSuccess}
                  </Alert>
                )}

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
                      <h4>{bookings.filter(b => b.status === 'reserved' || b.status === 'confirmed').length}</h4>
                      <p>Active</p>
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
                  <div className="stat-card">
                    <div className="stat-icon success">
                      <MdCheckCircle />
                    </div>
                    <div className="stat-info">
                      <h4>{bookings.filter(b => b.status === 'checked_in' || b.status === 'checked_out' || b.status === 'completed').length}</h4>
                      <p>Completed</p>
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
                        <div className="status-details">
                          {booking.paymentStatus && (
                            <small className="payment-status">
                              Payment: {booking.paymentStatus === 'completed' ? '✅ Paid' : 
                                       booking.paymentStatus === 'pending' ? '⏳ Pending' : 
                                       booking.paymentStatus === 'failed' ? '❌ Failed' : 
                                       booking.paymentStatus === 'refunded' ? '↩️ Refunded' : booking.paymentStatus}
                            </small>
                          )}
                          {/* Show next steps or current state info */}
                          {booking.status === 'pending' && (
                            <small className="status-info pending">
                              ⏳ Waiting for payment confirmation
                            </small>
                          )}
                          {booking.status === 'reserved' && (
                            <small className="status-info active">
                              ✅ Payment confirmed - booking is reserved
                            </small>
                          )}
                          {booking.status === 'confirmed' && (
                            <small className="status-info active">
                              ✅ Host has confirmed your booking
                            </small>
                          )}
                          {booking.status === 'checked_in' && (
                            <small className="status-info success">
                              🏠 You're checked in - enjoy your stay!
                            </small>
                          )}
                          {booking.status === 'checked_out' && (
                            <small className="status-info success">
                              🚪 Check-out completed - thanks for staying!
                            </small>
                          )}
                          {booking.status === 'completed' && (
                            <small className="status-info success">
                              🎉 Stay completed - consider leaving a review!
                            </small>
                          )}
                          {booking.status === 'cancelled' && (
                            <small className="status-info cancelled">
                              ❌ Booking was cancelled
                              {booking.refundInfo && (
                                <span className="refund-info">
                                  {booking.refundInfo.amount > 0 
                                    ? ` - Refund: $${booking.refundInfo.amount} (${booking.refundInfo.percentage}%)`
                                    : ' - No refund available'
                                  }
                                </span>
                              )}
                            </small>
                          )}
                        </div>
                        <div className="booking-dates">
                          <MdCalendarToday className="date-icon" />
                          <span>
                            {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                          </span>
                        </div>
                      </div>

                      <div className="listing-info">
                         {booking.home?.images?.[0] ? (
                           <div className="listing-image" onClick={() => handleImageClick(booking.home._id)}>
                            <img 
                              src={booking.home.images[0]} 
                              alt={booking.home.title}
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                              }}
                            />
                            <div className="image-overlay">
                              <MdHome className="overlay-icon" />
                               <span className="overlay-text">Click to view details</span>
                             </div>
                           </div>
                         ) : (
                           <div className="listing-image placeholder" onClick={() => handleImageClick(booking.home._id)}>
                             <div className="placeholder-content">
                               <MdHome className="placeholder-icon" />
                               <span className="placeholder-text">No Image</span>
                               <span className="placeholder-subtext">Click to view details</span>
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
                           
                                                       <div className="meta-item">
                              <MdPayment className="meta-icon" />
                              <span>{
                                booking.paymentMethod === 'cashapp' ? 'Cash App Pay'
                                : booking.paymentMethod === 'bank_transfer' ? 'Bank Transfer'
                                : booking.paymentMethod === 'samsung_pay' ? 'Samsung Pay'
                                : booking.paymentMethod === 'card' ? 'Credit Card'
                                : 'Payment Method Not Available'
                              }</span>
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

                        <div className="booking-actions">
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
                          
                          {canReviewBooking(booking) && (
                            <Button
                              variant="primary"
                              size="sm"
                              className="review-button"
                              onClick={() => handleWriteReview(booking)}
                            >
                              <MdRateReview /> Write Review
                            </Button>
                          )}
                          
                          {hasReviewedBooking(booking) && (
                            <Badge bg="success" className="reviewed-badge">
                              <MdCheckCircleOutline /> Reviewed
                            </Badge>
                          )}
                        </div>
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
              
              {/* Cancellation Policy Information */}
              {selectedBooking.home?.cancellationPolicy && (
                <div className="cancellation-policy-info">
                  <h6 className="policy-title">
                    <MdInfo className="policy-icon" />
                    Cancellation Policy: {selectedBooking.home.cancellationPolicy}
                  </h6>
                  <div className="policy-details">
                    {getCancellationPolicyDetails(selectedBooking.home.cancellationPolicy, selectedBooking.checkIn)}
                  </div>
                </div>
              )}
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

      {/* Review Modal */}
      <Modal 
        show={showReviewModal} 
        onHide={handleCancelReview} 
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <MdRateReview className="modal-icon" />
            Write a Review
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {reviewError && (
            <Alert variant="danger" className="mb-3">
              {reviewError}
            </Alert>
          )}
          
          {reviewingBooking && (
            <ReviewForm
              booking={reviewingBooking}
              onSubmit={handleSubmitReview}
              onCancel={handleCancelReview}
              isLoading={submittingReview}
            />
          )}
        </Modal.Body>
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