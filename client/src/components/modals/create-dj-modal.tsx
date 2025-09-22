"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, EyeOff, User, Mail, Lock, Headphones } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCreateDJ } from "@/api/hooks/admin/useCreateDJ";

// ✅ Validation schema (role locked to "DJ")
const djSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, underscores"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type DJForm = z.infer<typeof djSchema>;

// Input with Icon
const InputWithIcon = ({ icon: Icon, ...props }: any) => (
  <div className="relative">
    <Icon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
    <Input className="bg-white/5 border-white/10 pl-10" {...props} />
  </div>
);

// Password input
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

export function CreateDJModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: signup, isPending } = useCreateDJ();

  const form = useForm<DJForm>({
    resolver: zodResolver(djSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "TEMP_DJ_PASS", // 🔒 Temporary password
    },
  });

  const onSubmit = async (data: DJForm) => {
    try {
      await signup({ ...data, role: "DJ" }); // 🚀 role hardcoded here
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-gray-900 text-white border border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Headphones className="h-5 w-5 text-purple-400" />
            Create DJ Account
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                          placeholder={name === "firstName" ? "John" : "Doe"}
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

            {/* Role locked */}
            <div className="p-3 bg-gray-800 rounded-lg text-sm text-gray-300 flex items-center gap-2">
              <Headphones className="h-4 w-4 text-purple-400" />
              Role: <span className="font-medium text-white">DJ</span>
            </div>

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

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
              disabled={isPending}
            >
              {isPending && <div className="loading-spinner w-4 h-4 mr-2" />}
              Create DJ
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
