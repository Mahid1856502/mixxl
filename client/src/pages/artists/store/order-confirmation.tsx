import React, { useEffect } from "react";
import { Link, useSearchParams } from "wouter";
import { useOrder } from "@/api/hooks/orders/useOrders";
import { Button } from "@/components/ui/button";
import { useCart } from "@/provider/cart-provider";

/* -------------------- Payment Status Badge -------------------- */

const statusStyles: Record<string, string> = {
  paid: "bg-green-500/15 text-green-400 border-green-500/30",
  pending: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
  failed: "bg-red-500/15 text-red-400 border-red-500/30",
  canceled: "bg-gray-500/15 text-gray-400 border-gray-500/30",
};

const PaymentStatusBadge = ({ status }: { status: string }) => {
  const styles =
    statusStyles[status] ?? "bg-gray-500/15 text-gray-400 border-gray-500/30";

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full border text-xs font-medium capitalize ${styles}`}
    >
      {status}
    </span>
  );
};

/* -------------------- Skeletons -------------------- */

const Skeleton = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-white/10 rounded ${className}`} />
);

const OrderSkeleton = () => (
  <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
    <Skeleton className="h-8 w-64 mx-auto" />

    <div className="glass-effect p-6 rounded-xl space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex justify-between gap-4">
          <div className="flex gap-4">
            <Skeleton className="w-16 h-16" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          </div>
          <Skeleton className="h-4 w-16" />
        </div>
      ))}

      <div className="flex justify-between pt-4">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-20" />
      </div>
    </div>
  </div>
);

/* -------------------- Component -------------------- */

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const paymentIntent = searchParams.get("payment_intent");
  const { clear } = useCart();

  useEffect(() => {
    clear();
  }, []);

  const {
    data: order,
    isLoading,
    error,
  } = useOrder(paymentIntent ?? undefined);

  if (!paymentIntent) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <h1 className="text-2xl font-semibold text-red-500">
          Missing payment reference
        </h1>
      </div>
    );
  }

  if (isLoading) {
    return <OrderSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <h1 className="text-2xl font-semibold text-red-500">Order not found</h1>
        <p className="mt-2 text-gray-400">Please contact support.</p>
        <Link href="/">
          <Button className="mt-4">Go Home</Button>
        </Link>
      </div>
    );
  }

  const { items, totalAmount, shippingAddress, paymentStatus } = order;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 space-y-8">
      <h1 className="text-3xl font-bold text-center">
        Thank you for your order!
      </h1>

      {/* ---------------- Order Summary ---------------- */}
      <div className="glass-effect p-6 rounded-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Order Summary</h2>
          <PaymentStatusBadge status={paymentStatus} />
        </div>

        <ul className="space-y-4">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex justify-between items-start border-b border-white/10 pb-4"
            >
              <div className="flex gap-4">
                {item.product.images?.[0] && (
                  <img
                    src={item.product.images[0]}
                    alt={item.product.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}

                <div>
                  <p className="font-medium">{item.product.title}</p>
                  <p className="text-sm text-gray-400">
                    {item.variant.title} × {item.quantity}
                  </p>
                  <p className="text-xs text-gray-500">
                    SKU: {item.variant.sku}
                  </p>
                </div>
              </div>

              <p className="font-medium">£{item.lineTotal.toFixed(2)}</p>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex justify-between text-lg font-bold">
          <span>Total</span>
          <span>£{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* ---------------- Shipping Address ---------------- */}
      {shippingAddress && (
        <div className="glass-effect p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>

          <p className="font-medium">{shippingAddress.name}</p>
          <p>{shippingAddress.address.line1}</p>

          {shippingAddress.address.line2 && (
            <p>{shippingAddress.address.line2}</p>
          )}

          <p>
            {shippingAddress.address.city}, {shippingAddress.address.state}{" "}
            {shippingAddress.address.postal_code}
          </p>

          <p>{shippingAddress.address.country}</p>

          {shippingAddress.phone && (
            <p className="mt-2 text-sm text-gray-400">
              Phone: {shippingAddress.phone}
            </p>
          )}
        </div>
      )}

      <div className="text-center">
        <Link href="/">
          <Button>Return to Home</Button>
        </Link>
      </div>
    </div>
  );
};

export default OrderConfirmation;
