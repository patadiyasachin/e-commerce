import React, { useEffect, useState } from "react";
import "../adminCss/AdminDashboard.css";
import "../adminCss/AdminProducts.css";
import { API_BASE_URL } from "../config";

export default function AdminDashboard() {
    const [dashboardData, setDashboardData] = useState({})
    const [loading, setLoading] = useState(true)

    const fetchDashboardData = async () => {
        const token = localStorage.getItem("token")
        try {
            setLoading(true)
            const response = await fetch(`${API_BASE_URL}/api/admin/product/getDashboardData`,
                {
                    method: "GET",

                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                }
            )
            const data = await response.json()
            setDashboardData(data)
        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) {

        return (
            <div className="admin-loading">
                Loading ...
            </div>
        );

    }

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
                        <h2>{dashboardData.totalProducts}</h2>
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon blue">
                        👥
                    </div>

                    <div>
                        <span>Total Users</span>
                        <h2>{dashboardData.totalUsers}</h2>
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon green">
                        🛒
                    </div>

                    <div>
                        <span>Total Orders</span>
                        <h2>{dashboardData.totalOrders !== undefined ? dashboardData.totalOrders : '...'}</h2>
                    </div>

                </div>


                <div className="stat-card">

                    <div className="stat-icon orange">
                        ₹
                    </div>

                    <div>
                        <span>Total Revenue</span>
                        <h2>₹{dashboardData.totalRevenue !== undefined ? dashboardData.totalRevenue.toLocaleString() : '...'}</h2>
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