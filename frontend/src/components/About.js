import React from 'react';
import Navbar from './Navbar';
import ProfileLayout from './ProfileLayout';
import FacultyLayout from './FacultyLayout';
import AdminLayout from './AdminLayout';
import './About.css';

const teamMembers = [
  {
    name: 'Lunagariya Hinav',
    enroll: '24002170510023',
    branch: 'AIDS',
  },
  {
    name: 'Rabadiya Prit',
    enroll: '24002170110153',
    branch: 'CE',
  },
  {
    name: 'Dhorajiya Ishan',
    enroll: '24002170510012',
    branch: 'AIDS',
  },
];

const About = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const role       = (localStorage.getItem('role') || '').toLowerCase();

  const content = (
    <div className="about-wrapper">
      <div className="about-outer-card">
        <div className="about-cards">
          {teamMembers.map((member, index) => (
            <div className="about-card" key={index}>
              <div className="about-card-accent"></div>
              <ul className="about-card-list">
                <li>
                  <span className="about-label">Name</span>
                  <span className="about-value">{member.name}</span>
                </li>
                <li>
                  <span className="about-label">Enrollment</span>
                  <span className="about-value">{member.enroll}</span>
                </li>
                <li>
                  <span className="about-label">Branch</span>
                  <span className="about-value">{member.branch}</span>
                </li>
              </ul>
            </div>
          ))}
        </div>

        {/* Horizontal info card */}
        <div className="about-info-card">
          <div className="about-info-accent"></div>
          <div className="about-info-items">
            <div className="about-info-item">
              <div className="about-info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <div className="about-info-text">
                <span className="about-info-label">Project</span>
                <span className="about-info-value">DoubtDesk</span>
              </div>
            </div>

            <div className="about-info-divider"></div>

            <div className="about-info-item">
              <div className="about-info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
              </div>
              <div className="about-info-text">
                <span className="about-info-label">Institute</span>
                <span className="about-info-value">LJIET</span>
              </div>
            </div>

            <div className="about-info-divider"></div>

            <div className="about-info-item">
              <div className="about-info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
              </div>
              <div className="about-info-text">
                <span className="about-info-label">Tech Stack</span>
                <span className="about-info-value">React · Django</span>
              </div>
            </div>

            <div className="about-info-divider"></div>

            <div className="about-info-item">
              <div className="about-info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div className="about-info-text">
                <span className="about-info-label">Year</span>
                <span className="about-info-value">2025 – 26</span>
              </div>
            </div>

            <div className="about-info-divider"></div>

            <div className="about-info-item">
              <div className="about-info-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 1-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div className="about-info-text">
                <span className="about-info-label">Team Size</span>
                <span className="about-info-value">3 Members</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );

  if (isLoggedIn) {
    const LayoutComponent = role === 'faculty' ? FacultyLayout
                          : role === 'admin'   ? AdminLayout
                          : ProfileLayout;
    return (
      <LayoutComponent>
        <main className="profile-main-content">
          {content}
        </main>
      </LayoutComponent>
    );
  }

  return <Navbar>{content}</Navbar>;
};

export default About;
