import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "wouter";

const platformData = [
  {
    name: "Mixxl",
    badge: "Best Value",
    monthly: "£10",
    commission: "0%",
    youKeep: "~97%",
    earnings: "£9.41",
    earningsSubtext: "~97% of sale",
    color: "bg-gradient-to-br from-orange-500 to-pink-600",
    features: [
      "Unlimited uploads",
      "Sell your merchendise",
      "Online Ticket Sales",
      "Book shows",
      "Fan tipping",
      "Live streaming",
      "Analytics",
      "Radio submission",
      "Collaboration tools",
      "Fan notifications",
      "90-day free trial",
    ],
    description: "Keep 100% of earnings (minus Stripe fees only)",
    highlight: true,
    stripeSetup: true,
  },
  {
    name: "Bandcamp",
    monthly: "Free",
    commission: "10-15%",
    youKeep: "~82-87%",
    earnings: "£8.16",
    earningsSubtext: "~82-87% of sale",
    color: "bg-slate-700",
    features: [
      "Music sales",
      "Fan funding",
      "Basic analytics",
      "Limited customization",
    ],
    description: "Platform takes cut of every sale",
  },
  {
    name: "SoundCloud Pro",
    monthly: "$12-16",
    commission: "Variable",
    youKeep: "~55-85%",
    earnings: "£6.41",
    earningsSubtext: "~55-85% of sale",
    color: "bg-orange-600",
    features: [
      "Upload limits",
      "Basic analytics",
      "Monetization tiers",
      "Limited direct sales",
    ],
    description: "Subscription + revenue sharing",
  },
  {
    name: "Spotify",
    monthly: "Free",
    commission: "30-50%",
    youKeep: "~50-70%",
    earnings: "£5.41",
    earningsSubtext: "~50-70% of sale",
    color: "bg-green-600",
    features: [
      "Streaming royalties",
      "Playlist placement",
      "Basic analytics",
      "No direct sales",
    ],
    description: "Complex royalty system",
  },
];

export default function PricingComparison() {
  return (
    <div className="min-h-screen bg-dark-primary">
      <div className="container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Why Artists Choose Mixxl
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Keep more of your earnings with our artist-friendly, no-commission
            model. Compare how much you'll actually earn on different platforms.
          </p>
        </div>

        {/* Earnings Comparison */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Earnings Comparison: £10 Track Sale
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {platformData.map((platform, index) => (
              <Card
                key={index}
                className={`${
                  platform.highlight
                    ? "border-orange-500 border-2"
                    : "border-gray-700"
                } bg-dark-secondary/50 backdrop-blur-sm`}
              >
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {platform.name}
                  </h3>
                  <div className="text-3xl font-bold text-orange-400 mb-1">
                    {platform.earnings}
                  </div>
                  <p className="text-sm text-gray-400">
                    {platform.earningsSubtext}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <p className="text-center text-sm text-gray-400">
            * Calculations include standard payment processing fees and platform
            commissions
          </p>
        </div>

        {/* Platform Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-16">
          {platformData.map((platform, index) => (
            <Card
              key={index}
              className={`${
                platform.highlight
                  ? "border-orange-500 border-2"
                  : "border-gray-700"
              } bg-dark-secondary/80 backdrop-blur-sm relative overflow-hidden`}
            >
              {platform.badge && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-gradient-to-r from-orange-500 to-pink-600 text-white">
                    {platform.badge}
                  </Badge>
                </div>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="text-white text-xl">
                  {platform.name}
                </CardTitle>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-white">
                    Monthly:{" "}
                    <span className="text-orange-400">{platform.monthly}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-400">Commission: </span>
                    <span
                      className={
                        platform.commission === "0%"
                          ? "text-green-400"
                          : "text-red-400"
                      }
                    >
                      {platform.commission}
                    </span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-400">You Keep: </span>
                    <span
                      className={
                        platform.youKeep.includes("97")
                          ? "text-green-400"
                          : "text-orange-400"
                      }
                    >
                      {platform.youKeep}
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-gray-300 text-sm">{platform.description}</p>

                <div className="space-y-2">
                  {platform.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-center space-x-2"
                    >
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                {platform.stripeSetup && (
                  <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-700/50">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span className="text-blue-400 font-medium text-sm">
                        Simple Stripe Setup
                      </span>
                    </div>
                    <p className="text-gray-300 text-xs">
                      One payment provider, direct deposits to your account
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-orange-500/10 to-pink-600/10 border-orange-500/30 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Keep More of Your Earnings?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of artists who've switched to Mixxl's no-commission
              model. Start your 90-day free trial and see the difference.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/subscribe">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white px-8 py-3 text-lg font-semibold"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>

              <Link href="/stripe-setup">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-orange-500 text-orange-400 hover:bg-orange-500/10 px-8 py-3 text-lg"
                >
                  Stripe Setup Guide
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
