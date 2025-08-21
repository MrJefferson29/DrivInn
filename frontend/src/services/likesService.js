import axios from 'axios';

const API_BASE_URL = 'https://drivinn.onrender.com';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Like a listing
export const likeListing = async (listingId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/likes/${listingId}`, {}, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Unlike a listing
export const unlikeListing = async (listingId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/likes/${listingId}`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Get user's liked listings
export const getLikedListings = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/likes/user`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

// Check if user has liked a specific listing
export const checkIfLiked = async (listingId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/likes/${listingId}/check`, {
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
}; 