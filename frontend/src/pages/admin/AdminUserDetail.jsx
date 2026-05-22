import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { api } from '../../services/api';

export default function AdminUserDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.admin.user(id).then(setData).catch((e) => setError(e.message));
  }, [id]);

  if (error) {
    return (
      <Layout title="User Details">
        <div className="alert alert-error">{error}</div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout title="User Details">
        <LoadingSpinner />
      </Layout>
    );
  }

  const { user, store } = data;

  return (
    <Layout title="User Profile" subtitle="Full account details and linked store info">
      <Link to="/admin/users" className="back-link">← Back to users</Link>

      <div className="card animate-slide-up" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--gradient-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: '1.25rem',
            }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ fontWeight: 800, fontSize: '1.35rem' }}>{user.name}</h2>
            <span className={`badge badge-${user.role}`}>{user.role.replace('_', ' ')}</span>
          </div>
        </div>
        <div className="detail-grid">
          <div className="detail-row"><strong>Email</strong><span>{user.email}</span></div>
          <div className="detail-row"><strong>Address</strong><span>{user.address}</span></div>
        </div>
      </div>

      {user.role === 'store_owner' && (
        <div className="card animate-slide-up">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>🏪 Store & ratings</h3>
          {store ? (
            <div className="detail-grid">
              <div className="detail-row"><strong>Store</strong><span>{store.name}</span></div>
              <div className="detail-row"><strong>Store email</strong><span>{store.email}</span></div>
              <div className="detail-row"><strong>Address</strong><span>{store.address}</span></div>
              <div className="detail-row">
                <strong>Average rating</strong>
                <span className="rating-pill">★ {parseFloat(store.average_rating).toFixed(2)} / 5</span>
              </div>
              <div className="detail-row"><strong>Total ratings</strong><span>{store.total_ratings}</span></div>
            </div>
          ) : (
            <p className="empty-state" style={{ padding: '1.5rem' }}>No store linked to this owner yet.</p>
          )}
        </div>
      )}
    </Layout>
  );
}
