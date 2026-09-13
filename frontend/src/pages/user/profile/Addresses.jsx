import { useEffect, useState } from "react";
import api from "../../../services/api";
export default function Addresses() {
  const [editingId, setEditingId] = useState(null);
  const [d, setD] = useState([]),
    empty = {
      full_name: "",
      phone: "",
      address_line: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India",
      address_type: "HOME",
      is_default: false,
    },
    [f, setF] = useState(empty);
  const load = () => api.get("/addresses").then((r) => setD(r.data.data));
  useEffect(() => {
    load();
  }, []);
  const add = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await api.put(`/addresses/${editingId}`, f);
      } else {
        await api.post("/addresses", f);
      }

      setF(empty);
      setEditingId(null);
      load();
    } catch (err) {
      console.error("Address save error:", err);
    }
  };
  return (
    <div className="container py-5">
      <h1>Saved Addresses</h1>
      {d.map((a) => (
        <div className="card p-3 mb-2" key={a._id}>
          <b>{a.full_name}</b>
          <p>
            {a.address_line}, {a.city}, {a.state} - {a.postal_code}
          </p>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-dark"
              onClick={() => {
                setEditingId(a._id);
                setF({
                  full_name: a.full_name || "",
                  phone: a.phone || "",
                  address_line: a.address_line || "",
                  city: a.city || "",
                  state: a.state || "",
                  postal_code: a.postal_code || "",
                  country: a.country || "India",
                  address_type: a.address_type || "HOME",
                  is_default: a.is_default || false,
                });

                window.scrollTo({
                  top: document.body.scrollHeight,
                  behavior: "smooth",
                });
              }}
            >
              Edit
            </button>

            <button
              className="btn btn-sm btn-outline-danger"
              onClick={async () => {
                await api.delete(`/addresses/${a._id}`);
                load();
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
      <form className="card p-4 mt-4" onSubmit={add}>
        <h4>{editingId ? "Edit Address" : "Add Address"}</h4>
        {Object.keys(empty)
          .filter((k) => !["is_default"].includes(k))
          .map((k) => (
            <input
              key={k}
              className="form-control mb-2"
              placeholder={k}
              value={f[k]}
              onChange={(e) => setF({ ...f, [k]: e.target.value })}
              required={!["country"].includes(k)}
            />
          ))}
        <label>
          <input
            type="checkbox"
            checked={f.is_default}
            onChange={(e) => setF({ ...f, is_default: e.target.checked })}
          />{" "}
          Default
        </label>
        <button className="btn btn-dark mt-3" type="submit">
          {editingId ? "Update Address" : "Save Address"}
        </button>
      </form>
    </div>
  );
}
