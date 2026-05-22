import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { api } from '../../services/api';

const statMeta = [
  { key: 'totalUsers', label: 'Total Users', icon: '👥', gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
  { key: 'totalStores', label: 'Total Stores', icon: '🏪', gradient: 'linear-gradient(135deg, #ec4899, #f472b6)' },
  { key: 'totalRatings', label: 'Total Ratings', icon: '⭐', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.admin.dashboard().then(setStats).catch((e) => setError(e.message));
  }, []);

  return (
    <Layout
      title="Admin Dashboard"
      subtitle="Overview of platform activity — users, stores, and ratings at a glance"
    >
      {error && <div className="alert alert-error">{error}</div>}
      {!stats && !error && <LoadingSpinner />}
      {stats && (
        <div className="stats-grid">
          {statMeta.map((item) => (
            <div key={item.key} className="stat-card">
              <div className="stat-icon">{item.icon}</div>
              <h3>{item.label}</h3>
              <div className="value">{stats[item.key]}</div>
            </div>
          ))}
        </div>
      )}
      {stats && (
        <div className="card" style={{ marginTop: '0.5rem' }}>
          <h3 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>Quick guide</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Use <strong>Users</strong> to manage accounts and view store-owner ratings.
            Use <strong>Stores</strong> to add or edit shops. Tables support search, filters, and sorting.
          </p>
        </div>
      )}
    </Layout>
  );
}
