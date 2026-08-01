import React from 'react';
import Navbar from './Navbar';
import ProfileLayout from './ProfileLayout';
import FacultyLayout from './FacultyLayout';
import AdminLayout from './AdminLayout';
import './Contact.css';

const Contact = () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const role       = (localStorage.getItem('role') || '').toLowerCase();

  const content = (
    <div className="contact-wrapper">
      <div className="contact-card">
        <h2>Contact Admin</h2>
        <p className="contact-message">
          =: For Any Query Meet Admin In Room No 300 Or Message At Mo. 7016651875
        </p>
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

export default Contact;
