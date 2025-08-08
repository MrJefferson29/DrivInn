import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import styled from 'styled-components';
import { FaCreditCard, FaLock, FaSpinner } from 'react-icons/fa';
import { paymentApi } from '../services/paymentApi';

// Load Stripe (replace with your publishable key)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key');

const PaymentFormContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #DDDDDD;
`;

const PaymentHeader = styled.div`
  text-align: center;
  margin-bottom: 24px;
`;

const PaymentTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  color: #222222;
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

const PaymentSubtitle = styled.p`
  color: #717171;
  margin: 0;
  font-size: 0.9rem;
`;

const AmountDisplay = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  border: 1px solid #DDDDDD;
`;

const AmountRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
    border-top: 1px solid #DDDDDD;
    padding-top: 8px;
    font-weight: 600;
    font-size: 1.1rem;
  }
`;

const CardElementContainer = styled.div`
  border: 1px solid #DDDDDD;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  background: white;
  
  &:focus-within {
    border-color: #FF385C;
    box-shadow: 0 0 0 3px rgba(255, 56, 92, 0.1);
  }
`;

const StyledCardElement = styled(CardElement)`
  .StripeElement {
    padding: 0;
  }
  
  .StripeElement--focus {
    outline: none;
  }
`;

const PayButton = styled.button`
  width: 100%;
  padding: 16px;
  background: #FF385C;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover:not(:disabled) {
    background: #e31c5f;
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.div`
  color: #155724;
  background: #d4edda;
  border: 1px solid #c3e6cb;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 16px;
  font-size: 0.9rem;
`;

const SecurityNote = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #717171;
  font-size: 0.8rem;
  margin-top: 16px;
  text-align: center;
  justify-content: center;
`;

const PaymentForm = ({ 
  amount, 
  bookingId, 
  onPaymentSuccess, 
  onPaymentError,
  processingFee = 0,
  platformFee = 0
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

         try {
       // Create payment intent using paymentApi service
       const data = await paymentApi.createPaymentIntent(bookingId, 'credit_card');

       if (!data.success) {
         throw new Error(data.message || 'Failed to create payment intent');
       }

      // Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.paymentIntent.clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              // Add billing details if needed
            }
          }
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

             if (paymentIntent.status === 'succeeded') {
         // Confirm payment with backend using paymentApi service
         const confirmData = await paymentApi.confirmPayment(bookingId, paymentIntent.id);

         if (confirmData.success) {
           setSuccess('Payment successful! Your booking has been confirmed.');
           onPaymentSuccess && onPaymentSuccess(confirmData.booking);
         } else {
           throw new Error(confirmData.message || 'Payment confirmation failed');
         }
       } else {
         throw new Error('Payment failed');
       }
    } catch (err) {
      setError(err.message);
      onPaymentError && onPaymentError(err);
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = amount + processingFee + platformFee;

  return (
    <PaymentFormContainer>
      <PaymentHeader>
        <PaymentTitle>
          <FaCreditCard /> Secure Payment
        </PaymentTitle>
        <PaymentSubtitle>
          Your payment information is encrypted and secure
        </PaymentSubtitle>
      </PaymentHeader>

      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}

      <AmountDisplay>
        <AmountRow>
          <span>Booking Amount:</span>
          <span>${amount.toFixed(2)}</span>
        </AmountRow>
        {processingFee > 0 && (
          <AmountRow>
            <span>Processing Fee:</span>
            <span>${processingFee.toFixed(2)}</span>
          </AmountRow>
        )}
        {platformFee > 0 && (
          <AmountRow>
            <span>Platform Fee:</span>
            <span>${platformFee.toFixed(2)}</span>
          </AmountRow>
        )}
        <AmountRow>
          <span>Total:</span>
          <span>${totalAmount.toFixed(2)}</span>
        </AmountRow>
      </AmountDisplay>

      <form onSubmit={handleSubmit}>
        <CardElementContainer>
          <StyledCardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </CardElementContainer>

        <PayButton type="submit" disabled={!stripe || loading}>
          {loading ? (
            <>
              <FaSpinner className="fa-spin" /> Processing...
            </>
          ) : (
            <>
              <FaLock /> Pay ${totalAmount.toFixed(2)}
            </>
          )}
        </PayButton>
      </form>

      <SecurityNote>
        <FaLock /> Your payment is secured by Stripe
      </SecurityNote>
    </PaymentFormContainer>
  );
};

const StripePaymentForm = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default StripePaymentForm; 