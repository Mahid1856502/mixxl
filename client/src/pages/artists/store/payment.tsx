import React, { useEffect } from "react";
import { useCart } from "@/provider/cart-provider";
import { useAuth } from "@/provider/use-auth";
import { useStoreByUser } from "@/api/hooks/store/useStore";
import {
  useBuyProductIntent,
  useProduct,
} from "@/api/hooks/products/useProducts";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import StripePaymentElement from "@/components/artist/store/StripePaymentElement";
import { useParams, useSearchParams } from "wouter";
import { useUser } from "@/api/hooks/users/useUser";

const Payment = () => {
  const { cart, subtotal } = useCart();
  const { username } = useParams();
  const { data: currUser } = useUser(username);
  const { data: store } = useStoreByUser(currUser?.id);
  const [searchParams] = useSearchParams();

  const variantId = searchParams.get("variantId") || undefined;
  const quantityParam = searchParams.get("quantity") || undefined;
  const productId = searchParams.get("productId") || undefined;
  const quantity = quantityParam ? parseInt(quantityParam, 10) : 0;
  const { data: product } = useProduct(productId);
  console.log("product", product);

  const {
    mutateAsync: createBuyProductPaymentIntent,
    data,
    isPending,
  } = useBuyProductIntent();
  const clientSecret = data?.clientSecret ?? null;

  const isBuyNow = variantId && quantity > 0; // "Buy now" flag

  const variant = product?.variants.find((v) => v.id === variantId);

  console.log("variant", variant, isBuyNow);

  // Determine items to display and subtotal
  const itemsToDisplay =
    isBuyNow && variant
      ? [
          {
            variantId: variant.id,
            title: product?.title || variant.title,
            variantTitle: variant.title,
            price: Number(variant.price),
            image: product?.images?.[0] || "",
            quantity,
          },
        ]
      : cart;

  const displaySubtotal = isBuyNow
    ? itemsToDisplay.reduce(
        (acc, item) => acc + Number(item.price) * item.quantity,
        0
      )
    : subtotal;

  // Create payment intent
  useEffect(() => {
    if (!store?.id) return;

    if (isBuyNow) {
      createBuyProductPaymentIntent({
        storeId: store.id,
        items: [{ variantId, quantity }],
      });
    } else if (cart.length > 0) {
      createBuyProductPaymentIntent({
        storeId: store.id,
        items: cart.map((item) => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
      });
    }
  }, [
    store?.id,
    isBuyNow,
    variantId,
    quantity,
    cart,
    createBuyProductPaymentIntent,
  ]);

  if (itemsToDisplay.length === 0) {
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
          {itemsToDisplay.map((item) => (
            <li
              key={item.variantId}
              className="flex justify-between border-b border-white/10 pb-2"
            >
              <div className="flex items-center gap-3">
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-10 w-10 rounded"
                  />
                )}
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-gray-400">
                    {item.variantTitle} × {item.quantity}
                  </p>
                </div>
              </div>
              <p className="font-medium">
                ${(Number(item.price) * item.quantity).toFixed(2)}
              </p>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-between text-lg font-bold">
          <span>Subtotal</span>
          <span>${displaySubtotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Payment */}
      <div className="glass-effect p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4">Payment</h2>
        {isPending && <p className="text-gray-400">Preparing payment…</p>}
        {clientSecret && (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: { theme: "night" } }}
          >
            <StripePaymentElement amount={displaySubtotal} />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default Payment;
