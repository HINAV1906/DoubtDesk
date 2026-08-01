import React from 'react';
import AdminLayout from './AdminLayout';
import FacultyDoubtStats from './FacultyDoubtStats';
import './AdminProfile.css';

const AdminProfile = () => {
  const adminName = localStorage.getItem('username') || 'admin';

  const getInitials = (name) => {
    if (!name) return 'AD';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <AdminLayout>
      <main className="admin-profile-main">

        {/* ── Top: Profile Card ── */}
        <div className="admin-profile-card">
          {/* Decorative glow orb */}
          <div className="admin-card-orb" />

          <div className="admin-avatar-wrap">
            <div className="admin-avatar-glow" />
            <div className="admin-avatar">{getInitials(adminName)}</div>
          </div>

          <div className="admin-card-info">
            <div className="admin-name-row">
              <h2 className="admin-name">{adminName}</h2>
              <span className="admin-status-dot" title="Active" />
            </div>
            <p className="admin-role-text">System Administrator · DoubtDesk</p>

            <div className="admin-meta-grid">
              <div className="admin-meta-item">
                <span className="admin-meta-label">Username</span>
                <span className="admin-meta-value">{adminName}</span>
              </div>
              <div className="admin-meta-item">
                <span className="admin-meta-label">Access Level</span>
                <span className="admin-meta-value">System Administrator</span>
              </div>
              <div className="admin-meta-item">
                <span className="admin-meta-label">Control Scope</span>
                <span className="admin-meta-value">Full System Access</span>
              </div>
              <div className="admin-meta-item">
                <span className="admin-meta-label">Account Status</span>
                <span className="admin-meta-value admin-active-badge">● Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom: Faculty Doubt Report ── */}
        <FacultyDoubtStats />

      </main>
    </AdminLayout>
  );
};

export default AdminProfile;
