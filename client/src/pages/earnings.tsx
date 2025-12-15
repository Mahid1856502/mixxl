import { useArtistTransactions } from "@/api/hooks/artists/useEarnings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import React from "react";
import { GenericTable } from "@/components/common/data-table";
import {
  PAYOUT_COLUMNS,
  PURCHASE_COLUMNS,
  TRANSACTIONS_COLUMNS,
} from "@/lib/columns";
import { getCurrency } from "@/lib/currency";
import { Banknote, CreditCard, ShoppingCart, Wallet } from "lucide-react";
import { useStripeAccount } from "@/api/hooks/stripe/useStripeAccount";
import { useAuth } from "@/provider/use-auth";
import { Button } from "@/components/ui/button";

const Earnings = () => {
  const { user } = useAuth();
  const { data: earnings, isLoading } = useArtistTransactions();
  const { mutate: setupArtistAccount, isPending: settingStripeAccount } =
    useStripeAccount(user?.stripeAccountId ? true : false);

  if (isLoading) {
    return (
      <div className="p-6 space-y-8">
        {/* Balance Section Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-40" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator />

        {/* Tabs Skeleton */}
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="purchases">Local Purchases</TabsTrigger>
          </TabsList>
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  const balance = earnings?.balance ?? { available: [], pending: [] };
  const transactions = earnings?.transactions ?? [];
  const payouts = earnings?.payouts ?? [];
  const localPurchases = earnings?.localPurchases ?? [];

  return (
    <div className="p-6 space-y-8">
      <div className="space-y-4 flex items-center justify-between">
        {/* Heading */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Earnings Overview
          </h1>
          {!user?.stripeAccountId && (
            <p className="text-muted-foreground text-sm">
              To receive payments, connect your Stripe Express account.
            </p>
          )}
          {user?.stripeAccountId &&
            !user?.stripePayoutsEnabled &&
            !user?.stripeDisabledReason && (
              <p className="text-muted-foreground text-sm">
                Your Stripe account setup is incomplete. Resume setup to finish
                verification.
              </p>
            )}
          {user?.stripeAccountId && user?.stripeDisabledReason && (
            <p className="text-muted-foreground text-sm">
              Stripe blocked payouts: {user?.stripeDisabledReason}.
            </p>
          )}
          {user?.stripeAccountId && user?.stripePayoutsEnabled && (
            <p className="text-muted-foreground text-sm">
              ✅ Your Stripe account is connected. You can receive payouts.
            </p>
          )}
        </div>

        {/* Artist Stripe Account State */}
        {user?.role === "artist" && (
          <div className="space-y-3">
            {/* No account yet */}
            {!user?.stripeAccountId && (
              <div className="flex items-center justify-between">
                <Button
                  className="text-white"
                  onClick={() => setupArtistAccount()}
                  disabled={settingStripeAccount}
                >
                  Enable Payouts
                </Button>
              </div>
            )}

            {/* Incomplete requirements */}
            {user?.stripeAccountId &&
              !user?.stripePayoutsEnabled &&
              !user?.stripeDisabledReason && (
                <div className="flex items-center justify-between">
                  <Button
                    className="text-white"
                    onClick={() => setupArtistAccount()}
                    disabled={settingStripeAccount}
                  >
                    Resume Payout Setup
                  </Button>
                </div>
              )}

            {/* Disabled */}
            {user?.stripeAccountId && user?.stripeDisabledReason && (
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-sm">
                  Stripe blocked payouts: {user?.stripeDisabledReason}.
                </p>
                <Button
                  className="text-white"
                  onClick={() => setupArtistAccount()}
                  disabled={settingStripeAccount}
                >
                  Fix Account Issues
                </Button>
              </div>
            )}

            {/* Fully enabled */}
            {user?.stripeAccountId && user?.stripePayoutsEnabled && (
              <p className="text-muted-foreground text-sm">
                ✅ Your Stripe account is connected. You can receive payouts.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Balance Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-green-600" />
              Available Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {balance.available.length > 0 ? (
              <div className="space-y-1">
                {balance.available.map((b, i) => (
                  <div
                    key={i}
                    className="text-3xl font-bold text-green-600 tracking-tight"
                  >
                    {getCurrency(b.amount, b.currency)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No available funds
              </p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              This balance is ready and will be included in your next payout.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Banknote className="w-5 h-5 text-yellow-600" />
              Future Payouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {balance.pending.length > 0 ? (
              <div className="space-y-1">
                {balance.pending.map((b, i) => (
                  <div key={i} className="text-3xl font-bold tracking-tight">
                    {getCurrency(b.amount, b.currency)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No pending funds</p>
            )}
            <p className="text-sm text-muted-foreground mt-2">
              These funds are pending and will automatically transfer once
              Stripe clears them.
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Tabs Section */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="sticky top-0 bg-background z-10">
          <TabsTrigger value="transactions" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Transactions
          </TabsTrigger>
          <TabsTrigger value="payouts" className="flex items-center gap-2">
            <Banknote className="w-4 h-4" /> Payouts
          </TabsTrigger>
          <TabsTrigger value="purchases" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" /> Purchases
          </TabsTrigger>
        </TabsList>

        {/* Transactions */}
        <TabsContent value="transactions">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <GenericTable
                data={transactions}
                columns={TRANSACTIONS_COLUMNS}
                searchPlaceholder="Search transactions..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payouts */}
        <TabsContent value="payouts">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <GenericTable
                data={payouts}
                columns={PAYOUT_COLUMNS}
                searchPlaceholder="Search payouts..."
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Local Purchases */}
        <TabsContent value="purchases">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Local Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              <GenericTable
                data={localPurchases}
                columns={PURCHASE_COLUMNS}
                searchPlaceholder="Search purchases..."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Earnings;
