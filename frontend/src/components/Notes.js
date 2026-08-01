import React, { useState, useEffect, useCallback } from 'react';
import ProfileLayout from './ProfileLayout';
import { API_BASE, authHeaders } from '../api';
import './Notes.css';
import './UploadNotes.css';

const Notes = () => {
  const [activeSem,     setActiveSem]     = useState(1);
  const [activePhase,   setActivePhase]   = useState(1);
  const [activeFaculty, setActiveFaculty] = useState('ALL');
  const [notes,         setNotes]         = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [searchQuery,   setSearchQuery]   = useState('');

  const fetchNotes = useCallback(async (sem, phase) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/notes/?sem=${sem}&faze=${phase}`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      setNotes(Array.isArray(data) ? data : []);
      setActiveFaculty('ALL');
    } catch {
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSem && activePhase) fetchNotes(activeSem, activePhase);
  }, [activeSem, activePhase, fetchNotes]);

  // Extract unique faculty shortnames
  const facultyList = Array.from(
    new Set(notes.map(n => n.shortname || n.uploaded_by).filter(Boolean))
  );

  // Filter notes based on active faculty choice & search query
  const displayedNotes = notes.filter(n => {
    const matchesFaculty = !activeFaculty || activeFaculty === 'ALL' || (n.shortname || n.uploaded_by || '').toUpperCase() === activeFaculty.toUpperCase();
    const query = searchQuery.toLowerCase();
    const matchesQuery = !searchQuery || (
      (n.original_name || n.file_name || '').toLowerCase().includes(query) ||
      (n.shortname || n.uploaded_by || '').toLowerCase().includes(query) ||
      (n.faculty || '').toLowerCase().includes(query)
    );
    return matchesFaculty && matchesQuery;
  });

  return (
    <ProfileLayout>
      <main className="profile-main-content notes-main-content">
        <div className="notes-container" style={{ maxWidth: '1240px' }}>
          
          {/* Page Title Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 className="notes-heading" style={{ margin: 0, textAlign: 'left' }}>Academic Study Notes</h2>
              <p style={{ color: '#4A5568', margin: '0.3rem 0 0 0', fontSize: '0.9rem' }}>
                Browse verified lecture notes, course summaries, and phase materials.
              </p>
            </div>

            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '280px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="🔍 Search notes by file or faculty..."
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem',
                  borderRadius: '12px',
                  border: '1px solid rgba(27, 38, 59, 0.18)',
                  background: '#FFFFFF',
                  fontSize: '0.88rem',
                  color: '#1B263B',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* 2-Part Screen Split Layout */}
          <div className="notes-split-wrapper" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '1.5rem', width: '100%' }}>
            
            {/* Left Part: Semester & Phase Selector Navigation Card */}
            <div style={{ background: '#FFFFFF', border: '1px solid rgba(27, 38, 59, 0.12)', borderRadius: '20px', padding: '1.4rem', boxShadow: '0 8px 24px rgba(27, 38, 59, 0.05)', display: 'flex', flexDirection: 'column', gap: '1.2rem', height: 'fit-content' }}>
              
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#3B5232', display: 'block', marginBottom: '0.6rem' }}>
                  1. Select Semester
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {[1, 2, 3, 4].map(sem => (
                    <button
                      key={sem}
                      onClick={() => setActiveSem(sem)}
                      style={{
                        padding: '0.7rem 1rem',
                        borderRadius: '12px',
                        border: activeSem === sem ? '1px solid #3B5232' : '1px solid rgba(27, 38, 59, 0.1)',
                        background: activeSem === sem ? '#3B5232' : 'rgba(250, 244, 232, 0.6)',
                        color: activeSem === sem ? '#FFFFFF' : '#1B263B',
                        fontWeight: '700',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span>Sem-{sem}</span>
                      {activeSem === sem && <span>✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#3B5232', display: 'block', marginBottom: '0.6rem' }}>
                  2. Select Phase
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {[1, 2, 3, 4].map(phase => (
                    <button
                      key={phase}
                      onClick={() => setActivePhase(phase)}
                      style={{
                        padding: '0.65rem 0.5rem',
                        borderRadius: '12px',
                        border: activePhase === phase ? '1px solid #3B5232' : '1px solid rgba(27, 38, 59, 0.1)',
                        background: activePhase === phase ? '#3B5232' : '#FFFFFF',
                        color: activePhase === phase ? '#FFFFFF' : '#1B263B',
                        fontWeight: '700',
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      Phase-{phase}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Part: Faculty Filter & Notes List (Matching Faculty View) */}
            <div style={{ background: '#FFFFFF', border: '1px solid rgba(27, 38, 59, 0.12)', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 8px 24px rgba(27, 38, 59, 0.05)' }}>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', paddingBottom: '0.8rem', borderBottom: '1px solid rgba(27, 38, 59, 0.08)' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1B263B' }}>
                  Sem-{activeSem} &nbsp;›&nbsp; Phase-{activePhase} Notes
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#3B5232', background: 'rgba(59, 82, 50, 0.1)', padding: '0.3rem 0.8rem', borderRadius: '20px' }}>
                  {displayedNotes.length} File{displayedNotes.length !== 1 ? 's' : ''} Found
                </span>
              </div>

              {/* Faculty Filter Bar (Pill buttons matching Faculty View) */}
              {notes.length > 0 && (
                <div className="faculty-filter-bar" style={{ marginTop: 0, marginBottom: '1.2rem' }}>
                  <button
                    className={`faculty-filter-btn ${activeFaculty === 'ALL' ? 'active' : ''}`}
                    onClick={() => setActiveFaculty('ALL')}
                  >
                    All Faculty Notes ({notes.length})
                  </button>
                  {facultyList.map(sn => (
                    <button
                      key={sn}
                      className={`faculty-filter-btn ${activeFaculty === sn ? 'active' : ''}`}
                      onClick={() => setActiveFaculty(sn)}
                    >
                      Faculty {sn} Notes
                    </button>
                  ))}
                </div>
              )}

              {/* Files List Display */}
              <div className="uploaded-files-section" style={{ border: 'none', padding: 0 }}>
                {loading ? (
                  <p className="no-files-msg">Loading notes…</p>
                ) : displayedNotes.length === 0 ? (
                  <p className="no-files-msg">No notes available for Sem-{activeSem} Phase-{activePhase} {activeFaculty !== 'ALL' ? `(Faculty ${activeFaculty})` : ''}.</p>
                ) : (
                  displayedNotes.map(file => (
                    <div key={file.id} className="uploaded-file-item" style={{ background: 'rgba(250, 244, 232, 0.7)', border: '1px solid rgba(27, 38, 59, 0.1)', borderRadius: '14px', padding: '1rem 1.2rem', marginBottom: '0.8rem' }}>
                      <div className="uploaded-file-meta">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3B5232" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="uploaded-file-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                        <div className="uploaded-file-details">
                          <a
                            href={file.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="uploaded-file-name"
                            style={{ textDecoration: 'none', color: '#1B263B', fontWeight: '700', fontSize: '0.95rem' }}
                          >
                            {file.original_name || file.file_name}
                          </a>
                          <span className="uploaded-file-info" style={{ color: '#4A5568', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                            {file.size} &nbsp;·&nbsp; Uploaded by <strong>{file.faculty || file.shortname || file.uploaded_by}</strong>
                          </span>
                        </div>
                      </div>

                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="delete-file-btn"
                        style={{
                          textDecoration: 'none',
                          color: '#FFFFFF',
                          background: '#3B5232',
                          borderColor: '#3B5232',
                          padding: '0.5rem 1rem',
                          borderRadius: '10px',
                          fontWeight: '600',
                          fontSize: '0.82rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem'
                        }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        <span>View / Download</span>
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </ProfileLayout>
  );
};

export default Notes;
