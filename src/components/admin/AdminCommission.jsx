import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

function AdminCommission({
  showToast = () => {}
}) {
  const [commissionRate, setCommissionRate] = useState(5);
  const [grossSalesMonth, setGrossSalesMonth] = useState(482650);
  const [commissionThisMonth, setCommissionThisMonth] = useState(24132.50);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminAPI.getCommissionSettings().then(res => {
      if (res.success && res.data) {
        setCommissionRate(res.data.rate || 5);
        setGrossSalesMonth(res.data.grossSalesMonth || 482650);
        setCommissionThisMonth(res.data.commissionMonth || 24132.50);
      }
    }).catch(() => {});
  }, []);

  const handleSaveRate = async (e) => {
    e.preventDefault();
    const rateVal = parseFloat(commissionRate);
    if (isNaN(rateVal) || rateVal < 0 || rateVal > 50) {
      showToast('Please enter a valid commission percentage between 0 and 50.');
      return;
    }

    try {
      setSaving(true);
      await adminAPI.saveCommissionRate(rateVal);
      setCommissionThisMonth(grossSalesMonth * (rateVal / 100));
      showToast(`Marketplace commission rate set to ${rateVal}%!`);
    } catch {
      showToast('Failed to save commission rate.');
    } finally {
      setSaving(false);
    }
  };

  // Dynamic preview calculations for ₱1,000 order
  const exampleOrderTotal = 1000;
  const currentRateNum = parseFloat(commissionRate) || 0;
  const exampleCommission = exampleOrderTotal * (currentRateNum / 100);
  const exampleFarmerReceives = exampleOrderTotal - exampleCommission;

  return (
    <div className="admin-page-content">
      {/* Header Row */}
      <div className="admin-page-header-row">
        <div>
          <div className="admin-section-tag">REVENUE SETTINGS</div>
          <h1 className="admin-main-title">Commission</h1>
          <p className="admin-sub-title">
            Manage the fee UmaHub earns from completed marketplace orders.
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="admin-commission-grid">
        {/* Left Card: Settings & Calculator */}
        <div className="admin-card admin-commission-card">
          <div className="admin-commission-header-box">
            <div className="admin-commission-icon-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-icon-svg">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <div>
              <h2 className="admin-card-title">Marketplace commission rate</h2>
              <p className="admin-commission-desc">
                Applied automatically to every completed order.
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveRate} className="admin-commission-form">
            <label className="admin-input-label">Commission percentage</label>
            <div className="admin-percent-input-wrapper">
              <input
                type="number"
                min="0"
                max="50"
                step="0.1"
                className="admin-percent-input"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
              />
              <span className="admin-percent-tag">%</span>
            </div>

            {/* Example Box */}
            <div className="admin-commission-calc-box">
              <div className="admin-calc-title">EXAMPLE ON A ₱1,000 ORDER</div>
              <div className="admin-calc-row">
                <span className="admin-calc-label">Customer pays</span>
                <span className="admin-calc-value">₱1,000.00</span>
              </div>
              <div className="admin-calc-row">
                <span className="admin-calc-label">UmaHub commission ({commissionRate}%)</span>
                <span className="admin-calc-value">
                  ₱{exampleCommission.toFixed(2)}
                </span>
              </div>
              <div className="admin-calc-row total-row">
                <span className="admin-calc-label">Farmer receives</span>
                <span className="admin-calc-value text-dark">
                  ₱{exampleFarmerReceives.toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="admin-approve-btn full-width mt-6"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save commission rate ✓'}
            </button>
          </form>
        </div>

        {/* Right Card: Fee Coverage & Month Revenue */}
        <div className="admin-card admin-fee-covers-card">
          <h2 className="admin-card-title">Current fee covers</h2>

          <ul className="admin-covers-list">
            <li>
              <span className="admin-check-icon">✓</span>
              <span>Secure payment processing</span>
            </li>
            <li>
              <span className="admin-check-icon">✓</span>
              <span>Customer and farmer support</span>
            </li>
            <li>
              <span className="admin-check-icon">✓</span>
              <span>Marketplace operations</span>
            </li>
            <li>
              <span className="admin-check-icon">✓</span>
              <span>Product quality moderation</span>
            </li>
          </ul>

          {/* Month Green Box */}
          <div className="admin-month-commission-box">
            <span className="admin-month-label">COMMISSION THIS MONTH</span>
            <div className="admin-month-amount">
              ₱{Number(commissionThisMonth).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="admin-month-sub">
              From ₱{Number(grossSalesMonth).toLocaleString('en-US')} gross sales
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminCommission;
