import React, { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/provider/cart-provider";
import { Link, useLocation } from "wouter"; // useLocation hook

const CartButton = () => {
  const { cart, subtotal, totalItems, remove } = useCart();
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  // Close dialog whenever the route changes
  useEffect(() => {
    setOpen(false);
  }, [location]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {/* Floating Button */}
      <Dialog.Trigger asChild>
        <button className="fixed bottom-5 right-5 z-50 bg-gradient-to-br from-purple-500 to-pink-500 text-white p-4 rounded-full shadow-lg transition-colors">
          <ShoppingCart className="w-6 h-6" />

          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {totalItems}
            </span>
          )}
        </button>
      </Dialog.Trigger>

      {/* Sidebar */}
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
        <Dialog.Content className="fixed right-0 bottom-0 z-50 h-full w-80 glass-effect shadow-lg p-6">
          <Dialog.Close className="absolute top-4 right-4 text-white hover:text-gray-200">
            ✕
          </Dialog.Close>

          <h2 className="text-xl font-semibold mb-4">Your Cart</h2>

          {cart.length === 0 ? (
            <p className="text-gray-400">Your cart is empty.</p>
          ) : (
            <>
              <ul className="space-y-4 h-[calc(100vh-200px)] overflow-y-auto pr-4">
                {cart.map((item) => (
                  <li
                    key={item.variantId}
                    className="flex justify-between items-center border-b border-white/10 pb-2"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{item.title}</span>
                      <span className="text-sm text-gray-300">
                        {item.variantTitle} × {item.quantity}
                      </span>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>

                      <button
                        className="text-xs text-red-400 hover:text-red-500 mt-1"
                        onClick={() => remove(item.variantId)}
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="mt-2 pb-4 flex justify-between font-bold text-base md:text-lg">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <Link
                href={`/store/${location.split("/")[2]}/checkout`}
                className="w-full bg-primary rounded-lg py-2 px-4 flex flex-1 items-center justify-center"
              >
                Checkout
              </Link>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default CartButton;
