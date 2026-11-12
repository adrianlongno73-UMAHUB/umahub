import React, { useState, useEffect } from 'react';
import { farmerAPI } from '../services/api';
import './FarmerPortal.css';

const formatDateSafe = (dateVal) => {
  if (!dateVal) return 'Recent';
  try {
    return new Date(dateVal).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Recent';
  }
};

function FarmerOrders({
  initialTab = 'New', // 'New' | 'Accepted' | 'Ready' | 'Completed' | 'Cancelled'
  initialModal = null, // null | 'select-reason' | 'confirm-decline' | 'notification-sent' | 'decline-success' | 'cancellation-request'
  showToast = () => {}
}) {
  const [orderFilterTab, setOrderFilterTab] = useState(
    initialModal === 'cancellation-request' ? 'Cancelled' : initialTab
  );

  const [ordersList, setOrdersList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Decline Order Modal Flow: null | 'select-reason' | 'confirm-decline' | 'notification-sent' | 'decline-success'
  const [declineModalStep, setDeclineModalStep] = useState(
    initialModal !== 'cancellation-request' ? initialModal : null
  );
  const [declineReason, setDeclineReason] = useState('Item has quality issue');
  const [declineNote, setDeclineNote] = useState('');

  // Cancellation Request Modal State
  const [openCancellationModal, setOpenCancellationModal] = useState(
    initialModal === 'cancellation-request'
  );

  const declineOptions = [
    'Item has quality issue',
    'Cannot deliver to this area',
    'Too many orders right now',
    'Other',
  ];

  const fetchOrders = () => {
    farmerAPI.getOrders()
      .then((res) => {
        if (res.data) setOrdersList(res.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getFilteredOrders = () => {
    if (orderFilterTab === 'New') {
      return ordersList.filter(o => ['placed', 'new'].includes(o.status));
    }
    if (orderFilterTab === 'Accepted') {
      return ordersList.filter(o => ['preparing', 'accepted'].includes(o.status));
    }
    if (orderFilterTab === 'Ready') {
      return ordersList.filter(o => ['ready_for_pickup', 'ready'].includes(o.status));
    }
    if (orderFilterTab === 'Completed') {
      return ordersList.filter(o => ['completed', 'delivered'].includes(o.status));
    }
    if (orderFilterTab === 'Cancelled') {
      return ordersList.filter(o => ['cancelled', 'declined'].includes(o.status));
    }
    return ordersList;
  };

  const filteredOrders = getFilteredOrders();
  const featuredOrder = filteredOrders[0] || null;
  const otherOrders = filteredOrders.slice(1);

  const newCount = ordersList.filter(o => ['placed', 'new'].includes(o.status)).length;
  const acceptedCount = ordersList.filter(o => ['preparing', 'accepted'].includes(o.status)).length;
  const readyCount = ordersList.filter(o => ['ready_for_pickup', 'ready'].includes(o.status)).length;
  const completedCount = ordersList.filter(o => ['completed', 'delivered'].includes(o.status)).length;
  const cancelledCount = ordersList.filter(o => ['cancelled', 'declined'].includes(o.status)).length;

  const handleAcceptOrder = (orderId) => {
    farmerAPI.updateOrderStatus(orderId, 'preparing')
      .then(() => {
        showToast(`Order #${featuredOrder?.order_number || orderId} Accepted! Buyer has been notified.`);
        fetchOrders();
      })
      .catch(() => showToast('Failed to accept order.'));
  };

  const handleUpdateStatus = (orderId, newStatus, statusLabel) => {
    farmerAPI.updateOrderStatus(orderId, newStatus)
      .then(() => {
        showToast(`Order status updated to "${statusLabel || newStatus}"!`);
        fetchOrders();
      })
      .catch(() => showToast('Failed to update order status.'));
  };

  const handleOpenDeclineModal = () => {
    setDeclineModalStep('select-reason');
  };

  const handleCloseDeclineModal = () => {
    setDeclineModalStep(null);
  };

  const handleSendNotification = () => {
    setDeclineModalStep('notification-sent');
    showToast(`Notification sent to customer.`);
  };

  const handleProceedToConfirmDecline = () => {
    setDeclineModalStep('confirm-decline');
  };

  const handleConfirmDeclineFinal = () => {
    if (!featuredOrder) return;
    farmerAPI.declineOrder(featuredOrder.id, declineReason, declineNote)
      .then(() => {
        setDeclineModalStep('decline-success');
        showToast(`Order #${featuredOrder.order_number || featuredOrder.id} has been declined.`);
        fetchOrders();
      })
      .catch(() => showToast('Failed to decline order.'));
  };

  const handleNotificationViewOrder = () => {
    setDeclineModalStep(null);
    showToast(`Viewing Order #${featuredOrder?.order_number || featuredOrder?.id}`);
  };

  const handleSuccessBackToOrders = () => {
    setDeclineModalStep(null);
    setOrderFilterTab('Cancelled');
  };

  return (
    <div className="orders-view-content">
      <div className="orders-header-row">
        <span className="section-super-tag">FULFILLMENT</span>
        <h1 className="orders-main-title">Incoming Orders</h1>
        <p className="orders-sub-desc">Review and prepare orders from your customers.</p>
      </div>

      {/* Filter Tabs Card */}
      <div className="orders-tabs-card">
        <button
          type="button"
          className={`order-tab-item ${orderFilterTab === 'New' ? 'active' : ''}`}
          onClick={() => setOrderFilterTab('New')}
        >
          <span>New</span>
          <span className="order-tab-badge">{newCount}</span>
        </button>
        <button
          type="button"
          className={`order-tab-item ${orderFilterTab === 'Accepted' ? 'active' : ''}`}
          onClick={() => setOrderFilterTab('Accepted')}
        >
          <span>Accepted</span>
          {acceptedCount > 0 && <span className="order-tab-badge">{acceptedCount}</span>}
        </button>
        <button
          type="button"
          className={`order-tab-item ${orderFilterTab === 'Ready' ? 'active' : ''}`}
          onClick={() => setOrderFilterTab('Ready')}
        >
          <span>Ready</span>
          {readyCount > 0 && <span className="order-tab-badge">{readyCount}</span>}
        </button>
        <button
          type="button"
          className={`order-tab-item ${orderFilterTab === 'Completed' ? 'active' : ''}`}
          onClick={() => setOrderFilterTab('Completed')}
        >
          <span>Completed</span>
          {completedCount > 0 && <span className="order-tab-badge">{completedCount}</span>}
        </button>
        <button
          type="button"
          className={`order-tab-item text-red-tab ${orderFilterTab === 'Cancelled' ? 'active' : ''}`}
          onClick={() => setOrderFilterTab('Cancelled')}
        >
          <span>Cancelled</span>
          {cancelledCount > 0 && <span className="order-tab-badge">{cancelledCount}</span>}
        </button>
      </div>

      {loading ? (
        <div className="dash-card" style={{ textAlign: 'center', padding: '48px 24px', color: '#6B7280' }}>
          Loading real orders from database...
        </div>
      ) : !featuredOrder ? (
        <div className="dash-card" style={{ textAlign: 'center', padding: '56px 24px', color: '#6B7280' }}>
          <div style={{ fontSize: '42px', marginBottom: '12px' }}>📦</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#17331b', marginBottom: '8px' }}>
            No {orderFilterTab} orders found
          </h3>
          <p style={{ fontSize: '14px', maxWidth: '420px', margin: '0 auto' }}>
            Orders placed by customers in this category will appear here in real-time.
          </p>
        </div>
      ) : (
        <>
          {/* Featured Order Card */}
          <div className="dash-card featured-order-card">
            {orderFilterTab === 'Cancelled' && (
              <div className="cancelled-top-pill-badge">Cancelled</div>
            )}

            <div className="featured-order-top">
              <div className="featured-order-left">
                <span className="featured-order-tag">
                  ORDER #{featuredOrder.order_number || featuredOrder.id} · {formatDateSafe(featuredOrder.placed_at)}
                </span>
                <h2 className="featured-customer-name">
                  {featuredOrder.delivery_address ? featuredOrder.delivery_address.split(',')[0] : 'Customer Order'}
                </h2>
                <span className="featured-delivery-addr">
                  {featuredOrder.fulfillment_type === 'pickup' ? 'Store Pickup' : `Delivery to: ${featuredOrder.delivery_address || 'Bunawan, Agusan del Sur'}`}
                </span>
              </div>

              <div className="featured-order-right">
                <span className="order-total-label">ORDER TOTAL</span>
                <div className="order-total-val">₱{parseFloat(featuredOrder.total_amount || 0).toFixed(2)}</div>
              </div>
            </div>

            {/* Order items preview row */}
            <div className="featured-items-grid">
              {(featuredOrder.order_items && featuredOrder.order_items.length > 0) ? (
                featuredOrder.order_items.map((item, idx) => (
                  <div key={item.id || idx} className="featured-item-box">
                    <img
                      src={item.image_url || item.products?.image_url || "/image/gulay1.png"}
                      alt={item.product_name}
                      className="featured-item-thumb"
                    />
                    <div className="featured-item-info">
                      <span className="featured-item-name">{item.product_name}</span>
                      <span className="featured-item-sub">{item.quantity} × ₱{parseFloat(item.unit_price || 0).toFixed(2)}</span>
                    </div>
                    <span className="featured-item-price">₱{parseFloat(item.subtotal || (item.quantity * item.unit_price) || 0).toFixed(2)}</span>
                  </div>
                ))
              ) : (
                <div style={{ color: '#6B7280', fontSize: '14px', padding: '8px 0' }}>Fresh local produce package</div>
              )}
            </div>

            {/* Bottom Actions based on tab */}
            {orderFilterTab === 'Cancelled' ? (
              <div className="cancelled-order-bottom-bar">
                <span className="cancelled-reason-text">
                  Reason: {featuredOrder.decline_reason || featuredOrder.cancellation_reason || 'Order cancelled'}
                </span>
                <span className="cancelled-refund-text">
                  Total: ₱{parseFloat(featuredOrder.total_amount || 0).toFixed(2)}
                </span>
              </div>
            ) : (
              <div className="featured-order-bottom">
                <span className="respond-deadline-text">Status: <strong>{featuredOrder.status}</strong></span>
                <div className="featured-action-btns">
                  {['placed', 'new'].includes(featuredOrder.status) && (
                    <>
                      <button
                        type="button"
                        className="btn-decline-order"
                        onClick={handleOpenDeclineModal}
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        className="btn-accept-order"
                        onClick={() => handleAcceptOrder(featuredOrder.id)}
                      >
                        Accept order ✓
                      </button>
                    </>
                  )}
                  {['preparing', 'accepted'].includes(featuredOrder.status) && (
                    <button
                      type="button"
                      className="btn-accept-order"
                      onClick={() => handleUpdateStatus(featuredOrder.id, 'ready_for_pickup', 'Ready for Pickup')}
                    >
                      Ready for Pickup 📦
                    </button>
                  )}
                  {['ready_for_pickup', 'ready'].includes(featuredOrder.status) && (
                    <button
                      type="button"
                      className="btn-accept-order"
                      onClick={() => handleUpdateStatus(featuredOrder.id, 'completed', 'Completed')}
                    >
                      Mark as Completed ✓
                    </button>
                  )}
                  {['completed', 'delivered'].includes(featuredOrder.status) && (
                    <span className="status-badge badge-delivered">
                      ● COMPLETED
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Other Orders Table Card */}
          {otherOrders.length > 0 && (
            <div className="dash-card other-orders-card">
              <h3 className="other-orders-title">Other orders ({otherOrders.length})</h3>

              <div className="table-responsive-wrapper">
                <table className="orders-data-table">
                  <thead>
                    <tr>
                      <th>ORDER</th>
                      <th>CUSTOMER / DESTINATION</th>
                      <th>TOTAL</th>
                      <th>STATUS</th>
                      <th>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {otherOrders.map((o) => (
                      <tr key={o.id}>
                        <td>
                          <div className="table-order-id">#{o.order_number || o.id}</div>
                          <div className="table-order-date">
                            {formatDateSafe(o.placed_at)}
                          </div>
                        </td>
                        <td className="table-customer-name">
                          {o.delivery_address || 'Customer'}
                        </td>
                        <td className="table-amount">₱{parseFloat(o.total_amount || 0).toFixed(2)}</td>
                        <td>
                          <span className={`status-badge ${o.status === 'completed' ? 'badge-delivered' : 'badge-pending'}`}>
                            {o.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {['placed', 'new'].includes(o.status) && (
                              <button
                                type="button"
                                className="action-icon-btn"
                                title="Accept order"
                                onClick={() => handleAcceptOrder(o.id)}
                              >
                                ✓
                              </button>
                            )}
                            {['preparing', 'accepted'].includes(o.status) && (
                              <button
                                type="button"
                                className="action-icon-btn"
                                title="Ready for pickup"
                                onClick={() => handleUpdateStatus(o.id, 'ready_for_pickup', 'Ready for Pickup')}
                              >
                                📦
                              </button>
                            )}
                            {['ready_for_pickup', 'ready'].includes(o.status) && (
                              <button
                                type="button"
                                className="action-icon-btn"
                                title="Mark as completed"
                                onClick={() => handleUpdateStatus(o.id, 'completed', 'Completed')}
                              >
                                ✓
                              </button>
                            )}
                            <button
                              type="button"
                              className="view-order-link-btn"
                              onClick={() => showToast(`Order #${o.order_number || o.id}: Total ₱${parseFloat(o.total_amount || 0).toFixed(2)}`)}
                            >
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* ==============================================================
          DECLINE ORDER MODAL POPUPS (Screens 1 to 4)
         ============================================================== */}
      {declineModalStep && (
        <div
          className="modal-backdrop-overlay"
          onClick={(e) => {
            if (e.target.classList.contains('modal-backdrop-overlay')) {
              handleCloseDeclineModal();
            }
          }}
        >
          {/* STEP 1: Farmer - Decline Order */}
          {declineModalStep === 'select-reason' && (
            <div className="decline-modal-dialog">
              <h2 className="decline-modal-title">Decline this order?</h2>
              <p className="decline-modal-sub">
                The buyer will be notified. Choose a reason so they know what happened.
              </p>

              <div className="decline-reasons-list">
                {declineOptions.map((opt) => (
                  <label
                    key={opt}
                    className={`decline-reason-item ${declineReason === opt ? 'selected' : ''}`}
                    onClick={() => setDeclineReason(opt)}
                  >
                    <div className="custom-radio-circle">
                      {declineReason === opt && <div className="custom-radio-inner-dot"></div>}
                    </div>
                    <span className="decline-reason-label">{opt}</span>
                  </label>
                ))}
              </div>

              <input
                type="text"
                className="decline-note-input"
                placeholder="Add a note (optional)"
                value={declineNote}
                onChange={(e) => setDeclineNote(e.target.value)}
              />

              <div className="decline-actions-row">
                <button
                  type="button"
                  className="btn-modal-keep"
                  onClick={handleCloseDeclineModal}
                >
                  Keep order
                </button>
                <button
                  type="button"
                  className="btn-modal-notify"
                  onClick={handleSendNotification}
                >
                  Send notification
                </button>
                <button
                  type="button"
                  className="btn-modal-decline"
                  onClick={handleProceedToConfirmDecline}
                >
                  Decline order
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Farmer - Confirm decline */}
          {declineModalStep === 'confirm-decline' && (
            <div className="decline-modal-dialog confirm-decline-dialog">
              <h2 className="decline-modal-title">Confirm decline?</h2>
              <p className="confirm-decline-desc">
                Order #UH-24037 for Paolo Reyes (₱480.00) will be declined for: {declineReason}.
              </p>
              <p className="confirm-decline-sub">
                The customer will be refunded in full. This can’t be undone.
              </p>

              <div className="confirm-decline-actions">
                <button
                  type="button"
                  className="btn-modal-goback"
                  onClick={() => setDeclineModalStep('select-reason')}
                >
                  Go back
                </button>
                <button
                  type="button"
                  className="btn-modal-yes-decline"
                  onClick={handleConfirmDeclineFinal}
                >
                  Yes, decline
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Farmer - Notification sent */}
          {declineModalStep === 'notification-sent' && (
            <div className="decline-modal-dialog notification-sent-dialog">
              <button
                type="button"
                className="modal-close-x-btn"
                onClick={handleCloseDeclineModal}
                aria-label="Close"
              >
                ✕
              </button>

              <div className="modal-status-icon-circle mint-arrow-circle">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#1c4b27" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="modal-status-svg">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>

              <h2 className="modal-centered-title">Notification sent!</h2>
              <p className="modal-centered-desc">
                The customer has been notified about the issue. The order will remain pending until the customer responds.
              </p>

              <div className="next-steps-callout-card">
                <div className="next-steps-header">
                  <span className="next-steps-info-icon">i</span>
                  <span className="next-steps-title">What happens next?</span>
                </div>
                <ul className="next-steps-bullet-list">
                  <li>The customer will receive a notification.</li>
                  <li>The order will stay pending.</li>
                  <li>You can still decline the order later if needed.</li>
                </ul>
              </div>

              <button
                type="button"
                className="btn-modal-full-green"
                onClick={handleNotificationViewOrder}
              >
                View Order
              </button>
            </div>
          )}

          {/* STEP 4: Incoming orders - Decline success */}
          {declineModalStep === 'decline-success' && (
            <div className="decline-modal-dialog decline-success-dialog">
              <div className="modal-status-icon-circle mint-check-circle">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#1c4b27" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="modal-status-svg">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>

              <h2 className="modal-centered-title">Order declined successfully</h2>
              <p className="modal-centered-desc">
                Paolo Reyes has been notified and refunded ₱480.00.
              </p>

              <div className="decline-summary-card">
                <div className="summary-detail-row">
                  <span className="summary-label">Order</span>
                  <span className="summary-val">#UH-24037</span>
                </div>
                <div className="summary-detail-row">
                  <span className="summary-label">Reason</span>
                  <span className="summary-val">{declineReason}</span>
                </div>
                <div className="summary-detail-row">
                  <span className="summary-label">Refund</span>
                  <span className="summary-val bold-green">₱480.00 to customer</span>
                </div>
              </div>

              <button
                type="button"
                className="btn-modal-full-green"
                onClick={handleSuccessBackToOrders}
              >
                Back to orders
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==============================================================
          CANCELLATION REQUEST MODAL (media_1793164382158_972ecc13.png)
         ============================================================== */}
      {openCancellationModal && (
        <div
          className="modal-backdrop-overlay"
          onClick={(e) => {
            if (e.target.classList.contains('modal-backdrop-overlay')) {
              setOpenCancellationModal(false);
            }
          }}
        >
          <div className="decline-modal-dialog cancellation-request-dialog">
            <div className="cancellation-modal-top-row">
              <h2 className="cancellation-modal-title">Cancellation request</h2>
              <span className="cancellation-timer-badge">Respond in 1:45</span>
            </div>

            <div className="cancellation-order-subline">
              #UH-24037 · Paolo Reyes · ₱480.00
            </div>

            <div className="cancellation-reason-box">
              <span className="cancellation-reason-label">Reason from customer</span>
              <div className="cancellation-reason-value">Changed my mind</div>
            </div>

            <p className="cancellation-explanation-p">
              If you accept, the order is cancelled and the customer gets a full refund.
              If you reject, the order continues to preparation. If there's no response
              in time, UmaHub support reviews the request.
            </p>

            <div className="cancellation-actions-row">
              <button
                type="button"
                className="btn-cancellation-reject"
                onClick={() => {
                  setOpenCancellationModal(false);
                  showToast('Cancellation request rejected. Order remains active for preparation.');
                }}
              >
                Reject request
              </button>
              <button
                type="button"
                className="btn-cancellation-accept"
                onClick={() => {
                  setOpenCancellationModal(false);
                  setFeaturedOrderStatus('Cancelled');
                  showToast('Cancellation accepted. Order #UH-24037 cancelled and refunded.');
                }}
              >
                Accept cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FarmerOrders;
