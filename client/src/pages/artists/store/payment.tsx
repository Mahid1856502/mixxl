import React, { useEffect } from "react";
import { useCart } from "@/provider/cart-provider";
import { useAuth } from "@/provider/use-auth";
import { useStoreByUser } from "@/api/hooks/store/useStore";
import { useBuyProductIntent } from "@/api/hooks/products/useProducts";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import StripePaymentElement from "@/components/artist/store/StripePaymentElement";

const Payment = () => {
  const { cart, subtotal, clear } = useCart();
  const { user } = useAuth();
  const { data: store } = useStoreByUser(user?.id);

  const {
    mutateAsync: createBuyProductPaymentIntent,
    data,
    isPending,
  } = useBuyProductIntent();

  const clientSecret = data?.clientSecret ?? null;

  useEffect(() => {
    if (cart.length === 0 || !store?.id) return;

    createBuyProductPaymentIntent({
      storeId: store.id,
      items: cart.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    });
  }, [cart, store?.id]);

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Order Summary */}
      <div className="glass-effect p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Order Summary</h2>

        <ul className="space-y-3">
          {cart.map((item) => (
            <li
              key={item.variantId}
              className="flex justify-between border-b border-white/10 pb-2"
            >
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-gray-400">
                  {item.variantTitle} × {item.quantity}
                </p>
              </div>
              <p className="font-medium">
                ${(item.price * item.quantity).toFixed(2)}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-4 flex justify-between text-lg font-bold">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment */}
      <div className="glass-effect p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Payment</h2>

        {isPending && <p className="text-gray-400">Preparing payment…</p>}

        {clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "night",
              },
            }}
          >
            <StripePaymentElement
              // clientSecret={clientSecret}
              amount={subtotal}
            />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default Payment;
