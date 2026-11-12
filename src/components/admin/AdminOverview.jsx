import React, { useState } from 'react';

function AdminOverview({
  stats = {},
  adminName = 'Aike',
  onNavigate = () => {},
  onDownloadReport = () => {}
}) {
  const [chartRange, setChartRange] = useState('7days');
  const [activeTooltip, setActiveTooltip] = useState(null);

  // Time-based Filipino greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Magandang umaga';
    if (hour >= 12 && hour < 18) return 'Magandang hapon';
    return 'Magandang gabi';
  };

  const firstName = adminName ? adminName.split(' ')[0] : 'Aike';
  const currentDate = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Safe numbers with formatters
  const grossSales = stats.grossSales || 482650;
  const systemCommission = stats.systemCommission || 24132;
  const netPlatformIncome = stats.netPlatformIncome || 21476.50;
  const paymentCosts = stats.paymentAndSupportCosts || 2656.00;
  const weeklyIncome = stats.weeklyCommission || 8440;
  const ytdIncome = stats.ytdCommission || 68925;
  const totalUsers = stats.totalUsers || 1284;
  const buyersCount = stats.customersCount || 1196;
  const farmersCount = stats.farmersCount || 88;
  const completedOrders = stats.completedOrders || 2418;
  const fulfillmentRate = stats.fulfillmentRate || 96.2;
  const pendingListings = stats.pendingListingsCount !== undefined ? stats.pendingListingsCount : 3;
  const pendingFarmers = stats.pendingFarmerCount !== undefined ? stats.pendingFarmerCount : 5;
  const disputesCount = stats.disputesCount !== undefined ? stats.disputesCount : 2;
  const recentOrders = stats.recentOrders || [];

  const breakdownBars = stats.sevenDaysBreakdown || [
    { day: 'Wed', amount: 2650 },
    { day: 'Thu', amount: 3860 },
    { day: 'Fri', amount: 3140 },
    { day: 'Sat', amount: 4350 },
    { day: 'Sun', amount: 3620 },
    { day: 'Mon', amount: 4580 },
    { day: 'Tue', amount: 4100, isToday: true }
  ];

  const maxBarAmount = Math.max(...breakdownBars.map(b => b.amount), 1);

  const formatPHP = (num) => {
    return '₱' + Number(num).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const formatPHPDecimal = (num) => {
    return '₱' + Number(num).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="admin-page-content">
      {/* Page Header */}
      <div className="admin-page-header-row">
        <div>
          <div className="admin-section-tag">
            PLATFORM OVERVIEW • {currentDate.toUpperCase()}
          </div>
          <h1 className="admin-main-title">
            {getGreeting()}, {firstName}!
          </h1>
          <p className="admin-sub-title">
            Here's how the UmaHub marketplace is performing today.
          </p>
        </div>

        <button
          type="button"
          className="admin-secondary-btn"
          onClick={onDownloadReport}
        >
          <span>Download report</span>
        </button>
      </div>

      {/* 4 Primary Stat Cards */}
      <div className="admin-stats-grid-4">
        <div className="admin-stat-card">
          <span className="admin-stat-label">Gross marketplace sales</span>
          <span className="admin-stat-value">{formatPHP(grossSales)}</span>
          <span className="admin-stat-sub text-green">+18.4% vs last month</span>
        </div>

        <div className="admin-stat-card">
          <span className="admin-stat-label">System commission</span>
          <span className="admin-stat-value">{formatPHP(systemCommission)}</span>
          <span className="admin-stat-sub">{stats.commissionRate || 5}% average commission</span>
        </div>

        <div className="admin-stat-card">
          <span className="admin-stat-label">Total users</span>
          <span className="admin-stat-value">{totalUsers.toLocaleString()}</span>
          <span className="admin-stat-sub">{buyersCount.toLocaleString()} buyers • {farmersCount} farmers</span>
        </div>

        <div className="admin-stat-card">
          <span className="admin-stat-label">Completed orders</span>
          <span className="admin-stat-value">{completedOrders.toLocaleString()}</span>
          <span className="admin-stat-sub">{fulfillmentRate}% fulfillment rate</span>
        </div>
      </div>

      {/* Net Platform Income Banner Card */}
      <div className="admin-net-income-banner">
        <div className="admin-net-income-left">
          <span className="admin-net-income-label">NET PLATFORM INCOME</span>
          <div className="admin-net-income-amount">{formatPHPDecimal(netPlatformIncome)}</div>
          <div className="admin-net-income-breakdown">
            {formatPHPDecimal(systemCommission)} commission - {formatPHPDecimal(paymentCosts)} payment and support costs
          </div>
        </div>

        <div className="admin-net-income-right">
          <div className="admin-net-stat-col">
            <span className="admin-net-stat-num">{formatPHP(weeklyIncome)}</span>
            <span className="admin-net-stat-desc">This week</span>
          </div>
          <div className="admin-net-stat-col">
            <span className="admin-net-stat-num">{formatPHP(ytdIncome)}</span>
            <span className="admin-net-stat-desc">Year to date</span>
          </div>
        </div>
      </div>

      {/* 2 Column Section: Chart + Needs Attention */}
      <div className="admin-two-col-grid">
        {/* Commission Income Chart */}
        <div className="admin-card admin-chart-card">
          <div className="admin-card-header-row">
            <div>
              <h2 className="admin-card-title">Commission income</h2>
              <span className="admin-card-subtitle">March 12–18, 2026</span>
            </div>
            <select
              className="admin-select-pill"
              value={chartRange}
              onChange={(e) => setChartRange(e.target.value)}
            >
              <option value="7days">Last 7 days</option>
              <option value="30days">Last 30 days</option>
            </select>
          </div>

          <div className="admin-barchart-container">
            <div className="admin-bars-wrapper">
              {breakdownBars.map((item, idx) => {
                const heightPercent = Math.max(18, Math.round((item.amount / maxBarAmount) * 100));
                return (
                  <div
                    key={idx}
                    className="admin-bar-col"
                    onMouseEnter={() => setActiveTooltip(idx)}
                    onMouseLeave={() => setActiveTooltip(null)}
                  >
                    {activeTooltip === idx && (
                      <div className="admin-bar-tooltip">
                        ₱{item.amount.toLocaleString()}
                      </div>
                    )}
                    <div className="admin-bar-track">
                      <div
                        className={`admin-bar-fill ${item.isToday ? 'active-today' : ''}`}
                        style={{ height: `${heightPercent}%` }}
                      ></div>
                    </div>
                    <span className="admin-bar-day-label">{item.day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Needs Attention Card */}
        <div className="admin-card admin-attention-card">
          <h2 className="admin-card-title">Needs attention</h2>
          <div className="admin-attention-list">
            <div
              className="admin-attention-row"
              onClick={() => onNavigate('listings', 'pending')}
            >
              <div className="admin-attention-text">
                <span className="admin-attention-headline">{pendingListings} listings</span>
                <span className="admin-attention-sub">Waiting for approval</span>
              </div>
              <span className="admin-chevron-arrow">›</span>
            </div>

            <div
              className="admin-attention-row"
              onClick={() => onNavigate('users', 'pending')}
            >
              <div className="admin-attention-text">
                <span className="admin-attention-headline">{pendingFarmers} farmer accounts</span>
                <span className="admin-attention-sub">Pending verification</span>
              </div>
              <span className="admin-chevron-arrow">›</span>
            </div>

            <div
              className="admin-attention-row"
              onClick={() => onNavigate('orders', 'disputed')}
            >
              <div className="admin-attention-text">
                <span className="admin-attention-headline">{disputesCount} order disputes</span>
                <span className="admin-attention-sub">Require admin review</span>
              </div>
              <span className="admin-chevron-arrow">›</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Platform Activity */}
      <div className="admin-card admin-table-card">
        <div className="admin-card-header-row">
          <h2 className="admin-card-title">Recent platform activity</h2>
          <button
            type="button"
            className="admin-link-btn"
            onClick={() => onNavigate('orders', 'all')}
          >
            View all orders →
          </button>
        </div>

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
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? (
                recentOrders.map((order, idx) => (
                  <tr key={order.id || idx}>
                    <td className="font-semibold text-dark">
                      #{order.order_number?.replace(/^#/, '')}
                    </td>
                    <td>{order.customer}</td>
                    <td>{order.farmer}</td>
                    <td className="font-semibold">
                      ₱{Number(order.total_amount).toFixed(2)}
                    </td>
                    <td className="text-muted">
                      ₱{Number(order.commission_amount).toFixed(2)}
                    </td>
                    <td>
                      <span className={`admin-status-pill status-${order.status?.toLowerCase()}`}>
                        {order.status ? (order.status.charAt(0).toUpperCase() + order.status.slice(1).replace(/_/g, ' ')) : 'Preparing'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-6 text-muted">
                    No recent orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;
