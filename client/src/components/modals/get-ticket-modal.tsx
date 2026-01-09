import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Minus, Plus, Ticket } from "lucide-react";

interface GetTicketModalProps {
  open: boolean;
  onClose: () => void;
}

/* ---- Dummy ticket data ---- */
const ticketTypes = [
  {
    id: "ga",
    name: "General Admission",
    price: 15,
    description: "Access to live event",
  },
  {
    id: "vip",
    name: "VIP Pass",
    price: 40,
    description: "Meet & Greet + Priority entry",
  },
];

export function GetTicketModal({ open, onClose }: GetTicketModalProps) {
  const [selectedTicket, setSelectedTicket] = useState(ticketTypes[0].id);
  const [quantity, setQuantity] = useState(1);

  const ticket = ticketTypes.find((t) => t.id === selectedTicket)!;
  const total = ticket.price * quantity;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-neutral-900 border-neutral-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Get Your Ticket
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Ticket Type */}
          <div className="space-y-3">
            <Label className="text-sm text-neutral-400">Ticket Type</Label>
            <RadioGroup
              value={selectedTicket}
              onValueChange={setSelectedTicket}
              className="space-y-2"
            >
              {ticketTypes.map((ticket) => (
                <Label
                  key={ticket.id}
                  htmlFor={ticket.id}
                  className="flex items-start gap-3 border border-neutral-800 rounded-xl p-4 cursor-pointer hover:border-neutral-600"
                >
                  <RadioGroupItem
                    value={ticket.id}
                    id={ticket.id}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{ticket.name}</p>
                    <p className="text-sm text-neutral-400">
                      {ticket.description}
                    </p>
                  </div>
                  <span className="font-semibold">${ticket.price}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Quantity */}
          <div className="flex items-center justify-between">
            <Label className="text-sm text-neutral-400">Quantity</Label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="border border-neutral-700 rounded-lg p-1"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-6 text-center">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="border border-neutral-700 rounded-lg p-1"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Attendee Info */}
          <div className="space-y-3">
            <Label className="text-sm text-neutral-400">Attendee Info</Label>
            <Input placeholder="Full Name" />
            <Input placeholder="Email Address" type="email" />
          </div>

          {/* Price Summary */}
          <div className="border-t border-neutral-800 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Price</span>
              <span>
                ${ticket.price} × {quantity}
              </span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${total}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button className="w-full bg-primary text-white">
              {total === 0 ? "Confirm Ticket" : "Continue to Checkout"}
            </Button>
            <Button variant="ghost" className="w-full" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
