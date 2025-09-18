import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast, useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  HelpCircle,
  Bug,
  Lightbulb,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

const contactSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Subject is required"),
  category: z.string().min(1, "Please select a category"),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(1000, "Message must be less than 1000 characters"),
});

type ContactForm = z.infer<typeof contactSchema>;

const categories = [
  { value: "general", label: "General Inquiry", icon: MessageCircle },
  { value: "support", label: "Technical Support", icon: HelpCircle },
  { value: "bug", label: "Bug Report", icon: Bug },
  { value: "feature", label: "Feature Request", icon: Lightbulb },
  { value: "business", label: "Business Inquiry", icon: Mail },
];

export default function Contact() {
  const { user } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      category: "",
      message: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name:
          user.firstName && user.lastName
            ? `${user.firstName} ${user.lastName}`
            : "",
        email: user.email || "",
        subject: "",
        category: "",
        message: "",
      });
    }
  }, [user, form]);

  const contactMutation = useMutation({
    mutationFn: async (data: ContactForm) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: () => {
      setIsSubmitted(true);
      form.reset();
      toast({
        title: "Message Sent!",
        description:
          "Thank you for contacting us. We'll get back to you within 24 hours.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description:
          "Failed to send message. Please try again or email us directly.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactForm) => {
    contactMutation.mutate(data);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
              <Mail className="w-8 h-8 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mixxl-gradient-text">
              Message Sent!
            </h1>
            <p className="text-muted-foreground">
              Thank you for reaching out. We've received your message and will
              respond within 24 hours.
            </p>
            <Button onClick={() => setIsSubmitted(false)} className="mt-6">
              Send Another Message
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold mixxl-gradient-text">Contact Us</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get in touch with the Mixxl team. We're here to help you succeed on
            your musical journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Send us a Message</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your@email.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem
                                key={category.value}
                                value={category.value}
                              >
                                <div className="flex items-center space-x-2">
                                  <category.icon className="w-4 h-4" />
                                  <span>{category.label}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subject</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Brief description of your inquiry"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Tell us more about your inquiry..."
                            rows={6}
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={contactMutation.isPending}
                    className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600"
                  >
                    {contactMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="w-5 h-5 text-pink-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <p className="text-sm text-muted-foreground">
                      hello@mixxl.fm
                    </p>
                    <p className="text-sm text-muted-foreground">
                      support@mixxl.fm
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Phone className="w-5 h-5 text-pink-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Phone</h4>
                    <p className="text-sm text-muted-foreground">Coming Soon</p>
                    <p className="text-xs text-muted-foreground">
                      Mon-Fri, 9:00 AM - 6:00 PM GMT
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-pink-500 mt-0.5" />
                  <div>
                    <h4 className="font-medium">Address</h4>
                    <p className="text-sm text-muted-foreground">
                      The Old Shed Studios
                      <br />
                      Dyfan Road
                      <br />
                      Barry
                      <br />
                      CF63 1DP
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* <Card className="glass-effect border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2 mixxl-gradient-text">Response Times</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>General Inquiries:</span>
                    <span className="text-muted-foreground">24 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Technical Support:</span>
                    <span className="text-muted-foreground">12 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bug Reports:</span>
                    <span className="text-muted-foreground">6 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Business Inquiries:</span>
                    <span className="text-muted-foreground">48 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card> */}

            <Card className="glass-effect">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Quick Links</h3>
                <div className="space-y-2">
                  <a
                    href="/faq"
                    className="block text-sm text-muted-foreground hover:text-pink-500 transition-colors"
                  >
                    Frequently Asked Questions
                  </a>
                  {/* <a
                    href="/help"
                    className="block text-sm text-muted-foreground hover:text-pink-500 transition-colors"
                  >
                    Help Center
                  </a>
                  <a
                    href="/status"
                    className="block text-sm text-muted-foreground hover:text-pink-500 transition-colors"
                  >
                    System Status
                  </a>
                  <a
                    href="/community"
                    className="block text-sm text-muted-foreground hover:text-pink-500 transition-colors"
                  >
                    Community Forum
                  </a> */}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
