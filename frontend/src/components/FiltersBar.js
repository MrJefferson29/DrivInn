import React, { useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { createPortal } from 'react-dom';
import LocationFilter from './filters/LocationFilter';
import DateRangeFilter from './filters/DateRangeFilter';
import PriceRangeSlider from './filters/PriceRangeSlider';
import TypeMultiSelect from './filters/TypeMultiSelect';
import AmenitiesMultiSelect from './filters/AmenitiesMultiSelect';
import GuestsRangeSlider from './filters/GuestsRangeSlider';
import ActiveFiltersChips from './filters/ActiveFiltersChips';
import { useFilters } from '../context/FiltersContext';
import { FaMapMarkerAlt, FaCalendarAlt, FaUsers, FaDollarSign, FaHome, FaFilter, FaThList, FaSearch, FaTimes } from 'react-icons/fa';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { transform: translateY(40px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const Pill = styled.button`
  border: none;
  border-radius: 22px;
  padding: 14px 22px;
  margin: 0 6px;
  background: ${({ active }) => (active ? '#FF385C' : 'rgba(255,255,255,0.92)')};
  color: ${({ active }) => (active ? '#fff' : '#222')};
  font-weight: 600;
  font-size: 15px;
  box-shadow: ${({ active }) =>
    active ? '0 2px 8px rgba(255,56,92,0.10)' : '0 1px 4px rgba(0,0,0,0.04)'};
  cursor: pointer;
  transition: background 0.18s, color 0.18s, box-shadow 0.18s;
  outline: ${({ active }) => (active ? '2px solid #FF385C' : 'none')};
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 65px;
  min-height: 40px;
  position: relative;
  &:hover, &:focus {
    background: ${({ active }) => (active ? '#FF385C' : '#f3f3f3')};
    color: #FF385C;
    box-shadow: 0 4px 16px rgba(255,56,92,0.10);
  }
  @media (max-width: 700px) {
    border-radius: 28px;
    padding: 16px 24px;
    font-size: 16px;
    min-width: 100px;
    min-height: 44px;
    margin: 0 8px;
    gap: 10px;
    box-shadow: none;
    background: ${({ active }) => (active ? '#FF385C' : 'rgba(255,255,255,0.85)')};
    &:hover, &:focus {
      background: ${({ active }) => (active ? '#FF385C' : '#f0f0f0')};
      color: #FF385C;
    }
  }
`;

const Bar = styled.div`
  background: rgba(255,255,255,0.96);
  border-radius: 40px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.10);
  border: 1.5px solid #f0f0f0;
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
  align-items: center;
  justify-content: center;
  padding: 8px 18px 8px 18px;
  min-width: 320px;
  max-width: 900px;
  width: 100%;
  position: relative;
  margin: 0 auto;
  z-index: 1;
  @media (max-width: 700px) {
    background: rgba(255,255,255,0.92);
    border-radius: 28px;
    box-shadow: 0 2px 16px rgba(0,0,0,0.13);
    border: 1.5px solid #ececec;
    padding: 12px 6px;
    min-width: unset;
    max-width: 99vw;
    overflow-x: auto;
    overflow-y: hidden;
    flex-wrap: nowrap;
    gap: 18px;
    justify-content: flex-start;
    -ms-overflow-style: none;
    scrollbar-width: none;
    height: 56px;
    &::-webkit-scrollbar { display: none; }
  }
`;

const BarWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0 12px 0;
  background: transparent;
  margin-top: 80px;
  @media (max-width: 700px) {
    margin-top: 100px; /* Increased margin to ensure FiltersBar is below fixed navbar */
    padding: 8px 0 6px 0;
  }
`;

const ResetBtn = styled.button`
  border: none;
  border-radius: 999px;
  background: #f7f7f7;
  color: #FF385C;
  font-weight: 600;
  font-size: 16px;
  padding: 10px 22px;
  margin-left: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  &:hover, &:focus {
    background: #ffe1e7;
    color: #e31c5f;
  }
`;

const FilterPill = ({ label, icon: Icon, active, onClick }) => (
  <Pill active={active} onClick={onClick}>
    {Icon && <Icon style={{ fontSize: 18, marginRight: 4 }} />}
    {label}
  </Pill>
);

const FiltersBar = () => {
  const { filters, resetFilters, updateFilter } = useFilters();
  const [open, setOpen] = useState(null); // which pill is open

  // Helper to get pill active state
  const isActive = (key) => {
    switch (key) {
      case 'location': return !!filters.location;
      case 'date': return !!(filters.dateRange.start || filters.dateRange.end);
      case 'guests': return filters.guests[0] !== 1 || filters.guests[1] !== 10;
      case 'price': return filters.price[0] !== 0 || filters.price[1] !== 1000;
      case 'type': return filters.type.length > 0;
      case 'amenities': return filters.amenities.length > 0;
      default: return false;
    }
  };

  // Handlers for each filter
  const handleApplyLocation = (value) => {
    updateFilter('location', value);
    setOpen(null);
  };
  const handleApplyDate = (value) => {
    updateFilter('dateRange', value);
    setOpen(null);
  };
  const handleApplyGuests = (value) => {
    updateFilter('guests', value);
    setOpen(null);
  };
  const handleApplyPrice = (value) => {
    updateFilter('price', value);
    setOpen(null);
  };
  const handleApplyType = (value) => {
    updateFilter('type', value);
    setOpen(null);
  };
  const handleApplyAmenities = (value) => {
    updateFilter('amenities', value);
    setOpen(null);
  };
  const handleCancel = () => setOpen(null);

  // Popover/modal for each filter
  const renderPopover = () => {
    switch (open) {
      case 'location':
        return <Popover onClose={handleCancel}><LocationFilter value={filters.location} onApply={handleApplyLocation} onCancel={handleCancel} /></Popover>;
      case 'date':
        return <Popover onClose={handleCancel}><DateRangeFilter value={filters.dateRange} onApply={handleApplyDate} onCancel={handleCancel} /></Popover>;
      case 'guests':
        return <Popover onClose={handleCancel}><GuestsRangeSlider value={filters.guests} onApply={handleApplyGuests} onCancel={handleCancel} /></Popover>;
      case 'price':
        return <Popover onClose={handleCancel}><PriceRangeSlider value={filters.price} onApply={handleApplyPrice} onCancel={handleCancel} /></Popover>;
      case 'type':
        return <Popover onClose={handleCancel}><TypeMultiSelect value={filters.type} onApply={handleApplyType} onCancel={handleCancel} /></Popover>;
      case 'amenities':
        return <Popover onClose={handleCancel}><AmenitiesMultiSelect value={filters.amenities} onApply={handleApplyAmenities} onCancel={handleCancel} /></Popover>;
      case 'filters':
        return <Popover onClose={handleCancel}><ActiveFiltersChips /><button onClick={resetFilters} style={{marginTop:12}}>Reset All</button></Popover>;
      default:
        return null;
    }
  };

  // Responsive, professional popover/modal
  const Popover = ({ children, onClose }) => {
    return createPortal(
      <PopoverBG onClick={onClose}>
        <PopoverBox onClick={e => e.stopPropagation()}>
          <CloseBtn onClick={onClose} aria-label="Close"><FaTimes /></CloseBtn>
          {children}
        </PopoverBox>
      </PopoverBG>,
      document.body
    );
  };

  return (
    <BarWrapper>
      <Bar>
        <FilterPill label="Where" active={isActive('location')} onClick={() => setOpen('location')} />
        <FilterPill label="Checkin/out" active={isActive('date')} onClick={() => setOpen('date')} />
        <FilterPill label="Who"  active={isActive('guests')} onClick={() => setOpen('guests')} />
        <FilterPill label="Price"  active={isActive('price')} onClick={() => setOpen('price')} />
        <FilterPill label="Type" active={isActive('type')} onClick={() => setOpen('type')} />
        <FilterPill label="Amenities" active={isActive('amenities')} onClick={() => setOpen('amenities')} />
        <ResetBtn onClick={resetFilters}>Reset Filters</ResetBtn>
        {open && renderPopover()}
      </Bar>
    </BarWrapper>
  );
};

const PopoverBG = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.22);
  backdrop-filter: blur(2.5px);
  z-index: 1200;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  animation: ${fadeIn} 0.18s;
`;

const PopoverBox = styled.div`
  margin-top: 90px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  padding: 40px 32px 32px 32px;
  min-width: 340px;
  max-width: 420px;
  width: 100%;
  position: relative;
  z-index: 1300;
  animation: ${slideUp} 0.22s cubic-bezier(.4,1.6,.6,1);
  @media (max-width: 700px) {
    min-width: 90vw;
    max-width: 95vw;
    padding: 18px 8px 18px 8px;
  }
`;

const CloseBar = styled.div`
  display: none;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 18px;
  right: 24px;
  background: none;
  border: none;
  font-size: 32px;
  color: #888;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 50%;
  transition: background 0.18s;
  &:hover, &:focus {
    background: #f7f7f7;
    color: #FF385C;
  }
`;

export default FiltersBar;