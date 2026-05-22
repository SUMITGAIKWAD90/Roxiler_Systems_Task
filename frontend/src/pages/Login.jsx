import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import { validateEmail } from '../utils/validation';

const roleRedirect = {
  admin: '/admin',
  user: '/stores',
  store_owner: '/owner',
};

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = {};
    const emailErr = validateEmail(email);
    if (emailErr) errs.email = emailErr;
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      navigate(roleRedirect[user.role] || '/');
    } catch (err) {
      setApiError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to rate stores, manage users, or view your shop stats"
      footer={
        <p className="auth-footer">
          New here? <Link to="/register">Create a free account</Link>
        </p>
      }
    >
      {apiError && <div className="alert alert-error">{apiError}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          {errors.email && <div className="error">{errors.email}</div>}
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} />
          {errors.password && <div className="error">{errors.password}</div>}
        </div>
        <button type="submit" className={`btn btn-primary btn-block ${loading ? 'btn-loading' : ''}`} disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <div className="auth-hint">
        Demo admin: admin@storeplatform.com
      </div>
    </AuthLayout>
  );
}
