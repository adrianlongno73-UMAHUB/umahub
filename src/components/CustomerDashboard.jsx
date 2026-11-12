import React, { useState, useEffect } from 'react';
import CustomerSidebar from './CustomerSidebar';
import CustomerHome from './CustomerHome';
import CustomerBrowseProducts from './CustomerBrowseProducts';
import CustomerProductDetail from './CustomerProductDetail';
import CustomerOrders from './CustomerOrders';
import CustomerOrderDetailView from './CustomerOrderDetailView';
import CustomerCart from './CustomerCart';
import CustomerFulfillmentOption from './CustomerFulfillmentOption';
import CustomerCheckout from './CustomerCheckout';
import CustomerOrderConfirmation from './CustomerOrderConfirmation';
import CustomerProfile from './CustomerProfile';
import CustomerSearchResults from './CustomerSearchResults';
import defaultProfileImg from '../image/defaultProfile.png';
import { cartAPI, cleanAvatarUrl } from '../services/api';
import './CustomerDashboard.css';

function CustomerDashboard({
  customerName: propCustomerName = '',
  customerEmail: propCustomerEmail = '',
  customerPhone: propCustomerPhone = '',
  currentUser = null,
  initialTab = 'browse',
  initialOrdersSubTab = 'active', // 'active' | 'completed' | 'cancelled' | 'declined'
  initialModal = null, // null | 'cancel-order'
  onLogout = () => {},
  onProfileUpdate = () => {},
  showToast = () => {}
}) {
  const [customerName, setCustomerName] = useState(
    currentUser?.name || propCustomerName || 'Customer'
  );
  const [customerEmail, setCustomerEmail] = useState(
    currentUser?.email || propCustomerEmail || ''
  );
  const [customerPhone, setCustomerPhone] = useState(
    currentUser?.phone || propCustomerPhone || ''
  );
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || null);
  const [activeTab, setActiveTab] = useState(initialTab); // 'overview' | 'browse' | 'search' | 'product-detail' | 'orders' | 'order-detail' | 'cart' | 'checkout' | 'confirmation' | 'profile'

  useEffect(() => {
    if (currentUser) {
      if (currentUser.avatar_url !== undefined) {
        setAvatarUrl(currentUser.avatar_url);
      }
      if (currentUser.name) {
        setCustomerName(currentUser.name);
      }
      if (currentUser.email) {
        setCustomerEmail(currentUser.email);
      }
      if (currentUser.phone) {
        setCustomerPhone(currentUser.phone);
      }
    }
  }, [currentUser]);
  const [cartCount, setCartCount] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [latestOrder, setLatestOrder] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('tomato');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [checkoutData, setCheckoutData] = useState({
    items: [],
    subtotal: 0,
    count: 0,
    fulfillmentType: 'delivery',
    deliveryFee: 50.0,
    total: 0,
    address: 'Purok 1, Brgy. Bunawan'
  });

  useEffect(() => {
    let isMounted = true;
    cartAPI.get()
      .then((res) => {
        if (isMounted) {
          if (res.items) {
            const count = res.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
            setCartCount(count);
          } else {
            setCartCount(0);
          }
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const handleAddToCart = (product) => {
    cartAPI.add(product.id, product.quantity || 1, product)
      .then(() => cartAPI.get())
      .then((res) => {
        if (res.items) {
          const count = res.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
          setCartCount(count);
        }
      })
      .catch(() => {
        setCartCount((prev) => prev + (product.quantity || 1));
      });
    showToast(`Added ${product.name} to cart!`);
  };

  return (
    <div className="customer-dashboard-layout">
      {/* 1. Left Sidebar Navigation */}
      <CustomerSidebar
        activeTab={
          activeTab === 'product-detail' || activeTab === 'search'
            ? 'browse'
            : activeTab === 'order-detail'
            ? 'orders'
            : activeTab === 'checkout' || activeTab === 'confirmation' || activeTab === 'fulfillment'
            ? 'cart'
            : activeTab === 'profile'
            ? 'profile'
            : activeTab
        }
        setActiveTab={setActiveTab}
        customerName={customerName}
        avatarUrl={avatarUrl}
        onLogout={onLogout}
        showToast={showToast}
      />

      {/* 2. Main Content Area */}
      <main className="customer-main-content">
        {/* Top Header Bar */}
        <header className="customer-top-bar">
          <div className="location-pill-box" onClick={() => showToast('Delivery Location: Bunawan, Agusan del Sur')}>
            <span className="location-sub-label">Location</span>
            <div className="location-main-value">Bunawan</div>
          </div>

          <div className="customer-header-right">
            {/* Cart Icon Button with Badge */}
            <div
              className="customer-header-cart-btn"
              onClick={() => {
                setActiveTab('cart');
                showToast(`Your cart currently has ${cartCount} item(s).`);
              }}
              title="Shopping Cart"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#17331b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="cart-header-svg">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className="cart-badge-count">{cartCount}</span>
            </div>

            {/* Customer Account Pill with Dropdown */}
            <div style={{ position: 'relative' }}>
              <div
                className="customer-profile-pill"
                onClick={() => setShowProfileMenu((prev) => !prev)}
                title="Account menu"
              >
                <div className="customer-pill-avatar-box" style={{ overflow: 'hidden' }}>
                  <img
                    src={cleanAvatarUrl(avatarUrl) || defaultProfileImg}
                    alt={customerName}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = defaultProfileImg;
                    }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div className="customer-pill-info">
                  <span className="customer-pill-tag">CUSTOMER ACCOUNT</span>
                  <span className="customer-pill-name">{customerName}</span>
                </div>
                <span className="customer-pill-arrow">▾</span>
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
                    <span>👤</span>
                    <span>My Profile</span>
                  </button>

                  <div style={{ height: '1px', background: '#f0f4ee' }} />

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
                    <span>🚪</span>
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic View Rendering based on activeTab */}
        {activeTab === 'overview' && (
          <CustomerHome
            customerName={customerName}
            onAddToCart={handleAddToCart}
            onNavigateToBrowse={() => {
              setActiveTab('browse');
              showToast('Browsing full marketplace catalogue');
            }}
            onNavigateToSearch={(query) => {
              setSearchKeyword(query);
              setActiveTab('search');
            }}
            showToast={showToast}
          />
        )}

        {activeTab === 'browse' && (
          <CustomerBrowseProducts
            onAddToCart={handleAddToCart}
            onSelectProduct={(product) => {
              setSelectedProduct(product);
              setActiveTab('product-detail');
            }}
            onSearchSubmit={(query) => {
              setSearchKeyword(query);
              setActiveTab('search');
            }}
            showToast={showToast}
          />
        )}

        {activeTab === 'search' && (
          <CustomerSearchResults
            initialQuery={searchKeyword || 'tomato'}
            onAddToCart={handleAddToCart}
            onSelectProduct={(product) => {
              setSelectedProduct(product);
              setActiveTab('product-detail');
            }}
            showToast={showToast}
          />
        )}

        {activeTab === 'product-detail' && (
          <CustomerProductDetail
            product={selectedProduct}
            onBack={() => setActiveTab('browse')}
            onAddToCart={handleAddToCart}
            showToast={showToast}
          />
        )}

        {activeTab === 'orders' && (
          <CustomerOrders
            initialTab={initialOrdersSubTab}
            showToast={showToast}
            onNavigateToBrowse={() => setActiveTab('browse')}
            onViewOrderDetail={(orderId) => {
              setSelectedOrderId(orderId);
              setActiveTab('order-detail');
            }}
          />
        )}

        {activeTab === 'order-detail' && (
          <CustomerOrderDetailView
            orderId={selectedOrderId || 'UH-2045'}
            initialShowCancelModal={initialModal === 'cancel-order'}
            onBack={() => setActiveTab('orders')}
            onReorder={() => {
              setActiveTab('cart');
              showToast('Added items from Order #' + (selectedOrderId || 'UH-2045') + ' to cart!');
            }}
            showToast={showToast}
          />
        )}

        {activeTab === 'cart' && (
          <CustomerCart
            onCheckout={({ items, subtotal, count }) => {
              setCheckoutData((prev) => ({
                ...prev,
                items: items || [],
                subtotal: subtotal || 0,
                count: count || (items ? items.reduce((s, i) => s + (i.quantity || 1), 0) : 0),
                total: (subtotal || 0) + (prev.fulfillmentType === 'delivery' ? prev.deliveryFee : 0)
              }));
              setActiveTab('fulfillment');
              showToast('Select how you would like to get your order');
            }}
            onContinueShopping={() => setActiveTab('browse')}
            showToast={showToast}
          />
        )}

        {activeTab === 'fulfillment' && (
          <CustomerFulfillmentOption
            itemsCount={checkoutData.count || cartCount}
            itemsTotal={checkoutData.subtotal}
            onContinueToPayment={(fulfillmentDetails) => {
              setCheckoutData((prev) => ({
                ...prev,
                ...fulfillmentDetails,
                fulfillmentType: fulfillmentDetails.fulfillmentType || prev.fulfillmentType,
                deliveryFee: fulfillmentDetails.deliveryFee,
                total: parseFloat(fulfillmentDetails.total) || prev.total,
                address: fulfillmentDetails.address || prev.address
              }));
              setActiveTab('checkout');
              showToast('Proceeding to delivery and payment checkout');
            }}
            showToast={showToast}
          />
        )}

        {activeTab === 'checkout' && (
          <CustomerCheckout
            customerName={customerName}
            customerEmail={customerEmail}
            customerPhone={customerPhone}
            items={checkoutData.items}
            subtotal={checkoutData.subtotal}
            deliveryFee={checkoutData.deliveryFee}
            initialFulfillmentType={checkoutData.fulfillmentType}
            initialDeliveryAddress={checkoutData.address}
            onOrderPlaced={(order) => {
              setLatestOrder(order);
              setCartCount(0);
              setActiveTab('confirmation');
            }}
            onBackToCart={() => setActiveTab('cart')}
            showToast={showToast}
          />
        )}

        {activeTab === 'confirmation' && (
          <CustomerOrderConfirmation
            order={latestOrder}
            onTrackOrder={() => setActiveTab('orders')}
            onBackToHome={() => setActiveTab('overview')}
          />
        )}

        {activeTab === 'profile' && (
          <CustomerProfile
            customerName={customerName}
            customerEmail={customerEmail}
            customerPhone={customerPhone}
            initialAvatarUrl={avatarUrl}
            onProfileSaved={(updated) => {
              if (updated.name) setCustomerName(updated.name);
              if (updated.email) setCustomerEmail(updated.email);
              if (updated.phone) setCustomerPhone(updated.phone);
              if (updated.avatar_url) setAvatarUrl(updated.avatar_url);
              onProfileUpdate(updated);
            }}
            onLogout={onLogout}
            showToast={showToast}
          />
        )}
      </main>
    </div>
  );
}

export default CustomerDashboard;
