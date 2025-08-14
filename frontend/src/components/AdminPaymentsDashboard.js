import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { paymentsAPI } from '../services/api';

const Page = styled.div`
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 16px;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 16px;
`;

const Controls = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  border-bottom: 1px solid #eee;
  font-weight: 700;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #f3f3f3;
  vertical-align: top;
  font-size: 0.95rem;
`;

const Badge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 0.8rem;
  background: ${props => props.variant === 'success' ? '#e6f4ea' : props.variant === 'warning' ? '#fff4e5' : '#f1f1f1'};
  color: ${props => props.variant === 'success' ? '#1e7e34' : props.variant === 'warning' ? '#8a6d3b' : '#555'};
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

  if (loading) return <Page>Loading payments…</Page>;
  if (error) return <Page>Error: {error}</Page>;

  return (
    <Page>
      <Title>Payments & Payouts</Title>
      <Controls>
        <Input placeholder="Search by email, listing, or ID" value={q} onChange={e => setQ(e.target.value)} />
      </Controls>
      <Table>
        <thead>
          <tr>
            <Th>Date</Th>
            <Th>Guest</Th>
            <Th>Host</Th>
            <Th>Listing</Th>
            <Th>Amount</Th>
            <Th>Payment</Th>
            <Th>Payout</Th>
            <Th>IDs</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(p => (
            <tr key={p._id}>
              <Td>{new Date(p.createdAt).toLocaleString()}</Td>
              <Td>{p.guest ? `${p.guest.firstName || ''} ${p.guest.lastName || ''}`.trim() : '-'}<br />{p.guest?.email || '-'}</Td>
              <Td>{p.host ? `${p.host.firstName || ''} ${p.host.lastName || ''}`.trim() : '-'}<br />{p.host?.email || '-'}</Td>
              <Td>{p.listing?.title || '-'}<br /><small>{p.booking ? `${new Date(p.booking.checkIn).toLocaleDateString()} → ${new Date(p.booking.checkOut).toLocaleDateString()}` : ''}</small></Td>
              <Td>
                {formatAmount(p.amount, p.currency)}
                <div><small>Platform fee: {formatAmount(p.platformFee, p.currency)}</small></div>
              </Td>
              <Td>
                <Badge variant={p.status === 'completed' ? 'success' : p.status === 'processing' ? 'warning' : undefined}>{p.status}</Badge>
                <div><small>Method: {p.paymentMethod}</small></div>
              </Td>
              <Td>
                <Badge variant={p.payoutStatus === 'completed' ? 'success' : p.payoutStatus === 'processing' ? 'warning' : undefined}>{p.payoutStatus}</Badge>
                <div><small>{p.payoutMethod}</small></div>
              </Td>
              <Td>
                <div><small>PI: {p.stripePaymentIntentId || '-'}</small></div>
                <div><small>Session: {p.stripeSessionId || '-'}</small></div>
                <div><small>Txn: {p.transactionId || '-'}</small></div>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Page>
  );
};

export default AdminPaymentsDashboard;


