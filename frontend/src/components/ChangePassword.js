import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import ProfileLayout from './ProfileLayout';
import FacultyLayout from './FacultyLayout';
import AdminLayout from './AdminLayout';
import logo from '../assets/DoubtDesk_logo.png';
import { API_BASE, authJsonHeaders } from '../api';
import './Login.css';
import './ChangePassword.css';

const ChangePassword = () => {
  const navigate = useNavigate();
  const isLoggedIn     = localStorage.getItem('isLoggedIn') === 'true';
  const storedUsername = localStorage.getItem('username') || '';
  const storedRole     = (localStorage.getItem('role') || '').toLowerCase();

  const [username,    setUsername]    = useState(storedUsername);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error,       setError]       = useState('');
  const [success,     setSuccess]     = useState('');
  const [loading,     setLoading]     = useState(false);

  const labelText = storedRole === 'student' ? 'Enrollment Number'
                  : storedRole === 'faculty' ? 'Faculty ShortName'
                  : storedRole === 'admin'   ? 'Admin Name'
                  : 'Username / ShortName / Enrollment';

  const expectedLength = storedRole === 'student' ? 6 : 4;
  const pwdPlaceholder = 'Enter new password';


  const handleSubmit = async (e) => {

    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side digit validation
    if (!/^\d+$/.test(newPassword)) {
      setError('Only digits are allowed in password.');
      return;
    }

    if (storedRole === 'student' && newPassword.length !== 6) {
      setError('Student password must be exactly 6 digits.');
      return;
    }

    if ((storedRole === 'faculty' || storedRole === 'admin') && newPassword.length !== 4) {
      setError(`${storedRole.charAt(0).toUpperCase() + storedRole.slice(1)} password must be exactly 4 digits.`);
      return;
    }

    setLoading(true);
    const userToSubmit = username || storedUsername;

    try {
      const res = await fetch(`${API_BASE}/change-password/`, {
        method:  'POST',
        headers: authJsonHeaders(),
        body:    JSON.stringify({
          username:     userToSubmit,
          old_password: oldPassword,
          new_password: newPassword,
          role:         storedRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to change password.');
        setLoading(false);
        return;
      }

      if (data.token) localStorage.setItem('token', data.token);

      setSuccess('Password changed successfully in database!');
      setLoading(false);

      setTimeout(() => {
        const role = localStorage.getItem('role');
        if (role === 'faculty') navigate('/faculty');
        else if (role === 'admin') navigate('/admin-profile');
        else navigate('/profile');
      }, 1500);

    } catch {
      setError('Could not connect to server.');
      setLoading(false);
    }
  };

  const FormFields = (
    <form className="login-form" onSubmit={handleSubmit}>
      <div className="input-group">
        <label>{labelText}</label>
        <input
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
      </div>

      <div className="input-group">
        <label>Old Password</label>
        <input
          type="password"
          inputMode="numeric"
          pattern="\d*"
          placeholder="Enter old password"
          value={oldPassword}
          onChange={e => {
            const val = e.target.value;
            if (/[^\d]/.test(val)) {
              setError('Only digits are allowed in password.');
            } else if (error === 'Only digits are allowed in password.') {
              setError('');
            }
            setOldPassword(val.replace(/\D/g, ''));
          }}
          required
        />
      </div>

      <div className="input-group">
        <label>New Password</label>
        <input

          type="password"
          inputMode="numeric"
          pattern="\d*"
          maxLength={expectedLength}
          placeholder={pwdPlaceholder}
          value={newPassword}
          onChange={e => {
            const val = e.target.value;
            if (/[^\d]/.test(val)) {
              setError('Only digits are allowed in password.');
            } else if (error === 'Only digits are allowed in password.') {
              setError('');
            }
            setNewPassword(val.replace(/\D/g, ''));
          }}
          required
        />
      </div>

      {error   && <p style={{ color: '#f87171', fontSize: '0.82rem', margin: 0 }}>{error}</p>}
      {success && <p style={{ color: '#6ee7b7', fontSize: '0.82rem', margin: 0 }}>{success}</p>}

      <button
        type="submit"
        className="login-btn"
        disabled={loading}
        style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', justifyContent: 'center', opacity: loading ? 0.7 : 1, width: '100%', marginTop: '0.6rem' }}
      >
        <span>{loading ? 'Updating…' : 'Update Password'}</span>
        {!loading && (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M21 13a9 9 0 1 1-3-7.7L21 8"/></svg>
        )}
      </button>
    </form>
  );

  const SingleCard = (
    <div className="login-right change-password-right change-password-single-card">
      <div className="login-right-header">
        <img src={logo} alt="DoubtDesk Small Logo" className="login-small-logo" />
        <h3>DoubtDesk</h3>
      </div>
      {FormFields}
    </div>
  );

  // If user is logged in, render inside their profile layout
  if (isLoggedIn) {
    const LayoutComponent = storedRole === 'faculty' ? FacultyLayout
                          : storedRole === 'admin'   ? AdminLayout
                          : ProfileLayout;

    return (
      <LayoutComponent>
        <main className="profile-main-content">
          {SingleCard}
        </main>
      </LayoutComponent>
    );
  }

  // If logged out, render in default Navbar wrapper
  return (
    <Navbar>
      <div className="login-wrapper">
        <div className="login-card change-password-card">
          <div className="login-left">
            <h2>Welcome To DoubtDesk</h2>
            <img src={logo} alt="DoubtDesk Large Logo" className="login-large-logo" />
            <ul className="login-steps">
              <li><span className="step-icon">💡</span><span className="step-text">Resolve your queries instantly</span></li>
              <li><span className="step-icon">🚀</span><span className="step-text">Accelerate your learning journey</span></li>
              <li><span className="step-icon">🤝</span><span className="step-text">Join our active community today</span></li>
            </ul>
          </div>

          <div className="login-right change-password-right">
            <div className="login-right-header">
              <img src={logo} alt="DoubtDesk Small Logo" className="login-small-logo" />
              <h3>DoubtDesk</h3>
            </div>
            {FormFields}
          </div>
        </div>
      </div>
    </Navbar>
  );
};

export default ChangePassword;
