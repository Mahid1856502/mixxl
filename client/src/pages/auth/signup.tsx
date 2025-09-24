"use client";

import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Logo } from "@/components/ui/logo";
import {
  Music,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Users,
  Headphones,
} from "lucide-react";
import { EmailVerificationBanner } from "@/components/email-verification-banner";
import { useAuth } from "@/hooks/use-auth";
import { useStripeCountries } from "@/api/hooks/stripe/useStripeCountries";

// Validation schema
const signupSchema = z
  .object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["fan", "artist"], {
      required_error: "Please select a role",
    }),
    country: z.string().min(1, "Please select your country"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

// Reusable Input with Icon
const InputWithIcon = ({ icon: Icon, ...props }: any) => (
  <div className="relative">
    <Icon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
    <Input className="bg-white/5 border-white/10 pl-10" {...props} />
  </div>
);

// Reusable Password input
const PasswordInput = ({ field, show, toggle }: any) => (
  <div className="relative">
    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
    <Input
      type={show ? "text" : "password"}
      className="bg-white/5 border-white/10 pl-10 pr-10"
      placeholder="Enter password"
      {...field}
    />
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
      onClick={toggle}
    >
      {show ? (
        <EyeOff className="h-4 w-4 text-muted-foreground" />
      ) : (
        <Eye className="h-4 w-4 text-muted-foreground" />
      )}
    </Button>
  </div>
);

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { data: countries, isLoading: isCountriesLoading } =
    useStripeCountries();

  const { user, signup, isLoading } = useAuth();

  const form = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: undefined,
      country: "",
    },
  });

  const onSubmit = async (data: SignupForm) => {
    try {
      const { confirmPassword, ...signupData } = data;
      await signup(signupData);
      // Show banner after signup
    } catch (error) {
      // Error handled by auth hook
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center  p-6">
      {user && (
        <EmailVerificationBanner
          user={{
            emailVerified: user.emailVerified || false,
            email: user.email,
            firstName: user.firstName || undefined,
          }}
        />
      )}
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="mb-4 flex justify-center">
            <Logo size="xxl" variant="full" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Join the community</h1>
          <p className="text-muted-foreground">
            Create your account to start your music journey
          </p>
        </div>

        <Card className="glass-effect border-white/10">
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Fill in your details to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  {["firstName", "lastName"].map((name, idx) => (
                    <FormField
                      key={name}
                      control={form.control}
                      name={name as "firstName" | "lastName"}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {name === "firstName" ? "First Name" : "Last Name"}
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder={
                                name === "firstName" ? "John" : "Doe"
                              }
                              {...field}
                              className="bg-white/5 border-white/10"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <InputWithIcon
                          icon={User}
                          placeholder="johndoe"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className="bg-white/5 border-white/10"
                            disabled={isCountriesLoading}
                          >
                            <SelectValue
                              placeholder={
                                isCountriesLoading
                                  ? "Loading countries..."
                                  : "Select your country"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries?.map((c) => (
                            <SelectItem key={c.code} value={c.code}>
                              {c.name}
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <InputWithIcon
                          icon={Mail}
                          type="email"
                          placeholder="john@example.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>I am a...</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-white/5 border-white/10">
                            <SelectValue placeholder="Choose your role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fan">
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4" />
                              <span>
                                Music Fan - Discover and support artists
                              </span>
                            </div>
                          </SelectItem>
                          <SelectItem value="artist">
                            <div className="flex items-center space-x-2">
                              <Music className="w-4 h-4" />
                              <span>Artist - Share and monetize my music</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          field={field}
                          show={showPassword}
                          toggle={() => setShowPassword(!showPassword)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          field={field}
                          show={showConfirmPassword}
                          toggle={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-3">
                  <Button
                    type="submit"
                    className="w-full mixxl-gradient text-white font-semibold"
                    disabled={isLoading}
                  >
                    {isLoading && (
                      <div className="loading-spinner rounded-full w-4 h-4 mr-2"></div>
                    )}
                    Create Account
                  </Button>
                </div>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-primary hover:underline font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>

            <div className="mt-4 text-center">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
