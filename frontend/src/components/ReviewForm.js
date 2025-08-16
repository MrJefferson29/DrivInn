import React, { useState } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { MdStar, MdStarBorder, MdStarHalf } from 'react-icons/md';
import styled from 'styled-components';

const ReviewForm = ({ booking, onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    detailedRatings: {
      cleanliness: 0,
      communication: 0,
      checkIn: 0,
      accuracy: 0,
      location: 0,
      value: 0
    },
    title: '',
    content: ''
  });
  const [errors, setErrors] = useState({});
  const [hoveredRating, setHoveredRating] = useState(0);
  const [hoveredDetailedRating, setHoveredDetailedRating] = useState({});

  const ratingCategories = [
    { key: 'cleanliness', label: 'Cleanliness', icon: '🧹' },
    { key: 'communication', label: 'Communication', icon: '💬' },
    { key: 'checkIn', label: 'Check-in', icon: '🔑' },
    { key: 'accuracy', label: 'Accuracy', icon: '✅' },
    { key: 'location', label: 'Location', icon: '📍' },
    { key: 'value', label: 'Value', icon: '💰' }
  ];

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: null }));
    }
  };

  const handleDetailedRatingChange = (category, rating) => {
    setFormData(prev => ({
      ...prev,
      detailedRatings: {
        ...prev.detailedRatings,
        [category]: rating
      }
    }));
    if (errors.detailedRatings?.[category]) {
      setErrors(prev => ({
        ...prev,
        detailedRatings: {
          ...prev.detailedRatings,
          [category]: null
        }
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.rating || formData.rating === 0) {
      newErrors.rating = 'Overall rating is required';
    }

    Object.entries(formData.detailedRatings).forEach(([category, rating]) => {
      if (!rating || rating === 0) {
        if (!newErrors.detailedRatings) newErrors.detailedRatings = {};
        newErrors.detailedRatings[category] = `${ratingCategories.find(c => c.key === category).label} rating is required`;
      }
    });

    if (!formData.title.trim()) {
      newErrors.title = 'Review title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Review content is required';
    } else if (formData.content.trim().length < 20) {
      newErrors.content = 'Review content must be at least 20 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit({
      bookingId: booking._id,
      ...formData
    });
  };

  const renderStars = (rating, onRatingChange, onHover, onLeave, size = 24) => {
    return (
      <StarsContainer>
        {[1, 2, 3, 4, 5].map((star) => {
          let IconComponent = MdStarBorder;
          let color = '#ddd';
          
          if (star <= rating) {
            IconComponent = MdStar;
            color = '#ffc107';
          } else if (star <= onHover) {
            IconComponent = MdStarHalf;
            color = '#ffc107';
          }
          
          return (
            <IconComponent
              key={star}
              size={size}
              style={{ color, cursor: 'pointer', marginRight: '2px' }}
              onClick={() => onRatingChange(star)}
              onMouseEnter={() => onHover && onHover(star)}
              onMouseLeave={() => onLeave && onLeave()}
            />
          );
        })}
      </StarsContainer>
    );
  };

  if (!booking) {
    return (
      <Alert variant="warning">
        No booking information available for review.
      </Alert>
    );
  }

  return (
    <ReviewFormContainer>
      <Card>
        <Card.Header>
          <h4>📝 Write a Review</h4>
          <p className="text-muted mb-0">
            Share your experience about {booking.listing?.title || 'this listing'}
          </p>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            {/* Overall Rating */}
            <Form.Group className="mb-4">
              <Form.Label>
                <strong>Overall Rating *</strong>
              </Form.Label>
              <div className="d-flex align-items-center">
                {renderStars(
                  formData.rating,
                  handleRatingChange,
                  setHoveredRating,
                  () => setHoveredRating(0),
                  32
                )}
                <span className="ms-3 text-muted">
                  {hoveredRating > 0 ? `${hoveredRating} stars` : `${formData.rating} stars`}
                </span>
              </div>
              {errors.rating && (
                <Form.Text className="text-danger">{errors.rating}</Form.Text>
              )}
            </Form.Group>

            {/* Detailed Ratings */}
            <Form.Group className="mb-4">
              <Form.Label>
                <strong>Detailed Ratings *</strong>
              </Form.Label>
              <Row>
                {ratingCategories.map((category) => (
                  <Col key={category.key} xs={12} sm={6} className="mb-3">
                    <div className="d-flex align-items-center justify-content-between">
                      <span>
                        {category.icon} {category.label}
                      </span>
                      {renderStars(
                        formData.detailedRatings[category.key],
                        (rating) => handleDetailedRatingChange(category.key, rating),
                        (rating) => setHoveredDetailedRating(prev => ({ ...prev, [category.key]: rating })),
                        () => setHoveredDetailedRating(prev => ({ ...prev, [category.key]: 0 }))
                      )}
                    </div>
                    {errors.detailedRatings?.[category.key] && (
                      <Form.Text className="text-danger d-block">
                        {errors.detailedRatings[category.key]}
                      </Form.Text>
                    )}
                  </Col>
                ))}
              </Row>
            </Form.Group>

            {/* Review Title */}
            <Form.Group className="mb-3">
              <Form.Label>
                <strong>Review Title *</strong>
              </Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Summarize your experience in a few words"
                maxLength={100}
                isInvalid={!!errors.title}
              />
              <Form.Text className="text-muted">
                {formData.title.length}/100 characters
              </Form.Text>
              {errors.title && (
                <Form.Control.Feedback type="invalid">
                  {errors.title}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            {/* Review Content */}
            <Form.Group className="mb-4">
              <Form.Label>
                <strong>Review Content *</strong>
              </Form.Label>
              <Form.Control
                as="textarea"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={5}
                placeholder="Share the details of your experience. What did you like? What could be improved?"
                maxLength={1000}
                isInvalid={!!errors.content}
              />
              <Form.Text className="text-muted">
                {formData.content.length}/1000 characters
              </Form.Text>
              {errors.content && (
                <Form.Control.Feedback type="invalid">
                  {errors.content}
                </Form.Control.Feedback>
              )}
            </Form.Group>

            {/* Action Buttons */}
            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="outline-secondary"
                onClick={onCancel}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
              >
                {isLoading ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </ReviewFormContainer>
  );
};

const ReviewFormContainer = styled.div`
  .card {
    border: none;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
  }

  .card-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12px 12px 0 0 !important;
    border: none;
  }

  .card-header h4 {
    margin-bottom: 0.5rem;
    font-weight: 600;
  }

  .form-label {
    font-weight: 600;
    color: #333;
    margin-bottom: 0.5rem;
  }

  .form-control, .form-select {
    border-radius: 8px;
    border: 2px solid #e9ecef;
    transition: all 0.3s ease;
    
    &:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
    }
    
    &.is-invalid {
      border-color: #dc3545;
    }
  }

  .btn {
    border-radius: 8px;
    font-weight: 600;
    padding: 0.5rem 1.5rem;
    transition: all 0.3s ease;
    
    &:hover {
      transform: translateY(-1px);
    }
  }
`;

const StarsContainer = styled.div`
  display: flex;
  align-items: center;
  
  svg {
    transition: all 0.2s ease;
    
    &:hover {
      transform: scale(1.1);
    }
  }
`;

export default ReviewForm;
