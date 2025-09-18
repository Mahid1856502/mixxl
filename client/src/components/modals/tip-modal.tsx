import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CurrencySelector } from "@/components/ui/currency-selector";
import {
  Elements,
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";
import { Heart } from "lucide-react";
import {
  formatCurrency,
  getMinimumTipAmount,
  DEFAULT_CURRENCY,
  getCurrencySymbol,
} from "@/lib/currency";

interface TipModalProps {
  isOpen: boolean;
  onClose: () => void;
  artist: {
    id: string;
    artistName: string;
    profileImage?: string;
  };
  track?: {
    id: string;
    title: string;
  };
}

interface TipFormProps {
  artist: TipModalProps["artist"];
  track?: TipModalProps["track"];
  amount: string;
  currency: string;
  onBack: () => void;
  onClose: () => void;
}

const TipForm = ({
  artist,
  track,
  amount,
  currency,
  onBack,
  onClose,
}: TipFormProps) => {
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/tip-success`,
      },
      redirect: "if_required", // 👈 only redirect if 3D Secure is needed
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
        description: `Your ${formatCurrency(
          parseFloat(amount),
          currency
        )} tip has been sent to ${artist.artistName}`,
      });
      onClose();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Heart className="w-12 h-12 mx-auto mb-4 text-pink-500" />
        <h3 className="text-lg font-semibold mb-2">Complete Your Tip</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Sending {formatCurrency(parseFloat(amount), currency)} to{" "}
          {artist.artistName}
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
            onClick={onBack}
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
};

export default function TipModal({
  isOpen,
  onClose,
  artist,
  track,
}: TipModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [currency, setCurrency] = useState<string>(
    user?.preferredCurrency || DEFAULT_CURRENCY
  );
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const minimumAmount = getMinimumTipAmount(currency);

  const suggestedAmounts = [1, 5, 10];

  const createPaymentIntentMutation = useMutation({
    mutationFn: async (tipAmount: number) => {
      const response = await apiRequest("POST", "/api/tips", {
        toUserId: artist.id,
        trackId: track?.id,
        amount: tipAmount.toFixed(2),
        currency,
        message,
      });
      return response.json();
    },
    onSuccess: (data) => {
      setClientSecret(data.clientSecret);
    },
    onError: () => {
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
        description: `Minimum tip amount is ${formatCurrency(
          minimumAmount,
          currency
        )}`,
        variant: "destructive",
      });
      return;
    }
    createPaymentIntentMutation.mutate(tipAmount);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-pink-500" />
              <span>Send a Tip</span>
            </DialogTitle>
          </div>
        </DialogHeader>
        <div className="h-[600px] overflow-y-auto overflow-x-hidden">
          {/* If clientSecret exists → render Elements with TipForm */}
          {clientSecret ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <TipForm
                artist={artist}
                track={track}
                amount={amount}
                currency={currency}
                onBack={() => setClientSecret(null)}
                onClose={onClose}
              />
            </Elements>
          ) : (
            <div className="space-y-6">
              {/* Artist Info */}
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={artist.profileImage}
                    className="object-cover"
                  />
                  <AvatarFallback>{artist?.artistName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{artist.artistName}</h3>
                  {track && (
                    <p className="text-sm text-muted-foreground">
                      For: {track.title}
                    </p>
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
                    placeholder={`Custom amount (min ${formatCurrency(
                      minimumAmount,
                      currency
                    )})`}
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
                  disabled={
                    !amount ||
                    parseFloat(amount) < minimumAmount ||
                    createPaymentIntentMutation.isPending
                  }
                  className="flex-1 bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600"
                >
                  {createPaymentIntentMutation.isPending
                    ? "Processing..."
                    : "Continue"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
