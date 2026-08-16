import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../adminCss/AdminSidebar.css";

export default function AdminSidebar() {

    const navigate = useNavigate();

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };

    return (
        <aside className="admin-sidebar">

            <div className="admin-logo">
                <div className="logo-icon">S</div>

                <div>
                    <h2>ShopAdmin</h2>
                    <span>Admin Panel</span>
                </div>
            </div>

            <div className="sidebar-menu">

                <p className="menu-title">MAIN</p>

                <NavLink
                    to="/admin/dashboard"
                    className="sidebar-link"
                >
                    <span>📊</span>
                    Dashboard
                </NavLink>

                <NavLink
                    to="/admin/products"
                    className="sidebar-link"
                >
                    <span>📦</span>
                    Products
                </NavLink>

                <NavLink
                    to="/admin/categories"
                    className="sidebar-link"
                >
                    <span>🗂️</span>
                    Categories
                </NavLink>

                <NavLink
                    to="/admin/orders"
                    className="sidebar-link"
                >
                    <span>🛒</span>
                    Orders
                </NavLink>

                <NavLink
                    to="/admin/users"
                    className="sidebar-link"
                >
                    <span>👥</span>
                    Users
                </NavLink>

                <p className="menu-title">SYSTEM</p>

                <NavLink
                    to="/admin/settings"
                    className="sidebar-link"
                >
                    <span>⚙️</span>
                    Settings
                </NavLink>

            </div>

            <div className="sidebar-bottom">

                <button
                    className="logout-btn"
                    onClick={logout}
                >
                    <span>🚪</span>
                    Logout
                </button>

            </div>

        </aside>
    );
}