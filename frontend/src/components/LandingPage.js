import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Navbar from './Navbar';
import logo from '../assets/DoubtDesk_logo.png';
import { API_BASE } from '../api';
import './LandingPage.css';
import './Contact.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  // Login Form States
  const [selectedRole, setSelectedRole] = useState('student'); // 'student', 'faculty', 'admin'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Change Password toggle state for right side of login card
  const [isChangePasswordMode, setIsChangePasswordMode] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changePassSuccess, setChangePassSuccess] = useState('');
  const [changePassError, setChangePassError] = useState('');
  const [changePassLoading, setChangePassLoading] = useState(false);

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setChangePassError('');
    setChangePassSuccess('');

    if (!/^\d+$/.test(newPassword)) {
      setChangePassError('Only digits are allowed in password.');
      return;
    }

    setChangePassLoading(true);
    try {
      const res = await fetch(`${API_BASE}/change-password/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username,
          old_password: oldPassword,
          new_password: newPassword,
          role: selectedRole,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setChangePassError(data.error || 'Failed to change password.');
        setChangePassLoading(false);
        return;
      }

      setChangePassSuccess('Password changed successfully!');
      setChangePassLoading(false);
      setTimeout(() => {
        setIsChangePasswordMode(false);
        setChangePassSuccess('');
        setPassword('');
        setOldPassword('');
        setNewPassword('');
      }, 1500);
    } catch {
      setChangePassError('Could not connect to server.');
      setChangePassLoading(false);
    }
  };


  // Auto-redirect logged-in users to their dashboard
  useEffect(() => {
    if (isLoggedIn) {
      const userRole = localStorage.getItem('role');
      const target =
        userRole === 'faculty' ? '/faculty'
        : userRole === 'admin' ? '/admin-profile'
        : '/profile';
      navigate(target, { replace: true });
    }
  }, [isLoggedIn, navigate]);

  // Auto-scroll handling if navigated from another page
  useEffect(() => {
    if (location.state && location.state.scrollTo) {
      const target = document.getElementById(location.state.scrollTo);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [location]);

  // Handle Login Submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role: selectedRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed. Please verify credentials.');
        setLoading(false);
        return;
      }

      // Store Auth Session
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);

      if (data.role === 'admin') {
        localStorage.setItem('username', data.name);
        localStorage.setItem('fullName', data.name);
      } else if (data.role === 'faculty') {
        localStorage.setItem('username', data.shortname);
        localStorage.setItem('fullName', data.fullname);
        localStorage.setItem('shortname', data.shortname);
        localStorage.setItem('subject', data.subject || '');
        localStorage.setItem('mobile', data.mobile || '');
      } else {
        localStorage.setItem('username', data.enroll);
        localStorage.setItem('fullName', data.name);
        localStorage.setItem('enroll', data.enroll);
        localStorage.setItem('rollno', data.rollno || '');
        localStorage.setItem('div', data.div || '');
        localStorage.setItem('branch', data.branch || '');
      }

      setIsModalOpen(false);

      navigate(
        data.role === 'faculty' ? '/faculty'
        : data.role === 'admin' ? '/admin-profile'
        : '/profile'
      );
    } catch (err) {
      setError('Unable to reach server. Please check backend connection.');
      setLoading(false);
    }
  };


  return (
    <Navbar onOpenLoginModal={() => setIsModalOpen(true)}>
      <div className="landing-page-root">

        {/* ── 1. HERO SECTION (Picture 1 exact style & layout) ── */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-pill-badge">
              <span className="badge-sparkle">✨</span>
              <span>Next-Gen Academic Desk</span>
            </div>

            {/* Picture 1 Headline */}
            <h1 className="hero-serif-title">
              Browse everything.
            </h1>

            <p className="hero-subtitle">
              Empowering Students, Faculty & Admins with seamless doubt resolution, subject notes, and real-time academic analytics.
            </p>
          </div>

          {/* Read-Only Informational Showcase Card Container */}
          <div className="hero-showcase-wrapper">
            <div className="hero-accent-card-bg">
              {/* Outer device frame */}
              <div className="showcase-device-frame" style={{ padding: '0' }}>
                {/* Frame Header */}
                <div className="frame-header-bar">
                  <div className="frame-breadcrumbs">
                    <span>Platform</span>
                    <span className="crumb-sep">›</span>
                    <span className="crumb-active">DoubtDesk Academic System Overview</span>
                  </div>

                  <div className="frame-dept-dropdown">
                    <span className="dept-select-input" style={{ pointerEvents: 'none', display: 'inline-block', fontWeight: '700', color: '#3B5232' }}>
                      Official Portal
                    </span>
                  </div>
                </div>

                {/* Platform Overview Banner */}
                <div className="showcase-main-stat" style={{ padding: '2rem 2.2rem 1.5rem 2.2rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', textAlign: 'left' }}>
                    <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.8rem', fontWeight: '800', color: '#1B263B', margin: 0 }}>
                      Streamlined Doubt Resolution & Learning Environment
                    </h3>
                    <p style={{ fontSize: '0.96rem', color: '#4A5568', margin: 0, maxWidth: '780px', lineHeight: '1.6' }}>
                      DoubtDesk connects students directly with designated faculty members for fast query solutions, verified study notes access, and transparent academic collaboration.
                    </p>
                  </div>
                </div>

                {/* 4 Feature Explanation Cards Grid */}
                <div style={{ padding: '0 2.2rem 2.2rem 2.2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
                  <div style={{ background: 'rgba(250, 244, 232, 0.8)', border: '1px solid rgba(27, 38, 59, 0.1)', borderRadius: '16px', padding: '1.3rem', textAlign: 'left' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.6rem' }}>🎓</div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1B263B', margin: '0 0 0.4rem 0' }}>Student Doubt Portal</h4>
                    <p style={{ fontSize: '0.86rem', color: '#4A5568', margin: 0, lineHeight: '1.55' }}>
                      Submit subject questions with image attachments and track real-time resolution status from assigned teachers.
                    </p>
                  </div>

                  <div style={{ background: 'rgba(250, 244, 232, 0.8)', border: '1px solid rgba(27, 38, 59, 0.1)', borderRadius: '16px', padding: '1.3rem', textAlign: 'left' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.6rem' }}>👨‍🏫</div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1B263B', margin: '0 0 0.4rem 0' }}>Faculty Solution Center</h4>
                    <p style={{ fontSize: '0.86rem', color: '#4A5568', margin: 0, lineHeight: '1.55' }}>
                      Faculty receive instant notifications and upload step-by-step verified solutions and explanatory diagrams.
                    </p>
                  </div>

                  <div style={{ background: 'rgba(250, 244, 232, 0.8)', border: '1px solid rgba(27, 38, 59, 0.1)', borderRadius: '16px', padding: '1.3rem', textAlign: 'left' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.6rem' }}>📚</div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1B263B', margin: '0 0 0.4rem 0' }}>Verified Notes Repository</h4>
                    <p style={{ fontSize: '0.86rem', color: '#4A5568', margin: 0, lineHeight: '1.55' }}>
                      Access subject notes, lecture summaries, and reference materials filtered by semester and academic phase.
                    </p>
                  </div>

                  <div style={{ background: 'rgba(250, 244, 232, 0.8)', border: '1px solid rgba(27, 38, 59, 0.1)', borderRadius: '16px', padding: '1.3rem', textAlign: 'left' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.6rem' }}>💬</div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1B263B', margin: '0 0 0.4rem 0' }}>Interactive Discussion Threads</h4>
                    <p style={{ fontSize: '0.86rem', color: '#4A5568', margin: 0, lineHeight: '1.55' }}>
                      Engage in two-way discussion threads under each doubt for follow-up questions and deeper understanding.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Picture 1 Bottom Left "Trusted by:" Section */}
          <div className="trusted-by-container">
            <span className="trusted-by-label">Trusted by:</span>
            <div className="trusted-logos-list">
              <span className="trusted-logo-item">🏛️ CS & IT Faculty</span>
              <span className="trusted-logo-item">⚛️ Department of Physics</span>
              <span className="trusted-logo-item">📐 School of Engineering</span>
              <span className="trusted-logo-item">📊 Business & Data Labs</span>
            </div>
          </div>
        </section>


        {/* ── 2. DEDICATED DIRECT ROLE-BASED LOGIN PORTAL SECTION ── */}
        <section className="login-portal-section" id="login-section">
          <div className="login-section-header">
            <h2 className="serif-heading">Access Your DoubtDesk Portal</h2>
            <p className="section-subtext">
              Select your user role below to log in to your specialized dashboard (Student, Faculty, or Admin).
            </p>
          </div>

          <div className="landing-login-container">
            {isLoggedIn ? (
              <div className="login-card-main" style={{ padding: '3rem', textCenter: 'center' }}>
                <img src={logo} alt="DoubtDesk Logo" style={{ height: '70px', marginBottom: '1rem' }} />
                <h3 className="serif-heading" style={{ fontSize: '2rem' }}>Welcome Back to DoubtDesk!</h3>
                <p style={{ color: '#4A5568', fontSize: '1.05rem', marginBottom: '2rem' }}>
                  You are currently logged in as <strong>{localStorage.getItem('fullName') || localStorage.getItem('username')}</strong> ({localStorage.getItem('role')}).
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                  <Link 
                    to={localStorage.getItem('role') === 'faculty' ? '/faculty' : localStorage.getItem('role') === 'admin' ? '/admin-profile' : '/profile'}
                    className="navbar-cta-pill" 
                    style={{ padding: '0.8rem 2rem', fontSize: '1rem' }}
                  >
                    Go to Your Dashboard ↗
                  </Link>
                </div>
              </div>
            ) : (
              <div className="login-card-main">
              {/* Role Selection Tabs */}
              <div className="role-tabs-bar">
                <button 
                  className={`role-tab-btn ${selectedRole === 'student' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('student')}
                >
                  <span className="role-icon">🎓</span>
                  <span>Student Login</span>
                </button>

                <button 
                  className={`role-tab-btn ${selectedRole === 'faculty' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('faculty')}
                >
                  <span className="role-icon">👨‍🏫</span>
                  <span>Faculty Login</span>
                </button>

                <button 
                  className={`role-tab-btn ${selectedRole === 'admin' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('admin')}
                >
                  <span className="role-icon">🛡️</span>
                  <span>Admin Control</span>
                </button>
              </div>

              {/* Login Card Body */}
              <div className="login-card-body">
                <div className="login-card-left">
                  <img src={logo} alt="DoubtDesk Brand Logo" className="login-brand-illustration" />
                  <h3 className="role-welcome-title">
                    {selectedRole === 'student' ? 'Student Workspace' : selectedRole === 'faculty' ? 'Faculty Portal' : 'Administrator Suite'}
                  </h3>
                  <p className="role-welcome-desc">
                    {selectedRole === 'student' 
                      ? 'Submit doubts, download course notes, and follow faculty solutions.' 
                      : selectedRole === 'faculty' 
                      ? 'Solve student queries, upload lecture material, and track response metrics.' 
                      : 'Manage department users, batch CSV imports, and configure system rules.'}
                  </p>

                </div>

                <div className="login-card-right">
                  {isChangePasswordMode ? (
                    <form onSubmit={handleChangePasswordSubmit} className="integrated-login-form">
                      <div className="form-header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h4 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: '1.2rem', color: '#1B263B' }}>Change Password</h4>
                        <button 
                          type="button" 
                          onClick={() => { setIsChangePasswordMode(false); setChangePassError(''); }} 
                          style={{ background: 'none', border: 'none', color: '#3B5232', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
                        >
                          ← Back to Login
                        </button>
                      </div>

                      <div className="form-group">
                        <label>
                          {selectedRole === 'student' ? 'Enrollment Number' : selectedRole === 'faculty' ? 'Faculty Shortcode' : 'Admin Username'}
                        </label>
                        <input 
                          type="text" 
                          placeholder={selectedRole === 'student' ? 'e.g. 24002170514856' : selectedRole === 'faculty' ? 'e.g. JND' : 'admin'}
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Old Password</label>
                        <input 
                          type="password" 
                          placeholder="Enter old password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>New Password</label>
                        <input 
                          type="password" 
                          placeholder="Enter new password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                      </div>

                      {changePassError && (
                        <div className="login-error-alert">
                          <span className="alert-icon">⚠️</span>
                          <span>{changePassError}</span>
                        </div>
                      )}

                      {changePassSuccess && (
                        <div className="login-error-alert" style={{ background: '#C6F6D5', color: '#22543D', borderColor: '#9AE6B4' }}>
                          <span className="alert-icon">✅</span>
                          <span>{changePassSuccess}</span>
                        </div>
                      )}

                      <button type="submit" className="login-submit-btn" disabled={changePassLoading} style={{ marginTop: '0.8rem' }}>
                        <span>{changePassLoading ? 'Updating…' : 'Update Password'}</span>
                        {!changePassLoading && <span className="arrow-btn-icon">➔</span>}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleLoginSubmit} className="integrated-login-form">
                      <div className="form-group">
                        <label>
                          {selectedRole === 'student' ? 'Enrollment Number / Roll No' : selectedRole === 'faculty' ? 'Faculty Shortcode / ID' : 'Admin Username'}
                        </label>
                        <input 
                          type="text" 
                          placeholder={selectedRole === 'student' ? 'e.g. 24002170514856' : selectedRole === 'faculty' ? 'e.g. JND' : 'admin'}
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label>Password</label>
                        <input 
                          type="password" 
                          placeholder="Enter password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>

                      {error && (
                        <div className="login-error-alert">
                          <span className="alert-icon">⚠️</span>
                          <span>{error}</span>
                        </div>
                      )}

                      <div className="form-extra-row">
                        <button 
                          type="button" 
                          onClick={() => { setIsChangePasswordMode(true); setError(''); }} 
                          className="change-pass-link"
                          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontFamily: 'inherit', color: '#3B5232', fontWeight: 600, fontSize: '0.88rem' }}
                        >
                          🔒 Change / Reset Password?
                        </button>
                      </div>

                      <button type="submit" className="login-submit-btn" disabled={loading}>
                        <span>{loading ? 'Authenticating…' : `Log In as ${selectedRole.toUpperCase()}`}</span>
                        {!loading && <span className="arrow-btn-icon">➔</span>}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
            )}
          </div>
        </section>


        {/* ── 3. BENEFITS SECTION ── */}
        <section className="features-section" id="benefits">
          <div className="section-header-center">
            <span className="section-kicker">Designed for Everyone</span>
            <h2 className="serif-heading">Benefits Tailored to Academic Roles</h2>
            <p className="section-subtext">
              DoubtDesk connects students, professors, and administrators in a single unified workflow.
            </p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon-wrapper student-theme">🎓</div>
              <h3>For Students</h3>
              <ul>
                <li>⚡ Instant query posting with subject tagging & file attachments</li>
                <li>📚 Access faculty lecture notes & solution guides 24/7</li>
                <li>💬 Step-by-step resolution comments & peer rating</li>
                <li>🔔 Live notification bell when your doubt is answered</li>
              </ul>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-wrapper faculty-theme">👨‍🏫</div>
              <h3>For Faculty</h3>
              <ul>
                <li>📥 Streamlined inbox for student queries sorted by subject</li>
                <li>📤 One-click upload of subject notes & PDF resources</li>
                <li>📊 Analytics dashboard tracking response frequency & stats</li>
                <li>💬 Code block & formatted math support for clear answers</li>
              </ul>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-wrapper admin-theme">🛡️</div>
              <h3>For Administrators</h3>
              <ul>
                <li>👥 Full user management for student and faculty rosters</li>
                <li>📄 Batch onboarding via instant CSV file uploads</li>
                <li>📈 System-wide performance and engagement reporting</li>
                <li>🔐 Role-based access control with secure token auth</li>
              </ul>
            </div>
          </div>
        </section>


        {/* ── 4. SPECIFICATIONS SECTION ── */}
        <section className="specifications-section" id="specifications">
          <div className="section-header-center">
            <span className="section-kicker">Platform Specs</span>
            <h2 className="serif-heading">Built with Precision & Speed</h2>
            <p className="section-subtext">Everything you need for seamless campus learning management.</p>
          </div>

          <div className="specs-cards-container">
            <div className="spec-item-card">
              <div className="spec-icon">⚡</div>
              <h4>Real-time Synchronization</h4>
              <p>Instant notifications and live doubt status updates across desktop and mobile devices.</p>
            </div>

            <div className="spec-item-card">
              <div className="spec-icon">📂</div>
              <h4>Subject Notes Hub</h4>
              <p>Organized repository for course slides, lab manuals, and previous year question papers.</p>
            </div>

            <div className="spec-item-card">
              <div className="spec-icon">📊</div>
              <h4>Faculty Performance Metrics</h4>
              <p>Automated charts tracking doubt resolution counts and average response duration.</p>
            </div>

            <div className="spec-item-card">
              <div className="spec-icon">📄</div>
              <h4>CSV Bulk Import</h4>
              <p>Effortlessly import hundreds of student enrollment records or faculty profiles in seconds.</p>
            </div>
          </div>
        </section>


        {/* ── 5. HOW-TO SECTION ── */}
        <section className="howto-section" id="how-to">
          <div className="section-header-center">
            <span className="section-kicker">Simple 3-Step Process</span>
            <h2 className="serif-heading">How DoubtDesk Works</h2>
          </div>

          <div className="howto-steps-flex">
            <div className="howto-step-card">
              <div className="step-number-circle">01</div>
              <h4>Ask Your Doubt</h4>
              <p>Students select the subject, type the question details, and attach any code snippet or image.</p>
            </div>

            <div className="step-arrow-divider">➔</div>

            <div className="howto-step-card">
              <div className="step-number-circle">02</div>
              <h4>Faculty Resolution</h4>
              <p>Assigned faculty members receive an instant alert and post step-by-step verified solutions.</p>
            </div>

            <div className="step-arrow-divider">➔</div>

            <div className="howto-step-card">
              <div className="step-number-circle">03</div>
              <h4>Knowledge Bank Archive</h4>
              <p>Resolved doubts are archived into a searchable Q&A repository for fast exam preparation.</p>
            </div>
          </div>
        </section>


        {/* ── 6. CONTACT US SECTION ── */}
        <section id="contact" style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '2rem 1.5rem' }}>
          <div className="contact-wrapper" style={{ padding: 0 }}>
            <div className="contact-card">
              <h2>Contact Admin</h2>
              <p className="contact-message">
                =: For Any Query Meet Admin In Room No 300 Or Message At Mo. 7016651875
              </p>
            </div>
          </div>
        </section>


        {/* ── 7. FOOTER ── */}
        <footer className="landing-footer">
          <div className="footer-container">
            <div className="footer-brand-col">
              <div className="footer-logo-row">
                <img src={logo} alt="DoubtDesk Logo" className="footer-logo-img" />
                <span className="brand-text-wrapper">
                  <span className="brand-doubt">Doubt</span>
                  <span className="brand-desk">Desk</span>
                </span>
              </div>
              <p className="footer-desc">
                The smart, aesthetic academic resolution portal connecting students and faculty.
              </p>
            </div>

            <div className="footer-links-col">
              <h4>Navigation</h4>
              <ul>
                <li><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Home</button></li>
                <li><a href="#benefits">Benefits</a></li>
                <li><a href="#specifications">Specifications</a></li>
                <li><a href="#how-to">How-to</a></li>
                <li><Link to="/about">About Us</Link></li>
              </ul>
            </div>

            <div className="footer-status-col">
              <h4>System Status</h4>
              <div className="system-status-badge">
                <span className="status-dot-green"></span>
                <span>DoubtDesk Services Online</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <span>© {new Date().getFullYear()} DoubtDesk Platform. All rights reserved.</span>
          </div>
        </footer>

        {/* ── 8. OPTIONAL OVERLAY LOGIN MODAL ── */}
        {isModalOpen && (
          <div className="modal-backdrop-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-content-card" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>✕</button>

              <div className="modal-header-row">
                <img src={logo} alt="DoubtDesk" className="modal-logo" />
                <h3>Sign In to DoubtDesk</h3>
              </div>

              <div className="modal-role-selector">
                <button 
                  type="button"
                  className={`modal-role-chip ${selectedRole === 'student' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('student')}
                >
                  Student
                </button>
                <button 
                  type="button"
                  className={`modal-role-chip ${selectedRole === 'faculty' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('faculty')}
                >
                  Faculty
                </button>
                <button 
                  type="button"
                  className={`modal-role-chip ${selectedRole === 'admin' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('admin')}
                >
                  Admin
                </button>
              </div>

              <form onSubmit={handleLoginSubmit} className="modal-login-form">
                <div className="form-group">
                  <label>{selectedRole === 'student' ? 'Enrollment Number' : selectedRole === 'faculty' ? 'Faculty Shortcode' : 'Admin Username'}</label>
                  <input 
                    type="text"
                    placeholder={selectedRole === 'student' ? 'e.g. 24002170514856' : selectedRole === 'faculty' ? 'e.g. JND' : 'admin'}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Password</label>
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {error && <p className="modal-error-msg">{error}</p>}

                <button type="submit" className="login-submit-btn" disabled={loading}>
                  {loading ? 'Logging in…' : 'Enter Portal'}
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </Navbar>
  );
};

export default LandingPage;
