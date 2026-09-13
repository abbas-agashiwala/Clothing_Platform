import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { FaShoppingCart, FaHeart } from "react-icons/fa";
export default function Navbar() {
  const { user, logout } = useAuth(),
    { cart } = useCart(),
    nav = useNavigate();
  return (
    <nav className="navbar navbar-expand-lg bg-dark navbar-dark sticky-top">
      <div className="container">
        <Link className="navbar-brand fw-bold" to="/home">
          STYLEHUB
        </Link>
        <button
          className="navbar-toggler"
          data-bs-toggle="collapse"
          data-bs-target="#nav"
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div id="nav" className="collapse navbar-collapse">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/home">
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/categories">
                Categories
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/about">
                About Us
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/contact">
                Contact Us
              </Link>
            </li>
            
          </ul>
          <div className="d-flex align-items-center gap-2">
            <Link className="btn btn-outline-light" to="/wishlist">
              <FaHeart />
            </Link>
            <Link className="btn btn-outline-light" to="/cart">
              <FaShoppingCart />{" "}
              <span className="badge text-bg-danger">
                {cart.items?.length || 0}
              </span>
            </Link>
            {user ? (
              <>
                <Link
                  className="btn btn-light"
                  to={user.role === "ADMIN" ? "/admin/dashboard" : "/profile"}
                >
                  {user.name}
                </Link>
                <button
                  className="btn btn-outline-light"
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
                <Link className="btn btn-light" to="/login">
                  Login
                </Link>
                <Link className="btn btn-outline-light" to="/signup">
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
