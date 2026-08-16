import React from "react";
import "../adminCss/AdminDashboard.css";

export default function AdminDashboard() {

    return (
        <div>

            <div className="admin-page-header">

                <div>
                    <h1>Dashboard</h1>

                    <p>
                        Welcome back, Admin 👋
                    </p>
                </div>

            </div>


            <div className="stats-grid">

                <div className="stat-card">

                    <div className="stat-icon purple">
                        📦
                    </div>

                    <div>
                        <span>Total Products</span>
                        <h2>125</h2>
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon blue">
                        👥
                    </div>

                    <div>
                        <span>Total Users</span>
                        <h2>850</h2>
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon green">
                        🛒
                    </div>

                    <div>
                        <span>Total Orders</span>
                        <h2>1,240</h2>
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon orange">
                        ₹
                    </div>

                    <div>
                        <span>Total Revenue</span>
                        <h2>₹4.52L</h2>
                    </div>

                </div>

            </div>


            <div className="dashboard-grid">

                <div className="dashboard-card">

                    <div className="card-header">

                        <h3>Recent Orders</h3>

                        <button>
                            View All
                        </button>

                    </div>

                    <div className="empty-dashboard">
                        No recent orders available
                    </div>

                </div>


                <div className="dashboard-card">

                    <div className="card-header">

                        <h3>Low Stock</h3>

                        <button>
                            View Products
                        </button>

                    </div>

                    <div className="empty-dashboard">
                        No low-stock products
                    </div>

                </div>

            </div>

        </div>
    );
}