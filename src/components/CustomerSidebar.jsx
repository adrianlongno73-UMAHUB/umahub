import React from 'react';
import defaultProfileImg from '../image/defaultProfile.png';
import { cleanAvatarUrl } from '../services/api';
import './CustomerDashboard.css';

function CustomerSidebar({
  activeTab = 'browse', // 'overview' | 'browse' | 'orders' | 'cart'
  setActiveTab = () => {},
  customerName = 'Customer',
  avatarUrl = null,
  onLogout = () => {},
  showToast = () => {}
}) {
  return (
    <aside className="customer-sidebar">
      {/* Top Logo Card */}
      <div className="sidebar-logo-card" onClick={() => setActiveTab('overview')} title="Customer Overview">
        <img src="/logo.png" alt="UmaHub Logo" className="sidebar-umahub-logo" />
      </div>

      {/* Customer Account Badge */}
      <div
        className={`customer-account-badge ${activeTab === 'profile' ? 'active-profile' : ''}`}
        onClick={() => {
          setActiveTab('profile');
          showToast('Opening My Profile');
        }}
        title="View and edit profile"
      >
        <div className="customer-badge-avatar-box" style={{ overflow: 'hidden' }}>
          <img
            src={cleanAvatarUrl(avatarUrl) || defaultProfileImg}
            alt={customerName}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = defaultProfileImg;
            }}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
        <div className="customer-badge-info">
          <span className="customer-badge-tag">CUSTOMER ACCOUNT</span>
          <span className="customer-badge-name">{customerName}</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="customer-nav-menu">
        <button
          type="button"
          className={`customer-nav-item ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('overview');
            showToast('Opening Customer Overview');
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          <span>Overview</span>
        </button>

        <button
          type="button"
          className={`customer-nav-item ${activeTab === 'browse' ? 'active' : ''}`}
          onClick={() => setActiveTab('browse')}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Browse Products</span>
        </button>

        <button
          type="button"
          className={`customer-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('orders');
            showToast('Viewing your past and pending customer orders');
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span>My Orders</span>
        </button>

        <button
          type="button"
          className={`customer-nav-item ${activeTab === 'cart' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('cart');
            showToast('Opening My Cart');
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="nav-icon">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span>My Cart</span>
        </button>
      </nav>

      {/* Customer Support Box */}
      <div className="customer-support-card">
        <div className="support-leaf-icon">🌱</div>
        <div className="support-title">Need help?</div>
        <div className="support-sub">Our UmaHub customer support team is ready to assist.</div>
        <button
          type="button"
          className="support-link-btn"
          onClick={() => showToast('Connecting to Customer Support: help@umahub.ph')}
        >
          Contact support
        </button>
      </div>

      {/* Log Out */}
      <button type="button" className="sidebar-logout-btn" onClick={onLogout}>
        Log out
      </button>
    </aside>
  );
}

export default CustomerSidebar;
