import { useEffect, useState } from "react";
import api from "../../services/api";
export default function Inventory() {
  const [d, setD] = useState([]);
  const load = () => api.get("/admin/products").then((r) => setD(r.data.data));
  useEffect(() => {
  load();
}, []);
  return (
    <>
      <h1>Inventory</h1>
      <table className="table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody>
          {d.map((p) => (
            <tr key={p._id}>
              <td>{p.product_name}</td>
              <td>{p.stock_quantity}</td>
              <td>
                {p.stock_quantity === 0
                  ? "OUT_OF_STOCK"
                  : p.stock_quantity <= 5
                    ? "LOW_STOCK"
                    : "IN_STOCK"}
              </td>
              <td>
                <button
                  className="btn btn-sm btn-dark"
                  onClick={async () => {
                    const n = prompt("New stock", p.stock_quantity);
                    if (n !== null) {
                      await api.patch(`/admin/products/${p._id}/stock`, {
                        stock_quantity: +n,
                      });
                      load();
                    }
                  }}
                >
                  Update
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
