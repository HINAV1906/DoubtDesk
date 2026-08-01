import React, { useState } from 'react';
import AdminLayout from './AdminLayout';
import { API_BASE, authJsonHeaders, authHeaders } from '../api';
import './StudentProfile.css';
import './AdminLayout.css';

const DeleteStudent = () => {
  const [enrollInput, setEnrollInput]     = useState('');
  const [studentData, setStudentData]     = useState(null);
  const [loading, setLoading]             = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [success, setSuccess]             = useState('');
  const [error, setError]                 = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!enrollInput.trim()) return;
    setError('');
    setSuccess('');
    setStudentData(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/admin/delete-student/?enroll=${encodeURIComponent(enrollInput.trim())}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Student not found.');
      } else {
        setStudentData(data);
      }
    } catch {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!studentData) return;

    setError('');
    setSuccess('');
    setDeleteLoading(true);

    try {
      const res = await fetch(`${API_BASE}/admin/delete-student/`, {
        method: 'POST',
        headers: authJsonHeaders(),
        body: JSON.stringify({ enroll: studentData.enroll }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to delete student.');
      } else {
        const deletedName = studentData.name;
        setSuccess(`Student "${deletedName}" deleted successfully! 🗑️`);
        setStudentData(null);
        setEnrollInput('');
      }
    } catch {
      setError('Could not connect to server.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <AdminLayout>
      <main className="profile-main-content">
        <div className="admin-form-card">
          <h2 className="admin-form-title" style={{ color: '#C53030' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
            Delete Student
          </h2>

          <p style={{ color: '#4A5568', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
            Search a student by Enrollment Number to view details and permanently delete their record.
          </p>

          {/* Single Action Alert Banners */}
          {error && (
            <div className="admin-msg-error">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="admin-msg-error">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
              <span>{success}</span>
            </div>
          )}

          <form className="admin-form" onSubmit={handleSearch}>
            <div className="admin-input-group">
              <label>Search Student by Enrollment Number</label>
              <div style={{ display: 'flex', gap: '0.8rem' }}>
                <input
                  type="text"
                  value={enrollInput}
                  onChange={(e) => setEnrollInput(e.target.value)}
                  placeholder="e.g. 24002170514856"
                  required
                  style={{ flex: 1 }}
                />
                <button type="submit" className="admin-submit-btn" disabled={loading} style={{ width: 'auto', padding: '0 1.5rem' }}>
                  {loading ? 'Searching…' : '🔍 Search'}
                </button>
              </div>
            </div>
          </form>

          {studentData && (
            <div style={{ marginTop: '1.5rem', background: 'rgba(254, 226, 226, 0.4)', border: '1px solid rgba(229, 62, 62, 0.3)', borderRadius: '16px', padding: '1.5rem' }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#9B2C2C', fontSize: '1.1rem', fontWeight: '700' }}>
                Student Record Found
              </h3>
              
              <div className="admin-form-row" style={{ marginBottom: '0.8rem' }}>
                <div><strong>Full Name:</strong> {studentData.name}</div>
                <div><strong>Enrollment:</strong> {studentData.enroll}</div>
              </div>
              
              <div className="admin-form-row" style={{ marginBottom: '1.2rem' }}>
                <div><strong>Roll No:</strong> {studentData.rollno}</div>
                <div><strong>Division:</strong> {studentData.div}</div>
                <div><strong>Branch:</strong> {studentData.branch}</div>
              </div>

              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteLoading}
                className="admin-submit-btn"
                style={{ background: '#E53E3E', borderColor: '#C53030', width: '100%', justifyContent: 'center' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                {deleteLoading ? 'Deleting Student…' : `Confirm Delete Student (${studentData.enroll})`}
              </button>
            </div>
          )}
        </div>
      </main>
    </AdminLayout>
  );
};

export default DeleteStudent;
