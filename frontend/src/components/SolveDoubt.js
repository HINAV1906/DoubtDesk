import React, { useState, useEffect, useCallback } from 'react';
import FacultyLayout from './FacultyLayout';
import { API_BASE, authHeaders } from '../api';
import DoubtComments from './DoubtComments';
import './StudentProfile.css';
import './Doubt.css';

const SolveDoubt = () => {
  const shortname = (localStorage.getItem('shortname') || localStorage.getItem('username') || '').toUpperCase();

  const [doubts, setDoubts]                 = useState([]);
  const [activeTab, setActiveTab]           = useState('pending');
  const [loading, setLoading]               = useState(false);
  const [searchQuery, setSearchQuery]       = useState('');
  const [solutions, setSolutions]           = useState({});
  const [solutionPhotos, setSolutionPhotos] = useState({});
  const [errors, setErrors]                 = useState({});
  const [submittingId, setSubmittingId]     = useState(null);
  const [deletingId, setDeletingId]         = useState(null);

  // Solve Action Feedback
  const [solveSuccess, setSolveSuccess]     = useState('');
  const [solveError, setSolveError]         = useState('');

  // Delete Action Feedback
  const [deleteSuccess, setDeleteSuccess]   = useState('');
  const [deleteError, setDeleteError]       = useState('');

  const fetchAssignedDoubts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/doubts/?shortname=${shortname}`, { headers: authHeaders() });
      const data = await res.json();
      setDoubts(Array.isArray(data) ? data : []);
    } catch {
      setDoubts([]);
    } finally {
      setLoading(false);
    }
  }, [shortname]);

  useEffect(() => {
    fetchAssignedDoubts();
  }, [fetchAssignedDoubts]);

  const handlePrintReport = () => {
    const printWindow = window.open('', '_blank');
    const content = `
      <html>
        <head>
          <title>DoubtDesk - Solved Doubts Report (${shortname})</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #1e293b; }
            h1 { color: #0284c7; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
            .meta { font-size: 14px; color: #64748b; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; font-size: 13px; }
            th { background: #f1f5f9; font-weight: bold; }
            .status-solved { color: #16a34a; font-weight: bold; }
            .status-pending { color: #d97706; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>DoubtDesk — Subject Doubts Report</h1>
          <div class="meta">Faculty: <strong>${shortname}</strong> | Total Doubts: ${doubts.length} | Date: ${new Date().toLocaleDateString()}</div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Student</th>
                <th>Subject</th>
                <th>Question</th>
                <th>Status</th>
                <th>Solution</th>
              </tr>
            </thead>
            <tbody>
              ${doubts.map((d, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${d.name}<br/><small>${d.enroll}</small></td>
                  <td>${d.sub}</td>
                  <td>${d.doubt}</td>
                  <td class="status-${d.status}">${d.status.toUpperCase()}</td>
                  <td>${d.solution || '—'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSolutionTextChange = (doubtId, text) => {
    setSolutions(prev => ({ ...prev, [doubtId]: text }));
    if (text.trim()) {
      setErrors(prev => ({ ...prev, [doubtId]: '' }));
    }
  };

  const handlePhotoChange = (doubtId, file) => {
    setSolutionPhotos(prev => ({ ...prev, [doubtId]: file }));
    if (file) {
      setErrors(prev => ({ ...prev, [doubtId]: '' }));
    }
  };

  const handleSolveSubmit = async (doubtId) => {
    const solText = solutions[doubtId] || '';
    const solFile = solutionPhotos[doubtId];

    if (!solText.trim() && !solFile) {
      setErrors(prev => ({ ...prev, [doubtId]: 'Please write a solution description or attach a photo before submitting!' }));
      return;
    }

    setErrors(prev => ({ ...prev, [doubtId]: '' }));
    setSolveError('');
    setSolveSuccess('');
    setDeleteSuccess('');
    setDeleteError('');
    setSubmittingId(doubtId);

    const form = new FormData();
    form.append('solution', solText);
    if (solFile) {
      form.append('photo', solFile);
    }

    try {
      const res = await fetch(`${API_BASE}/doubts/${doubtId}/solve/`, {
        method:  'POST',
        headers: authHeaders(),
        body:    form,
      });

      if (res.ok) {
        setSolveSuccess('Doubt solved and updated in database successfully! ✅');
        setSolutions(prev => ({ ...prev, [doubtId]: '' }));
        setSolutionPhotos(prev => ({ ...prev, [doubtId]: null }));
        fetchAssignedDoubts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const err = await res.json().catch(() => null);
        const errMsg = err?.error || err?.detail || 'Failed to submit solution.';
        setErrors(prev => ({ ...prev, [doubtId]: errMsg }));
        setSolveError(errMsg);
      }
    } catch {
      const connErr = 'Could not connect to server.';
      setErrors(prev => ({ ...prev, [doubtId]: connErr }));
      setSolveError(connErr);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleDeleteDoubt = async (id) => {
    setDeletingId(id);
    setSolveSuccess('');
    setSolveError('');
    setDeleteError('');
    setDeleteSuccess('');

    try {
      const res = await fetch(`${API_BASE}/doubts/${id}/delete/`, {
        method:  'DELETE',
        headers: authHeaders(),
      });

      if (res.ok) {
        setDoubts(prev => prev.filter(d => d.id !== id));
        setDeleteSuccess('Doubt deleted successfully from database! 🗑️');
      } else {
        const errData = await res.json().catch(() => null);
        setDeleteError(errData?.error || errData?.detail || 'Failed to delete doubt.');
      }
    } catch {
      setDeleteError('Could not connect to server.');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredDoubts = doubts.filter(d => {
    const query = searchQuery.toLowerCase();
    return (
      d.name.toLowerCase().includes(query) ||
      d.enroll.toLowerCase().includes(query) ||
      d.sub.toLowerCase().includes(query) ||
      d.doubt.toLowerCase().includes(query)
    );
  });

  const pendingDoubts = filteredDoubts.filter(d => d.status === 'pending');
  const solvedDoubts  = filteredDoubts.filter(d => d.status === 'solved');
  const displayedList = activeTab === 'pending' ? pendingDoubts : solvedDoubts;

  return (
    <FacultyLayout>
      <main className="profile-main-content doubt-main-content">
        <div className="doubt-container">

          <div className="doubt-card-box">
            <div className="doubt-title-row" style={{ justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B5232" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="10"/></svg>
                <h2 className="doubt-title">Solve Student Doubts ({shortname})</h2>
              </div>
              <button
                onClick={handlePrintReport}
                style={{
                  background: 'rgba(59, 82, 50, 0.12)',
                  border: '1px solid rgba(59, 82, 50, 0.3)',
                  color: '#3B5232',
                  padding: '6px 14px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Export PDF Report
              </button>
            </div>

            {/* Solve Action Alerts */}
            {solveError && (
              <div style={{ color: '#f43f5e', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.5)', padding: '0.65rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{solveError}</span>
              </div>
            )}

            {solveSuccess && (
              <div style={{ color: '#22543D', background: '#F0FFF4', border: '1.5px solid #38A169', padding: '0.75rem 1.1rem', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '700', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 4px 14px rgba(56, 161, 105, 0.15)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span>{solveSuccess}</span>
              </div>
            )}

            {/* Delete Action Alerts */}
            {deleteError && (
              <div style={{ color: '#f43f5e', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.5)', padding: '0.65rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{deleteError}</span>
              </div>
            )}

            {deleteSuccess && (
              <div style={{ color: '#9B2C2C', background: '#FFF5F5', border: '1.5px solid #E53E3E', padding: '0.75rem 1.1rem', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '700', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 4px 14px rgba(229, 62, 62, 0.15)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                <span>{deleteSuccess}</span>
              </div>
            )}

            {/* Search Bar */}
            <div style={{ margin: '14px 0' }}>
              <input
                type="text"
                className="doubt-search-input"
                placeholder="🔍 Search doubts by student name, enrollment, subject, or question keyword..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Tabs */}
            <div className="doubt-status-tabs">
              <button
                className={`status-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
                onClick={() => setActiveTab('pending')}
              >
                <span>Pending Doubts ({pendingDoubts.length})</span>
              </button>
              <button
                className={`status-tab-btn ${activeTab === 'solved' ? 'active' : ''}`}
                onClick={() => setActiveTab('solved')}
              >
                <span>Solved Doubts ({solvedDoubts.length})</span>
              </button>
            </div>

            {loading ? (
              <p className="doubt-empty-text">Loading doubts…</p>
            ) : displayedList.length === 0 ? (
              <p className="doubt-empty-text">
                No {activeTab} doubts found for your profile ({shortname}).
              </p>
            ) : (
              displayedList.map(d => (
                <div key={d.id} className="doubt-item-card">
                  <div className="doubt-item-header">
                    <div className="doubt-student-info">
                      <span className="doubt-student-name">{d.name} ({d.enroll})</span>
                      <span className="doubt-student-sub">
                        Sub: {d.sub} &nbsp;·&nbsp; Batch: {d.batch}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <span className={d.status === 'solved' ? 'badge-solved' : 'badge-pending'}>
                        {d.status}
                      </span>
                      <button
                        className="delete-file-btn"
                        style={{ padding: '0.25rem 0.6rem', fontSize: '0.72rem' }}
                        onClick={() => handleDeleteDoubt(d.id)}
                        disabled={deletingId === d.id}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        {deletingId === d.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </div>

                  <div className="doubt-text-box">
                    <p style={{ margin: 0, fontWeight: 700, color: '#3B5232', marginBottom: '0.3rem', fontSize: '0.78rem' }}>STUDENT QUESTION:</p>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{d.doubt}</p>
                  </div>

                  {d.photo && (
                    <div className="doubt-image-preview">
                      <p style={{ margin: '0 0 0.4rem 0', fontSize: '0.78rem', color: '#3B5232', fontWeight: 700 }}>Attached Question Image:</p>
                      <a href={d.photo} target="_blank" rel="noreferrer">
                        <img src={d.photo} alt="Student doubt attachment" />
                      </a>
                    </div>
                  )}

                  {/* If Pending: Solution Input Form */}
                  {d.status === 'pending' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '0.6rem', background: 'rgba(59, 82, 50, 0.06)', padding: '1.2rem', borderRadius: '14px', border: '1.5px solid rgba(59, 82, 50, 0.2)' }}>
                      <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#3B5232', letterSpacing: '0.5px' }}>PROVIDE SOLUTION:</label>
                      
                      {/* Danger alert for empty solution field */}
                      {errors[d.id] && (
                        <div style={{ color: '#f43f5e', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.5)', padding: '0.55rem 0.85rem', borderRadius: '8px', fontSize: '0.82rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                          <span>{errors[d.id]}</span>
                        </div>
                      )}

                      <textarea
                        className="doubt-search-input"
                        style={{ minHeight: '85px' }}
                        placeholder="Write step-by-step solution answer here…"
                        value={solutions[d.id] || ''}
                        onChange={e => handleSolutionTextChange(d.id, e.target.value)}
                      />

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                        <label className="file-attach-btn" style={{ padding: '0.45rem 0.8rem', fontSize: '0.78rem' }}>
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                          <span>{solutionPhotos[d.id] ? solutionPhotos[d.id].name : 'Attach Solution Image (Optional)'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => handlePhotoChange(d.id, e.target.files[0])}
                            style={{ display: 'none' }}
                          />
                        </label>

                        <button
                          className="doubt-submit-btn"
                          style={{ margin: 0, padding: '0.55rem 1.4rem', fontSize: '0.85rem' }}
                          onClick={() => handleSolveSubmit(d.id)}
                          disabled={submittingId === d.id}
                        >
                          <span>{submittingId === d.id ? 'Saving…' : 'Solve & Update Database'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* If Solved: Solution Display */}
                  {d.status === 'solved' && (
                    <div className="solution-box">
                      <div className="solution-header">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        <span>Provided Solution:</span>
                      </div>
                      {d.solution && <p className="solution-text">{d.solution}</p>}
                      {d.solution_photo && (
                        <div className="doubt-image-preview">
                          <a href={d.solution_photo} target="_blank" rel="noreferrer">
                            <img src={d.solution_photo} alt="Solution attachment" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Discussion Thread */}
                  <DoubtComments doubtId={d.id} />
                </div>
              ))
            )}

          </div>

        </div>
      </main>
    </FacultyLayout>
  );
};

export default SolveDoubt;
