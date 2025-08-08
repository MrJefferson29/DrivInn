import api from './api';

export const paymentApi = {
  // Create payment intent
  createPaymentIntent: async (bookingId, paymentMethod) => {
    const response = await api.post('/payments/create-intent', {
      bookingId,
      paymentMethod
    });
    return response.data;
  },

  // Confirm payment
  confirmPayment: async (bookingId, paymentIntentId) => {
    const response = await api.post('/payments/confirm', {
      bookingId,
      paymentIntentId
    });
    return response.data;
  },

  // Get payment methods for a listing
  getPaymentMethods: async (listingId) => {
    const response = await api.get(`/payments/methods/${listingId}`);
    return response.data;
  },

  // Release payment to host (admin/host only)
  releasePaymentToHost: async (bookingId) => {
    const response = await api.put(`/payments/release/${bookingId}`);
    return response.data;
  },

  // Refund payment
  refundPayment: async (bookingId, reason) => {
    const response = await api.post(`/payments/refund/${bookingId}`, { reason });
    return response.data;
  }
}; 