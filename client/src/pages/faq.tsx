import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Search, HelpCircle, Music, Users, CreditCard, Settings, MessageCircle } from "lucide-react";

const faqCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: HelpCircle,
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30"
  },
  {
    id: "music-uploads",
    title: "Music & Uploads",
    icon: Music,
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30"
  },
  {
    id: "social-features",
    title: "Social Features",
    icon: Users,
    color: "bg-pink-500/20 text-pink-400 border-pink-500/30"
  },
  {
    id: "payments",
    title: "Payments & Subscriptions",
    icon: CreditCard,
    color: "bg-green-500/20 text-green-400 border-green-500/30"
  },
  {
    id: "account",
    title: "Account Settings",
    icon: Settings,
    color: "bg-orange-500/20 text-orange-400 border-orange-500/30"
  }
];

const faqs = [
  {
    category: "getting-started",
    question: "What is Mixxl and how does it work?",
    answer: "Mixxl is an independent music platform designed for artists and music lovers. Artists can upload tracks, connect with fans, earn money through tips and sales, and build their careers. Fans can discover new music, support artists directly, and create playlists called Mixxlists."
  },
  {
    category: "getting-started",
    question: "How do I create an account?",
    answer: "Click 'Join Now' on the homepage and choose whether you're an Artist or Fan. Follow the signup wizard to complete your profile, including selecting your preferred currency and music preferences."
  },
  {
    category: "getting-started",
    question: "What's the difference between Artist and Fan accounts?",
    answer: "Artist accounts can upload music, receive tips, go live, and access detailed analytics. Fan accounts can discover music, tip artists, create Mixxlists, and purchase tracks to support their favorite artists."
  },
  {
    category: "music-uploads",
    question: "What file formats can I upload?",
    answer: "We support MP3, WAV, FLAC, and M4A audio formats. Maximum file size is 100MB. We recommend high-quality files for the best listening experience."
  },
  {
    category: "music-uploads",
    question: "Do I need a subscription to upload music?",
    answer: "Yes, artists need a Mixxl subscription (£10/month) to upload tracks. We offer a 90-day free trial for new artists to get started."
  },
  {
    category: "music-uploads",
    question: "How do track previews work?",
    answer: "You can set tracks to 'preview only' which allows 30-60 second previews for all users. Full tracks can only be heard by fans who have purchased them - there are no subscription tiers for listening."
  },
  {
    category: "music-uploads",
    question: "Can I sell my tracks individually?",
    answer: "Yes! You can set individual prices for tracks in your preferred currency. Fans can purchase tracks to add to their Mixxlists and support you directly."
  },
  {
    category: "social-features",
    question: "How does the tipping system work?",
    answer: "Fans can tip artists in various currencies (£, $, €, etc.) with minimum amounts starting from £1 equivalent. Tips can be sent for specific tracks or general support."
  },
  {
    category: "social-features",
    question: "What are Mixxlists?",
    answer: "Mixxlists are personalized playlists that fans can create to organize their purchased tracks and favorite music. Think of them as your curated music collections."
  },
  {
    category: "social-features",
    question: "How do I follow artists and get notifications?",
    answer: "Click the 'Follow' button on any artist's profile. You'll receive notifications when they upload new tracks, go live, or have important updates."
  },
  {
    category: "social-features",
    question: "Can I message artists directly?",
    answer: "Yes! Use the 'Message' button on artist profiles to start private conversations. Artists can choose to respond and build relationships with their fans."
  },
  {
    category: "payments",
    question: "How much does Mixxl cost?",
    answer: "Mixxl costs £10/month (about 33p per day) for artists with a 90-day free trial. Fan accounts are completely free. Mixxl takes 0% commission - you keep 100% of tips and sales minus only Stripe's 3% payment processing fee."
  },
  {
    category: "payments",
    question: "What currencies do you support?",
    answer: "We support 20+ currencies including GBP (default), USD, EUR, CAD, AUD, JPY, and many more. Choose your preferred currency during signup."
  },
  {
    category: "payments",
    question: "How do I get paid for tips and sales?",
    answer: "Payments are processed through Stripe and deposited directly to your bank account. You'll need to connect your Stripe account in your profile settings."
  },
  {
    category: "payments",
    question: "Are there any hidden fees?",
    answer: "No hidden fees! Mixxl takes 0% commission from your earnings. The only deduction is Stripe's 3% payment processing fee, which goes directly to Stripe, not us. Your subscription fee is fixed at £10/month."
  },
  {
    category: "payments",
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, you can cancel anytime from your account settings. Your music will remain live until the end of your billing period."
  },
  {
    category: "account",
    question: "How do I change my currency preference?",
    answer: "Go to Profile Settings and update your preferred currency. This affects how tips are displayed and minimum amounts are calculated."
  },
  {
    category: "account",
    question: "How do I verify my email address?",
    answer: "Check your email for a verification link after signup. You can also request a new verification email from your dashboard if needed."
  },
  {
    category: "account",
    question: "Can I change from Fan to Artist account?",
    answer: "Yes! Contact support and we can upgrade your account type. You'll need to subscribe to upload music as an artist."
  },
  {
    category: "account",
    question: "How do I delete my account?",
    answer: "Contact support to delete your account. Please note that uploaded tracks will be removed and this action cannot be undone."
  },
  {
    category: "getting-started",
    question: "How do live streaming and radio features work?",
    answer: "Artists can 'Go Live' to stream performances and interact with fans in real-time with tipping and chat features. The radio feature automatically plays tracks uploaded by artists on the platform - it's a continuous stream of music submitted by the Mixxl community."
  }
];

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFAQs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold mixxl-gradient-text">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about Mixxl. Can't find what you're looking for? Contact our support team.
          </p>
        </div>

        {/* Search */}
        <Card className="glass-effect">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search frequently asked questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-3">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className="h-auto p-3"
          >
            <span>All Categories</span>
            <Badge variant="secondary" className="ml-2">
              {faqs.length}
            </Badge>
          </Button>
          {faqCategories.map((category) => {
            const count = faqs.filter(faq => faq.category === category.id).length;
            return (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="h-auto p-3"
              >
                <category.icon className="w-4 h-4 mr-2" />
                <span>{category.title}</span>
                <Badge variant="secondary" className="ml-2">
                  {count}
                </Badge>
              </Button>
            );
          })}
        </div>

        {/* FAQ Results */}
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {selectedCategory 
                  ? faqCategories.find(cat => cat.id === selectedCategory)?.title
                  : "All Questions"
                }
              </span>
              <Badge variant="outline">
                {filteredFAQs.length} {filteredFAQs.length === 1 ? 'result' : 'results'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-8">
                <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your search terms or browse different categories.
                </p>
                <Button variant="outline" onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory(null);
                }}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <Accordion type="single" collapsible className="space-y-2">
                {filteredFAQs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-4">
                    <AccordionTrigger className="text-left hover:no-underline">
                      <div className="flex items-start space-x-3">
                        <Badge 
                          variant="outline" 
                          className={faqCategories.find(cat => cat.id === faq.category)?.color}
                        >
                          {faqCategories.find(cat => cat.id === faq.category)?.title}
                        </Badge>
                        <span className="flex-1">{faq.question}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pt-2 pb-4">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </CardContent>
        </Card>

        {/* Contact CTA */}
        <Card className="glass-effect border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
          <CardContent className="p-6 text-center">
            <MessageCircle className="w-12 h-12 text-pink-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 mixxl-gradient-text">Still need help?</h3>
            <p className="text-muted-foreground mb-4">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <div className="flex justify-center space-x-4">
              <Button asChild>
                <a href="/contact">Contact Support</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="mailto:support@mixxl.fm">Email Us</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}