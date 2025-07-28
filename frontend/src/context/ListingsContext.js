import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { listingsAPI } from '../services/api';

// Initial state
const initialState = {
  listings: [],
  filteredListings: [],
  loading: false,
  error: null,
  filters: {
    type: 'all', // 'all', 'apartment', 'car'
    priceRange: { min: 0, max: 1000 },
    location: '',
    amenities: [],
    guests: null,
    bedrooms: null,
    bathrooms: null,
    instantBook: false,
    superhost: false,
    rating: 0,
    sortBy: 'recommended', // 'recommended', 'price_low', 'price_high', 'rating', 'newest'
  },
  pagination: {
    page: 1,
    limit: 12,
    total: 0,
    hasMore: true,
  },
  searchQuery: '',
  selectedListing: null,
};

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_LISTINGS: 'SET_LISTINGS',
  ADD_LISTINGS: 'ADD_LISTINGS',
  SET_FILTERED_LISTINGS: 'SET_FILTERED_LISTINGS',
  SET_FILTERS: 'SET_FILTERS',
  SET_SEARCH_QUERY: 'SET_SEARCH_QUERY',
  SET_SELECTED_LISTING: 'SET_SELECTED_LISTING',
  CLEAR_FILTERS: 'CLEAR_FILTERS',
  UPDATE_PAGINATION: 'UPDATE_PAGINATION',
  TOGGLE_FAVORITE: 'TOGGLE_FAVORITE',
};

// Reducer
const listingsReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    
    case ACTIONS.SET_LISTINGS:
      return { 
        ...state, 
        listings: action.payload,
        filteredListings: action.payload,
        loading: false,
        error: null,
        pagination: { ...state.pagination, page: 1 }
      };
    
    case ACTIONS.ADD_LISTINGS:
      return { 
        ...state, 
        listings: [...state.listings, ...action.payload],
        loading: false,
        error: null
      };
    
    case ACTIONS.SET_FILTERED_LISTINGS:
      return { 
        ...state, 
        filteredListings: action.payload
      };
    
    case ACTIONS.SET_FILTERS:
      return { 
        ...state, 
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 }
      };
    
    case ACTIONS.SET_SEARCH_QUERY:
      return { 
        ...state, 
        searchQuery: action.payload,
        pagination: { ...state.pagination, page: 1 }
      };
    
    case ACTIONS.SET_SELECTED_LISTING:
      return { ...state, selectedListing: action.payload };
    
    case ACTIONS.CLEAR_FILTERS:
      return { 
        ...state, 
        filters: initialState.filters,
        searchQuery: '',
        pagination: { ...state.pagination, page: 1 }
      };
    
    case ACTIONS.UPDATE_PAGINATION:
      return { ...state, pagination: { ...state.pagination, ...action.payload } };
    
    case ACTIONS.TOGGLE_FAVORITE:
      const updatedListings = state.listings.map(listing => 
        listing._id === action.payload 
          ? { ...listing, isFavorite: !listing.isFavorite }
          : listing
      );
      return { 
        ...state, 
        listings: updatedListings,
        filteredListings: updatedListings
      };
    
    default:
      return state;
  }
};

// Filter function
const applyFilters = (listings, filters, searchQuery) => {
  let filtered = [...listings];

  // Search query filter
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(listing => 
      listing.title.toLowerCase().includes(query) ||
      listing.location.toLowerCase().includes(query) ||
      listing.description.toLowerCase().includes(query)
    );
  }

  // Type filter
  if (filters.type !== 'all') {
    filtered = filtered.filter(listing => listing.type === filters.type);
  }

  // Price range filter
  filtered = filtered.filter(listing => 
    listing.price >= filters.priceRange.min && 
    listing.price <= filters.priceRange.max
  );

  // Location filter
  if (filters.location) {
    filtered = filtered.filter(listing => 
      listing.location.toLowerCase().includes(filters.location.toLowerCase())
    );
  }

  // Amenities filter
  if (filters.amenities.length > 0) {
    filtered = filtered.filter(listing => 
      filters.amenities.every(amenity => 
        listing.amenities && listing.amenities.includes(amenity)
      )
    );
  }

  // Guests filter
  if (filters.guests) {
    filtered = filtered.filter(listing => listing.guests >= filters.guests);
  }

  // Bedrooms filter
  if (filters.bedrooms) {
    filtered = filtered.filter(listing => listing.bedrooms >= filters.bedrooms);
  }

  // Bathrooms filter
  if (filters.bathrooms) {
    filtered = filtered.filter(listing => listing.bathrooms >= filters.bathrooms);
  }

  // Rating filter
  if (filters.rating > 0) {
    filtered = filtered.filter(listing => listing.rating >= filters.rating);
  }

  return filtered;
};

