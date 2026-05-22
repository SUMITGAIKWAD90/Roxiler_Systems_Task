import { useState } from 'react';
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

export default function UserForm({ initial = {}, onSubmit, onCancel, showRole = false, requirePassword = true }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    email: initial.email || '',
    address: initial.address || '',
    password: '',
    role: initial.role || 'user',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    const nameErr = validateName(form.name);
    if (nameErr) errs.name = nameErr;
    const emailErr = validateEmail(form.email);
    if (emailErr) errs.email = emailErr;
    const addrErr = validateAddress(form.address);
    if (addrErr) errs.address = addrErr;
    if (requirePassword || form.password) {
      const passErr = validatePassword(form.password);
      if (passErr) errs.password = passErr;
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { ...form };
    if (!requirePassword && !payload.password) delete payload.password;
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="card card-glass">
      <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>{initial.id ? 'Edit user' : 'New user'}</h3>
      <div className="form-group">
        <label>Name ({NAME_MIN}–{NAME_MAX})</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={NAME_MAX} />
        {errors.name && <div className="error">{errors.name}</div>}
      </div>
      <div className="form-group">
        <label>Email</label>
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        {errors.email && <div className="error">{errors.email}</div>}
      </div>
      <div className="form-group">
        <label>Address</label>
        <textarea rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} maxLength={ADDRESS_MAX} />
        {errors.address && <div className="error">{errors.address}</div>}
      </div>
      {showRole && (
        <div className="form-group">
          <label>Role</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
            <option value="user">Normal User</option>
            <option value="admin">Admin</option>
            <option value="store_owner">Store Owner</option>
          </select>
        </div>
      )}
      <div className="form-group">
        <label>{requirePassword ? 'Password' : 'Password (optional)'}</label>
        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <div className="form-hint">{PASSWORD_MIN}–{PASSWORD_MAX} · uppercase · special</div>
        {errors.password && <div className="error">{errors.password}</div>}
      </div>
      <div className="action-group">
        <button type="submit" className="btn btn-primary">Save</button>
        {onCancel && <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
