import React, { useState } from "react";
import {
  AddressElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";

type Props = {
  amount: number;
};

const StripePaymentElement: React.FC<Props> = ({ amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/store/order/success`,
      },
    });

    if (error) {
      setError(error.message || "Payment failed");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />
      <AddressElement
        options={{
          mode: "shipping", // collects shipping address
          fields: {
            phone: "always",
          },
        }}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" className="w-full" disabled={!stripe || loading}>
        {loading ? "Processing…" : `Pay $${amount.toFixed(2)}`}
      </Button>
    </form>
  );
};

export default StripePaymentElement;
