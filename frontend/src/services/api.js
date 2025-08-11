import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
};

// Listings API calls
export const listingsAPI = {
  getAllListings: (params = {}) => api.get('/listings', { params }),
  getListingById: (id) => api.get(`/listings/${id}`),
  createListing: (formData) => api.post('/listings', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateListing: (id, data) => api.put(`/listings/${id}`, data),
  deleteListing: (id) => api.delete(`/listings/${id}`),
  getNearbyListings: (lat, lng, radius = 50) => api.get('/listings/nearby', { params: { lat, lng, radius } }),
};

// Reviews API calls
export const reviewsAPI = {
  getReviewsForListing: (listingId) => api.get(`/reviews/${listingId}`),
  addReview: (listingId, reviewData) => api.post(`/reviews/${listingId}`, reviewData),
};

// Bookings API calls
export const bookingsAPI = {
  getUserBookings: () => api.get('/bookings'),
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  cancelBooking: (id) => api.delete(`/bookings/${id}`),
  verifyPayment: (sessionId) => api.get(`/bookings/verify-payment/${sessionId}`),
  updateBookingStatus: (bookingId, status) => api.put('/bookings/update-status', { bookingId, status }),
};

// Host Applications API calls
export const hostApplicationsAPI = {
  submit: (formData) => api.post('/host-applications', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMy: () => api.get('/host-applications/me'),
  // Admin
  list: (status) => api.get('/host-applications', { params: status ? { status } : {} }),
  approve: (id) => api.put(`/host-applications/${id}/approve`),
  decline: (id, adminNote) => api.put(`/host-applications/${id}/decline`, { adminNote }),
};

export const notificationsAPI = {
  getUserNotifications: (userId) => api.get(`/notifications/user/${userId}`),
  markAsRead: (notificationId) => api.put(`/notifications/${notificationId}/read`),
  markAllAsRead: (userId) => api.put(`/notifications/user/${userId}/read-all`),
  getUnreadCount: (userId) => api.get(`/notifications/user/${userId}/unread-count`),
  deleteNotification: (notificationId) => api.delete(`/notifications/${notificationId}`),
  deleteAllNotifications: (userId) => api.delete(`/notifications/user/${userId}/all`)
};

// Payments API calls
export const paymentsAPI = {
  createPaymentIntent: (data) => api.post('/payments/create-payment-intent', data),
  capturePayment: (data) => api.post('/payments/capture-payment', data),
  getPaymentStatus: (paymentId) => api.get(`/payments/status/${paymentId}`),
  getUserPayments: () => api.get('/payments/user-payments'),
};

export default api; 