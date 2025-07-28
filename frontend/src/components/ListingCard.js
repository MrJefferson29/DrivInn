import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FaShare, 
  FaStar, 
  FaMapMarkerAlt, 
  FaBed, 
  FaBath, 
  FaUsers,
  FaCar,
  FaHome,
  FaClock,
  FaAward,
  FaCheckCircle,
  FaCalendarAlt
} from 'react-icons/fa';
import LikeButton from './LikeButton';

const Card = styled.div`
  background: var(--color-surface);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08), 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
  }
  
  @media (max-width: 768px) {
    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
    }
  }
  
  @media (max-width: 480px) {
    border-radius: 8px;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    }
  }
`;

const ImageContainer = styled.div`
  position: relative;
  height: 200px;
  overflow: hidden;
  
  @media (max-width: 768px) {
    height: 180px;
  }
  
  @media (max-width: 480px) {
    height: 160px;
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  ${Card}:hover & {
    transform: scale(1.08);
  }
  
  @media (max-width: 768px) {
    ${Card}:hover & {
      transform: scale(1.05);
    }
  }
  
  @media (max-width: 480px) {
    ${Card}:hover & {
      transform: scale(1.03);
    }
  }
`;

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.3) 0%, transparent 50%);
  z-index: 1; /* Reduced from 2 to 1 */
  
  @media (max-width: 768px) {
    padding: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 10px;
  }
`;

const TypeBadge = styled.div`
  background: rgba(255, 255, 255, 0.95);
  color: #222222;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
  backdrop-filter: blur(10px);
  
  @media (max-width: 480px) {
    padding: 4px 8px;
    font-size: 11px;
    gap: 3px;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  
  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const ActionButton = styled.button`
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #222222;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  cursor: pointer;
  
  &:hover {
    background: #FFFFFF;
    transform: scale(1.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  
  &.favorited {
    color: #FF385C;
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

const Badge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 10px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  backdrop-filter: blur(10px);
  color: white;
  
  &.instant {
    background: #28a745;
  }
  
  &.new {
    background: #007bff;
  }
  
  &.trending {
    background: #ffc107;
    color: #212529;
  }
  
  &.popular {
    background: #17a2b8;
  }
  
  &.superhost {
    background: #343a40;
  }
  
  &.verified {
    background: #6c757d;
  }
  
  @media (max-width: 768px) {
    top: 12px;
    right: 12px;
    font-size: 9px;
    padding: 3px 6px;
    gap: 3px;
  }
  
  @media (max-width: 480px) {
    top: 10px;
    right: 10px;
    font-size: 8px;
    padding: 2px 5px;
    gap: 2px;
  }
`;

const Content = styled.div`
  padding: 16px;
  position: relative;
  z-index: 1; /* Reduced from 2 to 1 */
  
  @media (max-width: 768px) {
    padding: 12px;
  }
  
  @media (max-width: 480px) {
    padding: 10px;
  }
`;

const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 8px 0;
  line-height: 1.3;
  transition: color 0.3s ease;
  
  ${Card}:hover & {
    color: var(--color-primary);
  }
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 6px;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin-bottom: 5px;
  }
`;

const Location = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #717171;
  font-size: 14px;
  margin-bottom: 8px;
  
  @media (max-width: 768px) {
    font-size: 13px;
    margin-bottom: 6px;
    gap: 4px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
    margin-bottom: 5px;
    gap: 3px;
  }
`;

const Distance = styled.span`
  margin-left: auto;
  font-size: 12px;
  opacity: 0.8;
  
  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 12px;
  
  @media (max-width: 768px) {
    margin-bottom: 10px;
    gap: 3px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 8px;
    gap: 2px;
  }
`;

const StarIcon = styled(FaStar)`
  color: #FF385C;
  font-size: 14px;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const RatingNumber = styled.span`
  font-weight: 600;
  color: #222222;
  
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const ReviewsCount = styled.span`
  color: #717171;
  font-size: 14px;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const Details = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  font-size: 12px;
  color: #717171;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 10px;
    margin-bottom: 10px;
    font-size: 11px;
  }
  
  @media (max-width: 480px) {
    gap: 8px;
    margin-bottom: 8px;
    font-size: 10px;
  }
`;

const DetailItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  
  @media (max-width: 480px) {
    gap: 3px;
  }
`;

const Amenities = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  
  @media (max-width: 768px) {
    gap: 6px;
    margin-bottom: 10px;
  }
  
  @media (max-width: 480px) {
    gap: 4px;
    margin-bottom: 8px;
  }
`;

const AmenityBadge = styled.span`
  background: #f8f9fa;
  color: #717171;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  transition: all 0.3s ease;
  
  ${Card}:hover & {
    background: #FF385C;
    color: #FFFFFF;
  }
  
  @media (max-width: 768px) {
    padding: 3px 6px;
    font-size: 10px;
  }
  
  @media (max-width: 480px) {
    padding: 2px 5px;
    font-size: 9px;
  }
`;

const Availability = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #717171;
  font-size: 12px;
  margin-bottom: 12px;
  opacity: 0.8;
  
  @media (max-width: 768px) {
    font-size: 11px;
    margin-bottom: 10px;
    gap: 4px;
  }
  
  @media (max-width: 480px) {
    font-size: 10px;
    margin-bottom: 8px;
    gap: 3px;
  }
`;

const Price = styled.div`
  margin-bottom: 16px;
  
  @media (max-width: 768px) {
    margin-bottom: 12px;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 10px;
  }
