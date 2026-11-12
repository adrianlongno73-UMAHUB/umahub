import React from 'react';

function AdminHeader({
  adminName = 'Aike Adorador',
  roleLabel = 'SUPER ADMIN'
}) {
  return (
    <header className="admin-top-header">
      <div className="admin-header-profile">
        <div className="admin-header-info">
          <span className="admin-header-role">{roleLabel}</span>
          <span className="admin-header-name">{adminName}</span>
        </div>
        <div className="admin-header-avatar">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-avatar-icon">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
