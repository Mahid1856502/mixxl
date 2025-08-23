import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Send, Users, Mail, Eye, Clock, EditIcon } from "lucide-react";
import { Link } from "wouter";
import BroadcastModal from "@/components/modals/mutate-broadcast-modal";
import { useAllBroadcasts } from "@/api/hooks/broadcasts/useBroadcasts";
import { AdminBroadcast } from "@shared/schema";
import { useSendBroadcast } from "@/api/hooks/broadcasts/useMutateBroadcast";

export default function BroadcastsAdmin() {
  const [editingBroadcast, setEditingBroadcast] =
    useState<AdminBroadcast | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: broadcasts, isLoading } = useAllBroadcasts();

  const { mutate: sendBroadcast, isPending } = useSendBroadcast();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail className="h-4 w-4" />;
      case "notification":
        return <Users className="h-4 w-4" />;
      case "both":
        return (
          <div className="flex gap-1">
            <Mail className="h-3 w-3" />
            <Users className="h-3 w-3" />
          </div>
        );
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
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
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Create Broadcast
              </Button>
              <Button
                asChild
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
              >
                <Link href="/admin">← Back to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-6">
          {broadcasts?.map((broadcast: AdminBroadcast) => (
            <Card key={broadcast.id} className="bg-gray-900 border-gray-800">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {getTypeIcon(broadcast.type)}
                        {broadcast.title}
                        <Badge
                          className={
                            broadcast.status
                              ? getStatusColor(broadcast.status)
                              : ""
                          }
                        >
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
                          {broadcast.createdAt
                            ? new Date(broadcast.createdAt).toLocaleDateString()
                            : ""}
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
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingBroadcast(broadcast);
                        setIsDialogOpen(true);
                      }}
                    >
                      <EditIcon />
                    </Button>

                    {broadcast.status === "draft" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => sendBroadcast(broadcast.id)}
                        disabled={isPending}
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
                    <span>
                      Sent: {new Date(broadcast.sentAt).toLocaleString()}
                    </span>
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
      {isDialogOpen && (
        <BroadcastModal
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingBroadcast={editingBroadcast}
          setEditingBroadcast={setEditingBroadcast}
        />
      )}
    </div>
  );
}
