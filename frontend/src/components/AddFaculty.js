import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { API_BASE, authJsonHeaders } from '../api';
import './StudentProfile.css';
import './AdminLayout.css';

const AddFaculty = () => {
  const [form, setForm] = useState({
    FullName: '', ShortName: '', Subject: '', MoNumber: '', Pass: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error,   setError]   = useState('');

  const handleChange = e =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);

    try {
      const res  = await fetch(`${API_BASE}/admin/add-faculty/`, {
        method:  'POST',
        headers: authJsonHeaders(),
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to add faculty.'); }
      else {
        setSuccess(`Faculty "${form.FullName}" added successfully!`);
        setForm({ FullName: '', ShortName: '', Subject: '', MoNumber: '', Pass: '' });
      }
    } catch {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <main className="profile-main-content">
        <div className="admin-form-card">
          <h2 className="admin-form-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
            Add Faculty
          </h2>

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-input-group">
              <label>Full Name</label>
              <input name="FullName" value={form.FullName} onChange={handleChange}
                placeholder="e.g. Dr. Rajesh Kumar Patel" required />
            </div>

            <div className="admin-form-row">
              <div className="admin-input-group">
                <label>Short Name</label>
                <input name="ShortName" value={form.ShortName} onChange={handleChange}
                  placeholder="e.g. RKP" required />
              </div>
              <div className="admin-input-group">
                <label>Mobile Number</label>
                <input name="MoNumber" value={form.MoNumber} onChange={handleChange}
                  placeholder="e.g. +91 9000000001" required />
              </div>
            </div>

            <div className="admin-input-group">
              <label>Subject</label>
              <input name="Subject" value={form.Subject} onChange={handleChange}
                placeholder="e.g. Data Structures & Algorithms" required />
            </div>

            <div className="admin-input-group">
              <label>Password</label>
              <input name="Pass" type="password" value={form.Pass} onChange={handleChange}
                placeholder="Set login password" required />
            </div>

            {error   && <p className="admin-msg-error">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </p>}
            {success && <p className="admin-msg-success">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              {success}
            </p>}

            <button type="submit" className="admin-submit-btn" disabled={loading}>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v14a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              {loading ? 'Saving…' : 'Add Faculty'}
            </button>
          </form>
        </div>
      </main>
    </AdminLayout>
  );
};

export default AddFaculty;
