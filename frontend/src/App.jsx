import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ChangePassword from './pages/ChangePassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminUserDetail from './pages/admin/AdminUserDetail';
import AdminStores from './pages/admin/AdminStores';
import UserStores from './pages/user/UserStores';
import OwnerDashboard from './pages/owner/OwnerDashboard';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="container" style={{ padding: '4rem' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  const paths = { admin: '/admin', user: '/stores', store_owner: '/owner' };
  return <Navigate to={paths[user.role] || '/login'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/password"
        element={
          <ProtectedRoute roles={['admin', 'user', 'store_owner']}>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:id"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminUserDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/stores"
        element={
          <ProtectedRoute roles={['admin']}>
            <AdminStores />
          </ProtectedRoute>
        }
      />

      <Route
        path="/stores"
        element={
          <ProtectedRoute roles={['user']}>
            <UserStores />
          </ProtectedRoute>
        }
      />

      <Route
        path="/owner"
        element={
          <ProtectedRoute roles={['store_owner']}>
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
