import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";
import { useAuth } from "./AuthContext";
const C = createContext();
export const WishlistProvider = ({ children }) => {
  const { user } = useAuth(),
    [wishlist, setWishlist] = useState({ items: [] });
  const load = async () => {
  if (!user) {
    setWishlist({ items: [] });
    return;
  }

  try {
    const response = await api.get("/wishlist");

    console.log("WISHLIST RESPONSE:", response.data);

    setWishlist(response.data.data || { items: [] });
  } catch (e) {
    console.error("Wishlist load error:", e);
    setWishlist({ items: [] });
  }
};
  useEffect(() => {
    load();
  }, [user]);
  const add = async (id) => {
    setWishlist(
      (await api.post("/wishlist/items", { product_id: id })).data.data,
    );
  };
  const remove = async (id) => {
    await api.delete(`/wishlist/items/${id}`);
    load();
  };
  return (
    <C.Provider value={{ wishlist, add, remove, reload: load }}>
      {children}
    </C.Provider>
  );
};
export const useWishlist = () => useContext(C);
