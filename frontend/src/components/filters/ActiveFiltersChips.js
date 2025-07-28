import React from 'react';
import { useFilters } from '../../context/FiltersContext';

const getActiveChips = (filters) => {
  const chips = [];
  if (filters.location) chips.push({ key: 'location', label: filters.location });
  if (filters.dateRange.start || filters.dateRange.end) chips.push({ key: 'dateRange', label: `${filters.dateRange.start || ''} - ${filters.dateRange.end || ''}` });
  if (filters.price[0] !== 0 || filters.price[1] !== 1000) chips.push({ key: 'price', label: `$${filters.price[0]} - $${filters.price[1]}` });
  if (filters.type.length > 0) chips.push({ key: 'type', label: filters.type.join(', ') });
  if (filters.amenities.length > 0) chips.push({ key: 'amenities', label: filters.amenities.join(', ') });
  if (filters.guests[0] !== 1 || filters.guests[1] !== 10) chips.push({ key: 'guests', label: `${filters.guests[0]} - ${filters.guests[1]} guests` });
  return chips;
};

const ActiveFiltersChips = () => {
  const { filters, updateFilter } = useFilters();
  const chips = getActiveChips(filters);

  const handleRemove = (key) => {
    switch (key) {
      case 'location': updateFilter('location', ''); break;
      case 'dateRange': updateFilter('dateRange', { start: null, end: null }); break;
      case 'price': updateFilter('price', [0, 1000]); break;
      case 'type': updateFilter('type', []); break;
      case 'amenities': updateFilter('amenities', []); break;
      case 'guests': updateFilter('guests', [1, 10]); break;
      default: break;
    }
  };

  if (chips.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {chips.map(chip => (
        <span key={chip.key} style={{ background: '#eee', borderRadius: 16, padding: '4px 12px', marginRight: 4, display: 'flex', alignItems: 'center' }}>
          {chip.label}
          <button onClick={() => handleRemove(chip.key)} style={{ marginLeft: 6, background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>×</button>
        </span>
      ))}
    </div>
  );
};

export default ActiveFiltersChips; 