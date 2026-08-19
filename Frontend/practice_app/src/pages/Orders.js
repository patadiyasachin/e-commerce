import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Orders.css';
import { API_BASE_URL } from '../config';

export default function Orders() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            setError(false);
            const response = await fetch(`${API_BASE_URL}/api/order/my-orders`, {
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
                throw new Error('Failed to fetch orders');
            }

            const result = await response.json();
            setOrders(result.data || []);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [token, navigate]);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchOrders();
    }, [token, fetchOrders, navigate]);

    const getStatusClass = (status) => {
        // Convert 'Out for Delivery' to 'out-for-delivery' for CSS class matching
        const formatted = status.toLowerCase().replace(/\s+/g, '-');
        return `status-${formatted}`;
    };

    if (loading) {
        return (
            <div className="orders-loading">
                <h2>Loading orders...</h2>
                <p>Please wait while we fetch your purchase history.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="orders-error">
                <h2>Unable to load orders</h2>
                <p>There was a connection issue. Please check your network and try again.</p>
                <button className="retry-btn" onClick={fetchOrders}>
                    Retry
                </button>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="orders-empty">
                <h2>You don't have any orders yet</h2>
                <p>Start exploring our latest products and place your first order!</p>
                <button className="shop-btn" onClick={() => navigate('/')}>
                    Start Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="orders-page">
            <div className="orders-container">
                <div className="orders-header">
                    <h1>My Orders</h1>
                    <button className="home-link-btn" onClick={() => navigate('/')}>
                        ← Back to Home
                    </button>
                </div>

                <div className="orders-list">
                    {orders.map((order) => {
                        const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
                        const formattedDate = new Date(order.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                        });

                        return (
                            <div className="order-card" key={order._id}>
                                <div className="order-card-header">
                                    <div className="order-meta">
                                        <h3>Order #{order.orderNumber}</h3>
                                        <span className="order-date">Placed on {formattedDate}</span>
                                    </div>
                                    <span className={`order-status-badge ${getStatusClass(order.orderStatus)}`}>
                                        {order.orderStatus}
                                    </span>
                                </div>

                                <div className="order-card-body">
                                    <div className="order-summary-details">
                                        <span className="order-items-count">
                                            {totalQuantity} {totalQuantity === 1 ? 'Item' : 'Items'}
                                        </span>
                                        <span className="order-amount">₹{order.totalAmount.toLocaleString()}</span>
                                        <span className="order-payment-status">
                                            Payment: <strong>{order.paymentStatus}</strong>
                                        </span>
                                    </div>

                                    <button
                                        className="view-details-btn"
                                        onClick={() => navigate(`/orders/${order._id}`)}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
