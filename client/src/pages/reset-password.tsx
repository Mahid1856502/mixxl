import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Music, Key } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const resetSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPassword() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetForm) => {
    setIsLoading(true);
    try {
      await apiRequest("POST", "/api/auth/reset-password", {
        email: data.email,
        newPassword: data.newPassword,
      });
      
      toast({
        title: "Password Updated",
        description: "Your password has been updated successfully. You can now log in with your new password.",
      });
      
      form.reset();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 rounded-lg mixxl-gradient flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold mixxl-gradient-text">Mixxl</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
          <p className="text-muted-foreground">Update your password to regain access</p>
        </div>

        <Card className="glass-effect border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="w-5 h-5" />
              <span>Update Password</span>
            </CardTitle>
            <CardDescription>
              Enter your email and new password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          {...field}
                          className="bg-white/5 border-white/10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter new password"
                          {...field}
                          className="bg-white/5 border-white/10"
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
                        <Input
                          type="password"
                          placeholder="Confirm new password"
                          {...field}
                          className="bg-white/5 border-white/10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full mixxl-gradient hover:opacity-90"
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}