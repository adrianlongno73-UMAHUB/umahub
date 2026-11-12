import React, { useState } from 'react';
import gulay1Img from '../image/gulay1.png';
import './CustomerDashboard.css';

function CustomerProductDetail({
  product = null,
  onBack = () => {},
  onAddToCart = () => {},
  showToast = () => {}
}) {
  const currentProduct = product || {
    id: 1,
    name: 'Fresh Tomatoes',
    category: 'VEGETABLES',
    price: 90.0,
    rawPrice: 90.0,
    unit: 'kg',
    rating: '4.9',
    reviewsCount: 32,
    badge: 'Just harvested',
    description:
      'Sweet, juicy tomatoes harvested this morning. Grown naturally and carefully hand-picked for your table.',
    farm: "Fresh Local Farm",
    location: 'Bunawan, Agusan del Sur',
    userLocation: 'Bunawan, Agusan del Sur',
    img: gulay1Img,
  };

  const [quantity, setQuantity] = useState(1);

  const numPrice = typeof currentProduct.rawPrice === 'number'
    ? currentProduct.rawPrice
    : parseFloat(String(currentProduct.price).replace(/[^0-9.]/g, '')) || 0;

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity((q) => q - 1);
    }
  };

  const handleIncrease = () => {
    setQuantity((q) => q + 1);
  };

  const totalPrice = (numPrice * quantity).toFixed(2);

  const handleAdd = () => {
    onAddToCart({
      ...currentProduct,
      price: numPrice,
      pricePerUnit: numPrice,
      quantity,
    });
    showToast(`Added ${quantity}${currentProduct.unit || 'kg'} ${currentProduct.name} (₱${totalPrice}) to your cart!`);
  };

  return (
    <div className="customer-product-detail-view">
      {/* Top Breadcrumb & User Location Row */}
      <div className="product-detail-top-nav">
        <div className="product-detail-location-note">
          <span className="location-note-label">Your location</span>
          <span className="location-note-val">{currentProduct.userLocation || 'Bunawan, Agusan del Sur'}</span>
        </div>

        <button type="button" className="btn-back-to-browse" onClick={onBack}>
          ← Back to browse
        </button>
      </div>

      {/* Main Two Column Detail Layout */}
      <div className="product-detail-main-layout">
        {/* Left Column: Big Product Image */}
        <div className="product-detail-image-box">
          <img
            src={currentProduct.img || gulay1Img}
            alt={currentProduct.name}
            className="product-detail-large-photo"
          />
          <span className="badge-detail-just-harvested">
            {currentProduct.badge || 'Just harvested'}
          </span>
        </div>

        {/* Right Column: Product Meta & Purchase Controls */}
        <div className="product-detail-info-col">
          <span className="detail-category-tag">{currentProduct.category}</span>
          <h1 className="detail-product-title">{currentProduct.name}</h1>

          <div className="detail-rating-row">
            <span className="rating-star-num">★ {currentProduct.rating}</span>
            <span className="rating-divider-dot">·</span>
            <span className="reviews-count-text">{currentProduct.reviewsCount} reviews</span>
          </div>

          <div className="detail-price-headline">
            ₱{numPrice.toFixed(2)} / {currentProduct.unit}
          </div>

          <p className="detail-description-para">{currentProduct.description}</p>

          {/* Farm Card */}
          <div
            className="detail-farm-card"
            onClick={() => showToast(`Viewing profile of ${currentProduct.farm}`)}
          >
            <h3 className="detail-farm-name">{currentProduct.farm}</h3>
            <p className="detail-farm-sub">{currentProduct.location}</p>
          </div>

          {/* Quantity and Add to Cart Row */}
          <div className="detail-purchase-section">
            <span className="qty-input-label">Quantity ({currentProduct.unit === 'kilogram' ? 'kg' : currentProduct.unit})</span>

            <div className="detail-action-buttons-row">
              {/* Counter Pill */}
              <div className="detail-qty-pill">
                <button
                  type="button"
                  className="btn-detail-qty"
                  onClick={handleDecrease}
                  title="Decrease quantity"
                >
                  —
                </button>
                <span className="detail-qty-val">{quantity}</span>
                <button
                  type="button"
                  className="btn-detail-qty"
                  onClick={handleIncrease}
                  title="Increase quantity"
                >
                  +
                </button>
              </div>

              {/* Big Green Add to Cart Button */}
              <button
                type="button"
                className="btn-detail-add-cart"
                onClick={handleAdd}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="cart-add-btn-icon">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                <span>Add to Cart · ₱{totalPrice}</span>
              </button>
            </div>
          </div>

          {/* Trust Highlights Badge Card */}
          <div className="detail-trust-features-card">
            <div className="trust-feature-item">
              <span className="trust-feature-icon">🍃</span>
              <div className="trust-feature-text">
                <strong>Farm fresh</strong>
                <span>Picked within 24 hours</span>
              </div>
            </div>

            <div className="trust-feature-item">
              <span className="trust-feature-icon">📦</span>
              <div className="trust-feature-text">
                <strong>Local delivery</strong>
                <span>Pickup also available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerProductDetail;