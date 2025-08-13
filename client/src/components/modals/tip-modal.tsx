import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CurrencySelector } from "@/components/ui/currency-selector";
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { X, Heart } from "lucide-react";
import { formatCurrency, getMinimumTipAmount, DEFAULT_CURRENCY, getCurrencySymbol } from "@/lib/currency";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  artist: {
    id: string;
    firstName: string;
    lastName: string;
    profileImage?: string;
  };
  track?: {
    id: string;
    title: string;
  };
}

interface TipFormProps {
  artist: TipModalProps['artist'];
  track?: TipModalProps['track'];
  onClose: () => void;
}

const TipForm = ({ artist, track, onClose }: TipFormProps) => {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [currency, setCurrency] = useState<string>(user?.preferredCurrency || DEFAULT_CURRENCY);
  const [clientSecret, setClientSecret] = useState("");
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();

  // Currency-specific suggested amounts (equivalent to £1, £5, £10 in GBP)
  const getSuggestedAmounts = (currencyCode: string) => {
    const baseAmounts = [1, 5, 10]; // In GBP
    return baseAmounts.map(amount => {
      const converted = Math.round(amount * (currencyCode === 'GBP' ? 1 : 
        currencyCode === 'USD' ? 1.27 : 
        currencyCode === 'EUR' ? 1.17 : 
        currencyCode === 'JPY' ? 188 : 1.27) * 100) / 100;
      return converted;
    });
  };

  const suggestedAmounts = getSuggestedAmounts(currency);
  const minimumAmount = getMinimumTipAmount(currency);

  const createPaymentIntentMutation = useMutation({
    mutationFn: async (tipAmount: number) => {
      const response = await apiRequest("POST", "/api/tips", {
        receiverId: artist.id,
        trackId: track?.id,
        amount: tipAmount,
        currency: currency,
        message,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create payment intent",
        variant: "destructive",
      });
    },
  });

  const handleAmountSelect = (value: number) => {
    setSelectedAmount(value);
    setAmount(value.toString());
  };

  const handleCustomAmount = (value: string) => {
    setAmount(value);
    setSelectedAmount(null);
  };

  const handleCreatePayment = () => {
    const tipAmount = parseFloat(amount);
    if (!tipAmount || tipAmount < minimumAmount) {
      toast({
        title: "Invalid Amount",
        description: `Minimum tip amount is ${formatCurrency(minimumAmount, currency)}`,
        variant: "destructive",
      });
      return;
    }

    createPaymentIntentMutation.mutate(tipAmount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Tip Sent Successfully!",
        description: `Your ${formatCurrency(parseFloat(amount), currency)} tip has been sent to ${artist.firstName}`,
      });
      onClose();
    }
  };

  if (clientSecret) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Heart className="w-12 h-12 mx-auto mb-4 text-pink-500" />
          <h3 className="text-lg font-semibold mb-2">Complete Your Tip</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Sending {formatCurrency(parseFloat(amount), currency)} to {artist.firstName} {artist.lastName}
          </p>
          {track && (
            <Badge variant="outline" className="mb-4">
              For: {track.title}
            </Badge>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <PaymentElement />
          
          <div className="flex justify-between space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setClientSecret("")}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={!stripe}
              className="flex-1 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600"
            >
              Send Tip
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Artist Info */}
      <div className="flex items-center space-x-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={artist.profileImage} />
          <AvatarFallback>
            {artist.firstName[0]}{artist.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{artist.firstName} {artist.lastName}</h3>
          {track && (
            <p className="text-sm text-muted-foreground">For: {track.title}</p>
          )}
        </div>
      </div>

      {/* Currency Selection */}
      <div className="space-y-2">
        <Label>Currency</Label>
        <CurrencySelector
          value={currency}
          onValueChange={(value) => {
            setCurrency(value);
            setAmount("");
            setSelectedAmount(null);
          }}
          className="w-full"
        />
      </div>

      {/* Tip Amount Selection */}
      <div className="space-y-3">
        <Label>Choose tip amount</Label>
        <div className="grid grid-cols-3 gap-2">
          {suggestedAmounts.map((value, index) => (
            <Button
              key={index}
              type="button"
              variant={selectedAmount === value ? "default" : "outline"}
              className={`p-3 ${
                selectedAmount === value
                  ? "bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white"
                  : "border-gray-300 hover:border-pink-500 dark:border-gray-600 dark:hover:border-pink-400"
              }`}
              onClick={() => handleAmountSelect(value)}
            >
              {formatCurrency(value, currency)}
            </Button>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-sm">
            {getCurrencySymbol(currency)}
          </span>
          <Input
            type="number"
            step="0.01"
            min={minimumAmount}
            placeholder={`Custom amount (min ${formatCurrency(minimumAmount, currency)})`}
            value={amount}
            onChange={(e) => handleCustomAmount(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Label htmlFor="message">Message (optional)</Label>
        <Textarea
          id="message"
          placeholder="Say something nice..."
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-between space-x-3">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleCreatePayment}
          disabled={!amount || parseFloat(amount) < minimumAmount || createPaymentIntentMutation.isPending}
          className="flex-1 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600"
        >
          {createPaymentIntentMutation.isPending ? "Processing..." : "Continue"}
        </Button>
      </div>
    </div>
  );
};

export default function TipModal({ isOpen, onClose, artist, track }: TipModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-pink-500" />
              <span>Send a Tip</span>
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Elements stripe={stripePromise}>
          <TipForm artist={artist} track={track} onClose={onClose} />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}