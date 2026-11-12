import React, { useState, useEffect } from 'react';
import gulay1Img from '../image/gulay1.png';
import gulay4Img from '../image/gulay4.png';
import emptycardbgImg from '../image/emptycardbg.png';
import gulay5Img from '../image/gulay5.png';
import gulay6Img from '../image/gulay6.png';
import gulay7Img from '../image/gulay7.png';
import { cartAPI } from '../services/api';
import './CustomerDashboard.css';

function CustomerCart({
  onCheckout = () => {},
  onContinueShopping = () => {},
  showToast = () => {}
}) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    cartAPI.get()
      .then((res) => {
        if (isMounted) {
          if (res.items && res.items.length > 0) {
            const imageMap = {
              'Fresh Tomatoes': gulay1Img,
              'Carrots': gulay4Img,
              'Native Carrots': gulay6Img,
              'Siling Labuyo': gulay7Img,
            };
            const mapped = res.items.map((item, idx) => ({
              id: item.product_id || item.id || idx + 1,
              product_id: item.product_id || item.id,
              farmer_id: item.farmer_id || null,
              name: item.name,
              pricePerUnit: parseFloat(item.price || item.pricePerUnit || 0),
              unit: item.unit ? (String(item.unit).startsWith('/') ? item.unit : `/${item.unit}`) : '/kg',
              quantity: item.quantity,
              farm: item.farm || item.farm_name || "Fresh Local Farm",
              location: item.location || 'Bunawan',
              img: item.img || item.image_url || imageMap[item.name] || [gulay1Img, gulay4Img][idx % 2],
            }));
            setCartItems(mapped);
          } else {
            setCartItems([]);
          }
        }
      })
      .catch(() => {
        if (isMounted) setCartItems([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  const popularItems = [
    {
      id: 101,
      name: 'Fresh Tomatoes',
      farm: 'Fresh Local Farm',
      pricePerUnit: 90,
      unit: '/ kg',
      badge: 'Harvested today',
      img: gulay5Img,
    },
    {
      id: 102,
      name: 'Native Carrots',
      farm: 'Bunawan Growers',
      pricePerUnit: 75,
      unit: '/ 500 g',
      badge: null,
      img: gulay6Img,
    },
    {
      id: 103,
      name: 'Siling Labuyo',
      farm: 'Fresh Local Farm',
      pricePerUnit: 60,
      unit: '/ 250 g',
      badge: null,
      img: gulay7Img,
    },
  ];

  const handleUpdateQuantity = (id, delta) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty > 0) {
              cartAPI.update(id, newQty).catch(() => {});
              return { ...item, quantity: newQty };
            }
            cartAPI.remove(id).catch(() => {});
            return null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const handleRemoveItem = (id, name) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
    cartAPI.remove(id).catch(() => {});
    showToast(`Removed ${name} from your cart.`);
  };

  const handleAddPopularItem = (item) => {
    cartAPI.add(item.id, 1).catch(() => {});
    setCartItems((prev) => {
      const existing = prev.find((p) => p.name === item.name);
      if (existing) {
        return prev.map((p) =>
          p.name === item.name ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [
        ...prev,
        {
          id: item.id || Date.now(),
          name: item.name,
          pricePerUnit: item.pricePerUnit,
          unit: item.unit,
          quantity: 1,
          farm: item.farm,
          location: 'Bunawan',
          img: item.img,
        },
      ];
    });
    showToast(`Added ${item.name} to cart!`);
  };

  const calculateSubtotal = (item) => item.pricePerUnit * item.quantity;

  const cartTotal = cartItems.reduce(
    (total, item) => total + calculateSubtotal(item),
    0
  );

  const totalItemCount = cartItems.reduce(
    (count, item) => count + item.quantity,
    0
  );

  return (
    <div className="customer-cart-view-container">
      {/* Header Info */}
      <div className="cart-header-group">
        {cartItems.length > 0 && <span className="cart-super-tag">YOUR BASKET</span>}
        <h1 className="cart-main-title">Shopping cart</h1>
        {cartItems.length > 0 && (
          <p className="cart-sub-desc">
            {cartItems.length} item ready from a local farm
          </p>
        )}
      </div>

      {loading ? (
        <div style={{ padding: '60px', textAlign: 'center', color: '#527853', fontSize: '15px' }}>
          Loading your basket from database...
        </div>
      ) : cartItems.length === 0 ? (
        /* Empty Cart View matching media_1793168374291_68103b98.png */
        <div className="empty-cart-full-view">
          {/* Top Banner Card with emptycardbg.png */}
          <div
            className="empty-cart-hero-banner"
            style={{ backgroundImage: `url(${emptycardbgImg})` }}
          >
            <div className="empty-cart-banner-text-content">
              <h2 className="empty-cart-headline">Your cart is empty</h2>
              <p className="empty-cart-subtext">
                Looks like you haven't added any fresh produce yet. Browse products from local farms and support our local farmers!
              </p>
              <button
                type="button"
                className="btn-browse-fresh-produce-empty"
                onClick={onContinueShopping}
              >
                <span className="leaf-icon-tag">🍃</span>
                <span>Browse fresh produce</span>
              </button>
            </div>
          </div>

          {/* Popular Near You Section with gulay5, gulay6, gulay7 */}
          <section className="empty-cart-popular-section">
            <h3 className="popular-section-title">Popular near you</h3>

            <div className="empty-cart-popular-grid">
              {popularItems.map((prod) => (
                <div key={prod.id} className="popular-produce-card">
                  <div className="popular-produce-img-wrap">
                    <img
                      src={prod.img}
                      alt={prod.name}
                      className="popular-produce-photo"
                    />
                    {prod.badge && (
                      <span className="badge-popular-harvested">
                        {prod.badge}
                      </span>
                    )}
                  </div>

                  <div className="popular-produce-body">
                    <h4 className="popular-produce-name">{prod.name}</h4>
                    <span className="popular-produce-farm">{prod.farm}</span>

                    <div className="popular-produce-footer">
                      <span className="popular-produce-price">
                        ₱{prod.pricePerUnit.toFixed(2)} {prod.unit}
                      </span>
                      <button
                        type="button"
                        className="btn-popular-add-cart"
                        onClick={() => handleAddPopularItem(prod)}
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        /* Cart with items */
        <div className="cart-main-layout">
          {/* Left Column: Farm Group & Produce Items */}
          <div className="cart-items-card">
            <div className="cart-farm-header-row">
              <h2 className="cart-farm-name">{cartItems[0]?.farm || cartItems[0]?.farm_name || 'Fresh Local Farm'}</h2>
              <span className="cart-farm-location">{cartItems[0]?.location || 'Bunawan'}</span>
            </div>

            <div className="cart-items-list">
              {cartItems.map((item, index) => (
                <div key={item.id}>
                  {index > 0 && <div className="cart-item-divider" />}
                  <div className="cart-item-row">
                    <div className="cart-item-left-col">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="cart-item-photo"
                      />
                      <div className="cart-item-info">
                        <h3 className="cart-item-title">{item.name}</h3>
                        <p className="cart-item-unit-calc">
                          ₱{item.pricePerUnit}{item.unit} · Qty {item.quantity}
                        </p>
                        <button
                          type="button"
                          className="btn-cart-remove-item"
                          onClick={() => handleRemoveItem(item.id, item.name)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    {/* Quantity Controls Pill */}
                    <div className="cart-quantity-selector">
                      <button
                        type="button"
                        className="qty-btn-minus"
                        onClick={() => handleUpdateQuantity(item.id, -1)}
                        title="Decrease quantity"
                      >
                        —
                      </button>
                      <span className="qty-value-display">{item.quantity}</span>
                      <button
                        type="button"
                        className="qty-btn-plus"
                        onClick={() => handleUpdateQuantity(item.id, 1)}
                        title="Increase quantity"
                      >
                        +
                      </button>
                    </div>

                    {/* Item Subtotal Price */}
                    <div className="cart-item-subtotal-price">
                      ₱{calculateSubtotal(item).toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Cart Total & Actions */}
          <aside className="cart-summary-card">
            <span className="cart-summary-label">Cart total</span>
            <div className="cart-summary-total-amount">
              ₱{cartTotal.toFixed(2)}
            </div>

            <div className="cart-summary-buttons-stack">
              <button
                type="button"
                className="btn-cart-proceed-checkout"
                onClick={() => {
                  showToast(`Proceeding to checkout with ${totalItemCount} items (₱${cartTotal.toFixed(2)})`);
                  onCheckout({ items: cartItems, subtotal: cartTotal, count: totalItemCount });
                }}
              >
                Proceed to checkout
              </button>
              <button
                type="button"
                className="btn-cart-continue-shopping"
                onClick={onContinueShopping}
              >
                Continue shopping
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

export default CustomerCart;