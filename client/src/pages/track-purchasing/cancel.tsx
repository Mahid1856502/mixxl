import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function PurchasingCancel() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      <h1 className="text-2xl font-bold mb-4">Checkout Cancelled ❌</h1>
      <p className="mb-6">You did not complete the checkout process.</p>
      <Link href="/dashboard">
        <Button>Go Back Home</Button>
      </Link>
    </div>
  );
}
