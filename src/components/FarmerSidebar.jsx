import React from 'react';
import defaultProfileImg from '../image/defaultProfile.png';
import { cleanAvatarUrl } from '../services/api';
import './FarmerPortal.css';

function FarmerSidebar({
  activeTab = 'dashboard',
  setActiveTab = () => {},
  farmName = "My Farm",
  avatarUrl = null,
  ordersCount = 0,
  onNavigateOnboarding = null,
  onLogout = () => {},
  showToast = () => {}
}) {
  return (
    <aside className="farmer-sidebar">
      {/* Top Logo Card */}
      <div className="sidebar-logo-card" onClick={() => setActiveTab('dashboard')} title="Farmer Overview">
        <img src="/logo.png" alt="UmaHub Logo" className="sidebar-umahub-logo" />
      </div>

      {/* Farmer Account Badge */}
      <div className="farmer-account-badge" onClick={() => setActiveTab('profile')} title="View Farm Profile">
        <img
          src={cleanAvatarUrl(avatarUrl) || defaultProfileImg}
          alt={farmName}
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = defaultProfileImg;
          }}
          className="farmer-badge-avatar"
          style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }}
        />
        <div className="farmer-badge-info">
          <span className="farmer-badge-tag">FARMER ACCOUNT</span>
          <span className="farmer-badge-name">{farmName}</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="sidebar-nav-menu">
        <button
          type="button"
          className={`sidebar-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Overview</span>
        </button>

        <button
          type="button"
          className={`sidebar-nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>Farm Profile</span>
        </button>

        <button
          type="button"
          className={`sidebar-nav-item ${activeTab === 'farmer-onboarding' ? 'active' : ''}`}
          onClick={() => {
            if (typeof onNavigateOnboarding === 'function') {
              onNavigateOnboarding();
            } else {
              setActiveTab('farmer-onboarding');
            }
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
          <span>Farm Verification</span>
        </button>

        <button
          type="button"
          className={`sidebar-nav-item ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
          <span>Inventory</span>
        </button>

        <button
          type="button"
          className={`sidebar-nav-item ${activeTab === 'add-product' ? 'active' : ''}`}
          onClick={() => setActiveTab('add-product')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Add product</span>
        </button>

        <button
          type="button"
          className={`sidebar-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span>Orders</span>
          {ordersCount > 0 && <span className="orders-badge-count">{ordersCount}</span>}
        </button>

        <button
          type="button"
          className={`sidebar-nav-item ${activeTab === 'earnings' ? 'active' : ''}`}
          onClick={() => setActiveTab('earnings')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <line x1="2" y1="10" x2="22" y2="10" />
          </svg>
          <span>Earnings</span>
        </button>
      </nav>

      {/* Support Box */}
      <div className="sidebar-support-card">
        <div className="support-leaf-icon">🌱</div>
        <div className="support-title">Need a hand?</div>
        <div className="support-sub">Our farmer support team is here for you.</div>
        <button
          type="button"
          className="support-link-btn"
          onClick={() => showToast('Contacting Farmer Support: support@umahub.ph')}
        >
          Get support
        </button>
      </div>

      {/* Log Out */}
      <button type="button" className="sidebar-logout-btn" onClick={onLogout} title="Log out">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px', flexShrink: 0 }}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        <span>Log out</span>
      </button>
    </aside>
  );
}

export default FarmerSidebar;
