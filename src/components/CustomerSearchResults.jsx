import React, { useState, useEffect } from 'react';
import gulay5Img from '../image/gulay5.png';
import gulay6Img from '../image/gulay6.png';
import gulay7Img from '../image/gulay7.png';
import lettuceImg from '../image/lettuce.png';
import tomatoesImg from '../image/tomatoes.png';
import gulay1Img from '../image/gulay1.png';
import { productsAPI } from '../services/api';
import './CustomerDashboard.css';

function CustomerSearchResults({
  initialQuery = 'tomato',
  onAddToCart = () => {},
  onSelectProduct = () => {},
  showToast = () => {}
}) {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    productsAPI.getAll({ search: searchQuery })
      .then((res) => {
        if (isMounted) {
          if (res.data) {
            const imageMap = {
              'Fresh Tomatoes': gulay5Img,
              'Native Carrots': gulay6Img,
              'Siling Labuyo': gulay7Img,
              'Tomato Seedlings': lettuceImg,
              'Heirloom Tomatoes': tomatoesImg,
              'Roma Tomatoes': gulay1Img,
              'Cucumber': gulay1Img,
              'Fresh Lettuce': lettuceImg
            };
            const mapped = res.data.map((item, idx) => ({
              id: item.id,
              farmer_id: item.farmer_id || null,
              name: item.name,
              farm: item.farm_name || "Fresh Local Farm",
              price: `₱${parseFloat(item.price).toFixed(2)} / ${item.unit || 'kg'}`,
              rawPrice: parseFloat(item.price) || 0,
              unit: item.unit || 'kg',
              badge: item.badge,
              category: item.category_name ? item.category_name.toUpperCase() : 'VEGETABLES',
              location: item.farmer_location || item.location || 'Bunawan',
              img: item.image_url || imageMap[item.name] || [gulay5Img, gulay6Img, gulay7Img, lettuceImg, tomatoesImg, gulay1Img][idx % 6],
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
  }, [searchQuery]);

  const filteredProducts = productsList.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      p.name.toLowerCase().includes(q) ||
      p.farm.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
    );
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      showToast(`Showing results for "${searchQuery}" in Bunawan`);
    }
  };

  return (
    <div className="customer-search-results-container">
      {/* Search Input Bar (Centred Top Pill) */}
      <div className="search-results-bar-wrap">
        <form onSubmit={handleSearchSubmit} className="search-results-form">
          <input
            type="text"
            className="search-results-pill-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search produce, farms, or categories..."
          />
        </form>
      </div>

      {/* Results Grid (3 columns, 2 rows) */}
      <div className="search-results-grid">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#527853', gridColumn: '1 / -1', fontSize: '15px' }}>
            Searching database for "{searchQuery}"...
          </div>
        ) : filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className="search-result-card"
            onClick={() => onSelectProduct(prod)}
          >
            {/* Card Image Container */}
            <div className="search-card-img-wrap">
              <img
                src={prod.img}
                alt={prod.name}
                className="search-card-photo"
              />
              {prod.badge && (
                <span className="badge-search-harvested">{prod.badge}</span>
              )}
            </div>

            {/* Card Body */}
            <div className="search-card-body">
              <h3 className="search-card-title">{prod.name}</h3>
              <span className="search-card-farm">{prod.farm}</span>

              <div className="search-card-footer">
                <span className="search-card-price">{prod.price}</span>
                <button
                  type="button"
                  className="btn-search-add-cart"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToCart(prod);
                  }}
                  title={`Add ${prod.name} to cart`}
                >
                  + Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-search-results-box">
          <div className="no-results-icon">🔍</div>
          <h3>No produce found for "{searchQuery}"</h3>
          <p>Try searching for tomatoes, carrots, siling labuyo, or clear your query.</p>
          <button
            type="button"
            className="btn-clear-search-query"
            onClick={() => setSearchQuery('')}
          >
            Show all produce
          </button>
        </div>
      )}
    </div>
  );
}

export default CustomerSearchResults;