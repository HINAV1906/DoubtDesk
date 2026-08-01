import React, { useState, useEffect, useRef, useCallback } from 'react';
import ProfileLayout from './ProfileLayout';
import { API_BASE, authHeaders } from '../api';
import DoubtComments from './DoubtComments';
import './StudentProfile.css';
import './Doubt.css';

const Doubt = () => {
  const enroll = localStorage.getItem('enroll') || localStorage.getItem('username') || 'N/A';
  const name   = localStorage.getItem('fullName') || 'Student';
  const div    = localStorage.getItem('div')      || 'Div-A';
  const branch = localStorage.getItem('branch')   || 'AIDS';
  const batch  = `${div} (${branch})`;

  const [faculties, setFaculties]                 = useState([]);
  const [selectedSub, setSelectedSub]             = useState('');
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [doubtText, setDoubtText]                 = useState('');
  const [selectedPhoto, setSelectedPhoto]         = useState(null);
  
  // Submit Form Feedback (Raise A New Doubt Card)
  const [submitError, setSubmitError]             = useState('');
  const [submitSuccess, setSubmitSuccess]         = useState('');
  const [loading, setLoading]                     = useState(false);

  // Delete Action Feedback (My Raised Doubts Card)
  const [deleteError, setDeleteError]             = useState('');
  const [deleteSuccess, setDeleteSuccess]         = useState('');
  const [deletingId, setDeletingId]               = useState(null);

  const [myDoubts, setMyDoubts]                   = useState([]);
  const [activeTab, setActiveTab]                 = useState('pending');
  const [searchQuery, setSearchQuery]             = useState('');

  const fileInputRef = useRef();

  // Fetch list of faculties for dropdown & subjects
  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        const res = await fetch(`${API_BASE}/faculty/`, { headers: authHeaders() });
        const data = await res.json();
        setFaculties(Array.isArray(data) ? data : []);
      } catch {
        setFaculties([]);
      }
    };
    fetchFaculties();
  }, []);

  // Fetch student's own doubts
  const fetchMyDoubts = useCallback(async () => {
    if (!enroll || enroll === 'N/A') return;
    try {
      const res = await fetch(`${API_BASE}/doubts/?enroll=${enroll}`, { headers: authHeaders() });
      const data = await res.json();
      setMyDoubts(Array.isArray(data) ? data : []);
    } catch {
      setMyDoubts([]);
    }
  }, [enroll]);

  useEffect(() => {
    fetchMyDoubts();
  }, [fetchMyDoubts]);

  // Dynamically extract unique subjects from Faculty Database
  const subjectsList = Array.from(new Set(faculties.map(f => f.subject).filter(Boolean)));

  // Filter faculties matching selected subject from DB
  const filteredFaculties = selectedSub
    ? faculties.filter(f => (f.subject || '').toUpperCase() === selectedSub.toUpperCase())
    : faculties;

  const handleSubChange = (e) => {
    const sub = e.target.value;
    setSelectedSub(sub);
    setSelectedFacultyId('');
    if (submitError) setSubmitError('');
    if (submitSuccess) setSubmitSuccess('');
  };

  const handleSubmitDoubt = async (e) => {
    e.preventDefault();
    setDeleteSuccess('');
    setDeleteError('');

    if (!selectedSub) {
      setSubmitError('Please select a subject!');
      return;
    }
    if (!selectedFacultyId) {
      setSubmitError('Please select a faculty member!');
      return;
    }
    if (!doubtText.trim()) {
      setSubmitError('Please enter your question description before submitting!');
      return;
    }

    setSubmitError('');
    setSubmitSuccess('');
    setLoading(true);

    const form = new FormData();
    form.append('enroll',     enroll);
    form.append('name',       name);
    form.append('batch',      batch);
    form.append('sub',        selectedSub);
    form.append('faculty_id', selectedFacultyId);
    form.append('doubt',      doubtText);
    if (selectedPhoto) {
      form.append('photo', selectedPhoto);
    }

    try {
      const res = await fetch(`${API_BASE}/doubts/submit/`, {
        method:  'POST',
        headers: authHeaders(),
        body:    form,
      });

      if (res.ok) {
        setSubmitSuccess('Doubt submitted successfully! ✅');
        setDoubtText('');
        setSelectedSub('');
        setSelectedFacultyId('');
        setSelectedPhoto(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setActiveTab('pending');
        fetchMyDoubts();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const err = await res.json().catch(() => null);
        setSubmitError(err?.error || err?.detail || `Server returned status ${res.status}`);
      }
    } catch {
      setSubmitError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDoubt = async (id) => {
    setDeletingId(id);
    setSubmitSuccess('');
    setSubmitError('');
    setDeleteError('');
    setDeleteSuccess('');

    try {
      const res = await fetch(`${API_BASE}/doubts/${id}/delete/`, {
        method:  'DELETE',
        headers: authHeaders(),
      });

      if (res.ok) {
        setMyDoubts(prev => prev.filter(d => d.id !== id));
        setDeleteSuccess('Doubt deleted successfully! 🗑️');
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

  const filteredMyDoubts = (myDoubts || []).filter(d => {
    if (!d) return false;
    const query = (searchQuery || '').toLowerCase();
    const sub = (d.sub || '').toLowerCase();
    const faculty = (d.faculty || '').toLowerCase();
    const shortname = (d.shortname || '').toLowerCase();
    const doubt = (d.doubt || '').toLowerCase();

    return (
      sub.includes(query) ||
      faculty.includes(query) ||
      shortname.includes(query) ||
      doubt.includes(query)
    );
  });

  const pendingDoubts   = filteredMyDoubts.filter(d => d && (d.status || 'pending').toLowerCase() === 'pending');
  const solvedDoubts    = filteredMyDoubts.filter(d => d && (d.status || '').toLowerCase() === 'solved');
  const displayedDoubts = activeTab === 'pending' ? pendingDoubts : solvedDoubts;

  return (
    <ProfileLayout>
      <main className="profile-main-content doubt-main-content">
        <div className="doubt-container">

          {/* CARD 1: RAISE A NEW DOUBT */}
          <div className="doubt-card-box">
            <div className="doubt-title-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B5232" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                <h2 className="doubt-title">Raise A New Doubt</h2>
              </div>
            </div>

            {/* Submit Form Alerts */}
            {submitError && (
              <div style={{ color: '#f43f5e', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.5)', padding: '0.65rem 1rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '600', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{submitError}</span>
              </div>
            )}

            {submitSuccess && (
              <div style={{ color: '#22543D', background: '#F0FFF4', border: '1.5px solid #38A169', padding: '0.75rem 1.1rem', borderRadius: '12px', fontSize: '0.95rem', fontWeight: '700', marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.6rem', boxShadow: '0 4px 14px rgba(56, 161, 105, 0.15)' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span>{submitSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmitDoubt} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div className="doubt-form-row">
                <div className="doubt-input-group">
                  <label>Select Subject</label>
                  <select value={selectedSub} onChange={handleSubChange} required>
                    <option value="">-- Select Subject --</option>
                    {subjectsList.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="doubt-input-group">
                  <label>Assign To Faculty</label>
                  <select
                    value={selectedFacultyId}
                    onChange={e => { setSelectedFacultyId(e.target.value); if (submitError) setSubmitError(''); }}
                    required
                  >
                    <option value="">-- Select Faculty --</option>
                    {(filteredFaculties.length > 0 ? filteredFaculties : faculties).map(f => (
                      <option key={f.id} value={f.id}>{f.fullname} ({f.shortname})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="doubt-input-group">
                <label>Description</label>
                <textarea
                  placeholder="Describe your question..."
                  value={doubtText}
                  onChange={e => { setDoubtText(e.target.value); if (submitError) setSubmitError(''); }}
                  rows={4}
                  required
                />
              </div>

              <div className="doubt-action-row">
                <label className="file-attach-btn">
                  <span>{selectedPhoto ? selectedPhoto.name : 'Attach Image'}</span>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={e => setSelectedPhoto(e.target.files[0])} style={{ display: 'none' }} />
                </label>
                <button type="submit" className="doubt-submit-btn" disabled={loading}>
                  {loading ? 'Submitting…' : 'Submit'}
                </button>
              </div>
            </form>
          </div>


          {/* CARD 2: MY RAISED DOUBTS */}
          <div className="doubt-card-box">
            <div className="doubt-title-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B5232" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                <h2 className="doubt-title">My Raised Doubts</h2>
              </div>
            </div>

            {/* Delete Doubts Alerts */}
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

            <div style={{ margin: '14px 0' }}>
              <input
                type="text"
                className="doubt-search-input"
                placeholder="🔍 Search my doubts by subject, faculty name, or question text..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

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

            {displayedDoubts.length === 0 ? (
              <p className="doubt-empty-text">
                No {activeTab} doubts found.
              </p>
            ) : (
              displayedDoubts.map(d => (
                <div key={d.id} className="doubt-item-card">
                  <div className="doubt-item-header">
                    <div className="doubt-student-info">
                      <span className="doubt-student-name">{d.sub || 'No Subject'}</span>
                      <span className="doubt-student-sub">Assigned to: {d.faculty || 'Faculty'} ({d.shortname || ''})</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                      <span className={(d.status || '').toLowerCase() === 'solved' ? 'badge-solved' : 'badge-pending'}>
                        {d.status || 'pending'}
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
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{d.doubt}</p>
                  </div>

                  {d.photo && (
                    <div className="doubt-image-preview">
                      <a href={d.photo} target="_blank" rel="noreferrer">
                        <img src={d.photo} alt="Doubt attachment" />
                      </a>
                    </div>
                  )}

                  {d.status === 'solved' && (
                    <div className="solution-box">
                      <div className="solution-header">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        <span>Solution from {d.faculty}</span>
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

                  <DoubtComments doubtId={d.id} />
                </div>
              ))
            )}
          </div>

        </div>
      </main>
    </ProfileLayout>
  );
};

export default Doubt;