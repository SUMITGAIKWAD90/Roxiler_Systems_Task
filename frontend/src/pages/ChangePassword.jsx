import { useState } from 'react';
import Layout from '../components/Layout';
import { api } from '../services/api';
import { validatePassword, PASSWORD_MIN, PASSWORD_MAX } from '../utils/validation';

export default function ChangePassword() {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setApiError('');
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = 'Current password is required';
    const passErr = validatePassword(form.newPassword);
    if (passErr) errs.newPassword = passErr;
    if (form.newPassword !== form.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await api.auth.changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setMessage('Password updated successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setApiError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout
      title="Account Settings"
      subtitle="Keep your account secure with a strong password"
    >
      <div className="card" style={{ maxWidth: 440 }}>
        {message && <div className="alert alert-success">{message}</div>}
        {apiError && <div className="alert alert-error">{apiError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current password</label>
            <input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
            {errors.currentPassword && <div className="error">{errors.currentPassword}</div>}
          </div>
          <div className="form-group">
            <label>New password</label>
            <input type="password" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
            <div className="form-hint">{PASSWORD_MIN}–{PASSWORD_MAX} chars · uppercase · special</div>
            {errors.newPassword && <div className="error">{errors.newPassword}</div>}
          </div>
          <div className="form-group">
            <label>Confirm new password</label>
            <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
            {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
          </div>
          <button type="submit" className={`btn btn-primary ${loading ? 'btn-loading' : ''}`} disabled={loading}>
            Update Password
          </button>
        </form>
      </div>
    </Layout>
  );
}
