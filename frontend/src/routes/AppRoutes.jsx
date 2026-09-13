import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";
import UserLayout from "../layouts/UserLayout";
import AdminLayout from "../layouts/AdminLayout";
import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import Home from "../pages/user/Home";
import Categories from "../pages/user/Categories";
import CategoryProducts from "../pages/user/CategoryProducts";
import ProductDetails from "../pages/user/ProductDetails";
import Cart from "../pages/user/Cart";
import Wishlist from "../pages/user/Wishlist";
import Checkout from "../pages/user/Checkout";
import Success from "../pages/user/OrderSuccess";
import Profile from "../pages/user/profile/Profile";
import EditProfile from "../pages/user/profile/EditProfile";
import ChangePassword from "../pages/user/profile/ChangePassword";
import Orders from "../pages/user/profile/Orders";
import OrderDetails from "../pages/user/profile/OrderDetails";
import Addresses from "../pages/user/profile/Addresses";
import Unauthorized from "../pages/user/Unauthorized";
import Dashboard from "../pages/admin/Dashboard";
import Admins from "../pages/admin/ManageAdmins";
import Cats from "../pages/admin/ManageCategories";
import Products from "../pages/admin/ManageProducts";
import Inventory from "../pages/admin/Inventory";
import AdminOrders from "../pages/admin/ManageOrders";
import Logs from "../pages/admin/AuditLogs";
import AboutUs from "../pages/user/AboutUs";
import ContactUs from "../pages/user/ContactUs";
export default function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to={
              user
                ? user.role === "ADMIN"
                  ? "/admin/dashboard"
                  : "/home"
                : "/login"
            }
            replace
          />
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route
        element={
          <ProtectedRoute>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/category/:id" element={<CategoryProducts />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order-success" element={<Success />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/about" element={<AboutUs />} />
<Route path="/contact" element={<ContactUs />} />
        <Route
  path="/profile/change-password"
  element={<ChangePassword />}
/>
        <Route path="/profile/orders" element={<Orders />} />
        <Route path="/profile/orders/:id" element={<OrderDetails />} />
        <Route path="/profile/addresses" element={<Addresses />} />
      </Route>
      <Route
        element={
          <ProtectedRoute admin>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<Dashboard />} />
        <Route path="/admin/admins" element={<Admins />} />
        <Route path="/admin/categories" element={<Cats />} />
        <Route path="/admin/products" element={<Products />} />
        <Route path="/admin/inventory" element={<Inventory />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/audit-logs" element={<Logs />} />
      </Route>
    </Routes>
  );
}
