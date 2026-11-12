import React, { useState } from 'react';
import { adminAPI } from '../../services/api';

function AdminInviteModal({
  isOpen,
  onClose,
  onSuccess,
  showToast
}) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim()) {
      showToast('Please provide both name and email.');
      return;
    }

    try {
      setSubmitting(true);
      await adminAPI.inviteAdmin({
        name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim()
      });
      showToast(`Admin invitation sent to ${email}!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      showToast('Failed to invite admin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h2 className="admin-modal-title">Invite New Administrator</h2>
          <button type="button" className="admin-modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="admin-modal-form">
          <div className="admin-form-group">
            <label className="admin-input-label">Full Name</label>
            <input
              type="text"
              required
              className="admin-form-input"
              placeholder="e.g. Maria Clara"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-input-label">Email Address</label>
            <input
              type="email"
              required
              className="admin-form-input"
              placeholder="admin@umahub.ph"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="admin-form-group">
            <label className="admin-input-label">Phone Number (Optional)</label>
            <input
              type="text"
              className="admin-form-input"
              placeholder="0912 345 6789"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="admin-modal-actions">
            <button
              type="button"
              className="admin-secondary-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="admin-approve-btn"
              disabled={submitting}
            >
              {submitting ? 'Sending...' : 'Send Invitation ✓'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminInviteModal;
