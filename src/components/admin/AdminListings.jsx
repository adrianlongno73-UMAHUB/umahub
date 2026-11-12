import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

function AdminListings({
  initialFilter = 'pending',
  onListingCountUpdate = () => {},
  showToast = () => {}
}) {
  const [activeTab, setActiveTab] = useState(initialFilter || 'pending');
  const [listings, setListings] = useState([]);
  const [pendingCount, setPendingCount] = useState(3);

  const loadListings = async () => {
    try {
      const res = await adminAPI.getListings({ statusFilter: activeTab });
      if (res.success) {
        setListings(res.data || []);
      }

      // Check pending count for badge
      const pendRes = await adminAPI.getListings({ statusFilter: 'pending' });
      if (pendRes.success) {
        const count = pendRes.count || (pendRes.data?.length) || 0;
        setPendingCount(count);
        onListingCountUpdate(count);
      }
    } catch (err) {
      console.error('Failed to load listings:', err);
    }
  };

  useEffect(() => {
    loadListings();
  }, [activeTab]);

  const handleApprove = async (product) => {
    try {
      await adminAPI.approveListing(product.id);
      showToast(`Approved "${product.name}"! It is now live on the marketplace.`);
      loadListings();
    } catch {
      showToast(`Failed to approve "${product.name}".`);
    }
  };

  const handleReject = async (product) => {
    try {
      await adminAPI.rejectListing(product.id, 'Quality standards review');
      showToast(`Rejected "${product.name}".`);
      loadListings();
    } catch {
      showToast(`Failed to reject "${product.name}".`);
    }
  };

  return (
    <div className="admin-page-content">
      {/* Header Row */}
      <div className="admin-page-header-row">
        <div>
          <div className="admin-section-tag">QUALITY CONTROL</div>
          <h1 className="admin-main-title">Product Listings</h1>
          <p className="admin-sub-title">
            Review new products before they go live in the marketplace.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs-nav-bar">
        <button
          type="button"
          className={`admin-tab-item ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <span>Pending review</span>
          {pendingCount > 0 && (
            <span className="admin-tab-pill-badge">{pendingCount}</span>
          )}
        </button>

        <button
          type="button"
          className={`admin-tab-item ${activeTab === 'live' ? 'active' : ''}`}
          onClick={() => setActiveTab('live')}
        >
          Live listings
        </button>

        <button
          type="button"
          className={`admin-tab-item ${activeTab === 'rejected' ? 'active' : ''}`}
          onClick={() => setActiveTab('rejected')}
        >
          Rejected
        </button>
      </div>

      {/* Product Cards Grid */}
      <div className="admin-listings-grid">
        {listings.length > 0 ? (
          listings.map((product) => {
            const isPending = activeTab === 'pending';
            const isLive = activeTab === 'live';
            const isRejected = activeTab === 'rejected';

            return (
              <div key={product.id} className="admin-listing-card">
                {/* Product Thumbnail */}
                <div className="admin-listing-img-box">
                  <img
                    src={product.image_url || '/image/gulay1.png'}
                    alt={product.name}
                    className="admin-listing-img"
                    onError={(e) => { e.target.src = '/image/gulay1.png'; }}
                  />
                </div>

                {/* Card Content Body */}
                <div className="admin-listing-body">
                  <div className="admin-listing-badge-row">
                    <span className={`admin-status-pill status-${product.review_status || 'pending'}`}>
                      {product.review_status === 'approved' ? 'Live' : (product.review_status === 'rejected' ? 'Rejected' : 'Pending review')}
                    </span>
                  </div>

                  <h3 className="admin-listing-title">{product.name}</h3>

                  <div className="admin-listing-farm-line">
                    <span>{product.farm_name}</span>
                    {product.farmer_location && (
                      <>
                        <span className="dot-divider">•</span>
                        <span>{product.farmer_location}</span>
                      </>
                    )}
                  </div>

                  <div className="admin-listing-price-row">
                    <span className="admin-listing-price-num">
                      ₱{Number(product.price).toFixed(2)}
                    </span>
                    <span className="admin-listing-unit">/ {product.unit || 'kg'}</span>
                  </div>

                  {/* Category & Available Stock 2-Col Box */}
                  <div className="admin-listing-meta-box">
                    <div className="admin-meta-cell">
                      <span className="admin-meta-label">Category</span>
                      <span className="admin-meta-value">{product.category || 'Vegetables'}</span>
                    </div>

                    <div className="admin-meta-cell">
                      <span className="admin-meta-label">Available stock</span>
                      <span className="admin-meta-value">
                        {product.stock_quantity} {product.unit || 'kg'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="admin-listing-actions-row">
                    {isPending && (
                      <>
                        <button
                          type="button"
                          className="admin-reject-btn"
                          onClick={() => handleReject(product)}
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          className="admin-approve-btn"
                          onClick={() => handleApprove(product)}
                        >
                          Approve ✓
                        </button>
                      </>
                    )}

                    {isLive && (
                      <button
                        type="button"
                        className="admin-reject-btn full-width"
                        onClick={() => handleReject(product)}
                      >
                        Deactivate / Delist
                      </button>
                    )}

                    {isRejected && (
                      <button
                        type="button"
                        className="admin-approve-btn full-width"
                        onClick={() => handleApprove(product)}
                      >
                        Re-approve ✓
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="admin-empty-state">
            <p>No listings found in "{activeTab.replace('_', ' ')}".</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminListings;
