import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Copy, Calendar, User, DollarSign } from "lucide-react";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import type { DiscountCode } from "@shared/schema";

const discountCodeSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").max(50),
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().optional(),
  type: z.enum(["free_subscription", "percentage_off", "fixed_amount"]),
  value: z.string().optional(),
  maxUses: z.string().optional(),
  validFrom: z.string(),
  validUntil: z.string().optional(),
  applicableRoles: z.array(z.string()).optional(),
  minimumAmount: z.string().optional(),
});

type DiscountCodeFormData = z.infer<typeof discountCodeSchema>;

export default function DiscountCodesPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DiscountCode | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: discountCodes = [], isLoading } = useQuery({
    queryKey: ["/api/admin/discount-codes"],
  });

  const form = useForm<DiscountCodeFormData>({
    resolver: zodResolver(discountCodeSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      type: "free_subscription",
      value: "",
      maxUses: "",
      validFrom: new Date().toISOString().split('T')[0],
      validUntil: "",
      applicableRoles: [],
      minimumAmount: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: DiscountCodeFormData) => {
      const payload = {
        ...data,
        value: data.value ? parseFloat(data.value) : null,
        maxUses: data.maxUses ? parseInt(data.maxUses) : null,
        minimumAmount: data.minimumAmount ? parseFloat(data.minimumAmount) : null,
        applicableRoles: data.applicableRoles || [],
      };
      return apiRequest("POST", "/api/admin/discount-codes", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/discount-codes"] });
      setIsCreateOpen(false);
      form.reset();
      toast({
        title: "Success",
        description: "Discount code created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create discount code",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: DiscountCodeFormData) => {
      if (!editingCode) return;
      const payload = {
        ...data,
        value: data.value ? parseFloat(data.value) : null,
        maxUses: data.maxUses ? parseInt(data.maxUses) : null,
        minimumAmount: data.minimumAmount ? parseFloat(data.minimumAmount) : null,
        applicableRoles: data.applicableRoles || [],
      };
      return apiRequest("PUT", `/api/admin/discount-codes/${editingCode.id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/discount-codes"] });
      setEditingCode(null);
      form.reset();
      toast({
        title: "Success",
        description: "Discount code updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update discount code",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/discount-codes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/discount-codes"] });
      toast({
        title: "Success",
        description: "Discount code deleted successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete discount code",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: DiscountCodeFormData) => {
    if (editingCode) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (code: DiscountCode) => {
    setEditingCode(code);
    form.reset({
      code: code.code,
      name: code.name,
      description: code.description || "",
      type: code.type as any,
      value: code.value?.toString() || "",
      maxUses: code.maxUses?.toString() || "",
      validFrom: code.validFrom ? new Date(code.validFrom).toISOString().split('T')[0] : "",
      validUntil: code.validUntil ? new Date(code.validUntil).toISOString().split('T')[0] : "",
      applicableRoles: code.applicableRoles ? (Array.isArray(code.applicableRoles) ? code.applicableRoles : JSON.parse(code.applicableRoles as string)) : [],
      minimumAmount: code.minimumAmount?.toString() || "",
    });
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied",
      description: "Discount code copied to clipboard",
    });
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValue('code', result);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500 hover:bg-green-600";
      case "inactive": return "bg-gray-500 hover:bg-gray-600";
      case "expired": return "bg-red-500 hover:bg-red-600";
      case "used_up": return "bg-orange-500 hover:bg-orange-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "free_subscription": return "bg-purple-500 hover:bg-purple-600";
      case "percentage_off": return "bg-blue-500 hover:bg-blue-600";
      case "fixed_amount": return "bg-green-500 hover:bg-green-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 via-yellow-400 to-purple-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Discount Codes</h1>
            <p className="text-purple-100 mt-2">Create and manage discount codes for free artist profiles and discounts</p>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-white/5">
              <Link href="/admin">← Back to Dashboard</Link>
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-purple-600 hover:bg-gray-100 font-semibold">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Code
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Discount Code</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Code</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input placeholder="FREEARTIST2025" {...field} />
                              </FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={generateRandomCode}
                              >
                                Generate
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Free Artist Profile 2025" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Provide free artist profile access for new users" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="free_subscription">Free Artist Profile</SelectItem>
                                <SelectItem value="percentage_off">Percentage Off</SelectItem>
                                <SelectItem value="fixed_amount">Fixed Amount Off</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Value</FormLabel>
                            <FormControl>
                              <Input placeholder="25 (for 25% off) or 10 (for £10 off)" {...field} />
                            </FormControl>
                            <FormDescription>
                              Leave empty for free subscription codes
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="maxUses"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Uses</FormLabel>
                            <FormControl>
                              <Input placeholder="100" {...field} />
                            </FormControl>
                            <FormDescription>
                              Leave empty for unlimited uses
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="minimumAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Minimum Amount (£)</FormLabel>
                            <FormControl>
                              <Input placeholder="10" {...field} />
                            </FormControl>
                            <FormDescription>
                              Minimum order value required
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="validFrom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valid From</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="validUntil"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Valid Until</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormDescription>
                              Leave empty for no expiry
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button 
                        type="submit" 
                        disabled={createMutation.isPending || updateMutation.isPending}
                        className="bg-gradient-to-r from-purple-500 via-pink-500 via-yellow-400 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:via-yellow-500 hover:to-purple-700"
                      >
                        {editingCode ? "Update Code" : "Create Code"}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => {
                          setIsCreateOpen(false);
                          setEditingCode(null);
                          form.reset();
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="p-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              Discount Codes ({discountCodes?.length || 0})
              <div className="text-sm font-normal text-gray-400">
                Manage codes for free artist profiles and discounts
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-300">Code</TableHead>
                    <TableHead className="text-gray-300">Name</TableHead>
                    <TableHead className="text-gray-300">Type</TableHead>
                    <TableHead className="text-gray-300">Usage</TableHead>
                    <TableHead className="text-gray-300">Valid Period</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discountCodes?.map((code: DiscountCode) => (
                    <TableRow key={code.id} className="border-gray-700">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <code className="bg-gray-700 text-purple-300 px-2 py-1 rounded text-sm font-mono">
                            {code.code}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCopyCode(code.code)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-white">{code.name}</div>
                          {code.description && (
                            <div className="text-sm text-gray-400 truncate max-w-xs">
                              {code.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getTypeBadgeColor(code.type)}>
                          {code.type === "free_subscription" && "Free Profile"}
                          {code.type === "percentage_off" && `${code.value}% Off`}
                          {code.type === "fixed_amount" && `£${code.value} Off`}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-300">
                            {code.usedCount || 0}
                            {code.maxUses && ` / ${code.maxUses}`}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div className="text-sm">
                            <div className="text-gray-300">{new Date(code.validFrom).toLocaleDateString()}</div>
                            {code.validUntil && (
                              <div className="text-gray-500">
                                to {new Date(code.validUntil).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(code.status || "active")}>
                          {code.status || "active"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(code)}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deleteMutation.mutate(code.id)}
                            disabled={deleteMutation.isPending}
                            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-red-400"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {(!discountCodes || discountCodes.length === 0) && (
                <div className="text-center py-12">
                  <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-500" />
                  <h3 className="text-xl font-semibold mb-2 text-white">No Discount Codes</h3>
                  <p className="text-gray-400 mb-6">
                    Create discount codes to give artists free profiles or offer discounts
                  </p>
                  <Button 
                    onClick={() => setIsCreateOpen(true)}
                    className="bg-gradient-to-r from-purple-500 via-pink-500 via-yellow-400 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:via-yellow-500 hover:to-purple-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Code
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingCode} onOpenChange={(open) => !open && setEditingCode(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Discount Code</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                  className="bg-gradient-to-r from-purple-500 via-pink-500 via-yellow-400 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:via-yellow-500 hover:to-purple-700"
                >
                  Update Code
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setEditingCode(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}