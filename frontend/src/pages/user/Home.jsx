import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../../services/api";
import ProductCard from "../../components/ProductCard";
import Loading from "../../components/Loading";
export default function Home() {
  const [p, setP] = useState([]),
    [loading, setL] = useState(true);
  const { search } = useLocation();
  const searchTerm = new URLSearchParams(search).get("search") || "";
  useEffect(() => {
    setL(true);
    api
      .get(`/products?limit=12${searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""}`)
      .then((r) => setP(r.data.data))
      .finally(() => setL(false));
  }, [searchTerm]);
  return (
    <>
      <section className="hero">
        <div className="container max-w-6xl px-4 py-16 md:py-24">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.22em] text-orange-200">The new collection</p>
          <h1 className="max-w-3xl">WEAR YOUR<br/>STYLE.</h1>
          <p className="mt-4 max-w-md text-lg text-white/75">New season clothing, made for the way you live.</p>
          <a href="#products" className="btn btn-light btn-lg mt-4 rounded-full px-5 shadow-sm">
            Shop Now
          </a>
        </div>
      </section>
      <div className="container py-5 md:py-16" id="products">
        <div className="mb-4 flex items-end justify-between"><div><p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-clay">{searchTerm ? "Search results" : "Curated for you"}</p><h2 className="mb-0 fw-bold">{searchTerm ? `Results for “${searchTerm}”` : "Featured Products"}</h2></div></div>
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
