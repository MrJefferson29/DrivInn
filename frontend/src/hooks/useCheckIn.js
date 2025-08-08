import { useState } from 'react';
import { paymentApi } from '../services/paymentApi';

export const useCheckIn = (booking, onCheckInSuccess) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleCheckIn = async () => {
    if (!booking || booking.payment.status !== 'in_escrow') {
      setError('Payment is not in escrow or booking is invalid');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await paymentApi.releasePaymentToHost(booking._id);
      
      if (result.success) {
        setSuccess(`Payment of $${result.result.amount} has been released to your ${result.result.payoutMethod} account!`);
        onCheckInSuccess && onCheckInSuccess(booking._id);
      } else {
        setError(result.message || 'Failed to release payment');
      }
    } catch (err) {
      console.error('Check-in error:', err);
      setError(err.message || 'Error processing check-in');
    } finally {
      setLoading(false);
    }
  };

  const resetMessages = () => {
    setSuccess('');
    setError('');
  };

  return {
    loading,
    success,
    error,
    handleCheckIn,
    resetMessages
  };
}; 