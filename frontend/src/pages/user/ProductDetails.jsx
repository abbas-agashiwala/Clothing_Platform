import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
export default function ProductDetails() {
  const { id } = useParams(),
    [p, setP] = useState(null),
    [size, setSz] = useState(""),
    [color, setColor] = useState(""),
    [qty, setQ] = useState(1);
  const [cartMessage, setCartMessage] = useState("");
  const { add } = useCart(),
    w = useWishlist();
  useEffect(() => {
  let mounted = true;

  const loadProduct = async () => {
    try {
      setP(null);

      const r = await api.get(`/products/${id}`);

      if (!mounted) return;

      if (r.data?.success && r.data?.data) {
        const product = r.data.data;

        setP(product);
        setSz(product.sizes?.[0] || "");
        setColor(product.colors?.[0] || "");
      } else {
        setP({
          notFound: true,
          message: "Product not found"
        });
      }
    } catch (err) {
  if (!mounted) return;

  setP({
    notFound: true,
    message:
      err.response?.data?.message ||
      err.message ||
      "Unable to load product"
  });
}
  };

  loadProduct();

  return () => {
    mounted = false;
  };
}, [id]);

  const handleAddToCart = async () => {
    setCartMessage("");

    if (!p) return;

    if (p.stock_quantity <= 0) {
      setCartMessage("This product is currently out of stock.");
      return;
    }

    try {
      await add({
        product_id: p._id,
        quantity: qty,
        size,
        color,
      });

      setCartMessage("Product added to cart successfully.");
    } catch (err) {
      const message =
        err?.response?.data?.message || "Unable to add product to cart.";

      setCartMessage(message);
    }
  };

  if (!p) {
  return (
    <div className="container py-5">
      Loading...
    </div>
  );
}

if (p.notFound) {
  return (
    <div className="container py-5 text-center">
      <h2>Product Not Found</h2>
      <p className="text-muted">{p.message}</p>
      <button
        className="btn btn-dark"
        onClick={() => window.history.back()}
      >
        Go Back
      </button>
    </div>
  );
}
  const price = p.discount_price ?? p.price;
  return (
    <div className="container py-5">
      <div className="row g-5">
        <div className="col-md-6">
          <img
            className="img-fluid rounded"
            src={
              p.product_images?.[0]
                ? p.product_images[0].startsWith("http")
                  ? p.product_images[0]
                  : `${process.env.REACT_APP_SERVER_URL || "http://localhost:5000"}/${p.product_images[0].replace(/^\/+/, "")}`
                : "https://via.placeholder.com/700x800?text=Clothing"
            }
            alt={p.product_name}
          />
        </div>
        <div className="col-md-6">
          <small>{p.brand}</small>
          <h1>{p.product_name}</h1>
          <p>{p.description}</p>
          <h3>
            ₹{price}{" "}
            {p.discount_price && (
              <del className="text-muted fs-6">₹{p.price}</del>
            )}
          </h3>
          <p>Stock: {p.stock_quantity}</p>
          <label>Size</label>
          <select
            className="form-select mb-3"
            value={size}
            onChange={(e) => setSz(e.target.value)}
          >
            {p.sizes?.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <label>Color</label>
          <select
            className="form-select mb-3"
            value={color}
            onChange={(e) => setColor(e.target.value)}
          >
            {p.colors?.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <input
            className="form-control mb-3"
            type="number"
            min="1"
            max={p.stock_quantity}
            value={qty}
            onChange={(e) => setQ(+e.target.value)}
          />
          {cartMessage && (
            <div className="alert alert-info mt-2">{cartMessage}</div>
          )}
          <button
            className="btn btn-dark me-2"
            onClick={handleAddToCart}
            disabled={p.stock_quantity <= 0}
          >
            {p.stock_quantity <= 0 ? "Out of Stock" : "Add to Cart"}
          </button>
          <button className="btn btn-dark" onClick={() => w.add(p._id)}>
            Wishlist
          </button>
        </div>
      </div>
    </div>
  );
}


