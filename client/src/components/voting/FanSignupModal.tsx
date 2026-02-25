import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/provider/use-auth";
import { User, Mail, Lock, Eye, EyeOff } from "lucide-react";

const fanSigninSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const fanSignupSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FanSigninForm = z.infer<typeof fanSigninSchema>;
type FanSignupForm = z.infer<typeof fanSignupSchema>;

interface FanSignupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function FanSignupModal({
  open,
  onOpenChange,
  onSuccess,
}: FanSignupModalProps) {
  const { login, signup, isLoading } = useAuth();
  const [showSigninPassword, setShowSigninPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  const signinForm = useForm<FanSigninForm>({
    resolver: zodResolver(fanSigninSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<FanSignupForm>({
    resolver: zodResolver(fanSignupSchema),
    defaultValues: {
      fullName: "",
      username: "",
      email: "",
      password: "",
    },
  });

  const handleSignin = async (data: FanSigninForm) => {
    try {
      await login(data.email, data.password);
      onOpenChange(false);
      signinForm.reset();
      onSuccess?.();
    } catch {
      // Error handled by auth
    }
  };

  const handleSignup = async (data: FanSignupForm) => {
    try {
      await signup({
        ...data,
        role: "fan",
        country: "GB", // default; not needed for voting
      });
      onOpenChange(false);
      signupForm.reset();
      onSuccess?.();
    } catch {
      // Error handled by auth
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Sign in to vote
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Sign in or create a free fan account to cast your vote
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="signin" className="data-[state=active]:bg-gray-700">
              Sign in
            </TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-gray-700">
              Sign up
            </TabsTrigger>
          </TabsList>
          <TabsContent value="signin" className="mt-4">
            <Form {...signinForm}>
              <form onSubmit={signinForm.handleSubmit(handleSignin)} className="space-y-4">
                <FormField
                  control={signinForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input
                            {...field}
                            type="email"
                            className="pl-10 bg-gray-800 border-gray-600 text-white"
                            placeholder="you@example.com"
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={signinForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-300">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                          <Input
                            {...field}
                            type={showSigninPassword ? "text" : "password"}
                            className="pl-10 pr-10 bg-gray-800 border-gray-600 text-white"
                            placeholder="••••••••"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-500 hover:text-gray-400"
                            onClick={() => setShowSigninPassword(!showSigninPassword)}
                          >
                            {showSigninPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isLoading ? "Signing in..." : "Sign in & vote"}
                </Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="signup" className="mt-4">
        <Form {...signupForm}>
          <form onSubmit={signupForm.handleSubmit(handleSignup)} className="space-y-4">
            <FormField
              control={signupForm.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Full name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        {...field}
                        className="pl-10 bg-gray-800 border-gray-600 text-white"
                        placeholder="John Doe"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              control={signupForm.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Username</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        {...field}
                        className="pl-10 bg-gray-800 border-gray-600 text-white"
                        placeholder="johndoe"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              control={signupForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        {...field}
                        type="email"
                        className="pl-10 bg-gray-800 border-gray-600 text-white"
                        placeholder="you@example.com"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <FormField
              control={signupForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <Input
                        {...field}
                        type={showSignupPassword ? "text" : "password"}
                        className="pl-10 pr-10 bg-gray-800 border-gray-600 text-white"
                        placeholder="••••••••"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-gray-500 hover:text-gray-400"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                      >
                        {showSignupPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-400" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isLoading ? "Creating account..." : "Create account & vote"}
            </Button>
          </form>
        </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
