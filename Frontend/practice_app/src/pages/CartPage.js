import { useCallback, useEffect, useState } from 'react';
import '../css/CartPage.css';

export default function CartPage() {
    const [cart, setCart] = useState({ items: [] });
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');

    // Fetch cart
    const fetchCart = useCallback(async () => {
        try {
            const response = await fetch(
                'https://e-commerce-3x03.onrender.com/api/cart',
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            setCart(data || { items: [] });

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // Update quantity
    const updateQuantity = async (productId, quantity) => {
        if (quantity < 1) return;

        await fetch(
            'https://e-commerce-3x03.onrender.com/api/cart/update',
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    productId,
                    quantity,
                }),
            }
        );

        fetchCart();
    };

    // Remove item
    const removeItem = async (productId) => {
        await fetch(
            `https://e-commerce-3x03.onrender.com/api/cart/remove/${productId}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        fetchCart();
    };

    // Calculate totals
    const subtotal = cart.items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
    );

    const shipping = subtotal > 1000 ? 0 : 99;

    const total = subtotal + shipping;

    if (loading) {
        return (
            <div className="cart-loading">
                <h2>Loading cart...</h2>
            </div>
        );
    }

    return (
        <div className="cart-page">
            <h1 className="cart-title">Shopping Cart</h1>

            {cart.items.length === 0 ? (
                <div className="empty-cart">
                    <h2>Your cart is empty</h2>
                    <p>Add some products to continue shopping</p>
                </div>
            ) : (
                <div className="cart-container">
                    {/* Left side */}
                    <div className="cart-items">
                        {cart.items.map((item) => (
                            <div className="cart-item" key={item.product._id}>
                                <img
                                    src={item.product.image}
                                    alt={item.product.title}
                                    className="cart-item-image"
                                />

                                <div className="cart-item-info">
                                    <h3>{item.product.title}</h3>
                                    <p className="cart-category">
                                        {item.product.category}
                                    </p>

                                    <p className="cart-price">
                                        ₹{item.product.price.toLocaleString()}
                                    </p>

                                    <div className="qty-controls">
                                        <button
                                            onClick={() =>
                                                updateQuantity(
                                                    item.product._id,
                                                    item.quantity - 1
                                                )
                                            }
                                        >
                                            -
                                        </button>

                                        <span>{item.quantity}</span>

                                        <button
                                            onClick={() =>
                                                updateQuantity(
                                                    item.product._id,
                                                    item.quantity + 1
                                                )
                                            }
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="cart-item-actions">
                                    <p className="item-total">
                                        ₹{(
                                            item.product.price * item.quantity
                                        ).toLocaleString()}
                                    </p>

                                    <button
                                        className="remove-btn"
                                        onClick={() => removeItem(item.product._id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="cart-summary">
                        <h2>Order Summary</h2>

                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>₹{subtotal.toLocaleString()}</span>
                        </div>

                        <div className="summary-row">
                            <span>Shipping</span>
                            <span>
                                {shipping === 0 ? 'Free' : `₹${shipping}`}
                            </span>
                        </div>

                        <hr />

                        <div className="summary-row total-row">
                            <span>Total</span>
                            <span>₹{total.toLocaleString()}</span>
                        </div>

                        <button className="checkout-btn">
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}