`;

const PriceAmount = styled.span`
  font-size: 1.2rem;
  font-weight: 600;
  color: #222222;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const PricePeriod = styled.span`
  color: #717171;
  font-size: 14px;
  
  @media (max-width: 768px) {
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const BookButton = styled.button`
  width: 100%;
  background: #FF385C;
  color: white;
  border: none;
  padding: 12px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  
  &:hover {
    background: #e31c5f;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 56, 92, 0.3);
  }
  
  @media (max-width: 768px) {
    padding: 10px;
    font-size: 13px;
    gap: 6px;
    
    &:hover {
      transform: translateY(-1px);
    }
  }
  
  @media (max-width: 480px) {
    padding: 8px;
    font-size: 12px;
    gap: 4px;
    
    &:hover {
      transform: none;
    }
  }
`;

const ListingCard = ({ listing, onCardClick }) => {
  const navigate = useNavigate();
  const [likeCount, setLikeCount] = useState(listing.likeCount || 0);

  const handleLikeChange = (newLikeCount) => {
    setLikeCount(newLikeCount);
  };

  const handleShareClick = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: `Check out this amazing ${listing.type} in ${listing.location}`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${listing.title} - ${listing.location}`);
    }
  };

  const handleCardClick = () => {
    if (onCardClick) {
      onCardClick(listing);
    } else {
      navigate(`/listing/${listing._id}`);
    }
  };

  const getTypeIcon = () => {
    return listing.type === 'apartment' ? <FaHome /> : <FaCar />;
  };

  const getTypeLabel = () => {
    return listing.type === 'apartment' ? 'Apartment' : 'Car';
  };

  const getDetails = () => {
    if (listing.type === 'apartment') {
      return [
        { icon: <FaBed />, text: `${listing.beds || 0} beds` },
        { icon: <FaBath />, text: `${listing.bathrooms || 0} baths` },
        { icon: <FaUsers />, text: `${listing.guests || 0} guests` }
      ];
    } else {
      return [
        { icon: <FaUsers />, text: `${listing.carDetails?.seats || 0} seats` },
        { icon: <FaCar />, text: listing.carDetails?.transmission || 'Auto' },
        { icon: <FaCar />, text: listing.carDetails?.fuelType || 'Gas' }
      ];
    }
  };

  const getAmenities = () => {
    const amenities = listing.amenities || listing.carDetails?.features || [];
    return amenities.slice(0, 2);
  };

  const getAvailability = () => {
    if (listing.type === 'apartment') {
      return 'Available for 5 nights';
    } else {
      return 'Available today';
    }
  };

  const getPricePeriod = () => {
    return listing.type === 'apartment' ? '/night' : '/day';
  };

  return (
    <Card onClick={handleCardClick}>
      <ImageContainer>
        <Image 
          src={listing.images?.[0] || 'https://via.placeholder.com/300x200?text=No+Image'} 
          alt={listing.title}
          loading="lazy"
        />
        <ImageOverlay>
          <TypeBadge>
            {getTypeIcon()}
            {getTypeLabel()}
          </TypeBadge>
          <ActionButtons>
            <LikeButton 
              listingId={listing._id}
              likeCount={likeCount}
              onLikeChange={handleLikeChange}
              showCount={false}
            />
            <ActionButton onClick={handleShareClick}>
              <FaShare />
            </ActionButton>
          </ActionButtons>
        </ImageOverlay>
        
        {/* Badges */}
        {listing.instantBook && (
          <Badge className="instant">
            <FaClock /> Instant Book
          </Badge>
        )}
        {listing.new && (
          <Badge className="new">New</Badge>
        )}
        {listing.trending && (
          <Badge className="trending">
            <FaStar /> Trending
          </Badge>
        )}
        {listing.popular && (
          <Badge className="popular">Popular</Badge>
        )}
        {listing.superhost && (
          <Badge className="superhost">
            <FaAward /> Superhost
          </Badge>
        )}
        {listing.verified && (
          <Badge className="verified">
            <FaCheckCircle /> Verified
          </Badge>
        )}
      </ImageContainer>

      <Content>
        <Title>{listing.title}</Title>
        
        <Location>
          <FaMapMarkerAlt />
          {listing.address ? listing.address : (listing.location && listing.location.coordinates ? `${listing.location.coordinates[1]}, ${listing.location.coordinates[0]}` : 'No location')}
          <Distance>{listing.distance || '2.5 km away'}</Distance>
        </Location>
        
        <Rating>
          <StarIcon />
          <RatingNumber>{listing.rating || 4.5}</RatingNumber>
          <ReviewsCount>({listing.reviews || 0} reviews)</ReviewsCount>
        </Rating>
        
        <Details>
          {getDetails().map((detail, index) => (
            <DetailItem key={index}>
              {detail.icon} {detail.text}
            </DetailItem>
          ))}
        </Details>
        
        <Amenities>
          {getAmenities().map((amenity, index) => (
            <AmenityBadge key={index}>{amenity}</AmenityBadge>
          ))}
        </Amenities>
        
        <Availability>
          <FaCalendarAlt />
          {getAvailability()}
        </Availability>
        
        <Price>
          <PriceAmount>${listing.price}</PriceAmount>
          <PricePeriod>{getPricePeriod()}</PricePeriod>
        </Price>
        
        <BookButton>
          <FaCalendarAlt /> Book Now
        </BookButton>
      </Content>
    </Card>
  );
};

export default ListingCard; 