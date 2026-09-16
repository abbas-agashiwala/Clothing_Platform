import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { FaShoppingCart, FaHeart,FaSearch } from "react-icons/fa";
export default function Navbar() {
  const { user, logout } = useAuth();
const { cart } = useCart();
const nav = useNavigate();
const [search, setSearch] = useState("");

const handleSearch = (e) => {
  e.preventDefault();

  const value = search.trim();

  if (!value) return;

  nav(`/home?search=${encodeURIComponent(value)}`);
};
  return (
    <nav className="navbar navbar-expand-lg navbar-dark sticky-top border-b border-white/10 bg-ink/95 py-2 py-lg-3 shadow-sm backdrop-blur">
      <div className="container gap-lg-4">
        <Link className="navbar-brand !text-xl !font-extrabold tracking-[0.14em] lg:!text-2xl" to="/home">
          STYLEHUB<span className="text-clay">.</span>
        </Link>
        <button
          className="navbar-toggler"
          data-bs-toggle="collapse"
          data-bs-target="#nav"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div id="nav" className="navbar-collapse">
          <ul className="navbar-nav me-auto gap-lg-2">
            <li className="nav-item">
              <Link className="nav-link px-lg-2 !text-base" to="/home">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link px-lg-2 !text-base" to="/categories">
                Categories
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link px-lg-2 !text-base" to="/about">
                About Us
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link px-lg-2 !text-base" to="/contact">
                Contact Us
              </Link>
            </li>
            
          </ul>
          <div className="mt-3 d-flex flex-wrap align-items-center gap-2 gap-lg-3 mt-lg-0">
            {/* SEARCH */}
  <form
    onSubmit={handleSearch}
    className="d-flex align-items-center flex-grow-1 flex-lg-grow-0"
  >
    <input
      type="search"
      className="form-control w-100 lg:w-64"
      placeholder="Search products..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
    />

    <button
      type="submit"
      className="btn btn-light ms-2 rounded-circle"
    >
      <FaSearch />
    </button>
  </form>
            <Link className="btn btn-outline-light rounded-full" to="/wishlist" aria-label="Wishlist">
              <FaHeart />
            </Link>
            <Link className="btn btn-outline-light rounded-full" to="/cart" aria-label="Cart">
              <FaShoppingCart />{" "}
              <span className="badge text-bg-danger">
                {cart.items?.length || 0}
              </span>
            </Link>
            {user ? (
              <>
                <Link
                  className="btn btn-light rounded-full px-3"
                  to={user.role === "ADMIN" ? "/admin/dashboard" : "/profile"}
                >
                  {user.name}
                </Link>
                <button
                  className="btn btn-outline-light rounded-full"
                  onClick={async () => {
                    await logout();
                    nav("/login");
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="btn btn-light rounded-full" to="/login">
                  Login
                </Link>
                <Link className="btn btn-outline-light rounded-full" to="/signup">
                  Signup
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
