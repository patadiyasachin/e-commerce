import { useEffect, useState, useCallback } from 'react';
import '../css/Product.css';
import "../adminCss/ProductForm.css";
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';

export default function Product() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [fetchLoading, setFetchLoading] = useState(false);
    const token = localStorage.getItem('token');

    const fetchProducts = useCallback(async () => {
        try {
            setFetchLoading(true);
            const response = await fetch(`${API_BASE_URL}/api/product/getAllProduct`,
                {
                    method: "GET",

                    headers: {
                        "Content-Type": "application/json",

                        Authorization: `Bearer ${token}`,
                    },
                }
            )

            const data = await response.json()

            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to fetch product"
                );

            }


            console.log("Product:", data);

            setProducts(data.product || data);

        } catch (error) {

            console.error(error);

            alert(error.message);

            navigate("/admin/products");

        } finally {

            setFetchLoading(false);

        }
    }, [token, navigate]);


    useEffect(() => {
        fetchProducts()
    }, [fetchProducts]);

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <div className="shop-page">
            <div className="shop-header">

                <div className="header-left">

                    <h1>
                        Featured Products
                    </h1>

                    <p>
                        Discover the latest gadgets, shoes, and accessories
                    </p>

                </div>


                <div className="header-actions">

                    <button
                        className="header-btn cart-button"
                        onClick={() => navigate("/cart")}
                    >
                        <span className="btn-icon">
                            🛒
                        </span>

                        <span>
                            Cart
                        </span>
                    </button>

                    <button
                        className="header-btn orders-button"
                        onClick={() => navigate("/orders")}
                        style={{ background: 'rgba(255, 123, 0,0.9)', border: '1px solid rgba(255, 255, 255, 0.28)', marginLeft: '10px', color: 'white' }}
                    >
                        <span className="btn-icon">
                            📦
                        </span>
                        <span>
                            My Orders
                        </span>
                    </button>

                    <button
                        className="header-btn logout-button"
                        onClick={logout}
                        style={{ marginLeft: '10px' }}
                    >
                        <span className="btn-icon">
                            ↪
                        </span>

                        <span>
                            Logout
                        </span>
                    </button>

                </div>

            </div>

            {fetchLoading ? (
                <center>
                    <h2>Loading ....</h2>
                </center>
            ) : (
                <div className="product-grid">

                    {products.map((product) => (

                        <div
                            className="product-card"
                            key={product._id}
                            onClick={() =>
                                navigate(`/product/${product._id}`)
                            }
                        >

                            <div className="product-image-wrapper">

                                <img
                                    src={product.image}
                                    alt={product.title}
                                />

                                <span className="badge">
                                    New
                                </span>

                            </div>


                            <div className="product-info">

                                <h3>
                                    {product.title}
                                </h3>


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


                                <button
                                    className="add-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                    }}
                                >
                                    Add to Cart
                                </button>

                            </div>

                        </div>

                    ))}

                </div>
            )}
        </div>
    );
}