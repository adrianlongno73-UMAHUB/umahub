import React, { useState } from 'react';
import { formatRelativeTime } from '../services/api';
import './FarmerPortal.css';

function FarmerInventory({
  inventoryList = [],
  handleDeleteProduct = () => {},
  handleUpdateProduct = () => {},
  setActiveTab = () => {},
  initialAction = null, // null | 'delete' | 'edit'
  showToast = () => {}
}) {
  const [inventorySearch, setInventorySearch] = useState('');
  const [inventoryCategoryFilter, setInventoryCategoryFilter] = useState('All');
  const [inventoryStockFilter, setInventoryStockFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Delete modal state
  const [deleteItemTarget, setDeleteItemTarget] = useState(
    initialAction === 'delete' ? (inventoryList[0] || null) : null
  );

  // Edit drawer state
  const [editItemTarget, setEditItemTarget] = useState(
    initialAction === 'edit' ? (inventoryList[0] ? { ...inventoryList[0] } : null) : null
  );

  // Edit form state
  const [editName, setEditName] = useState(
    initialAction === 'edit' && inventoryList[0] ? inventoryList[0].name : ''
  );
  const [editCategory, setEditCategory] = useState(
    initialAction === 'edit' && inventoryList[0] ? inventoryList[0].category : 'Vegetables'
  );
  const [editPrice, setEditPrice] = useState(
    initialAction === 'edit' && inventoryList[0]
      ? inventoryList[0].price.replace(/[^0-9.]/g, '') || '40.00'
      : '40.00'
  );
  const [editUnit, setEditUnit] = useState('/ kg');
  const [editStock, setEditStock] = useState(
    initialAction === 'edit' && inventoryList[0]
      ? inventoryList[0].stock.replace(/[^0-9.]/g, '') || '48'
      : '48'
  );
  const [editStatus, setEditStatus] = useState(
    initialAction === 'edit' && inventoryList[0] ? inventoryList[0].status : 'In stock'
  );
  const [editDesc, setEditDesc] = useState(
    'Fresh and organic tomatoes, locally grown.'
  );

  const filteredInventory = inventoryList.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(inventorySearch.toLowerCase());
    const matchesCategory =
      inventoryCategoryFilter === 'All' || item.category.toLowerCase() === inventoryCategoryFilter.toLowerCase();
    const matchesStock =
      inventoryStockFilter === 'All' || item.status.toLowerCase().replace(' ', '') === inventoryStockFilter.toLowerCase().replace(' ', '');
    return matchesSearch && matchesCategory && matchesStock;
  });

  const totalPages = Math.max(1, Math.ceil(filteredInventory.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedInventory = filteredInventory.slice(startIndex, startIndex + itemsPerPage);

  const handleOpenEdit = (item) => {
    setEditItemTarget({ ...item });
    setEditName(item.name);
    setEditCategory(item.category);
    setEditPrice(item.price.replace(/[^0-9.]/g, '') || '40.00');
    setEditStock(item.stock.replace(/[^0-9.]/g, '') || '48');
    setEditStatus(item.status);
    setEditDesc(item.desc || `Fresh and organic ${item.name.toLowerCase()}, locally grown.`);
  };

  const handleCloseEdit = () => {
    setEditItemTarget(null);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      showToast('Product name cannot be empty.');
      return;
    }

    const nowIso = new Date().toISOString();
    const updatedItem = {
      ...editItemTarget,
      name: editName,
      category: editCategory,
      price: `₱${parseFloat(editPrice || 0).toFixed(2)} ${editUnit}`,
      rawPrice: parseFloat(editPrice || 0),
      stock: `${editStock} ${editUnit.replace('/', '').trim() || 'kg'}`,
      rawStock: parseInt(editStock || 0, 10),
      status: editStatus,
      desc: editDesc,
      img: editItemTarget.img,
      updated: formatRelativeTime(nowIso),
      updated_at: nowIso,
    };

    handleUpdateProduct(updatedItem);
    showToast(`Updated "${editName}" successfully!`);
    setEditItemTarget(null);
  };

  const handleOpenDelete = (item) => {
    setDeleteItemTarget(item);
  };

  const handleConfirmDelete = () => {
    if (deleteItemTarget) {
      handleDeleteProduct(deleteItemTarget.id, deleteItemTarget.name);
      setDeleteItemTarget(null);
    }
  };

  return (
    <div className="inventory-view-content">
      {/* Header */}
      <div className="inventory-header-row">
        <div className="inventory-title-group">
          <span className="section-super-tag">YOUR HARVEST</span>
          <h1 className="inventory-main-title">Manage Inventory</h1>
          <p className="inventory-sub-desc">Keep product listings and stock up to date.</p>
        </div>

        <button
          type="button"
          className="add-new-product-btn"
          onClick={() => setActiveTab('add-product')}
        >
          <span>Add new product</span>
          <span className="plus-sign">+</span>
        </button>
      </div>

      {/* Filter controls row */}
      <div className="inventory-controls-row">
        <div className="inventory-search-pill">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-pill-svg">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search your products"
            value={inventorySearch}
            onChange={(e) => {
              setInventorySearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="inventory-dropdown-filters">
          <select
            className="filter-pill-select"
            value={inventoryCategoryFilter}
            onChange={(e) => {
              setInventoryCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All categories</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Root crops">Root crops</option>
            <option value="Fruits">Fruits</option>
            <option value="Rice & Grains">Rice & Grains</option>
            <option value="Herbs & Spices">Herbs & Spices</option>
          </select>

          <select
            className="filter-pill-select"
            value={inventoryStockFilter}
            onChange={(e) => {
              setInventoryStockFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="All">All stock levels</option>
            <option value="In stock">In stock</option>
            <option value="Low stock">Low stock</option>
          </select>
        </div>
      </div>

      {/* Main Area: Flex Row between Table and Edit Drawer */}
      <div className={`inventory-workspace-layout ${editItemTarget ? 'with-drawer' : ''}`}>
        {/* Products Table Card */}
        <div className="dash-card inventory-table-card">
          <div className="table-responsive-wrapper">
            <table className="inventory-data-table">
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>CATEGORY</th>
                  <th>PRICE</th>
                  <th>STOCK</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '36px 16px', color: '#6B7280', fontSize: '14px' }}>
                      No products found matching your search or filters.
                    </td>
                  </tr>
                ) : (
                  paginatedInventory.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="inv-product-cell">
                          <img src={item.img} alt={item.name} className="inv-product-thumb" />
                          <div className="inv-product-info">
                            <span className="inv-product-name">{item.name}</span>
                            <span className="inv-product-updated">{item.updated}</span>
                          </div>
                        </div>
                      </td>
                      <td>{item.category}</td>
                      <td className="inv-price-text">{item.price}</td>
                      <td className="inv-stock-text">{item.stock}</td>
                      <td>
                        <span
                          className={`inv-status-badge ${
                            item.status === 'In stock' ? 'badge-in-stock' : 'badge-low-stock'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <div className="inv-actions-cell">
                          <button
                            type="button"
                            className="action-icon-btn"
                            title="Edit product"
                            onClick={() => handleOpenEdit(item)}
                          >
                            ✎
                          </button>
                          <button
                            type="button"
                            className="action-icon-btn btn-delete"
                            title="Delete product"
                            onClick={() => handleOpenDelete(item)}
                          >
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="inventory-pagination-row">
            <span className="pagination-count-text">
              Showing {filteredInventory.length === 0 ? 0 : startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredInventory.length)} of {filteredInventory.length} product{filteredInventory.length === 1 ? '' : 's'}
            </span>
            <div className="pagination-controls">
              <button
                type="button"
                className="pagination-arrow-btn"
                disabled={activePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`pagination-page-btn ${page === activePage ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                className="pagination-arrow-btn"
                disabled={activePage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Edit Product Side Drawer Card (media_1793164248574_425147a9.png) */}
        {editItemTarget && (
          <div className="dash-card edit-product-side-card">
            <div className="edit-card-header">
              <h3 className="edit-card-title">Edit Product</h3>
              <button
                type="button"
                className="edit-close-btn"
                onClick={handleCloseEdit}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {/* Top Image Preview & Upload Box */}
            <div className="edit-image-row">
              <div className="edit-image-preview-thumb">
                <img
                  src={editItemTarget.img || '/thumb-tomatoes.png'}
                  alt={editItemTarget.name}
                  className="edit-thumb-img"
                />
              </div>

              <label className="edit-change-image-box" htmlFor="editProductPhotoUpload">
                <input
                  type="file"
                  id="editProductPhotoUpload"
                  accept="image/*"
                  className="hidden-file-input"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        setEditItemTarget((prev) => ({ ...prev, img: ev.target?.result }));
                        showToast(`Uploaded new photo: ${file.name}`);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
                <span className="change-img-title">Change Image</span>
                <span className="change-img-sub">JPG, PNG (Max 2)</span>
              </label>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveEdit} className="edit-product-form">
              <div className="edit-form-group">
                <label className="edit-form-label" htmlFor="editProdName">Product Name *</label>
                <input
                  id="editProdName"
                  type="text"
                  className="edit-form-input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div className="edit-form-group">
                <label className="edit-form-label" htmlFor="editProdCategory">Category *</label>
                <select
                  id="editProdCategory"
                  className="edit-form-select"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                >
                  <option value="Vegetables">Vegetables</option>
                  <option value="Root crops">Root crops</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Rice & Grains">Rice & Grains</option>
                  <option value="Herbs & Spices">Herbs & Spices</option>
                </select>
              </div>

              <div className="edit-form-group">
                <label className="edit-form-label" htmlFor="editProdPrice">Price (₱) *</label>
                <div className="edit-input-with-select">
                  <input
                    id="editProdPrice"
                    type="number"
                    step="0.01"
                    className="edit-form-input"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    required
                  />
                  <select
                    className="edit-unit-select"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                  >
                    <option value="/ kg">/ kg</option>
                    <option value="/ head">/ head</option>
                    <option value="/ piece">/ piece</option>
                    <option value="/ bundle">/ bundle</option>
                  </select>
                </div>
              </div>

              <div className="edit-form-group">
                <label className="edit-form-label" htmlFor="editProdStock">Stock Quantity *</label>
                <div className="edit-input-with-unit-label">
                  <input
                    id="editProdStock"
                    type="number"
                    className="edit-form-input"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    required
                  />
                  <span className="edit-unit-addon-label">kg</span>
                </div>
              </div>

              <div className="edit-form-group">
                <label className="edit-form-label" htmlFor="editProdStatus">Status *</label>
                <select
                  id="editProdStatus"
                  className="edit-form-select"
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                >
                  <option value="In stock">● In Stock</option>
                  <option value="Low stock">● Low Stock</option>
                  <option value="Out of stock">● Out of Stock</option>
                </select>
              </div>

              <div className="edit-form-group">
                <label className="edit-form-label" htmlFor="editProdDesc">Description</label>
                <textarea
                  id="editProdDesc"
                  className="edit-form-textarea"
                  rows="3"
                  maxLength={200}
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                />
                <div className="edit-char-count">{editDesc.length}/200</div>
              </div>

              <div className="edit-form-actions">
                <button
                  type="button"
                  className="btn-edit-cancel"
                  onClick={handleCloseEdit}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-edit-save">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Delete Product Confirmation Modal (media_1793164234230_0eae0cf2.png) */}
      {deleteItemTarget && (
        <div
          className="modal-backdrop-overlay"
          onClick={(e) => {
            if (e.target.classList.contains('modal-backdrop-overlay')) {
              setDeleteItemTarget(null);
            }
          }}
        >
          <div className="decline-modal-dialog delete-product-dialog">
            <div className="delete-modal-warning-circle">
              <span className="delete-exclamation-mark">!</span>
            </div>

            <h2 className="delete-modal-title">Delete product?</h2>
            <p className="delete-modal-desc">
              {deleteItemTarget.name} will be removed from your inventory. This action can't be undone.
            </p>

            <div className="delete-modal-actions">
              <button
                type="button"
                className="btn-modal-cancel"
                onClick={() => setDeleteItemTarget(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-modal-confirm-delete"
                onClick={handleConfirmDelete}
              >
                Delete product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FarmerInventory;
