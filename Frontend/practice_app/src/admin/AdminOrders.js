import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import '../adminCss/AdminOrders.css';
import { API_BASE_URL } from '../config';

export default function AdminOrders() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    // Orders state
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Dashboard Statistics state
    const [stats, setStats] = useState({
        totalOrders: 0,
        pendingOrders: 0,
        processingOrders: 0,
        deliveredOrders: 0,
        cancelledOrders: 0,
        totalRevenue: 0,
    });
    const [statsLoading, setStatsLoading] = useState(true);

    // Filter and Search states
    const [search, setSearch] = useState('');
    const [orderStatus, setOrderStatus] = useState('All');
    const [paymentStatus, setPaymentStatus] = useState('All');
    const [sortBy, setSortBy] = useState('Newest');

    // Fetch Stats
    const fetchStats = useCallback(async () => {
        try {
            setStatsLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/admin/product/getDashboardData`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setStats({
                    totalOrders: data.totalOrders || 0,
                    pendingOrders: data.pendingOrders || 0,
                    processingOrders: data.processingOrders || 0,
                    deliveredOrders: data.deliveredOrders || 0,
                    cancelledOrders: data.cancelledOrders || 0,
                    totalRevenue: data.totalRevenue || 0,
                });
            }
        } catch (err) {
            console.error('Error fetching dashboard statistics:', err);
        } finally {
            setStatsLoading(false);
        }
    }, [token]);

    // Fetch Orders
    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError(false);

            // Construct query parameters
            const queryParams = new URLSearchParams({
                search,
                orderStatus,
                paymentStatus,
                sortBy,
            }).toString();

            const response = await fetch(`${API_BASE_URL}/api/admin/orders?${queryParams}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch admin orders');
            }

            const result = await response.json();
            setOrders(result.data || []);
        } catch (err) {
            console.error('Error fetching admin orders:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [token, search, orderStatus, paymentStatus, sortBy, navigate]);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [token, fetchOrders, navigate]);

    useEffect(() => {
        if (token) {
            fetchStats();
        }
    }, [token, fetchStats]);

    // Helper functions for class badges
    const getStatusClass = (status) => {
        const formatted = status.toLowerCase().replace(/\s+/g, '-');
        return `status-${formatted}`;
    };

    const getPaymentClass = (pStatus) => {
        return `pay-${pStatus.toLowerCase()}`;
    };

    return (
        <div className="admin-orders-page">
            <div className="admin-page-header">
                <div>
                    <h1>Orders Management</h1>
                    <p>Track, manage, and update customer order status.</p>
                </div>
            </div>

            {/* Top Statistics Cards */}
            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="stat-icon purple">🛒</div>
                    <div>
                        <span>Total Orders</span>
                        <h2>{statsLoading ? '...' : stats.totalOrders}</h2>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="stat-icon orange">⏳</div>
                    <div>
                        <span>Pending Orders</span>
                        <h2>{statsLoading ? '...' : stats.pendingOrders}</h2>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="stat-icon indigo">⚙️</div>
                    <div>
                        <span>Processing</span>
                        <h2>{statsLoading ? '...' : stats.processingOrders}</h2>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="stat-icon green">✓</div>
                    <div>
                        <span>Delivered</span>
                        <h2>{statsLoading ? '...' : stats.deliveredOrders}</h2>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="stat-icon red">✕</div>
                    <div>
                        <span>Cancelled</span>
                        <h2>{statsLoading ? '...' : stats.cancelledOrders}</h2>
                    </div>
                </div>

                <div className="admin-stat-card">
                    <div className="stat-icon green">₹</div>
                    <div>
                        <span>Total Revenue</span>
                        <h2>₹{statsLoading ? '...' : stats.totalRevenue.toLocaleString()}</h2>
                    </div>
                </div>
            </div>

            {/* Orders List Container */}
            <div className="admin-orders-container">
                {/* Toolbar */}
                <div className="admin-toolbar">
                    <div className="admin-filters-row">
                        {/* Search field */}
                        <div className="search-wrapper">
                            <input
                                type="text"
                                placeholder="Search order number, name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>

                        {/* Order status filter */}
                        <div className="filter-group">
                            <label>Status</label>
                            <select
                                value={orderStatus}
                                onChange={(e) => setOrderStatus(e.target.value)}
                            >
                                <option value="All">All Statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="Confirmed">Confirmed</option>
                                <option value="Processing">Processing</option>
                                <option value="Shipped">Shipped</option>
                                <option value="Out for Delivery">Out for Delivery</option>
                                <option value="Delivered">Delivered</option>
                                <option value="Cancelled">Cancelled</option>
                            </select>
                        </div>

                        {/* Payment Status filter */}
                        <div className="filter-group">
                            <label>Payment</label>
                            <select
                                value={paymentStatus}
                                onChange={(e) => setPaymentStatus(e.target.value)}
                            >
                                <option value="All">All Payments</option>
                                <option value="Pending">Pending</option>
                                <option value="Paid">Paid</option>
                                <option value="Failed">Failed</option>
                                <option value="Refunded">Refunded</option>
                            </select>
                        </div>

                        {/* Sort filter */}
                        <div className="filter-group">
                            <label>Sort By</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="Newest">Newest</option>
                                <option value="Oldest">Oldest</option>
                                <option value="Highest Amount">Highest Amount</option>
                                <option value="Lowest Amount">Lowest Amount</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Loading and Error states */}
                {loading ? (
                    <div className="admin-loading">Loading order data...</div>
                ) : error ? (
                    <div className="admin-error">
                        Unable to load orders.
                        <br />
                        <button onClick={fetchOrders}>Retry</button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="admin-empty">No orders found matching filters.</div>
                ) : (
                    /* Table View */
                    <div className="admin-table-wrapper">
                        <table className="admin-orders-table">
                            <thead>
                                <tr>
                                    <th>Order #</th>
                                    <th>Customer</th>
                                    <th>Items</th>
                                    <th>Total Amount</th>
                                    <th>Payment Status</th>
                                    <th>Order Status</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => {
                                    const customerName = order.user?.name || 'Guest User';
                                    const customerEmail = order.user?.email || 'N/A';
                                    const itemsText = order.items
                                        .map((item) => `${item.title} (x${item.quantity})`)
                                        .join(', ');
                                    const formattedDate = new Date(order.createdAt).toLocaleDateString(undefined, {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                    });

                                    return (
                                        <tr key={order._id}>
                                            <td data-label="Order #">
                                                <strong>#{order.orderNumber}</strong>
                                            </td>
                                            <td data-label="Customer">
                                                <div className="customer-info-cell">
                                                    <span className="customer-name">{customerName}</span>
                                                    <span className="customer-email">{customerEmail}</span>
                                                </div>
                                            </td>
                                            <td data-label="Items">
                                                <div className="admin-items-cell" title={itemsText}>
                                                    {itemsText}
                                                </div>
                                            </td>
                                            <td data-label="Total Amount">
                                                <strong>₹{order.totalAmount.toLocaleString()}</strong>
                                            </td>
                                            <td data-label="Payment Status">
                                                <span className={`admin-badge ${getPaymentClass(order.paymentStatus)}`}>
                                                    {order.paymentStatus}
                                                </span>
                                            </td>
                                            <td data-label="Order Status">
                                                <span className={`admin-badge ${getStatusClass(order.orderStatus)}`}>
                                                    {order.orderStatus}
                                                </span>
                                            </td>
                                            <td data-label="Date">{formattedDate}</td>
                                            <td data-label="Actions" className="actions-cell">
                                                <button
                                                    className="admin-action-btn"
                                                    onClick={() => navigate(`/admin/orders/${order._id}`)}
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
