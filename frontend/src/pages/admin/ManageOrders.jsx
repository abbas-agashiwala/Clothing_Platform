import { useEffect, useState } from "react";
import api from "../../services/api";
export default function ManageOrders() {
  const [d, setD] = useState([]);
  const load = () => api.get("/admin/orders").then((r) => setD(r.data.data));
  useEffect(() => {
  load();
}, []);
  const change = async (o, s) => {
    await api.patch(`/admin/orders/${o._id}/status`, { order_status: s });
    load();
  };
  return (
    <>
      <h1>Orders</h1>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Change</th>
            </tr>
          </thead>
          <tbody>
            {d.map((o) => (
              <tr key={o._id}>
                <td>#{o._id.slice(-8)}</td>
                <td>{o.user_id?.name}</td>
                <td>₹{o.total_amount}</td>
                <td>{o.order_status}</td>
                <td>
                  <select
                    className="form-select"
                    value={o.order_status}
                    onChange={(e) => change(o, e.target.value)}
                  >
                    {[
                      "PENDING",
                      "CONFIRMED",
                      "SHIPPED",
                      "OUT_FOR_DELIVERY",
                      "DELIVERED",
                      "CANCELLED",
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
