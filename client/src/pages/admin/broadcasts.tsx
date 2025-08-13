import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Plus, Send, Users, Mail, Eye, Clock } from "lucide-react";
import { Link, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

interface AdminBroadcast {
  id: string;
  title: string;
  message: string;
  type: 'notification' | 'email' | 'both';
  targetAudience: 'all' | 'artists' | 'fans' | 'subscribers' | 'specific';
  specificUserIds?: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduledFor?: string;
  sentAt?: string;
  recipientCount?: number;
  createdAt: string;
  createdBy: string; // UUID of the creator
}

export default function BroadcastsAdmin() {
  const [editingBroadcast, setEditingBroadcast] = useState<AdminBroadcast | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [location] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check if we're on the /new route to show create form by default
  const showCreateForm = location === '/admin/broadcasts/new';

  const { data: broadcasts, isLoading } = useQuery({
    queryKey: ['/api/admin/broadcasts'],
    queryFn: async () => {
      const response = await fetch('/api/admin/broadcasts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch broadcasts');
      return response.json();
    }
  });

  const createBroadcastMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/admin/broadcasts', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/broadcasts'] });
      toast({ title: "Broadcast created successfully!" });
      setIsDialogOpen(false);
      setEditingBroadcast(null);
      // Reset form
      const form = document.querySelector('form') as HTMLFormElement;
      if (form) form.reset();
      // Navigate away from /new route if we're on it
      if (showCreateForm) {
        window.history.pushState({}, '', '/admin/broadcasts');
      }
    },
    onError: (error: any) => {
      toast({ 
        title: "Error creating broadcast", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const sendBroadcastMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('POST', `/api/admin/broadcasts/${id}/send`);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/broadcasts'] });
      toast({ 
        title: "Broadcast sent successfully!", 
        description: `Sent to ${data.sentCount} users`
      });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error sending broadcast", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const scheduledForValue = formData.get('scheduledFor') as string;
    const data: any = {
      title: formData.get('title') as string,
      message: formData.get('message') as string,
      type: formData.get('type') as string,
      targetAudience: formData.get('targetAudience') as string,
      specificUserIds: formData.get('specificUserIds') as string || null,
    };

    // Only include scheduledFor if it has a value
    if (scheduledForValue && scheduledForValue.trim() !== '') {
      data.scheduledFor = scheduledForValue;
    }

    createBroadcastMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'notification': return <Users className="h-4 w-4" />;
      case 'both': return <div className="flex gap-1"><Mail className="h-3 w-3" /><Users className="h-3 w-3" /></div>;
      default: return <Users className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // If on /new route, auto-open dialog
  if (showCreateForm && !isDialogOpen) {
    setIsDialogOpen(true);
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                User Broadcasts
              </h1>
              <p className="text-gray-400">Send targeted messages to users</p>
            </div>
            <div className="flex gap-3">
              <Button asChild variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/10">
                <Link href="/admin">← Back to Dashboard</Link>
              </Button>
              <Dialog open={isDialogOpen || showCreateForm} onOpenChange={(open) => {
                setIsDialogOpen(open);
                if (!open && showCreateForm) {
                  window.history.pushState({}, '', '/admin/broadcasts');
                }
              }}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingBroadcast(null)} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Broadcast
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create New Broadcast</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Send targeted notifications and emails to user groups
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Broadcast title"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="Your message to users..."
                        required
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Delivery Method</Label>
                        <Select name="type" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select delivery method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="notification">In-App Notification Only</SelectItem>
                            <SelectItem value="email">Email Only</SelectItem>
                            <SelectItem value="both">Both Notification & Email</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="targetAudience">Target Audience</Label>
                        <Select name="targetAudience" required>
                          <SelectTrigger>
                            <SelectValue placeholder="Select audience" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="artists">Artists Only</SelectItem>
                            <SelectItem value="fans">Fans Only</SelectItem>
                            <SelectItem value="subscribers">Subscribers Only</SelectItem>
                            <SelectItem value="specific">Specific Users</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="specificUserIds">Specific User IDs (Optional)</Label>
                      <Textarea
                        id="specificUserIds"
                        name="specificUserIds"
                        placeholder="Enter user IDs separated by commas (only for 'Specific Users' audience)"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="scheduledFor">Schedule For (Optional)</Label>
                      <Input
                        id="scheduledFor"
                        name="scheduledFor"
                        type="datetime-local"
                        placeholder="Leave empty to send immediately"
                      />
                    </div>

                    <DialogFooter>
                      <Button 
                        type="submit" 
                        disabled={createBroadcastMutation.isPending}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        {createBroadcastMutation.isPending ? 'Creating...' : 'Create Broadcast'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-6">
          {broadcasts?.map((broadcast: AdminBroadcast) => (
            <Card key={broadcast.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getTypeIcon(broadcast.type)}
                        {broadcast.title}
                        <Badge className={getStatusColor(broadcast.status)}>
                          {broadcast.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {broadcast.targetAudience}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {new Date(broadcast.createdAt).toLocaleDateString()}
                        </span>
                        {broadcast.recipientCount && (
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {broadcast.recipientCount} recipients
                          </span>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {broadcast.status === 'draft' && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => sendBroadcastMutation.mutate(broadcast.id)}
                        disabled={sendBroadcastMutation.isPending}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Send Now
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-400 mb-4 whitespace-pre-line">
                  {broadcast.message}
                </p>
                <div className="flex gap-4 text-sm text-gray-500">
                  <span>Type: {broadcast.type}</span>
                  <span>Created by: Admin</span>
                  {broadcast.sentAt && (
                    <span>Sent: {new Date(broadcast.sentAt).toLocaleString()}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {(!broadcasts || broadcasts.length === 0) && (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500 mb-4">No broadcasts created yet</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Broadcast
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}