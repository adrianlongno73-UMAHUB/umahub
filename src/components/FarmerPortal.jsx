import React, { useState, useEffect } from 'react';
import FarmerSidebar from './FarmerSidebar';
import FarmerOverview from './FarmerOverview';
import FarmProfile from './FarmProfile';
import FarmerInventory from './FarmerInventory';
import FarmerAddProduct from './FarmerAddProduct';
import FarmerOrders from './FarmerOrders';
import FarmerEarnings from './FarmerEarnings';
import FarmerOnboarding from './FarmerOnboarding';
import defaultProfileImg from '../image/defaultProfile.png';
import { farmerAPI, cleanAvatarUrl, formatRelativeTime } from '../services/api';
import './FarmerPortal.css';

function FarmerPortal({
  initialTab = 'dashboard', // 'dashboard' | 'inventory' | 'add-product' | 'orders' | 'earnings' | 'profile' | 'farmer-onboarding'
  initialModal = null, // null | 'select-reason' | 'confirm-decline' | 'notification-sent' | 'decline-success' | 'cancellation-request'
  initialAction = null, // null | 'delete' | 'edit'
  initialOrdersTab = null, // null | 'New' | 'Cancelled'
  farmName: propFarmName = '',
  currentUser = null,
  onNavigateOnboarding = null,
  onLogout,
  showToast
}) {
  const [activeTab, setActiveTab] = useState(
    initialModal ? 'orders' : initialTab
  );

  // Farm Details State (Shared across header, sidebar, profile)
  const [farmName, setFarmName] = useState(
    currentUser?.farm_name || (currentUser?.name ? `${currentUser.name}'s Farm` : propFarmName) || "My Farm"
  );
  const [location, setLocation] = useState(currentUser?.location || "Bunawan");
  const [harvestDays, setHarvestDays] = useState("Monday to Saturday");
  const [aboutFarm, setAboutFarm] = useState("Family-run farm supplying fresh vegetables to nearby neighborhoods.");
  const [avatarUrl, setAvatarUrl] = useState(() => cleanAvatarUrl(currentUser?.avatar_url) || null);
  const [ordersCount, setOrdersCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Inventory State (Loaded from real database)
  const [inventoryList, setInventoryList] = useState([]);

  useEffect(() => {
    let isMounted = true;
    farmerAPI.getProfile()
      .then((res) => {
        if (isMounted && res.data) {
          if (res.data.farm_name) setFarmName(res.data.farm_name);
          if (res.data.location) setLocation(res.data.location);
          if (res.data.bio) setAboutFarm(res.data.bio);
          setAvatarUrl(cleanAvatarUrl(res.data.avatar_url));
        }
      })
      .catch(() => {});

    farmerAPI.getOverview()
      .then((res) => {
        if (isMounted && res.data && typeof res.data.activeOrders === 'number') {
          setOrdersCount(res.data.activeOrders);
        }
      })
      .catch(() => {});

    farmerAPI.getInventory()
      .then((res) => {
        if (isMounted && res.data) {
          const mapped = res.data.map((item, idx) => ({
            id: item.id || idx + 1,
            name: item.name,
            updated: formatRelativeTime(item.updated_at || item.created_at),
            updated_at: item.updated_at || item.created_at,
            created_at: item.created_at,
            category: item.category_name || item.category || 'Vegetables',
            price: `₱${parseFloat(item.price).toFixed(2)} / ${item.unit || 'kg'}`,
            rawPrice: parseFloat(item.price),
            stock: `${item.stock_quantity || 0} ${item.unit || 'kg'}`,
            rawStock: item.stock_quantity,
            unit: item.unit || 'kg',
            status: item.stock_status === 'low_stock' || (item.stock_quantity || 0) <= 10 ? 'Low stock' : 'In stock',
            img: item.image_url || '/image/gulay1.png',
            desc: item.description || ''
          }));
          setInventoryList(mapped);
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

  const handleUpdateStock = (item) => {
    farmerAPI.updateProduct(item.id, { stock_status: 'in_stock', stock_quantity: 50 }).catch(() => {});
    setInventoryList((prev) =>
      prev.map((i) =>
        i.name === item.name ? { ...i, status: 'In stock', stock: '25 kg' } : i
      )
    );
    showToast(`Stock updated for ${item.name}! Replenished successfully.`);
  };

  const handleDeleteProduct = (id, name) => {
    farmerAPI.deleteProduct(id).catch(() => {});
    setInventoryList((prev) => prev.filter((item) => item.id !== id));
    showToast(`Removed "${name}" from inventory.`);
  };

  const handleUpdateProduct = (updatedItem) => {
    farmerAPI.updateProduct(updatedItem.id, {
      name: updatedItem.name,
      category: updatedItem.category,
      price: updatedItem.rawPrice !== undefined ? updatedItem.rawPrice : updatedItem.price,
      stock: updatedItem.rawStock !== undefined ? updatedItem.rawStock : updatedItem.stock,
      status: updatedItem.status,
      desc: updatedItem.desc,
      img: updatedItem.img
    }).catch(() => {});
    setInventoryList((prev) =>
      prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  const handlePublishProduct = async (newItem) => {
    try {
      const res = await farmerAPI.addProduct({
        name: newItem.name,
        category: newItem.category,
        price: newItem.rawPrice !== undefined ? newItem.rawPrice : newItem.price,
        unit: newItem.unit || 'kg',
        stock_quantity: newItem.rawStock !== undefined ? newItem.rawStock : newItem.stock,
        description: newItem.desc || newItem.description || '',
        image_url: newItem.img
      });

      const inserted = res?.data?.[0];
      const realItem = inserted ? {
        id: inserted.id,
        name: inserted.name,
        updated: formatRelativeTime(inserted.updated_at || inserted.created_at),
        updated_at: inserted.updated_at || inserted.created_at,
        created_at: inserted.created_at,
        category: newItem.category || 'Vegetables',
        price: `₱${parseFloat(inserted.price).toFixed(2)} / ${inserted.unit || 'kg'}`,
        rawPrice: parseFloat(inserted.price),
        stock: `${inserted.stock_quantity || 0} ${inserted.unit || 'kg'}`,
        rawStock: inserted.stock_quantity,
        unit: inserted.unit || 'kg',
        status: inserted.stock_status === 'low_stock' || (inserted.stock_quantity || 0) <= 10 ? 'Low stock' : 'In stock',
        img: inserted.image_url || newItem.img || '/image/gulay1.png',
        desc: inserted.description || newItem.desc || ''
      } : newItem;

      setInventoryList((prev) => [realItem, ...prev]);
    } catch {
      setInventoryList((prev) => [newItem, ...prev]);
    }
  };

  return (
    <div className="farmer-portal-layout">
      {/* 1. Left Sidebar Navigation */}
      <FarmerSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        farmName={farmName}
        avatarUrl={avatarUrl}
        ordersCount={ordersCount}
        onNavigateOnboarding={onNavigateOnboarding}
        onLogout={onLogout}
        showToast={showToast}
      />

      {/* 2. Main Content Area */}
      <main className="farmer-main-content">
        {/* Top Header Profile Pill with Dropdown */}
        <header className="portal-top-bar">
          <div style={{ position: 'relative' }}>
            <div
              className="portal-user-profile"
              onClick={() => setShowProfileMenu((prev) => !prev)}
              title="Farm account menu"
            >
              <div className="user-text-info">
                <span className="user-location">{location}</span>
                <span className="user-farm-name">{farmName}</span>
              </div>
              <div className="user-avatar-circle" style={{ overflow: 'hidden' }}>
                <img
                  src={cleanAvatarUrl(avatarUrl) || defaultProfileImg}
                  alt={farmName}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = defaultProfileImg;
                  }}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <span style={{ fontSize: '12px', color: '#6B7280', marginLeft: '2px' }}>▾</span>
            </div>

            {showProfileMenu && (
              <div
                className="profile-dropdown-menu"
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '8px',
                  background: '#ffffff',
                  borderRadius: '12px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                  border: '1px solid #e2ece0',
                  minWidth: '180px',
                  zIndex: 100,
                  overflow: 'hidden'
                }}
              >
                <button
                  type="button"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#17331b',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'Outfit, sans-serif'
                  }}
                  onClick={() => {
                    setActiveTab('profile');
                    setShowProfileMenu(false);
                  }}
                >
                  <span>🌾</span> Farm Profile
                </button>
                <div style={{ height: '1px', background: '#eef2ed' }} />
                <button
                  type="button"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#dc2626',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontFamily: 'Outfit, sans-serif'
                  }}
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                >
                  <span>🚪</span> Log out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Tab Views */}
        {activeTab === 'dashboard' && (
          <FarmerOverview
            farmerName={currentUser?.name || farmName}
            currentUser={currentUser}
            setActiveTab={setActiveTab}
            onNavigateOnboarding={onNavigateOnboarding}
            handleUpdateStock={handleUpdateStock}
            showToast={showToast}
          />
        )}

        {activeTab === 'profile' && (
          <FarmProfile
            farmName={farmName}
            setFarmName={setFarmName}
            location={location}
            setLocation={setLocation}
            harvestDays={harvestDays}
            setHarvestDays={setHarvestDays}
            aboutFarm={aboutFarm}
            setAboutFarm={setAboutFarm}
            avatarUrl={avatarUrl}
            setAvatarUrl={setAvatarUrl}
            showToast={showToast}
          />
        )}

        {activeTab === 'inventory' && (
          <FarmerInventory
            inventoryList={inventoryList}
            handleDeleteProduct={handleDeleteProduct}
            handleUpdateProduct={handleUpdateProduct}
            setActiveTab={setActiveTab}
            initialAction={initialAction}
            showToast={showToast}
          />
        )}

        {activeTab === 'add-product' && (
          <FarmerAddProduct
            onPublishProduct={handlePublishProduct}
            setActiveTab={setActiveTab}
            showToast={showToast}
          />
        )}

        {activeTab === 'orders' && (
          <FarmerOrders
            initialTab={initialOrdersTab || 'New'}
            initialModal={initialModal}
            showToast={showToast}
          />
        )}

        {activeTab === 'earnings' && (
          <FarmerEarnings
            showToast={showToast}
          />
        )}

        {activeTab === 'farmer-onboarding' && (
          <FarmerOnboarding
            currentUser={currentUser}
            onBackToHome={() => setActiveTab('dashboard')}
            onCompleteOnboarding={() => {
              setActiveTab('dashboard');
              showToast('Farm verification submitted successfully!');
            }}
            showToast={showToast}
          />
        )}
      </main>
    </div>
  );
}

export default FarmerPortal;
