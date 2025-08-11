import React, { useState, useEffect } from 'react';
import { Container, Button, Card, Badge, Alert } from 'react-bootstrap';
import { bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TestBookingStatus = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingsAPI.getUserBookings();
      setBookings(response.data);
    } catch (err) {
      setError('Failed to load bookings');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      setUpdating(true);
      await bookingsAPI.updateBookingStatus(bookingId, newStatus);
      await fetchBookings(); // Refresh the list
      alert(`Booking status updated to ${newStatus}`);
    } catch (err) {
      alert('Failed to update booking status');
      console.error('Error:', err);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Container><p>Loading...</p></Container>;
  if (error) return <Container><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="mt-4">
      <h2>Test Booking Status Updates</h2>
      <p>Use this page to manually update booking statuses for testing.</p>
      
      {bookings.length === 0 ? (
        <Alert variant="info">No bookings found.</Alert>
      ) : (
        <div>
          {bookings.map((booking) => (
            <Card key={booking._id} className="mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5>{booking.home?.title || 'Unknown Listing'}</h5>
                    <p>
                      <strong>Status:</strong> 
                      <Badge bg={booking.status === 'reserved' ? 'success' : 'warning'} className="ms-2">
                        {booking.status}
                      </Badge>
                    </p>
                    <p><strong>Check-in:</strong> {new Date(booking.checkIn).toLocaleDateString()}</p>
                    <p><strong>Check-out:</strong> {new Date(booking.checkOut).toLocaleDateString()}</p>
                    <p><strong>Total:</strong> ${booking.totalPrice}</p>
                    <p><strong>Booking ID:</strong> {booking._id}</p>
                  </div>
                  <div>
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2"
                      onClick={() => updateBookingStatus(booking._id, 'reserved')}
                      disabled={updating || booking.status === 'reserved'}
                    >
                      Mark Reserved
                    </Button>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => updateBookingStatus(booking._id, 'pending')}
                      disabled={updating || booking.status === 'pending'}
                    >
                      Mark Pending
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => updateBookingStatus(booking._id, 'cancelled')}
                      disabled={updating || booking.status === 'cancelled'}
                    >
                      Mark Cancelled
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
      
      <Button variant="primary" onClick={fetchBookings} className="mt-3">
        Refresh Bookings
      </Button>
    </Container>
  );
};

export default TestBookingStatus;
