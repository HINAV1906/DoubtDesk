import React from 'react';
import FacultyLayout from './FacultyLayout';
import './StudentProfile.css';

const FacultyProfile = () => {
  const fullname  = localStorage.getItem('fullName')  || 'Dr. R. K. Patel';
  const shortname = (localStorage.getItem('shortname') || localStorage.getItem('username') || 'RKP').toUpperCase();
  const subject   = localStorage.getItem('subject')   || 'N/A';
  const mobile    = localStorage.getItem('mobile')    || 'N/A';

  // Extract initials: 1st letter of surname + 1st letter of faculty name
  const getInitials = (name, shortName) => {
    if (!name) return shortName ? shortName.slice(0, 2).toUpperCase() : 'FC';
    const cleanName = name.replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s+/i, '').trim();
    const parts = cleanName.split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return cleanName.slice(0, 2).toUpperCase();
  };

  return (
    <FacultyLayout>
      <main className="profile-main-content">

        <div className="single-card-grid horizontal-card-grid">
          <div className="profile-card summary-card">
            {/* Upperside adjusted horizontally */}
            <div className="profile-header-horizontal">
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar-glow"></div>
                <div className="profile-avatar">
                  {getInitials(fullname, shortname)}
                </div>
              </div>

              <div className="profile-header-text">
                <h2 className="student-name">{fullname}</h2>
                <div className="profile-header-meta">
                  <span className="student-role">Faculty Profile ({shortname})</span>
                  <span className="student-badge">Subject: {subject}</span>
                </div>
              </div>
            </div>

            <div className="profile-info-divider"></div>

            {/* Display faculty details in horizontal layout */}
            <div className="single-card-details horizontal-details">
              <div className="detail-item">
                <span className="detail-label">Full Name</span>
                <span className="detail-value">{fullname}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Short Name (Username)</span>
                <span className="detail-value">{shortname}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Subject</span>
                <span className="detail-value">{subject}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Mobile Number</span>
                <span className="detail-value">{mobile}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </FacultyLayout>
  );
};

export default FacultyProfile;
