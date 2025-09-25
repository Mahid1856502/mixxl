import { ColumnDef } from "@tanstack/react-table";
import { getCurrency } from "./currency";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "./utils";

export const TRANSACTIONS_COLUMNS: ColumnDef<any>[] = [
  { accessorKey: "id", header: "ID" },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => getCurrency(row.original.amount, row.original.currency),
  },
  {
    accessorKey: "net",
    header: "Net",
    cell: ({ row }) => (
      <span className="text-green-600">
        {getCurrency(row.original.net, row.original.currency)}
      </span>
    ),
  },
  {
    accessorKey: "fee",
    header: "Stripe Fee",
    cell: ({ row }) => (
      <span className="text-red-500">
        {getCurrency(row.original.fee, row.original.currency)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === "charge" ? "default" : "secondary"}
      >
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) =>
      formatDate(new Date(row.original.createdAt).toISOString()),
  },
];

export const PAYOUT_COLUMNS: ColumnDef<any>[] = [
  { accessorKey: "id", header: "ID" },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => getCurrency(row.original.amount, row.original.currency),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.status === "paid"
            ? "default"
            : row.original.status === "pending"
            ? "secondary"
            : "destructive"
        }
      >
        {row.original.status}
      </Badge>
    ),
  },
  { accessorKey: "method", header: "Method" },
  {
    accessorKey: "arrivalDate",
    header: "Arrival",
    cell: ({ row }) => new Date(row.original.arrivalDate).toLocaleDateString(),
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleString(),
  },
];

export const PURCHASE_COLUMNS: ColumnDef<any>[] = [
  {
    accessorKey: "coverImage",
    header: "Cover",
    cell: ({ row }) => (
      <img
        src={row.original.coverImage ?? ""}
        alt={row.original.title}
        className="w-12 h-12 rounded-md object-cover"
      />
    ),
  },
  { accessorKey: "title", header: "Title" },
  {
    accessorKey: "artistName",
    header: "Artist",
  },
  {
    accessorKey: "purchaseStatus",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.purchaseStatus === "succeeded"
            ? "default"
            : row.original.purchaseStatus === "pending"
            ? "secondary"
            : "destructive"
        }
      >
        {row.original.purchaseStatus}
      </Badge>
    ),
  },
  {
    accessorKey: "purchasedAt",
    header: "Purchased At",
    cell: ({ row }) =>
      row.original.purchasedAt
        ? new Date(row.original.purchasedAt).toLocaleString()
        : "",
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => getCurrency(Number(row.original.price), "USD"),
  },
];
