import React, { useState, useRef } from 'react';
import AdminLayout from './AdminLayout';
import { API_BASE, authHeaders } from '../api';
import './StudentProfile.css';
import './AdminLayout.css';

const EXPECTED_COLS = ['RollNo', 'Enroll', 'Name', 'Div', 'Branch', 'Pass'];

const parseCSV = (text) => {
  const lines = text.trim().split('\n').map(l => l.replace(/\r$/, ''));
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = lines[0].split(',').map(h => h.trim());
  const rows = lines.slice(1).map(line => {
    const vals = line.split(',').map(v => v.trim());
    const obj = {};
    headers.forEach((h, i) => { obj[h] = vals[i] || ''; });
    return obj;
  });
  return { headers, rows };
};

const AddStudentCsv = () => {
  const [file,     setFile]     = useState(null);
  const [preview,  setPreview]  = useState(null);   // { headers, rows }
  const [dragOver, setDragOver] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [result,   setResult]   = useState(null);   // { created, skipped, errors }
  const [error,    setError]    = useState('');
  const fileRef = useRef();

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => setPreview(parseCSV(e.target.result));
    reader.readAsText(f);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true); setError(''); setResult(null);
    const form = new FormData();
    form.append('file', file);
    try {
      const res  = await fetch(`${API_BASE}/admin/add-student-csv/`, {
        method: 'POST', headers: authHeaders(), body: form,
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || 'Upload failed.');
      else setResult(data);
    } catch {
      setError('Could not connect to server.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setFile(null); setPreview(null); setResult(null); setError(''); fileRef.current.value = ''; };

  return (
    <AdminLayout>
      <main className="profile-main-content">
        <div className="admin-form-card" style={{ maxWidth: 620 }}>
          <h2 className="admin-form-title">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>
            Add Students via CSV
          </h2>

          {/* Template hint */}
          <p className="csv-template-hint" style={{ marginBottom: '1rem', marginTop: 0 }}>
            CSV must have header row with columns:&nbsp;
            <strong style={{ color: '#3B5232' }}>{EXPECTED_COLS.join(', ')}</strong>
          </p>

          {/* Drop zone */}
          {!file && (
            <div
              className={`csv-drop-zone${dragOver ? ' drag-over' : ''}`}
              onClick={() => fileRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="csv-drop-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span className="csv-drop-text">Drag &amp; drop CSV here</span>
              <span className="csv-drop-sub">Only .csv files accepted</span>
              <button type="button" className="csv-choose-btn" onClick={e => { e.stopPropagation(); fileRef.current.click(); }}>
                Choose File
              </button>
              <input ref={fileRef} type="file" accept=".csv" onChange={e => handleFile(e.target.files[0])} />
            </div>
          )}

          {/* Selected file pill */}
          {file && (
            <div className="csv-selected-file">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B5232" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span className="csv-selected-name">{file.name}</span>
              <button className="csv-remove-btn" onClick={reset}>
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
              <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            </div>
          )}

          {/* Preview table */}
          {preview && preview.rows.length > 0 && (
            <div className="csv-preview-wrapper">
              <table className="csv-preview-table">
                <thead>
                  <tr>{preview.headers.map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {preview.rows.slice(0, 10).map((row, i) => (
                    <tr key={i}>{preview.headers.map(h => <td key={h}>{row[h]}</td>)}</tr>
                  ))}
                </tbody>
              </table>
              {preview.rows.length > 10 && (
                <p style={{ fontSize: '0.72rem', color: 'rgba(186,230,253,0.45)', padding: '0.4rem 0.8rem' }}>
                  …and {preview.rows.length - 10} more row(s)
                </p>
              )}
            </div>
          )}

          {/* Error / result */}
          {error && (
            <p className="admin-msg-error" style={{ marginTop: '0.8rem' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              {error}
            </p>
          )}

          {result && (
            <div style={{ marginTop: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <p className="admin-msg-success">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                CSV processed successfully! {result.created} student(s) added, {result.skipped} skipped. ✅
              </p>
              {result.errors && result.errors.length > 0 && result.errors.map((e, i) => (
                <p key={i} className="admin-msg-error" style={{ fontSize: '0.76rem' }}>⚠ {e}</p>
              ))}
            </div>
          )}

          {/* Upload button */}
          {file && !result && (
            <button className="admin-submit-btn" style={{ marginTop: '1rem' }} onClick={handleUpload} disabled={loading}>
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              {loading ? 'Uploading…' : `Upload ${preview?.rows.length || ''} Students`}
            </button>
          )}

          {result && (
            <button className="admin-submit-btn" style={{ marginTop: '1rem', background: 'rgba(255,255,255,0.08)', boxShadow: 'none' }} onClick={reset}>
              Upload Another File
            </button>
          )}
        </div>
      </main>
    </AdminLayout>
  );
};

export default AddStudentCsv;
