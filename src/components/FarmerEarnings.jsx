import React, { useState, useEffect } from 'react';
import { farmerAPI } from '../services/api';
import './FarmerPortal.css';

function FarmerEarnings({
  showToast = () => {}
}) {
  const [earnings, setEarnings] = useState({
    totalRevenue: 0,
    grossSales: 0,
    commission: 0,
    netEarnings: 0,
    withdrawableBalance: 0,
    pendingPayout: 0,
    records: []
  });

  useEffect(() => {
    let isMounted = true;
    farmerAPI.getEarnings()
      .then((res) => {
        if (isMounted && res.data) {
          setEarnings(res.data);
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);
  return (
    <div className="earnings-view-content">
      <div className="earnings-header-row">
        <div className="earnings-title-group">
          <span className="section-super-tag">YOUR INCOME</span>
          <h1 className="earnings-main-title">Earnings</h1>
          <p className="earnings-sub-desc">Clear, transparent payouts for every harvest.</p>
        </div>

        <button
          type="button"
          className="btn-download-report"
          onClick={() => showToast('Downloading monthly earnings report PDF...')}
        >
          Download report
        </button>
      </div>

      {/* Green Balance Banner */}
      <div className="earnings-balance-banner">
        <div className="balance-info-left">
          <span className="balance-tag-title">AVAILABLE BALANCE</span>
          <div className="balance-amount-display">
            ₱{(earnings.withdrawableBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="balance-last-payout">
            {earnings.records && earnings.records.length > 0 ? `${earnings.records.length} completed payout(s)` : 'No payouts processed yet'}
          </span>
        </div>

        <button
          type="button"
          className="btn-withdraw-earnings"
          onClick={() => {
            if ((earnings.withdrawableBalance || 0) <= 0) {
              showToast('No available balance to withdraw right now.');
            } else {
              showToast(`Processing bank withdrawal for ₱${(earnings.withdrawableBalance || 0).toFixed(2)} to BDO/GCash...`);
            }
          }}
        >
          Withdraw earnings
        </button>
      </div>

      {/* 3 Summary Cards */}
      <div className="earnings-metrics-grid">
        <div className="dash-card metric-card">
          <span className="metric-title">Gross sales</span>
          <div className="metric-value">
            ₱{(earnings.grossSales || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="metric-sub">From completed orders</span>
        </div>

        <div className="dash-card metric-card">
          <span className="metric-title">UmaHub commission</span>
          <div className="metric-value">
            ₱{(earnings.commission || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="metric-sub">5% marketplace fee</span>
        </div>

        <div className="dash-card metric-card">
          <span className="metric-title">Net earnings</span>
          <div className="metric-value">
            ₱{(earnings.netEarnings || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="metric-sub">After 5% commission</span>
        </div>
      </div>

      {/* Earnings Breakdown Table Card */}
      <div className="dash-card earnings-breakdown-card">
        <div className="card-header-flex">
          <h3 className="card-section-title" style={{ marginBottom: 0 }}>Earnings breakdown</h3>
          <select
            className="filter-pill-select"
            defaultValue="thisMonth"
            onChange={(e) => showToast(`Breakdown for: ${e.target.value}`)}
          >
            <option value="thisMonth">This month</option>
            <option value="lastMonth">Last month</option>
            <option value="allYear">All year 2026</option>
          </select>
        </div>

        <div className="table-responsive-wrapper">
          <table className="orders-data-table">
            <thead>
              <tr>
                <th>ORDER</th>
                <th>DATE</th>
                <th>ORDER TOTAL</th>
                <th>COMMISSION (5%)</th>
                <th>YOUR EARNINGS</th>
              </tr>
            </thead>
            <tbody>
              {!earnings.records || earnings.records.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '36px 16px', color: '#6B7280', fontSize: '14px' }}>
                    📊 No completed order payouts recorded yet. Completed customer orders will appear here automatically!
                  </td>
                </tr>
              ) : (
                earnings.records.map((rec) => (
                  <tr key={rec.id}>
                    <td>
                      <div className="table-order-id">{rec.id}</div>
                      <div className="table-order-date">{rec.customer}</div>
                    </td>
                    <td>{rec.date}</td>
                    <td>₱{rec.total.toFixed(2)}</td>
                    <td className="text-commission-red">- ₱{rec.commission.toFixed(2)}</td>
                    <td className="table-amount">₱{rec.net.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default FarmerEarnings;
