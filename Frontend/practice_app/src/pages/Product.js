import { useEffect, useState } from 'react';
import '../css/Product.css';
import "../adminCss/ProductForm.css";
import { useNavigate } from 'react-router-dom';

export default function Product() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [fetchLoading, setFetchLoading] = useState(false);
    const token = localStorage.getItem('token');

    const fetchProducts = async () => {
        try {
            setFetchLoading(true);
            const response = await fetch('https://e-commerce-3x03.onrender.com/api/product/getAllProduct',
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
    }


    useEffect(() => {
        fetchProducts()
    }, [token]);

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

                        {/* <span className="cart-count">
                                {cartCount}
                            </span> */}
                    </button>


                    <button
                        className="header-btn logout-button"
                        onClick={logout}
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