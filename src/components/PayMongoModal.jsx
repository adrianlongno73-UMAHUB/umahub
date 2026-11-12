import React, { useState, useRef } from 'react';
import { simulatePayMongoTestPayment } from '../services/paymongo';
import './PayMongoModal.css';

function PayMongoModal({
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
      const paymentRes = await simulatePayMongoTestPayment({
        amount,
        method: channelName,
        customerName,
        customerPhone: phoneNumber
      });

      setIsProcessing(false);
      isProcessingRef.current = false;
      onSuccess(paymentRes);
    } catch (err) {
      setIsProcessing(false);
      isProcessingRef.current = false;
      console.error('PayMongo authorization error:', err);
    }
  };

  return (
    <div
      className="paymongo-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="paymongo-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* PayMongo Top Brand Bar */}
        <div className="paymongo-modal-top">
          <div className="paymongo-brand-wrap">
            <span className="paymongo-logo-text">paymongo</span>
            <span className="paymongo-test-tag">Sandbox Test</span>
          </div>
          <button
            type="button"
            className="paymongo-close-btn"
            onClick={onClose}
            title="Cancel payment"
          >
            ×
          </button>
        </div>

        {/* Modal Body */}
        <div className="paymongo-modal-body">
          {/* Channel Banner */}
          <div className={`paymongo-channel-banner ${channelColorClass}`}>
            <div className={`channel-icon-pill ${channelColorClass}`}>
              {isGCash ? 'G' : 'M'}
            </div>
            <div className="channel-texts">
              <h3 className="channel-title">{channelName} Checkout</h3>
              <p className="channel-sub">
                Secure electronic wallet payment via PayMongo
              </p>
            </div>
          </div>

          {/* Amount Card */}
          <div className="paymongo-amount-card">
            <div className="amount-card-left">
              <span className="amount-merchant-label">Merchant: UmaHub Marketplace</span>
              <span className="amount-order-ref">Order {orderNumber}</span>
            </div>
            <div className="amount-card-val">₱{amount}</div>
          </div>

          {/* Test Account & OTP Inputs */}
          <div className="paymongo-inputs-group">
            <div className="paymongo-field">
              <label className="paymongo-field-label">
                <span>{channelName} Mobile Number</span>
                <small>Test Sandbox</small>
              </label>
              <input
                type="text"
                className="paymongo-field-input"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0917 123 4567"
              />
            </div>

            <div className="paymongo-field">
              <label className="paymongo-field-label">
                <span>6-Digit Verification OTP</span>
                <small>Auto-filled</small>
              </label>
              <input
                type="text"
                maxLength={6}
                className="paymongo-field-input"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
              />
            </div>
          </div>

          {/* Sandbox Callout */}
          <div className="paymongo-test-callout">
            <span className="callout-icon">💡</span>
            <p className="callout-text">
              <strong>PayMongo Test Mode Active:</strong> No real money will be charged to your account. Click "Authorize Payment" to complete the test transaction.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="paymongo-modal-actions">
            <button
              type="button"
              className={`btn-authorize-paymongo ${channelColorClass}`}
              onClick={handleAuthorizePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span>Authorizing with PayMongo...</span>
              ) : (
                <>
                  <span>Authorize {channelName} Payment ✓</span>
                  <span>· ₱{amount}</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="btn-cancel-paymongo"
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

export default PayMongoModal;
