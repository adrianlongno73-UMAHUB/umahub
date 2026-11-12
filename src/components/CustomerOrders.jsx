import React, { useState, useEffect } from 'react';
import gulay1Img from '../image/gulay1.png';
import { ordersAPI } from '../services/api';
import './CustomerDashboard.css';

const formatDateSafe = (dateVal) => {
  if (!dateVal) return 'Recent';
  try {
    return new Date(dateVal).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return 'Recent';
  }
};

const formatDateTimeSafe = (dateVal) => {
  if (!dateVal) return 'Recent';
  try {
    return new Date(dateVal).toLocaleString();
  } catch {
    return 'Recent';
  }
};

function CustomerOrders({
  initialTab = 'active', // 'active' | 'completed' | 'cancelled' | 'declined'
  showToast = () => {},
  onNavigateToBrowse = () => {},
  onViewOrderDetail = null
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedDetailOrder, setSelectedDetailOrder] = useState(null);
  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    ordersAPI.getMyOrders(activeTab)
      .then((res) => {
        if (isMounted && res.data) {
          setOrdersList(res.data);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, [activeTab]);

  const tabs = [
    { id: 'active', label: 'Active orders' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'declined', label: 'Declined' },
  ];

  const handleOrderAgain = () => {
    showToast('Redirecting to shop fresh produce...');
    onNavigateToBrowse();
  };

  const handleViewDetails = (order) => {
    if (onViewOrderDetail) {
      onViewOrderDetail(order.id);
    } else {
      setSelectedDetailOrder(order);
      showToast(`Viewing details for order #${order.order_number || order.id}`);
    }
  };

  const handleDirectCancelOrder = async (order) => {
    const orderNum = order.order_number || order.id;
    if (!window.confirm(`Are you sure you want to cancel order #${orderNum}?`)) {
      return;
    }

    try {
      await ordersAPI.cancel(order.id, 'Duplicate test order cancellation');
      showToast(`Order #${orderNum} has been cancelled.`);
      setOrdersList((prev) => prev.filter((o) => o.id !== order.id));
    } catch (err) {
      showToast('Error cancelling order: ' + err.message);
    }
  };

  const handleCleanDuplicates = async () => {
    if (ordersList.length <= 1) return;

    if (!window.confirm(`Clean up duplicate orders? This will keep 1 order and cancel the other ${ordersList.length - 1} duplicates.`)) {
      return;
    }

    const [keepOrder, ...duplicatesToCancel] = ordersList;
    try {
      for (const dup of duplicatesToCancel) {
        await ordersAPI.cancel(dup.id, 'Duplicate test order cleaned up');
      }
      showToast(`Cleaned up ${duplicatesToCancel.length} duplicate orders! Kept Order #${keepOrder.order_number || keepOrder.id}.`);
      setOrdersList([keepOrder]);
    } catch (err) {
      showToast('Error cleaning duplicates: ' + err.message);
    }
  };

  return (
    <div className="customer-orders-container">
      {/* Header Info */}
      <div className="orders-header-group">
        <span className="orders-super-tag">ORDER HISTORY</span>
        <h1 className="orders-main-title">My Orders</h1>
        <p className="orders-sub-desc">Track fresh produce from farm to doorstep.</p>
      </div>

      {/* Tabs Navigation Bar */}
      <div className="orders-nav-tabs-bar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`orders-tab-pill-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Orders Content Stack */}
      <div className="orders-content-stack">
        {/* Notice to clean up accidental test duplicates */}
        {activeTab === 'active' && ordersList.length > 1 && (
          <div style={{
            background: '#FEF9C3',
            border: '1px solid #FEF08A',
            borderRadius: '12px',
            padding: '12px 18px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            fontSize: '13px',
            color: '#713F12',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <span>
              💡 <strong>Multiple active test orders ({ordersList.length}):</strong> Would you like to keep 1 order and clean up the duplicate entries?
            </span>
            <button
              type="button"
              onClick={handleCleanDuplicates}
              style={{
                background: '#B45309',
                color: '#FFFFFF',
                border: 'none',
                padding: '6px 14px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '12.5px',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              Clean up duplicates
            </button>
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', background: '#ffffff', borderRadius: '16px', border: '1px solid #eef2ed', color: '#6B7280' }}>
            Loading your orders from database...
          </div>
        ) : ordersList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 24px', background: '#ffffff', borderRadius: '16px', border: '1px solid #eef2ed' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🧺</div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#17331b', marginBottom: '8px' }}>
              No {activeTab} orders found
            </h2>
            <p style={{ color: '#6B7280', fontSize: '14px', maxWidth: '420px', margin: '0 auto 24px' }}>
              {activeTab === 'active'
                ? "You don't have any ongoing deliveries right now. Fresh local harvest is waiting for you!"
                : `You currently have no ${activeTab} orders recorded in your history.`}
            </p>
            <button
              type="button"
              className="btn-order-again"
              onClick={onNavigateToBrowse}
              style={{
                background: '#2D5A27',
                color: '#ffffff',
                padding: '12px 28px',
                borderRadius: '9999px',
                border: 'none',
                fontWeight: '600',
                fontSize: '15px',
                cursor: 'pointer'
              }}
            >
              Browse Fresh Produce →
            </button>
          </div>
        ) : (
          ordersList.map((order) => {
            const itemsSummary = (order.order_items || [])
              .map((i) => `${i.product_name} (${i.quantity})`)
              .join(', ') || 'Fresh local produce package';
            const dateStr = formatDateSafe(order.placed_at);

            return (
              <div key={order.id} className="order-history-card" style={{ marginBottom: '16px' }}>
                <div className="order-card-header-row">
                  <div className="order-id-date-col">
                    <span className="order-code-sub">ORDER #{order.order_number || order.id}</span>
                    <span className="order-date-main">{dateStr}</span>
                  </div>
                  <span
                    className={
                      order.status === 'completed' || order.status === 'delivered'
                        ? 'badge-delivered-green'
                        : order.status === 'cancelled' || order.status === 'declined'
                        ? 'badge-cancelled-pink'
                        : 'badge-preparing-order'
                    }
                  >
                    ● {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Placed'}
                  </span>
                </div>

                <div className="order-card-divider" />

                <div className="order-history-item-row">
                  <div className="order-history-info-left">
                    <img src={gulay1Img} alt="Order items" className="order-item-thumb single" />
                    <div className="order-history-meta">
                      <h3 className="order-history-farm-title">{itemsSummary}</h3>
                      <p className="order-history-status-sub">
                        {order.fulfillment_type === 'pickup' ? 'Store Pickup' : `Delivering to: ${order.delivery_address || 'Bunawan, Agusan del Sur'}`}
                      </p>
                    </div>
                  </div>
                  <div className="order-history-price">
                    ₱{parseFloat(order.total_amount || 0).toFixed(2)}
                  </div>
                </div>

                <div className="order-card-divider" />

                <div className="order-history-actions-row">
                  <button
                    type="button"
                    className="btn-link-order-action"
                    onClick={handleOrderAgain}
                  >
                    Order again
                  </button>
                  <button
                    type="button"
                    className="btn-link-order-action"
                    onClick={() => handleViewDetails(order)}
                  >
                    View details
                  </button>
                  {['placed', 'preparing'].includes(order.status) && (
                    <button
                      type="button"
                      className="btn-link-order-action text-danger"
                      style={{ color: '#DC2626', marginLeft: 'auto', fontWeight: '600' }}
                      onClick={() => handleDirectCancelOrder(order)}
                    >
                      Cancel order
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal for Order Details if opened */}
      {selectedDetailOrder && (
        <div className="order-detail-modal-overlay" onClick={() => setSelectedDetailOrder(null)}>
          <div className="order-detail-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="order-detail-modal-header">
              <h3>Order Details (#{selectedDetailOrder.order_number || selectedDetailOrder.id})</h3>
              <button
                type="button"
                className="modal-close-icon-btn"
                onClick={() => setSelectedDetailOrder(null)}
              >
                ✕
              </button>
            </div>
            <div className="order-detail-modal-body">
              <p><strong>Order #:</strong> {selectedDetailOrder.order_number || selectedDetailOrder.id}</p>
              <p><strong>Total Amount:</strong> ₱{parseFloat(selectedDetailOrder.total_amount || 0).toFixed(2)}</p>
              <p><strong>Status:</strong> {selectedDetailOrder.status}</p>
              <p><strong>Delivery Location:</strong> {selectedDetailOrder.delivery_address || 'Bunawan, Agusan del Sur'}</p>
              <p><strong>Payment Method:</strong> {selectedDetailOrder.payment_method?.toUpperCase() || 'GCASH'}</p>
              <p><strong>Placed Date:</strong> {formatDateTimeSafe(selectedDetailOrder.placed_at)}</p>
              {selectedDetailOrder.order_items && selectedDetailOrder.order_items.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <strong>Items:</strong>
                  <ul>
                    {selectedDetailOrder.order_items.map((it, idx) => (
                      <li key={it.id || idx}>
                        {it.product_name} - {it.quantity} × ₱{parseFloat(it.unit_price || 0).toFixed(2)} = ₱{parseFloat(it.subtotal || (it.quantity * it.unit_price) || 0).toFixed(2)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="order-detail-modal-footer">
              <button
                type="button"
                className="btn-modal-close-primary"
                onClick={() => setSelectedDetailOrder(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerOrders;
