import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { paymentsAPI } from '../services/api';
import { 
  BarChart3, 
  Search, 
  RefreshCw, 
  Download, 
  Filter,
  Calendar,
  User,
  Home,
  DollarSign,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

const Page = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  padding: 140px 32px 80px 32px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  position: relative;
  
  @media (max-width: 1200px) {
    padding: 130px 24px 60px 24px;
  }
  
  @media (max-width: 768px) {
    padding: 110px 16px 40px 16px;
  }
`;

const PageHeader = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  margin: -140px -32px 40px -32px;
  padding: 60px 32px;
  position: relative;
  overflow: hidden;
  border-radius: 0 0 24px 24px;
  
  @media (max-width: 1200px) {
    margin: -130px -24px 32px -24px;
    padding: 50px 24px;
  }
  
  @media (max-width: 768px) {
    margin: -110px -16px 24px -16px;
    padding: 40px 16px;
    border-radius: 0 0 16px 16px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/><circle cx="10" cy="60" r="0.5" fill="white" opacity="0.1"/><circle cx="90" cy="40" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
    opacity: 0.3;
  }
`;

const HeaderContent = styled.div`
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 16px;
  
  @media (max-width: 768px) {
    font-size: 2rem;
    gap: 12px;
  }
`;

const HeaderStats = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 16px;
  }
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 24px 28px;
  text-align: center;
  min-width: 140px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.3) 100%);
  }
  
  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  }
  
  @media (max-width: 1200px) {
    min-width: 130px;
    padding: 20px 24px;
  }
  
  @media (max-width: 768px) {
    min-width: 110px;
    padding: 16px 20px;
  }
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 4px;
  
  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const StatLabel = styled.div`
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Controls = styled.div`
  background: white;
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 32px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  }
  
  @media (max-width: 1200px) {
    padding: 28px;
    margin-bottom: 28px;
  }
  
  @media (max-width: 768px) {
    padding: 24px;
    margin-bottom: 24px;
    border-radius: 16px;
  }
`;

const ControlsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  color: #222222;
  font-weight: 600;
  font-size: 1.1rem;
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: center;
  
  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const SearchInput = styled.div`
  position: relative;
  flex: 1;
  min-width: 300px;
  
  @media (max-width: 768px) {
    min-width: 100%;
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
  z-index: 2;
`;

const Input = styled.input`
  width: 100%;
  padding: 18px 18px 18px 52px;
  border: 2px solid #e9ecef;
  border-radius: 16px;
  font-size: 1.05rem;
  transition: all 0.3s ease;
  background: #f8f9fa;
  font-weight: 500;
  
  &:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.15);
    transform: translateY(-1px);
  }
  
  &:hover {
    border-color: #dee2e6;
    background: white;
  }
  
  &::placeholder {
    color: #6c757d;
    font-weight: 400;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 28px;
  border: none;
  border-radius: 16px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }
  
  &:hover::before {
    left: 100%;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
  }
  
  @media (max-width: 1200px) {
    padding: 16px 24px;
    font-size: 0.95rem;
  }
  
  @media (max-width: 768px) {
    padding: 14px 20px;
    font-size: 0.9rem;
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
  }
`;

const SecondaryButton = styled(Button)`
  background: #f8f9fa;
  color: #222222;
  border: 2px solid #e9ecef;
  
  &:hover:not(:disabled) {
    background: #e9ecef;
    border-color: #dee2e6;
    transform: translateY(-1px);
  }
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  overflow: hidden;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  }
  
  @media (max-width: 1200px) {
    border-radius: 18px;
  }
  
  @media (max-width: 768px) {
    border-radius: 16px;
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
`;

const Th = styled.th`
  text-align: left;
  padding: 24px 28px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-bottom: 2px solid #e9ecef;
  font-weight: 700;
  color: #222222;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  white-space: nowrap;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  &:hover::after {
    opacity: 1;
  }
  
  @media (max-width: 1200px) {
    padding: 20px 24px;
  }
  
  @media (max-width: 768px) {
    padding: 16px 20px;
    font-size: 0.85rem;
  }
`;

const Td = styled.td`
  padding: 20px 24px;
  border-bottom: 1px solid #f8f9fa;
  vertical-align: top;
  font-size: 0.95rem;
  color: #333333;
  
  @media (max-width: 768px) {
    padding: 16px 20px;
    font-size: 0.9rem;
  }
`;

const TableRow = styled.tr`
  transition: all 0.3s ease;
  
  &:hover {
    background: #f8f9fa;
    transform: translateX(4px);
  }
  
  &:last-child td {
    border-bottom: none;
  }
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.3s ease;
  
  ${props => {
    switch (props.variant) {
      case 'success':
        return `
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
          color: #155724;
          border: 1px solid #c3e6cb;
        `;
      case 'warning':
        return `
          background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
          color: #856404;
          border: 1px solid #ffeaa7;
        `;
      case 'danger':
        return `
          background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
          color: #721c24;
          border: 1px solid #f5c6cb;
        `;
      default:
        return `
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          color: #6c757d;
          border: 1px solid #e9ecef;
        `;
    }
  }}
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const DataCell = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const PrimaryText = styled.div`
  font-weight: 600;
  color: #222222;
`;

