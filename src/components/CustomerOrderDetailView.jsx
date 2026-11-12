import React, { useState, useEffect } from 'react';
import tomatoesImg from '../image/tomatoes.png';
import carrotImg from '../image/carrot.png';
import gulay7Img from '../image/gulay7.png';
import gulay1Img from '../image/gulay1.png';
import CustomerCancelOrderModal from './CustomerCancelOrderModal';
import { ordersAPI } from '../services/api';
import './CustomerDashboard.css';

function CustomerOrderDetailView({
  orderId = '',
  initialShowCancelModal = false,
  onBack = () => {},
  onReorder = () => {},
  showToast = () => {}
}) {
  const [showCancelModal, setShowCancelModal] = useState(initialShowCancelModal);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(orderId));

  useEffect(() => {
    let isMounted = true;
    if (!orderId) return;

    ordersAPI.getById(orderId)
      .then((res) => {
        if (isMounted && res.data) {
          setOrder(res.data);
        }
      })
      .catch((err) => console.log('Order detail error:', err.message))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [orderId]);

  const handleContactFarm = () => {
    showToast('Connecting to Farm: +63 912 345 6789');
  };

  const handleCancelOrder = () => {
    setShowCancelModal(true);
  };

  const handleConfirmCancel = ({ reason }) => {
    ordersAPI.cancel(order?.id || orderId, reason)
      .then(() => {
        showToast(`Order #${order?.order_number || orderId} was cancelled (${reason}).`);
        setOrder(prev => prev ? { ...prev, status: 'cancelled' } : prev);
      })
      .catch(() => {
        showToast(`Order #${orderId} cancellation submitted.`);
      });
    setShowCancelModal(false);
  };

  const displayOrderNum = order?.order_number || orderId || 'Order';
  const orderItems = order?.order_items || [];
  const totalAmount = parseFloat(order?.total_amount || 0);
  const isDelivery = order?.fulfillment_type === 'delivery';
  const deliveryFee = isDelivery ? 50.0 : 0.0;
  const subtotal = Math.max(0, totalAmount - deliveryFee);
  const status = order?.status || 'placed';

  const statusLabels = {
    placed: 'Order Placed',
    preparing: 'Preparing Produce',
    ready_for_pickup: 'Ready for Pickup',
    out_for_delivery: 'Out for Delivery',
    completed: 'Completed',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    declined: 'Declined'
  };

  const imageMap = {
    'Fresh Tomatoes': tomatoesImg,
    'Carrots': carrotImg,
    'Native Carrots': carrotImg,
    'Siling Labuyo': gulay7Img,
  };

  return (
    <div className="customer-order-detail-view-container">
      {/* Header & Breadcrumb */}
      <div className="order-detail-header-flex">
        <div className="order-detail-title-col">
          <div className="order-detail-breadcrumb" onClick={onBack} style={{ cursor: 'pointer' }}>
            <span>My Orders</span>
            <span className="breadcrumb-slash">/</span>
            <span className="breadcrumb-current">Order #{displayOrderNum}</span>
          </div>
          <h1 className="order-detail-main-id">Order #{displayOrderNum}</h1>
        </div>

        <span className={`badge-ready-for-pickup ${status === 'cancelled' || status === 'declined' ? 'badge-cancelled' : ''}`}>
          {statusLabels[status] || status}
        </span>
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#527853', fontSize: '16px' }}>
          Loading order details from database...
        </div>
      ) : !order && orderItems.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#666' }}>
          <h3>Order not found</h3>
          <p>This order may have been removed or does not exist.</p>
          <button type="button" className="btn-order-reorder" style={{ marginTop: '16px' }} onClick={onBack}>
            ← Back to Orders
          </button>
        </div>
      ) : (
        /* 2-Column Content Layout */
        <div className="order-detail-layout-grid">
          {/* Left Column: Items Card */}
          <div className="order-detail-items-card">
            <h2 className="items-card-title">Items ({orderItems.length})</h2>

            <div className="order-items-scroll-list">
              {orderItems.map((item, idx) => (
                <div key={item.id || idx} className="order-detail-item-row">
                  <div className="order-detail-item-left">
                    <img
                      src={imageMap[item.product_name] || gulay1Img}
                      alt={item.product_name}
                      className="order-detail-item-photo"
                    />
                    <div className="order-detail-item-meta">
                      <h3 className="detail-item-name">{item.product_name}</h3>
                      <span className="detail-item-weight">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <div className="order-detail-item-price">
                    ₱{parseFloat(item.subtotal || item.unit_price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Sold By Farm Banner */}
            <div className="order-detail-farm-banner">
              <span className="farm-sold-by-tag">Delivery / Pickup Location</span>
              <h4 className="farm-sold-by-name">{order?.delivery_address || 'Bunawan, Agusan del Sur'}</h4>
              <p className="farm-verified-sub">Fulfillment: {order?.fulfillment_type === 'delivery' ? 'Home Delivery' : 'Farm Pickup'}</p>
            </div>
          </div>

          {/* Right Column: Summary & Actions Stack */}
          <div className="order-detail-sidebar-col">
            {/* Summary Box */}
            <div className="order-detail-summary-card">
              <h3 className="summary-box-title">Summary</h3>

              <div className="summary-box-lines">
                <div className="summary-box-row">
                  <span className="summary-box-label">Subtotal</span>
                  <span className="summary-box-val">PHP {subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-box-row">
                  <span className="summary-box-label">{isDelivery ? 'Delivery fee' : 'Pickup fee'}</span>
                  <span className="summary-box-val free">{isDelivery ? `PHP ${deliveryFee.toFixed(2)}` : 'Free'}</span>
                </div>
              </div>

              <div className="summary-box-divider" />

              <div className="summary-box-total-row">
                <span className="summary-total-label">Total</span>
                <span className="summary-total-val">PHP {totalAmount.toFixed(2)}</span>
              </div>

              <div className="summary-box-paid-row">
                <span className="paid-via-label">Payment method</span>
                <span className="paid-via-val" style={{ textTransform: 'capitalize' }}>
                  {order?.payment_method || 'GCash'}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="order-detail-actions-stack">
              <button
                type="button"
                className="btn-order-reorder"
                onClick={() => {
                  showToast(`Adding items to cart...`);
                  onReorder();
                }}
              >
                Order again
              </button>
              <button
                type="button"
                className="btn-order-contact-farm"
                onClick={handleContactFarm}
              >
                Contact support
              </button>
              {status !== 'cancelled' && status !== 'declined' && status !== 'completed' && (
                <button
                  type="button"
                  className="btn-order-cancel"
                  onClick={handleCancelOrder}
                >
                  Cancel order
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <CustomerCancelOrderModal
          orderId={displayOrderNum}
          farmName="UmaHub Local Farm"
          onClose={() => setShowCancelModal(false)}
          onConfirmCancel={handleConfirmCancel}
          showToast={showToast}
        />
      )}
    </div>
  );
}

export default CustomerOrderDetailView;