import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Alert, Button, Spinner, Card, Badge } from 'react-bootstrap';
import { bookingsAPI } from '../services/api';

const Container = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const StatusCard = styled(Card)`
  margin-bottom: 20px;
  border-left: 4px solid #007bff;
`;

const StatusCardWarning = styled(StatusCard)`
  border-left-color: #ffc107;
`;

const StatusCardSuccess = styled(StatusCard)`
  border-left-color: #28a745;
`;

const BookingStatusMonitor = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [statusSummary, setStatusSummary] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const checkCurrentStatuses = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    
    try {
      const response = await bookingsAPI.checkStatuses();
      setStatusSummary(response.data.summary);
      setLastUpdated(new Date());
      setMessage('Current statuses retrieved successfully!');
      console.log('Status check response:', response.data);
    } catch (err) {
      setError('Failed to check statuses: ' + err.message);
      console.error('Status check error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 30 seconds
  useEffect(() => {
    checkCurrentStatuses();
    
    const interval = setInterval(() => {
      checkCurrentStatuses();
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'checked_in':
        return 'primary';
      case 'checked_out':
        return 'info';
      case 'reserved':
        return 'warning';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <Container>
      <h2>📊 Booking Status Monitor</h2>
      <p className="text-muted">
        Real-time monitoring of all booking statuses. Updates automatically every 30 seconds.
      </p>

      {/* Auto-refresh Info */}
      <div style={{ marginBottom: '20px' }}>
        <Button 
          variant="info" 
          onClick={checkCurrentStatuses}
          disabled={loading}
        >
          {loading ? <Spinner animation="border" size="sm" /> : '🔄'} Refresh Now
        </Button>
        
        {lastUpdated && (
          <small className="text-muted ms-3">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </small>
        )}
      </div>

      {/* Messages */}
      {message && (
        <Alert variant="success" dismissible onClose={() => setMessage('')}>
          {message}
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Status Summary */}
      {statusSummary && (
        <div>
          <h3>📊 Current Status Summary</h3>
          
          <StatusCard>
            <Card.Body>
              <Card.Title>Total Bookings: {statusSummary.total}</Card.Title>
              <div>
                {Object.entries(statusSummary.byStatus).map(([status, count]) => (
                  <Badge 
                    key={status} 
                    bg={getStatusBadgeVariant(status)} 
                    className="me-2 mb-1"
                    style={{ fontSize: '0.9rem' }}
                  >
                    {status}: {count}
                  </Badge>
                ))}
              </div>
            </Card.Body>
          </StatusCard>

          {/* Past Bookings That Should Be Completed */}
          {statusSummary.pastBookings.length > 0 && (
            <StatusCardWarning>
              <Card.Body>
                <Card.Title>⚠️ Past Bookings (Should Be Completed)</Card.Title>
                <p className="text-muted">
                  These bookings have passed their check-out date but are not marked as completed.
                  The system will automatically update them.
                </p>
                {statusSummary.pastBookings.map((booking) => (
                  <div key={booking.id} className="mb-2 p-2 border rounded">
                    <strong>ID:</strong> {booking.id}
                    <br />
                    <small className="text-muted">
                      Check-out: {new Date(booking.checkOut).toLocaleDateString()}
                    </small>
                  </div>
                ))}
              </Card.Body>
            </StatusCardWarning>
          )}

          {/* Current Bookings */}
          {statusSummary.currentBookings.length > 0 && (
            <StatusCard>
              <Card.Body>
                <Card.Title>📅 Current Bookings</Card.Title>
                <p className="text-muted">
                  These bookings are currently active (between check-in and check-out dates).
                </p>
                {statusSummary.currentBookings.map((booking) => (
                  <div key={booking.id} className="mb-2 p-2 border rounded">
                    <strong>ID:</strong> {booking.id}
                    <br />
                    <small className="text-muted">
                      Check-in: {new Date(booking.checkIn).toLocaleDateString()} | 
                      Check-out: {new Date(booking.checkOut).toLocaleDateString()}
                    </small>
                  </div>
                ))}
              </Card.Body>
            </StatusCard>
          )}

          {/* Future Bookings */}
          {statusSummary.futureBookings.length > 0 && (
            <StatusCard>
              <Card.Body>
                <Card.Title>🔮 Future Bookings</Card.Title>
                <p className="text-muted">
                  These bookings are scheduled for the future.
                </p>
                {statusSummary.futureBookings.map((booking) => (
                  <div key={booking.id} className="mb-2 p-2 border rounded">
                    <strong>ID:</strong> {booking.id}
                    <br />
                    <small className="text-muted">
                      Check-in: {new Date(booking.checkIn).toLocaleDateString()}
                    </small>
                  </div>
                ))}
              </Card.Body>
            </StatusCard>
          )}
        </div>
      )}

      {/* System Info */}
      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h4>ℹ️ System Information</h4>
        <ul>
          <li><strong>Automatic Updates:</strong> The system automatically updates booking statuses every minute</li>
          <li><strong>Check-in Logic:</strong> Bookings automatically change to "checked_in" when past check-in time</li>
          <li><strong>Check-out Logic:</strong> Bookings automatically change to "checked_out" when past check-out time</li>
          <li><strong>Completion Logic:</strong> Past bookings automatically change to "completed"</li>
          <li><strong>Real-time Monitoring:</strong> This page refreshes every 30 seconds</li>
        </ul>
        
        <h5>✅ Current Status:</h5>
        <p>
          Your booking with ID <code>68a12297e8cf7c264bdf81b6</code> should automatically 
          update to "checked_in" status within the next minute since it's past check-in time.
        </p>
      </div>
    </Container>
  );
};

export default BookingStatusMonitor;
