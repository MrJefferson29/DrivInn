import React, { useState } from 'react';
import styled from 'styled-components';
import { Alert, Spinner } from 'react-bootstrap';
import { 
  FaTimes, 
  FaPowerOff, 
  FaCalendarAlt,
  FaClock,
  FaExclamationTriangle
} from 'react-icons/fa';

// Airbnb color palette
const airbnbRed = '#FF385C';
const airbnbDark = '#222222';
const airbnbGray = '#717171';
const airbnbLightGray = '#F7F7F7';
const airbnbBorder = '#DDDDDD';

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: slideIn 0.3s ease-out;
  
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  padding: 24px 24px 0 24px;
  border-bottom: 1px solid ${airbnbBorder};
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${airbnbDark};
  margin: 0 0 8px 0;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ModalSubtitle = styled.p`
  color: ${airbnbGray};
  font-size: 1rem;
  margin: 0;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: ${airbnbGray};
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${airbnbLightGray};
    color: ${airbnbDark};
  }
`;

const ModalBody = styled.div`
  padding: 0 24px 24px 24px;
`;

const DeactivationTypeSection = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${airbnbDark};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DeactivationOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DeactivationOption = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 2px solid ${props => props.selected ? airbnbRed : airbnbBorder};
  border-radius: 12px;
  background: ${props => props.selected ? '#fff5f5' : 'white'};
  color: ${props => props.selected ? airbnbRed : airbnbDark};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  
  &:hover {
    border-color: ${airbnbRed};
    background: #fff5f5;
  }
`;

const OptionIcon = styled.div`
  font-size: 1.2rem;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const OptionContent = styled.div`
  flex: 1;
`;

const OptionTitle = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
`;

const OptionDescription = styled.div`
  font-size: 0.9rem;
  color: ${airbnbGray};
  font-weight: normal;
`;

const DateInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${airbnbBorder};
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.2s ease;
  background: white;
  
  &:focus {
    outline: none;
    border-color: ${airbnbRed};
    box-shadow: 0 0 0 3px rgba(255, 56, 92, 0.1);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 2px solid ${airbnbBorder};
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.2s ease;
  background: white;
  resize: vertical;
  min-height: 80px;
  
  &:focus {
    outline: none;
    border-color: ${airbnbRed};
    box-shadow: 0 0 0 3px rgba(255, 56, 92, 0.1);
  }
`;

const WarningBox = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const WarningIcon = styled.div`
  color: #856404;
  font-size: 1.2rem;
  margin-top: 2px;
`;

const WarningText = styled.div`
  color: #856404;
  font-size: 0.9rem;
  line-height: 1.4;
`;

const ActionButton = styled.button`
  width: 100%;
  background: ${props => props.variant === 'activate' ? '#00A699' : airbnbRed};
  color: white;
  border: none;
  padding: 16px;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover:not(:disabled) {
    background: ${props => props.variant === 'activate' ? '#008f85' : '#e31c5f'};
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: ${airbnbGray};
    cursor: not-allowed;
    transform: none;
  }
`;

