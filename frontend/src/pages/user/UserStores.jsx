import { useEffect, useState, useCallback } from 'react';
import Layout from '../../components/Layout';
import StarRating from '../../components/StarRating';
import { api } from '../../services/api';
import { validateRating } from '../../utils/validation';

export default function UserStores() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [ratingEdits, setRatingEdits] = useState({});
  const [submitting, setSubmitting] = useState(null);
  const [successId, setSuccessId] = useState(null);

  const loadStores = useCallback(async () => {
    try {
      const params = {};
      if (search) params.search = search;
      const data = await api.stores.list(params);
      setStores(data.stores);
      const edits = {};
      data.stores.forEach((s) => {
        edits[s.id] = s.user_rating || 0;
      });
      setRatingEdits(edits);
    } catch (e) {
      setError(e.message);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(loadStores, 300);
    return () => clearTimeout(t);
  }, [loadStores]);

  const submitRating = async (store) => {
    const value = ratingEdits[store.id];
    const err = validateRating(value);
    if (err) {
      setError(err);
      return;
    }
    setError('');
    setSubmitting(store.id);

    try {
      if (store.user_rating_id) {
        await api.ratings.update(store.user_rating_id, { ratingValue: value });
      } else {
        await api.ratings.create({ storeId: store.id, ratingValue: value });
      }
      setSuccessId(store.id);
      setTimeout(() => setSuccessId(null), 2500);
      loadStores();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <Layout
      title="Discover Stores"
      subtitle="Browse spots near you, check community ratings, and tap the stars to share yours ✨"
    >
      {error && <div className="alert alert-error">{error}</div>}

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search by store name or address..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="store-grid animate-stagger">
        {stores.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-state__icon">🏪</div>
            <p>No stores found. Try a different search.</p>
          </div>
        ) : (
          stores.map((store) => (
            <article key={store.id} className="card card--interactive store-card">
              <div>
                <h3 className="store-card__name">{store.name}</h3>
                <p className="store-card__address">📍 {store.address}</p>
                <div className="store-card__meta">
                  <span className="rating-pill">
                    ★ {parseFloat(store.overall_rating || 0).toFixed(1)} community
                  </span>
                  <span className="rating-pill rating-pill--yours">
                    {store.user_rating ? `You: ${store.user_rating}/5` : 'Not rated yet'}
                  </span>
                </div>
              </div>

              <div className="store-card__rate-box">
                <p className="store-card__rate-label">
                  {store.user_rating_id ? 'Update your vibe' : 'Rate this store'}
                </p>
                <StarRating
                  value={ratingEdits[store.id] || 0}
                  onChange={(v) => setRatingEdits({ ...ratingEdits, [store.id]: v })}
                  size="lg"
                />
                <button
                  type="button"
                  className={`btn btn-primary btn-sm ${submitting === store.id ? 'btn-loading' : ''}`}
                  style={{ marginTop: '1rem', width: '100%' }}
                  onClick={() => submitRating(store)}
                  disabled={!ratingEdits[store.id] || submitting === store.id}
                >
                  {store.user_rating_id ? 'Update Rating' : 'Submit Rating'}
                </button>
                {successId === store.id && (
                  <p className="rating-success">✓ Saved! Thanks for rating</p>
                )}
              </div>
            </article>
          ))
        )}
      </div>
    </Layout>
  );
}
