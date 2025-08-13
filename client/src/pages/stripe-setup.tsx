import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Clock, CreditCard, Shield, Globe, Zap, ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "wouter";

const benefits = [
  {
    icon: CreditCard,
    title: "Direct Deposits",
    description: "Money goes straight to your bank account"
  },
  {
    icon: Shield,
    title: "Secure & Trusted",
    description: "Stripe processes billions in payments safely"
  },
  {
    icon: Globe,
    title: "Global Support",
    description: "Accept payments from fans worldwide"
  },
  {
    icon: Zap,
    title: "Fast Payouts",
    description: "Daily deposits available (small fee applies)"
  }
];

const requirements = [
  "Valid government-issued ID (passport, driver's license, or national ID)",
  "Bank account in your name",
  "Tax identification number (SSN, EIN, or local equivalent)",
  "Valid email address (preferably same as Mixxl account)",
  "Business address (can be home address for individuals)"
];

const setupSteps = [
  {
    step: 1,
    title: "Create Your Stripe Account",
    duration: "2 minutes", 
    description: "Quick 2-minute signup for direct payments",
    tasks: [
      "Visit dashboard.stripe.com/register",
      "Click 'Create account'",
      "Enter your business information",
      "Verify your identity with ID/passport",
      "Add bank account for deposits"
    ],
    highlight: "Use the same email as your Mixxl account for easy integration"
  },
  {
    step: 2,
    title: "Business Information Setup",
    duration: "3 minutes",
    description: "Configure your artist profile for payments",
    tasks: [
      "Choose 'Individual' for solo artists or 'Business' for bands",
      "Enter your performing name as business name",
      "Add your address (required for tax purposes)",
      "Set your business category to 'Music & Entertainment'",
      "Upload required identity documents"
    ],
    highlight: "Your performing name will appear on fan receipts"
  },
  {
    step: 3,
    title: "Bank Account & Tax Setup",
    duration: "2 minutes",
    description: "Where your earnings will be deposited",
    tasks: [
      "Add your bank account details",
      "Verify micro-deposits (1-2 business days)",
      "Complete tax information (W-9 for US, local forms for others)",
      "Set payout schedule (daily, weekly, or monthly)",
      "Enable instant payouts (optional, small fee)"
    ],
    highlight: "Bank account must match the name on your identity documents"
  },
  {
    step: 4,
    title: "Connect to Mixxl",
    duration: "1 minute",
    description: "Link your Stripe account with your artist profile",
    tasks: [
      "Go to your Mixxl Profile Settings",
      "Click 'Connect Stripe Account'",
      "Authorize the connection",
      "Verify account linking successful",
      "Test with a small tip or purchase"
    ],
    highlight: "You can disconnect and reconnect anytime in settings"
  }
];

const faqs = [
  {
    question: "How much does Stripe charge?",
    answer: "2.9% + 30p per transaction. This is industry standard and much lower than traditional payment processors."
  },
  {
    question: "When do I get paid?",
    answer: "Standard deposits take 2-7 business days. You can enable instant payouts for a small fee (1.5% of transaction)."
  },
  {
    question: "What if I'm not in the US/UK?",
    answer: "Stripe supports 40+ countries. Tax requirements and payout times may vary by location."
  },
  {
    question: "Can I change my bank account later?",
    answer: "Yes, you can update your bank account information anytime in your Stripe dashboard."
  }
];

export default function StripeSetup() {
  return (
    <div className="min-h-screen bg-dark-primary">
      <div className="container mx-auto px-6 py-12">
        {/* Back Button */}
        <Link href="/pricing-comparison">
          <Button variant="ghost" className="mb-8 text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pricing
          </Button>
        </Link>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Stripe Setup Guide
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get set up in under 10 minutes to start receiving direct payments from fans
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <Card key={index} className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <IconComponent className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-gray-300 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* What You'll Need */}
        <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm mb-16">
          <CardHeader>
            <CardTitle className="text-white text-2xl flex items-center">
              <Check className="w-6 h-6 text-green-400 mr-3" />
              What You'll Need
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {requirements.map((requirement, index) => (
              <div key={index} className="flex items-start space-x-3">
                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-gray-300">{requirement}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Setup Steps */}
        <div className="space-y-8 mb-16">
          {setupSteps.map((step, index) => (
            <Card key={index} className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-xl flex items-center">
                    <Badge className="bg-gradient-to-r from-orange-500 to-pink-600 text-white mr-4">
                      Step {step.step}
                    </Badge>
                    {step.title}
                  </CardTitle>
                  <div className="flex items-center text-gray-400">
                    <Clock className="w-4 h-4 mr-1" />
                    <span className="text-sm">{step.duration}</span>
                  </div>
                </div>
                <p className="text-gray-300">{step.description}</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {step.tasks.map((task, taskIndex) => (
                    <div key={taskIndex} className="flex items-start space-x-3">
                      <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                        {taskIndex + 1}
                      </span>
                      <span className="text-gray-300">{task}</span>
                    </div>
                  ))}
                </div>

                {step.step === 1 && (
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => window.open('https://dashboard.stripe.com/register?email=', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Open Stripe Dashboard
                  </Button>
                )}

                {step.highlight && (
                  <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0 mt-2"></div>
                      <div>
                        <span className="text-yellow-400 font-medium text-sm">
                          {step.step === 1 ? "Important:" : "Pro Tip:"}
                        </span>
                        <p className="text-gray-300 text-sm mt-1">{step.highlight}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQs */}
        <Card className="bg-dark-secondary/80 border-gray-700 backdrop-blur-sm mb-16">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="space-y-2">
                <h4 className="text-white font-semibold">{faq.question}</h4>
                <p className="text-gray-300">{faq.answer}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Card className="bg-gradient-to-r from-orange-500/10 to-pink-600/10 border-orange-500/30 backdrop-blur-sm">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Earning?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Complete your Stripe setup and start receiving tips and track sales directly to your bank account.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white px-8 py-3 text-lg font-semibold"
                onClick={() => window.open('https://dashboard.stripe.com/register?email=', '_blank')}
              >
                <ExternalLink className="w-5 h-5 mr-2" />
                Start Stripe Setup
              </Button>
              
              <Link href="/profile-settings">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-orange-500 text-orange-400 hover:bg-orange-500/10 px-8 py-3 text-lg"
                >
                  Go to Profile Settings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}