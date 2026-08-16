import { useEffect, useState } from 'react';
import '../css/Product.css';
import { useNavigate } from 'react-router-dom';


export default function Product() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetch('http://localhost:5000/api/product/getAllProduct', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                setProducts(data.product || data);
            })
            .catch((err) => {
                console.log(err);
            });
    }, []);

    return (
        <div className="shop-page">
            <div className="shop-header">
                <div className="header-left">
                    <h1>Featured Products</h1>
                    <p>Discover the latest gadgets, shoes, and accessories</p>
                </div>

                <button
                    className="cart-button"
                    onClick={() => navigate('/cart')}
                >
                    <span className="cart-icon">🛒</span>
                    <span>Cart</span>
                    {/* <span className="cart-count">{cartCount}</span> */}
                </button>
            </div>

            <div className="product-grid">
                {products.map((product) => (
                    <div className="product-card" key={product._id} onClick={() => navigate(`/product/${product._id}`)}>
                        <div className="product-image-wrapper">
                            <img src={product.image} alt={product.title} />
                            <span className="badge">New</span>
                        </div>

                        <div className="product-info">
                            <h3>{product.title}</h3>

                            <div className="rating">
                                ★★★★★ <span>(120)</span>
                            </div>

                            <div className="price-row">
                                <span className="price">
                                    ₹{product.price.toLocaleString()}
                                </span>

                                <span className="old-price">
                                    ₹{(product.price + 5000).toLocaleString()}
                                </span>
                            </div>

                            <button className="add-btn">Add to Cart</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}