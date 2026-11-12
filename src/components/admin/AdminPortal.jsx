import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import AdminOverview from './AdminOverview';
import AdminUsers from './AdminUsers';
import AdminOrders from './AdminOrders';
import AdminListings from './AdminListings';
import AdminCommission from './AdminCommission';
import AdminInviteModal from './AdminInviteModal';
import AdminFarmerReviewModal from './AdminFarmerReviewModal';
import AdminOrderModal from './AdminOrderModal';
import { adminAPI } from '../../services/api';
import './AdminPortal.css';

function AdminPortal({
  initialTab = 'overview',
  currentUser = null,
  onLogout = () => {},
  showToast = () => {}
}) {
  const [activeTab, setActiveTab] = useState(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#admin-users') return 'users';
    if (hash === '#admin-orders') return 'orders';
    if (hash === '#admin-listings') return 'listings';
    if (hash === '#admin-commission') return 'commission';
    return initialTab || 'overview';
  });

  const [filterSubParam, setFilterSubParam] = useState(null);
  const [stats, setStats] = useState({});
  const [pendingListingsCount, setPendingListingsCount] = useState(3);

  // Modals state
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const adminName = currentUser?.name || 'Aike Adorador';

  // Load fresh statistics from database
  const refreshStats = async () => {
    try {
      const res = await adminAPI.getOverviewStats();
      if (res.success && res.data) {
        setStats(res.data);
        if (typeof res.data.pendingListingsCount === 'number') {
          setPendingListingsCount(res.data.pendingListingsCount);
        }
      }
    } catch (err) {
      console.warn('Overview stats loading error:', err);
    }
  };

  useEffect(() => {
    refreshStats();
  }, [activeTab]);

  // Sync hash routing
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#admin-users') {
        setActiveTab('users');
      } else if (hash === '#admin-orders') {
        setActiveTab('orders');
      } else if (hash === '#admin-listings') {
        setActiveTab('listings');
      } else if (hash === '#admin-commission') {
        setActiveTab('commission');
      } else if (hash === '#admin' || hash === '#admin-overview') {
        setActiveTab('overview');
      }
    };

    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleTabChange = (tab, subFilter = null) => {
    setActiveTab(tab);
    setFilterSubParam(subFilter);
    window.location.hash = `#admin-${tab}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDownloadReport = async () => {
    try {
      showToast('Generating Platform Performance Report...');
      await adminAPI.downloadReport();
      showToast('Performance report downloaded!');
    } catch {
      showToast('Failed to download performance report.');
    }
  };

  return (
    <div className="admin-portal-wrapper">
      <div className="admin-portal-inner">
        {/* Left Dark Green Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          pendingListingsCount={pendingListingsCount}
          adminName={adminName}
          onLogout={onLogout}
        />

        {/* Right Main Content Area */}
        <div className="admin-main-viewport">
          {/* Top Right Header Profile */}
          <AdminHeader
            adminName={adminName}
            roleLabel={currentUser?.role === 'super_admin' ? 'SUPER ADMIN' : 'SUPER ADMIN'}
          />

          {/* Active Tab View */}
          <main className="admin-view-body">
            {activeTab === 'overview' && (
              <AdminOverview
                stats={stats}
                adminName={adminName}
                onNavigate={handleTabChange}
                onDownloadReport={handleDownloadReport}
                showToast={showToast}
              />
            )}

            {activeTab === 'users' && (
              <AdminUsers
                initialFilter={filterSubParam}
                onOpenInviteModal={() => setIsInviteModalOpen(true)}
                onOpenFarmerReviewModal={(farmer) => setSelectedFarmer(farmer)}
                showToast={showToast}
              />
            )}

            {activeTab === 'orders' && (
              <AdminOrders
                initialFilter={filterSubParam || 'all'}
                onOpenOrderModal={(order) => setSelectedOrder(order)}
                showToast={showToast}
              />
            )}

            {activeTab === 'listings' && (
              <AdminListings
                initialFilter={filterSubParam || 'pending'}
                onListingCountUpdate={(cnt) => setPendingListingsCount(cnt)}
                showToast={showToast}
              />
            )}

            {activeTab === 'commission' && (
              <AdminCommission
                showToast={showToast}
              />
            )}
          </main>
        </div>
      </div>

      {/* Modals */}
      <AdminInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        onSuccess={refreshStats}
        showToast={showToast}
      />

      <AdminFarmerReviewModal
        farmer={selectedFarmer}
        isOpen={Boolean(selectedFarmer)}
        onClose={() => setSelectedFarmer(null)}
        onSuccess={refreshStats}
        showToast={showToast}
      />

      <AdminOrderModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onSuccess={refreshStats}
        showToast={showToast}
      />
    </div>
  );
}

export default AdminPortal;
