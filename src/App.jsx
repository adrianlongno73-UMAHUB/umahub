import React, { useState, useEffect } from 'react';
import gulayImg from './image/gulay.png';
import mangbenImg from './image/mangben.png';
import AuthPage from './components/AuthPage';
import ForgotPassword from './components/ForgotPassword';
import FarmerOnboarding from './components/FarmerOnboarding';
import FarmerPortal from './components/FarmerPortal';
import CustomerDashboard from './components/CustomerDashboard';
import { isSupabaseConfigured, supabase } from './services/supabase';
import { clearAuthStorage, authAPI, cleanAvatarUrl } from './services/api';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'register' | 'login' | 'forgot-password' | 'farmer-onboarding' | 'farmer-dashboard' | 'farmer-profile' | 'inventory' | 'add-product' | 'orders' | 'earnings'
  const [authRole, setAuthRole] = useState('customer'); // 'customer' | 'farmer'
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('umahub_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.avatar_url = cleanAvatarUrl(parsed.avatar_url);
        return parsed;
      }
      return null;
    } catch {
      return null;
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNav, setActiveNav] = useState('home');
  const [toastMessage, setToastMessage] = useState(null);
  const [initialModal, setInitialModal] = useState(null);
  const [initialAction, setInitialAction] = useState(null);
  const [initialOrdersTab, setInitialOrdersTab] = useState(null);
  const [customerTab, setCustomerTab] = useState('browse');
  const [customerOrdersSubTab, setCustomerOrdersSubTab] = useState('active');

  const hasOAuthCallbackRef = React.useRef(
    window.location.hash.includes('access_token') ||
    window.location.hash.includes('refresh_token') ||
    window.location.search.includes('code') ||
    Boolean(localStorage.getItem('umahub_oauth_role'))
  );

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // Validate active Supabase Auth session on app startup so expired tokens are automatically purged
  useEffect(() => {
    // Intercept OAuth error params from URL redirect (e.g., from Facebook / Google)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ''));
      const oauthError = urlParams.get('error_description') || hashParams.get('error_description') || urlParams.get('error');

      if (oauthError) {
        window.history.replaceState(null, '', window.location.pathname);
        const decoded = decodeURIComponent(oauthError).replace(/\+/g, ' ');
        setTimeout(() => {
          if (decoded.toLowerCase().includes('email')) {
            showToast('Facebook sign in failed: Your Facebook account has no verified email address. Please link an email to your Facebook account or sign in with Google.');
          } else {
            showToast(`Sign in error: ${decoded}`);
          }
        }, 80);
      }
    } catch {}

    if (!isSupabaseConfigured()) return;

    supabase.auth.getSession().then(async ({ data, error }) => {
      let session = data?.session;
      if (error || !session) {
        try {
          const { data: refreshed, error: refErr } = await supabase.auth.refreshSession();
          if (!refErr && refreshed?.session) {
            session = refreshed.session;
          }
        } catch {}
      }

      if (!session) {
        const rawUser = localStorage.getItem('umahub_user');
        if (rawUser) {
          clearAuthStorage();
          setCurrentUser(null);
          const hash = window.location.hash.toLowerCase();
          const isProtected = [
            '#dashboard', '#farmer-dashboard', '#farm-profile', '#inventory',
            '#add-product', '#orders', '#earnings', '#customer', '#customer-dashboard',
            '#cart', '#profile'
          ].some(prefix => hash.startsWith(prefix));

          if (isProtected) {
            window.location.hash = '#login';
            showToast('Your session has expired. Please log in again.');
          }
        }
      }
    }).catch(() => {});

    // Listen to real-time auth changes (e.g. sign in via OAuth, sign out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const preOAuthRole = localStorage.getItem('umahub_oauth_role');
          const res = await authAPI.getCurrentUser();
          if (res.success && res.user) {
            const finalRole = preOAuthRole || res.user.role || 'customer';
            localStorage.removeItem('umahub_oauth_role');

            const syncedUser = {
              ...res.user,
              role: finalRole,
              farm_name: finalRole === 'farmer' ? (res.user.farm_name || `${res.user.name}'s Farm`) : null
            };

            setCurrentUser(syncedUser);
            setAuthRole(finalRole);
            localStorage.setItem('umahub_user', JSON.stringify(syncedUser));

            const isOAuthRedirect = hasOAuthCallbackRef.current ||
              window.location.hash.includes('access_token') ||
              window.location.search.includes('code');

            if (isOAuthRedirect || preOAuthRole) {
              hasOAuthCallbackRef.current = false;
              window.history.replaceState(null, '', window.location.pathname);
              if (finalRole === 'farmer') {
                setCurrentView('farmer-dashboard');
                window.location.hash = '#dashboard';
              } else {
                setCurrentView('customer-dashboard');
                window.location.hash = '#customer-dashboard';
              }
              showToast(`Welcome, ${res.user.name}! Logged in as ${finalRole === 'farmer' ? 'Farmer' : 'Customer'}.`);
            }
          }
        } catch {}
      } else if (event === 'SIGNED_OUT' || (!session && event !== 'INITIAL_SESSION')) {
        clearAuthStorage();
        setCurrentUser(null);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sync hash routing with Strict Authentication Guard
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      const rawUser = localStorage.getItem('umahub_user');
      let activeUser = null;
      try {
        activeUser = rawUser ? JSON.parse(rawUser) : null;
      } catch {}

      const isProtectedFarmer = [
        '#dashboard', '#farmer-dashboard', '#farm-profile',
        '#inventory', '#add-product', '#orders', '#cancelled-orders',
        '#cancellation-request', '#decline-order', '#confirm-decline',
        '#notification-sent', '#decline-success', '#earnings', '#delete-modal',
        '#edit-product', '#farmer-onboarding'
      ].includes(hash);

      const isProtectedCustomer = [
        '#customer', '#customer-dashboard', '#customer-home', '#browse-products',
        '#browse', '#products', '#search', '#search-results', '#product-detail',
        '#item-detail', '#fulfillment', '#get-order', '#delivery-options',
        '#checkout', '#payment', '#confirmation', '#payment-success',
        '#order-detail', '#order-details', '#customer-cancel-order',
        '#cancel-order-modal', '#profile', '#my-profile', '#customer-profile',
        '#my-orders', '#customer-orders', '#my-orders-completed',
        '#customer-orders-completed', '#my-orders-cancelled',
        '#customer-orders-cancelled', '#my-orders-declined',
        '#customer-orders-declined', '#cart', '#my-cart', '#shopping-cart', '#customer-cart'
      ].includes(hash);

      // Auth Guard: Require login before accessing any protected dashboard
      if (!activeUser && (isProtectedFarmer || isProtectedCustomer)) {
        setCurrentView('login');
        setAuthRole(isProtectedFarmer ? 'farmer' : 'customer');
        window.location.hash = '#login';
        showToast('Please log in or register first to access the dashboard.');
        return;
      }

      if (hash === '#login') {
        setCurrentView('login');
      } else if (hash === '#register' || hash === '#signup') {
        setCurrentView('register');
      } else if (hash === '#forgot-password') {
        setCurrentView('forgot-password');
      } else if (hash === '#farmer-onboarding') {
        setCurrentView('farmer-onboarding');
      } else if (hash === '#dashboard' || hash === '#farmer-dashboard') {
        setCurrentView('farmer-dashboard');
      } else if (hash === '#farm-profile' || hash === '#profile') {
        setCurrentView('farmer-profile');
      } else if (hash === '#inventory') {
        setCurrentView('inventory');
        setInitialAction(null);
      } else if (hash === '#delete-modal') {
        setCurrentView('inventory');
        setInitialAction('delete');
      } else if (hash === '#edit-product') {
        setCurrentView('inventory');
        setInitialAction('edit');
      } else if (hash === '#add-product') {
        setCurrentView('add-product');
      } else if (hash === '#orders') {
        setCurrentView('orders');
        setInitialModal(null);
        setInitialOrdersTab('New');
      } else if (hash === '#cancelled-orders') {
        setCurrentView('orders');
        setInitialOrdersTab('Cancelled');
        setInitialModal(null);
      } else if (hash === '#cancellation-request') {
        setCurrentView('orders');
        setInitialOrdersTab('Cancelled');
        setInitialModal('cancellation-request');
      } else if (hash === '#decline-order') {
        setCurrentView('orders');
        setInitialModal('select-reason');
      } else if (hash === '#confirm-decline') {
        setCurrentView('orders');
        setInitialModal('confirm-decline');
      } else if (hash === '#notification-sent') {
        setCurrentView('orders');
        setInitialModal('notification-sent');
      } else if (hash === '#decline-success') {
        setCurrentView('orders');
        setInitialModal('decline-success');
      } else if (hash === '#earnings') {
        setCurrentView('earnings');
      } else if (hash === '#browse-products' || hash === '#browse' || hash === '#products') {
        setCurrentView('customer-dashboard');
        setCustomerTab('browse');
      } else if (hash === '#search' || hash === '#search-results') {
        setCurrentView('customer-dashboard');
        setCustomerTab('search');
      } else if (hash === '#product-detail' || hash === '#item-detail') {
        setCurrentView('customer-dashboard');
        setCustomerTab('product-detail');
      } else if (hash === '#fulfillment' || hash === '#get-order' || hash === '#delivery-options') {
        setCurrentView('customer-dashboard');
        setCustomerTab('fulfillment');
      } else if (hash === '#checkout' || hash === '#payment') {
        setCurrentView('customer-dashboard');
        setCustomerTab('checkout');
      } else if (hash === '#confirmation' || hash === '#payment-success') {
        setCurrentView('customer-dashboard');
        setCustomerTab('confirmation');
      } else if (hash === '#order-detail' || hash === '#order-details') {
        setCurrentView('customer-dashboard');
        setCustomerTab('order-detail');
        setInitialModal(null);
      } else if (hash === '#customer-cancel-order' || hash === '#cancel-order-modal') {
        setCurrentView('customer-dashboard');
        setCustomerTab('order-detail');
        setInitialModal('cancel-order');
      } else if (hash === '#profile' || hash === '#my-profile' || hash === '#customer-profile') {
        setCurrentView('customer-dashboard');
        setCustomerTab('profile');
      } else if (hash === '#my-orders' || hash === '#customer-orders') {
        setCurrentView('customer-dashboard');
        setCustomerTab('orders');
        setCustomerOrdersSubTab('active');
      } else if (hash === '#my-orders-completed' || hash === '#customer-orders-completed') {
        setCurrentView('customer-dashboard');
        setCustomerTab('orders');
        setCustomerOrdersSubTab('completed');
      } else if (hash === '#my-orders-cancelled' || hash === '#customer-orders-cancelled') {
        setCurrentView('customer-dashboard');
        setCustomerTab('orders');
        setCustomerOrdersSubTab('cancelled');
      } else if (hash === '#my-orders-declined' || hash === '#customer-orders-declined') {
        setCurrentView('customer-dashboard');
        setCustomerTab('orders');
        setCustomerOrdersSubTab('declined');
      } else if (hash === '#cart' || hash === '#my-cart' || hash === '#shopping-cart' || hash === '#customer-cart') {
        setCurrentView('customer-dashboard');
        setCustomerTab('cart');
      } else if (
        hash === '#customer' ||
        hash === '#customer-dashboard' ||
        hash === '#customer-home'
      ) {
        setCurrentView('customer-dashboard');
        setCustomerTab('overview');
      } else if (hash === '#home' || hash === '') {
        setCurrentView('landing');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (view, role = 'customer') => {
    const isProtectedFarmer = [
      'farmer-dashboard', 'farmer-profile', 'inventory', 'add-product',
      'orders', 'earnings', 'farmer-onboarding'
    ].includes(view);

    const isProtectedCustomer = [
      'customer-dashboard'
    ].includes(view);

    if ((isProtectedFarmer || isProtectedCustomer) && !currentUser) {
      setCurrentView('login');
      setAuthRole(isProtectedFarmer ? 'farmer' : 'customer');
      window.location.hash = '#login';
      showToast('Please log in first to access the dashboard.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setCurrentView(view);
    setAuthRole(role);
    window.location.hash = view === 'landing' ? '#home' : `#${view}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      showToast(`Searching for "${searchQuery}" in your area...`);
    }
  };

  const handleAuthSuccess = (user, role) => {
    if (user) {
      setCurrentUser(user);
    }
    const resolvedRole = role || user?.role || 'customer';
    setAuthRole(resolvedRole);
    if (resolvedRole === 'farmer') {
      navigateTo('farmer-dashboard', 'farmer');
    } else {
      navigateTo('customer-dashboard', 'customer');
    }
  };

  const handleLogout = () => {
    // 1. Immediately & synchronously wipe all local auth session keys
    clearAuthStorage();

    // 2. Clear user state
    setCurrentUser(null);
    setAuthRole('customer');

    // 3. Clear remote session in background
    authAPI.logout().catch(() => {});

    // 4. Force view to landing page
    setCurrentView('landing');
    window.location.hash = '#home';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // 5. Notify user
    showToast('Successfully logged out.');
  };

  // 1. Render Farmer Portal (Dashboard / Profile / Inventory / Add Product / Orders / Earnings)
  const farmerViews = [
    'farmer-dashboard',
    'farmer-profile',
    'inventory',
    'add-product',
    'orders',
    'earnings',
  ];

  if (farmerViews.includes(currentView)) {
    const initialTabMap = {
      'farmer-dashboard': 'dashboard',
      'farmer-profile': 'profile',
      'inventory': 'inventory',
      'add-product': 'add-product',
      'orders': 'orders',
      'earnings': 'earnings',
    };

    return (
      <div className="app-root">
        {toastMessage && (
          <div className="toast-notification">
            <span>{toastMessage}</span>
          </div>
        )}
        <FarmerPortal
          key={currentView + (initialModal || '') + (initialAction || '') + (initialOrdersTab || '') + (currentUser?.id || '')}
          initialTab={initialTabMap[currentView] || 'dashboard'}
          initialModal={initialModal}
          initialAction={initialAction}
          initialOrdersTab={initialOrdersTab}
          currentUser={currentUser}
          farmName={currentUser?.farm_name || (currentUser?.name ? `${currentUser.name}'s Farm` : "My Farm")}
          farmerName={currentUser?.name || "Farmer"}
          onLogout={handleLogout}
          showToast={showToast}
        />
      </div>
    );
  }

  // 2. Render Forgot Password View
  if (currentView === 'forgot-password') {
    return (
      <div className="app-root">
        {toastMessage && (
          <div className="toast-notification">
            <span>{toastMessage}</span>
          </div>
        )}
        <ForgotPassword
          onBackToLogin={() => navigateTo('login')}
          showToast={showToast}
        />
      </div>
    );
  }

  // 3. Render Farmer Onboarding View (Steps 1, 2, 3)
  if (currentView === 'farmer-onboarding') {
    return (
      <div className="app-root">
        {toastMessage && (
          <div className="toast-notification">
            <span>{toastMessage}</span>
          </div>
        )}
        <FarmerOnboarding
          onBackToHome={() => navigateTo('landing')}
          showToast={showToast}
        />
      </div>
    );
  }

  // 4. Render Customer Dashboard (Browse Products / Home - media_1793165216741_dc4c50e1.png)
  if (currentView === 'customer-dashboard') {
    return (
      <div className="app-root">
        {toastMessage && (
          <div className="toast-notification">
            <span>{toastMessage}</span>
          </div>
        )}
        <CustomerDashboard
          key={`${customerTab}-${customerOrdersSubTab}-${initialModal}-${currentUser?.id || currentUser?.name || ''}`}
          currentUser={currentUser}
          customerName={currentUser?.name || "Customer"}
          customerEmail={currentUser?.email || ""}
          customerPhone={currentUser?.phone || ""}
          initialTab={customerTab}
          initialOrdersSubTab={customerOrdersSubTab}
          initialModal={initialModal}
          onLogout={handleLogout}
          onProfileUpdate={(updated) => {
            setCurrentUser(prev => ({ ...prev, ...updated }));
          }}
          showToast={showToast}
        />
      </div>
    );
  }

  // 5. Render Auth View (Login / Register)
  if (currentView === 'login' || currentView === 'register') {
    return (
      <div className="app-root">
        {toastMessage && (
          <div className="toast-notification">
            <span>{toastMessage}</span>
          </div>
        )}
        <AuthPage
          initialMode={currentView}
          initialRole={authRole}
          onBackToHome={() => navigateTo('landing')}
          onForgotPassword={() => navigateTo('forgot-password')}
          onFarmerOnboarding={() => navigateTo('farmer-dashboard', 'farmer')}
          onCustomerDashboard={() => navigateTo('customer-dashboard', 'customer')}
          onAuthSuccess={handleAuthSuccess}
          showToast={showToast}
        />
      </div>
    );
  }

  // 5. Render Landing Page
  return (
    <div className="landing-page">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast-notification">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <header className="navbar">
        <div className="navbar-container">
          <nav className="nav-links">
            <a
              href="#home"
              className={`nav-link ${activeNav === 'home' ? 'active' : ''}`}
              onClick={() => setActiveNav('home')}
            >
              Home
            </a>
            <a
              href="#products"
              className={`nav-link ${activeNav === 'products' ? 'active' : ''}`}
              onClick={() => {
                setActiveNav('products');
                navigateTo('customer-dashboard', 'customer');
              }}
            >
              Browse Products
            </a>
            <a
              href="#about"
              className={`nav-link ${activeNav === 'about' ? 'active' : ''}`}
              onClick={() => {
                setActiveNav('about');
                document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              About
            </a>
            <a
              href="#how-it-works"
              className={`nav-link ${activeNav === 'how-it-works' ? 'active' : ''}`}
              onClick={() => {
                setActiveNav('how-it-works');
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              How it Works
            </a>
          </nav>

          <form className="nav-search-form" onSubmit={handleSearch}>
            <div className="search-pill">
              <svg
                className="search-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search for products"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          <div className="auth-buttons">
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '13.5px', fontWeight: '700', color: '#17331b' }}>
                  {currentUser.name}
                </span>
                <button
                  className="btn-login"
                  onClick={() => navigateTo(currentUser.role === 'farmer' ? 'farmer-dashboard' : 'customer-dashboard', currentUser.role)}
                >
                  Dashboard
                </button>
                <button
                  className="btn-signup"
                  style={{ background: '#b91c1c' }}
                  onClick={handleLogout}
                >
                  Log out
                </button>
              </div>
            ) : (
              <>
                <button
                  className="btn-login"
                  onClick={() => navigateTo('login')}
                >
                  Login
                </button>
                <button
                  className="btn-signup"
                  onClick={() => navigateTo('register')}
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section" id="home">
        <div className="hero-main-container">
          <div className="hero-content-row">
            {/* Left Column: Logo, Heading, Tagline */}
            <div className="hero-left-col">
              <div className="logo-container">
                <img src="/logo.png" alt="UmaHub" className="umahub-logo" />
              </div>

              <h1 className="hero-heading">
                <span className="heading-dark">Fresh from</span>
                <br />
                <span className="heading-green">local farms.</span>
              </h1>

              <div className="hero-tagline">
                <p>Mag-uuma, Atong Suportahan.</p>
                <p>Preskong Ani, Para sa Inyoha!</p>
              </div>
            </div>

            {/* Right Column: High-Res gulay.png with floating badges */}
            <div className="hero-right-col">
              <div className="hero-graphic-container">
                <img
                  src={gulayImg}
                  alt="Fresh harvest of vegetables: ampalaya, carrots, cucumbers, and peppers"
                  className="hero-gulay-image"
                />

                {/* Floating Badge 1: Top Right - Always fresh */}
                <div className="floating-badge badge-always-fresh">
                  <div className="badge-icon-circle">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#223B25"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="badge-svg"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="badge-text-box">
                    <span className="badge-title">Always fresh</span>
                    <span className="badge-sub">Direct from verified farms</span>
                  </div>
                </div>

                {/* Floating Badge 2: Middle Left - Harvested today */}
                <div className="floating-badge badge-harvested-today">
                  <img
                    src={mangbenImg}
                    alt="Mang Ben harvesting in field"
                    className="badge-farmer-avatar"
                  />
                  <div className="badge-text-box">
                    <span className="badge-title">Harvested today</span>
                    <span className="badge-sub">Mang Ben, Bunawan ADS</span>
                  </div>
                </div>

                {/* Floating Badge 3: Bottom Right - Easy and Secure */}
                <div className="floating-badge badge-easy-secure">
                  <div className="safe-stamp-badge">
                    <span className="safe-stamp-text">SAFE</span>
                  </div>
                  <div className="badge-text-box">
                    <span className="badge-title">Easy and Secure</span>
                    <span className="badge-sub">simple ordering and safe transaction</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Bottom Banner Band: CTA Buttons & Social Proof Stats */}
        <div className="hero-bottom-band">
          <div className="hero-bottom-container">
            <div className="hero-actions-group">
              <div className="cta-button-row">
                <button
                  className="btn-customer"
                  onClick={() => navigateTo('customer-dashboard', 'customer')}
                >
                  <span>I’m a Customer</span>
                  <span className="arrow-icon">→</span>
                </button>
                <button
                  className="btn-farmer"
                  onClick={() => navigateTo('farmer-dashboard', 'farmer')}
                >
                  I’m a Farmer
                </button>
              </div>

              <div className="stats-row">
                <div className="stat-item">
                  <div className="stat-number">1,200+</div>
                  <div className="stat-label">local buyers</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">80+</div>
                  <div className="stat-label">partner farms</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">4.9</div>
                  <div className="stat-label">average rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Spacer before dark green section */}
        <div className="hero-bottom-spacer"></div>
      </section>

      {/* WHY UMAHUB Section */}
      <section className="why-umahub-section" id="about">
        <div className="why-container">
          <div className="section-tag-light">WHY UMAHUB</div>
          
          <div className="why-grid">
            <div className="why-left">
              <h2 className="why-heading">
                Good food shouldn’t
                <br />
                travel so far.
              </h2>
            </div>

            <div className="why-right">
              {/* Problem Card */}
              <div className="problem-card">
                <div className="card-tag tag-problem">THE PROBLEM</div>
                <p className="card-body">
                  Farmers struggle to reach nearby customers, while families pay more for produce that’s traveled for days.
                </p>
              </div>

              {/* Solution Card */}
              <div className="solution-card">
                <div className="card-tag tag-solution">OUR SOLUTION</div>
                <p className="card-body">
                  UmaHub connects neighborhoods directly with local growers—for fresher food and fairer earnings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SIMPLE & LOCAL / Three Steps Section */}
      <section className="steps-section" id="how-it-works">
        <div className="steps-container">
          <div className="section-tag-dark">SIMPLE & LOCAL</div>

          <div className="steps-header-row">
            <h2 className="steps-main-heading">
              From farm to table
              <br />
              in three easy steps.
            </h2>
            <p className="steps-header-desc">
              We make it easy to discover, order, and enjoy produce grown near you.
            </p>
          </div>

          <div className="steps-cards-grid">
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-card-top">
                <div className="step-icon-box">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2D5A27"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="step-svg"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <span className="step-number">01</span>
              </div>
              <h3 className="step-title">Discover nearby</h3>
              <p className="step-desc">
                Browse fresh produce from verified farms in your area.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-card-top">
                <div className="step-icon-box">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2D5A27"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="step-svg"
                  >
                    <circle cx="9" cy="21" r="1" />
                    <circle cx="20" cy="21" r="1" />
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                  </svg>
                </div>
                <span className="step-number">02</span>
              </div>
              <h3 className="step-title">Order your way</h3>
              <p className="step-desc">
                Choose pickup or delivery and pay with your preferred method.
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-card-top">
                <div className="step-icon-box">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#2D5A27"
                    strokeWidth="2.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="step-svg"
                  >
                    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
                  </svg>
                </div>
                <span className="step-number">03</span>
              </div>
              <h3 className="step-title">Enjoy it fresh</h3>
              <p className="step-desc">
                Receive farm-fresh produce while supporting local livelihoods.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Banner Section */}
      <section className="cta-banner-section">
        <div className="cta-banner-container">
          <div className="cta-banner-card">
            {/* Background decorative subtle circular line */}
            <div className="cta-deco-circle"></div>

            <div className="cta-banner-content">
              <div className="cta-text-group">
                <div className="cta-tag">READY TO GET STARTED?</div>
                <h2 className="cta-heading">
                  Good food grows
                  <br />
                  closer than you think.
                </h2>
              </div>

              <div className="cta-button-group">
                <button
                  className="btn-join-today"
                  onClick={() => navigateTo('register')}
                >
                  Join UmaHub today <span className="arrow-icon">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer-section">
        <div className="footer-container">
          <div className="footer-col footer-taglines">
            <p>Fresh produce. Fair prices.</p>
            <p>Stronger local communities.</p>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Marketplace</h4>
            <ul className="footer-links-list">
              <li>
                <a
                  href="#products"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast('Opening produce marketplace...');
                  }}
                >
                  Browse products
                </a>
              </li>
              <li>
                <a
                  href="#farmers"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateTo('farmer-dashboard');
                  }}
                >
                  Become a farmer
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-col-title">Support</h4>
            <ul className="footer-links-list">
              <li>
                <a
                  href="#how-it-works"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  How it works
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={(e) => {
                    e.preventDefault();
                    showToast('Contact support: support@umahub.ph');
                  }}
                >
                  Contact us
                </a>
              </li>
            </ul>
          </div>

          <div className="footer-col footer-credits">
            <p className="copyright-text">© 2026 UmaHub</p>
            <p className="made-in-text">Made with care in the Philippines</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
