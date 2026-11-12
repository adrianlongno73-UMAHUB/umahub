import React, { useState } from 'react';
import './CustomerDashboard.css';

function CustomerCancelOrderModal({
  orderId = 'UH-2045',
  farmName = "Fresh Local Farm",
  onClose = () => {},
  onConfirmCancel = () => {},
  showToast = () => {}
}) {
  const [selectedReason, setSelectedReason] = useState('Changed my mind');

  const reasons = [
    'Changed my mind',
    'Ordered by mistake',
    'Found it elsewhere',
  ];

  const handleCancel = () => {
    onConfirmCancel({
      orderId,
      reason: selectedReason,
    });
    showToast(`Order #${orderId} was cancelled (${selectedReason}).`);
    onClose();
  };

  return (
    <div className="cancel-order-modal-overlay" onClick={onClose}>
      <div className="cancel-order-modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="cancel-modal-title">Cancel this order?</h2>
        <p className="cancel-modal-subtitle">
          Order #{orderId} will be cancelled and {farmName} will be notified. This cannot be undone.
        </p>

        <div className="cancel-reason-group">
          <label className="cancel-reason-heading">Reason for cancelling</label>

          <div className="cancel-reason-options-list">
            {reasons.map((reason) => (
              <label
                key={reason}
                className={`cancel-reason-item ${selectedReason === reason ? 'selected' : ''}`}
                onClick={() => setSelectedReason(reason)}
              >
                <div className="cancel-custom-radio">
                  {selectedReason === reason && <div className="cancel-radio-dot" />}
                </div>
                <span className="cancel-reason-label">{reason}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="cancel-modal-actions-row">
          <button
            type="button"
            className="btn-cancel-modal-keep"
            onClick={onClose}
          >
            Keep order
          </button>
          <button
            type="button"
            className="btn-cancel-modal-confirm"
            onClick={handleCancel}
          >
            Cancel order
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomerCancelOrderModal;