import { useEffect, useState, useCallback } from 'react';
import Layout from '../../components/Layout';
import SortableTable from '../../components/SortableTable';
import StoreForm from '../../components/StoreForm';
import { api } from '../../services/api';

export default function AdminStores() {
  const [stores, setStores] = useState([]);
  const [owners, setOwners] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const loadStores = useCallback(async () => {
    try {
      const params = { sortBy, sortOrder };
      if (search) params.search = search;
      const data = await api.admin.stores(params);
      setStores(data.stores);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, [search, sortBy, sortOrder]);

  const loadOwners = useCallback(async () => {
    try {
      const data = await api.admin.users({ role: 'store_owner' });
      setOwners(data.users);
    } catch {
      setOwners([]);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(loadStores, 300);
    return () => clearTimeout(t);
  }, [loadStores]);

  useEffect(() => {
    loadOwners();
  }, [loadOwners]);

  const handleCreate = async (form) => {
    try {
      await api.admin.createStore(form);
      setShowForm(false);
      loadStores();
      loadOwners();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleUpdate = async (form) => {
    try {
      await api.admin.updateStore(editing.id, form);
      setEditing(null);
      loadStores();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this store?')) return;
    try {
      await api.admin.deleteStore(id);
      loadStores();
    } catch (e) {
      setError(e.message);
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address' },
    { key: 'owner_name', label: 'Owner' },
    {
      key: 'average_rating',
      label: 'Avg Rating',
      render: (row) => (
        <span className="rating-pill">★ {parseFloat(row.average_rating || 0).toFixed(1)}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="action-group">
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setEditing(row); setShowForm(false); }}>Edit</button>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <Layout
      title="Manage Stores"
      subtitle="Create stores and link them to store owners. Search and sort the list below."
    >
      {error && <div className="alert alert-error">{error}</div>}

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search stores..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="button" className="btn btn-primary" onClick={() => { setShowForm(true); setEditing(null); }}>
          + Add Store
        </button>
      </div>

      {(showForm || editing) && (
        <div className="form-panel">
          <StoreForm
            initial={editing || {}}
            owners={owners}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </div>
      )}

      <div className="card animate-fade-in">
        <SortableTable
          columns={columns}
          data={stores}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={(field, order) => { setSortBy(field); setSortOrder(order); }}
        />
      </div>
    </Layout>
  );
}
