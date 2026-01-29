import { useState, useEffect } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useGetEventTickets, useCreateTicketPaymentIntent, useGetEventById } from "@/api/hooks/events/useEvent";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useForm, Controller } from "react-hook-form";
import { useAuth } from "@/provider/use-auth";
import { toast } from "@/hooks/use-toast";

interface GetTicketModalProps {
  open: boolean;
  onClose: () => void;
  eventId: string;
}

// Payment Form Component
function TicketPaymentForm({ 
  total, 
  onSuccess 
}: { 
  total: number; 
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event from bubbling to parent form

    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/events/success`,
      },
      redirect: "if_required",
    });

    if (error) {
      setError(error.message || "Payment failed");
      setLoading(false);
    } else {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement
        options={{
          layout: "tabs",
        }}
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button
        type="submit"
        className="w-full bg-primary text-white"
        disabled={!stripe || loading}
      >
        {loading ? "Processing…" : `Pay $${total.toFixed(2)}`}
      </Button>
    </form>
  );
}

interface TicketFormData {
  fullName: string;
  email: string;
  ticketTypeId: string;
  quantity: number;
}

export function GetTicketModal({
  open,
  onClose,
  eventId,
}: GetTicketModalProps) {
  const { user } = useAuth();
  const { data: ticketTypes, isLoading } = useGetEventTickets(eventId);
  const { data: event } = useGetEventById(eventId);
  const [showPayment, setShowPayment] = useState(false);
  
  const {
    mutateAsync: createPaymentIntent,
    data: paymentIntentData,
    isPending: isCreatingIntent,
  } = useCreateTicketPaymentIntent();

  // Check if user is the event host
  const isEventHost = user && event && user.id === event.hostUserId;

  const {
    control,
    handleSubmit,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm<TicketFormData>({
    defaultValues: {
      fullName: "",
      email: "",
      ticketTypeId: "",
      quantity: 1,
    },
  });

  const selectedTicket = watch("ticketTypeId");
  const quantity = watch("quantity") ?? 1; // Fallback to 1 if undefined
  const ticket = ticketTypes?.find((t) => t.id === selectedTicket);
  const ticketPrice = ticket?.price ? Number(ticket.price) : 0;
  const total = ticketPrice * (quantity || 1);

  // Initialize form when modal opens or when user/ticketTypes are available
  useEffect(() => {
    if (open) {
      const currentValues = getValues();
      reset({
        fullName: user?.fullName || currentValues.fullName || "",
        email: user?.email || currentValues.email || "",
        ticketTypeId: ticketTypes?.[0]?.id || currentValues.ticketTypeId || "",
        quantity: currentValues.quantity || 1,
      });
    }
  }, [open, user, ticketTypes, reset, getValues]);

  // Reset payment state when modal closes
  useEffect(() => {
    if (!open) {
      setShowPayment(false);
    }
  }, [open]);

  const onSubmit = async (data: TicketFormData) => {
    if (!data.ticketTypeId || !ticket) {
      toast({
        title: "Error",
        description: "Please select a ticket type",
        variant: "destructive",
      });
      return;
    }

    if (!data.fullName.trim() || !data.email.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await createPaymentIntent({
        eventId,
        tickets: [
          {
            ticketTypeId: data.ticketTypeId,
            quantity: data.quantity,
          },
        ],
        attendeeName: data.fullName,
        attendeeEmail: data.email,
      });
      setShowPayment(true);
    } catch (error) {
      // Error is handled by the hook
    }
  };

  const handlePaymentSuccess = () => {
    // Close modal and refresh or show success message
    onClose();
    // You might want to show a success toast here
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-neutral-900 border-neutral-800 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5" />
            Get Your Ticket
          </DialogTitle>
        </DialogHeader>

        {!showPayment ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Ticket Type */}
              <div className="space-y-3">
                <Label className="text-sm text-neutral-400">Ticket Type</Label>

                {isLoading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                    <Skeleton className="h-16 w-full rounded-xl" />
                  </div>
                ) : (
                  <Controller
                    name="ticketTypeId"
                    control={control}
                    rules={{ required: "Please select a ticket type" }}
                    render={({ field }) => (
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="space-y-2"
                      >
                        {ticketTypes?.map((ticket) => (
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
                    )}
                  />
                )}
                {errors.ticketTypeId && (
                  <p className="text-sm text-red-500">{errors.ticketTypeId.message}</p>
                )}
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between">
                <Label className="text-sm text-neutral-400">Quantity</Label>
                <Controller
                  name="quantity"
                  control={control}
                  rules={{ 
                    required: "Quantity is required",
                    min: { value: 1, message: "Quantity must be at least 1" }
                  }}
                  render={({ field }) => (
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => field.onChange(Math.max(1, field.value - 1))}
                        className="border border-neutral-700 rounded-lg p-1"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center">{field.value}</span>
                      <button
                        type="button"
                        onClick={() => field.onChange(field.value + 1)}
                        className="border border-neutral-700 rounded-lg p-1"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                />
              </div>
              {errors.quantity && (
                <p className="text-sm text-red-500">{errors.quantity.message}</p>
              )}

              {/* Attendee Info */}
              <div className="space-y-3">
                <Label className="text-sm text-neutral-400">Attendee Info</Label>
                <Controller
                  name="fullName"
                  control={control}
                  rules={{ required: "Full name is required" }}
                  render={({ field }) => (
                    <Input 
                      placeholder="Full Name" 
                      {...field}
                    />
                  )}
                />
                {errors.fullName && (
                  <p className="text-sm text-red-500">{errors.fullName.message}</p>
                )}
                <Controller
                  name="email"
                  control={control}
                  rules={{ 
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address"
                    }
                  }}
                  render={({ field }) => (
                    <Input 
                      placeholder="Email Address" 
                      type="email"
                      {...field}
                    />
                  )}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email.message}</p>
                )}
              </div>

              {/* Price Summary */}
              <div className="border-t border-neutral-800 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Price</span>
                  <span>
                    ${ticketPrice.toFixed(2)} × {quantity || 1}
                  </span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${isNaN(total) ? "0.00" : total.toFixed(2)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {isEventHost ? (
                  <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <p className="text-sm text-yellow-500 text-center">
                      You cannot purchase tickets for your own event
                    </p>
                  </div>
                ) : (
                  <Button 
                    type="submit"
                    className="w-full bg-primary text-white" 
                    disabled={!ticket || isCreatingIntent}
                  >
                    {isCreatingIntent 
                      ? "Preparing payment…" 
                      : total === 0 
                      ? "Confirm Ticket" 
                      : "Purchase Ticket"}
                  </Button>
                )}
                <Button variant="ghost" className="w-full" onClick={onClose} type="button">
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Payment Element */}
            {paymentIntentData?.clientSecret && (
              <div className="space-y-4">
                <div className="border-t border-neutral-800 pt-4">
                  <h3 className="text-lg font-semibold mb-4">Payment Details</h3>
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret: paymentIntentData.clientSecret,
                      appearance: { theme: "night" },
                    }}
                  >
                    <TicketPaymentForm total={total} onSuccess={handlePaymentSuccess} />
                  </Elements>
                </div>
                <Button variant="ghost" className="w-full" onClick={() => setShowPayment(false)} type="button">
                  Back
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
