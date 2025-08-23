import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmojiPicker } from "@/components/ui/emoji-picker";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Link } from "wouter";
import {
  MessageCircle,
  Search,
  Send,
  Plus,
  Users,
  Music,
  UserPlus,
  Radio,
  Compass,
  Clock,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export default function Messages() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [newMessage, setNewMessage] = useState("");
  const [newConversationUser, setNewConversationUser] = useState("");
  const [isNewConversationOpen, setIsNewConversationOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get user's conversations
  const { data: conversations = [] } = useQuery({
    queryKey: ["/api/conversations"],
    enabled: !!user,
  }) as { data: any[] };

  // Check for conversation ID in URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const conversationId = urlParams.get("conversation");
    if (conversationId && conversations && conversations.length > 0) {
      const conversation = conversations.find(
        (c: any) => c.id === conversationId
      );
      if (conversation) {
        setSelectedConversation(conversation);
      }
    }
  }, [conversations]);

  // Get messages for selected conversation
  const { data: messages = [] } = useQuery({
    queryKey: ["/api/conversations", selectedConversation?.id, "messages"],
    enabled: !!selectedConversation,
  }) as { data: any[] };

  // Get suggested users for starting conversations
  const { data: suggestedUsers = [] } = useQuery({
    queryKey: ["/api/featured-artists"],
    select: (data: any[]) =>
      data.filter((artist: any) => artist.id !== user?.id).slice(0, 5),
  }) as { data: any[] };

  // Search users query for conversation dialog
  const { data: searchResults = [] } = useQuery({
    queryKey: ["/api/search/users", newConversationUser],
    queryFn: async () => {
      const params = new URLSearchParams({ q: newConversationUser });
      const response = await fetch(`/api/search/users?${params}`);
      return response.json();
    },
    enabled: !!newConversationUser.trim() && newConversationUser.length > 1,
  }) as { data: any[] };

  // Create new conversation mutation
  const createConversationMutation = useMutation({
    mutationFn: async (participant2Id: string) => {
      const response = await apiRequest("POST", "/api/conversations", {
        participant2Id,
      });
      return response.json();
    },
    onSuccess: (conversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setSelectedConversation(conversation);
      setIsNewConversationOpen(false);
      setNewConversationUser("");
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({
      conversationId,
      content,
    }: {
      conversationId: string;
      content: string;
    }) => {
      const response = await apiRequest(
        "POST",
        `/api/conversations/${conversationId}/messages`,
        { content }
      );
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["/api/conversations", selectedConversation?.id, "messages"],
      });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setNewMessage("");
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    sendMessageMutation.mutate({
      conversationId: selectedConversation.id,
      content: newMessage.trim(),
    });
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage((prev) => prev + emoji);
  };

  const handleStartConversation = (userId: string) => {
    createConversationMutation.mutate(userId);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getOtherParticipant = (conversation: any) => {
    return conversation.participant1Id === user?.id
      ? conversation.participant2
      : conversation.participant1;
  };

  // For now, we'll show a placeholder since the messaging system isn't fully implemented
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Messages</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to access messages
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-8rem)]">
          {/* Conversations List */}
          <Card className="glass-effect border-white/10">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                  Messages
                </CardTitle>
                <Dialog
                  open={isNewConversationOpen}
                  onOpenChange={setIsNewConversationOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      New
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md glass-effect border-white/10">
                    <DialogHeader>
                      <DialogTitle className="bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                        Start a Conversation
                      </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Input
                          placeholder="Search users..."
                          value={newConversationUser}
                          onChange={(e) =>
                            setNewConversationUser(e.target.value)
                          }
                          className="glass-effect border-white/10 bg-white/5"
                        />

                        {/* Search Results */}
                        {newConversationUser.length > 1 &&
                          searchResults.length > 0 && (
                            <div className="max-h-48 overflow-y-auto border border-white/10 rounded-lg bg-black/20">
                              {searchResults.map((searchUser: any) => (
                                <div
                                  key={searchUser.id}
                                  onClick={() =>
                                    handleStartConversation(searchUser.id)
                                  }
                                  className="flex items-center space-x-3 p-3 hover:bg-white/5 cursor-pointer border-b border-white/5 last:border-b-0"
                                >
                                  <Avatar className="h-10 w-10">
                                    <AvatarImage
                                      src={searchUser.profileImage}
                                      alt={searchUser.username}
                                    />
                                    <AvatarFallback className="bg-gradient-to-r from-pink-500 to-orange-500">
                                      {searchUser.username
                                        ?.slice(0, 2)
                                        .toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">
                                      {searchUser.firstName &&
                                      searchUser.lastName
                                        ? `${searchUser.firstName} ${searchUser.lastName}`
                                        : searchUser.username}
                                    </p>
                                    <p className="text-sm text-muted-foreground truncate">
                                      @{searchUser.username}
                                    </p>
                                  </div>
                                  <Badge className="text-xs">
                                    {searchUser.role}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          )}

                        {newConversationUser.length > 1 &&
                          searchResults.length === 0 && (
                            <p className="text-sm text-muted-foreground text-center py-4">
                              No users found matching "{newConversationUser}"
                            </p>
                          )}
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-muted-foreground">
                          Suggested Users
                        </h4>
                        {suggestedUsers.map((artist: any) => (
                          <div
                            key={artist.id}
                            className="flex items-center justify-between p-3 rounded-lg glass-effect border-white/10"
                          >
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={artist.profileImage}
                                  alt={artist.username}
                                />
                                <AvatarFallback className="bg-gradient-to-r from-pink-500 to-orange-500">
                                  {artist.username.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{artist.username}</p>
                                <p className="text-sm text-muted-foreground">
                                  {artist.role}
                                </p>
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleStartConversation(artist.id)}
                              disabled={createConversationMutation.isPending}
                              className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
                            >
                              <MessageCircle className="h-4 w-4 mr-1" />
                              Message
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 glass-effect border-white/10 bg-white/5"
                />
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-16rem)]">
                {conversations.length === 0 ? (
                  <div className="p-6 text-center">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-2">
                      No conversations yet
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Start a conversation with other artists to collaborate,
                      share music, or just chat!
                    </p>

                    <Button
                      onClick={() => setIsNewConversationOpen(true)}
                      className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Start Conversation
                    </Button>
                  </div>
                ) : (
                  <div className="p-2">
                    {conversations.map((conversation: any) => {
                      const otherUser = getOtherParticipant(conversation);
                      return (
                        <div
                          key={conversation.id}
                          onClick={() => setSelectedConversation(conversation)}
                          className={cn(
                            "flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors",
                            selectedConversation?.id === conversation.id
                              ? "bg-gradient-to-r from-pink-500/20 to-orange-500/20 border border-pink-500/30"
                              : "hover:bg-white/5"
                          )}
                        >
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={otherUser?.profileImage}
                              alt={otherUser?.username}
                            />
                            <AvatarFallback className="bg-gradient-to-r from-pink-500 to-orange-500">
                              {otherUser?.username?.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">
                              {otherUser?.username}
                            </p>
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.lastMessage?.content ||
                                "Start conversation..."}
                            </p>
                          </div>
                          {conversation.lastMessageAt && (
                            <div className="text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mb-1" />
                              {formatTime(conversation.lastMessageAt)}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Message Area */}
          <Card className="lg:col-span-2 glass-effect border-white/10">
            <CardContent className="p-0 h-full flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Conversation Header */}
                  <div className="p-4 border-b border-white/10">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={
                            getOtherParticipant(selectedConversation)
                              ?.profileImage
                          }
                          alt={
                            getOtherParticipant(selectedConversation)?.username
                          }
                        />
                        <AvatarFallback className="bg-gradient-to-r from-pink-500 to-orange-500">
                          {getOtherParticipant(selectedConversation)
                            ?.username?.slice(0, 2)
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-medium">
                          {getOtherParticipant(selectedConversation)?.username}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {getOtherParticipant(selectedConversation)?.role ||
                            "Artist"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message: any) => (
                        <div
                          key={message.id}
                          className={cn(
                            "flex",
                            message.senderId === user?.id
                              ? "justify-end"
                              : "justify-start"
                          )}
                        >
                          <div
                            className={cn(
                              "max-w-[70%] rounded-lg p-3",
                              message.senderId === user?.id
                                ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white"
                                : "bg-white/10 border border-white/20"
                            )}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p
                              className={cn(
                                "text-xs mt-1",
                                message.senderId === user?.id
                                  ? "text-white/70"
                                  : "text-muted-foreground"
                              )}
                            >
                              {formatTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t border-white/10">
                    <div className="flex space-x-2">
                      <div className="flex-1 flex space-x-2">
                        <Input
                          placeholder="Type a message..."
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleSendMessage()
                          }
                          className="flex-1 glass-effect border-white/10 bg-white/5"
                        />
                        <EmojiPicker
                          onEmojiSelect={handleEmojiSelect}
                          className="glass-effect border-white/10 bg-white/5 hover:bg-white/10"
                        />
                      </div>
                      <Button
                        onClick={handleSendMessage}
                        disabled={
                          !newMessage.trim() || sendMessageMutation.isPending
                        }
                        className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                /* Welcome Message */
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center max-w-md">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r from-pink-500 to-orange-500 flex items-center justify-center">
                      <MessageCircle className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent">
                      Welcome to Mixxl Messages
                    </h2>
                    <p className="text-muted-foreground mb-6">
                      Connect with artists, collaborate on projects, and build
                      your music community. Select a conversation from the
                      sidebar to get started.
                    </p>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <Users className="h-6 w-6 text-blue-400" />
                        </div>
                        <h4 className="font-medium mb-1">Collaborate</h4>
                        <p className="text-xs text-muted-foreground">
                          Work together on tracks
                        </p>
                      </div>
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-500/20 flex items-center justify-center">
                          <Music className="h-6 w-6 text-green-400" />
                        </div>
                        <h4 className="font-medium mb-1">Share Music</h4>
                        <p className="text-xs text-muted-foreground">
                          Exchange tracks and ideas
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button asChild variant="ghost" size="sm">
                        <Link href="/radio">
                          <Radio className="h-4 w-4 mr-2" />
                          Join Radio Chat
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href="/discover">
                          <Compass className="h-4 w-4 mr-2" />
                          Discover Artists
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
