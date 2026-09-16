import { useWishlist } from "../../context/WishlistContext";
import ProductCard from "../../components/ProductCard";
export default function Wishlist() {
  const { wishlist, remove } = useWishlist();
  return (
  <div className="wishlist-page">
    <div className="container-fluid">
      <h1 className="wishlist-title">Wishlist</h1>

      <div className="wishlist-grid">
        {wishlist.items
          .filter((i) => i.product_id)
          .map((i) => (
            <div className="wishlist-item" key={i.product_id._id}>
              
              <ProductCard p={i.product_id} />

              <button
                className="wishlist-remove"
                onClick={() => remove(i.product_id._id)}
              >
                Remove
              </button>

            </div>
          ))}
      </div>
    </div>
  </div>
);
}
