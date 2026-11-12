import React, { useState } from 'react';
import loginRegisterImg from '../image/loginRegister.png';
import { authAPI } from '../services/api';
import UserAgreementModal from './UserAgreementModal';
import './AuthPage.css';

function AuthPage({
  initialMode = 'register',
  initialRole = 'customer',
  onBackToHome,
  onForgotPassword,
  onFarmerOnboarding,
  onCustomerDashboard,
  onAuthSuccess,
  showToast
}) {
  const [mode, setMode] = useState(initialMode); // 'register' or 'login'
  const [role, setRole] = useState(initialRole); // 'customer' or 'farmer'

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  // Real-time password criteria evaluation
  const passwordCriteria = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password)
  };

  const isPasswordValid =
    passwordCriteria.minLength &&
    passwordCriteria.hasUpper &&
    passwordCriteria.hasLower &&
    passwordCriteria.hasNumber &&
    passwordCriteria.hasSpecial;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || (mode === 'register' && !fullName)) {
      showToast('Please fill in all required fields.');
      return;
    }

    if (mode === 'register') {
      if (!isPasswordValid) {
        showToast('Palihug sunda ang tanang 5 ka password requirements una mo-proceed.');
        return;
      }

      if (!agreementAccepted) {
        setShowAgreementModal(true);
        showToast(`Please review and accept the ${role === 'farmer' ? 'Farmer' : 'Customer'} User Agreement to complete registration.`);
        return;
      }
    }

    try {
      if (mode === 'register') {
        const res = await authAPI.register({
          name: fullName,
          email,
          password,
          role
        });

        // Clear all form inputs
        setFullName('');
        setEmail('');
        setPassword('');
        setShowPassword(false);
        setAgreementAccepted(false);

        // Switch to login mode so user manually inputs credentials
        setMode('login');

        showToast(res.message || 'Account created successfully! Please log in with your email and password.');
      } else {
        const res = await authAPI.login({
          email,
          password,
          role
        });
        const finalRole = res.user?.role || role;
        showToast(res.message || `Logged in as ${res.user?.name || (finalRole === 'admin' ? 'Admin' : (finalRole === 'farmer' ? 'Farmer' : 'Customer'))}!`);
        if (onAuthSuccess) {
          onAuthSuccess(res.user, finalRole);
        } else if (finalRole === 'admin') {
          window.location.hash = '#admin';
        } else if (finalRole === 'farmer') {
          if (onFarmerOnboarding) onFarmerOnboarding(res.user);
        } else {
          if (onCustomerDashboard) onCustomerDashboard(res.user);
          else onBackToHome();
        }
      }
    } catch (err) {
      showToast(err.message || 'Authentication error.');
    }
  };

  const [isSocialLoading, setIsSocialLoading] = useState(false);

  const handleSocialAuth = async (provider) => {
    try {
      setIsSocialLoading(true);
      showToast(`Connecting to ${provider === 'google' ? 'Google' : 'Facebook'}...`);
      await authAPI.signInWithOAuth(provider, role);
    } catch (err) {
      showToast(err.message || `Failed to connect to ${provider}.`);
      setIsSocialLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      {/* Top Bar with Back Button and Logo */}
      <div className="auth-top-bar">
        <button className="auth-back-btn" onClick={onBackToHome}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="back-arrow-svg">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span>Back to UmaHub</span>
        </button>

        <img
          src="/logo.png"
          alt="UmaHub"
          className="auth-header-logo"
          onClick={onBackToHome}
        />
      </div>

      {/* Main Auth Split Card */}
      <div className="auth-card-container">
        {/* Left Column: Image with Overlaid Text */}
        <div className="auth-image-col">
          <img
            src={loginRegisterImg}
            alt="Farmers planting in lush field"
            className="auth-banner-img"
          />
          <div className="auth-image-overlay">
            <h2 className="overlay-heading">
              mobile and web marketplace that connects easily to local farmers with nearby customers.
            </h2>
            <p className="overlay-sub">
              Join a marketplace that makes every harvest count.
            </p>
          </div>
        </div>

        {/* Right Column: Interactive Form */}
        <div className="auth-form-col">
          <div className="auth-form-header">
            <div className="auth-top-tag">
              {mode === 'register' ? 'CREATE YOUR ACCOUNT' : 'WELCOME BACK'}
            </div>
            <h1 className="auth-main-title">
              {mode === 'register' ? 'Join UmaHub' : 'Login to UmaHub'}
            </h1>
            <p className="auth-sub-desc">
              Fresh produce and better opportunities are one step away.
            </p>
          </div>

          {/* Role Selector: Customer vs Farmer */}
          <div className="role-selector-section">
            <label className="role-selector-label">
              {mode === 'register' ? 'I’m joining as' : 'I’m logging in as'}
            </label>
            <div className="role-options-grid">
              {/* Customer Option */}
              <button
                type="button"
                className={`role-option-card ${role === 'customer' ? 'active' : ''}`}
                onClick={() => setRole('customer')}
              >
                <div className="role-icon-box">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="role-svg">
                    <path d="M20 6h-3V4c0-1.1-.9-2-2-2h-6c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-11-2h6v2H9V4zm11 15H4V8h16v11z" />
                  </svg>
                </div>
                <div className="role-info">
                  <span className="role-title">Customer</span>
                  <span className="role-sub">Shop local produce</span>
                </div>
              </button>

              {/* Farmer Option */}
              <button
                type="button"
                className={`role-option-card ${role === 'farmer' ? 'active' : ''}`}
                onClick={() => setRole('farmer')}
              >
                <div className="role-icon-box">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="role-svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                  </svg>
                </div>
                <div className="role-info">
                  <span className="role-title">Farmer</span>
                  <span className="role-sub">Sell your harvest</span>
                </div>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <form className="auth-main-form" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div className="form-group">
                <label className="form-label" htmlFor="fullName">Full name</label>
                <input
                  id="fullName"
                  type="text"
                  className="form-input"
                  placeholder="Aike Adorador"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="You@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input password-input-field"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Password Requirements Checklist (Register Mode) */}
              {mode === 'register' && (
                <div className="password-criteria-list" aria-live="polite">
                  <div className="password-criteria-title">Password requirements:</div>
                  <div className={`password-criteria-item ${passwordCriteria.minLength ? 'valid' : ''}`}>
                    <span className="criteria-icon">{passwordCriteria.minLength ? '✓' : '•'}</span>
                    <span><strong>Minimum 8 characters</strong> – Kinahanglan 8 ka characters or more.</span>
                  </div>
                  <div className={`password-criteria-item ${passwordCriteria.hasUpper ? 'valid' : ''}`}>
                    <span className="criteria-icon">{passwordCriteria.hasUpper ? '✓' : '•'}</span>
                    <span><strong>At least 1 uppercase letter</strong> – Naay capital letter (A–Z).</span>
                  </div>
                  <div className={`password-criteria-item ${passwordCriteria.hasLower ? 'valid' : ''}`}>
                    <span className="criteria-icon">{passwordCriteria.hasLower ? '✓' : '•'}</span>
                    <span><strong>At least 1 lowercase letter</strong> – Naay small letter (a–z).</span>
                  </div>
                  <div className={`password-criteria-item ${passwordCriteria.hasNumber ? 'valid' : ''}`}>
                    <span className="criteria-icon">{passwordCriteria.hasNumber ? '✓' : '•'}</span>
                    <span><strong>At least 1 number</strong> – Naay numero (0–9).</span>
                  </div>
                  <div className={`password-criteria-item ${passwordCriteria.hasSpecial ? 'valid' : ''}`}>
                    <span className="criteria-icon">{passwordCriteria.hasSpecial ? '✓' : '•'}</span>
                    <span><strong>At least 1 special character</strong> – Naay symbol like @ # $ % ! & *.</span>
                  </div>
                </div>
              )}
            </div>

            {/* User Agreement Row for Registration */}
            {mode === 'register' && (
              <div className="auth-agreement-row">
                <label className="auth-agreement-label">
                  <input
                    type="checkbox"
                    className="auth-agreement-checkbox"
                    checked={agreementAccepted}
                    onChange={(e) => setAgreementAccepted(e.target.checked)}
                  />
                  <span className="auth-agreement-text">
                    I agree to the{' '}
                    <button
                      type="button"
                      className="auth-agreement-link"
                      onClick={() => setShowAgreementModal(true)}
                    >
                      {role === 'farmer' ? 'Farmer User Agreement' : 'Customer User Agreement'}
                    </button>{' '}
                    and Privacy Policy.
                  </span>
                </label>
              </div>
            )}

            {/* Submit Button */}
            <button type="submit" className="auth-submit-btn">
              <span>{mode === 'register' ? 'Create account' : 'Log in'}</span>
              <span className="btn-arrow">→</span>
            </button>

            {/* Forgot Password link in Login mode */}
            {mode === 'login' && (
              <div className="forgot-password-row">
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={onForgotPassword}
                >
                  Forgot Password
                </button>
              </div>
            )}
          </form>

          {/* Mode Switcher */}
          <div className="auth-switch-row">
            {mode === 'register' ? (
              <p className="auth-switch-text">
                Already have an account?{' '}
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => {
                    setMode('login');
                    setFullName('');
                    setEmail('');
                    setPassword('');
                    setShowPassword(false);
                    setAgreementAccepted(false);
                  }}
                >
                  Log in
                </button>
              </p>
            ) : (
              <p className="auth-switch-text">
                Don’t have an account?{' '}
                <button
                  type="button"
                  className="auth-switch-link"
                  onClick={() => {
                    setMode('register');
                    setFullName('');
                    setEmail('');
                    setPassword('');
                    setShowPassword(false);
                    setAgreementAccepted(false);
                  }}
                >
                  Create account
                </button>
              </p>
            )}
          </div>

          {/* Social Logins */}
          <div className="social-auth-row">
            <button
              type="button"
              className="social-auth-btn"
              onClick={() => handleSocialAuth('google')}
              disabled={isSocialLoading}
              title={`Sign in with Google as ${role === 'farmer' ? 'Farmer' : 'Customer'}`}
            >
              <svg viewBox="0 0 24 24" className="social-svg">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z" />
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.41 7.34 24 12 24z" />
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z" />
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.59 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
              </svg>
              <span>{mode === 'register' ? 'Sign up with Google' : 'Log in with Google'}</span>
            </button>

            <button
              type="button"
              className="social-auth-btn"
              onClick={() => handleSocialAuth('facebook')}
              disabled={isSocialLoading}
              title={`Sign in with Facebook as ${role === 'farmer' ? 'Farmer' : 'Customer'}`}
            >
              <svg viewBox="0 0 24 24" className="social-svg">
                <path fill="#1877F2" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>{mode === 'register' ? 'Sign up with Facebook' : 'Log in with Facebook'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* User Agreement Modal */}
      <UserAgreementModal
        isOpen={showAgreementModal}
        onClose={() => setShowAgreementModal(false)}
        onAgree={() => {
          setAgreementAccepted(true);
          showToast(`${role === 'farmer' ? 'Farmer' : 'Customer'} User Agreement accepted.`);
        }}
        userRole={role}
      />
    </div>
  );
}

export default AuthPage;
