import React, { useState, useEffect } from 'react';
import { API_BASE, authHeaders, authJsonHeaders } from '../api';
import './FacultyDoubtStats.css';

const FacultyDoubtStats = () => {
  const [stats, setStats]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [toast, setToast]           = useState('');
  const [sending, setSending]       = useState(null);   // shortname of currently sending
  const [modal, setModal]           = useState(null);   // { fullname, shortname, pending }
  const [customMsg, setCustomMsg]   = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(''), 3000);
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics/faculty-stats/`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Faculty stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const openModal = (fac) => {
    setCustomMsg('');
    setModal(fac);
  };

  const sendReminder = async () => {
    if (!modal) return;
    setSending(modal.shortname);
    try {
      const res = await fetch(`${API_BASE}/admin/send-reminder/`, {
        method: 'POST',
        headers: authJsonHeaders(),
        body: JSON.stringify({
          shortname: modal.shortname,
          message:   customMsg.trim() || '',
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`✅ Reminder sent to ${modal.fullname}`, 'success');
        setModal(null);
      } else {
        showToast(`❌ ${data.error || 'Failed to send reminder'}`, 'error');
      }
    } catch {
      showToast('❌ Network error. Try again.', 'error');
    } finally {
      setSending(null);
    }
  };

  const [expandedFaculty, setExpandedFaculty] = useState(null);

  const handleDeleteDoubt = async (doubtId) => {
    if (!window.confirm('Are you sure you want to delete this doubt record? (This will ONLY delete the doubt record, NOT the faculty)')) return;
    try {
      const res = await fetch(`${API_BASE}/doubts/${doubtId}/delete/`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      if (res.ok) {
        showToast('🗑️ Doubt record deleted successfully! (Faculty profile kept intact)', 'success');
        fetchStats();
      } else {
        showToast('❌ Failed to delete doubt record.', 'error');
      }
    } catch {
      showToast('❌ Network error.', 'error');
    }
  };

  const totalDoubts  = stats.reduce((s, f) => s + f.total_doubts,   0);
  const totalSolved  = stats.reduce((s, f) => s + f.solved_doubts,  0);
  const totalPending = stats.reduce((s, f) => s + f.pending_doubts, 0);
  const pendingFaculties = stats.filter(f => f.pending_doubts > 0);

  return (
    <div className="fds-container">

      {/* ── Toast ── */}
      {toast && (
        <div 
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 99999,
            background: toast.type === 'error' ? '#FFF5F5' : '#F0FFF4',
            border: `2px solid ${toast.type === 'error' ? '#E53E3E' : '#38A169'}`,
            color: toast.type === 'error' ? '#9B2C2C' : '#22543D',
            padding: '1.4rem 2.2rem',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.8rem',
            fontSize: '1.1rem',
            fontWeight: '700',
            backdropFilter: 'blur(8px)',
          }}
        >
          <span style={{ fontSize: '1.6rem' }}>
            {toast.type === 'error' ? '⚠️' : '✅'}
          </span>
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── Reminder Modal ── */}
      {modal && (
        <div className="fds-modal-overlay" onClick={() => setModal(null)}>
          <div className="fds-modal" onClick={e => e.stopPropagation()}>
            <div className="fds-modal-header">
              <div className="fds-modal-icon">⚠️</div>
              <div>
                <h3 className="fds-modal-title">Send Reminder</h3>
                <p className="fds-modal-sub">
                  To: <strong>{modal.fullname}</strong> ({modal.shortname}) — {modal.pending_doubts} pending doubt{modal.pending_doubts > 1 ? 's' : ''}
                </p>
              </div>
              <button className="fds-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>

            <div className="fds-modal-body">
              <label className="fds-modal-label">Message (optional — leave blank for default)</label>
              <textarea
                className="fds-modal-textarea"
                rows={4}
                placeholder={`Default: "You have ${modal.pending_doubts} unresolved doubt(s). Please resolve them at the earliest."`}
                value={customMsg}
                onChange={e => setCustomMsg(e.target.value)}
              />
            </div>

            <div className="fds-modal-footer">
              <button className="fds-modal-cancel" onClick={() => setModal(null)}>Cancel</button>
              <button
                className="fds-modal-send"
                onClick={sendReminder}
                disabled={sending === modal.shortname}
              >
                {sending === modal.shortname ? 'Sending…' : '🔔 Send Reminder'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="fds-header">
        <div className="fds-title-row">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <h2>Faculty Doubt Report</h2>
        </div>
        <span className="fds-badge">Admin View</span>
      </div>

      {/* ── Pending Alert Banner ── */}
      {!loading && pendingFaculties.length > 0 && (
        <div className="fds-alert-banner">
          <span className="fds-alert-icon">⚠️</span>
          <span className="fds-alert-text">
            <strong>{pendingFaculties.length}</strong> faculty member{pendingFaculties.length > 1 ? 's have' : ' has'} unresolved doubts.
            Reminders are enabled after <strong>3 hours</strong> of unresolved status.
          </span>
        </div>
      )}

      {/* ── Summary Pills ── */}
      <div className="fds-summary-row">
        <div className="fds-pill fds-pill-blue">
          <span className="fds-pill-num">{totalDoubts}</span>
          <span className="fds-pill-label">Total Assigned</span>
        </div>
        <div className="fds-pill fds-pill-green">
          <span className="fds-pill-num">{totalSolved}</span>
          <span className="fds-pill-label">Solved</span>
        </div>
        <div className="fds-pill fds-pill-amber">
          <span className="fds-pill-num">{totalPending}</span>
          <span className="fds-pill-label">Pending</span>
        </div>
        <div className="fds-pill fds-pill-red">
          <span className="fds-pill-num">{pendingFaculties.length}</span>
          <span className="fds-pill-label">Need Action</span>
        </div>
      </div>

      {loading ? (
        <p className="fds-loading">Loading faculty data…</p>
      ) : stats.length === 0 ? (
        <p className="fds-empty">No faculty data found.</p>
      ) : (
        <div className="fds-table-wrapper">
          <table className="fds-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Faculty</th>
                <th>Subject</th>
                <th>Total</th>
                <th>Solved</th>
                <th>Pending</th>
                <th>Rate</th>
                <th>Progress</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((fac, idx) => (
                <React.Fragment key={fac.shortname}>
                  <tr className={fac.pending_doubts > 0 ? 'fds-row-alert' : ''}>
                    <td className="fds-rank">{idx + 1}</td>
                    <td>
                      <div className="fds-faculty-cell">
                        <div className={`fds-avatar ${fac.pending_doubts > 0 ? 'fds-avatar-alert' : ''}`}>
                          {fac.shortname.slice(0, 2)}
                        </div>
                        <div>
                          <span className="fds-faculty-name">{fac.fullname}</span>
                          <span className="fds-faculty-sn">{fac.shortname}</span>
                        </div>
                      </div>
                    </td>
                    <td className="fds-subject">{fac.subject}</td>
                    <td className="fds-total">{fac.total_doubts}</td>
                    <td>
                      <span className="fds-badge-solved">{fac.solved_doubts}</span>
                    </td>
                    <td>
                      <span className={`fds-badge-pending ${fac.pending_doubts === 0 ? 'zero' : ''}`}>
                        {fac.pending_doubts}
                      </span>
                    </td>
                    <td className="fds-rate">{fac.resolution_rate}%</td>
                    <td className="fds-progress-cell">
                      <div className="fds-bar-bg">
                        <div
                          className="fds-bar-fill"
                          style={{ width: `${fac.resolution_rate}%` }}
                        />
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                        {fac.pending_doubts > 0 ? (
                          fac.can_remind ? (
                            <button
                              className="fds-remind-btn"
                              onClick={() => openModal(fac)}
                              disabled={sending === fac.shortname}
                              title={`Send reminder to ${fac.fullname}`}
                            >
                              {sending === fac.shortname ? '…' : '🔔 Remind'}
                            </button>
                          ) : (
                            <span className="fds-no-action" style={{ color: '#975A16', background: '#FEFCBF', border: '1px solid #F6E05E', padding: '0.3rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>
                              ⏳ Waiting (&lt;3h)
                            </span>
                          )
                        ) : (
                          <span className="fds-no-action">✅ All clear</span>
                        )}

                        {fac.doubts && fac.doubts.length > 0 && (
                          <button
                            onClick={() => setExpandedFaculty(expandedFaculty === fac.shortname ? null : fac.shortname)}
                            style={{
                              background: 'rgba(27, 38, 59, 0.06)',
                              border: '1px solid rgba(27, 38, 59, 0.18)',
                              color: '#1B263B',
                              padding: '0.35rem 0.6rem',
                              borderRadius: '8px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}
                          >
                            {expandedFaculty === fac.shortname ? '▲ Hide Records' : `▼ View Records (${fac.doubts.length})`}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Doubt Records Drawer */}
                  {expandedFaculty === fac.shortname && (
                    <tr>
                      <td colSpan={9} style={{ padding: '0.8rem 1rem', background: '#FAFAFA', borderBottom: '2px solid rgba(27, 38, 59, 0.1)' }}>
                        <div style={{ textAlign: 'left' }}>
                          <h4 style={{ margin: '0 0 0.8rem 0', color: '#1B263B', fontSize: '0.92rem', fontWeight: '700' }}>
                            Assigned Doubt Records for {fac.fullname} ({fac.shortname})
                          </h4>
                          {fac.doubts.length === 0 ? (
                            <p style={{ fontSize: '0.85rem', color: '#718096' }}>No doubt records found.</p>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                              {fac.doubts.map(d => (
                                <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF', padding: '0.8rem 1rem', borderRadius: '10px', border: '1px solid rgba(27, 38, 59, 0.1)', flexWrap: 'wrap', gap: '0.8rem' }}>
                                  <div style={{ flex: 1, minWidth: '240px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.2rem' }}>
                                      <span style={{ fontWeight: '700', fontSize: '0.85rem', color: '#1B263B' }}>{d.name} ({d.enroll})</span>
                                      <span style={{ fontSize: '0.75rem', background: d.status === 'solved' ? '#C6F6D5' : '#FEFCBF', color: d.status === 'solved' ? '#22543D' : '#975A16', padding: '0.2rem 0.5rem', borderRadius: '6px', fontWeight: '700' }}>
                                        {d.status.toUpperCase()}
                                      </span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.86rem', color: '#4A5568' }}><strong>Question:</strong> {d.doubt}</p>
                                    <span style={{ fontSize: '0.78rem', color: '#A0AEC0' }}>Submitted: {d.created_at}</span>
                                  </div>

                                  <button
                                    onClick={() => handleDeleteDoubt(d.id)}
                                    style={{
                                      background: '#FFF5F5',
                                      border: '1px solid #FEB2B2',
                                      color: '#E53E3E',
                                      padding: '0.4rem 0.8rem',
                                      borderRadius: '8px',
                                      cursor: 'pointer',
                                      fontSize: '0.78rem',
                                      fontWeight: '700',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.3rem'
                                    }}
                                  >
                                    🗑️ Delete Record
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default FacultyDoubtStats;
