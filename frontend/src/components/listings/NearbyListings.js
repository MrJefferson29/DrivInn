import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Spinner, Alert } from 'react-bootstrap';
import { FaMapMarkerAlt, FaCompass, FaChevronRight } from 'react-icons/fa';
import { useListings } from '../../context/ListingsContext';
import ListingCard from '../ListingCard';
import { useMediaQuery } from 'react-responsive';
import { useNavigate } from 'react-router-dom';

const airbnbRed = '#FF385C';
const airbnbDark = '#222222';
const airbnbGray = '#717171';
const airbnbLightGray = '#F7F7F7';

const Container = styled.div`
  padding: 40px 0;
  background: #f7f7f7;
  @media (max-width: 768px) { padding: 24px 0; }
  @media (max-width: 480px) { padding: 20px 0; }
`;
const SectionHeader = styled.div`
  text-align: center;
    margin-bottom: 32px;
  padding: 0 80px;
  @media (max-width: 1200px) { padding: 0 40px; }
  @media (max-width: 768px) { padding: 0 24px; margin-bottom: 24px; }
  @media (max-width: 480px) { padding: 0 12px; margin-bottom: 16px; }
`;
const SectionTitle = styled.h2`
  font-size: 1.6rem;
  font-weight: 300;
  color: ${airbnbDark};
  margin-bottom: 10px;
  margin-left: 5px;
  letter-spacing: -0.02em;
  display: flex;
  align-items: center;
  justify-content: left;
  gap: 12px;
  cursor: pointer;
  transition: color 0.2s ease;
  
  &:hover {
    color: ${airbnbRed};
  }
  
  @media (max-width: 768px) { font-size: 1.5rem; }
  @media (max-width: 480px) { font-size: 1.1rem; }
`;
const SectionSubtitle = styled.p`
  font-size: 1.1rem;
  color: ${airbnbGray};
  margin-bottom: 0;
  line-height: 1.6;
  @media (max-width: 768px) { font-size: 1rem; }
  @media (max-width: 480px) { font-size: 0.9rem; }
`;
const LocationInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: white;
  padding: 10px 20px;
  border-radius: 25px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin: 0 auto 16px auto;
  max-width: 320px;
  font-size: 1rem;
  color: ${airbnbDark};
`;
const ResultsInfo = styled.div`
  padding: 20px 0;
  border-bottom: 1px solid #eee;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto 20px auto;
  padding: 0 80px 20px 80px;
  .results-count { font-size: 1.1rem; font-weight: 600; color: ${airbnbDark}; }
  .results-summary { color: ${airbnbGray}; font-size: 0.9rem; }
  @media (max-width: 1200px) { padding: 0 40px 20px 40px; }
  @media (max-width: 768px) {
    flex-direction: column; gap: 8px; align-items: flex-start; padding: 0 20px 16px 20px; margin-bottom: 16px;
  }
  @media (max-width: 480px) { padding: 0 12px 12px 12px; margin-bottom: 12px; }
`;
const ResponsiveListingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  padding: 0 40px 8px 40px;
  max-width: 1400px;
  margin: 0 auto;
  @media (max-width: 1200px) { grid-template-columns: repeat(3, 1fr); gap: 18px; padding: 0 20px 8px 20px; }
  @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); gap: 14px; padding: 0 10px 8px 10px; }
  @media (max-width: 700px) {
    margin-left: 5px;
    display: flex; flex-direction: row; overflow-x: auto; gap: 12px; padding: 0 8px 6px 8px; scroll-snap-type: x mandatory;
    & > div { scroll-snap-align: start; }
    
    /* Hide scrollbar for webkit browsers */
    &::-webkit-scrollbar {
      display: none;
    }
    
    /* Hide scrollbar for Firefox */
    scrollbar-width: none;
    
    /* Hide scrollbar for IE/Edge */
    -ms-overflow-style: none;
  }
`;
const LoadingContainer = styled.div`
  display: flex; justify-content: center; align-items: center; padding: 60px 20px;
  @media (max-width: 768px) { padding: 40px 16px; }
  @media (max-width: 480px) { padding: 30px 12px; }
`;
const LoadingSpinner = styled.div`
  text-align: center;
  .spinner-border { width: 3rem; height: 3rem; color: ${airbnbRed}; @media (max-width: 480px) { width: 2.5rem; height: 2.5rem; } }
  h4 { margin-top: 16px; color: ${airbnbGray}; font-weight: 500; @media (max-width: 768px) { font-size: 1rem; margin-top: 12px; } @media (max-width: 480px) { font-size: 0.9rem; margin-top: 10px; } }
`;
const ErrorContainer = styled.div`
  padding: 40px 20px; text-align: center;
  @media (max-width: 768px) { padding: 30px 16px; }
  @media (max-width: 480px) { padding: 24px 12px; }
`;
const EmptyState = styled.div`
  text-align: center; padding: 80px 20px; color: ${airbnbGray};
  .empty-icon { font-size: 4rem; color: #ddd; margin-bottom: 24px; @media (max-width: 768px) { font-size: 3rem; margin-bottom: 20px; } @media (max-width: 480px) { font-size: 2.5rem; margin-bottom: 16px; } }
  h3 { font-size: 1.5rem; font-weight: 600; margin-bottom: 12px; color: ${airbnbDark}; @media (max-width: 768px) { font-size: 1.25rem; margin-bottom: 10px; } @media (max-width: 480px) { font-size: 1.1rem; margin-bottom: 8px; } }
  p { font-size: 1rem; margin-bottom: 24px; line-height: 1.6; @media (max-width: 768px) { font-size: 0.9rem; margin-bottom: 20px; } @media (max-width: 480px) { font-size: 0.85rem; margin-bottom: 16px; } }
`;
const RetryButton = styled.button`
  background: #FF385C; color: white; border: none; padding: 10px 22px; border-radius: 8px; font-weight: 600; cursor: pointer; margin-top: 0; font-size: 1rem;
  transition: background 0.18s, color 0.18s;
  &:hover { background: #e31c5f; }
  @media (max-width: 768px) { padding: 8px 16px; font-size: 0.95rem; }
  @media (max-width: 480px) { padding: 7px 12px; font-size: 0.9rem; }
`;

