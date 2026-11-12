import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

function AdminUsers({
  initialFilter = null,
  onOpenInviteModal = () => {},
  onOpenFarmerReviewModal = () => {},
  showToast = () => {}
}) {
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({
    totalUsers: 0,
    customers: 0,
    farmers: 0,
    pending: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState(
    initialFilter === 'pending' ? 'pending' : 'all'
  );
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Load user counts and initial data
  const loadUsersData = async () => {
    try {
      const res = await adminAPI.getUsers({
        role: selectedRole,
        status: selectedStatus,
        search: searchTerm,
        page,
        limit: pageSize
      });

      if (res.success) {
        setUsers(res.data || []);
        setTotalCount(typeof res.count === 'number' ? res.count : (res.data?.length || 0));
      }

      // Refresh overview counts
      const overviewRes = await adminAPI.getOverviewStats();
      if (overviewRes.success && overviewRes.data) {
        const d = overviewRes.data;
        setStats({
          totalUsers: d.totalUsers ?? 0,
          customers: d.customersCount ?? 0,
          farmers: d.farmersCount ?? 0,
          pending: d.pendingFarmerCount ?? 0
        });
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  useEffect(() => {
    loadUsersData();
  }, [selectedRole, selectedStatus, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadUsersData();
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'suspended' ? 'active' : 'suspended';
    try {
      await adminAPI.updateUserStatus(user.id, newStatus);
      showToast(`User ${user.name} is now ${newStatus}!`);
      loadUsersData();
    } catch {
      showToast('Failed to update user status.');
    }
  };

  const getPaginationPages = () => {
    if (totalPages <= 1) return [1];

    if (totalPages <= 5) {
      const pages = [];
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    if (page <= 3) {
      return [1, 2, 3, '...', totalPages];
    } else if (page >= totalPages - 2) {
      return [1, '...', totalPages - 2, totalPages - 1, totalPages];
    } else {
      return [1, '...', page - 1, page, page + 1, '...', totalPages];
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="admin-page-content">
      {/* Header Row */}
      <div className="admin-page-header-row">
        <div>
          <div className="admin-section-tag">COMMUNITY MANAGEMENT</div>
          <h1 className="admin-main-title">Users</h1>
          <p className="admin-sub-title">
            Manage customers, review farmer applications, and keep the community safe.
          </p>
        </div>

        <button
          type="button"
          className="admin-primary-btn"
          onClick={onOpenInviteModal}
        >
          <span>Invite admin +</span>
        </button>
      </div>

      {/* 4 Stat Badges Bar */}
      <div className="admin-users-stats-bar">
        <div className="admin-users-stat-cell">
          <span className="admin-users-stat-num">{stats.totalUsers.toLocaleString()}</span>
          <span className="admin-users-stat-label">Total users</span>
        </div>

        <div className="admin-users-stat-cell">
          <span className="admin-users-stat-num">{stats.customers.toLocaleString()}</span>
          <span className="admin-users-stat-label">Customers</span>
        </div>

        <div className="admin-users-stat-cell">
          <span className="admin-users-stat-num">{stats.farmers.toLocaleString()}</span>
          <span className="admin-users-stat-label">Farmers</span>
        </div>

        <div className="admin-users-stat-cell">
          <span className="admin-users-stat-num text-amber">{stats.pending.toLocaleString()}</span>
          <span className="admin-users-stat-label">Pending verification</span>
        </div>
      </div>

      {/* Filter Row */}
      <div className="admin-filter-bar">
        <form className="admin-search-wrapper" onSubmit={handleSearchSubmit}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="admin-search-icon">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            className="admin-search-input"
            placeholder="Search name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </form>

        <div className="admin-filter-controls">
          <select
            className="admin-select-pill"
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All users</option>
            <option value="customer">Customers</option>
            <option value="farmer">Farmers</option>
            <option value="admin">Admins</option>
          </select>

          <select
            className="admin-select-pill"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card admin-table-card">
        <div className="admin-table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>USER</th>
                <th>ROLE</th>
                <th>JOINED</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => {
                  const roleCapitalized = user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : 'Customer';
                  const statusCapitalized = user.status ? (user.status.charAt(0).toUpperCase() + user.status.slice(1)) : 'Active';

                  return (
                    <tr key={user.id}>
                      {/* USER Column: Avatar Initials + Name + Email */}
                      <td>
                        <div className="admin-user-cell">
                          <div className={`admin-user-avatar-circle role-${user.role || 'customer'}`}>
                            {getInitials(user.name)}
                          </div>
                          <div className="admin-user-details">
                            <span className="admin-user-fullname">{user.name}</span>
                            <span className="admin-user-email">{user.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* ROLE Column */}
                      <td>
                        <span className="admin-user-role-text">{roleCapitalized}</span>
                      </td>

                      {/* JOINED Column */}
                      <td>
                        <span className="admin-user-date-text">{user.joined}</span>
                      </td>

                      {/* STATUS Column */}
                      <td>
                        <span className={`admin-status-pill status-${user.status || 'active'}`}>
                          {statusCapitalized}
                        </span>
                      </td>

                      {/* ACTION Column */}
                      <td>
                        {user.status === 'pending' ? (
                          <button
                            type="button"
                            className="admin-outline-btn"
                            onClick={() => onOpenFarmerReviewModal(user)}
                          >
                            Review application
                          </button>
                        ) : user.status === 'suspended' ? (
                          <button
                            type="button"
                            className="admin-action-link link-activate"
                            onClick={() => handleToggleStatus(user)}
                          >
                            Activate
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="admin-action-link link-suspend"
                            onClick={() => handleToggleStatus(user)}
                          >
                            Suspend
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-muted">
                    No users match your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Dynamic Pagination */}
        <div className="admin-table-footer">
          <span className="admin-table-count">
            Showing {users.length} of {totalCount.toLocaleString()} users
          </span>

          <div className="admin-pagination">
            <button
              type="button"
              className="admin-page-nav-btn"
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              title="Previous page"
            >
              ‹
            </button>

            {getPaginationPages().map((p, idx) => {
              if (p === '...') {
                return (
                  <span key={`dots-${idx}`} className="admin-page-dots">
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={p}
                  type="button"
                  className={`admin-page-num-btn ${page === p ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              );
            })}

            <button
              type="button"
              className="admin-page-nav-btn"
              disabled={page >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              title="Next page"
            >
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminUsers;
