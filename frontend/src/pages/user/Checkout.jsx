import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { useCart } from "../../context/CartContext";

export default function Checkout() {
  const { cart } = useCart();

  const [a, setA] = useState([]);
  const [id, setId] = useState("");
  const [method, setMethod] = useState("CASH_ON_DELIVERY");
  const [loading, setLoading] = useState(false);

  const nav = useNavigate();

  useEffect(() => {
    api.get("/addresses").then((r) => {
      setA(r.data.data);

      const defaultAddress = r.data.data.find((x) => x.is_default);

      setId(defaultAddress?._id || r.data.data[0]?._id || "");
    });
  }, []);

  const total = cart.items?.reduce((s, i) => s + i.subtotal, 0) || 0;

  // Load Razorpay Checkout script
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  const placeOrder = async (e) => {
    e.preventDefault();

    if (!id) {
      alert("Select address");
      return;
    }

    try {
      setLoading(true);

      // =========================================
      // CASH ON DELIVERY
      // =========================================
      if (method === "CASH_ON_DELIVERY") {
        const r = await api.post("/orders", {
          address_id: id,
          payment_method: method,
        });

        nav("/order-success", {
          state: {
            order: r.data.data,
          },
        });

        return;
      }

      // =========================================
      // ONLINE PAYMENT
      // =========================================

      // Load Razorpay
      const razorpayLoaded = await loadRazorpay();

      if (!razorpayLoaded) {
        alert("Razorpay failed to load. Check your internet connection.");
        return;
      }

      // Create Razorpay order on backend
      const r = await api.post("/payments/create", {
        address_id: id,
        payment_method: method,
      });

      const paymentData = r.data.data;

      const razorpayOrderId = paymentData.razorpayOrderId;
      const amount = paymentData.amount;
      const currency = paymentData.currency;
      const paymentId = paymentData.paymentId;
      const razorpayKey =
        paymentData.keyId || process.env.REACT_APP_RAZORPAY_KEY_ID;

      if (!razorpayOrderId || !paymentId || !amount) {
        console.error("Invalid Razorpay payment data:", paymentData);

        alert("Unable to create Razorpay payment.");
        return;
      }

      // =========================================
      // OPEN RAZORPAY CHECKOUT
      // =========================================

      const options = {
        key: razorpayKey,

        amount: amount,

        currency: currency,

        name: "Clothing E-Commerce",

        description: "Clothing Order",

        order_id: razorpayOrderId,

        handler: async function (response) {
          try {
            const verifyResponse = await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              payment_id: paymentId,
              address_id: id,
            });

            alert("Payment successful!");

            nav("/profile/orders");
          } catch (error) {
            console.error("Payment verification error:", error);

            alert(
              error.response?.data?.message || "Payment verification failed",
            );
          }
        },

        prefill: {
          name: "",
          email: "",
          contact: "",
        },

        theme: {
          color: "#000000",
        },
      };
      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);

        alert(response.error?.description || "Payment failed");
      });

razorpay.open();
    } catch (e) {
      console.error("Checkout error:", e);

      alert(e.response?.data?.message || "Order/Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <h1>Checkout</h1>

      <form onSubmit={placeOrder} className="row g-4">
        {/* =========================
            ADDRESS
        ========================== */}

        <div className="col-md-7">
          <div className="card p-3">
            <h4>Address</h4>

            {a.length ? (
              a.map((x) => (
                <label className="card p-3 mb-2" key={x._id}>
                  <input
                    type="radio"
                    name="address"
                    checked={id === x._id}
                    onChange={() => setId(x._id)}
                  />{" "}
                  {x.full_name}, {x.address_line}, {x.city}, {x.state},{" "}
                  {x.postal_code}
                </label>
              ))
            ) : (
              <p>No address. Add one from profile.</p>
            )}

            {/* =========================
                PAYMENT
            ========================== */}

            <h4 className="mt-4">Payment</h4>

            {[
              "CASH_ON_DELIVERY",
              "CREDIT_CARD",
              "DEBIT_CARD",
              "UPI",
              "NET_BANKING",
            ].map((x) => (
              <label className="d-block" key={x}>
                <input
                  type="radio"
                  name="payment"
                  checked={method === x}
                  onChange={() => setMethod(x)}
                />{" "}
                {x}
              </label>
            ))}
          </div>
        </div>

        {/* =========================
            ORDER SUMMARY
        ========================== */}

        <div className="col-md-5">
          <div className="card p-4">
            <h4>Order Summary</h4>

            {cart.items?.map((i) => (
              <div className="d-flex justify-content-between" key={i._id}>
                <span>
                  {i.product_id?.product_name || i.product_name} × {i.quantity}
                </span>

                <span>₹{i.subtotal}</span>
              </div>
            ))}

            <hr />

            <h4>₹{total + (total > 1000 ? 0 : 80)}</h4>

            <button className="btn btn-dark w-100" disabled={loading || !id}>
              {loading
                ? "Processing..."
                : method === "CASH_ON_DELIVERY"
                  ? "Place Order"
                  : "Pay Now"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
