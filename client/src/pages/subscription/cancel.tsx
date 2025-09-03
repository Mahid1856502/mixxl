import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function SubscriptionCancel() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      <h1 className="text-2xl font-bold mb-4">Subscription Cancelled ❌</h1>
      <p className="mb-6">You did not complete the subscription process.</p>
      <Link href="/dashboard">
        <Button>Go Back Home</Button>
      </Link>
    </div>
  );
}
