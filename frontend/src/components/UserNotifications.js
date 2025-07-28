import React, { useEffect, useState } from 'react';
import { notificationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaArrowLeft, 
  FaBell, 
  FaCheck, 
  FaTimes, 
  FaTrash, 
  FaEye,
  FaCalendarAlt,
  FaHome,
  FaIdCard,
  FaHeart,
  FaStar,
  FaCreditCard,
  FaUser,
  FaCog,
  FaGift,
  FaExclamationTriangle,
  FaSpinner,
  FaFilter,
  FaSearch,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaBookmark,
  FaEnvelope
} from 'react-icons/fa';
import { Spinner, Alert, Badge, Button } from 'react-bootstrap';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
  
  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #222222;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: #f7f7f7;
    color: #FF385C;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #222222;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-between;
  }
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  
  &.primary {
    background: #FF385C;
    color: white;
    
    &:hover {
      background: #e31c5f;
    }
  }
  
  &.secondary {
    background: #f7f7f7;
    color: #222222;
    border: 1px solid #DDDDDD;
    
    &:hover {
      background: #e9e9e9;
    }
  }
  
  &.danger {
    background: #dc3545;
    color: white;
    
    &:hover {
      background: #c82333;
    }
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 1px solid #DDDDDD;
  border-radius: 8px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  min-width: 150px;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
    box-shadow: 0 0 0 3px rgba(255, 56, 92, 0.1);
  }
`;

const SearchInput = styled.input`
  padding: 12px 16px;
  border: 1px solid #DDDDDD;
  border-radius: 8px;
  font-size: 1rem;
  flex: 1;
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: #FF385C;
    box-shadow: 0 0 0 3px rgba(255, 56, 92, 0.1);
  }
`;

const NotificationsContainer = styled.div`
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #DDDDDD;
  overflow: hidden;
`;

const NotificationItem = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #DDDDDD;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  
  &:hover {
    background: #f9f9f9;
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  ${props => !props.read && `
    background: #f0f8ff;
    border-left: 4px solid #FF385C;
  `}
`;

const NotificationHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const NotificationIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => {
    switch (props.type) {
      case 'booking': return '#28a745';
      case 'booking_confirmed': return '#28a745';
      case 'booking_cancelled': return '#dc3545';
      case 'listing_created': return '#17a2b8';
      case 'listing_updated': return '#ffc107';
      case 'listing_deleted': return '#dc3545';
      case 'host_application': return '#6f42c1';
      case 'host_application_approved': return '#28a745';
      case 'host_application_declined': return '#dc3545';
      case 'like': return '#e83e8c';
      case 'review_received': return '#fd7e14';
      case 'payment_successful': return '#28a745';
      case 'payment_failed': return '#dc3545';
      case 'welcome': return '#20c997';
      case 'system': return '#6c757d';
      case 'reminder': return '#17a2b8';
      default: return '#6c757d';
    }
  }};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  margin-right: 16px;
  flex-shrink: 0;
`;

const NotificationContent = styled.div`
  flex: 1;
`;

const NotificationTitle = styled.div`
  font-weight: 600;
  color: #222222;
  font-size: 1rem;
  margin-bottom: 4px;
`;

const NotificationMessage = styled.div`
  color: #717171;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 8px;
`;

const NotificationMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #999;
`;

const NotificationTime = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const NotificationActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const NotificationBadge = styled(Badge)`
  font-size: 0.7rem;
  padding: 4px 8px;
  border-radius: 12px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 20px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #717171;
`;

const EmptyIcon = styled(FaBell)`
  font-size: 4rem;
  color: #DDDDDD;
  margin-bottom: 24px;
`;

const EmptyTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #222222;
  margin-bottom: 12px;
`;

const EmptyText = styled.p`
  color: #717171;
  margin-bottom: 24px;