const SecondaryText = styled.div`
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
`;

const AmountDisplay = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const MainAmount = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
  color: #222222;
`;

const FeeAmount = styled.div`
  font-size: 0.8rem;
  color: #6c757d;
  font-weight: 500;
`;

const IDDisplay = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const IDItem = styled.div`
  font-size: 0.75rem;
  color: #6c757d;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  text-align: center;
  padding: 60px 20px;
`;

const LoadingSpinner = styled.div`
  color: #667eea;
  margin-bottom: 24px;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const LoadingText = styled.div`
  color: #6c757d;
  font-size: 1.1rem;
  font-weight: 500;
`;

const ErrorContainer = styled.div`
  background: white;
  border-radius: 16px;
  padding: 40px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  margin: 20px 0;
`;

const ErrorIcon = styled.div`
  color: #dc3545;
  margin-bottom: 16px;
  font-size: 3rem;
`;

const ErrorTitle = styled.h3`
  color: #dc3545;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 12px;
`;

const ErrorMessage = styled.p`
  color: #6c757d;
  font-size: 1.1rem;
  margin: 0;
`;

const EmptyState = styled.div`
  background: white;
  border-radius: 16px;
  padding: 60px 40px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  margin: 20px 0;
`;

const EmptyIcon = styled.div`
  color: #6c757d;
  margin-bottom: 16px;
  font-size: 3rem;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  color: #222222;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const EmptyMessage = styled.p`
  color: #6c757d;
  font-size: 1.1rem;
  margin: 0;
