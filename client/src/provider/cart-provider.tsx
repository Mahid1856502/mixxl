import React, { createContext, useContext } from "react";
import { useCart as useCartInternal } from "@/hooks/useCart";

const CartContext = createContext<ReturnType<typeof useCartInternal> | null>(
  null
);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const cart = useCartInternal();
  return <CartContext.Provider value={cart}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used inside CartProvider");
  }
  return ctx;
};
