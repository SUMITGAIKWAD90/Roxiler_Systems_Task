import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import {
  validateName,
  validateEmail,
  validateAddress,
  validatePassword,
  NAME_MIN,
  NAME_MAX,
  ADDRESS_MAX,
  PASSWORD_MIN,
  PASSWORD_MAX,
} from '../utils/validation';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', address: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errs = {};
    const nameErr = validateName(form.name);
    if (nameErr) errs.name = nameErr;
    const emailErr = validateEmail(form.email);
    if (emailErr) errs.email = emailErr;
    const addrErr = validateAddress(form.address);
    if (addrErr) errs.address = addrErr;
    const passErr = validatePassword(form.password);
    if (passErr) errs.password = passErr;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        password: form.password,
      });
      navigate('/stores');
    } catch (err) {
      setApiError(err.message || 'Registration failed');
      if (err.errors) {
        const fieldErrors = {};
        err.errors.forEach((e) => { fieldErrors[e.field] = e.message; });
        setErrors((prev) => ({ ...prev, ...fieldErrors }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Join RateSpot"
      subtitle="Discover local stores and share your honest ratings"
      footer={
        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      }
    >
      {apiError && <div className="alert alert-error">{apiError}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full name ({NAME_MIN}–{NAME_MAX} chars)</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={NAME_MAX} placeholder="Your full legal name" />
          {errors.name && <div className="error">{errors.name}</div>}
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
          {errors.email && <div className="error">{errors.email}</div>}
        </div>
        <div className="form-group">
          <label>Address</label>
          <textarea rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} maxLength={ADDRESS_MAX} placeholder="Where you're based" />
          {errors.address && <div className="error">{errors.address}</div>}
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Create a strong password" />
          <div className="form-hint">{PASSWORD_MIN}–{PASSWORD_MAX} chars · 1 uppercase · 1 special</div>
          {errors.password && <div className="error">{errors.password}</div>}
        </div>
        <button type="submit" className={`btn btn-primary btn-block ${loading ? 'btn-loading' : ''}`} disabled={loading}>
          {loading ? 'Creating account...' : 'Get Started'}
        </button>
      </form>
    </AuthLayout>
  );
}
