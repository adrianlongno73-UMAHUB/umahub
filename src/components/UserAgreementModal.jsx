import React, { useEffect } from 'react';
import './UserAgreementModal.css';

function UserAgreementModal({
  isOpen = false,
  onClose = () => {},
  onAgree = () => {},
  userRole = 'customer'
}) {
  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isFarmer = userRole === 'farmer';
  const agreementTitle = isFarmer ? 'Farmer User Agreement' : 'Customer User Agreement';

  const customerSections = [
    {
      num: '01',
      title: 'Account eligibility and accuracy',
      desc: 'You must be at least 18 years old and provide accurate, complete, and current information. You are responsible for protecting your password and all activity under your account.'
    },
    {
      num: '02',
      title: 'Orders and payment',
      desc: 'An order becomes binding when confirmed by the farmer. You authorize UmaHub and its payment partners to collect the displayed product price, delivery charges, and applicable fees. Prices are shown in Philippine Peso.'
    },
    {
      num: '03',
      title: 'Delivery, pickup, and inspection',
      desc: 'Provide a complete delivery address or arrive within the agreed pickup window. Inspect produce upon receipt and report missing, damaged, or materially different items through UmaHub within 24 hours.'
    },
    {
      num: '04',
      title: 'Cancellation and refunds',
      desc: 'Cancellation is allowed before a farmer begins preparation. After preparation, cancellation may be denied for perishable goods. Approved refunds are returned through the original payment method, subject to processing times.'
    },
    {
      num: '05',
      title: 'Respectful marketplace conduct',
      desc: 'Do not harass farmers, misuse reviews, make fraudulent claims, evade payment, or use UmaHub for unlawful activity. Serious or repeated violations may result in account suspension.'
    },
    {
      num: '06',
      title: 'Privacy and data use',
      desc: 'Your personal data is collected and processed in accordance with Republic Act No. 10173 (Data Privacy Act of 2012) and UmaHub\'s Privacy Policy to fulfill orders, facilitate deliveries, communicate updates, and continuously improve platform services.'
    },
    {
      num: '07',
      title: 'Limitation of liability & dispute mediation',
      desc: 'UmaHub facilitates direct trade between local farmers and consumers. While UmaHub actively assists in mediation and quality oversight, individual sellers remain responsible for produce freshness, weight accuracy, and order fulfillment.'
    },
    {
      num: '08',
      title: 'Modifications and termination',
      desc: 'UmaHub reserves the right to update these terms to reflect operational or regulatory updates. Continued use of our marketplace following published changes constitutes your acceptance of the revised agreement.'
    }
  ];

  const farmerSections = [
    {
      num: '01',
      title: 'Farmer eligibility & verification',
      desc: 'You must provide genuine identification, valid farm location details, and proof of agricultural activity. All seller accounts undergo administrative review prior to live product listing activation.'
    },
    {
      num: '02',
      title: 'Produce quality and accurate representation',
      desc: 'You represent that all harvested goods posted on UmaHub are safe, freshly harvested, and truthfully described in terms of pricing, unit weights, and organic/conventional farming standards.'
    },
    {
      num: '03',
      title: 'Order fulfillment and dispatch',
      desc: 'Farmers agree to confirm incoming orders promptly, harvest or prepare products cleanly, and dispatch items within the agreed fulfillment schedule to maintain optimal produce quality.'
    },
    {
      num: '04',
      title: 'Platform commission and payouts',
      desc: 'UmaHub applies a standard 5% commission on completed marketplace orders. Net proceeds are remitted to your registered bank or GCash/Maya payout method upon confirmed customer receipt.'
    },
    {
      num: '05',
      title: 'Respectful trade & customer relations',
      desc: 'Farmers agree to engage with customers and administrators with fairness, integrity, and prompt responses regarding product inquiries or delivery coordination.'
    },
    {
      num: '06',
      title: 'Privacy and consumer data confidentiality',
      desc: 'Customer contact details and delivery addresses provided for fulfillment must not be shared, marketed to, or disclosed outside official UmaHub order transactions.'
    }
  ];

  const sectionsToDisplay = isFarmer ? farmerSections : customerSections;

  return (
    <div
      className="user-agreement-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-agreement-heading"
    >
      <div
        className="user-agreement-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="user-agreement-header">
          <div className="user-agreement-header-left">
            <span className="user-agreement-badge">
              UmaHub Legal · Version 1.0
            </span>
            <h2 id="user-agreement-heading" className="user-agreement-title">
              {agreementTitle}
            </h2>
            <p className="user-agreement-subtitle">
              Effective March 18, 2026 · Philippines
            </p>
          </div>

          <button
            type="button"
            className="user-agreement-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
            title="Close"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Notice Banner */}
        <div className="user-agreement-notice-wrapper">
          <div className="user-agreement-notice">
            <div className="user-agreement-notice-icon">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </div>
            <p className="user-agreement-notice-text">
              This agreement explains your rights and responsibilities when using UmaHub. Please read every section carefully before accepting.
            </p>
          </div>
        </div>

        {/* Scrollable Sections List */}
        <div className="user-agreement-body">
          {sectionsToDisplay.map((sec) => (
            <div key={sec.num} className="user-agreement-section-item">
              <span className="user-agreement-num-badge">{sec.num}</span>
              <div className="user-agreement-section-content">
                <h3 className="user-agreement-section-heading">{sec.title}</h3>
                <p className="user-agreement-section-desc">{sec.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="user-agreement-footer">
          <div className="user-agreement-consent-info">
            <svg
              className="user-agreement-check-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#1F5230"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <div className="user-agreement-consent-texts">
              <span className="user-agreement-consent-title">
                Electronic consent
              </span>
              <span className="user-agreement-consent-sub">
                By accepting, you confirm that you read, understood, and agree to this document.
              </span>
            </div>
          </div>

          <div className="user-agreement-actions">
            <button
              type="button"
              className="user-agreement-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="user-agreement-agree-btn"
              onClick={() => {
                onAgree();
                onClose();
              }}
            >
              <span>I have read and agree</span>
              <span>✓</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserAgreementModal;
