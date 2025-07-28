import React, { useState } from 'react';
import styled from 'styled-components';
import { FaMapMarkerAlt, FaTimes } from 'react-icons/fa';
import { useFilters } from '../../context/FiltersContext';

const worldCities = [
  'New York, United States',
  'London, United Kingdom',
  'Paris, France',
  'Tokyo, Japan',
  'Venice, Italy',
  'Los Angeles, United States',
  'Toronto, Canada',
  'Sydney, Australia',
  'Cape Town, South Africa',
  'Rio de Janeiro, Brazil',
];

const SectionTitle = styled.div`
  font-size: 1.35rem;
  font-weight: 700;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  @media (max-width: 700px) {
    font-size: 1.5rem;
    margin-bottom: 24px;
    justify-content: center;
    width: 100%;
    text-align: center;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  width: 100%;
  margin-bottom: 18px;
  @media (max-width: 700px) {
    margin-bottom: 28px;
    width: 100%;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 18px 48px 18px 48px;
  border-radius: 16px;
  border: 1.5px solid #ddd;
  font-size: 1.15rem;
  background: #fafbfc;
  outline: none;
  transition: border 0.2s;
  @media (max-width: 700px) {
    font-size: 1.25rem;
    padding: 22px 48px 22px 48px;
    border-radius: 22px;
  }
  &:focus {
    border: 1.5px solid #FF385C;
    background: #fff;
  }
`;

const InputIcon = styled(FaMapMarkerAlt)`
  position: absolute;
  left: 18px;
  top: 50%;
  transform: translateY(-50%);
  color: #FF385C;
  font-size: 1.3rem;
`;

const ClearBtn = styled.button`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #aaa;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  @media (max-width: 700px) {
    font-size: 2rem;
    right: 12px;
  }
  &:hover {
    color: #FF385C;
  }
`;

const Suggestions = styled.div`
  margin-top: 2px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  border: 1px solid #eee;
  max-height: 260px;
  overflow-y: auto;
  @media (max-width: 700px) {
    font-size: 1.15rem;
    border-radius: 22px;
    margin-top: 8px;
  }
`;

const SuggestionCard = styled.div`
  padding: 22px 28px;
  cursor: pointer;
  font-size: 1.15rem;
  color: #333;
  border-bottom: 1px solid #f5f5f5;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  transition: background 0.15s;
  @media (max-width: 700px) {
    font-size: 1.25rem;
    padding: 28px 32px;
  }
  &:hover {
    background: #fff0f4;
    color: #FF385C;
  }
  &:last-child {
    border-bottom: none;
  }
`;

const BottomBar = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 32px;
  @media (max-width: 700px) {
    margin-top: 40px;
    width: 100%;
    justify-content: center;
  }
`;

const ActionBtn = styled.button`
  background: none;
  border: 1.5px solid #FF385C;
  color: #FF385C;
  border-radius: 8px;
  padding: 8px 20px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  &:hover {
    background: #FF385C;
    color: #fff;
  }
`;

const LocationFilter = ({ value = '', onApply, onCancel }) => {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState([]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setSuggestions(
      val.length > 1
        ? worldCities.filter(city => city.toLowerCase().includes(val.toLowerCase()))
        : []
    );
  };

  const handleSelect = (city) => {
    setQuery(city);
    setSuggestions([]);
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
  };

  const handleApply = () => {
    onApply(query);
  };

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 0 24px 0' }}>
      <SectionTitle><FaMapMarkerAlt /> Where</SectionTitle>
      <InputWrapper>
        <Input
          type="text"
          placeholder="Search city or country..."
          value={query}
          onChange={handleChange}
        />
        <InputIcon />
        {query && <ClearBtn onClick={handleClear} aria-label="Clear"><FaTimes /></ClearBtn>}
        {suggestions.length > 0 && (
          <Suggestions>
            {suggestions.map(city => (
              <SuggestionCard key={city} onClick={() => handleSelect(city)}>
                <FaMapMarkerAlt style={{ color: '#FF385C' }} />
                {city}
              </SuggestionCard>
            ))}
          </Suggestions>
        )}
      </InputWrapper>
      <BottomBar style={{ justifyContent: 'center', gap: 12 }}>
        <ActionBtn onClick={handleClear}>Clear</ActionBtn>
        <ActionBtn style={{ borderColor: '#aaa', color: '#444' }} onClick={onCancel}>Cancel</ActionBtn>
        <ActionBtn style={{ background: '#FF385C', color: '#fff', borderColor: '#FF385C' }} onClick={handleApply}>Apply</ActionBtn>
      </BottomBar>
    </div>
  );
};

export default LocationFilter; 