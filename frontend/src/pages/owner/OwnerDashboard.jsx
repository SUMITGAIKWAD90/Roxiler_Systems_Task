import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import SortableTable from '../../components/SortableTable';
import LoadingSpinner from '../../components/LoadingSpinner';
import StarRating from '../../components/StarRating';
import { api } from '../../services/api';

export default function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    api.owner.dashboard().then(setData).catch((e) => setError(e.message));
  }, []);

  const sortedRatings = data?.ratings
    ? [...data.ratings].sort((a, b) => {
        const fieldA = sortBy === 'email' ? a.user.email : a.user.name;
        const fieldB = sortBy === 'email' ? b.user.email : b.user.name;
        const cmp = fieldA.localeCompare(fieldB);
        return sortOrder === 'asc' ? cmp : -cmp;
      })
    : [];

  const columns = [
    { key: 'name', label: 'Customer', sortable: true, render: (row) => row.user.name },
    { key: 'email', label: 'Email', sortable: true, render: (row) => row.user.email },
    {
      key: 'ratingValue',
      label: 'Rating',
      render: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <StarRating value={row.ratingValue} readonly size="sm" />
        </div>
      ),
    },
    {
      key: 'updatedAt',
      label: 'Last updated',
      render: (row) => new Date(row.updatedAt).toLocaleDateString(),
    },
  ];

  if (error) {
    return (
      <Layout title="My Store">
        <div className="alert alert-error">{error}</div>
      </Layout>
    );
  }

  if (!data) {
    return (
      <Layout title="My Store">
        <LoadingSpinner />
      </Layout>
    );
  }

  const { store } = data;

  return (
    <Layout
      title={store.name}
      subtitle="Track how customers feel about your store — live average and every rating below"
    >
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <h3>Average Rating</h3>
          <div className="value">{store.averageRating.toFixed(1)}</div>
          <StarRating value={Math.round(store.averageRating)} readonly size="sm" />
        </div>
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <h3>Total Reviews</h3>
          <div className="value">{store.totalRatings}</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <p className="store-card__address">📍 {store.address}</p>
        <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>{store.email}</p>
      </div>

      <div className="card animate-fade-in">
        <h3 style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Who rated you</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Sort by name or email using the table headers
        </p>
        <SortableTable
          columns={columns}
          data={sortedRatings}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={(field, order) => { setSortBy(field); setSortOrder(order); }}
          rowKey="id"
        />
      </div>
    </Layout>
  );
}
