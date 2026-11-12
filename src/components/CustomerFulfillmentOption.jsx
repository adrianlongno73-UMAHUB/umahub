import React, { useState } from 'react';
import CustomerLocationModal from './CustomerLocationModal';
import './CustomerDashboard.css';

function CustomerFulfillmentOption({
  itemsCount = 2,
  itemsTotal = 250.0,
  onContinueToPayment = () => {},
  showToast = () => {}
}) {
  const [selectedMethod, setSelectedMethod] = useState('pickup'); // 'pickup' | 'delivery'
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [savedAddress, setSavedAddress] = useState('Purok 1, Brgy. Bunawan');

  const deliveryFee = selectedMethod === 'delivery' ? 50.0 : 0.0;
  const grandTotal = (itemsTotal + deliveryFee).toFixed(2);

  const handleLocationSelected = (loc) => {
    setSavedAddress(loc.displayString);
    showToast(`Delivery address set to: ${loc.displayString}`);
  };

  const handleContinue = () => {
    onContinueToPayment({
      fulfillmentType: selectedMethod,
      deliveryFee,
      total: grandTotal,
      address: savedAddress,
    });
  };

  return (
    <div className="fulfillment-view-outer-wrapper">
      <div className="fulfillment-green-frame-box">
        <h1 className="fulfillment-main-heading">
          How would you like to get your order?
        </h1>
        <p className="fulfillment-sub-desc">
          Choose pickup or delivery before you pay.
        </p>

        <div className="fulfillment-two-col-grid">
          {/* Left Column: Radio Options & Address */}
          <div className="fulfillment-left-stack">
            {/* Option 1: Pickup at the farm */}
            <label
              className={`fulfillment-option-card ${selectedMethod === 'pickup' ? 'selected' : ''}`}
              onClick={() => setSelectedMethod('pickup')}
            >
              <div className="fulfillment-option-header-row">
                <div className="fulfillment-radio-title-wrap">
                  <div className="fulfillment-custom-radio">
                    {selectedMethod === 'pickup' && <div className="fulfillment-radio-dot" />}
                  </div>
                  <span className="fulfillment-method-title">Pickup at the farm</span>
                </div>
                <span className="fulfillment-price-tag">PHP 0.00</span>
              </div>
              <p className="fulfillment-method-sub">
                Free. Collect your order at the farm on your chosen time.
              </p>
            </label>

            {/* Option 2: Delivery */}
            <label
              className={`fulfillment-option-card ${selectedMethod === 'delivery' ? 'selected' : ''}`}
              onClick={() => setSelectedMethod('delivery')}
            >
              <div className="fulfillment-option-header-row">
                <div className="fulfillment-radio-title-wrap">
                  <div className="fulfillment-custom-radio">
                    {selectedMethod === 'delivery' && <div className="fulfillment-radio-dot" />}
                  </div>
                  <span className="fulfillment-method-title">Delivery</span>
                </div>
                <span className="fulfillment-price-tag">From PHP 50.00</span>
              </div>
              <p className="fulfillment-method-sub">
                Delivered to your saved address. Fee depends on distance.
              </p>
            </label>

            {/* Delivery address selection block */}
            <div className="fulfillment-address-block">
              <h4 className="fulfillment-address-title">Delivery address</h4>
              <p className="fulfillment-address-sub">
                {selectedMethod === 'delivery'
                  ? `Delivering to: ${savedAddress}`
                  : 'Only needed if you choose delivery.'}
              </p>
              <button
                type="button"
                className="btn-add-choose-address"
                onClick={() => setShowLocationModal(true)}
              >
                {savedAddress ? 'Change address' : 'Add or choose address'}
              </button>
            </div>
          </div>

          {/* Right Column: Order summary card */}
          <aside className="fulfillment-summary-card">
            <h3 className="fulfillment-summary-title">Order summary</h3>

            <div className="fulfillment-summary-lines">
              <div className="summary-calc-line">
                <span className="calc-line-label">Items ({itemsCount})</span>
                <span className="calc-line-value">PHP {itemsTotal.toFixed(2)}</span>
              </div>

              <div className="summary-calc-line">
                <span className="calc-line-label">Pickup fee</span>
                <span className="calc-line-value">
                  {selectedMethod === 'pickup' ? 'Free' : `PHP ${deliveryFee.toFixed(2)}`}
                </span>
              </div>

              <div className="summary-total-calc-line">
                <span className="calc-total-label">Total</span>
                <span className="calc-total-value">PHP {grandTotal}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-continue-to-payment"
              onClick={handleContinue}
            >
              Continue to payment
            </button>
          </aside>
        </div>
      </div>

      {showLocationModal && (
        <CustomerLocationModal
          currentLocation={{
            barangay: 'Bunawan',
            purok: 'Purok 1',
            customAddress: savedAddress,
          }}
          onClose={() => setShowLocationModal(false)}
          onSelectLocation={handleLocationSelected}
          showToast={showToast}
        />
      )}
    </div>
  );
}

export default CustomerFulfillmentOption;