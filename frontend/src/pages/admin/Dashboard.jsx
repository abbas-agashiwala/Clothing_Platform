import { useEffect, useState } from "react";
import api from "../../services/api";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export default function Dashboard() {
  const [d, setD] = useState({});
  const [stats, setStats] = useState({
    byStatus: [],
    byCategory: [],
    bestSelling: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [dashboardRes, statisticsRes] = await Promise.all([
        api.get("/admin/dashboard"),
        api.get("/admin/statistics"),
      ]);

      setD(dashboardRes.data.data);

      setStats(
        statisticsRes.data.data || {
          byStatus: [],
          byCategory: [],
          bestSelling: [],
        },
      );

      console.log("Dashboard:", dashboardRes.data);
      console.log("Statistics:", statisticsRes.data);
    } catch (err) {
      console.error("Dashboard error:", err);

      setError(
        err?.response?.data?.message || "Unable to load dashboard data.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="container-fluid py-5">
        <div className="text-center">
          <div className="spinner-border" role="status"></div>

          <p className="mt-3">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          <strong>Error:</strong> {error}
          <div className="mt-3">
            <button className="btn btn-dark" onClick={loadDashboard}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // CHART DATA
  // ==========================================

  const statusData = (stats.byStatus || []).map((item) => ({
    name: item._id,
    count: item.count,
  }));

  const categoryData = (stats.byCategory || []).map((item) => ({
    name: item.category,
    count: item.count,
  }));

  const bestSellingData = (stats.bestSelling || []).map((item) => ({
    name: item.name,
    sold: item.sold,
  }));

  return (
    <div className="container-fluid py-4">
      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-bold mb-1">Admin Dashboard</h1>

          <p className="text-muted mb-0">
            Overview of your clothing e-commerce platform
          </p>
        </div>

        <button className="btn btn-outline-dark" onClick={loadDashboard}>
          Refresh
        </button>
      </div>

      {/* ==========================================
          PART A — STATISTICS CARDS
      ========================================== */}

      <div className="row g-4">
        {/* USERS */}

        <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted">Total Users</div>

              <h2 className="fw-bold mt-2">{d.users || 0}</h2>

              <small className="text-muted">Registered customers</small>
            </div>
          </div>
        </div>

        {/* PRODUCTS */}

        <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted">Total Products</div>

              <h2 className="fw-bold mt-2">{d.products || 0}</h2>

              <small className="text-muted">Active products</small>
            </div>
          </div>
        </div>

        {/* CATEGORIES */}

        <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted">Categories</div>

              <h2 className="fw-bold mt-2">{d.categories || 0}</h2>

              <small className="text-muted">Product categories</small>
            </div>
          </div>
        </div>

        {/* ORDERS */}

        <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted">Total Orders</div>

              <h2 className="fw-bold mt-2">{d.orders || 0}</h2>

              <small className="text-muted">All orders</small>
            </div>
          </div>
        </div>

        {/* REVENUE */}

        <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted">Revenue</div>

              <h2 className="fw-bold mt-2">
                ₹{Number(d.revenue || 0).toLocaleString("en-IN")}
              </h2>

              <small className="text-muted">Successful payments</small>
            </div>
          </div>
        </div>

        {/* PENDING */}

        <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted">Pending Orders</div>

              <h2 className="fw-bold mt-2">{d.pendingOrders || 0}</h2>

              <small className="text-muted">Waiting for confirmation</small>
            </div>
          </div>
        </div>

        {/* DELIVERED */}

        <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted">Delivered Orders</div>

              <h2 className="fw-bold mt-2">{d.deliveredOrders || 0}</h2>

              <small className="text-muted">Successfully delivered</small>
            </div>
          </div>
        </div>

        {/* CANCELLED */}

        <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted">Cancelled Orders</div>

              <h2 className="fw-bold mt-2">{d.cancelledOrders || 0}</h2>

              <small className="text-muted">Cancelled orders</small>
            </div>
          </div>
        </div>

        {/* LOW STOCK */}

        <div className="col-12 col-sm-6 col-lg-4 col-xl-3">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <div className="text-muted">Low Stock</div>

              <h2 className="fw-bold mt-2">{d.lowStock || 0}</h2>

              <small className="text-muted">Products needing attention</small>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          PART B — CHARTS
      ========================================== */}

      <div className="row g-4 mt-2">
        {/* ========================================
            CHART 1 — ORDER STATUS
        ======================================== */}

        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h4 className="fw-bold mb-4">Orders by Status</h4>

              {statusData.length === 0 ? (
                <div className="text-muted text-center py-5">
                  No order status data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="name" />

                    <YAxis allowDecimals={false} />

                    <Tooltip />

                    <Legend />

                    <Bar dataKey="count" name="Orders" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* ========================================
            CHART 2 — CATEGORY
        ======================================== */}

        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h4 className="fw-bold mb-4">Products by Category</h4>

              {categoryData.length === 0 ? (
                <div className="text-muted text-center py-5">
                  No category data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis
                      dataKey="name"
                      interval={0}
                      angle={-30}
                      textAnchor="end"
                      height={80}
                    />

                    <YAxis allowDecimals={false} />

                    <Tooltip />

                    <Legend />

                    <Bar dataKey="count" name="Products" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* ========================================
            CHART 3 — BEST SELLING
        ======================================== */}

        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h4 className="fw-bold mb-4">Best-Selling Products</h4>

              {bestSellingData.length === 0 ? (
                <div className="text-muted text-center py-5">
                  No sales data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={bestSellingData}
                    layout="vertical"
                    margin={{
                      left: 20,
                      right: 20,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis type="number" allowDecimals={false} />

                    <YAxis type="category" dataKey="name" width={120} />

                    <Tooltip />

                    <Legend />

                    <Bar dataKey="sold" name="Units Sold" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* ========================================
            CHART 4 — ORDER DISTRIBUTION
        ======================================== */}

        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h4 className="fw-bold mb-4">Order Distribution</h4>

              {statusData.length === 0 ? (
                <div className="text-muted text-center py-5">
                  No order data available.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      label
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} />
                      ))}
                    </Pie>

                    <Tooltip />

                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          FOOTER
      ========================================== */}

      {/* ==========================================
    PART C — RECENT ORDERS + LOW STOCK
========================================== */}

      <div className="row g-4 mt-2">
        {/* ========================================
      RECENT ORDERS
  ======================================== */}

        <div className="col-12 col-lg-7">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h4 className="fw-bold mb-4">Recent Orders</h4>

              {!d.recentOrders || d.recentOrders.length === 0 ? (
                <div className="text-center text-muted py-5">
                  No recent orders available.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>

                    <tbody>
                      {d.recentOrders.map((order, index) => (
                        <tr key={order._id || index}>
                          <td>
                            <strong>{order.order_id || order._id}</strong>
                          </td>

                          <td>
                            ₹
                            {Number(order.total_amount || 0).toLocaleString(
                              "en-IN",
                            )}
                          </td>

                          <td>
                            <span
                              className={`badge ${
                                order.order_status === "DELIVERED"
                                  ? "bg-success"
                                  : order.order_status === "CANCELLED"
                                    ? "bg-danger"
                                    : order.order_status === "SHIPPED"
                                      ? "bg-primary"
                                      : "bg-warning text-dark"
                              }`}
                            >
                              {order.order_status}
                            </span>
                          </td>

                          <td>
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString(
                                  "en-IN",
                                )
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================
      LOW STOCK PRODUCTS
  ======================================== */}

        <div className="col-12 col-lg-5">
          <div className="card shadow-sm border-0 h-100">
            <div className="card-body">
              <h4 className="fw-bold mb-4">Low Stock Products</h4>

              {!d.lowStockProducts || d.lowStockProducts.length === 0 ? (
                <div className="text-center text-muted py-5">
                  No low-stock products.
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Stock</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {d.lowStockProducts.map((product, index) => (
                        <tr key={product._id || index}>
                          <td>
                            <strong>{product.product_name}</strong>
                          </td>

                          <td>
                            <span className="fw-bold">
                              {product.stock_quantity}
                            </span>
                          </td>

                          <td>
                            <span className="badge bg-warning text-dark">
                              LOW STOCK
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
    DASHBOARD OVERVIEW
========================================== */}

      <div className="card shadow-sm border-0 mt-4">
        <div className="card-body">
          <h5 className="fw-bold">Dashboard Overview</h5>

          <p className="text-muted mb-0">
            Monitor customers, products, categories, orders, inventory, sales
            performance and order distribution from this dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
