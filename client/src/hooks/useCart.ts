import { Product, ProductVariant } from "@shared/product.type";
import { useEffect, useState } from "react";

/* =========================
   Types
========================= */

type CartItem = {
  productId: string;
  variantId: string;
  title: string;
  variantTitle: string;
  price: number;
  quantity: number;
  image: string | null;
};

type Cart = CartItem[];

/* =========================
   LocalStorage
========================= */

const CART_KEY = "cart:v1";

function getCart(): Cart {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as Cart) : [];
  } catch {
    return [];
  }
}

function saveCart(cart: Cart): void {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

/* =========================
   Cart Actions
========================= */

function addToCart(
  product: Product,
  variant: ProductVariant,
  qty: number
): Cart {
  if (qty <= 0) return getCart();

  const cart = getCart();
  const existing = cart.find((i) => i.variantId === variant.id);

  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({
      productId: product.id,
      variantId: variant.id,
      title: product.title,
      variantTitle: variant.title,
      price: Number(variant.price),
      quantity: qty,
      image: product?.images?.[0] ?? null,
    });
  }

  saveCart(cart);
  return cart;
}

function updateQuantity(variantId: string, quantity: number): Cart {
  const cart = getCart();
  const item = cart.find((i) => i.variantId === variantId);

  if (!item) return cart;

  if (quantity <= 0) {
    return removeFromCart(variantId);
  }

  item.quantity = quantity;
  saveCart(cart);
  return cart;
}

function removeFromCart(variantId: string): Cart {
  const cart = getCart().filter((i) => i.variantId !== variantId);
  saveCart(cart);
  return cart;
}

function clearCart(): void {
  localStorage.removeItem(CART_KEY);
}

/* =========================
   React Hook
========================= */

export function useCart() {
  const [cart, setCart] = useState<Cart>([]);

  useEffect(() => {
    setCart(getCart());
  }, []);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cart,
    subtotal,
    totalItems,

    add(product: Product, variant: ProductVariant, qty = 1) {
      setCart(addToCart(product, variant, qty));
    },

    update(variantId: string, qty: number) {
      setCart(updateQuantity(variantId, qty));
    },

    remove(variantId: string) {
      setCart(removeFromCart(variantId));
    },

    clear() {
      clearCart();
      setCart([]);
    },
  };
}
