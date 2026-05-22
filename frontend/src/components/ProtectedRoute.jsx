import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner label="Getting things ready..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const redirect = {
      admin: '/admin',
      user: '/stores',
      store_owner: '/owner',
    };
    return <Navigate to={redirect[user.role] || '/login'} replace />;
  }

  return children;
}