const ListingDeactivationModal = ({ 
  listing, 
  isOpen, 
  onClose, 
  onSuccess, 
  isDeactivated = false 
}) => {
  const [deactivationType, setDeactivationType] = useState('indefinite');
  const [deactivatedUntil, setDeactivatedUntil] = useState('');
  const [deactivationReason, setDeactivationReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isDeactivated) {
        // Activate listing
        const response = await fetch(`http://localhost:5000/listings/${listing._id}/activate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to activate listing');
        }

        const data = await response.json();
        onSuccess(data);
        onClose();
      } else {
        // Deactivate listing
        const deactivationData = {
          deactivatedUntil: deactivationType === 'temporary' ? deactivatedUntil : null,
          deactivationReason: deactivationReason || 'Host deactivated listing'
        };

        const response = await fetch(`http://localhost:5000/listings/${listing._id}/deactivate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(deactivationData)
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to deactivate listing');
        }

        const data = await response.json();
        onSuccess(data);
        onClose();
      }
    } catch (err) {
      console.error('Listing action error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>
            {isDeactivated ? (
              <>
                <FaPowerOff style={{ color: '#00A699' }} />
                Activate Listing
              </>
            ) : (
              <>
                <FaPowerOff style={{ color: airbnbRed }} />
                Deactivate Listing
              </>
            )}
          </ModalTitle>
          <ModalSubtitle>{listing.title}</ModalSubtitle>
          <CloseButton onClick={onClose}>
            <FaTimes />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {isDeactivated ? (
            // Activation form
            <form onSubmit={handleSubmit}>
              <WarningBox>
                <WarningIcon>
                  <FaExclamationTriangle />
                </WarningIcon>
                <WarningText>
                  <strong>Activating your listing</strong><br />
                  Your listing will become available for bookings again immediately. 
                  Make sure you're ready to accept new reservations.
                </WarningText>
              </WarningBox>

              {error && (
                <Alert variant="danger" style={{ marginBottom: '16px' }}>
                  {error}
                </Alert>
              )}

              <ActionButton 
                type="submit" 
                variant="activate"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" />
                    Activating...
                  </>
                ) : (
                  <>
                    <FaPowerOff />
                    Activate Listing
                  </>
                )}
              </ActionButton>
            </form>
          ) : (
            // Deactivation form
            <form onSubmit={handleSubmit}>
              <WarningBox>
                <WarningIcon>
                  <FaExclamationTriangle />
                </WarningIcon>
                <WarningText>
                  <strong>Deactivating your listing</strong><br />
                  This will prevent new bookings. Existing confirmed bookings will not be affected.
                </WarningText>
              </WarningBox>

              <DeactivationTypeSection>
                <SectionTitle>
                  <FaClock /> Deactivation Type
                </SectionTitle>
                <DeactivationOptions>
                  <DeactivationOption
                    type="button"
                    selected={deactivationType === 'indefinite'}
                    onClick={() => setDeactivationType('indefinite')}
                  >
                    <OptionIcon>∞</OptionIcon>
                    <OptionContent>
                      <OptionTitle>Indefinite</OptionTitle>
                      <OptionDescription>
                        Deactivate until you manually reactivate
                      </OptionDescription>
                    </OptionContent>
                  </DeactivationOption>
                  
                  <DeactivationOption
                    type="button"
                    selected={deactivationType === 'temporary'}
                    onClick={() => setDeactivationType('temporary')}
                  >
                    <OptionIcon>
                      <FaCalendarAlt />
                    </OptionIcon>
                    <OptionContent>
                      <OptionTitle>Temporary</OptionTitle>
                      <OptionDescription>
                        Deactivate until a specific date
                      </OptionDescription>
                    </OptionContent>
                  </DeactivationOption>
                </DeactivationOptions>
              </DeactivationTypeSection>

              {deactivationType === 'temporary' && (
                <div style={{ marginBottom: '24px' }}>
                  <SectionTitle>
                    <FaCalendarAlt /> Reactivation Date
                  </SectionTitle>
                  <DateInput
                    type="date"
                    min={today}
                    value={deactivatedUntil}
                    onChange={(e) => setDeactivatedUntil(e.target.value)}
                    required={deactivationType === 'temporary'}
                  />
                </div>
              )}

              <div style={{ marginBottom: '24px' }}>
                <SectionTitle>Reason (Optional)</SectionTitle>
                <TextArea
                  placeholder="Why are you deactivating this listing? (optional)"
                  value={deactivationReason}
                  onChange={(e) => setDeactivationReason(e.target.value)}
                  maxLength={500}
                />
              </div>

              {error && (
                <Alert variant="danger" style={{ marginBottom: '16px' }}>
                  {error}
                </Alert>
              )}

              <ActionButton 
                type="submit" 
                disabled={loading || (deactivationType === 'temporary' && !deactivatedUntil)}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" />
                    Deactivating...
                  </>
                ) : (
                  <>
                    <FaPowerOff />
                    Deactivate Listing
                  </>
                )}
              </ActionButton>
            </form>
          )}
        </ModalBody>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ListingDeactivationModal;
