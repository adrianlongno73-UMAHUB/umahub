import React, { useState, useEffect } from 'react';
import gulay1Img from '../image/gulay1.png';
import gulay2Img from '../image/gulay2.png';
import gulay3Img from '../image/gulay3.png';
import gulay4Img from '../image/gulay4.png';
import { productsAPI } from '../services/api';
import './CustomerDashboard.css';

function CustomerBrowseProducts({
  onAddToCart = () => {},
  onSelectProduct = () => {},
  onSearchSubmit = null,
  showToast = () => {}
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Bunawan');
  const [searchKeyword, setSearchKeyword] = useState('');

  const categoryOptions = [
    { label: 'All products', value: 'All' },
    { label: 'Vegetables', value: 'Vegetables' },
    { label: 'Fruits', value: 'Fruits' },
    { label: 'Rice', value: 'Rice' },
    { label: 'Root crops', value: 'Root crops' },
    { label: 'Seedlings', value: 'Seedlings' }
  ];

  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    productsAPI.getAll({
      category: selectedCategory !== 'All' ? selectedCategory : undefined,
      search: searchKeyword || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined
    })
      .then((res) => {
        if (isMounted) {
          if (res.data) {
            const imageMap = {
              'Tomatoes': gulay1Img,
              'Fresh Tomatoes': gulay1Img,
              'Cucumber': gulay2Img,
              'Fresh Lettuce': gulay3Img,
              'Carrots': gulay4Img,
              'Native Carrots': gulay4Img
            };
            const mapped = res.data.map((item, idx) => ({
              id: item.id,
              farmer_id: item.farmer_id || null,
              name: item.name,
              category: item.category_name ? item.category_name.toUpperCase() : 'VEGETABLES',
              categoryKey: item.category_name || 'Vegetables',
              location: item.farmer_location || item.location || 'Bunawan',
              farm: item.farm_name || 'Fresh Local Farm',
              price: `₱${parseFloat(item.price)}/${item.unit || 'kg'}`,
              rawPrice: parseFloat(item.price) || 0,
              unit: item.unit || 'kg',
              badge: item.badge || 'Just harvested',
              img: item.image_url || imageMap[item.name] || [gulay1Img, gulay2Img, gulay3Img, gulay4Img][idx % 4],
              description: item.description || ''
            }));
            setProductsList(mapped);
          } else {
            setProductsList([]);
          }
        }
      })
      .catch(() => {
        if (isMounted) setProductsList([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [selectedCategory, searchKeyword, minPrice, maxPrice]);

  const handleClearAll = () => {
    setSelectedCategory('All');
    setMinPrice('');
    setMaxPrice('');
    setSelectedLocation('Bunawan');
    setSearchKeyword('');
    setProductsList(browseProducts);
    showToast('Filters cleared.');
  };

  const filteredProducts = productsList.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      product.categoryKey.toLowerCase() === selectedCategory.toLowerCase();

    const matchesSearch =
      product.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      product.category.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      product.location.toLowerCase().includes(searchKeyword.toLowerCase());

    const matchesMinPrice = minPrice === '' || product.rawPrice >= parseFloat(minPrice);
    const matchesMaxPrice = maxPrice === '' || product.rawPrice <= parseFloat(maxPrice);

    return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice;
  });

  return (
    <div className="browse-products-view-content">
      {/* Header Row: Title & Search */}
      <div className="browse-header-row">
        <div className="browse-title-group">
          <span className="browse-super-tag">LOCAL MARKETPLACE</span>
          <h1 className="browse-main-title">Browse fresh produce</h1>
          <p className="browse-sub-desc">Harvested nearby and delivered with care.</p>
        </div>

        {/* Right Search Input Pill */}
        <form
          className="browse-search-box"
          onSubmit={(e) => {
            e.preventDefault();
            if (onSearchSubmit && searchKeyword.trim()) {
              onSearchSubmit(searchKeyword);
            }
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#7e8c7c" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="browse-search-icon">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search produce"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </form>
      </div>

      {/* Main Two Column Layout: Filters on Left, Product Grid on Right */}
      <div className="browse-main-layout">
        {/* Left Column: Filters Card */}
        <aside className="browse-filters-card">
          <div className="filters-card-header">
            <h3 className="filters-card-title">Filters</h3>
            <button
              type="button"
              className="btn-clear-filters"
              onClick={handleClearAll}
            >
              Clear all
            </button>
          </div>

          {/* Section 1: Category */}
          <div className="filter-group">
            <span className="filter-group-title">Category</span>
            <div className="filter-radio-list">
              {categoryOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`filter-radio-item ${selectedCategory === opt.value ? 'selected' : ''}`}
                  onClick={() => setSelectedCategory(opt.value)}
                >
                  <div className="filter-custom-radio">
                    {selectedCategory === opt.value && <div className="filter-radio-dot"></div>}
                  </div>
                  <span className="filter-radio-label">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Section 2: Price range */}
          <div className="filter-group">
            <span className="filter-group-title">Price range</span>
            <div className="price-range-inputs-row">
              <input
                type="number"
                placeholder="₱ Min"
                className="price-filter-input"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <input
                type="number"
                placeholder="₱ Max"
                className="price-filter-input"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Section 3: Location */}
          <div className="filter-group">
            <span className="filter-group-title">Location</span>
            <div className="location-select-wrap">
              <select
                className="filter-location-select"
                value={selectedLocation}
                onChange={(e) => {
                  setSelectedLocation(e.target.value);
                  showToast(`Location set to: ${e.target.value}`);
                }}
              >
                <option value="Bunawan">Bunawan</option>
                <option value="Prosperidad">Prosperidad</option>
                <option value="San Francisco">San Francisco</option>
                <option value="All Agusan del Sur">All Agusan del Sur</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Right Column: Products Grid */}
        <section className="browse-products-right-col">
          <div className="products-available-count-text">
            {loading ? 'Searching produce...' : `${filteredProducts.length} product(s) available`}
          </div>

          <div className="browse-cards-3col-grid">
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#527853', gridColumn: '1 / -1', fontSize: '15px' }}>
                Loading fresh harvest from database...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666', gridColumn: '1 / -1', fontSize: '15px' }}>
                No fresh produce found matching your filters.
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="browse-product-card"
                  onClick={() => onSelectProduct(product)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="browse-image-container">
                    <img
                      src={product.img}
                      alt={product.name}
                      className="browse-product-photo"
                    />
                    {product.badge && <span className="badge-just-harvested-yellow">{product.badge}</span>}
                  </div>

                  <div className="browse-card-body">
                    <span className="browse-category-tag">{product.category}</span>
                    <h3 className="browse-product-title">{product.name}</h3>

                    <div className="browse-location-row">
                      <span className="location-circle-icon">○</span>
                      <span className="location-name-text">{product.location}</span>
                    </div>

                    <div className="browse-bottom-row">
                      <span className="browse-price-tag">{product.price}</span>
                      <button
                        type="button"
                        className="btn-browse-add-cart"
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToCart(product);
                        }}
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
    </div>
  );
}

export default CustomerBrowseProducts;
