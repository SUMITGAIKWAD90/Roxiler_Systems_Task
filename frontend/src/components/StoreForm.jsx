import { useState } from 'react';
import {
  validateName,
  validateEmail,
  validateAddress,
  NAME_MIN,
  NAME_MAX,
  ADDRESS_MAX,
} from '../utils/validation';

export default function StoreForm({ initial = {}, owners = [], onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: initial.name || '',
    email: initial.email || '',
    address: initial.address || '',
    ownerId: initial.owner_id || initial.ownerId || '',
  });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    const nameErr = validateName(form.name, 'Store name');
    if (nameErr) errs.name = nameErr;
    const emailErr = validateEmail(form.email);
    if (emailErr) errs.email = emailErr;
    const addrErr = validateAddress(form.address);
    if (addrErr) errs.address = addrErr;
    if (!form.ownerId) errs.ownerId = 'Owner is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: form.name,
      email: form.email,
      address: form.address,
      ownerId: parseInt(form.ownerId, 10),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="card card-glass">
      <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>{initial.id ? 'Edit store' : 'New store'}</h3>
      <div className="form-group">
        <label>Store name ({NAME_MIN}–{NAME_MAX})</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={NAME_MAX} />
        {errors.name && <div className="error">{errors.name}</div>}
      </div>
      <div className="form-group">
        <label>Store email</label>
        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        {errors.email && <div className="error">{errors.email}</div>}
      </div>
      <div className="form-group">
        <label>Address</label>
        <textarea rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} maxLength={ADDRESS_MAX} />
        {errors.address && <div className="error">{errors.address}</div>}
      </div>
      <div className="form-group">
        <label>Store owner</label>
        <select value={form.ownerId} onChange={(e) => setForm({ ...form, ownerId: e.target.value })}>
          <option value="">Select owner</option>
          {owners.map((o) => (
            <option key={o.id} value={o.id}>{o.name} ({o.email})</option>
          ))}
        </select>
        {errors.ownerId && <div className="error">{errors.ownerId}</div>}
      </div>
      <div className="action-group">
        <button type="submit" className="btn btn-primary">Save</button>
        {onCancel && <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
