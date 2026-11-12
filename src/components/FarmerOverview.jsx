import React, { useState, useEffect } from 'react';
import { farmerAPI } from '../services/api';
import './FarmerPortal.css';

const formatDateSafe = (isoDate) => {
  if (!isoDate) return 'Today';
  try {
    return new Date(isoDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return 'Recent';
  }
};

const formatTimeSafe = (isoDate) => {
  if (!isoDate) return '';
  try {
    return new Date(isoDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const getDateRangeString = (filter) => {
  const end = new Date();
  const start = new Date();
  if (filter === '30days') {
    start.setDate(end.getDate() - 29);
  } else if (filter === 'thisMonth') {
    start.setDate(1);
  } else {
    start.setDate(end.getDate() - 6);
  }
  const startMonth = start.toLocaleDateString('en-US', { month: 'short' });
  const endMonth = end.toLocaleDateString('en-US', { month: 'short' });
  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()} – ${end.getDate()}, ${end.getFullYear()}`;
  }
  return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${end.getFullYear()}`;
};

function FarmerOverview({
  farmerName = 'Farmer',
  currentUser = null,
  setActiveTab = () => {},
  onNavigateOnboarding = null,
  handleUpdateStock = () => {},
  showToast = () => {}
}) {
  const isOnboarded = localStorage.getItem(`umahub_farmer_onboarded_${currentUser?.id || currentUser?.email || 'default'}`) === 'true';
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeOrders: 0,
    totalProducts: 0,
    lowStockAlerts: 0,
    rating: 5.0
  });

  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  const [salesFilter, setSalesFilter] = useState('7days');
  const [dateRangeString, setDateRangeString] = useState(() => getDateRangeString('7days'));

  const [todayFormatted] = useState(() =>
    new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  );

  const [past7Days] = useState(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      const heights = ['55%', '70%', '58%', '82%', '65%', '92%', '75%'];
      return { day: dayLabel, height: heights[i % heights.length] };
    });
  });

  useEffect(() => {
    let isMounted = true;

    // 1. Fetch real stats from Supabase
    farmerAPI.getOverview()
      .then((res) => {
        if (isMounted && res.data) {
          setStats((prev) => ({
            ...prev,
            totalRevenue: res.data.totalRevenue ?? 0,
            activeOrders: res.data.activeOrders ?? 0,
            totalProducts: res.data.totalProducts ?? 0,
            lowStockAlerts: res.data.lowStockAlerts ?? 0
          }));
        }
      })
      .catch(() => {});

    // 2. Fetch real low stock products from Supabase
    farmerAPI.getLowStockProducts()
      .then((res) => {
        if (isMounted && res.data) {
          setLowStockItems(res.data);
        }
      })
      .catch(() => {});

    // 3. Fetch real recent orders from Supabase
    farmerAPI.getOrders()
      .then((res) => {
        if (isMounted && res.data) {
          setRecentOrders(res.data.slice(0, 5));
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);
  return (
    <div className="dashboard-view-content">
      <div className="welcome-banner-row">
        <div className="welcome-text-col">
          <span className="today-date-text">{todayFormatted}</span>
          <h1 className="welcome-heading">Welcome back, {farmerName || 'Farmer'}</h1>
          <p className="welcome-sub">Here’s what’s happening with your farm today.</p>
        </div>

        <button
          type="button"
          className="add-new-product-btn"
          onClick={() => setActiveTab('add-product')}
        >
          <span>Add new product</span>
          <span className="plus-sign">+</span>
        </button>
      </div>

      {/* Onboarding & Verification Prompt Banner */}
      {!isOnboarded && (
        <div style={{
          backgroundColor: '#EFF6EC',
          border: '1.5px solid #C8DEC2',
          borderRadius: '16px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span style={{ fontSize: '28px' }}>🌾</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: '#17331B' }}>
                Complete your Farm Onboarding & Verification
              </div>
              <div style={{ fontSize: '12.5px', color: '#4B6349', marginTop: '2px' }}>
                Tell us about your farm, pin your location on the map, and submit your ID to earn your Verified Farmer badge.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              if (typeof onNavigateOnboarding === 'function') {
                onNavigateOnboarding();
              } else {
                setActiveTab('farmer-onboarding');
              }
            }}
            style={{
              backgroundColor: '#2D5A27',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '9999px',
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 8px rgba(45, 90, 39, 0.25)'
            }}
          >
            Complete Onboarding →
          </button>
        </div>
      )}

      {/* 4 Stats Cards */}
      <div className="dashboard-stats-grid">
        <div className="dash-stat-card">
          <div className="stat-card-icon icon-sales">💳</div>
          <div className="stat-card-details">
            <span className="stat-card-title">Total sales</span>
            <div className="stat-card-value">₱{stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <span className="stat-card-sub text-green">{stats.totalRevenue > 0 ? 'From completed orders' : 'No sales yet'}</span>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="stat-card-icon icon-orders">📄</div>
          <div className="stat-card-details">
            <span className="stat-card-title">New orders</span>
            <div className="stat-card-value">{stats.activeOrders}</div>
            <span className="stat-card-sub text-orange">{stats.activeOrders > 0 ? `${stats.activeOrders} active orders` : 'No active orders'}</span>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="stat-card-icon icon-products">📦</div>
          <div className="stat-card-details">
            <span className="stat-card-title">Products listed</span>
            <div className="stat-card-value">{stats.totalProducts}</div>
            <span className="stat-card-sub text-red">{stats.lowStockAlerts > 0 ? `${stats.lowStockAlerts} running low` : 'All stocked'}</span>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="stat-card-icon icon-rating">📊</div>
          <div className="stat-card-details">
            <span className="stat-card-title">Farm rating</span>
            <div className="stat-card-value">{stats.rating.toFixed(1)}</div>
            <span className="stat-card-sub text-muted">Verified Farm</span>
          </div>
        </div>
      </div>

      {/* Middle Row: Sales Overview & Low Stock */}
      <div className="dashboard-middle-grid">
        <div className="dash-card sales-overview-card">
          <div className="card-header-flex">
            <div className="card-title-group">
              <h2 className="card-main-title">Sales Overview</h2>
              <span className="card-sub-date">{dateRangeString}</span>
            </div>

            <div className="card-filter-dropdown">
              <select
                className="filter-select-pill"
                value={salesFilter}
                onChange={(e) => {
                  const val = e.target.value;
                  setSalesFilter(val);
                  setDateRangeString(getDateRangeString(val));
                  showToast(`Filtered sales: ${e.target.options[e.target.selectedIndex].text}`);
                }}
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="thisMonth">This Month</option>
              </select>
            </div>
          </div>

          <div className="sales-chart-wrapper">
            <div className="chart-y-axis">
              <span>20K</span>
              <span>15K</span>
              <span>10K</span>
              <span>5K</span>
              <span>0</span>
            </div>

            <div className="chart-bars-area">
              <div className="chart-gridline" style={{ bottom: '100%' }}></div>
              <div className="chart-gridline" style={{ bottom: '75%' }}></div>
              <div className="chart-gridline" style={{ bottom: '50%' }}></div>
              <div className="chart-gridline" style={{ bottom: '25%' }}></div>
              <div className="chart-gridline" style={{ bottom: '0%' }}></div>

              {past7Days.map((item, idx) => (
                <div key={idx} className="chart-bar-col">
                  <div
                    className="chart-bar"
                    style={{ height: item.height }}
                    title={`${item.day}: Est. Sales`}
                  ></div>
                  <span className="bar-x-label">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="dash-card low-stock-card">
          <div className="card-header-flex">
            <div className="alert-title-row">
              <span className="alert-warning-icon">⚠️</span>
              <h2 className="card-main-title">Low stock alerts</h2>
            </div>
            <button
              type="button"
              className="view-all-link"
              onClick={() => setActiveTab('inventory')}
            >
              View all →
            </button>
          </div>

          <div className="stock-items-list">
            {lowStockItems.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', color: '#6B7280', fontSize: '14px' }}>
                🌱 All inventory products are sufficiently stocked!
              </div>
            ) : (
              lowStockItems.map((item) => (
                <div key={item.id} className="stock-alert-row">
                  <img
                    src={item.image_url || '/image/gulay1.png'}
                    alt={item.name}
                    className="stock-item-thumb"
                    onError={(e) => { e.currentTarget.src = '/image/gulay1.png'; }}
                  />
                  <div className="stock-item-info">
                    <span className="stock-item-name">{item.name}</span>
                    <span className="stock-item-remaining">{item.stock_quantity || 0} {item.unit || 'kg'} remaining</span>
                  </div>
                  <button
                    type="button"
                    className="btn-stock-update"
                    onClick={() => handleUpdateStock(item)}
                  >
                    Update
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Orders Card */}
      <div className="dash-card recent-orders-card">
        <div className="card-header-flex">
          <div className="orders-title-group">
            <div className="orders-title-with-icon">
              <span className="orders-box-icon">📦</span>
              <h2 className="card-main-title">Recent Orders</h2>
            </div>
            <span className="card-sub-desc">View and track your latest orders</span>
          </div>

          <button
            type="button"
            className="view-all-orders-btn"
            onClick={() => setActiveTab('orders')}
          >
            View All Orders →
          </button>
        </div>

        <div className="orders-table-wrapper">
          <table className="orders-data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Item / Product</th>
                <th>Total Amount</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '36px 16px', color: '#6B7280', fontSize: '14px' }}>
                    📦 No orders placed yet. Real orders from customers will appear here automatically!
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => {
                  const itemsSummary = (order.order_items || [])
                    .map((i) => `${i.product_name} (${i.quantity})`)
                    .join(', ') || 'Fresh produce';
                  const dateStr = formatDateSafe(order.placed_at);
                  const timeStr = formatTimeSafe(order.placed_at);
                  return (
                    <tr key={order.id}>
                      <td>
                        <div className="table-order-id">{order.order_number || `#ORD-${order.id}`}</div>
                        <div className="table-order-date">{dateStr}</div>
                      </td>
                      <td className="table-customer-name">
                        {order.delivery_address ? order.delivery_address.split(',')[0] : 'Customer'}
                      </td>
                      <td>{itemsSummary}</td>
                      <td className="table-amount">₱{parseFloat(order.total_amount || 0).toFixed(2)}</td>
                      <td className="table-datetime">
                        <div>{dateStr}</div>
                        <div className="table-subtime">{timeStr}</div>
                      </td>
                      <td>
                        <span className={`status-badge ${order.status === 'completed' || order.status === 'delivered' ? 'badge-delivered' : 'badge-pending'}`}>
                          ● {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Placed'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FarmerOverview;
