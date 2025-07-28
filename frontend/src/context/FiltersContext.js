import React, { createContext, useContext, useState } from 'react';

const FiltersContext = createContext();

export const useFilters = () => useContext(FiltersContext);

export const FiltersProvider = ({ children }) => {
  const [filters, setFilters] = useState({
    location: '',
    dateRange: { start: null, end: null },
    price: [0, 1000],
    type: [],
    amenities: [],
    guests: [1, 10],
  });

  const updateFilter = (key, value) => setFilters(f => ({ ...f, [key]: value }));
  const resetFilters = () => setFilters({
    location: '',
    dateRange: { start: null, end: null },
    price: [0, 1000],
    type: [],
    amenities: [],
    guests: [1, 10],
  });

  return (
    <FiltersContext.Provider value={{ filters, updateFilter, resetFilters }}>
      {children}
    </FiltersContext.Provider>
  );
}; 