import { Link } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
export default function Profile() {
  const { user } = useAuth();
  return (
    <div className="container py-5">
      <h1>My Profile</h1>
      <div className="card p-4">
        <h4>{user?.name}</h4>
        <p>{user?.email}</p>
        <p>{user?.phone}</p>
        <div className="d-flex gap-2">
          <Link to="/profile/edit" className="btn btn-dark">
            Edit Profile
          </Link>

          <Link to="/profile/change-password" className="btn btn-dark">
            Change Password
          </Link>
        </div>
      </div>
      <div className="mt-4 d-flex flex-wrap gap-2">
        <Link to="/profile/orders" className="btn btn-dark">Orders</Link>
        <Link to="/profile/addresses" className="btn btn-dark">Addresses</Link>
        <Link to="/wishlist" className="btn btn-dark">Wishlist</Link>
      </div>
    </div>
  );
}
