import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaSearch, 
  FaMapMarkerAlt, 
  FaCalendarAlt, 
  FaUsers, 
  FaFilter,
  FaTimes,
  FaChevronDown,
  FaChevronUp,
  FaStar,
  FaHome,
  FaCar,
  FaDollarSign,
  FaWifi,
  FaParking,
  FaSnowflake,
  FaUtensils,
  FaSwimmingPool,
  FaDumbbell,
  FaDog,
  FaBaby,
  FaWheelchair,
  FaSmoking,
  FaSmokingBan
} from 'react-icons/fa';
// import { useListings } from '../context/ListingsContext';
import worldCitiesData from '../data/worldCitiesComplete.json';

// Airbnb color palette
const airbnbRed = '#FF385C';
const airbnbDark = '#222222';
const airbnbGray = '#717171';
const airbnbLightGray = '#F7F7F7';
const airbnbBorder = '#DDDDDD';

// Styled Components
const SearchContainer = styled.div`
  position: relative;
  max-width: 850px;
  margin: 0 auto;
  background: #FFFFFF;
  border-radius: 40px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.12);
  border: 1px solid ${airbnbBorder};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  
  &:hover {
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  }
  
  @media (max-width: 768px) {
    border-radius: 16px;
    margin: 0 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  
  @media (max-width: 480px) {
    margin: 0 12px;
    border-radius: 12px;
  }
`;

const SearchBar = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 40px;
  background: #FFFFFF;
  
  @media (max-width: 768px) {
    flex-direction: column;
    padding: 12px;
    border-radius: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 8px;
  }
`;

const SearchInput = styled.div`
  flex: 1;
  position: relative;
  padding: 16px 24px;
  border-right: 1px solid ${airbnbBorder};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${airbnbLightGray};
  }
  
  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid ${airbnbBorder};
    width: 100%;
    padding: 12px 16px;
  }
  
  @media (max-width: 480px) {
    padding: 10px 12px;
  }
`;

const DateInput = styled.div`
  flex: 1;
  padding: 16px 24px;
  border-right: 1px solid ${airbnbBorder};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${airbnbLightGray};
  }
  
  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid ${airbnbBorder};
    width: 100%;
    padding: 12px 16px;
  }
  
  @media (max-width: 480px) {
    padding: 10px 12px;
  }
`;

const GuestsInput = styled.div`
  flex: 1;
  padding: 16px 24px;
  border-right: 1px solid ${airbnbBorder};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${airbnbLightGray};
  }
  
  @media (max-width: 768px) {
    border-right: none;
    border-bottom: 1px solid ${airbnbBorder};
    width: 100%;
    padding: 12px 16px;
  }
  
  @media (max-width: 480px) {
    padding: 10px 12px;
  }
`;

const SearchButton = styled.button`
  background: ${airbnbRed};
  color: white;
  border: none;
  padding: 16px 32px;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px;
  font-size: 16px;
  
  &:hover {
    background: #e31c5f;
    transform: scale(1.02);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    margin: 8px 0;
    padding: 14px 24px;
    font-size: 15px;
  }
  
  @media (max-width: 480px) {
    padding: 12px 20px;
    font-size: 14px;
  }
`;

const InputLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${airbnbDark};
  margin-bottom: 4px;
  
  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const InputValue = styled.div`
  font-size: 14px;
  color: ${airbnbGray};
  display: flex;
  align-items: center;
  gap: 8px;
  
  &.has-value {
    color: ${airbnbDark};
  }
  
  @media (max-width: 480px) {
    font-size: 13px;
    gap: 6px;
  }
`;

const FiltersButton = styled.button`
  background: transparent;
  border: 1px solid ${airbnbBorder};
  padding: 12px 16px;
  border-radius: 25px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  transition: all 0.2s ease;
  margin: 8px;
  
  &:hover {
    border-color: ${airbnbDark};
  }
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    margin: 8px 0;
    padding: 10px 14px;
    font-size: 13px;
  }
  
  @media (max-width: 480px) {
    padding: 8px 12px;
    font-size: 12px;
  }
`;

const FiltersPanel = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  margin-top: 8px;
  z-index: 1000;
  padding: 24px;
  display: ${props => props.isOpen ? 'block' : 'none'};
  
  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    margin: 0;
    border-radius: 0;
    z-index: 9999;
    overflow-y: auto;
    padding: 20px;
  }
  
  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const FiltersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  
  @media (max-width: 768px) {
    position: sticky;
    top: 0;
    background: white;
    padding: 16px 0;
    margin-bottom: 20px;
    border-bottom: 1px solid #eee;
  }
`;

const FiltersTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${airbnbDark};
  margin: 0;
  
  @media (max-width: 480px) {
    font-size: 16px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: ${airbnbGray};
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${airbnbLightGray};
    color: ${airbnbDark};
  }
  
  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 24px;
  
  @media (max-width: 480px) {
    margin-bottom: 20px;
  }
`;

const FilterTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: ${airbnbDark};
  margin-bottom: 12px;
  
  @media (max-width: 480px) {
    font-size: 14px;
    margin-bottom: 10px;
  }
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const FilterOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  border: 1px solid ${airbnbBorder};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 14px;
  
  &:hover {
    border-color: ${airbnbRed};
    background: #fff5f5;
  }
  
  input[type="checkbox"]:checked + & {
    border-color: ${airbnbRed};
    background: #fff5f5;
    color: ${airbnbRed};
  }
  
  @media (max-width: 480px) {
    padding: 10px;
    font-size: 13px;
    gap: 6px;
  }
`;

const PriceRange = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

const PriceInput = styled.input`
  flex: 1;
  padding: 12px;
  border: 1px solid ${airbnbBorder};
  border-radius: 8px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: ${airbnbRed};
  }
  
  @media (max-width: 480px) {
    padding: 10px;
    font-size: 13px;
  }
`;

const SortSelect = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid ${airbnbBorder};
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: ${airbnbRed};
  }
  
  @media (max-width: 480px) {
    padding: 10px;
    font-size: 13px;
  }
`;

const ApplyButton = styled.button`
  background: ${airbnbRed};
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  
  &:hover {
    background: #e31c5f;
  }
  
  @media (max-width: 768px) {
    position: sticky;
    bottom: 0;
    margin-top: 20px;
    padding: 16px 24px;
    font-size: 16px;
  }
`;

const LocationDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid ${airbnbBorder};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1001;
  
  @media (max-width: 768px) {
    max-height: 150px;
  }
`;

const LocationOption = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.2s ease;
  
  &:hover {
    background: ${airbnbLightGray};
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 480px) {
    padding: 10px 12px;
  }
`;

const GuestsPanel = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid ${airbnbBorder};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  padding: 16px;
  z-index: 1001;
  
  @media (max-width: 768px) {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 90%;
    max-width: 300px;
    border-radius: 12px;
  }
`;

const GuestRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 480px) {
    padding: 10px 0;
  }
`;

const GuestInfo = styled.div`
  flex: 1;
`;

const GuestLabel = styled.div`
  font-weight: 600;
  color: ${airbnbDark};
  font-size: 14px;
  
  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const GuestDescription = styled.div`
  font-size: 12px;
  color: ${airbnbGray};
  
  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const GuestCounter = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  @media (max-width: 480px) {
    gap: 8px;
  }
`;

