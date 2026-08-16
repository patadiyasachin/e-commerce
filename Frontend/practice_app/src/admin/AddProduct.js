import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../adminCss/ProductForm.css";

export default function AddProduct() {

    const navigate = useNavigate();

    const token = localStorage.getItem("token");


    const [formData, setFormData] = useState({

        title: "",
        description: "",
        price: "",
        image: "",
        category: "",
        stock: ""

    });


    const [loading, setLoading] = useState(false);


    const handleChange = (event) => {

        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));

    };


    const handleSubmit = async (event) => {

        event.preventDefault();

        try {

            setLoading(true);


            const response = await fetch(
                "https://e-commerce-3x03.onrender.com/api/admin/product/add",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },

                    body: JSON.stringify({

                        title: formData.title,

                        description:
                            formData.description,

                        price:
                            Number(formData.price),

                        image:
                            formData.image,

                        category:
                            formData.category,

                        stock:
                            Number(formData.stock),

                    }),
                }
            );


            const data = await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Failed to add product"
                );

            }


            alert(
                "Product added successfully"
            );


            navigate("/admin/products");


        } catch (error) {

            console.error(error);

            alert(error.message);

        } finally {

            setLoading(false);

        }

    };


    return (

        <div className="product-form-page">

            <div className="admin-page-header">

                <div>

                    <h1>Add Product</h1>

                    <p>
                        Add a new product to your store
                    </p>

                </div>

            </div>


            <form
                className="product-form"
                onSubmit={handleSubmit}
            >

                <div className="form-group">

                    <label>
                        Product Name
                    </label>

                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Enter product name"
                        required
                    />

                </div>


                <div className="form-group">

                    <label>
                        Description
                    </label>

                    <textarea
                        name="description"
                        value={
                            formData.description
                        }
                        onChange={handleChange}
                        placeholder="Enter product description"
                        rows="5"
                        required
                    />

                </div>


                <div className="form-row">

                    <div className="form-group">

                        <label>
                            Price
                        </label>

                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            placeholder="₹0"
                            min="0"
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Stock
                        </label>

                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            placeholder="0"
                            min="0"
                            required
                        />

                    </div>

                </div>


                <div className="form-row">

                    <div className="form-group">

                        <label>
                            Category
                        </label>

                        <input
                            type="text"
                            name="category"
                            value={
                                formData.category
                            }
                            onChange={handleChange}
                            placeholder="Electronics"
                            required
                        />

                    </div>


                    <div className="form-group">

                        <label>
                            Image URL
                        </label>

                        <input
                            type="url"
                            name="image"
                            value={
                                formData.image
                            }
                            onChange={handleChange}
                            placeholder="https://..."
                            required
                        />

                    </div>

                </div>


                <div className="form-actions">

                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={() =>
                            navigate(
                                "/admin/products"
                            )
                        }
                    >
                        Cancel
                    </button>


                    <button
                        type="submit"
                        className="save-btn"
                        disabled={loading}
                    >
                        {loading
                            ? "Adding..."
                            : "Add Product"}
                    </button>

                </div>

            </form>

        </div>

    );
}