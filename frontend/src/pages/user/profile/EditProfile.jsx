import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../services/api";
import { useNavigate } from "react-router-dom";
export default function EditProfile() {
  const { user } = useAuth(),
    [f, setF] = useState({ name: user?.name || "", phone: user?.phone || "" }),
    nav = useNavigate();
  return (
    <form
      className="container py-5"
      onSubmit={async (e) => {
        e.preventDefault();
        await api.put("/auth/profile", f);
        nav("/profile");
      }}
    >
      <h1>Edit Profile</h1>
      <input
        className="form-control mb-3"
        value={f.name}
        onChange={(e) => setF({ ...f, name: e.target.value })}
      />
      <input
        className="form-control mb-3"
        value={f.phone}
        onChange={(e) => setF({ ...f, phone: e.target.value })}
      />
      <button className="btn btn-dark">Save</button>
    </form>
  );
}
