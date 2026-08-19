import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/Checkout.css';
import { API_BASE_URL } from '../config';

export default function Checkout() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const [cart, setCart] = useState({ items: [] });
    const [loading, setLoading] = useState(true);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [form, setForm] = useState({
        fullName: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
    });

    const [errors, setErrors] = useState({});
    const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery');

    // Fetch Cart
    const fetchCart = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/cart`, {
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

            const data = await response.json();
            if (!data || !data.items || data.items.length === 0) {
                // Empty cart or no cart, redirect to cart page
                navigate('/cart');
                return;
            }
            setCart(data);
        } catch (error) {
            console.error('Error fetching cart:', error);
            setErrorMsg('Failed to load cart items.');
        } finally {
            setLoading(false);
        }
    }, [token, navigate]);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchCart();
    }, [token, fetchCart, navigate]);

    // Handle Input Change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        // Clear field error when user starts typing
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
    };

    // Validation
    const validateForm = () => {
        const newErrors = {};

        if (!form.fullName.trim()) {
            newErrors.fullName = 'Full Name is required';
        } else if (form.fullName.trim().length < 2) {
            newErrors.fullName = 'Full Name must be at least 2 characters';
        }

        const indianPhoneRegex = /^[6-9]\d{9}$/;
        if (!form.phone.trim()) {
            newErrors.phone = 'Phone number is required';
        } else if (!indianPhoneRegex.test(form.phone.trim())) {
            newErrors.phone = 'Please enter a valid 10-digit Indian phone number';
        }

        if (!form.address.trim()) {
            newErrors.address = 'Address is required';
        }

        if (!form.city.trim()) {
            newErrors.city = 'City is required';
        }

        if (!form.state.trim()) {
            newErrors.state = 'State is required';
        }

        const pincodeRegex = /^\d{6}$/;
        if (!form.pincode.trim()) {
            newErrors.pincode = 'Pincode is required';
        } else if (!pincodeRegex.test(form.pincode.trim())) {
            newErrors.pincode = 'Pincode must be exactly 6 digits';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Calculate totals matching backend calculations
    const subtotal = cart.items.reduce(
        (sum, item) => sum + (item.product?.price || 0) * item.quantity,
        0
    );
    const shippingCharge = subtotal > 1000 ? 0 : 99;
    const tax = parseFloat((subtotal * 0.18).toFixed(2));
    const total = parseFloat((subtotal + shippingCharge + tax).toFixed(2));

    // Handle Place Order
    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!validateForm()) {
            return;
        }

        try {
            setSubmitLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/order/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    shippingAddress: form,
                    paymentMethod,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Something went wrong while placing order.');
            }

            // Redirect to Order Success Page with new order's ID
            navigate(`/order-success/${result.data._id}`);
        } catch (err) {
            setErrorMsg(err.message);
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="cart-loading">
                <h2>Loading checkout...</h2>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <h1 className="checkout-title">Checkout</h1>

            {errorMsg && <div className="error-banner">{errorMsg}</div>}

            <form className="checkout-container" onSubmit={handleSubmit}>
                {/* Left Form */}
                <div className="checkout-form-section">
                    <h2>Shipping Address</h2>

                    <div className="form-group">
                        <label htmlFor="fullName">Full Name</label>
                        <input
                            type="text"
                            id="fullName"
                            name="fullName"
                            placeholder="John Doe"
                            value={form.fullName}
                            onChange={handleChange}
                        />
                        {errors.fullName && <span className="error-text">{errors.fullName}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone">Phone Number</label>
                        <input
                            type="text"
                            id="phone"
                            name="phone"
                            placeholder="9876543210"
                            value={form.phone}
                            onChange={handleChange}
                        />
                        {errors.phone && <span className="error-text">{errors.phone}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <input
                            type="text"
                            id="address"
                            name="address"
                            placeholder="Apartment, Street Address"
                            value={form.address}
                            onChange={handleChange}
                        />
                        {errors.address && <span className="error-text">{errors.address}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="city">City</label>
                            <input
                                type="text"
                                id="city"
                                name="city"
                                placeholder="Mumbai"
                                value={form.city}
                                onChange={handleChange}
                            />
                            {errors.city && <span className="error-text">{errors.city}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="state">State</label>
                            <input
                                type="text"
                                id="state"
                                name="state"
                                placeholder="Maharashtra"
                                value={form.state}
                                onChange={handleChange}
                            />
                            {errors.state && <span className="error-text">{errors.state}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="pincode">Pincode</label>
                        <input
                            type="text"
                            id="pincode"
                            name="pincode"
                            placeholder="400001"
                            value={form.pincode}
                            onChange={handleChange}
                        />
                        {errors.pincode && <span className="error-text">{errors.pincode}</span>}
                    </div>

                    <h2>Payment Method</h2>
                    <div className="payment-options">
                        <div
                            className={`payment-option-card ${paymentMethod === 'Cash on Delivery' ? 'selected' : ''
                                }`}
                            onClick={() => setPaymentMethod('Cash on Delivery')}
                        >
                            <input
                                type="radio"
                                id="cod"
                                name="payment"
                                checked={paymentMethod === 'Cash on Delivery'}
                                onChange={() => setPaymentMethod('Cash on Delivery')}
                            />
                            <div className="payment-details">
                                <span>Cash on Delivery</span>
                                <small>Pay with cash upon delivery</small>
                            </div>
                        </div>

                        <div className="payment-option-card disabled">
                            <input type="radio" id="online" name="payment" disabled />
                            <div className="payment-details">
                                <span>Online Payment</span>
                                <small>Razorpay / Stripe</small>
                            </div>
                            <span className="badge-coming-soon">Coming Soon</span>
                        </div>
                    </div>
                </div>

                {/* Right Summary */}
                <div className="checkout-summary-section">
                    <h2>Order Summary</h2>

                    <div className="checkout-items-list">
                        {cart.items.map((item) => (
                            <div className="checkout-item" key={item.product?._id}>
                                <img
                                    src={item.product?.image}
                                    alt={item.product?.title}
                                    className="checkout-item-img"
                                />
                                <div className="checkout-item-info">
                                    <h4>{item.product?.title}</h4>
                                    <p>Qty: {item.quantity}</p>
                                </div>
                                <div className="checkout-item-price">
                                    ₹{((item.product?.price || 0) * item.quantity).toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="checkout-totals">
                        <div className="checkout-row">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="checkout-row">
                            <span>Shipping</span>
                            <span>{shippingCharge === 0 ? 'Free' : `₹${shippingCharge}`}</span>
                        </div>
                        <div className="checkout-row">
                            <span>Tax (18% GST)</span>
                            <span>₹{tax.toLocaleString()}</span>
                        </div>
                        <div className="checkout-row">
                            <span>Discount</span>
                            <span>₹0</span>
                        </div>
                        <div className="checkout-row total">
                            <span>Total</span>
                            <span>₹{total.toLocaleString()}</span>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="place-order-btn"
                        disabled={submitLoading}
                    >
                        {submitLoading ? 'Placing Order...' : 'Place Order'}
                    </button>
                </div>
            </form>
        </div>
    );
}
