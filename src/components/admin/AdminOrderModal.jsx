import React, { useState } from 'react';
import { adminAPI } from '../../services/api';

function AdminOrderModal({
  order,
  isOpen,
  onClose,
  onSuccess,
  showToast
}) {
  const [newStatus, setNewStatus] = useState(order?.status || 'preparing');
  const [adminNotes, setAdminNotes] = useState(order?.dispute_notes || '');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const isDisputed = order.status === 'disputed';

  const handleUpdate = async () => {
    try {
      setSubmitting(true);
      await adminAPI.updateOrderStatus(order.id || order.order_number, newStatus, adminNotes);
      showToast(`Order #${order.order_number?.replace(/^#/, '')} status updated to ${newStatus}!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      showToast('Failed to update order.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveDispute = async (resolution) => {
    try {
      setSubmitting(true);
      await adminAPI.resolveDispute(order.id || order.order_number, resolution, adminNotes || 'Resolved by Administrator');
      showToast(`Dispute resolved! Order status changed to ${resolution}.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch {
      showToast('Failed to resolve dispute.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal-card large" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div>
            <h2 className="admin-modal-title">
              Order #{order.order_number?.replace(/^#/, '')}
            </h2>
            <span className="admin-modal-sub">
              Placed on {order.date || 'Mar 18, 2026'}
            </span>
          </div>
          <button type="button" className="admin-modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="admin-modal-body">
          {/* Dispute Alert Box */}
          {isDisputed && (
            <div className="admin-dispute-alert-box">
              <div className="admin-dispute-alert-title">
                ⚠️ Order Under Dispute
              </div>
              <div className="admin-dispute-alert-desc">
                <strong>Reason:</strong> {order.dispute_reason || 'Delayed courier arrival & damaged produce packaging.'}
              </div>
              {order.dispute_notes && (
                <div className="admin-dispute-alert-notes">
                  <strong>Notes:</strong> {order.dispute_notes}
                </div>
              )}
            </div>
          )}

          {/* Customer & Farmer Grid */}
          <div className="admin-review-details-grid">
            <div className="admin-review-item">
              <span className="admin-review-label">Customer</span>
              <span className="admin-review-val font-semibold">{order.customer}</span>
              {order.customer_email && (
                <span className="text-muted text-xs">{order.customer_email}</span>
              )}
            </div>

            <div className="admin-review-item">
              <span className="admin-review-label">Farmer / Producer</span>
              <span className="admin-review-val text-green font-semibold">{order.farmer}</span>
            </div>

            <div className="admin-review-item">
              <span className="admin-review-label">Fulfillment Method</span>
              <span className="admin-review-val capitalize">{order.fulfillment_type || 'Delivery'}</span>
            </div>

            <div className="admin-review-item">
              <span className="admin-review-label">Payment Method</span>
              <span className="admin-review-val uppercase">{order.payment_method || 'GCash'}</span>
            </div>

            <div className="admin-review-item col-span-2">
              <span className="admin-review-label">Delivery Address</span>
              <span className="admin-review-val">{order.delivery_address || 'Purok 2, San Teodoro, Bunawan, Agusan del Sur'}</span>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="admin-order-items-section mt-4">
            <h4 className="admin-section-subtitle">Ordered Items</h4>
            <table className="admin-mini-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items && order.items.length > 0 ? (
                  order.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="font-semibold">{item.product_name || item.name || 'Fresh Produce'}</td>
                      <td>{item.quantity}</td>
                      <td>₱{Number(item.unit_price || item.price || 0).toFixed(2)}</td>
                      <td className="font-semibold">₱{Number(item.subtotal || ((item.unit_price || item.price || 0) * (item.quantity || 1))).toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="font-semibold">Produce Items</td>
                    <td>1</td>
                    <td>₱{Number(order.total_amount).toFixed(2)}</td>
                    <td className="font-semibold">₱{Number(order.total_amount).toFixed(2)}</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="admin-order-summary-box">
              <div className="admin-summary-row">
                <span>Order Total</span>
                <span className="font-bold text-lg">₱{Number(order.total_amount).toFixed(2)}</span>
              </div>
              <div className="admin-summary-row text-muted text-sm">
                <span>Platform Commission</span>
                <span>₱{Number(order.commission_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Status Update Form */}
          <div className="admin-status-update-box mt-6">
            <label className="admin-input-label">Update Order Status</label>
            <div className="admin-status-select-row">
              <select
                className="admin-select-pill flex-1"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="preparing">Preparing</option>
                <option value="ready_for_pickup">Ready for pickup</option>
                <option value="out_for_delivery">Out for delivery</option>
                <option value="completed">Completed</option>
                <option value="disputed">Disputed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              <button
                type="button"
                className="admin-secondary-btn"
                disabled={submitting}
                onClick={handleUpdate}
              >
                {submitting ? 'Updating...' : 'Update Status'}
              </button>
            </div>

            <div className="mt-3">
              <label className="admin-input-label">Resolution / Admin Notes</label>
              <input
                type="text"
                className="admin-form-input text-xs"
                placeholder="Optional resolution notes or reason for status update..."
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>

            {isDisputed && (
              <div className="admin-dispute-actions-row mt-4">
                <button
                  type="button"
                  className="admin-reject-btn"
                  disabled={submitting}
                  onClick={() => handleResolveDispute('cancelled')}
                >
                  Cancel & Issue Refund
                </button>
                <button
                  type="button"
                  className="admin-approve-btn"
                  disabled={submitting}
                  onClick={() => handleResolveDispute('completed')}
                >
                  Resolve & Mark Completed ✓
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrderModal;
