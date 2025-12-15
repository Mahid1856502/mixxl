import { orders } from "./schema";

// ------------------------
// Base Types
// ------------------------
export type Order = typeof orders.$inferSelect;

export type Address = {
  city: string | null;
  country: string | null;
  line1: string | null;
  line2: string | null;
  postal_code: string | null;
  state: string | null;
};

// ------------------------
// Joined Item Type
// ------------------------
export type OrderItem = {
  id: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;

  variant: {
    id: string;
    title: string;
    sku: string;
    price: number;
  };

  product: {
    id: string;
    title: string;
    images: string[] | null;
  };
};

// ------------------------
// Final API Response
// ------------------------
export type OrderWithItems = Order & {
  items: OrderItem[];
  shippingAddress: {
    address: Address;
    carrier: string | null;
    name: string | null;
    phone: string | null;
    tracking_number: string | null;
  } | null;
};
