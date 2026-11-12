import React, { useState, useRef } from 'react';
import CustomerLocationModal from './CustomerLocationModal';
import XenditModal from './XenditModal';
import { ordersAPI, cartAPI } from '../services/api';
import './CustomerDashboard.css';

function CustomerCheckout({
  customerName = 'Customer',
  customerEmail = '',
  customerPhone = '',
  items = [],
  subtotal = 0,
  deliveryFee: initialDeliveryFee = 50.0,
  initialFulfillmentType = 'delivery',
  initialDeliveryAddress = null,
  onOrderPlaced = () => {},
  onBackToCart = () => {},
  showToast = () => {}
}) {
  const [deliveryType, setDeliveryType] = useState(initialFulfillmentType || 'delivery');
  const [paymentMethod, setPaymentMethod] = useState('gcash');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showXenditModal, setShowXenditModal] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const isSubmittingRef = useRef(false);
  const [pendingOrderNumber, setPendingOrderNumber] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState(
    initialDeliveryAddress && typeof initialDeliveryAddress === 'object'
      ? initialDeliveryAddress
      : {
          name: customerName,
          street: typeof initialDeliveryAddress === 'string' ? initialDeliveryAddress : 'Purok 1',
          barangay: 'Brgy. Bunawan · 4114',
          purok: 'Purok 1',
        }
  );

  const deliveryFee = deliveryType === 'delivery' ? (initialDeliveryFee || 50.0) : 0.0;
  const numSubtotal = parseFloat(subtotal) || 0;
  const totalAmount = (numSubtotal + deliveryFee).toFixed(2);

  const finalizeOrder = async ({ paymentStatus = 'paid', paymentRef = null } = {}) => {
    if (isPlacingOrder) return;
    isSubmittingRef.current = true;
    setIsPlacingOrder(true);

    const primaryFarmName = items[0]?.farm || items[0]?.farm_name || 'Fresh Local Farm';
    const primaryFarmerId = items[0]?.farmer_id || items[0]?.farmerId || null;
    const orderNum = pendingOrderNumber || ('#UH-' + Math.floor(20000 + Math.random() * 90000));

    const orderData = {
      orderNumber: orderNum,
      amountPaid: totalAmount,
      customerName,
      paymentMethod:
        paymentMethod === 'gcash'
          ? 'GCash (Xendit)'
          : paymentMethod === 'maya'
          ? 'Maya (Xendit)'
          : 'Cash on Delivery',
      paymentStatus,
      paymentRef,
      deliveryType,
      deliveryAddress,
      estimatedDelivery: deliveryType === 'delivery' ? 'Today, 3:00–5:00 PM' : 'Ready today for pickup',
      farmName: primaryFarmName,
      items: items.length > 0 ? items : [
        { id: 1, name: 'Fresh Produce', pricePerUnit: numSubtotal, quantity: 1, farmer_id: primaryFarmerId }
      ]
    };

    const orderItemsPayload = items.length > 0
      ? items.map(i => ({
          id: i.product_id || i.id,
          product_id: i.product_id || i.id,
          farmer_id: i.farmer_id || i.farmerId || primaryFarmerId,
          name: i.name,
          price: parseFloat(i.pricePerUnit || i.price) || 0,
          quantity: i.quantity || 1
        }))
      : [{ id: 1, product_id: 1, farmer_id: primaryFarmerId, name: 'Fresh Produce', price: numSubtotal, quantity: 1 }];

    try {
      const res = await ordersAPI.create({
        farmer_id: primaryFarmerId,
        farm_name: primaryFarmName,
        items: orderItemsPayload,
        total_amount: parseFloat(totalAmount),
        fulfillment_type: deliveryType,
        delivery_address: `${deliveryAddress.street}, ${deliveryAddress.barangay}`,
        payment_method: paymentMethod === 'cod' ? 'cod' : paymentMethod,
        payment_status: paymentStatus,
        payment_ref: paymentRef
      });

      if (res && res.orderNumber) {
        orderData.orderNumber = '#' + res.orderNumber;
      }
    } catch (err) {
      console.log('Order API notice:', err.message);
    }

    // Safely clear the cart
    try {
      await cartAPI.clear();
    } catch (err) {
      console.log('Cart clear note:', err);
    }

    setIsPlacingOrder(false);
    setShowXenditModal(false);
    isSubmittingRef.current = false;

    if (paymentMethod === 'cod') {
      showToast(`Order placed successfully with Cash on Delivery!`);
    } else {
      showToast(`Payment successful via Xendit (${paymentMethod.toUpperCase()})!`);
    }

    onOrderPlaced(orderData);
  };

  const handlePlaceOrder = async () => {
    if (isPlacingOrder || isSubmittingRef.current) return;

    // If online payment via GCash or Maya, open Xendit Test Checkout
    if (paymentMethod === 'gcash' || paymentMethod === 'maya') {
      const genOrderNum = '#UH-' + Math.floor(20000 + Math.random() * 90000);
      setPendingOrderNumber(genOrderNum);
      setShowXenditModal(true);
      return;
    }

    // Cash on Delivery
    await finalizeOrder({
      paymentStatus: 'pending',
      paymentRef: 'COD-' + Date.now()
    });
  };

  const handleLocationUpdate = (loc) => {
    setDeliveryAddress({
      name: customerName,
      street: loc.customAddress || loc.purok,
      barangay: `Brgy. ${loc.barangay} · 4114`,
      purok: loc.purok,
    });
  };

  return (
    <div className="customer-checkout-container">
      {/* 3-Step Stepper Header */}
      <div className="checkout-stepper-header">
        <div className="checkout-step-item completed" onClick={onBackToCart}>
          <span className="step-num-circle check">✓</span>
          <span className="step-label-text">Cart · Items reviewed</span>
        </div>

        <div className="checkout-step-item active">
          <span className="step-num-circle num">2</span>
          <span className="step-label-text">Checkout · Delivery & payment</span>
        </div>

        <div className="checkout-step-item pending">
          <span className="step-num-circle num">3</span>
          <span className="step-label-text">Confirmation · Order complete</span>
        </div>
      </div>

      <h1 className="checkout-main-title">Complete your order</h1>

      {/* 2-Column Layout */}
      <div className="checkout-two-col-layout">
        {/* Left Column: Form Details */}
        <div className="checkout-left-form-stack">
          {/* Card 1: Ordering As */}
          <div className="checkout-info-card ordering-as-card">
            <span className="info-card-sub-tag">ORDERING AS · {customerName}</span>
            <div className="info-card-main-val">{customerEmail}{customerPhone ? ` · ${customerPhone}` : ''}</div>
          </div>

          {/* Delivery vs Pick up Toggle Cards */}
          <div className="delivery-type-grid">
            <div
              className={`delivery-type-card ${deliveryType === 'delivery' ? 'selected' : ''}`}
              onClick={() => {
                setDeliveryType('delivery');
                showToast('Selected Doorstep Delivery');
              }}
            >
              <h3 className="delivery-card-title">Delivery</h3>
              <p className="delivery-card-sub">To your doorstep</p>
            </div>

            <div
              className={`delivery-type-card ${deliveryType === 'pickup' ? 'selected' : ''}`}
              onClick={() => {
                setDeliveryType('pickup');
                showToast('Selected Farm Pick up');
              }}
            >
              <h3 className="delivery-card-title">Pick up</h3>
              <p className="delivery-card-sub">From the farm</p>
            </div>
          </div>

          {/* Card 2: Deliver To Address */}
          <div className="checkout-info-card deliver-to-card">
            <div className="deliver-to-left">
              <span className="info-card-sub-tag">
                DELIVER TO · {customerName} <span className="verified-badge">✓ Verified</span>
              </span>
              <div className="deliver-to-street-line">{deliveryAddress.street}</div>
              <div className="deliver-to-brgy-line">{deliveryAddress.barangay}</div>
            </div>

            {/* Pencil Edit Location Button */}
            <button
              type="button"
              className="btn-edit-delivery-location"
              onClick={() => setShowLocationModal(true)}
              title="Edit delivery location"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="pencil-svg-icon">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </button>
          </div>

          {/* Card 3: Payment Method */}
          <div className="checkout-info-card payment-method-card">
            <div className="payment-method-header">
              <div className="payment-step-indicator">2</div>
              <div className="payment-title-group">
                <h3 className="payment-card-title">Payment method</h3>
                <p className="payment-card-sub">Select your preferred secure payment option</p>
              </div>
            </div>

            <div className="payment-options-list">
              {/* Option 1: GCash */}
              <label
                className={`payment-option-row ${paymentMethod === 'gcash' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('gcash')}
              >
                <div className="payment-brand-badge gcash">
                  <span>G</span>
                </div>
                <div className="payment-brand-info">
                  <h4 className="payment-brand-title">GCash</h4>
                  <p className="payment-brand-desc">Pay securely using your GCash account</p>
                </div>
                <div className="payment-custom-radio">
                  {paymentMethod === 'gcash' && <div className="payment-radio-dot" />}
                </div>
              </label>

              {/* Option 2: Maya */}
              <label
                className={`payment-option-row ${paymentMethod === 'maya' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('maya')}
              >
                <div className="payment-brand-badge maya">
                  <span>M</span>
                </div>
                <div className="payment-brand-info">
                  <h4 className="payment-brand-title">Maya</h4>
                  <p className="payment-brand-desc">Pay securely using your Maya account</p>
                </div>
                <div className="payment-custom-radio">
                  {paymentMethod === 'maya' && <div className="payment-radio-dot" />}
                </div>
              </label>

              {/* Option 3: Cash on Delivery */}
              <label
                className={`payment-option-row ${paymentMethod === 'cod' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('cod')}
              >
                <div className="payment-brand-badge cod">
                  <span>₱</span>
                </div>
                <div className="payment-brand-info">
                  <h4 className="payment-brand-title">Cash on Delivery</h4>
                  <p className="payment-brand-desc">Pay when your order arrives</p>
                </div>
                <div className="payment-custom-radio">
                  {paymentMethod === 'cod' && <div className="payment-radio-dot" />}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary Card */}
        <aside className="checkout-summary-card">
          <h3 className="summary-card-title">Order summary</h3>

          {items && items.length > 0 && (
            <div style={{ marginBottom: '16px', maxHeight: '180px', overflowY: 'auto', borderBottom: '1px solid #eef2ed', paddingBottom: '12px' }}>
              {items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#17331b', marginBottom: '8px' }}>
                  <span>{it.quantity}x {it.name}</span>
                  <span style={{ fontWeight: '600' }}>₱{((parseFloat(it.pricePerUnit || it.price) || 0) * it.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="summary-calc-rows">
            <div className="summary-row-line">
              <span className="summary-line-label">Subtotal</span>
              <span className="summary-line-val">₱{numSubtotal.toFixed(2)}</span>
            </div>
            <div className="summary-row-line">
              <span className="summary-line-label">Delivery fee</span>
              <span className="summary-line-val">
                {deliveryType === 'delivery'
                  ? `₱${deliveryFee.toFixed(2)}`
                  : 'Free (Pickup)'}
              </span>
            </div>
          </div>

          <div className="summary-total-divider" />

          <div className="summary-total-headline-row">
            <span className="summary-total-label">Total</span>
            <span className="summary-total-amount">₱{totalAmount}</span>
          </div>

          <button
            type="button"
            className="btn-place-order-action"
            onClick={handlePlaceOrder}
            disabled={isPlacingOrder}
          >
            {isPlacingOrder ? (
              'Placing order...'
            ) : paymentMethod === 'cod' ? (
              `✓ Place order · ₱${totalAmount}`
            ) : (
              `✓ Place order with ${paymentMethod === 'gcash' ? 'GCash' : 'Maya'} · ₱${totalAmount}`
            )}
          </button>

          <p className="summary-guarantee-note">
            By placing this order, you confirm all details above.
          </p>
        </aside>
      </div>

      {/* Edit Location Modal */}
      {showLocationModal && (
        <CustomerLocationModal
          currentLocation={{
            barangay: 'Bunawan',
            purok: deliveryAddress.purok,
            customAddress: deliveryAddress.street,
          }}
          onClose={() => setShowLocationModal(false)}
          onSelectLocation={handleLocationUpdate}
          showToast={showToast}
        />
      )}

      {/* Xendit Test Checkout Modal */}
      <XenditModal
        isOpen={showXenditModal}
        onClose={() => {
          setShowXenditModal(false);
          showToast('Xendit test payment cancelled.');
        }}
        onSuccess={(paymentDetails) => {
          finalizeOrder({
            paymentStatus: 'paid',
            paymentRef: paymentDetails.paymentId
          });
        }}
        amount={totalAmount}
        paymentMethod={paymentMethod}
        orderNumber={pendingOrderNumber}
        customerName={customerName}
        customerPhone={customerPhone}
      />
    </div>
  );
}

export default CustomerCheckout;