import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaHeart } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { likeListing, unlikeListing, checkIfLiked } from '../services/likesService';

const LikeButtonContainer = styled.button`
  background: ${props => props.isLiked ? '#FF385C' : 'rgba(255, 255, 255, 0.95)'};
  border: 1px solid ${props => props.isLiked ? '#FF385C' : '#DDDDDD'};
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  backdrop-filter: blur(10px);
  
  &:hover {
    transform: scale(1.15);
    background: ${props => props.isLiked ? '#e31c5f' : 'white'};
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
  }
  
  @media (max-width: 768px) {
    width: 32px;
    height: 32px;
    
    &:hover {
      transform: scale(1.1);
    }
  }
  
  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
    
    &:hover {
      transform: scale(1.05);
    }
  }
`;

const HeartIcon = styled(FaHeart)`
  color: ${props => props.isLiked ? 'white' : '#222222'};
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const LikeCount = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #FF385C;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  border: 2px solid white;
  
  @media (max-width: 768px) {
    width: 18px;
    height: 18px;
    font-size: 0.65rem;
  }
`;

const LikeButton = ({ listingId, likeCount: initialLikeCount = 0, onLikeChange, size = 'normal', showCount = true }) => {
  const { isAuthenticated } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [loading, setLoading] = useState(false);

  // Check if user has liked this listing on component mount
  useEffect(() => {
    if (isAuthenticated && listingId) {
      checkIfLiked(listingId)
        .then(data => {
          setIsLiked(data.isLiked);
        })
        .catch(error => {
          console.error('Error checking like status:', error);
        });
    }
  }, [listingId, isAuthenticated]);

  // Update like count when prop changes
  useEffect(() => {
    setLikeCount(initialLikeCount);
  }, [initialLikeCount]);

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      // Redirect to login or show login modal
      alert('Please log in to like listings');
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      if (isLiked) {
        await unlikeListing(listingId);
        setIsLiked(false);
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        await likeListing(listingId);
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
      
      // Call parent callback if provided
      if (onLikeChange) {
        onLikeChange(isLiked ? likeCount - 1 : likeCount + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert state on error
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev + 1 : Math.max(0, prev - 1));
    } finally {
      setLoading(false);
    }
  };

  return (
    <LikeButtonContainer
      isLiked={isLiked}
      onClick={handleLikeToggle}
      disabled={loading}
      title={isLiked ? 'Unlike' : 'Like'}
    >
      <HeartIcon isLiked={isLiked} />
      {showCount && likeCount > 0 && (
        <LikeCount>{likeCount}</LikeCount>
      )}
    </LikeButtonContainer>
  );
};

export default LikeButton; 