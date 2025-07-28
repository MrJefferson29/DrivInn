import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hostApplicationsAPI } from '../services/api';

const NotificationDetails = () => {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // For now, just fetch the user's own application (since users can only see their own)
    hostApplicationsAPI.getMy()
      .then(res => {
        if (res.data && res.data._id === id) {
          setApp(res.data);
        } else {
          setApp(null);
        }
      })
      .catch(() => setApp(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (!app) return <div style={{ padding: 40 }}>Notification not found or you do not have access.</div>;

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', background: 'var(--color-surface)', padding: 32, borderRadius: 16 }}>
      <h2>Host Application Details</h2>
      <div>Status: <b style={{ color: app.status === 'approved' ? 'var(--color-success)' : app.status === 'declined' ? 'var(--color-error)' : 'var(--color-primary)' }}>{app.status}</b></div>
      <div style={{ margin: '16px 0' }}>
        <pre style={{ background: 'var(--color-bg)', padding: 12 }}>{JSON.stringify(app.applicationData, null, 2)}</pre>
      </div>
      {app.adminNote && <div style={{ color: 'var(--color-error)' }}>Admin Note: {app.adminNote}</div>}
      {app.status === 'declined' && <button onClick={() => navigate('/become-a-host/apply')}>Re-Apply</button>}
      <button style={{ marginTop: 16 }} onClick={() => navigate('/notifications')}>Back to Notifications</button>
    </div>
  );
};

export default NotificationDetails; 