// Sort function
const sortListings = (listings, sortBy) => {
  const sorted = [...listings];
  
  switch (sortBy) {
    case 'price_low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price_high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'recommended':
    default:
      // Default sorting - could be based on popularity, rating, etc.
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }
};

// Context
const ListingsContext = createContext();

// Provider component
export const ListingsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(listingsReducer, initialState);

  // Fetch listings
  const fetchListings = async (params = {}) => {
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      const response = await listingsAPI.getAllListings(params);
      dispatch({ type: ACTIONS.SET_LISTINGS, payload: response.data });
    } catch (error) {
      dispatch({ 
        type: ACTIONS.SET_ERROR, 
        payload: error.response?.data?.message || 'Failed to fetch listings' 
      });
    }
  };

  // Load more listings (pagination)
  const loadMoreListings = async () => {
    if (!state.pagination.hasMore || state.loading) return;
    
    try {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true });
      const nextPage = state.pagination.page + 1;
      const response = await listingsAPI.getAllListings({
        page: nextPage,
        limit: state.pagination.limit,
        ...state.filters
      });
      
      dispatch({ type: ACTIONS.ADD_LISTINGS, payload: response.data });
      dispatch({ 
        type: ACTIONS.UPDATE_PAGINATION, 
        payload: { 
          page: nextPage,
          hasMore: response.data.length === state.pagination.limit
        } 
      });
    } catch (error) {
      dispatch({ 
        type: ACTIONS.SET_ERROR, 
        payload: error.response?.data?.message || 'Failed to load more listings' 
      });
    }
  };

  // Apply filters and search - memoized to prevent unnecessary re-renders
  const applyFiltersAndSearch = useCallback(() => {
    const filtered = applyFilters(state.listings, state.filters, state.searchQuery);
    const sorted = sortListings(filtered, state.filters.sortBy);
    dispatch({ type: ACTIONS.SET_FILTERED_LISTINGS, payload: sorted });
  }, [state.listings, state.filters, state.searchQuery]);

  // Set filters
  const setFilters = useCallback((newFilters) => {
    dispatch({ type: ACTIONS.SET_FILTERS, payload: newFilters });
  }, []);

  // Set search query
  const setSearchQuery = useCallback((query) => {
    dispatch({ type: ACTIONS.SET_SEARCH_QUERY, payload: query });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_FILTERS });
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((listingId) => {
    dispatch({ type: ACTIONS.TOGGLE_FAVORITE, payload: listingId });
  }, []);

  // Get listing by ID
  const getListingById = useCallback(async (id) => {
    try {
      const response = await listingsAPI.getListingById(id);
      dispatch({ type: ACTIONS.SET_SELECTED_LISTING, payload: response.data });
      return response.data;
    } catch (error) {
      dispatch({ 
        type: ACTIONS.SET_ERROR, 
        payload: error.response?.data?.message || 'Failed to fetch listing' 
      });
      return null;
    }
  }, []);

  // Apply filters whenever filters or search query changes
  useEffect(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch]);

  // Initial fetch
  useEffect(() => {
    fetchListings();
  }, []);

  const value = {
    ...state,
    fetchListings,
    loadMoreListings,
    setFilters,
    setSearchQuery,
    clearFilters,
    toggleFavorite,
    getListingById,
  };

  return (
    <ListingsContext.Provider value={value}>
      {children}
    </ListingsContext.Provider>
  );
};

// Custom hook
export const useListings = () => {
  const context = useContext(ListingsContext);
  if (!context) {
    throw new Error('useListings must be used within a ListingsProvider');
  }
  return context;
}; 