import React, { useState } from 'react';
import { formatRelativeTime } from '../services/api';
import './FarmerPortal.css';

function FarmerAddProduct({
  onPublishProduct = () => {},
  setActiveTab = () => {},
  showToast = () => {}
}) {
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductUnit, setNewProductUnit] = useState('per kilogram');
  const [newProductQty, setNewProductQty] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');
  const [newProductPhoto, setNewProductPhoto] = useState(null);
  const [photoError, setPhotoError] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handlePhotoFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Palihug pag-pili og valid image file (JPG, PNG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image is too large. Palihug pag-upload og picture ubos sa 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setNewProductPhoto(ev.target?.result);
      setPhotoError(false);
      showToast(`Photo loaded: ${file.name}`);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handlePhotoFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // 1. Mandatory Product Photo Validation
    if (!newProductPhoto) {
      setPhotoError(true);
      showToast('Kinahanglan naay picture ang produkto una ma-publish. Palihug pag-upload og picture.');
      const photoCard = document.getElementById('productPhotoSection');
      if (photoCard) {
        photoCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (!newProductName.trim() || !newProductPrice) {
      showToast('Please provide at least product name and price.');
      return;
    }

    const nowIso = new Date().toISOString();
    const newItem = {
      id: Date.now(),
      name: newProductName,
      updated: formatRelativeTime(nowIso),
      updated_at: nowIso,
      created_at: nowIso,
      category: newProductCategory || 'Vegetables',
      rawPrice: parseFloat(newProductPrice || 0),
      price: `₱${parseFloat(newProductPrice || 0).toFixed(2)} / ${newProductUnit.replace('per ', '')}`,
      rawStock: parseInt(newProductQty || 10, 10),
      stock: `${newProductQty || 10} ${newProductUnit.replace('per ', '')}`,
      unit: newProductUnit.replace('per ', '').trim() || 'kg',
      status: 'In stock',
      desc: newProductDesc,
      img: newProductPhoto,
    };

    onPublishProduct(newItem);
    showToast(`Successfully published "${newProductName}" to marketplace!`);

    // Reset
    setNewProductName('');
    setNewProductPrice('');
    setNewProductQty('');
    setNewProductDesc('');
    setNewProductPhoto(null);
    setPhotoError(false);
    setActiveTab('inventory');
  };

  const handleSaveDraft = () => {
    showToast(`Saved draft for "${newProductName || 'Untitled Product'}".`);
    setActiveTab('inventory');
  };

  return (
    <div className="add-product-view-content">
      <button
        type="button"
        className="back-to-inventory-link"
        onClick={() => setActiveTab('inventory')}
      >
        ← Back to inventory
      </button>

      <div className="add-product-header">
        <span className="section-super-tag">NEW LISTING</span>
        <h1 className="add-product-title">Add a product</h1>
        <p className="add-product-sub">share what’s fresh from your farm today.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="add-product-two-col">
          {/* Left Card: Product Photo */}
          <div className="dash-card product-photo-card" id="productPhotoSection">
            <h3 className="card-subheading">
              Product photo <span className="required-field-star">*</span>
            </h3>
            <span className="photo-helper-text">Use a clear photo in natural light (Required)</span>

            <label
              className={`photo-dropzone-box ${photoError ? 'has-error' : ''} ${isDragging ? 'drag-over' : ''}`}
              htmlFor="productPhotoUpload"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="productPhotoUpload"
                accept="image/*"
                className="hidden-file-input"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    handlePhotoFile(e.target.files[0]);
                  }
                }}
              />
              {newProductPhoto ? (
                <div className="photo-preview-wrap">
                  <img src={newProductPhoto} alt="Product Preview" className="uploaded-photo-preview" />
                  <div className="photo-preview-actions">
                    <span className="change-photo-text">Click to change photo</span>
                    <button
                      type="button"
                      className="remove-photo-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setNewProductPhoto(null);
                        setPhotoError(true);
                      }}
                    >
                      ✕ Remove
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="dropzone-arrow-icon">⭱</div>
                  <div className="dropzone-title">Drop your photo here</div>
                  <div className="dropzone-sub">or click to browse JPG or PNG up to 5MB</div>
                  <div className="dropzone-req-tag">Photo is required</div>
                </>
              )}
            </label>

            {photoError && (
              <div className="photo-error-message" role="alert">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>Kinahanglan naay picture ang produkto una i-publish.</span>
              </div>
            )}
          </div>

          {/* Right Card: Product details */}
          <div className="dash-card product-details-card">
            <h3 className="card-subheading">Product details</h3>

            <div className="form-group">
              <label className="form-label" htmlFor="prodName">Product name</label>
              <input
                id="prodName"
                type="text"
                className="form-input"
                placeholder="e.g. Fresh Tomatoes"
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
                required
              />
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label" htmlFor="prodCategory">Category</label>
                <select
                  id="prodCategory"
                  className="form-select"
                  value={newProductCategory}
                  onChange={(e) => setNewProductCategory(e.target.value)}
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Root crops">Root crops</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Rice & Grains">Rice & Grains</option>
                  <option value="Herbs & Spices">Herbs & Spices</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prodPrice">Price</label>
                <input
                  id="prodPrice"
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="₱ 0.00"
                  value={newProductPrice}
                  onChange={(e) => setNewProductPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label" htmlFor="prodUnit">Unit</label>
                <select
                  id="prodUnit"
                  className="form-select"
                  value={newProductUnit}
                  onChange={(e) => setNewProductUnit(e.target.value)}
                >
                  <option value="per kilogram">per kilogram</option>
                  <option value="per head">per head</option>
                  <option value="per piece">per piece</option>
                  <option value="per bundle">per bundle</option>
                  <option value="per sack">per sack</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="prodQty">Available quantity</label>
                <input
                  id="prodQty"
                  type="number"
                  className="form-input"
                  placeholder="0"
                  value={newProductQty}
                  onChange={(e) => setNewProductQty(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="prodDesc">Description</label>
              <textarea
                id="prodDesc"
                className="form-textarea"
                rows="4"
                placeholder="Tell customers about your produce, how it was grown, and when it was harvested..."
                value={newProductDesc}
                onChange={(e) => setNewProductDesc(e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="add-product-actions-row">
          <button
            type="button"
            className="btn-save-draft"
            onClick={handleSaveDraft}
          >
            Save as draft
          </button>
          <button type="submit" className="btn-publish-product">
            Publish product
          </button>
        </div>
      </form>
    </div>
  );
}

export default FarmerAddProduct;
