import { useEffect, useState } from "react";
import api from "../../services/api";
import ProductCard from "../../components/ProductCard";
import Loading from "../../components/Loading";
export default function Home() {
  const [p, setP] = useState([]),
    [loading, setL] = useState(true);
  useEffect(() => {
    api
      .get("/products?limit=12")
      .then((r) => setP(r.data.data))
      .finally(() => setL(false));
  }, []);
  return (
    <>
      <section className="hero">
        <div className="container">
          <h1>WEAR YOUR STYLE</h1>
          <p>New season clothing, made for you.</p>
          <a href="#products" className="btn btn-light btn-lg">
            Shop Now
          </a>
        </div>
      </section>
      <div className="container py-5" id="products">
        <h2 className="mb-4">Featured Products</h2>
        {loading ? (
          <Loading />
        ) : (
          <div className="row g-4">
            {p.map((x) => (
              <div className="col-6 col-md-4 col-lg-3" key={x._id}>
                <ProductCard p={x} />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
