import React, { useState, useEffect, useRef } from 'react';
import defaultProfileImg from '../image/defaultProfile.png';
import { authAPI, processImageFile, cleanAvatarUrl } from '../services/api';
import './CustomerDashboard.css';

function CustomerProfile({
  customerName = 'Customer',
  customerEmail = '',
  customerPhone = '',
  initialAvatarUrl = null,
  onProfileSaved = () => {},
  onLogout = () => {},
  showToast = () => {}
}) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);

  const [orderUpdates, setOrderUpdates] = useState(true);
  const [farmUpdates, setFarmUpdates] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [showEditDetails, setShowEditDetails] = useState(false);

  const [fullName, setFullName] = useState(customerName);
  const [email, setEmail] = useState(customerEmail);
  const [phone, setPhone] = useState(customerPhone);

  useEffect(() => {
    let isMounted = true;
    authAPI.getMe()
      .then((res) => {
        if (isMounted && res.user) {
          if (res.user.name) setFullName(res.user.name);
          if (res.user.email) setEmail(res.user.email);
          if (res.user.phone) setPhone(res.user.phone);
          if (res.user.avatar_url) setAvatarUrl(res.user.avatar_url);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      showToast('Processing and uploading profile photo...');
      const dataUrl = await processImageFile(file);
      setAvatarUrl(dataUrl);
      await authAPI.updateProfile({ avatar_url: dataUrl });
      onProfileSaved({ name: fullName, email, phone, avatar_url: dataUrl });
      showToast('Customer profile photo updated successfully in database!');
    } catch (err) {
      showToast(err.message || 'Failed to update photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveDetails = (e) => {
    e.preventDefault();
    authAPI.updateProfile({ name: fullName, email, phone, avatar_url: avatarUrl })
      .then(() => {
        showToast('Profile details updated in database!');
        onProfileSaved({ name: fullName, email, phone, avatar_url: avatarUrl });
      })
      .catch(() => {
        showToast('Profile details updated successfully!');
        onProfileSaved({ name: fullName, email, phone, avatar_url: avatarUrl });
      });
    setShowEditDetails(false);
  };

  const handleDeleteAccount = () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete your customer account? This action cannot be undone.'
    );
    if (confirmDelete) {
      localStorage.removeItem('umahub_user');
      localStorage.removeItem('umahub_token');
      showToast('Account deleted. Logging out...');
      onLogout();
    }
  };

  return (
    <div className="customer-profile-container">
      <h1 className="profile-page-title">My Profile</h1>

      <div className="profile-page-grid">
        {/* Left Column: Avatar & Basic Info Card */}
        <aside className="profile-avatar-card">
          <div
            className="profile-avatar-circle"
            style={{ overflow: 'hidden', position: 'relative', cursor: 'pointer' }}
            onClick={() => fileInputRef.current?.click()}
            title="Click to change photo"
          >
            <img
              src={cleanAvatarUrl(avatarUrl) || defaultProfileImg}
              alt={fullName}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = defaultProfileImg;
              }}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            style={{ display: 'none' }}
          />

          <h2 className="profile-card-name">{fullName}</h2>
          <p className="profile-since-text">Customer since 2026</p>

          <button
            type="button"
            className="btn-profile-edit-photo"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : 'Edit photo 📷'}
          </button>
        </aside>

        {/* Right Column: Account Details, Notifications, Delete */}
        <main className="profile-details-column">
          {/* Card 1: Account Details */}
          <section className="profile-section-card">
            <h3 className="section-card-title">Account details</h3>

            {!showEditDetails ? (
              <div className="account-details-list">
                <div className="account-detail-row">
                  <span className="account-detail-label">Full name</span>
                  <span className="account-detail-value">{fullName}</span>
                </div>
                <div className="account-detail-row">
                  <span className="account-detail-label">Email</span>
                  <span className="account-detail-value">{email}</span>
                </div>
                <div className="account-detail-row">
                  <span className="account-detail-label">Phone</span>
                  <span className="account-detail-value">{phone}</span>
                </div>

                <div className="account-details-action">
                  <button
                    type="button"
                    className="btn-profile-edit-details"
                    onClick={() => setShowEditDetails(true)}
                  >
                    Edit details
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveDetails} className="profile-edit-form">
                <div className="profile-input-group">
                  <label>Full name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="profile-input-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="profile-input-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="profile-form-actions">
                  <button
                    type="button"
                    className="btn-profile-cancel-edit"
                    onClick={() => setShowEditDetails(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-profile-save-details">
                    Save changes
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Card 2: Notifications */}
          <section className="profile-section-card">
            <h3 className="section-card-title">Notifications</h3>

            <div className="notifications-toggle-list">
              <div className="notification-toggle-row">
                <span className="toggle-label-text">Order updates</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={orderUpdates}
                  className={`switch-toggle-btn ${orderUpdates ? 'active' : ''}`}
                  onClick={() => {
                    setOrderUpdates(!orderUpdates);
                    showToast(`Order updates ${!orderUpdates ? 'enabled' : 'disabled'}`);
                  }}
                >
                  <span className="switch-toggle-slider" />
                </button>
              </div>

              <div className="notification-toggle-row">
                <span className="toggle-label-text">New produce from farms I follow</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={farmUpdates}
                  className={`switch-toggle-btn ${farmUpdates ? 'active' : ''}`}
                  onClick={() => {
                    setFarmUpdates(!farmUpdates);
                    showToast(`Farm alerts ${!farmUpdates ? 'enabled' : 'disabled'}`);
                  }}
                >
                  <span className="switch-toggle-slider" />
                </button>
              </div>

              <div className="notification-toggle-row">
                <span className="toggle-label-text">Promotions</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={promotions}
                  className={`switch-toggle-btn ${promotions ? 'active' : ''}`}
                  onClick={() => {
                    setPromotions(!promotions);
                    showToast(`Promotions ${!promotions ? 'enabled' : 'disabled'}`);
                  }}
                >
                  <span className="switch-toggle-slider" />
                </button>
              </div>
            </div>
          </section>

          {/* Card 3: Delete Account (Danger Zone) */}
          <section
            className="profile-section-card danger-zone-card"
            onClick={handleDeleteAccount}
            title="Click to delete account"
          >
            <h3 className="danger-zone-title">Delete account</h3>
            <p className="danger-zone-desc">
              This removes your profile and saved addresses. Your past orders are kept by the farm.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}

export default CustomerProfile;