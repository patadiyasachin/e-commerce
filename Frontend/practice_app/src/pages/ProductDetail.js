import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/ProductDetail.css';

export default function ProductDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);

    const token = localStorage.getItem("token")

    const handleAddToCart = async () => {
        const token = localStorage.getItem('token');

        const response = await fetch(
            'https://e-commerce-3x03.onrender.com/api/cart/add',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    productId: product._id,
                    quantity,
                }),
            }
        );

        const data = await response.json();

        alert(data.message);
    };

    useEffect(() => {
        fetch(`https://e-commerce-3x03.onrender.com/api/product/getProductById/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setProduct(data);
            })
            .catch((err) => console.log(err));
    }, [id, token]);

    if (!product) {
        return (
            <div className="loading-page">
                <h2>Loading product...</h2>
            </div>
        );
    }

    return (
        <div className="detail-page">
            <button className="back-btn" onClick={() => navigate(-1)}>
                ← Back
            </button>

            <div className="detail-container">
                {/* Left - Image */}
                <div className="detail-image-section">
                    <img
                        src={product.image}
                        alt={product.title}
                        className="detail-image"
                    />
                </div>

                {/* Right - Info */}
                <div className="detail-info-section">
                    <span className="category-badge">
                        {product.category}
                    </span>

                    <h1>{product.title}</h1>

                    <div className="rating-row">
                        <span className="stars">★★★★★</span>
                        <span className="review-count">(128 reviews)</span>
                    </div>

                    <div className="price-row-detail">
                        <span className="main-price">
                            ₹{product.price.toLocaleString()}
                        </span>

                        <span className="old-price-detail">
                            ₹{(product.price + 5000).toLocaleString()}
                        </span>

                        <span className="discount">20% OFF</span>
                    </div>

                    <p className="description-detail">
                        {product.description}
                    </p>

                    <div className="stock-row">
                        <strong>Stock:</strong>
                        <span
                            className={
                                product.stock > 0 ? 'in-stock' : 'out-stock'
                            }
                        >
                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </div>

                    <div className="quantity-row">
                        <strong>Quantity:</strong>

                        <div className="qty-controls">
                            <button
                                onClick={() =>
                                    setQuantity((q) => Math.max(1, q - 1))
                                }
                            >
                                -
                            </button>

                            <span>{quantity}</span>

                            <button
                                onClick={() => setQuantity((q) => q + 1)}
                            >
                                +
                            </button>
                        </div>
                    </div>

                    <div className="action-buttons">
                        <button className="cart-btn" onClick={handleAddToCart}>
                            Add to Cart
                        </button>

                        <button className="buy-btn">
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}