const CounterButton = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid ${airbnbBorder};
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
  
  &:hover:not(:disabled) {
    border-color: ${airbnbRed};
    color: ${airbnbRed};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  @media (max-width: 480px) {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }
`;

const CounterValue = styled.span`
  font-weight: 600;
  color: ${airbnbDark};
  min-width: 20px;
  text-align: center;
  
  @media (max-width: 480px) {
    min-width: 16px;
    font-size: 14px;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const SearchFilters = ({ filters, setFilters }) => {
  // Remove useListings context, use props instead
  // Provide a clearFilters function locally
  const clearFilters = () => {
    setFilters({
      location: '',
      type: 'all',
      priceRange: { min: 0, max: 1000 },
      amenities: [],
      guests: 1,
      sortBy: 'recommended',
    });
  };
  
  const [showFilters, setShowFilters] = useState(false);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [showGuestsPanel, setShowGuestsPanel] = useState(false);
  const [locationQuery, setLocationQuery] = useState(filters.location || '');
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [guests, setGuests] = useState({
    adults: filters.guests > 1 ? filters.guests : 1,
    children: 0,
    infants: 0
  });
  const locationInputRef = useRef();

  // Keep local state in sync with filters prop
  useEffect(() => {
    setLocationQuery(filters.location || '');
    setGuests({
      adults: filters.guests > 1 ? filters.guests : 1,
      children: 0,
      infants: 0
    });
  }, [filters.location, filters.guests]);

  // Location autocomplete
  useEffect(() => {
    if (locationQuery.length > 1) {
      const filtered = worldCitiesData.filter(city => 
        city.name.toLowerCase().includes(locationQuery.toLowerCase()) ||
        city.country.toLowerCase().includes(locationQuery.toLowerCase())
      ).slice(0, 8);
      setLocationSuggestions(filtered);
    } else {
      setLocationSuggestions([]);
    }
  }, [locationQuery]);

  const handleLocationSelect = (city) => {
    setFilters({ ...filters, location: `${city.name}, ${city.country}` });
    setLocationQuery(`${city.name}, ${city.country}`);
    setShowLocationDropdown(false);
  };

  const handleGuestsChange = (type, value) => {
    const newGuests = { ...guests, [type]: Math.max(0, value) };
    setGuests(newGuests);
    setFilters({ ...filters, guests: newGuests.adults + newGuests.children });
  };

  const totalGuests = guests.adults + guests.children;

  const amenities = [
    { id: 'WiFi', label: 'WiFi', icon: FaWifi },
    { id: 'Free parking', label: 'Free parking', icon: FaParking },
    { id: 'Air conditioning', label: 'Air conditioning', icon: FaSnowflake },
    { id: 'Kitchen', label: 'Kitchen', icon: FaUtensils },
    { id: 'Pool', label: 'Pool', icon: FaSwimmingPool },
    { id: 'Gym', label: 'Gym', icon: FaDumbbell },
    { id: 'Pets allowed', label: 'Pets allowed', icon: FaDog },
    { id: 'Family friendly', label: 'Family friendly', icon: FaBaby },
    { id: 'Wheelchair accessible', label: 'Wheelchair accessible', icon: FaWheelchair },
  ];

  const handleSearch = () => {
    // Trigger search with current filters (already updated live)
    // Optionally, you could add a callback prop to notify parent
  };

  return (
    <SearchContainer>
      <SearchBar>
        <SearchInput onClick={() => setShowLocationDropdown(!showLocationDropdown)}>
          <InputLabel>Where</InputLabel>
          <InputValue className={filters.location ? 'has-value' : ''}>
            <FaMapMarkerAlt />
            {filters.location || 'Search destinations'}
          </InputValue>
          {showLocationDropdown && (
            <LocationDropdown>
              <input
                ref={locationInputRef}
                type="text"
                placeholder="Search destinations..."
                value={locationQuery}
                onChange={(e) => {
                  setLocationQuery(e.target.value);
                  setFilters({ ...filters, location: e.target.value });
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: 'none',
                  borderBottom: '1px solid #ddd',
                  outline: 'none'
                }}
              />
              {locationSuggestions.map((city, index) => (
                <LocationOption key={index} onClick={() => handleLocationSelect(city)}>
                  <FaMapMarkerAlt />
                  <div>
                    <div>{city.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{city.country}</div>
                  </div>
                </LocationOption>
              ))}
            </LocationDropdown>
          )}
        </SearchInput>

        <DateInput>
          <InputLabel>When</InputLabel>
          <InputValue>
            <FaCalendarAlt />
            Add dates
          </InputValue>
        </DateInput>

        <GuestsInput onClick={() => setShowGuestsPanel(!showGuestsPanel)}>
          <InputLabel>Who</InputLabel>
          <InputValue className={totalGuests > 1 ? 'has-value' : ''}>
            <FaUsers />
            {totalGuests} guest{totalGuests !== 1 ? 's' : ''}
          </InputValue>
          {showGuestsPanel && (
            <GuestsPanel isOpen={showGuestsPanel}>
              <GuestRow>
                <GuestInfo>
                  <GuestLabel>Adults</GuestLabel>
                  <GuestDescription>Ages 13 or above</GuestDescription>
                </GuestInfo>
                <GuestCounter>
                  <CounterButton 
                    onClick={() => handleGuestsChange('adults', guests.adults - 1)}
                    disabled={guests.adults <= 1}
                  >
                    -
                  </CounterButton>
                  <CounterValue>{guests.adults}</CounterValue>
                  <CounterButton 
                    onClick={() => handleGuestsChange('adults', guests.adults + 1)}
                  >
                    +
                  </CounterButton>
                </GuestCounter>
              </GuestRow>
              
              <GuestRow>
                <GuestInfo>
                  <GuestLabel>Children</GuestLabel>
                  <GuestDescription>Ages 2-12</GuestDescription>
                </GuestInfo>
                <GuestCounter>
                  <CounterButton 
                    onClick={() => handleGuestsChange('children', guests.children - 1)}
                    disabled={guests.children <= 0}
                  >
                    -
                  </CounterButton>
                  <CounterValue>{guests.children}</CounterValue>
                  <CounterButton 
                    onClick={() => handleGuestsChange('children', guests.children + 1)}
                  >
                    +
                  </CounterButton>
                </GuestCounter>
              </GuestRow>
              
              <GuestRow>
                <GuestInfo>
                  <GuestLabel>Infants</GuestLabel>
                  <GuestDescription>Under 2</GuestDescription>
                </GuestInfo>
                <GuestCounter>
                  <CounterButton 
                    onClick={() => handleGuestsChange('infants', guests.infants - 1)}
                    disabled={guests.infants <= 0}
                  >
                    -
                  </CounterButton>
                  <CounterValue>{guests.infants}</CounterValue>
                  <CounterButton 
                    onClick={() => handleGuestsChange('infants', guests.infants + 1)}
                  >
                    +
                  </CounterButton>
                </GuestCounter>
              </GuestRow>
            </GuestsPanel>
          )}
        </GuestsInput>

        <SearchButton onClick={handleSearch}>
          <FaSearch />
          Search
        </SearchButton>
      </SearchBar>

      <div style={{ padding: '8px 16px', borderTop: '1px solid #ddd' }}>
        <FiltersButton onClick={() => setShowFilters(!showFilters)}>
          <FaFilter />
          Filters
          {showFilters ? <FaChevronUp /> : <FaChevronDown />}
        </FiltersButton>
      </div>

      {showFilters && (
        <FiltersPanel isOpen={showFilters}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2>Filters</h2>
            <button 
              onClick={clearFilters}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#666', 
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Clear all
            </button>
          </div>

          <FilterSection>
            <h3>Property type</h3>
            <FilterGrid>
              <FilterOption 
                className={filters.type === 'all' ? 'selected' : ''}
                onClick={() => setFilters({ ...filters, type: 'all' })}
              >
                <input 
                  type="radio" 
                  name="type" 
                  checked={filters.type === 'all'}
                  readOnly
                />
                All types
              </FilterOption>
              <FilterOption 
                className={filters.type === 'apartment' ? 'selected' : ''}
                onClick={() => setFilters({ ...filters, type: 'apartment' })}
              >
                <input 
                  type="radio" 
                  name="type" 
                  checked={filters.type === 'apartment'}
                  readOnly
                />
                <FaHome /> Apartments
              </FilterOption>
              <FilterOption 
                className={filters.type === 'car' ? 'selected' : ''}
                onClick={() => setFilters({ ...filters, type: 'car' })}
              >
                <input 
                  type="radio" 
                  name="type" 
                  checked={filters.type === 'car'}
                  readOnly
                />
                <FaCar /> Cars
              </FilterOption>
            </FilterGrid>
          </FilterSection>

          <FilterSection>
            <h3>Price range</h3>
            <PriceRange>
              <input
                type="number"
                placeholder="Min price"
                value={filters.priceRange.min}
                onChange={(e) => setFilters({ ...filters, priceRange: { ...filters.priceRange, min: parseInt(e.target.value) || 0 } })}
              />
              <span>-</span>
              <input
                type="number"
                placeholder="Max price"
                value={filters.priceRange.max}
                onChange={(e) => setFilters({ ...filters, priceRange: { ...filters.priceRange, max: parseInt(e.target.value) || 1000 } })}
              />
            </PriceRange>
          </FilterSection>

          <FilterSection>
            <h3>Amenities</h3>
            <FilterGrid>
              {amenities.map(amenity => (
                <FilterOption 
                  key={amenity.id}
                  className={filters.amenities.includes(amenity.id) ? 'selected' : ''}
                  onClick={() => {
                    const newAmenities = filters.amenities.includes(amenity.id)
                      ? filters.amenities.filter(a => a !== amenity.id)
                      : [...filters.amenities, amenity.id];
                    setFilters({ ...filters, amenities: newAmenities });
                  }}
                >
                  <input 
                    type="checkbox" 
                    checked={filters.amenities.includes(amenity.id)}
                    readOnly
                  />
                  <amenity.icon /> {amenity.label}
                </FilterOption>
              ))}
            </FilterGrid>
          </FilterSection>

          <FilterSection>
            <h3>Sort by</h3>
            <SortSelect 
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            >
              <option value="recommended">Recommended</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest</option>
            </SortSelect>
          </FilterSection>
        </FiltersPanel>
      )}
    </SearchContainer>
  );
};

export default SearchFilters; 