`;

const getNotificationIcon = (type) => {
  switch (type) {
    case 'booking':
    case 'booking_confirmed':
    case 'booking_cancelled':
      return <FaCalendarAlt />;
    case 'listing_created':
    case 'listing_updated':
    case 'listing_deleted':
      return <FaHome />;
    case 'host_application':
    case 'host_application_approved':
    case 'host_application_declined':
      return <FaIdCard />;
    case 'like':
      return <FaHeart />;
    case 'review_received':
      return <FaStar />;
    case 'payment_successful':
    case 'payment_failed':
      return <FaCreditCard />;
    case 'welcome':
      return <FaGift />;
    case 'system':
      return <FaCog />;
    case 'reminder':
      return <FaClock />;
    default:
      return <FaBell />;
  }
};

const getNotificationTypeLabel = (type) => {
  switch (type) {
    case 'booking': return 'Booking';
    case 'booking_confirmed': return 'Booking Confirmed';
    case 'booking_cancelled': return 'Booking Cancelled';
    case 'listing_created': return 'Listing Created';
    case 'listing_updated': return 'Listing Updated';
    case 'listing_deleted': return 'Listing Deleted';
    case 'host_application': return 'Host Application';
    case 'host_application_approved': return 'Application Approved';
    case 'host_application_declined': return 'Application Declined';
    case 'like': return 'New Like';
    case 'review_received': return 'New Review';
    case 'payment_successful': return 'Payment Successful';
    case 'payment_failed': return 'Payment Failed';
    case 'welcome': return 'Welcome';
    case 'system': return 'System';
    case 'reminder': return 'Reminder';
    default: return 'Notification';
  }
};

const getNotificationPriority = (type) => {
  switch (type) {
    case 'booking_confirmed':
    case 'host_application_approved':
    case 'payment_successful':
      return 'high';
    case 'booking_cancelled':
    case 'host_application_declined':
    case 'payment_failed':
      return 'high';
    case 'like':
    case 'review_received':
      return 'medium';
    default:
      return 'low';
  }
};

const UserNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getUserNotifications(user._id);
      setNotifications(response.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif._id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead(user._id);
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationsAPI.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const handleDeleteAllNotifications = async () => {
    if (window.confirm('Are you sure you want to delete all notifications?')) {
      try {
        await notificationsAPI.deleteAllNotifications(user._id);
        setNotifications([]);
      } catch (err) {
        console.error('Error deleting all notifications:', err);
      }
    }
  };

  const handleNotificationClick = (notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      handleMarkAsRead(notification._id);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'booking':
      case 'booking_confirmed':
      case 'booking_cancelled':
        if (notification.booking) {
          // Navigate to booking details if available
          // navigate(`/booking/${notification.booking}`);
        }
        break;
      case 'listing_created':
      case 'listing_updated':
      case 'listing_deleted':
        if (notification.listing) {
          navigate(`/listing/${notification.listing._id}`);
        }
        break;
      case 'host_application':
      case 'host_application_approved':
      case 'host_application_declined':
        navigate('/become-a-host/status');
        break;
      case 'like':
        if (notification.listing) {
          navigate(`/listing/${notification.listing._id}`);
        }
        break;
      case 'review_received':
        if (notification.listing) {
          navigate(`/listing/${notification.listing._id}`);
        }
        break;
      default:
        // For other types, just mark as read
        break;
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || notification.type === filter;
    const matchesSearch = !searchTerm || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  if (loading) {
    return (
      <Container>
        <LoadingContainer>
          <Spinner animation="border" variant="primary" />
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <HeaderLeft>
          <BackButton onClick={() => navigate(-1)}>
            <FaArrowLeft /> Back
          </BackButton>
          <Title>
            <FaBell /> Notifications
            {unreadCount > 0 && (
              <Badge bg="danger" style={{ marginLeft: '12px' }}>
                {unreadCount}
              </Badge>
            )}
          </Title>
        </HeaderLeft>
        
        <HeaderActions>
          {unreadCount > 0 && (
            <ActionButton className="primary" onClick={handleMarkAllAsRead}>
              <FaCheck /> Mark All Read
            </ActionButton>
          )}
          {notifications.length > 0 && (
            <ActionButton className="danger" onClick={handleDeleteAllNotifications}>
              <FaTrash /> Clear All
            </ActionButton>
          )}
        </HeaderActions>
      </Header>

      {error && (
        <Alert variant="danger" style={{ marginBottom: '24px' }}>
          {error}
        </Alert>
      )}

      <ControlsContainer>
        <FilterSelect value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">All Notifications</option>
          <option value="booking">Bookings</option>
          <option value="listing_created">Listings</option>
          <option value="host_application">Host Applications</option>
          <option value="like">Likes</option>
          <option value="review_received">Reviews</option>
          <option value="payment_successful">Payments</option>
          <option value="welcome">Welcome</option>
          <option value="system">System</option>
        </FilterSelect>
        
        <SearchInput
          type="text"
          placeholder="Search notifications..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </ControlsContainer>

      <NotificationsContainer>
        {filteredNotifications.length === 0 ? (
          <EmptyState>
            <EmptyIcon />
            <EmptyTitle>No notifications found</EmptyTitle>
            <EmptyText>
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search terms or filters'
                : 'You\'re all caught up! Check back later for new notifications.'
              }
            </EmptyText>
          </EmptyState>
        ) : (
          filteredNotifications.map(notification => (
            <NotificationItem 
              key={notification._id} 
              read={notification.read}
              onClick={() => handleNotificationClick(notification)}
            >
              <NotificationHeader>
                <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                  <NotificationIcon type={notification.type}>
                    {getNotificationIcon(notification.type)}
                  </NotificationIcon>
                  
                  <NotificationContent>
                    <NotificationTitle>
                      {notification.title}
                      {!notification.read && (
                        <NotificationBadge bg="danger" style={{ marginLeft: '8px' }}>
                          New
                        </NotificationBadge>
                      )}
                    </NotificationTitle>
                    
                    <NotificationMessage>
                      {notification.message}
                    </NotificationMessage>
                    
                    <NotificationMeta>
                      <NotificationTime>
                        <FaClock />
                        {new Date(notification.createdAt).toLocaleString()}
                      </NotificationTime>
                      
                      <NotificationBadge 
                        bg={getNotificationPriority(notification.type) === 'high' ? 'danger' : 'secondary'}
                      >
                        {getNotificationTypeLabel(notification.type)}
                      </NotificationBadge>
                    </NotificationMeta>
                  </NotificationContent>
                </div>
              </NotificationHeader>
              
              <NotificationActions>
                {!notification.read && (
                  <ActionButton 
                    className="primary" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(notification._id);
                    }}
                  >
                    <FaCheck /> Mark Read
                  </ActionButton>
                )}
                
                <ActionButton 
                  className="danger" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNotification(notification._id);
                  }}
                >
                  <FaTrash /> Delete
                </ActionButton>
              </NotificationActions>
            </NotificationItem>
          ))
        )}
      </NotificationsContainer>
    </Container>
  );
};

export default UserNotifications; 