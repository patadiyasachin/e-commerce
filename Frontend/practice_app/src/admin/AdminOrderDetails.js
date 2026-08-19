import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../adminCss/AdminOrderDetails.css';
import '../css/OrderDetails.css'; // Reuse tracking timeline CSS styles
import { API_BASE_URL } from '../config';

export default function AdminOrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updateLoading, setUpdateLoading] = useState(false);

    // Form inputs state
    const [orderStatus, setOrderStatus] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');

    // Toast/notification state
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    const steps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

    // Fetch order details
    const fetchOrderDetails = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/admin/orders/${id}`, {
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

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch order details');
            }

            setOrder(result.data);
            setOrderStatus(result.data.orderStatus);
            setPaymentStatus(result.data.paymentStatus);
        } catch (err) {
            console.error('Error fetching order details:', err);
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [id, token, navigate]);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchOrderDetails();
    }, [token, fetchOrderDetails, navigate]);

    // Toast Helper
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: '', type: 'success' });
        }, 4000);
    };

    // Handle Submit Status Update
    const handleUpdateStatus = async (e) => {
        e.preventDefault();
        try {
            setUpdateLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/admin/orders/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    orderStatus,
                    paymentStatus,
                }),
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to update order status');
            }

            showToast('Order updated successfully.');
            // Reload order info
            fetchOrderDetails();
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <h2>Loading order details...</h2>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="admin-error">
                <h2>Order not found</h2>
                <button onClick={() => navigate('/admin/orders')}>Back to Orders</button>
            </div>
        );
    }

    const { shippingAddress, user } = order;
    const currentStepIndex = steps.indexOf(order.orderStatus);
    const progressPercent = currentStepIndex >= 0 ? (currentStepIndex / (steps.length - 1)) * 100 : 0;

    const formattedDate = new Date(order.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="admin-detail-page">
            <div className="admin-detail-container">
                <div className="admin-detail-header">
                    <div>
                        <h1>Order Details #{order.orderNumber}</h1>
                        <p style={{ margin: '4px 0 0', color: '#6b7280', fontSize: '14px' }}>
                            Placed on {formattedDate}
                        </p>
                    </div>
                    <button className="admin-back-btn" onClick={() => navigate('/admin/orders')}>
                        ← Back to Orders
                    </button>
                </div>

                {/* Toast Notification Banner */}
                {toast.show && (
                    <div className={`toast-notification ${toast.type}`}>
                        {toast.message}
                    </div>
                )}

                {/* Progress Tracking Timeline */}
                {order.orderStatus === 'Cancelled' ? (
                    <div className="cancelled-banner" style={{ background: '#fef2f2', borderColor: '#fecaca', color: '#991b1b', marginBottom: '25px' }}>
                        <span className="cancelled-icon" style={{ color: '#dc2626' }}>✕</span>
                        <div className="cancelled-info">
                            <h3 style={{ color: '#dc2626' }}>Cancelled</h3>
                            <p style={{ color: '#7f1d1d' }}>This order has been cancelled. Restored quantities are back in inventory stock.</p>
                        </div>
                    </div>
                ) : (
                    <div className="timeline-card" style={{ background: 'white', border: '1px solid #e5e7eb', marginBottom: '25px' }}>
                        <h3 style={{ color: '#4b5563', fontSize: '15px', fontWeight: '600' }}>Order Tracking Timeline</h3>
                        <div className="tracking-timeline" style={{ marginTop: '20px' }}>
                            <div
                                className="timeline-progress-line"
                                style={{
                                    width: window.innerWidth > 768 ? `${progressPercent}%` : '3px',
                                    height: window.innerWidth <= 768 ? `${progressPercent}%` : '3px',
                                    background: '#22c55e',
                                }}
                            />

                            {steps.map((step, idx) => {
                                let statusClass = '';
                                if (idx < currentStepIndex) {
                                    statusClass = 'completed';
                                } else if (idx === currentStepIndex) {
                                    statusClass = 'active';
                                }

                                return (
                                    <div className={`timeline-step ${statusClass}`} key={step}>
                                        <div className="step-bubble" style={{ color: idx < currentStepIndex ? 'white' : '#94a3b8' }}>
                                            {idx < currentStepIndex ? '✓' : idx + 1}
                                        </div>
                                        <span className="step-label" style={{ color: idx === currentStepIndex ? '#2563eb' : '#6b7280' }}>
                                            {step}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Main Content Grid */}
                <div className="admin-detail-grid">
                    {/* Left Column */}
                    <div className="admin-detail-left">
                        {/* Items ordered list card */}
                        <div className="admin-detail-card">
                            <h3>Items Ordered</h3>
                            <div className="admin-items-list">
                                {order.items.map((item) => (
                                    <div className="admin-item-row" key={item._id}>
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="admin-item-img"
                                        />
                                        <div className="admin-item-info">
                                            <h4>{item.title}</h4>
                                            <p>Unit Price: ₹{item.price.toLocaleString()} x {item.quantity}</p>
                                        </div>
                                        <div className="admin-item-subtotal">
                                            ₹{item.subtotal.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Customer Information card */}
                        <div className="admin-detail-card">
                            <h3>Customer Information</h3>
                            <div className="customer-details-block">
                                <div className="customer-detail-item">
                                    <span className="lbl">Name</span>
                                    <span className="val">{user?.name || 'Guest User'}</span>
                                </div>
                                <div className="customer-detail-item">
                                    <span className="lbl">Email Address</span>
                                    <span className="val">{user?.email || 'N/A'}</span>
                                </div>
                                <div className="customer-detail-item">
                                    <span className="lbl">Contact Phone</span>
                                    <span className="val">{shippingAddress?.phone}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="admin-detail-right">
                        {/* Update Status card */}
                        <div className="admin-detail-card">
                            <h3>Update Order</h3>
                            <form className="update-status-form" onSubmit={handleUpdateStatus}>
                                <div className="update-field-group">
                                    <label htmlFor="orderStatusSelect">Order Status</label>
                                    <select
                                        id="orderStatusSelect"
                                        value={orderStatus}
                                        onChange={(e) => setOrderStatus(e.target.value)}
                                        disabled={order.orderStatus === 'Delivered' || order.orderStatus === 'Cancelled'}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Confirmed">Confirmed</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Out for Delivery">Out for Delivery</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>

                                <div className="update-field-group">
                                    <label htmlFor="paymentStatusSelect">Payment Status</label>
                                    <select
                                        id="paymentStatusSelect"
                                        value={paymentStatus}
                                        onChange={(e) => setPaymentStatus(e.target.value)}
                                        disabled={order.orderStatus === 'Cancelled'}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Failed">Failed</option>
                                        <option value="Refunded">Refunded</option>
                                    </select>
                                </div>

                                <button
                                    type="submit"
                                    className="update-submit-btn"
                                    disabled={
                                        updateLoading ||
                                        order.orderStatus === 'Delivered' ||
                                        order.orderStatus === 'Cancelled'
                                    }
                                >
                                    {updateLoading ? 'Updating...' : 'Update Status'}
                                </button>
                            </form>
                        </div>

                        {/* Delivery Address card */}
                        <div className="admin-detail-card">
                            <h3>Delivery Address</h3>
                            <div className="address-details-block">
                                <strong>{shippingAddress?.fullName}</strong>
                                <br />
                                {shippingAddress?.address}
                                <br />
                                {shippingAddress?.city}, {shippingAddress?.state} - {shippingAddress?.pincode}
                                <br />
                                Phone: {shippingAddress?.phone}
                            </div>
                        </div>

                        {/* Financial Totals Breakdown card */}
                        <div className="admin-detail-card">
                            <h3>Financial Breakdown</h3>
                            <div className="admin-totals-breakdown">
                                <div className="admin-breakdown-row">
                                    <span>Subtotal</span>
                                    <span>₹{order.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="admin-breakdown-row">
                                    <span>Shipping</span>
                                    <span>{order.shippingCharge === 0 ? 'Free' : `₹${order.shippingCharge}`}</span>
                                </div>
                                <div className="admin-breakdown-row">
                                    <span>Tax (18% GST)</span>
                                    <span>₹{order.tax.toLocaleString()}</span>
                                </div>
                                <div className="admin-breakdown-row">
                                    <span>Discount</span>
                                    <span>₹{order.discount.toLocaleString()}</span>
                                </div>
                                <div className="admin-breakdown-row grand-total">
                                    <span>Grand Total</span>
                                    <span>₹{order.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
