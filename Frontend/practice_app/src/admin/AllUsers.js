import React, { useCallback, useEffect, useState } from "react";
import "../adminCss/AdminProducts.css";

export default function AllUsers() {

    const [user, setUser] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("token");

    const fetchUsers = useCallback(async () => {

        try {

            setLoading(true);

            const response = await fetch(
                "https://e-commerce-3x03.onrender.com/api/admin/user/allUser",
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
                    data.message || "Failed to fetch users"
                );
            }

            setUser(data.user || []);
            setFilteredUsers(data.user);

        } catch (error) {

            console.error(error);

            alert(error.message);

        } finally {

            setLoading(false);

        }
    }, [token]);


    useEffect(() => {

        fetchUsers();

    }, [fetchUsers]);


    if (loading) {

        return (
            <div className="admin-loading">
                Loading Users...
            </div>
        );

    }

    const filterUser = (e) => {
        const value = e.target.value.toLowerCase();

        const result = user.filter((user) =>
            user.name.toLowerCase().includes(value)
        );

        setFilteredUsers(result);
    }

    const handleDelete = async (id) => {

        const confirmDelete =
            window.confirm(
                "Are you sure you want to delete this user?"
            );

        if (!confirmDelete) {
            return;
        }


        try {

            const response = await fetch(
                `https://e-commerce-3x03.onrender.com/api/admin/user/deleteUser/${id}`,
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


            alert("User deleted successfully");

            setFilteredUsers((previousUsers) =>
                previousUsers.filter(
                    (user) =>
                        user._id !== id
                )
            );
        } catch (error) {

            console.error(error);

            alert(error.message);

        }
    };

    return (

        <div className="products-page">


            <div className="admin-page-header">

                <div>

                    <h1>Users</h1>

                    <p>
                        Manage your Users
                    </p>

                </div>
            </div>


            <div className="products-container">

                <div className="products-toolbar">

                    <div>

                        <strong>
                            {user.length}
                        </strong>

                        {" "}Users

                    </div>


                    <input
                        type="text"
                        placeholder="Search Users..."
                        onChange={filterUser}
                    />

                </div>


                <div className="table-wrapper">

                    <table>

                        <thead>

                            <tr>

                                <th>Name</th>

                                <th>Email</th>

                                <th>Action</th>

                            </tr>

                        </thead>


                        <tbody>

                            {user.length === 0 ? (

                                <tr>

                                    <td
                                        colSpan="6"
                                        className="no-products"
                                    >
                                        No User found
                                    </td>

                                </tr>

                            ) : (

                                filteredUsers.map((u) => (

                                    <tr
                                        key={u._id}
                                    >

                                        <td>

                                            <div className="product-cell">
                                                <div>

                                                    <strong>
                                                        {
                                                            u.name
                                                        }
                                                    </strong>

                                                    <span>
                                                        {
                                                            u._id
                                                        }
                                                    </span>

                                                </div>

                                            </div>

                                        </td>


                                        <td>
                                            {
                                                u.email
                                            }
                                        </td>

                                        <td>

                                            <div className="action-buttons">
                                                <button
                                                    className="delete-btn"
                                                    onClick={() =>
                                                        handleDelete(
                                                            u._id
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