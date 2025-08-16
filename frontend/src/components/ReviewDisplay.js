import React, { useState } from 'react';
import { Card, Badge, Button, Collapse, Row, Col } from 'react-bootstrap';
import { MdStar, MdStarBorder, MdThumbUp, MdThumbUpOutlined, MdReply } from 'react-icons/md';
import styled from 'styled-components';

const ReviewDisplay = ({ reviews, onMarkHelpful, onHostResponse, currentUserId }) => {
  const [expandedReviews, setExpandedReviews] = useState(new Set());

  const toggleReviewExpansion = (reviewId) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const handleMarkHelpful = (reviewId) => {
    if (onMarkHelpful) {
      onMarkHelpful(reviewId);
    }
  };

  const renderStars = (rating, size = 16) => {
    return (
      <StarsContainer>
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= rating ? (
              <MdStar size={size} style={{ color: '#ffc107' }} />
            ) : (
              <MdStarBorder size={size} style={{ color: '#ddd' }} />
            )}
          </span>
        ))}
      </StarsContainer>
    );
  };

  const renderDetailedRatings = (detailedRatings) => {
    const categories = [
      { key: 'cleanliness', label: 'Cleanliness', icon: '🧹' },
      { key: 'communication', label: 'Communication', icon: '💬' },
      { key: 'checkIn', label: 'Check-in', icon: '🔑' },
      { key: 'accuracy', label: 'Accuracy', icon: '✅' },
      { key: 'location', label: 'Location', icon: '📍' },
      { key: 'value', label: 'Value', icon: '💰' }
    ];

    return (
      <DetailedRatingsContainer>
        <Row>
          {categories.map((category) => (
            <Col key={category.key} xs={6} className="mb-2">
              <div className="d-flex align-items-center justify-content-between">
                <span className="text-muted small">
                  {category.icon} {category.label}
                </span>
                <span className="small">
                  {detailedRatings[category.key]}/5
                </span>
              </div>
            </Col>
          ))}
        </Row>
      </DetailedRatingsContainer>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!reviews || reviews.length === 0) {
    return (
      <NoReviewsContainer>
        <div className="text-center py-4">
          <h5 className="text-muted">No reviews yet</h5>
          <p className="text-muted mb-0">Be the first to share your experience!</p>
        </div>
      </NoReviewsContainer>
    );
  }

  return (
    <ReviewsContainer>
      {reviews.map((review) => (
        <ReviewCard key={review.id} className="mb-3">
          <Card.Body>
            {/* Review Header */}
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div className="d-flex align-items-center">
                <div className="me-3">
                  {review.user.profileImage ? (
                    <UserAvatar src={review.user.profileImage} alt={`${review.user.firstName} ${review.user.lastName}`} />
                  ) : (
                    <UserAvatarPlaceholder>
                      {review.user.firstName?.[0]}{review.user.lastName?.[0]}
                    </UserAvatarPlaceholder>
                  )}
                </div>
                <div>
                  <h6 className="mb-1">
                    {review.user.firstName} {review.user.lastName}
                  </h6>
                  <div className="d-flex align-items-center">
                    {renderStars(review.rating)}
                    <span className="ms-2 text-muted small">
                      {formatDate(review.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Review Status Badge */}
              {review.isVerified && (
                <Badge bg="success" className="ms-2">
                  ✓ Verified
                </Badge>
              )}
            </div>

            {/* Review Title */}
            <h6 className="mb-2">{review.title}</h6>

            {/* Review Content */}
            <div className="mb-3">
              {review.content.length > 200 && !expandedReviews.has(review.id) ? (
                <>
                  <p className="mb-2">
                    {review.content.substring(0, 200)}...
                  </p>
                  <Button
                    variant="link"
                    className="p-0 text-decoration-none"
                    onClick={() => toggleReviewExpansion(review.id)}
                  >
                    Read more
                  </Button>
                </>
              ) : (
                <p className="mb-2">{review.content}</p>
              )}
              
              {expandedReviews.has(review.id) && (
                <Collapse in={expandedReviews.has(review.id)}>
                  <div>
                    <p className="mb-2">{review.content}</p>
                    <Button
                      variant="link"
                      className="p-0 text-decoration-none"
                      onClick={() => toggleReviewExpansion(review.id)}
                    >
                      Show less
                    </Button>
                  </div>
                </Collapse>
              )}
            </div>

            {/* Detailed Ratings */}
            <div className="mb-3">
              {renderDetailedRatings(review.detailedRatings)}
            </div>

            {/* Host Response */}
            {review.hostResponse && (
              <HostResponseContainer className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <MdReply size={20} className="me-2 text-primary" />
                  <strong>Host Response</strong>
                  <span className="ms-2 text-muted small">
                    {formatDate(review.hostResponse.respondedAt)}
                  </span>
                </div>
                <p className="mb-0 text-muted">
                  {review.hostResponse.content}
                </p>
              </HostResponseContainer>
            )}

            {/* Review Actions */}
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  className="me-2"
                  onClick={() => handleMarkHelpful(review.id)}
                >
                  {review.helpfulUsers?.includes(currentUserId) ? (
                    <MdThumbUp size={16} className="me-1" />
                  ) : (
                    <MdThumbUpOutlined size={16} className="me-1" />
                  )}
                  Helpful ({review.helpfulCount || 0})
                </Button>
              </div>
              
              <div className="text-muted small">
                {review.helpfulCount > 0 && `${review.helpfulCount} people found this helpful`}
              </div>
            </div>
          </Card.Body>
        </ReviewCard>
      ))}
    </ReviewsContainer>
  );
};

const ReviewsContainer = styled.div`
  .review-card {
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }
  }
`;

const ReviewCard = styled(Card)`
  &.review-card {
    border: none;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    transition: all 0.3s ease;
    
    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }
  }
`;

const UserAvatar = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const UserAvatarPlaceholder = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
`;

const StarsContainer = styled.div`
  display: flex;
  align-items: center;
  
  span {
    margin-right: 1px;
  }
`;

const DetailedRatingsContainer = styled.div`
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
`;

const HostResponseContainer = styled.div`
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  border-left: 4px solid #007bff;
`;

const NoReviewsContainer = styled.div`
  background-color: #f8f9fa;
  border-radius: 12px;
  border: 2px dashed #dee2e6;
`;

export default ReviewDisplay;
