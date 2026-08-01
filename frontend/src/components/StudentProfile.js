import React from 'react';
import ProfileLayout from './ProfileLayout';
import './StudentProfile.css';

const StudentProfile = () => {
  const name   = localStorage.getItem('fullName') || localStorage.getItem('username') || 'Student';
  const enroll = localStorage.getItem('enroll')   || localStorage.getItem('username') || 'N/A';
  const rollno = localStorage.getItem('rollno')   || 'N/A';
  const branch = localStorage.getItem('branch')   || 'N/A';
  const div    = localStorage.getItem('div')      || 'N/A';

  // Helper to extract 1st letter of surname and 1st letter of student name (e.g. "Lunagariya Hinav" -> "LH")
  const getInitials = (fullName) => {
    if (!fullName) return 'ST';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  return (
    <ProfileLayout>
      <main className="profile-main-content">
        <div className="single-card-grid horizontal-card-grid">
          <div className="profile-card summary-card">
            {/* Upperside adjusted horizontally */}
            <div className="profile-header-horizontal">
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar-glow"></div>
                <div className="profile-avatar">
                  {getInitials(name)}
                </div>
              </div>

              <div className="profile-header-text">
                <h2 className="student-name">{name}</h2>
                <div className="profile-header-meta">
                  <span className="student-role">Student Profile</span>
                  <span className="student-badge">Enrollment: {enroll}</span>
                </div>
              </div>
            </div>

            <div className="profile-info-divider"></div>

            {/* Display student details in horizontal layout with Division & Roll Number shifted */}
            <div className="single-card-details horizontal-details">
              <div className="detail-item">
                <span className="detail-label">Enrollment Number</span>
                <span className="detail-value">{enroll}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Division</span>
                <span className="detail-value">{div}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Roll Number</span>
                <span className="detail-value">{rollno}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Branch</span>
                <span className="detail-value">{branch}</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </ProfileLayout>
  );
};

export default StudentProfile;
