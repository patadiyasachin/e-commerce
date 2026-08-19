import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/OrderDetails.css';
import { API_BASE_URL } from '../config';

export default function OrderDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [cancelLoading, setCancelLoading] = useState(false);

    const steps = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

    // Fetch single order details
    const fetchOrderDetails = useCallback(async () => {
        try {
            setLoading(true);
            setErrorMsg('');
            const response = await fetch(`${API_BASE_URL}/api/order/${id}`, {
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
        } catch (err) {
            console.error('Error fetching order:', err);
            setErrorMsg(err.message);
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

    // Handle Order Cancellation
    const handleCancelOrder = async () => {
        const confirmCancel = window.confirm('Are you sure you want to cancel this order?');
        if (!confirmCancel) return;

        try {
            setCancelLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/order/cancel/${id}`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();
            if (!response.ok) {
                throw new Error(result.message || 'Failed to cancel order');
            }

            alert('Order cancelled successfully.');
            // Reload details to display updated status and restored stock
            fetchOrderDetails();
        } catch (err) {
            alert(err.message);
        } finally {
            setCancelLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="orders-loading">
                <h2>Loading order details...</h2>
            </div>
        );
    }

    if (errorMsg || !order) {
        return (
            <div className="orders-error">
                <h2>Order details not found</h2>
                <p>{errorMsg || 'Please make sure you are accessing a valid order.'}</p>
                <button className="retry-btn" onClick={() => navigate('/orders')}>
                    Back to Orders
                </button>
            </div>
        );
    }

    const { shippingAddress } = order;
    const currentStepIndex = steps.indexOf(order.orderStatus);

    // Math for connecting line
    const progressPercent = currentStepIndex >= 0 ? (currentStepIndex / (steps.length - 1)) * 100 : 0;

    // Checks if the order is cancellable (Only Pending, Confirmed, Processing are cancellable)
    const isCancellable = ['Pending', 'Confirmed', 'Processing'].includes(order.orderStatus);

    const formattedDate = new Date(order.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="details-page">
            <div className="details-container">
                <div className="details-header">
                    <h1>Order Details</h1>
                    <button className="back-link-btn" onClick={() => navigate('/orders')}>
                        ← My Orders
                    </button>
                </div>

                {/* Timeline Card */}
                {order.orderStatus === 'Cancelled' ? (
                    <div className="cancelled-banner">
                        <span className="cancelled-icon">✕</span>
                        <div className="cancelled-info">
                            <h3>Order Cancelled</h3>
                            <p>This order has been cancelled and stock has been restored to the inventory.</p>
                        </div>
                    </div>
                ) : (
                    <div className="timeline-card">
                        <h3>Order Progress</h3>
                        <div className="tracking-timeline">
                            {/* Connector line indicator */}
                            <div
                                className="timeline-progress-line"
                                style={{
                                    width: window.innerWidth > 768 ? `${progressPercent}%` : '3px',
                                    height: window.innerWidth <= 768 ? `${progressPercent}%` : '3px',
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
                                        <div className="step-bubble">
                                            {idx < currentStepIndex ? '✓' : idx + 1}
                                        </div>
                                        <span className="step-label">{step}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Main Details Grid */}
                <div className="details-grid">
                    {/* Left details */}
                    <div className="details-left">
                        {/* Meta information */}
                        <div className="order-header-meta">
                            <div className="meta-item">
                                <span className="label">Order Number</span>
                                <span className="val">#{order.orderNumber}</span>
                            </div>
                            <div className="meta-item">
                                <span className="label">Date Placed</span>
                                <span className="val">{formattedDate}</span>
                            </div>
                            <div className="meta-item">
                                <span className="label">Payment Method</span>
                                <span className="val">{order.paymentMethod}</span>
                            </div>
                            <div className="meta-item">
                                <span className="label">Payment Status</span>
                                <span className="val">{order.paymentStatus}</span>
                            </div>
                        </div>

                        {/* Items Card */}
                        <div className="details-card">
                            <h2>Items Ordered</h2>
                            <div className="details-items-list">
                                {order.items.map((item) => (
                                    <div className="details-item" key={item._id}>
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            className="details-item-img"
                                        />
                                        <div className="details-item-info">
                                            <h4>{item.title}</h4>
                                            <p>Price: ₹{item.price.toLocaleString()} x {item.quantity}</p>
                                        </div>
                                        <div className="details-item-price">
                                            ₹{item.subtotal.toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right details */}
                    <div className="details-right">
                        {/* Shipping Address */}
                        <div className="details-card">
                            <h2>Shipping Address</h2>
                            <p style={{ lineHeight: '1.6', color: '#cbd5e1' }}>
                                <strong>{shippingAddress?.fullName}</strong>
                                <br />
                                {shippingAddress?.address}
                                <br />
                                {shippingAddress?.city}, {shippingAddress?.state} - {shippingAddress?.pincode}
                                <br />
                                <span style={{ color: '#94a3b8', fontSize: '14px' }}>
                                    Phone: {shippingAddress?.phone}
                                </span>
                            </p>
                        </div>

                        {/* Pricing Breakdown */}
                        <div className="details-card">
                            <h2>Order Total</h2>
                            <div className="pricing-breakdown">
                                <div className="pricing-row">
                                    <span>Subtotal</span>
                                    <span>₹{order.subtotal.toLocaleString()}</span>
                                </div>
                                <div className="pricing-row">
                                    <span>Shipping</span>
                                    <span>{order.shippingCharge === 0 ? 'Free' : `₹${order.shippingCharge}`}</span>
                                </div>
                                <div className="pricing-row">
                                    <span>Tax (18% GST)</span>
                                    <span>₹{order.tax.toLocaleString()}</span>
                                </div>
                                <div className="pricing-row">
                                    <span>Discount</span>
                                    <span>₹{order.discount.toLocaleString()}</span>
                                </div>
                                <div className="pricing-row grand-total">
                                    <span>Total</span>
                                    <span>₹{order.totalAmount.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Order Cancellation */}
                            {isCancellable && (
                                <button
                                    className="cancel-order-btn"
                                    onClick={handleCancelOrder}
                                    disabled={cancelLoading}
                                >
                                    {cancelLoading ? 'Cancelling...' : 'Cancel Order'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
