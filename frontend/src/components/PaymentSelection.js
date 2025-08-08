import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FaCreditCard, 
  FaPaypal, 
  FaApple, 
  FaGoogle, 
  FaUniversity,
  FaDollarSign,
  FaCheck
} from 'react-icons/fa';

const PaymentContainer = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: #222222;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PaymentMethodsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
`;

const PaymentMethodCard = styled.div`
  border: 2px solid ${props => props.selected ? '#FF385C' : '#DDDDDD'};
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.selected ? '#fff5f5' : 'white'};
  position: relative;
  
  &:hover {
    border-color: #FF385C;
    background: #fff5f5;
  }
`;

const PaymentIcon = styled.div`
  font-size: 1.5rem;
  margin-bottom: 8px;
  color: ${props => props.selected ? '#FF385C' : '#717171'};
`;

const PaymentName = styled.div`
  font-weight: 600;
  color: #222222;
  font-size: 0.9rem;
`;

const PaymentDescription = styled.div`
  font-size: 0.8rem;
  color: #717171;
  margin-top: 4px;
`;

const SelectedIndicator = styled.div`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #FF385C;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
`;

const PaymentDetails = styled.div`
  background: #f9f9f9;
  border-radius: 12px;
  padding: 16px;
  margin-top: 16px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
    padding-top: 8px;
    border-top: 1px solid #DDDDDD;
    font-weight: 600;
  }
`;

const paymentMethods = [
  {
    id: 'credit_card',
    name: 'Credit Card',
    icon: FaCreditCard,
    description: 'Visa, Mastercard, Amex',
    color: '#1a1a1a'
  },
  {
    id: 'paypal',
    name: 'PayPal',
    icon: FaPaypal,
    description: 'Pay with PayPal',
    color: '#0070ba'
  },
  {
    id: 'cash_app',
    name: 'Cash App',
    icon: FaDollarSign,
    description: 'Pay with Cash App',
    color: '#00d632'
  },
  {
    id: 'apple_pay',
    name: 'Apple Pay',
    icon: FaApple,
    description: 'Pay with Apple Pay',
    color: '#000000'
  },
  {
    id: 'google_pay',
    name: 'Google Pay',
    icon: FaGoogle,
    description: 'Pay with Google Pay',
    color: '#4285f4'
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    icon: FaUniversity,
    description: 'Direct bank transfer',
    color: '#1a1a1a'
  }
];

const PaymentSelection = ({ 
  listing, 
  selectedMethod, 
  onMethodChange, 
  totalAmount,
  showDetails = true 
}) => {
  const [availableMethods, setAvailableMethods] = useState([]);

  useEffect(() => {
    // Get available payment methods for this listing
    if (listing?.paymentPreferences?.acceptedMethods) {
      const methods = paymentMethods.filter(method => 
        listing.paymentPreferences.acceptedMethods.includes(method.id)
      );
      setAvailableMethods(methods);
      
      // Set default method if none selected
      if (!selectedMethod && methods.length > 0) {
        const preferred = listing.paymentPreferences.preferredMethod;
        const defaultMethod = methods.find(m => m.id === preferred) || methods[0];
        onMethodChange(defaultMethod.id);
      }
    } else {
      // Default methods if no preferences set
      setAvailableMethods(paymentMethods.slice(0, 2));
      if (!selectedMethod) {
        onMethodChange('credit_card');
      }
    }
  }, [listing, selectedMethod, onMethodChange]);

  const calculateFees = (amount) => {
    const platformFee = amount * 0.03; // 3% platform fee
    const processingFee = amount * 0.029 + 0.30; // Stripe fee
    const hostAmount = amount - platformFee - processingFee;
    
    return {
      platformFee: Math.round(platformFee * 100) / 100,
      processingFee: Math.round(processingFee * 100) / 100,
      hostAmount: Math.round(hostAmount * 100) / 100
    };
  };

  const fees = calculateFees(totalAmount);

  return (
    <PaymentContainer>
      <SectionTitle>
        <FaCreditCard /> Payment Method
      </SectionTitle>
      
      <PaymentMethodsGrid>
        {availableMethods.map((method) => {
          const IconComponent = method.icon;
          const isSelected = selectedMethod === method.id;
          
          return (
            <PaymentMethodCard
              key={method.id}
              selected={isSelected}
              onClick={() => onMethodChange(method.id)}
            >
              {isSelected && <SelectedIndicator><FaCheck /></SelectedIndicator>}
              <PaymentIcon selected={isSelected}>
                <IconComponent />
              </PaymentIcon>
              <PaymentName>{method.name}</PaymentName>
              <PaymentDescription>{method.description}</PaymentDescription>
            </PaymentMethodCard>
          );
        })}
      </PaymentMethodsGrid>

      {showDetails && totalAmount > 0 && (
        <PaymentDetails>
          <DetailRow>
            <span>Base Price</span>
            <span>${totalAmount}</span>
          </DetailRow>
          <DetailRow>
            <span>Platform Fee (3%)</span>
            <span>${fees.platformFee}</span>
          </DetailRow>
          <DetailRow>
            <span>Processing Fee</span>
            <span>${fees.processingFee}</span>
          </DetailRow>
          <DetailRow>
            <span>Total</span>
            <span>${(totalAmount + fees.platformFee + fees.processingFee).toFixed(2)}</span>
          </DetailRow>
        </PaymentDetails>
      )}
    </PaymentContainer>
  );
};

export default PaymentSelection; 