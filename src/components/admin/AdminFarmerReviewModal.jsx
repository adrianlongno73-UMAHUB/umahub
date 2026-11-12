import React, { useState } from 'react';
import { adminAPI } from '../../services/api';

function AdminFarmerReviewModal({
  farmer,
  isOpen,
  onClose,
  onSuccess,
  showToast
}) {
  const [checklist, setChecklist] = useState({
    identity: false,
    location: false,
    products: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null); // null | { title, filename, type }

  if (!isOpen || !farmer) return null;

  const isChecklistComplete = checklist.identity && checklist.location && checklist.products;

  const handleCheckboxChange = (key) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleApprove = async () => {
    if (!isChecklistComplete) {
      showToast('Please complete all 3 verification checklist items first.');
      return;
    }

    try {
      setSubmitting(true);
      await adminAPI.reviewFarmerApplication(farmer.id, true);
      showToast(`Approved & verified "${farmer.farm_name || farmer.name}"!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      showToast('Failed to approve farmer application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    try {
      setSubmitting(true);
      await adminAPI.reviewFarmerApplication(farmer.id, false);
      showToast(`Rejected application for "${farmer.farm_name || farmer.name}".`);
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      showToast('Failed to decline application.');
    } finally {
      setSubmitting(false);
    }
  };

  const farmName = farmer.farm_name || farmer.name || 'Luntian Farm';
  const ownerLegalName = farmer.owner_legal_name || farmer.name || 'Benjamin Villanueva';
  const farmAddress = farmer.farm_address || farmer.location || 'Brgy. Bucal, Amadeo, Cavite';
  const contactNumber = farmer.phone || '+63 917 842 1904';
  const primaryProduce = farmer.primary_produce || farmer.crops_specialty || 'Vegetables and herbs';
  const email = farmer.email || 'hello@luntian.ph';

  return (
    <>
      <div className="admin-modal-overlay" onClick={onClose}>
        <div className="admin-modal-card review-before-approval-card" onClick={(e) => e.stopPropagation()}>
          {/* Header Row */}
          <div className="admin-modal-header border-none mb-2">
            <div>
              <span className="admin-section-tag text-xs font-bold">FARMER VERIFICATION</span>
              <h2 className="admin-modal-title text-2xl mt-1">Review before approval</h2>
              <p className="admin-modal-sub text-sm text-muted mt-1">
                Confirm the farmer's identity and farm details before allowing product sales.
              </p>
            </div>
            <button
              type="button"
              className="admin-modal-close-round-btn"
              onClick={onClose}
              title="Close"
            >
              ✕
            </button>
          </div>

          <div className="admin-modal-scrollable-body">
            {/* Top Farmer Account Header Box */}
            <div className="admin-farmer-summary-banner">
              <div className="admin-farmer-summary-left">
                <div className="admin-farmer-avatar-circle">
                  LF
                </div>
                <div className="admin-farmer-summary-info">
                  <span className="admin-farmer-summary-name">{farmName}</span>
                  <span className="admin-farmer-summary-email">{email}</span>
                </div>
              </div>
              <span className="admin-status-pill status-pending font-semibold">
                Pending verification
              </span>
            </div>

            {/* Two Column Grid: Information & Documents */}
            <div className="admin-farmer-info-two-col">
              {/* Left Column: Personal & farm information */}
              <div className="admin-farmer-info-card">
                <h3 className="admin-info-card-title">Personal & farm information</h3>
                <div className="admin-info-list">
                  <div className="admin-info-row">
                    <span className="admin-info-label">Owner's legal name</span>
                    <span className="admin-info-value">{ownerLegalName}</span>
                  </div>
                  <div className="admin-info-row">
                    <span className="admin-info-label">Farm name</span>
                    <span className="admin-info-value">{farmName}</span>
                  </div>
                  <div className="admin-info-row">
                    <span className="admin-info-label">Farm address</span>
                    <span className="admin-info-value">{farmAddress}</span>
                  </div>
                  <div className="admin-info-row">
                    <span className="admin-info-label">Contact number</span>
                    <span className="admin-info-value">{contactNumber}</span>
                  </div>
                  <div className="admin-info-row">
                    <span className="admin-info-label">Primary produce</span>
                    <span className="admin-info-value">{primaryProduce}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Submitted documents */}
              <div className="admin-farmer-info-card">
                <h3 className="admin-info-card-title">Submitted documents</h3>
                <div className="admin-docs-list">
                  {/* Doc 1: Government ID */}
                  <div className="admin-doc-item">
                    <div className="admin-doc-icon-box">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="doc-svg">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <line x1="10" y1="9" x2="8" y2="9" />
                      </svg>
                    </div>
                    <div className="admin-doc-info">
                      <span className="admin-doc-name">Government-issued ID</span>
                      <span className="admin-doc-sub">benjamin-id.jpg • Uploaded Mar 17</span>
                    </div>
                    <button
                      type="button"
                      className="admin-doc-view-btn"
                      onClick={() => setPreviewDoc({
                        title: 'Government-issued ID (Benjamin Villanueva)',
                        filename: 'benjamin-id.jpg',
                        type: 'id'
                      })}
                    >
                      View document
                    </button>
                  </div>

                  {/* Doc 2: Proof of farm address */}
                  <div className="admin-doc-item">
                    <div className="admin-doc-icon-box">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="doc-svg">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <line x1="10" y1="9" x2="8" y2="9" />
                      </svg>
                    </div>
                    <div className="admin-doc-info">
                      <span className="admin-doc-name">Proof of farm address</span>
                      <span className="admin-doc-sub">barangay-certificate.pdf • Uploaded Mar 17</span>
                    </div>
                    <button
                      type="button"
                      className="admin-doc-view-btn"
                      onClick={() => setPreviewDoc({
                        title: 'Barangay Certification of Farm Land (Amadeo, Cavite)',
                        filename: 'barangay-certificate.pdf',
                        type: 'cert'
                      })}
                    >
                      View document
                    </button>
                  </div>

                  {/* Doc 3: Farm photo */}
                  <div className="admin-doc-item">
                    <div className="admin-doc-icon-box">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="doc-svg">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    <div className="admin-doc-info">
                      <span className="admin-doc-name">Farm photo</span>
                      <span className="admin-doc-sub">luntian-farm.jpg • Uploaded Mar 17</span>
                    </div>
                    <button
                      type="button"
                      className="admin-doc-view-btn"
                      onClick={() => setPreviewDoc({
                        title: 'Farm Photo (Luntian Farm, Amadeo, Cavite)',
                        filename: 'luntian-farm.jpg',
                        type: 'photo'
                      })}
                    >
                      View photo
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Verification Checklist Box */}
            <div className="admin-verification-checklist-card">
              <h4 className="admin-checklist-title">Verification checklist</h4>

              <div className="admin-checklist-items">
                <label className="admin-checklist-label">
                  <input
                    type="checkbox"
                    className="admin-checkbox-custom"
                    checked={checklist.identity}
                    onChange={() => handleCheckboxChange('identity')}
                  />
                  <span>Identity matches the submitted government ID</span>
                </label>

                <label className="admin-checklist-label">
                  <input
                    type="checkbox"
                    className="admin-checkbox-custom"
                    checked={checklist.location}
                    onChange={() => handleCheckboxChange('location')}
                  />
                  <span>Farm location and contact details are valid</span>
                </label>

                <label className="admin-checklist-label">
                  <input
                    type="checkbox"
                    className="admin-checkbox-custom"
                    checked={checklist.products}
                    onChange={() => handleCheckboxChange('products')}
                  />
                  <span>Submitted products comply with UmaHub guidelines</span>
                </label>
              </div>
            </div>

            {/* Footer Action Bar */}
            <div className="admin-verification-footer">
              <span className={`admin-checklist-notice ${isChecklistComplete ? 'text-green font-semibold' : ''}`}>
                {isChecklistComplete
                  ? 'All 3 checklist requirements verified ✓'
                  : 'Complete the checklist to enable approval.'}
              </span>

              <div className="admin-verification-btn-group">
                <button
                  type="button"
                  className="admin-reject-link-btn"
                  disabled={submitting}
                  onClick={handleReject}
                >
                  Reject application
                </button>

                <button
                  type="button"
                  className={`admin-approve-verify-btn ${isChecklistComplete ? 'ready' : 'disabled'}`}
                  disabled={!isChecklistComplete || submitting}
                  onClick={handleApprove}
                >
                  {submitting ? 'Verifying...' : 'Approve & verify farmer ✓'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Document Lightbox Preview Modal */}
      {previewDoc && (
        <div className="admin-doc-preview-backdrop" onClick={() => setPreviewDoc(null)}>
          <div className="admin-doc-preview-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="admin-doc-preview-header">
              <h3 className="admin-doc-preview-title">{previewDoc.title}</h3>
              <button
                type="button"
                className="admin-modal-close-round-btn"
                onClick={() => setPreviewDoc(null)}
              >
                ✕
              </button>
            </div>

            <div className="admin-doc-preview-content">
              {previewDoc.type === 'id' && (
                <div className="admin-mock-id-card">
                  <div className="mock-id-header">
                    <span className="mock-ph-seal">🇵🇭</span>
                    <div>
                      <strong>REPUBLIC OF THE PHILIPPINES</strong>
                      <p className="text-xs">UNIFIED MULTI-PURPOSE IDENTIFICATION CARD</p>
                    </div>
                  </div>
                  <div className="mock-id-body">
                    <div className="mock-id-photo">
                      <div className="mock-photo-placeholder">👤</div>
                    </div>
                    <div className="mock-id-info">
                      <p className="text-xs text-muted">NAME</p>
                      <p className="font-bold text-sm">VILLANUEVA, BENJAMIN G.</p>
                      <p className="text-xs text-muted mt-1">ADDRESS</p>
                      <p className="text-xs font-semibold">BRGY. BUCAL, AMADEO, CAVITE</p>
                      <p className="text-xs text-muted mt-1">CRN / ID NO.</p>
                      <p className="font-mono text-xs">CRN-0112-9842190-4</p>
                    </div>
                  </div>
                  <div className="mock-id-footer">
                    <span>Verified Government Record</span>
                    <span>ISSUED: 15 JAN 2024</span>
                  </div>
                </div>
              )}

              {previewDoc.type === 'cert' && (
                <div className="admin-mock-cert-card">
                  <div className="mock-cert-header">
                    <p className="text-xs">Republic of the Philippines</p>
                    <p className="text-xs">Province of Cavite • Municipality of Amadeo</p>
                    <p className="font-bold text-sm mt-1">BARANGAY BUCAL</p>
                    <h4 className="font-serif font-bold text-md mt-2 text-dark">BARANGAY CERTIFICATION OF FARM OWNERSHIP</h4>
                  </div>
                  <div className="mock-cert-body">
                    <p className="text-xs leading-relaxed">
                      TO WHOM IT MAY CONCERN: This is to certify that <strong>BENJAMIN VILLANUEVA</strong>, of legal age, Filipino, is a bonafide resident and certified agricultural farm producer operating in <strong>Luntian Farm, Barangay Bucal, Amadeo, Cavite</strong>.
                    </p>
                    <p className="text-xs mt-2">
                      Farm Area: 3.2 Hectares • Principal Crops: Vegetables, Cucumbers, and Culinary Herbs.
                    </p>
                  </div>
                  <div className="mock-cert-footer">
                    <p className="text-xs font-bold">HON. RICARDO M. SANTOS</p>
                    <p className="text-xxs text-muted">Punong Barangay • Sealed & Verified Mar 17, 2026</p>
                  </div>
                </div>
              )}

              {previewDoc.type === 'photo' && (
                <div className="admin-mock-photo-card">
                  <img
                    src="/image/basakan.png"
                    alt="Luntian Farm Field"
                    className="mock-farm-full-img"
                    onError={(e) => { e.target.src = '/image/farmbg.png'; }}
                  />
                  <div className="mock-photo-caption">
                    <p className="font-semibold text-xs text-dark">Luntian Farm Cultivation Field</p>
                    <p className="text-xxs text-muted">Brgy. Bucal, Amadeo, Cavite • Captured Mar 17, 2026</p>
                  </div>
                </div>
              )}
            </div>

            <div className="admin-doc-preview-footer">
              <button
                type="button"
                className="admin-approve-btn"
                onClick={() => setPreviewDoc(null)}
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminFarmerReviewModal;
