import React, { useState, useEffect } from 'react';
import basakanImg from '../image/basakan.png';
import tomatoesImg from '../image/tomatoes.png';
import cucumberImg from '../image/cucumber.png';
import lettuceImg from '../image/lettuce.png';
import carrotImg from '../image/carrot.png';
import { productsAPI } from '../services/api';
import './CustomerDashboard.css';

function CustomerHome({
  customerName = '',
  onAddToCart = () => {},
  onNavigateToBrowse = () => {},
  onNavigateToSearch = null,
  showToast = () => {}
}) {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const defaultCategories = [
    { name: 'Vegetables', icon: '🥬' },
    { name: 'Fruits', icon: '🍅' },
    { name: 'Rice', icon: '🌾' },
    { name: 'Root crops', icon: '🥕' },
    { name: 'Seedlings', icon: '🌱' }
  ];

  const [productsList, setProductsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState(defaultCategories);

  useEffect(() => {
    let isMounted = true;

    productsAPI.getAll({ limit: 8 })
      .then((res) => {
        if (isMounted) {
          if (res.data && res.data.length > 0) {
            const imageMap = {
              'Tomatoes': tomatoesImg,
              'Fresh Tomatoes': tomatoesImg,
              'Cucumber': cucumberImg,
              'Fresh Lettuce': lettuceImg,
              'Carrots': carrotImg,
              'Native Carrots': carrotImg,
            };
            const mapped = res.data.map((item, idx) => ({
              id: item.id,
              farmer_id: item.farmer_id || null,
              name: item.name,
              category: item.category_name ? item.category_name.toUpperCase() : 'VEGETABLES',
              categoryKey: item.category_name || 'Vegetables',
              location: item.farmer_location || item.location || 'Bunawan, Agusan del Sur',
              farm: item.farm_name || 'Fresh Local Farm',
              price: `₱${parseFloat(item.price)}/${item.unit || 'kg'}`,
              rawPrice: parseFloat(item.price),
              unit: item.unit || 'kg',
              badge: item.badge || 'Just harvested',
              img: item.image_url || imageMap[item.name] || [tomatoesImg, cucumberImg, lettuceImg, carrotImg][idx % 4],
              description: item.description || ''
            }));
            setProductsList(mapped);
          } else {
            setProductsList([]);
          }
        }
      })
      .catch((err) => console.log('Products API note:', err.message))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    productsAPI.getCategories()
      .then((res) => {
        if (isMounted && res.data && res.data.length > 0) {
          setCategoriesList(res.data.map(c => ({ name: c.name, icon: c.icon || '🌱' })));
        }
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, []);

  const filteredProducts = productsList.filter((prod) => {
    const matchesSearch =
      prod.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      prod.location.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' || prod.categoryKey.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      showToast(`Searching for "${searchKeyword}"...`);
      if (onNavigateToSearch) {
        onNavigateToSearch(searchKeyword);
      } else {
        onNavigateToBrowse();
      }
    }
  };

  const handleCategoryClick = (catName) => {
    if (selectedCategory === catName) {
      setSelectedCategory('All');
    } else {
      setSelectedCategory(catName);
      showToast(`Filtered by ${catName}`);
    }
  };

  return (
    <div className="customer-home-content">
      {/* Hero Banner Section */}
      <div className="customer-hero-banner">
        <div className="hero-banner-text-side">
          <span className="banner-greeting-tag">
            GOOD MORNING, {customerName ? customerName.split(' ')[0].toUpperCase() : 'VALUED CUSTOMER'}
          </span>
          <h1 className="banner-main-headline">What’s fresh near<br />you?</h1>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="banner-search-form">
            <div className="search-input-pill">
              <div className="search-icon-circle-dot"></div>
              <input
                type="text"
                placeholder="Search for tomatoes, rice, carrots..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <button type="submit" className="btn-banner-search">
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Right: basakan.png landscape image */}
        <div className="hero-banner-image-side">
          <img
            src={basakanImg}
            alt="Rice paddies with coconut trees in local farm"
            className="hero-basakan-img"
          />
        </div>
      </div>

      {/* Shop by Category Section */}
      <section className="customer-section shop-by-category-section">
        <div className="section-header-flex">
          <h2 className="customer-section-title">Shop by category</h2>
          <button
            type="button"
            className="customer-link-see-all"
            onClick={onNavigateToBrowse}
          >
            See all →
          </button>
        </div>

        <div className="category-cards-grid">
          {categoriesList.map((cat) => (
            <div
              key={cat.name}
              className={`category-item-card ${selectedCategory === cat.name ? 'active-category' : ''}`}
              onClick={() => handleCategoryClick(cat.name)}
            >
              <div className="category-icon-circle">
                <span className="cat-emoji">{cat.icon}</span>
              </div>
              <span className="category-item-name">{cat.name}</span>
              <span className="category-arrow-chevron">›</span>
            </div>
          ))}
        </div>
      </section>

      {/* From farms near you Section */}
      <section className="customer-section farms-near-you-section">
        <div className="section-super-tag">FRESHLY LISTED</div>
        <div className="section-header-flex">
          <h2 className="customer-section-title">From farms near you</h2>
          <div className="browse-all-row">
            <button
              type="button"
              className="customer-link-see-all"
              onClick={onNavigateToBrowse}
            >
              Browse all →
            </button>
            <button
              type="button"
              className="carousel-arrow-btn"
              onClick={onNavigateToBrowse}
              aria-label="Next items"
            >
              ›
            </button>
          </div>
        </div>

        <div className="products-cards-grid">
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#527853', gridColumn: '1 / -1', fontSize: '15px' }}>
              Loading fresh harvest from database...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: '#666', gridColumn: '1 / -1', fontSize: '15px' }}>
              No fresh produce available matching your selection.
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product.id} className="customer-product-card">
                <div className="product-image-container">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="customer-product-photo"
                  />
                  {product.badge && <span className="badge-just-harvested">{product.badge}</span>}
                </div>

                <div className="product-card-body">
                  <span className="product-category-sub">{product.category}</span>
                  <h3 className="product-card-name">{product.name}</h3>

                  <div className="product-card-location">
                    <span className="location-pin-dot">○</span>
                    <span>{product.location}</span>
                  </div>

                  <div className="product-card-bottom-row">
                    <div className="product-card-price">{product.price}</div>
                    <button
                      type="button"
                      className="btn-add-to-cart-plus"
                      onClick={() => onAddToCart(product)}
                      title={`Add ${product.name} to cart`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

export default CustomerHome;
