import React, { useState } from 'react';
import { authAPI } from '../services/api';
import './ForgotPassword.css';

function ForgotPassword({ onBackToLogin, showToast }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email address.');
      return;
    }
    authAPI.forgotPassword(email).catch(() => {});
    setSubmitted(true);
    showToast(`Password reset link sent to ${email}`);
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-card">
        <h1 className="forgot-title">Forgot password?</h1>
        <p className="forgot-desc">
          Enter the email linked to your farm account. We’ll send a reset link.
        </p>

        {submitted ? (
          <div className="reset-sent-box">
            <div className="reset-sent-icon">✓</div>
            <p className="reset-sent-text">
              Check your inbox! We’ve sent a password reset link to <strong>{email}</strong>.
            </p>
            <button
              type="button"
              className="forgot-submit-btn"
              onClick={onBackToLogin}
            >
              Return to log in
            </button>
          </div>
        ) : (
          <form className="forgot-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="forgot-email">
                Email
              </label>
              <input
                id="forgot-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="forgot-submit-btn">
              Send reset link
            </button>

            <div className="forgot-footer-row">
              <button
                type="button"
                className="back-to-login-link"
                onClick={onBackToLogin}
              >
                Back to log in
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
