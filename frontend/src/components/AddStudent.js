import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { API_BASE, authJsonHeaders } from '../api';
import './StudentProfile.css';
import './AdminLayout.css';

const BRANCHES = [
  'Computer Engineering',
  'Artificial Intelligence & Data Science (AIDS)',
  'Information Technology',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
];

const AddStudent = () => {
  const [form, setForm] = useState({
    RollNo: '', Enroll: '', Name: '', Div: '', Branch: '', Pass: '',
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
      const res  = await fetch(`${API_BASE}/admin/add-student/`, {
        method:  'POST',
        headers: authJsonHeaders(),
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to add student.'); }
      else {
        setSuccess(`Student "${form.Name}" added successfully!`);
        setForm({ RollNo: '', Enroll: '', Name: '', Div: '', Branch: '', Pass: '' });
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
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            Add Student
          </h2>

          <form className="admin-form" onSubmit={handleSubmit}>
            <div className="admin-form-row">
              <div className="admin-input-group">
                <label>Roll No</label>
                <input name="RollNo" value={form.RollNo} onChange={handleChange}
                  placeholder="e.g. 23" required />
              </div>
              <div className="admin-input-group">
                <label>Enrollment No</label>
                <input name="Enroll" value={form.Enroll} onChange={handleChange}
                  placeholder="e.g. 24002170514856" required />
              </div>
            </div>

            <div className="admin-input-group">
              <label>Full Name</label>
              <input name="Name" value={form.Name} onChange={handleChange}
                placeholder="e.g. Lunagariya Hinav" required />
            </div>

            <div className="admin-form-row">
              <div className="admin-input-group">
                <label>Division</label>
                <input name="Div" value={form.Div} onChange={handleChange}
                  placeholder="e.g. A" required />
              </div>
              <div className="admin-input-group">
                <label>Branch</label>
                <select name="Branch" value={form.Branch} onChange={handleChange} required>
                  <option value="">Select branch</option>
                  {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
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
              {loading ? 'Saving…' : 'Add Student'}
            </button>
          </form>
        </div>
      </main>
    </AdminLayout>
  );
};

export default AddStudent;