function parseCityCountry(location) {
  if (!location) return { city: '', country: '' };
  if (typeof location !== 'string') return { city: '', country: '' };
  const [city, ...rest] = location.split(',').map(s => s.trim());
  return { city: city || '', country: rest.join(', ') || '' };
}

const NearbyListings = () => {
  const { listings } = useListings();
  const [userCity, setUserCity] = useState('');
  const [userCountry, setUserCountry] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [manualMode, setManualMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const isHorizontal = useMediaQuery({ maxWidth: 700 });
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    setError('');
    if (!navigator.geolocation) {
      setManualMode(true);
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`);
          const data = await res.json();
          const address = data.address || {};
          setUserCity(address.city || address.town || address.village || '');
          setUserCountry(address.country || '');
          setLoading(false);
        } catch {
          setManualMode(true);
          setLoading(false);
        }
      },
      () => {
        setManualMode(true);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    if (!manualCity.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?city=${encodeURIComponent(manualCity)}&format=json&limit=1`);
      const data = await res.json();
      if (data && data.length > 0) {
        const address = data[0].display_name.split(',');
        setUserCity(address[0].trim());
        setUserCountry(address[address.length - 1].trim());
        setManualMode(false);
      } else {
        setError('City not found. Please try another city.');
      }
    } catch {
      setError('Failed to look up city.');
    }
    setLoading(false);
  };

  let filtered = [];
  if (userCity && userCountry) {
    filtered = listings.filter(l =>
      l.city && l.country &&
      l.city.toLowerCase() === userCity.toLowerCase() &&
      l.country.toLowerCase() === userCountry.toLowerCase()
    );
    if (filtered.length === 0) {
      filtered = listings.filter(l =>
        l.country && l.country.toLowerCase() === userCountry.toLowerCase()
      );
    }
  }

  // Limit to 8 listings
  const displayedListings = filtered.slice(0, 8);

  const handleTitleClick = () => {
    const locationParams = userCity && userCountry ? `?city=${encodeURIComponent(userCity)}&country=${encodeURIComponent(userCountry)}` : '';
    navigate(`/more-like-this/nearby${locationParams}`);
  };

    return (
    <Container>
        <SectionHeader>
        <SectionTitle onClick={handleTitleClick}>
          Listings in {userCity} <FaChevronRight />
        </SectionTitle>
        <SectionSubtitle>Find amazing stays and experiences close to your location</SectionSubtitle>
        {(userCity || userCountry) && (
          <LocationInfo>
            <FaMapMarkerAlt />
            <span>{userCity}{userCity && userCountry ? ', ' : ''}{userCountry}</span>
            <RetryButton onClick={() => { setManualMode(true); setError(''); }}>Change Location</RetryButton>
          </LocationInfo>
        )}
        </SectionHeader>
      {loading ? (
        <LoadingContainer>
          <LoadingSpinner>
            <Spinner animation="border" />
            <h4>Loading nearby listings...</h4>
          </LoadingSpinner>
        </LoadingContainer>
      ) : manualMode ? (
        <form onSubmit={handleManualSubmit} style={{ textAlign: 'center', margin: '24px 0' }}>
          <input
            type="text"
            value={manualCity}
            onChange={e => setManualCity(e.target.value)}
            placeholder="Enter your city"
            style={{ padding: '10px 18px', borderRadius: 8, border: '1.5px solid #ccc', fontSize: 16, marginRight: 8 }}
          />
          <RetryButton type="submit">Search</RetryButton>
          {error && <div style={{ color: '#c00', marginTop: 12 }}>{error}</div>}
        </form>
      ) : filtered.length === 0 ? (
        <EmptyState>
          <div className="empty-icon">🏠</div>
          <h3>No listings found in {userCity} {userCountry}</h3>
          <p>We couldn't find any listings in your city or country. Try another location.</p>
          <RetryButton onClick={() => { setManualMode(true); setError(''); }}>Change Location</RetryButton>
        </EmptyState>
      ) : (
        <>
          <ResultsInfo>
            <div className="results-count">
              {displayedListings.length} of {filtered.length} {filtered.length === 1 ? 'listing' : 'listings'} shown nearby
            </div>
          </ResultsInfo>
          <ResponsiveListingsGrid>
            {displayedListings.map((listing) => (
              <div key={listing._id || listing.id} style={isHorizontal ? { minWidth: '220px', maxWidth: '260px', flex: '0 0 auto' } : {}}>
                <ListingCard listing={listing} {...(isHorizontal ? { horizontal: true } : {})} />
              </div>
          ))}
          </ResponsiveListingsGrid>
        </>
      )}
    </Container>
  );
};

export default NearbyListings; 