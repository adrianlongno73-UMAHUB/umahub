import React from 'react';

function AdminSidebar({
  activeTab = 'overview',
  onTabChange = () => {},
  pendingListingsCount = 3,
  adminName = 'Aike Adorador',
  onLogout = () => {}
}) {
  const getInitials = (name) => {
    if (!name) return 'AD';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside className="admin-sidebar">
      {/* Top Logo Container */}
      <div className="admin-sidebar-logo-card" onClick={() => onTabChange('overview')}>
        <img src="/logo.png" alt="UmaHub" className="admin-logo-img" />
      </div>

      {/* Admin User Badge */}
      <div className="admin-account-badge">
        <div className="admin-avatar-initials">
          {getInitials(adminName)}
        </div>
        <div className="admin-badge-info">
          <span className="admin-badge-tag">PLATFORM ADMIN</span>
          <span className="admin-badge-name">UmaHub Operations</span>
        </div>
      </div>

      {/* Main Navigation Menu */}
      <nav className="admin-nav-menu">
        <button
          type="button"
          className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => onTabChange('overview')}
        >
          <span>Overview</span>
        </button>

        <button
          type="button"
          className={`admin-nav-item ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => onTabChange('users')}
        >
          <span>Users</span>
        </button>

        <button
          type="button"
          className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => onTabChange('orders')}
        >
          <span>All orders</span>
        </button>

        <button
          type="button"
          className={`admin-nav-item ${activeTab === 'listings' ? 'active' : ''}`}
          onClick={() => onTabChange('listings')}
        >
          <span>Listings</span>
          {pendingListingsCount > 0 && (
            <span className="admin-nav-badge">{pendingListingsCount}</span>
          )}
        </button>

        <button
          type="button"
          className={`admin-nav-item ${activeTab === 'commission' ? 'active' : ''}`}
          onClick={() => onTabChange('commission')}
        >
          <span>Commission</span>
        </button>
      </nav>

      {/* System Status Card */}
      <div className="admin-sidebar-status-card">
        <div className="admin-status-title">System status</div>
        <div className="admin-status-desc">All marketplace services are operational.</div>
        <div className="admin-status-live">
          <span className="live-dot"></span>
          <span>Live</span>
        </div>
      </div>

      {/* Log Out Link */}
      <button type="button" className="admin-logout-btn" onClick={onLogout}>
        Log out
      </button>
    </aside>
  );
}

export default AdminSidebar;
