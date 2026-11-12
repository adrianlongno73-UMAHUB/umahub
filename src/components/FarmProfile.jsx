import React, { useState, useRef } from 'react';
import farmBgImg from '../image/farmbg.png';
import defaultProfileImg from '../image/defaultProfile.png';
import { farmerAPI, processImageFile, cleanAvatarUrl } from '../services/api';
import './FarmerPortal.css';

function FarmProfile({
  farmName = "My Farm",
  setFarmName,
  location = "Bunawan",
  setLocation,
  harvestDays = "Monday to Saturday",
  setHarvestDays,
  aboutFarm = "Family-run farm supplying fresh produce in Bunawan, Agusan del Sur.",
  setAboutFarm,
  avatarUrl = null,
  setAvatarUrl = () => {},
  showToast = () => {}
}) {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      showToast('Processing and uploading farm profile photo...');
      const dataUrl = await processImageFile(file);
      setAvatarUrl(dataUrl);
      await farmerAPI.updateProfile({
        farm_name: farmName,
        location,
        bio: aboutFarm,
        avatar_url: dataUrl
      });
      showToast('Farm profile photo updated successfully in database!');
    } catch (err) {
      showToast(err.message || 'Failed to update photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    farmerAPI.updateProfile({
      farm_name: farmName,
      location,
      bio: aboutFarm,
      harvestDays,
      avatar_url: avatarUrl
    })
      .then(() => showToast('Farm details successfully saved and updated to database!'))
      .catch((err) => showToast(err?.message || 'Failed to save farm details to database.'));
  };

  return (
    <div className="profile-view-content">
      {/* Scenic Farm Top Banner */}
      <div className="farm-scenic-banner">
        <img
          src={farmBgImg}
          alt="Farm Profile"
          className="farm-banner-full-img"
        />
      </div>

      {/* Farm Header Card */}
      <div className="farm-header-card">
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <img
            src={cleanAvatarUrl(avatarUrl) || defaultProfileImg}
            alt={`${farmName} Avatar`}
            referrerPolicy="no-referrer"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = defaultProfileImg;
            }}
            className="farm-header-avatar"
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #ffffff',
              boxShadow: '0 4px 14px rgba(0,0,0,0.12)'
            }}
          />

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/*"
            style={{ display: 'none' }}
          />

          <button
            type="button"
            className="btn-change-avatar"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            title="Upload or change farm profile picture"
            style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              background: '#2D5A27',
              color: '#ffffff',
              border: '2px solid #ffffff',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '14px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.25)'
            }}
          >
            {isUploading ? '⌛' : '📷'}
          </button>
        </div>

        <div className="farm-header-info">
          <h2 className="farm-header-title">{farmName}</h2>
          <span className="farm-header-location">{location} · Member since 2026</span>
          <div className="farm-header-badges-row">
            <span className="badge-verified-farm">Verified farm</span>
            <span className="badge-rating-pill">4.9 average rating</span>
          </div>
        </div>
      </div>

      {/* Two Columns: Farm details & Verification */}
      <div className="farm-profile-two-col">
        {/* Left: Farm details form */}
        <div className="dash-card farm-details-card">
          <h3 className="card-section-title">Farm details</h3>

          <form onSubmit={handleSaveChanges}>
            <div className="form-group">
              <label className="form-label" htmlFor="farmNameInput">Farm name</label>
              <input
                id="farmNameInput"
                type="text"
                className="form-input profile-form-input"
                value={farmName}
                onChange={(e) => setFarmName && setFarmName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="farmLocationInput">Location</label>
              <input
                id="farmLocationInput"
                type="text"
                className="form-input profile-form-input"
                value={location}
                onChange={(e) => setLocation && setLocation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="harvestDaysInput">Harvest days</label>
              <input
                id="harvestDaysInput"
                type="text"
                className="form-input profile-form-input"
                value={harvestDays}
                onChange={(e) => setHarvestDays && setHarvestDays(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="aboutFarmInput">About the farm</label>
              <textarea
                id="aboutFarmInput"
                className="form-textarea profile-form-textarea"
                rows="3"
                value={aboutFarm}
                onChange={(e) => setAboutFarm && setAboutFarm(e.target.value)}
              ></textarea>
            </div>

            <button type="submit" className="btn-save-farm-changes">
              Save changes
            </button>
          </form>
        </div>

        {/* Right: Verification card */}
        <div className="dash-card farm-verification-card">
          <div className="verification-card-header">
            <h3 className="card-section-title">Verification</h3>
            <span className="badge-verified-pill">Verified</span>
          </div>

          <div className="verification-checklist">
            <div className="verification-check-row">
              <span className="check-item-name">Business permit</span>
              <span className="check-item-status">Approved</span>
            </div>

            <div className="verification-check-row">
              <span className="check-item-name">Valid government ID</span>
              <span className="check-item-status">Approved</span>
            </div>

            <div className="verification-check-row">
              <span className="check-item-name">Bank details</span>
              <span className="check-item-status">Approved</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FarmProfile;
