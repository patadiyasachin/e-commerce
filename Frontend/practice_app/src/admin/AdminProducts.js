import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../adminCss/AdminProducts.css";

export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [filterProducts, setfilterProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    const token = localStorage.getItem("token");


    const fetchProducts = useCallback(async () => {

        try {

            setLoading(true);

            const response = await fetch(
                "https://e-commerce-3x03.onrender.com/api/admin/product/all",
                {
                    method: "GET",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to fetch products"
                );
            }

            setProducts(data.products || []);
            setfilterProducts(data.products)

        } catch (error) {

            console.error(error);

            alert(error.message);

        } finally {

            setLoading(false);

        }
    }, [token]);


    const filterProd = (e) => {

        const value = e.target.value.toLowerCase();

        const result = products.filter((pro) =>
            pro.title?.toLowerCase().includes(value) ||
            pro.category?.toLowerCase().includes(value)
        );

        setfilterProducts(result);
    };


    useEffect(() => {

        fetchProducts();

    }, [fetchProducts]);


    const handleDelete = async (id) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this product?"
            );

        if (!confirmDelete) {
            return;
        }


        try {

            const response = await fetch(
                `https://e-commerce-3x03.onrender.com/api/admin/product/delete/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message || "Delete failed"
                );

            }


            alert("Product deleted successfully");


            setProducts((previousProducts) =>
                previousProducts.filter(
                    (product) =>
                        product._id !== id
                )
            );


        } catch (error) {

            console.error(error);

            alert(error.message);

        }
    };


    if (loading) {

        return (
            <div className="admin-loading">
                Loading products...
            </div>
        );

    }


    return (

        <div className="products-page">


            <div className="admin-page-header">

                <div>

                    <h1>Products</h1>

                    <p>
                        Manage your store products
                    </p>

                </div>


                <button
                    className="add-product-btn"
                    onClick={() =>
                        navigate("/admin/products/add")
                    }
                >
                    + Add Product
                </button>

            </div>


            <div className="products-container">

                <div className="products-toolbar">

                    <div>

                        <strong>
                            {products.length}
                        </strong>

                        {" "}Products

                    </div>


                    <input
                        type="text"
                        placeholder="Search products..."
                        onChange={filterProd}
                    />

                </div>


                <div className="table-wrapper">

                    <table>

                        <thead>

                            <tr>

                                <th>Product</th>

                                <th>Category</th>

                                <th>Price</th>

                                <th>Stock</th>

                                <th>Status</th>

                                <th>Actions</th>

                            </tr>

                        </thead>


                        <tbody>

                            {products.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="no-products"
                                    >
                                        No products found
                                    </td>

                                </tr>

                            ) : (

                                filterProducts.map((product) => (

                                    <tr
                                        key={product._id}
                                    >

                                        <td>

                                            <div className="product-cell">

                                                <img
                                                    src={
                                                        product.image
                                                    }
                                                    alt={
                                                        product.title
                                                    }
                                                />

                                                <div>

                                                    <strong>
                                                        {
                                                            product.title
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            product._id
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                        </td>


                                        <td>
                                            {
                                                product.category
                                            }
                                        </td>


                                        <td>
                                            ₹
                                            {
                                                Number(
                                                    product.price
                                                ).toLocaleString(
                                                    "en-IN"
                                                )
                                            }
                                        </td>


                                        <td>
                                            {
                                                product.stock
                                            }
                                        </td>


                                        <td>

                                            {product.stock > 0 ? (

                                                <span className="stock active">
                                                    In Stock
                                                </span>

                                            ) : (

                                                <span className="stock inactive">
                                                    Out of Stock
                                                </span>

                                            )}

                                        </td>


                                        <td>

                                            <div className="action-buttons">

                                                <button
                                                    className="edit-btn"
                                                    onClick={() =>
                                                        navigate(
                                                            `/admin/products/edit/${product._id}`
                                                        )
                                                    }
                                                >
                                                    Edit
                                                </button>


                                                <button
                                                    className="delete-btn"
                                                    onClick={() =>
                                                        handleDelete(
                                                            product._id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))

                            )}

                        </tbody>

                    </table>

                </div>

            </div>

        </div>

    );
}