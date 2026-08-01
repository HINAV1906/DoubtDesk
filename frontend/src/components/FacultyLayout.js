import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import './StudentProfile.css';

const FacultyLayout = ({ children }) => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const location = useLocation();

  return (
    <Navbar>
      <div className="profile-page-container">
        {/* Sidebar */}
        <aside className={`profile-sidebar ${isSidebarVisible ? 'visible' : 'hidden'}`}>
          <div className="sidebar-header">
            <h3>Navigation</h3>
            <button
              className="sidebar-toggle-btn"
              onClick={() => setIsSidebarVisible(!isSidebarVisible)}
              title="Hide Sidebar"
            >
              ◀
            </button>
          </div>
          <nav className="sidebar-nav">
            <Link
              to="/faculty"
              className={`sidebar-link${location.pathname === '/faculty' ? ' active' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sidebar-icon"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>Profile</span>
            </Link>
            <Link
              to="/upload-notes"
              className={`sidebar-link${location.pathname === '/upload-notes' ? ' active' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sidebar-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              <span>Upload Notes</span>
            </Link>
            <Link
              to="/solve-doubt"
              className={`sidebar-link${location.pathname === '/solve-doubt' ? ' active' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sidebar-icon"><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/><circle cx="12" cy="12" r="10"/></svg>
              <span>Solve Doubt</span>
            </Link>
            <Link
              to="/change-password"
              className={`sidebar-link${location.pathname === '/change-password' ? ' active' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sidebar-icon"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <span>Change Pass</span>
            </Link>
            <Link
              to="/contact"
              className={`sidebar-link${location.pathname === '/contact' ? ' active' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sidebar-icon"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>Contact Us</span>
            </Link>
            <Link
              to="/about"
              className={`sidebar-link${location.pathname === '/about' ? ' active' : ''}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sidebar-icon"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              <span>About Us</span>
            </Link>
          </nav>
        </aside>

        {/* Show open button when sidebar is collapsed */}
        {!isSidebarVisible && (
          <button
            className="sidebar-open-btn"
            onClick={() => setIsSidebarVisible(true)}
            title="Show Sidebar"
          >
            ▶
          </button>
        )}

        {children}
      </div>
    </Navbar>
  );
};

export default FacultyLayout;
