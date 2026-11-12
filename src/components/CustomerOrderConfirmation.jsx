import React from 'react';
import './CustomerDashboard.css';

function CustomerOrderConfirmation({
  order = null,
  onTrackOrder = () => {},
  onBackToHome = () => {}
}) {
  const currentOrder = order || {
    amountPaid: '250.00',
    orderNumber: '#UH-24038',
    estimatedDelivery: 'Today, 3:00–5:00 PM',
    customerName: 'Maria',
    farmName: 'Fresh Local Farm',
  };

  return (
    <div className="order-confirmation-screen">
      <div className="confirmation-content-box">
        {/* Big Green Success Check Circle */}
        <div className="confirmation-success-check-circle">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="check-svg"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <span className="confirmation-super-tag">
          {currentOrder.paymentMethod?.includes('Cash on Delivery')
            ? 'ORDER PLACED · CASH ON DELIVERY'
            : 'PAYMENT SUCCESSFUL · XENDIT'}
        </span>
        <h1 className="confirmation-main-title">
          Thank you, {currentOrder.customerName || 'Customer'}!
        </h1>
        <p className="confirmation-sub-desc">
          Your fresh produce is being prepared by {currentOrder.farmName || "Fresh Local Farm"}.
        </p>

        {/* Receipt Details Card */}
        <div className="confirmation-receipt-card">
          <div className="receipt-line-row">
            <span className="receipt-label">
              {currentOrder.paymentMethod?.includes('Cash on Delivery')
                ? 'Amount to pay on arrival'
                : 'Amount paid'}
            </span>
            <span className="receipt-value bold">₱{currentOrder.amountPaid}</span>
          </div>

          <div className="receipt-line-row">
            <span className="receipt-label">Order number</span>
            <span className="receipt-value">{currentOrder.orderNumber}</span>
          </div>

          <div className="receipt-line-row">
            <span className="receipt-label">Payment method</span>
            <span className="receipt-value">{currentOrder.paymentMethod || 'GCash (Xendit)'}</span>
          </div>

          {currentOrder.paymentRef && (
            <div className="receipt-line-row">
              <span className="receipt-label">Payment reference</span>
              <span className="receipt-value" style={{ fontFamily: 'monospace', fontSize: '12px' }}>
                {currentOrder.paymentRef}
              </span>
            </div>
          )}

          <div className="receipt-line-row">
            <span className="receipt-label">Estimated delivery</span>
            <span className="receipt-value">{currentOrder.estimatedDelivery}</span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="confirmation-actions-row">
          <button
            type="button"
            className="btn-track-order-action"
            onClick={onTrackOrder}
          >
            Track my order
          </button>
          <button
            type="button"
            className="btn-back-home-action"
            onClick={onBackToHome}
          >
            Back to home
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomerOrderConfirmation;