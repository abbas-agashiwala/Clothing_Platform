import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import ProductCard from "../../components/ProductCard";
export default function CategoryProducts() {
  const { id } = useParams();
  const [d, setD] = useState([]);
  const [q, setQ] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => {
    const params = new URLSearchParams();

    if (q.trim()) {
      params.append("search", q.trim());
    }

    if (minPrice) {
      params.append("minPrice", minPrice);
    }

    if (maxPrice) {
      params.append("maxPrice", maxPrice);
    }

    if (sort) {
      params.append("sort", sort);
    }

    params.append("page", page);
    params.append("limit", 12);

    api
      .get(`/products/category/${id}?${params.toString()}`)
      .then((r) => {
        setD(r.data.data);
        setTotalPages(r.data.pagination?.totalPages || 1);
      });
  }, [id, q, minPrice, maxPrice, sort, page]);

  return (
    <div className="container py-5">
    

      <div className="row g-2 mt-3">
        <div className="col-md-3">
          <input
            type="number"
            className="form-control"
            placeholder="Min Price"
            value={minPrice}
            onChange={(e) => {
  setMinPrice(e.target.value);
  setPage(1);
}}
          />
        </div>

        <div className="col-md-3">
          <input
            type="number"
            className="form-control"
            placeholder="Max Price"
            value={maxPrice}
            onChange={(e) => {
  setMaxPrice(e.target.value);
  setPage(1);
}}
          />
        </div>

        <div className="col-md-3">
          <select
            className="form-select"
            value={sort}
            onChange={(e) => {
  setSort(e.target.value);
  setPage(1);
}}
          >
            <option value="">Sort by Price</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        <div className="col-md-3">
          <button
            className="btn btn-outline-dark w-100"
            onClick={() => {
              setQ("");
              setMinPrice("");
              setMaxPrice("");
              setSort("");
              setPage(1);
            }}
          >
            Clear Filters
          </button>
        </div>
      </div>
      <div className="row g-4 mt-2">
        {d.map((p) => (
          <div className="col-6 col-md-4 col-lg-3" key={p._id}>
            <ProductCard p={p} />
          </div>
        ))}
      </div>
<div className="d-flex justify-content-center align-items-center gap-2 my-4">

  <button
    className="btn btn-dark"
    disabled={page <= 1}
    onClick={() => setPage(page - 1)}
  >
    Previous
  </button>

  <span className="mx-2">
    Page {page} of {totalPages}
  </span>

  {Array.from({ length: Number(totalPages) }, (_, index) => (
    <button
      key={index + 1}
      className={`btn ${
        page === index + 1
          ? "btn-dark"
          : "btn-dark"
      }`}
      onClick={() => setPage(index + 1)}
    >
      {index + 1}
    </button>
  ))}

  <button
    className="btn btn-dark"
    disabled={page >= Number(totalPages)}
    onClick={() => setPage(page + 1)}
  >
    Next
  </button>

</div>
    </div>
  );
}
