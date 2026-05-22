import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import SortableTable from '../../components/SortableTable';
import UserForm from '../../components/UserForm';
import { api } from '../../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const loadUsers = useCallback(async () => {
    try {
      const params = { sortBy, sortOrder };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const data = await api.admin.users(params);
      setUsers(data.users);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, [search, roleFilter, sortBy, sortOrder]);

  useEffect(() => {
    const t = setTimeout(loadUsers, 300);
    return () => clearTimeout(t);
  }, [loadUsers]);

  const handleCreate = async (form) => {
    try {
      await api.admin.createUser(form);
      setShowForm(false);
      loadUsers();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleUpdate = async (form) => {
    try {
      await api.admin.updateUser(editing.id, form);
      setEditing(null);
      loadUsers();
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.admin.deleteUser(id);
      loadUsers();
    } catch (e) {
      setError(e.message);
    }
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'address', label: 'Address' },
    {
      key: 'role',
      label: 'Role',
      render: (row) => <span className={`badge badge-${row.role}`}>{row.role.replace('_', ' ')}</span>,
    },
    {
      key: 'store_avg_rating',
      label: 'Store Rating',
      render: (row) =>
        row.role === 'store_owner' && row.store_avg_rating != null
          ? `★ ${parseFloat(row.store_avg_rating).toFixed(1)}`
          : '—',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="action-group">
          <Link to={`/admin/users/${row.id}`} className="btn btn-secondary btn-sm">View</Link>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setEditing(row); setShowForm(false); }}>Edit</button>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(row.id)}>Delete</button>
        </div>
      ),
    },
  ];

  return (
    <Layout
      title="Manage Users"
      subtitle="Search by name, email, or address. Filter by role. Click column headers to sort."
    >
      {error && <div className="alert alert-error">{error}</div>}

      <div className="toolbar">
        <input
          className="search-input"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
          <option value="store_owner">Store Owner</option>
        </select>
        <button type="button" className="btn btn-primary" onClick={() => { setShowForm(true); setEditing(null); }}>
          + Add User
        </button>
      </div>

      {(showForm || editing) && (
        <div className="form-panel">
          <UserForm
            initial={editing || {}}
            showRole
            requirePassword={!editing}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </div>
      )}

      <div className="card animate-fade-in">
        <SortableTable
          columns={columns}
          data={users}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={(field, order) => { setSortBy(field); setSortOrder(order); }}
        />
      </div>
    </Layout>
  );
}