`;

const formatAmount = (amount, currency) => {
  if (typeof amount !== 'number') return '-';
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: currency || 'USD' }).format(amount);
};

const AdminPaymentsDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await paymentsAPI.adminGetAllPayments();
        setPayments(res.data.payments || []);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to load payments');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSyncPayoutStatuses = async () => {
    try {
      setSyncing(true);
      const res = await paymentsAPI.adminSyncPayoutStatuses();
      console.log('Sync completed:', res.data);
      
      // Reload payments to show updated statuses
      const updatedRes = await paymentsAPI.adminGetAllPayments();
      setPayments(updatedRes.data.payments || []);
      
      alert(`Sync completed successfully! ${res.data.result.syncedCount} bookings updated.`);
    } catch (err) {
      console.error('Sync failed:', err);
      alert('Sync failed: ' + (err.response?.data?.message || err.message || 'Unknown error'));
    } finally {
      setSyncing(false);
    }
  };

  const filtered = payments.filter(p => {
    const hay = [
      p.transactionId,
      p.stripePaymentIntentId,
      p.stripeSessionId,
      p?.guest?.email,
      p?.host?.email,
      p?.listing?.title,
    ].filter(Boolean).join(' ').toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  // Calculate summary statistics
  const totalPayments = payments.length;
  const totalAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const completedPayments = payments.filter(p => p.status === 'completed').length;
  const pendingPayouts = payments.filter(p => p.payoutStatus === 'pending').length;

  if (loading) {
    return (
      <Page>
        <LoadingContainer>
          <LoadingSpinner>
            <RefreshCw size={48} />
          </LoadingSpinner>
          <LoadingText>Loading payments...</LoadingText>
        </LoadingContainer>
      </Page>
    );
  }

  if (error) {
    return (
      <Page>
        <ErrorContainer>
          <ErrorIcon>
            <AlertCircle size={48} />
          </ErrorIcon>
          <ErrorTitle>Error Loading Payments</ErrorTitle>
          <ErrorMessage>{error}</ErrorMessage>
        </ErrorContainer>
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader>
        <HeaderContent>
          <Title>
            <BarChart3 size={32} />
            Payments & Payouts Dashboard
          </Title>
          <HeaderStats>
            <StatCard>
              <StatValue>{totalPayments}</StatValue>
              <StatLabel>Total Payments</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{formatAmount(totalAmount, 'USD')}</StatValue>
              <StatLabel>Total Amount</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{completedPayments}</StatValue>
              <StatLabel>Completed</StatLabel>
            </StatCard>
            <StatCard>
              <StatValue>{pendingPayouts}</StatValue>
              <StatLabel>Pending Payouts</StatLabel>
            </StatCard>
          </HeaderStats>
        </HeaderContent>
      </PageHeader>

      <Controls>
        <ControlsHeader>
          <Filter size={20} />
          Search & Controls
        </ControlsHeader>
        <SearchContainer>
          <SearchInput>
            <SearchIcon>
              <Search size={20} />
            </SearchIcon>
            <Input 
              placeholder="Search by email, listing, or transaction ID..." 
              value={q} 
              onChange={e => setQ(e.target.value)} 
            />
          </SearchInput>
          <ActionButtons>
            <PrimaryButton 
          onClick={handleSyncPayoutStatuses} 
          disabled={syncing}
            >
              <RefreshCw size={18} />
          {syncing ? 'Syncing...' : 'Sync Payout Statuses'}
            </PrimaryButton>
            <SecondaryButton>
              <Download size={18} />
              Export Data
            </SecondaryButton>
          </ActionButtons>
        </SearchContainer>
      </Controls>

      {filtered.length === 0 ? (
        <EmptyState>
          <EmptyIcon>
            <BarChart3 size={48} />
          </EmptyIcon>
          <EmptyTitle>No Payments Found</EmptyTitle>
          <EmptyMessage>
            {q ? `No payments match your search for "${q}"` : 'No payments have been processed yet.'}
          </EmptyMessage>
        </EmptyState>
      ) : (
        <TableContainer>
      <Table>
        <thead>
          <tr>
            <Th>Date</Th>
            <Th>Guest</Th>
            <Th>Host</Th>
            <Th>Listing</Th>
            <Th>Amount</Th>
                <Th>Payment Status</Th>
                <Th>Payout Status</Th>
                <Th>Transaction IDs</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(p => (
                <TableRow key={p._id}>
                  <Td>
                    <DataCell>
                      <PrimaryText>
                        {new Date(p.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </PrimaryText>
                      <SecondaryText>
                        {new Date(p.createdAt).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </SecondaryText>
                    </DataCell>
                  </Td>
                  <Td>
                    <DataCell>
                      <PrimaryText>
                        {p.guest ? `${p.guest.firstName || ''} ${p.guest.lastName || ''}`.trim() || 'N/A' : 'N/A'}
                      </PrimaryText>
                      <SecondaryText>{p.guest?.email || 'N/A'}</SecondaryText>
                    </DataCell>
                  </Td>
                  <Td>
                    <DataCell>
                      <PrimaryText>
                        {p.host ? `${p.host.firstName || ''} ${p.host.lastName || ''}`.trim() || 'N/A' : 'N/A'}
                      </PrimaryText>
                      <SecondaryText>{p.host?.email || 'N/A'}</SecondaryText>
                    </DataCell>
                  </Td>
                  <Td>
                    <DataCell>
                      <PrimaryText>{p.listing?.title || 'N/A'}</PrimaryText>
                      {p.booking && (
                        <SecondaryText>
                          {new Date(p.booking.checkIn).toLocaleDateString()} → {new Date(p.booking.checkOut).toLocaleDateString()}
                        </SecondaryText>
                      )}
                    </DataCell>
                  </Td>
                  <Td>
                    <AmountDisplay>
                      <MainAmount>{formatAmount(p.amount, p.currency)}</MainAmount>
                      <FeeAmount>Fee: {formatAmount(p.platformFee, p.currency)}</FeeAmount>
                    </AmountDisplay>
              </Td>
              <Td>
                    <DataCell>
                      <Badge variant={p.status === 'completed' ? 'success' : p.status === 'processing' ? 'warning' : 'danger'}>
                        {p.status === 'completed' && <CheckCircle size={14} />}
                        {p.status === 'processing' && <Clock size={14} />}
                        {p.status === 'failed' && <AlertCircle size={14} />}
                        {p.status}
                      </Badge>
                      <SecondaryText>Method: {p.paymentMethod || 'N/A'}</SecondaryText>
                    </DataCell>
              </Td>
              <Td>
                    <DataCell>
                      <Badge variant={p.payoutStatus === 'completed' ? 'success' : p.payoutStatus === 'processing' ? 'warning' : 'danger'}>
                        {p.payoutStatus === 'completed' && <CheckCircle size={14} />}
                        {p.payoutStatus === 'processing' && <Clock size={14} />}
                        {p.payoutStatus === 'failed' && <AlertCircle size={14} />}
                        {p.payoutStatus}
                      </Badge>
                      <SecondaryText>{p.payoutMethod || 'N/A'}</SecondaryText>
                    </DataCell>
              </Td>
              <Td>
                    <IDDisplay>
                      <IDItem>PI: {p.stripePaymentIntentId || 'N/A'}</IDItem>
                      <IDItem>Session: {p.stripeSessionId || 'N/A'}</IDItem>
                      <IDItem>Txn: {p.transactionId || 'N/A'}</IDItem>
                    </IDDisplay>
              </Td>
                </TableRow>
          ))}
        </tbody>
      </Table>
        </TableContainer>
      )}
    </Page>
  );
};

export default AdminPaymentsDashboard;


