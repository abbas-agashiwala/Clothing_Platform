import { Link, useNavigate } from "react-router-dom";
import { FaHeart, FaShoppingCart } from "react-icons/fa";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
export default function ProductCard({ p }) {
  if (!p) return null;
  const { add } = useCart();
  const { add: addWishlist } = useWishlist();
  const nav = useNavigate();
  const price = p.discount_price ?? p.price;
  return (
    <div
      className="card h-100 overflow-hidden border-0 shadow-soft transition duration-300 hover:-translate-y-1"
      style={{ cursor: "pointer" }}
      onClick={() => nav(`/product/${p._id}`)}
    >
      <img
        className="card-img-top product-img transition duration-500 hover:scale-[1.03]"
        src={
          p.product_images?.[0]
            ? `${process.env.REACT_APP_SERVER_URL}${p.product_images[0]}`
            : "https://via.placeholder.com/600x700?text=Clothing"
        }
        alt={p.product_name}
      />
      <div className="card-body p-3 p-md-4">
        <div className="d-flex justify-content-between">
          <small className="font-semibold uppercase tracking-wider text-secondary">
            {p.brand}
          </small>
          <button
            className="btn btn-sm btn-light rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              addWishlist(p._id);
            }}
            aria-label={`Add ${p.product_name} to wishlist`}
          >
            <FaHeart />
          </button>
        </div>
        <h5 className="card-title mt-2 fw-bold">{p.product_name}</h5>
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
          <Link className="btn btn-dark flex-fill" to={`/product/${p._id}`}>
            View
          </Link>
          <button
            className="btn btn-dark"
            onClick={(e) => {
              e.stopPropagation();

              add({
                product_id: p._id,
                quantity: 1,
                size: p.sizes?.[0],
                color: p.colors?.[0],
              });
            }}
          >
            <FaShoppingCart />
          </button>
        </div>
      </div>
    </div>
  );
}
