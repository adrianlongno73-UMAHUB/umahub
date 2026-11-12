import React, { useState } from 'react';
import './CustomerDashboard.css';

function CustomerLocationModal({
  currentLocation = { barangay: 'Bunawan', purok: 'Purok 1', customAddress: '' },
  onClose = () => {},
  onSelectLocation = () => {},
  showToast = () => {}
}) {
  const [selectedBarangay, setSelectedBarangay] = useState(currentLocation.barangay || 'Bunawan');
  const [selectedPurok, setSelectedPurok] = useState(currentLocation.purok || 'Purok 1');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [customAddress, setCustomAddress] = useState(currentLocation.customAddress || '');

  const barangays = [
    'Bunawan',
    'Bancasi',
    'Libertad',
    'Awa',
    'Rosario',
    'San Isidro',
    'Tibiao',
    'San Pedro',
    'Mabini',
  ];

  const puroks = ['Purok 1', 'Purok 2', 'Purok 3', 'Purok 4', 'Purok 5', 'Purok 6'];

  const filteredBarangays = barangays.filter((b) =>
    b.toLowerCase().includes(searchKeyword.toLowerCase())
  );

  const handleSave = () => {
    const finalLocation = {
      barangay: selectedBarangay,
      purok: selectedPurok,
      customAddress: customAddress.trim(),
      displayString: customAddress.trim()
        ? customAddress.trim()
        : `${selectedPurok}, Brgy. ${selectedBarangay}`,
    };
    onSelectLocation(finalLocation);
    showToast(`Delivery location updated to: ${finalLocation.displayString}`);
    onClose();
  };

  return (
    <div className="location-modal-overlay" onClick={onClose}>
      <div className="location-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="location-modal-header">
          <div className="location-modal-title-wrap">
            <h2 className="location-modal-title">Select Delivery Location</h2>
            <p className="location-modal-subtitle">
              Choose the specific purok or enter address manually...
            </p>
          </div>
          <button
            type="button"
            className="btn-location-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Search Bar */}
        <div className="location-modal-search-row">
          <span className="location-search-tag">Search</span>
          <input
            type="text"
            placeholder="Search purok or enter address manually..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            className="location-modal-search-input"
          />
        </div>

        {/* 2-Column Selection Matrix */}
        <div className="location-selection-columns">
          {/* Left Column: Barangays */}
          <div className="location-barangay-col">
            {filteredBarangays.map((bg) => (
              <button
                key={bg}
                type="button"
                className={`location-barangay-item ${selectedBarangay === bg ? 'selected' : ''}`}
                onClick={() => setSelectedBarangay(bg)}
              >
                <span className="bg-bullet-dot">●</span>
                <span className="bg-name-text">{bg}</span>
              </button>
            ))}
          </div>

          {/* Right Column: Puroks */}
          <div className="location-purok-col">
            <h4 className="location-purok-header">Purok in {selectedBarangay}</h4>
            <div className="location-purok-radio-list">
              {puroks.map((prk) => (
                <label
                  key={prk}
                  className={`purok-radio-item ${selectedPurok === prk ? 'selected' : ''}`}
                  onClick={() => setSelectedPurok(prk)}
                >
                  <div className="purok-custom-radio">
                    {selectedPurok === prk && <div className="purok-radio-dot" />}
                  </div>
                  <span className="purok-label-text">{prk}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Custom Address Input */}
        <div className="location-custom-address-row">
          <label className="custom-address-label">Or enter complete address</label>
          <div className="custom-address-input-wrap">
            <span className="custom-address-bullet">●</span>
            <input
              type="text"
              placeholder="House number, Street, Purok, Barangay"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              className="custom-address-field"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="location-modal-footer">
          <button
            type="button"
            className="btn-location-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn-location-select"
            onClick={handleSave}
          >
            Select Location
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomerLocationModal;