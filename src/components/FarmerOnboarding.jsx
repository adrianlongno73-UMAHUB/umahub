import React, { useState } from 'react';
import { farmerAPI } from '../services/api';
import './FarmerOnboarding.css';

function FarmerOnboarding({
  currentUser = null,
  onBackToHome = () => {},
  onCompleteOnboarding = () => {},
  showToast = () => {}
}) {
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1 Form State
  const [farmName, setFarmName] = useState(() => currentUser?.farm_name || (currentUser?.name ? `${currentUser.name}'s Farm` : ''));
  const [fullName, setFullName] = useState(() => currentUser?.name || '');
  const [contactNumber, setContactNumber] = useState(() => currentUser?.phone || "+63 9XX XXX XXXX");
  const [mainProduce, setMainProduce] = useState("Vegetables");
  const [aboutFarm, setAboutFarm] = useState(() => currentUser?.bio || "Fresh and organic vegetables, grown locally.");

  // Step 2 Form State
  const [province, setProvince] = useState("Agusan del Sur");
  const [municipality, setMunicipality] = useState("Bunawan");
  const [barangay, setBarangay] = useState("San Teodoro");
  const [completeAddress, setCompleteAddress] = useState(() => currentUser?.location || "Purok 4, Bunawan Brook");
  const [pinLocation, setPinLocation] = useState({ lat: 8.1724, lng: 125.9961, placed: true });

  // Step 3 Form State
  const [idFile, setIdFile] = useState(null);
  const [farmPhotoFile, setFarmPhotoFile] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Navigation handlers
  const handleNext = (e) => {
    e.preventDefault();
    if (currentStep === 1) {
      if (!farmName.trim() || !fullName.trim() || !contactNumber.trim()) {
        showToast('Please fill in all required fields.');
        return;
      }
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (currentStep === 2) {
      if (!barangay.trim() || !completeAddress.trim()) {
        showToast('Please enter your farm’s barangay and complete address.');
        return;
      }
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onBackToHome();
    }
  };

  const handleSubmitReview = (e) => {
    e.preventDefault();
    const resolvedFarmName = farmName.trim() || (currentUser?.name ? `${currentUser.name}'s Farm` : 'My Farm');
    const locPart = `${barangay.trim() || 'San Teodoro'}, ${municipality}, ${province}`;
    const fullLoc = completeAddress.trim() ? `${completeAddress.trim()}, ${locPart}` : locPart;

    farmerAPI.updateProfile({
      farm_name: resolvedFarmName,
      location: fullLoc,
      crops_specialty: mainProduce,
      bio: aboutFarm,
      phone: contactNumber
    }).catch(() => {});

    const storageKey = `umahub_farmer_onboarded_${currentUser?.id || currentUser?.email || 'default'}`;
    localStorage.setItem(storageKey, 'true');
    setIsSubmitted(true);
    showToast(`Farm verification submitted for ${resolvedFarmName}!`);
  };

  const handleDropPin = () => {
    setPinLocation((prev) => ({ ...prev, placed: true }));
    showToast(`📍 Farm pin placed in ${municipality}, ${province}!`);
  };

  if (isSubmitted) {
    return (
      <div className="onboarding-page-wrapper">
        <header className="onboarding-top-nav">
          <div className="onboarding-nav-container">
            <div className="nav-logo-group" onClick={onCompleteOnboarding || onBackToHome} style={{ cursor: 'pointer' }}>
              <img src="/logo.png" alt="UmaHub" className="onboarding-logo" />
            </div>
            <span className="onboarding-step-counter">Submitted</span>
          </div>
        </header>

        <div className="onboarding-card-wrapper">
          <div className="onboarding-card success-card">
            <div className="success-badge-circle">✓</div>
            <h1 className="onboarding-main-title">Farm Submitted for Verification!</h1>
            <p className="onboarding-sub-desc">
              Thank you, <strong>{fullName}</strong>. Your farm <strong>{farmName}</strong> in <strong>{municipality}, {province}</strong> has been submitted.
            </p>
            <div className="review-notice-box" style={{ marginTop: '20px', marginBottom: '24px' }}>
              <p>Review usually takes 1–2 business days. We’ll notify you once your farm is approved.</p>
            </div>
            <div className="onboarding-buttons-row">
              <button
                type="button"
                className="onboarding-back-btn"
                onClick={onBackToHome}
              >
                Back to Home
              </button>
              <button
                type="button"
                className="onboarding-primary-btn"
                onClick={onCompleteOnboarding || onBackToHome}
              >
                Go to Dashboard →
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-page-wrapper">
      {/* Top Header Bar */}
      <header className="onboarding-top-nav">
        <div className="onboarding-nav-container">
          <div className="nav-logo-group" onClick={onBackToHome}>
            <img src="/logo.png" alt="UmaHub" className="onboarding-logo" />
          </div>
          <span className="onboarding-step-counter">Step {currentStep} of 3</span>
        </div>
      </header>

      {/* Main Form Card */}
      <div className="onboarding-card-wrapper">
        <div className="onboarding-card">
          {/* Step 1: Tell us about your farm */}
          {currentStep === 1 && (
            <form onSubmit={handleNext}>
              <h1 className="onboarding-main-title">Tell us about your farm</h1>
              <p className="onboarding-sub-desc">This helps buyers know who grows their produce.</p>

              {/* Progress Bar (Step 1 active) */}
              <div className="progress-segments-bar">
                <div className="progress-segment active"></div>
                <div className="progress-segment"></div>
                <div className="progress-segment"></div>
              </div>

              {/* Form Fields */}
              <div className="form-group">
                <label className="form-label" htmlFor="farmName">Farm name *</label>
                <input
                  id="farmName"
                  type="text"
                  className="form-input form-input-short"
                  value={farmName}
                  onChange={(e) => setFarmName(e.target.value)}
                  placeholder="e.g. Green Valley Farm"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="farmerFullName">Full name *</label>
                <input
                  id="farmerFullName"
                  type="text"
                  className="form-input form-input-medium"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Benjamin Dela Cruz"
                  required
                />
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label" htmlFor="contactNumber">Contact number *</label>
                  <input
                    id="contactNumber"
                    type="text"
                    className="form-input"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+63 9XX XXX XXXX"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="mainProduce">Main produce *</label>
                  <select
                    id="mainProduce"
                    className="form-select"
                    value={mainProduce}
                    onChange={(e) => setMainProduce(e.target.value)}
                    required
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Rice & Grains">Rice & Grains</option>
                    <option value="Herbs & Spices">Herbs & Spices</option>
                    <option value="Root Crops">Root Crops</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="aboutFarm">About your farm</label>
                <textarea
                  id="aboutFarm"
                  className="form-textarea"
                  rows="3"
                  value={aboutFarm}
                  onChange={(e) => setAboutFarm(e.target.value)}
                  placeholder="Fresh and organic vegetables, grown locally."
                ></textarea>
              </div>

              <div className="onboarding-buttons-row">
                <button type="button" className="onboarding-back-btn" onClick={handleBack}>
                  Back
                </button>
                <button type="submit" className="onboarding-primary-btn">
                  Continue
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Where is your farm? */}
          {currentStep === 2 && (
            <form onSubmit={handleNext}>
              <h1 className="onboarding-main-title">Where is your farm?</h1>
              <p className="onboarding-sub-desc">Buyers nearby will see your location on the map.</p>

              {/* Progress Bar (Step 2 active) */}
              <div className="progress-segments-bar">
                <div className="progress-segment active"></div>
                <div className="progress-segment active"></div>
                <div className="progress-segment"></div>
              </div>

              <div className="form-row-2col">
                <div className="form-group">
                  <label className="form-label" htmlFor="province">Province *</label>
                  <select
                    id="province"
                    className="form-select"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    required
                  >
                    <option value="Agusan del Sur">Agusan del Sur</option>
                    <option value="Agusan del Norte">Agusan del Norte</option>
                    <option value="Surigao del Sur">Surigao del Sur</option>
                    <option value="Surigao del Norte">Surigao del Norte</option>
                    <option value="Davao de Oro">Davao de Oro</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="municipality">Municipality *</label>
                  <select
                    id="municipality"
                    className="form-select"
                    value={municipality}
                    onChange={(e) => setMunicipality(e.target.value)}
                    required
                  >
                    <option value="Bunawan">Bunawan</option>
                    <option value="San Francisco">San Francisco</option>
                    <option value="Prosperidad">Prosperidad</option>
                    <option value="Trento">Trento</option>
                    <option value="Rosario">Rosario</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="barangay">Barangay *</label>
                <input
                  id="barangay"
                  type="text"
                  className="form-input form-input-medium"
                  value={barangay}
                  onChange={(e) => setBarangay(e.target.value)}
                  placeholder="e.g. San Teodoro"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="completeAddress">Complete address *</label>
                <input
                  id="completeAddress"
                  type="text"
                  className="form-input form-input-medium"
                  value={completeAddress}
                  onChange={(e) => setCompleteAddress(e.target.value)}
                  placeholder="e.g. Purok 4, Bunawan Brook"
                  required
                />
              </div>

              {/* Map Pin Area */}
              <div className="map-picker-box" onClick={handleDropPin}>
                <div className="map-pin-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="#2D5A27" className="map-pin-svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                <div className="map-picker-title">Drop a pin on your farm</div>
                <div className="map-picker-sub">You can drag the pin to adjust</div>
                {pinLocation.placed && (
                  <div className="pin-coordinates-badge">
                    📍 Lat: {pinLocation.lat}, Lng: {pinLocation.lng} (Bunawan ADS)
                  </div>
                )}
              </div>

              <div className="onboarding-buttons-row">
                <button type="button" className="onboarding-back-btn" onClick={handleBack}>
                  Back
                </button>
                <button type="submit" className="onboarding-primary-btn">
                  Continue
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Verify your farm */}
          {currentStep === 3 && (
            <form onSubmit={handleSubmitReview}>
              <h1 className="onboarding-main-title">Verify your farm</h1>
              <p className="onboarding-sub-desc">Verified farms get a badge and rank higher in search.</p>

              {/* Progress Bar (All 3 segments active) */}
              <div className="progress-segments-bar">
                <div className="progress-segment active"></div>
                <div className="progress-segment active"></div>
                <div className="progress-segment active"></div>
              </div>

              {/* Upload 1: Valid government ID */}
              <div className="upload-dashed-card">
                <input
                  type="file"
                  id="validIdInput"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden-file-input"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setIdFile(e.target.files[0].name);
                      showToast(`Selected ID: ${e.target.files[0].name}`);
                    }
                  }}
                />
                <label htmlFor="validIdInput" className="upload-card-label">
                  <div className="upload-title">Valid government ID</div>
                  <div className="upload-subtitle">
                    {idFile ? `✓ File: ${idFile}` : 'JPG, PNG or PDF (Max 5MB)'}
                  </div>
                </label>
              </div>

              {/* Upload 2: Farm photo */}
              <div className="upload-dashed-card">
                <input
                  type="file"
                  id="farmPhotoInput"
                  accept=".jpg,.jpeg,.png"
                  className="hidden-file-input"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setFarmPhotoFile(e.target.files[0].name);
                      showToast(`Selected Farm Photo: ${e.target.files[0].name}`);
                    }
                  }}
                />
                <label htmlFor="farmPhotoInput" className="upload-card-label">
                  <div className="upload-title">Farm photo</div>
                  <div className="upload-subtitle">
                    {farmPhotoFile ? `✓ File: ${farmPhotoFile}` : 'Show your farm or produce (JPG, PNG)'}
                  </div>
                </label>
              </div>

              {/* Review usually takes 1-2 business days */}
              <div className="review-notice-box">
                <p>Review usually takes 1–2 business days. We’ll notify you once your farm is approved.</p>
              </div>

              <div className="onboarding-buttons-row">
                <button type="button" className="onboarding-back-btn" onClick={handleBack}>
                  Back
                </button>
                <button type="submit" className="onboarding-primary-btn">
                  Submit for review
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default FarmerOnboarding;
