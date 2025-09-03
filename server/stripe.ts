import Stripe from "stripe";
import "dotenv/config";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil", // use the version TypeScript expects
});
