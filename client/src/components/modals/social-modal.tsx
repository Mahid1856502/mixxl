import { useAuth } from "@/provider/use-auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Heart, Users } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import UserCard from "../social/user-card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Follower } from "@shared/schema";

interface SocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  followers: Follower[];
  following: Follower[];
  isOwnProfile: boolean;
  showFollowers: boolean;
}

export default function SocialModal({
  isOpen,
  onClose,
  following,
  followers,
  isOwnProfile,
  showFollowers = true,
}: SocialModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-pink-500" />
              <span>Social</span>
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-1">
          <Tabs
            defaultValue={showFollowers ? "followers" : "following"}
            className="w-full mt-2"
          >
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="following">
                Following ({following.length})
              </TabsTrigger>
              <TabsTrigger value="followers">
                Followers ({followers.length})
              </TabsTrigger>
            </TabsList>

            {/* FOLLOWING TAB */}
            <TabsContent value="following">
              <Card className="glass-effect border-white/10">
                <CardContent className="pt-6">
                  {following.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        {isOwnProfile
                          ? "You're not following anyone yet"
                          : "Not following anyone yet"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {following.slice(0, 20).map((followedUser: any) => (
                        <UserCard
                          key={followedUser.id}
                          user={followedUser}
                          isFollowing
                          variant="compact"
                        />
                      ))}
                      {following.length > 20 && (
                        <Button variant="outline" className="w-full">
                          View All Following
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* FOLLOWERS TAB */}
            <TabsContent value="followers">
              <Card className="glass-effect border-white/10">
                <CardContent className="pt-6">
                  {followers.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-muted-foreground">No followers yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {followers.slice(0, 20).map((follower: any) => (
                        <UserCard
                          key={follower.id}
                          user={follower}
                          variant="compact"
                        />
                      ))}
                      {followers.length > 20 && (
                        <Button variant="outline" className="w-full">
                          View All Followers
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
