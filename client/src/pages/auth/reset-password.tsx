import { useMemo, useState } from "react";
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
import { Music, Key, Eye, EyeOff } from "lucide-react";
import { toast, useToast } from "@/hooks/use-toast";
import { useLocation, useSearch } from "wouter";
import { useResetPassword } from "@/api/hooks/users/useResetPassword";

const baseSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
});

const resetSchemaWithOld = baseSchema.extend({
  token: z.string().optional(),
  oldPassword: z.string().min(6, "Old password must be at least 6 characters"),
});

const resetSchemaWithoutOld = baseSchema.extend({
  token: z.string(),
  oldPassword: z.string().optional(),
});

export default function ResetPassword() {
  const [, setLocation] = useLocation();

  const params = useSearch();
  const searchParams = useMemo(() => new URLSearchParams(params), [params]);
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  // show/hide states for each password field
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate: resetPassword, isPending } = useResetPassword();

  // later
  const schema = token ? resetSchemaWithoutOld : resetSchemaWithOld;
  type ResetForm = z.infer<typeof schema>;

  const form = useForm<ResetForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      email,
      token,
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  console.log("form.errors", form.formState.errors);
  const onSubmit = (data: ResetForm) => {
    console.log("reset password", data);
    resetPassword(
      {
        token: data.token,
        email: data.email,
        ...(token ? {} : { oldPassword: data.oldPassword }),
        newPassword: data.newPassword,
      },
      {
        onSuccess: () => {
          toast({
            title: "Password Updated",
            description:
              "Your password has been updated successfully. You can now log in with your new password.",
          });
          setLocation("/login");
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 rounded-lg mixxl-gradient flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold mixxl-gradient-text">
              Mixxl
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Reset Password</h1>
          <p className="text-muted-foreground">
            Update your password to regain access
          </p>
        </div>

        <Card className="glass-effect border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="w-5 h-5" />
              <span>Update Password</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* OLD PASSWORD */}
                {!token && (
                  <FormField
                    control={form.control}
                    name="oldPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Old Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showOld ? "text" : "password"}
                              placeholder="Enter old password"
                              {...field}
                              className="bg-white/5 border-white/10 pr-10"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={
                                showOld
                                  ? "Hide old password"
                                  : "Show old password"
                              }
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowOld((v) => !v)}
                            >
                              {showOld ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* NEW PASSWORD */}
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showNew ? "text" : "password"}
                            placeholder="Enter new password"
                            {...field}
                            className="bg-white/5 border-white/10 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={
                              showNew
                                ? "Hide new password"
                                : "Show new password"
                            }
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowNew((v) => !v)}
                          >
                            {showNew ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* CONFIRM PASSWORD */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showConfirm ? "text" : "password"}
                            placeholder="Confirm new password"
                            {...field}
                            className="bg-white/5 border-white/10 pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={
                              showConfirm
                                ? "Hide confirm password"
                                : "Show confirm password"
                            }
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowConfirm((v) => !v)}
                          >
                            {showConfirm ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full mixxl-gradient hover:opacity-90"
                  disabled={isPending}
                >
                  {isPending ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
