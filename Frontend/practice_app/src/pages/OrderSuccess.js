import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/OrderSuccess.css';
import { API_BASE_URL } from '../config';

export default function OrderSuccess() {
    const { id } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        const fetchOrder = async () => {
            try {
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

                if (!response.ok) {
                    throw new Error('Failed to load order');
                }

                const result = await response.json();
                setOrder(result.data);
            } catch (err) {
                console.error(err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id, token, navigate]);

    if (loading) {
        return (
            <div className="cart-loading">
                <h2>Verifying order details...</h2>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="success-page">
                <div className="success-card">
                    <div className="success-icon-wrapper" style={{ borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)' }}>
                        <span className="success-icon" style={{ color: '#ef4444' }}>✕</span>
                    </div>
                    <h1>Error Fetching Order</h1>
                    <p className="sub">We couldn't retrieve the details of your order.</p>
                    <button className="success-btn primary" onClick={() => navigate('/')}>
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    const { shippingAddress } = order;

    return (
        <div className="success-page">
            <div className="success-card">
                <div className="success-icon-wrapper">
                    <span className="success-icon">✓</span>
                </div>
                <h1>Order Placed Successfully!</h1>
                <p className="sub">Thank you for your order! We are preparing it for delivery.</p>

                <div className="success-details">
                    <div className="detail-row">
                        <span className="label">Order Number</span>
                        <span className="val">#{order.orderNumber}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Total Amount</span>
                        <span className="val">₹{order.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="detail-row">
                        <span className="label">Payment Method</span>
                        <span className="val">{order.paymentMethod}</span>
                    </div>
                    <div className="detail-row address-row">
                        <span className="label">Delivery Address</span>
                        <span className="val">
                            <strong>{shippingAddress?.fullName}</strong>
                            <br />
                            {shippingAddress?.address}, {shippingAddress?.city}
                            <br />
                            {shippingAddress?.state} - {shippingAddress?.pincode}
                            <br />
                            Phone: {shippingAddress?.phone}
                        </span>
                    </div>
                </div>

                <div className="success-actions">
                    <button
                        className="success-btn primary"
                        onClick={() => navigate(`/orders/${order._id}`)}
                    >
                        View Order
                    </button>
                    <button
                        className="success-btn secondary"
                        onClick={() => navigate('/')}
                    >
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    );
}
