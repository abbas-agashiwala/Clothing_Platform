import { Link } from "react-router-dom";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
export default function ProductCard({ p }) {
  const { add } = useCart(),
    w = useWishlist();
  const price = p.discount_price ?? p.price;
  return (
    <div className="card h-100 shadow-sm">
      <img
        className="card-img-top product-img"
        src={
          p.product_images?.[0]
            ? `${process.env.REACT_APP_SERVER_URL || "http://localhost:5000"}${p.product_images[0]}`
            : "https://via.placeholder.com/600x700?text=Clothing"
        }
        alt={p.product_name}
      />
      <div className="card-body">
        <div className="d-flex justify-content-between">
          <small>{p.brand}</small>
          <button className="btn btn-sm btn-light" onClick={() => w.add(p._id)}>
            <FaHeart />
          </button>
        </div>
        <h5 className="card-title">{p.product_name}</h5>
        <span className="fw-bold">₹{price}</span>
        {p.discount_price && (
          <>
            <del className="text-muted ms-2">₹{p.price}</del>
            <span className="badge text-bg-success ms-2">
              {Math.round((1 - p.discount_price / p.price) * 100)}% OFF
            </span>
          </>
        )}
        <div className="d-flex gap-2 mt-3">
          <Link
            className="btn btn-outline-dark flex-fill"
            to={`/product/${p._id}`}
          >
            View
          </Link>
          <button
            className="btn btn-dark"
            onClick={() =>
              add({
                product_id: p._id,
                quantity: 1,
                size: p.sizes?.[0],
                color: p.colors?.[0],
              })
            }
          >
            <FaShoppingCart />
          </button>
        </div>
      </div>
    </div>
  );
}
