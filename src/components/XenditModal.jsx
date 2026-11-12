import React, { useState, useRef } from 'react';
import { simulateXenditTestPayment } from '../services/xendit';
import './XenditModal.css';

function XenditModal({
  isOpen = false,
  onClose = () => {},
  onSuccess = () => {},
  amount = '0.00',
  paymentMethod = 'gcash',
  orderNumber = '#UH-24038',
  customerName = 'Customer',
  customerPhone = '0917 123 4567'
}) {
  const [phoneNumber, setPhoneNumber] = useState(customerPhone || '0917 123 4567');
  const [otp, setOtp] = useState('123456');
  const [isProcessing, setIsProcessing] = useState(false);
  const isProcessingRef = useRef(false);

  if (!isOpen) return null;

  const isGCash = paymentMethod === 'gcash';
  const channelName = isGCash ? 'GCash' : 'Maya';
  const channelColorClass = isGCash ? 'gcash' : 'maya';

  const handleAuthorizePayment = async () => {
    if (isProcessingRef.current || isProcessing) return;
    isProcessingRef.current = true;
    setIsProcessing(true);

    try {
      const paymentRes = await simulateXenditTestPayment({
        amount,
        method: channelName,
        orderNumber,
        customerName,
        customerPhone: phoneNumber
      });

      setIsProcessing(false);
      isProcessingRef.current = false;
      onSuccess(paymentRes);
    } catch (err) {
      setIsProcessing(false);
      isProcessingRef.current = false;
      console.error('Xendit payment error:', err);
    }
  };

  return (
    <div
      className="xendit-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="xendit-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Xendit Header Bar */}
        <div className="xendit-modal-top">
          <div className="xendit-brand-wrap">
            <span className="xendit-logo-text">
              xendit<span className="xendit-logo-dot">.</span>
            </span>
          </div>
          <button
            type="button"
            className="xendit-close-btn"
            onClick={onClose}
            title="Cancel payment"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="xendit-modal-body">
          {/* Channel Banner */}
          <div className={`xendit-channel-banner ${channelColorClass}`}>
            <div className={`xendit-channel-icon-pill ${channelColorClass}`}>
              {isGCash ? 'G' : 'M'}
            </div>
            <div className="xendit-channel-texts">
              <h3 className="xendit-channel-title">{channelName} Checkout</h3>
              <p className="xendit-channel-sub">
                Secure electronic payment powered by Xendit
              </p>
            </div>
          </div>

          {/* Amount Card */}
          <div className="xendit-amount-card">
            <div className="xendit-amount-left">
              <span className="xendit-merchant-label">Merchant: UmaHub Marketplace</span>
              <span className="xendit-order-ref">Order {orderNumber}</span>
            </div>
            <div className="xendit-amount-val">₱{amount}</div>
          </div>

          {/* Account & OTP Inputs */}
          <div className="xendit-inputs-group">
            <div className="xendit-field">
              <label className="xendit-field-label">
                <span>{channelName} Mobile Number</span>
              </label>
              <input
                type="text"
                className="xendit-field-input"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0917 123 4567"
              />
            </div>

            <div className="xendit-field">
              <label className="xendit-field-label">
                <span>6-Digit Verification OTP</span>
              </label>
              <input
                type="text"
                maxLength={6}
                className="xendit-field-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="xendit-modal-actions">
            <button
              type="button"
              className={`btn-authorize-xendit ${channelColorClass}`}
              onClick={handleAuthorizePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span>Processing payment with Xendit...</span>
              ) : (
                <>
                  <span>Pay with {channelName} ✓</span>
                  <span>· ₱{amount}</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="btn-cancel-xendit"
              onClick={onClose}
              disabled={isProcessing}
            >
              Cancel & Return to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default XenditModal;
