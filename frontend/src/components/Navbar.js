import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/DoubtDesk_logo.png';
import backgroundImage from '../assets/DoubtDesk_background.png';
import { API_BASE, authHeaders, clearAuthSession } from '../api';
import NotificationBell from './NotificationBell';

const Navbar = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const role = localStorage.getItem('role');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE}/logout/`, {
        method: 'POST',
        headers: authHeaders(),
      });
    } catch {
      // ignore network errors
    }
    clearAuthSession();
    navigate('/');
  };

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: id } });
      return;
    }
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const getProfileLink = () => {
    if (role === 'faculty') return '/faculty';
    if (role === 'admin') return '/admin-profile';
    return '/profile';
  };

  return (
    <div className="app-wrapper">
      <header className="navbar-header">
        <div className="navbar-container">
          {/* Brand Logo & Name */}
          <Link to={isLoggedIn ? getProfileLink() : "/"} className="navbar-brand">
            <img src={logo} alt="DoubtDesk Logo" className="navbar-logo" />
            <div className="brand-text-wrapper">
              <span className="brand-doubt">Doubt</span>
              <span className="brand-desk">Desk</span>
            </div>
          </Link>

          {/* Navigation Links — Hides when logged in per requirement */}
          {!isLoggedIn && (
            <nav className={`navbar-menu-wrapper ${mobileMenuOpen ? 'mobile-active' : ''}`}>
              <ul className="navbar-menu">
                <li className="navbar-item">
                  <button 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      if (location.pathname !== '/') {
                        navigate('/');
                      } else {
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }} 
                    className="navbar-nav-btn"
                  >
                    Home
                  </button>
                </li>
                <li className="navbar-item">
                  <button onClick={() => scrollToSection('benefits')} className="navbar-nav-btn">
                    Benefits
                  </button>
                </li>
                <li className="navbar-item">
                  <button onClick={() => scrollToSection('specifications')} className="navbar-nav-btn">
                    Specifications
                  </button>
                </li>
                <li className="navbar-item">
                  <button onClick={() => scrollToSection('how-to')} className="navbar-nav-btn">
                    How-to
                  </button>
                </li>
                <li className="navbar-item">
                  <button onClick={() => scrollToSection('contact')} className="navbar-nav-btn">
                    Contact Us
                  </button>
                </li>
                <li className="navbar-item">
                  <Link to="/about" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
                    About Us
                  </Link>
                </li>
              </ul>
            </nav>
          )}

          {/* Right Action Controls */}
          <div className="navbar-right-actions">
            {isLoggedIn ? (
              /* When user enters profile / logged in: show ONLY NotificationBell, Profile, and Logout */
              <div className="user-controls">
                <NotificationBell />
                <Link to={getProfileLink()} className="navbar-profile-btn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  <span>Profile</span>
                </Link>
                <button onClick={handleLogout} className="navbar-logout-btn" title="Logout">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
                </button>
              </div>
            ) : (
              /* When guest: clicking Login button smoothly scrolls down to login-section */
              <div className="guest-controls">
                <button onClick={() => scrollToSection('login-section')} className="navbar-cta-pill">
                  <span>Login</span>
                  <span className="arrow-icon">↗</span>
                </button>
              </div>
            )}

            {/* Mobile Hamburger Toggle (only when not logged in) */}
            {!isLoggedIn && (
              <button 
                className="mobile-hamburger-btn" 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area with Cream Background Pattern */}
      <main className="home-container" style={{ backgroundImage: `url(${backgroundImage})` }}>
        <div className="home-overlay">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Navbar;
