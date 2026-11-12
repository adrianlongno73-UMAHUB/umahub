import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

function AdminOrders({
  initialFilter = 'all',
  onOpenOrderModal = () => {},
  showToast = () => {}
}) {
  const [orders, setOrders] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [disputesCount, setDisputesCount] = useState(2);
  const [activeTab, setActiveTab] = useState(initialFilter || 'all');
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const loadOrders = async () => {
    try {
      const res = await adminAPI.getOrders({
        statusFilter: activeTab,
        page,
        limit: pageSize
      });

      if (res.success) {
        setOrders(res.data || []);
        setTotalCount(typeof res.count === 'number' ? res.count : (res.data?.length || 0));
      }

      // Check dispute count
      const dispRes = await adminAPI.getOrders({ statusFilter: 'disputed' });
      if (dispRes.success) {
        setDisputesCount(dispRes.count || 0);
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    }
  };

  const getPaginationPages = () => {
    if (totalPages <= 1) return [1];

    if (totalPages <= 5) {
      const pages = [];
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    if (page <= 3) {
      return [1, 2, 3, '...', totalPages];
    } else if (page >= totalPages - 2) {
      return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    } else {
      return [1, '...', page - 1, page, page + 1, '...', totalPages];
    }
  };

  useEffect(() => {
    loadOrders();
  }, [activeTab, page]);

  const handleExportCSV = async () => {
    try {
      showToast('Generating Orders CSV export...');
      await adminAPI.exportOrdersCSV();
      showToast('Orders CSV downloaded successfully!');
    } catch {
      showToast('Failed to export orders CSV.');
    }
  };

  return (
    <div className="admin-page-content">
      {/* Header Row */}
      <div className="admin-page-header-row">
        <div>
          <div className="admin-section-tag">MARKETPLACE ACTIVITY</div>
          <h1 className="admin-main-title">All Orders</h1>
          <p className="admin-sub-title">
            Monitor transactions, fulfillment, commissions, and disputes.
          </p>
        </div>

        <button
          type="button"
          className="admin-secondary-btn"
          onClick={handleExportCSV}
        >
          <span>Export CSV</span>
        </button>
      </div>

      {/* Tabs Row */}
      <div className="admin-tabs-nav-bar">
        <button
          type="button"
          className={`admin-tab-item ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => { setActiveTab('all'); setPage(1); }}
        >
          All
        </button>

        <button
          type="button"
          className={`admin-tab-item ${activeTab === 'in_progress' ? 'active' : ''}`}
          onClick={() => { setActiveTab('in_progress'); setPage(1); }}
        >
          In progress
        </button>

        <button
          type="button"
          className={`admin-tab-item ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => { setActiveTab('completed'); setPage(1); }}
        >
          Completed
        </button>

        <button
          type="button"
          className={`admin-tab-item ${activeTab === 'disputed' ? 'active' : ''}`}
          onClick={() => { setActiveTab('disputed'); setPage(1); }}
        >
          <span>Disputed</span>
          {disputesCount > 0 && (
            <span className="admin-tab-pill-badge">{disputesCount}</span>
          )}
        </button>

        <button
          type="button"
          className={`admin-tab-item ${activeTab === 'cancelled' ? 'active' : ''}`}
          onClick={() => { setActiveTab('cancelled'); setPage(1); }}
        >
          Cancelled
        </button>
      </div>

      {/* Orders Table */}
      <div className="admin-card admin-table-card">
        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ORDER</th>
                <th>CUSTOMER</th>
                <th>FARMER</th>
                <th>TOTAL</th>
                <th>COMMISSION</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => {
                  const statusKey = (order.status || 'preparing').toLowerCase();
                  const statusLabel = order.status
                    ? (order.status.charAt(0).toUpperCase() + order.status.slice(1).replace(/_/g, ' '))
                    : 'Preparing';

                  return (
                    <tr key={order.id || order.order_number}>
                      {/* ORDER: ID + Date */}
                      <td>
                        <div className="admin-order-id-cell">
                          <span className="admin-order-num">
                            #{order.order_number?.replace(/^#/, '')}
                          </span>
                          <span className="admin-order-date">
                            {order.date || 'Mar 18, 2026'}
                          </span>
                        </div>
                      </td>

                      {/* CUSTOMER */}
                      <td>
                        <span className="admin-customer-name">{order.customer}</span>
                      </td>

                      {/* FARMER: Green text link */}
                      <td>
                        <span className="admin-farmer-link">{order.farmer}</span>
                      </td>

                      {/* TOTAL */}
                      <td>
                        <span className="admin-total-val">
                          ₱{Number(order.total_amount).toFixed(2)}
                        </span>
                      </td>

                      {/* COMMISSION */}
                      <td>
                        <span className="admin-commission-val">
                          ₱{Number(order.commission_amount).toFixed(2)}
                        </span>
                      </td>

                      {/* STATUS */}
                      <td>
                        <span className={`admin-status-pill status-${statusKey}`}>
                          {statusLabel}
                        </span>
                      </td>

                      {/* ACTION: Review link */}
                      <td>
                        <button
                          type="button"
                          className="admin-action-link link-review"
                          onClick={() => onOpenOrderModal(order)}
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-muted">
                    No orders found in this category.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Dynamic Pagination */}
        <div className="admin-table-footer">
          <span className="admin-table-count">
            Showing {orders.length} of {totalCount.toLocaleString()} orders
          </span>

          <div className="admin-pagination">
            <button
              type="button"
              className="admin-page-nav-btn"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              title="Previous page"
            >
              ‹
            </button>

            {getPaginationPages().map((p, idx) => {
              if (p === '...') {
                return (
                  <span key={`dots-${idx}`} className="admin-page-dots">
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={p}
                  type="button"
                  className={`admin-page-num-btn ${page === p ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              );
            })}

            <button
              type="button"
              className="admin-page-nav-btn"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              title="Next page"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOrders;
