import {
  eq,
  and,
  or,
  desc,
  asc,
  count,
  like,
  sql,
  ne,
  isNull,
  ilike,
  gt,
  exists,
  getTableColumns,
} from "drizzle-orm";
import {
  users,
  tracks,
  playlists,
  playlistTracks,
  follows,
  messages,
  conversations,
  tips,
  radioSessions,
  radioChat,
  collaborations,
  liveStreams,
  liveStreamViewers,
  liveStreamMessages,
  notifications,
  purchasedTracks,
  emailVerificationTokens,
  featuredSpots,
  adminBroadcasts,
  broadcastRecipients,
  discountCodes,
  discountCodeUsage,
  type User,
  type InsertUser,
  type Track,
  type InsertTrack,
  type Playlist,
  type InsertPlaylist,
  type Message,
  type InsertMessage,
  type Conversation,
  type Tip,
  type InsertTip,
  type RadioSession,
  type InsertRadioSession,
  type Collaboration,
  type InsertCollaboration,
  type LiveStream,
  type InsertLiveStream,
  type LiveStreamMessage,
  type InsertLiveStreamMessage,
  type Notification,
  type InsertNotification,
  type InsertPurchasedTrack,
  type EmailVerificationToken,
  type InsertEmailVerificationToken,
  type FeaturedSpot,
  type InsertFeaturedSpot,
  type AdminBroadcast,
  type InsertAdminBroadcast,
  type BroadcastRecipient,
  type InsertBroadcastRecipient,
  type DiscountCode,
  type InsertDiscountCode,
  type DiscountCodeUsage,
  Banner,
  InsertBanner,
  banners,
  RadioChatMessageWithUser,
  TrackExtended,
  PasswordResetInsert,
  PasswordReset,
  passwordResets,
  Artist,
} from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

// Import the shared database connection
import { db } from "./db";
import { isTimeSlotAvailable } from "./utils";
import { log } from "./vite";

interface FeaturedArtistFilters {
  userId?: string;
  search?: string;
  genre?: string;
  mood?: string;
}

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  updateUserStripeInfo(
    id: string,
    customerId: string,
    subscriptionId?: string
  ): Promise<User>;
  deleteUser(id: string): Promise<void>;
  getFeaturedArtists(filters: FeaturedArtistFilters): Promise<Artist[]>;
  createPasswordReset(data: PasswordResetInsert): Promise<PasswordReset>;
  getPasswordResetByUserId(userId: string): Promise<PasswordReset | null>;
  deletePasswordReset(userId: string): Promise<void>;

  // Track operations
  getTrack(id: string): Promise<Track | undefined>;
  getTracksByArtist(artistId: string): Promise<Track[]>;
  getTracks(filters: FeaturedArtistFilters): Promise<any[]>;
  // searchTracks(query: string): Promise<Track[]>;
  createTrack(track: InsertTrack): Promise<Track>;
  updateTrack(id: string, updates: Partial<Track>): Promise<Track>;
  deleteTrack(id: string): Promise<void>;
  incrementPlayCount(id: string): Promise<void>;

  // Playlist operations
  getPlaylist(id: string): Promise<Playlist | undefined>;
  getPlaylistsByUser(userId: string): Promise<Playlist[]>;
  getPublicPlaylists(filters?: { search?: string }): Promise<Playlist[]>;
  createPlaylist(playlist: InsertPlaylist): Promise<Playlist>;
  updatePlaylist(id: string, updates: Partial<Playlist>): Promise<Playlist>;
  deletePlaylist(id: string): Promise<void>;
  addTrackToPlaylist(
    playlistId: string,
    trackId: string,
    addedBy: string
  ): Promise<void>;
  getPlaylistTracks(playlistId: string, userId: string): Promise<any[]>;
  removeTrackFromPlaylist(playlistId: string, trackId: string): Promise<void>;

  // Social operations
  followUser(followerId: string, followingId: string): Promise<void>;
  unfollowUser(followerId: string, followingId: string): Promise<void>;
  getFollowers(userId: string): Promise<User[]>;
  getFollowing(userId: string): Promise<User[]>;
  isFollowing(followerId: string, followingId: string): Promise<boolean>;

  // Message operations
  getMessages(userId1: string, userId2: string): Promise<Message[]>;
  sendMessage(message: InsertMessage): Promise<Message>;
  markMessagesAsRead(senderId: string, receiverId: string): Promise<void>;

  // Conversation operations
  getOrCreateConversation(
    participant1Id: string,
    participant2Id: string
  ): Promise<Conversation>;
  getConversations(userId: string): Promise<Conversation[]>;
  getConversationMessages(
    conversationId: string,
    limit?: number
  ): Promise<Message[]>;
  sendConversationMessage(message: InsertMessage): Promise<Message>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string, limit?: number): Promise<Notification[]>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  markNotificationAsRead(notificationId: string): Promise<void>;
  markAllNotificationsAsRead(userId: string): Promise<void>;

  // Payment operations
  createTip(tip: InsertTip): Promise<Tip>;
  updateTipStatus(
    id: string,
    status: string,
    paymentIntentId?: string
  ): Promise<Tip>;
  getTipsByUser(userId: string): Promise<Tip[]>;

  // Radio operations
  createRadioSession(session: InsertRadioSession): Promise<RadioSession>;
  updateRadioSession(
    id: string,
    updates: Partial<RadioSession>
  ): Promise<RadioSession>;
  getActiveRadioSession(): Promise<
    | (RadioSession & {
        host: {
          id: string;
          username: string;
          profileImage: string | null;
          bio: string | null;
        } | null;
      })
    | undefined
  >;
  getRadioSession(id: string): Promise<RadioSession | undefined>;
  endSession(sessionId: string): Promise<RadioSession | undefined>;
  goLive(sessionId: string): Promise<RadioSession | undefined>;

  // Radio Live Chat
  getRadioChatMessages(
    sessionId: string,
    limit: number
  ): Promise<RadioChatMessageWithUser[] | undefined>;

  // Collaboration operations
  createCollaboration(
    collaboration: InsertCollaboration
  ): Promise<Collaboration>;
  updateCollaborationStatus(id: string, status: string): Promise<Collaboration>;
  getCollaborationsByUser(userId: string): Promise<Collaboration[]>;
  getPendingCollaborations(userId: string): Promise<Collaboration[]>;

  // Live Stream operations
  createLiveStream(stream: InsertLiveStream): Promise<LiveStream>;
  getLiveStream(id: string): Promise<LiveStream | undefined>;
  getLiveStreamsByArtist(artistId: string): Promise<LiveStream[]>;
  getActiveLiveStreams(): Promise<LiveStream[]>;

  // Mixxlist/Fan operations
  getUserMixxlists(userId: string): Promise<any[]>;
  getUserPurchasedTracks(userId: string): Promise<any[]>;
  getPurchasedTracksByUser(userId: string): Promise<TrackExtended[]>;
  getUserFavoriteArtists(userId: string): Promise<any[]>;
  getUserTrackPurchase(userId: string, trackId: string): Promise<any | null>;
  recordTrackPurchase(purchaseData: any): Promise<any>;
  hasTrackAccess(userId: string, trackId: string): Promise<boolean>;
  updatePurchasedTrackByIntentId(
    intentId: string,
    updates: Partial<{
      paymentStatus: "pending" | "succeeded" | "failed" | "refunded";
      stripeTransferId: string | null;
    }>
  ): Promise<any | null>;

  updateLiveStream(
    id: string,
    updates: Partial<LiveStream>
  ): Promise<LiveStream>;
  startLiveStream(id: string): Promise<LiveStream>;
  endLiveStream(id: string): Promise<LiveStream>;
  joinLiveStream(streamId: string, userId: string): Promise<void>;
  leaveLiveStream(streamId: string, userId: string): Promise<void>;
  getLiveStreamViewers(streamId: string): Promise<User[]>;
  addLiveStreamMessage(
    message: InsertLiveStreamMessage
  ): Promise<LiveStreamMessage>;
  getLiveStreamMessages(
    streamId: string,
    limit?: number
  ): Promise<LiveStreamMessage[]>;
  notifyFollowers(artistId: string, message: string): Promise<void>;

  // Search operations
  searchUsers(query: string): Promise<any[]>;

  // Email verification operations
  createEmailVerificationToken(
    token: InsertEmailVerificationToken
  ): Promise<EmailVerificationToken>;
  getEmailVerificationToken(
    token: string
  ): Promise<EmailVerificationToken | undefined>;
  deleteEmailVerificationToken(token: string): Promise<void>;
  markEmailAsVerified(userId: string): Promise<void>;

  // Admin operations - Featured Spots
  createFeaturedSpot(spot: InsertFeaturedSpot): Promise<FeaturedSpot>;
  getFeaturedSpot(id: string): Promise<FeaturedSpot | undefined>;
  getFeaturedSpots(status?: string): Promise<FeaturedSpot[]>;
  updateFeaturedSpot(
    id: string,
    updates: Partial<FeaturedSpot>
  ): Promise<FeaturedSpot>;
  deleteFeaturedSpot(id: string): Promise<void>;
  getActiveFeaturedSpots(): Promise<FeaturedSpot[]>;

  // Admin operations - Broadcasts
  createAdminBroadcast(
    broadcast: InsertAdminBroadcast
  ): Promise<AdminBroadcast>;
  getAdminBroadcast(id: string): Promise<AdminBroadcast | undefined>;
  getAdminBroadcasts(status?: string): Promise<AdminBroadcast[]>;
  updateAdminBroadcast(
    id: string,
    updates: Partial<AdminBroadcast>
  ): Promise<AdminBroadcast>;
  deleteAdminBroadcast(id: string): Promise<void>;
  getBroadcastRecipients(broadcastId: string): Promise<BroadcastRecipient[]>;
  createBroadcastRecipient(
    recipient: InsertBroadcastRecipient
  ): Promise<BroadcastRecipient>;
  updateBroadcastRecipient(
    id: string,
    updates: Partial<BroadcastRecipient>
  ): Promise<BroadcastRecipient>;
  getUsersByRole(role: string): Promise<User[]>;
  getSubscribedUsers(): Promise<User[]>;

  // Discount code operations
  createDiscountCode(code: InsertDiscountCode): Promise<DiscountCode>;
  getDiscountCodes(): Promise<DiscountCode[]>;
  getDiscountCodeById(id: string): Promise<DiscountCode | undefined>;
  getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined>;
  updateDiscountCode(
    id: string,
    updates: Partial<DiscountCode>
  ): Promise<DiscountCode>;
  deleteDiscountCode(id: string): Promise<void>;
  useDiscountCode(
    codeId: string,
    userId: string,
    orderId: string,
    discountAmount: number,
    originalAmount?: number
  ): Promise<DiscountCodeUsage>;
  getDiscountCodeUsage(codeId: string): Promise<DiscountCodeUsage[]>;
  validateDiscountCode(
    code: string,
    userId: string,
    role?: string
  ): Promise<{ valid: boolean; discount?: DiscountCode; reason?: string }>;

  // Admin operations - Banners
  createBanner(banner: InsertBanner): Promise<Banner>;
  getBanner(id: string): Promise<Banner | undefined>;
  getBanners(activeOnly?: boolean): Promise<Banner[]>;
  updateBanner(id: string, updates: Partial<Banner>): Promise<Banner>;
  deleteBanner(id: string): Promise<void>;
}

export class MySQLStorage implements IStorage {
  getBanner(id: string): Promise<Banner | undefined> {
    throw new Error("Method not implemented.");
  }
  getBanners(activeOnly?: boolean): Promise<Banner[]> {
    throw new Error("Method not implemented.");
  }
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);

    const userData = {
      ...insertUser,
      id,
      password: hashedPassword,
    };

    await db.insert(users).values(userData);
    const result = await this.getUser(id);
    if (!result) throw new Error("Failed to create user");
    return result;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    await db.update(users).set(updates).where(eq(users.id, id));
    const result = await this.getUser(id);
    if (!result) throw new Error("User not found");
    return result;
  }

  async updateUserStripeInfo(
    id: string,
    customerId: string,
    subscriptionId?: string
  ): Promise<User> {
    const updates: Partial<User> = { stripeCustomerId: customerId };
    if (subscriptionId) {
      updates.stripeSubscriptionId = subscriptionId;
    }
    return this.updateUser(id, updates);
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  /**
   * Create a password reset record
   */
  async createPasswordReset(data: PasswordResetInsert): Promise<PasswordReset> {
    const [record] = await db.insert(passwordResets).values(data).returning();
    return record;
  }

  /**
   * Get a password reset by userId
   */
  async getPasswordResetByUserId(
    userId: string
  ): Promise<PasswordReset | null> {
    const [record] = await db
      .select()
      .from(passwordResets)
      .where(
        and(
          eq(passwordResets.userId, userId),
          gt(passwordResets.expiresAt, Date.now())
        )
      );

    return record || null;
  }

  /**
   * Delete a password reset by userId
   */
  async deletePasswordReset(userId: string): Promise<void> {
    await db.delete(passwordResets).where(eq(passwordResets.userId, userId));
  }

  // inside your function
  async getFeaturedArtists(filters: FeaturedArtistFilters): Promise<Artist[]> {
    const result = await db
      .select({
        ...getTableColumns(users), // all user fields
        isFollowing: sql<boolean>`
        CASE 
          WHEN ${follows.id} IS NOT NULL THEN true 
          ELSE false 
        END
      `,
      })
      .from(users)
      .leftJoin(
        follows,
        and(
          eq(follows.followerId, filters.userId ?? sql`NULL`),
          eq(follows.followingId, users.id)
        )
      )
      .leftJoin(
        tracks,
        and(eq(tracks.artistId, users.id), eq(tracks.isPublic, true))
      )
      .where(
        and(
          eq(users.role, "artist"),
          filters.search
            ? or(
                ilike(users.username, `%${filters.search}%`),
                ilike(users.firstName, `%${filters.search}%`),
                ilike(users.lastName, `%${filters.search}%`)
              )
            : undefined,
          filters.genre && filters.genre !== "all"
            ? eq(tracks.genre, filters.genre)
            : undefined,
          filters.mood && filters.mood !== "all"
            ? eq(tracks.mood, filters.mood)
            : undefined
        )
      )
      // group only by user id (not follows id) so isFollowed stays accurate
      .groupBy(users.id, follows.id)
      .limit(50);

    return result.map((row) => ({
      ...row,
      isFollowing: !!row.isFollowing, // make sure it's always boolean
    })) as Artist[];
  }

  // async getAllArtists(): Promise<Artist[]> {
  //   const artists = await db
  //     .select({
  //       id: users.id,
  //       email: users.email,
  //       username: users.username,
  //       firstName: users.firstName,
  //       lastName: users.lastName,
  //       role: users.role,
  //       bio: users.bio,
  //       profileImage: users.profileImage,
  //       backgroundImage: users.backgroundImage,
  //       location: users.location,
  //       website: users.website,
  //       socialMedia: users.socialMedia,
  //       emailVerified: users.emailVerified, // Add this
  //       emailVerifiedAt: users.emailVerifiedAt, // Add this
  //       isActive: users.isActive,
  //       stripeCustomerId: users.stripeCustomerId,
  //       stripeSubscriptionId: users.stripeSubscriptionId,
  //       subscriptionStatus: users.subscriptionStatus,
  //       trialEndsAt: users.trialEndsAt,
  //       hasUsedTrial: users.hasUsedTrial,
  //       onboardingComplete: users.onboardingComplete,
  //       preferredCurrency: users.preferredCurrency, // Add this
  //       createdAt: users.createdAt,
  //       updatedAt: users.updatedAt,
  //     })
  //     .from(users)
  //     .where(eq(users.role, "artist"))
  //     .orderBy(users.username);

  //   return artists;
  // }

  // Track operations

  async getTrack(id: string): Promise<Track | undefined> {
    const result = await db
      .select()
      .from(tracks)
      .where(eq(tracks.id, id))
      .limit(1);
    return result[0];
  }

  async getTracksByArtist(artistId: string): Promise<Track[]> {
    // return db
    //   .select()
    //   .from(tracks)
    //   .where(eq(tracks.artistId, artistId))
    //   .orderBy(desc(tracks.createdAt));

    const result = await db
      .select({
        id: tracks.id,
        title: tracks.title,
        description: tracks.description,
        artistId: tracks.artistId,
        artistName: sql<string>`
      CASE
        WHEN ${users.firstName} IS NOT NULL AND ${users.lastName} IS NOT NULL
        THEN ${users.firstName} || ' ' || ${users.lastName}
        ELSE ${users.username}
      END
    `.as("artistName"),
        genre: tracks.genre,
        duration: tracks.duration,
        fileUrl: tracks.fileUrl,
        previewUrl: tracks.previewUrl,
        previewDuration: tracks.previewDuration,
        hasPreviewOnly: tracks.hasPreviewOnly,
        coverImage: tracks.coverImage,
        price: tracks.price,
        isPublic: tracks.isPublic,
        isExplicit: tracks.isExplicit,
        submitToRadio: tracks.submitToRadio,
        playCount: tracks.playCount,
        likesCount: tracks.likesCount,
        createdAt: tracks.createdAt,
        updatedAt: tracks.updatedAt,
        mood: tracks.mood,
        tags: tracks.tags,
        waveformData: tracks.waveformData,
        stripePriceId: tracks.stripePriceId,
        downloadCount: tracks.downloadCount,
        hasAccess: sql<boolean>`TRUE`.as("hasAccess"), // always true if purchased
      })
      .from(purchasedTracks)
      .innerJoin(tracks, eq(purchasedTracks.trackId, tracks.id))
      .innerJoin(users, eq(tracks.artistId, users.id))
      .where(eq(tracks.artistId, artistId))
      .orderBy(desc(purchasedTracks.purchasedAt));

    return result;
  }

  async getTracks(filters: FeaturedArtistFilters): Promise<any[]> {
    const conditions = [eq(tracks.isPublic, true)] as any[];

    if (filters.search) {
      conditions.push(
        or(
          ilike(tracks.title, `%${filters.search}%`),
          ilike(tracks.description, `%${filters.search}%`),
          ilike(users.username, `%${filters.search}%`)
        )
      );
    }

    const result = await db
      .select({
        id: tracks.id,
        title: tracks.title,
        artistId: tracks.artistId,
        artistName: users.username,
        description: tracks.description,
        genre: tracks.genre,
        mood: tracks.mood,
        tags: tracks.tags,
        duration: tracks.duration,
        fileUrl: tracks.fileUrl,
        previewUrl: tracks.previewUrl,
        previewDuration: tracks.previewDuration,
        hasPreviewOnly: tracks.hasPreviewOnly,
        coverImage: tracks.coverImage,
        waveformData: tracks.waveformData,
        price: tracks.price,
        playCount: tracks.playCount,
        likesCount: tracks.likesCount,
        downloadCount: tracks.downloadCount,
        isExplicit: tracks.isExplicit,
        isPublic: tracks.isPublic,
        submitToRadio: tracks.submitToRadio,
        createdAt: tracks.createdAt,
        updatedAt: tracks.updatedAt,

        // drizzle CASE expression for hasAccess
        hasAccess: sql<boolean>`
        CASE
          WHEN ${tracks.artistId} = ${filters.userId} THEN TRUE
          WHEN ${tracks.hasPreviewOnly} = FALSE THEN TRUE
          WHEN ${purchasedTracks.id} IS NOT NULL THEN TRUE
          ELSE FALSE
        END
      `,
      })
      .from(tracks)
      .leftJoin(users, eq(tracks.artistId, users.id))
      .leftJoin(
        purchasedTracks,
        and(
          eq(purchasedTracks.trackId, tracks.id),
          eq(purchasedTracks.userId, filters.userId ?? sql`NULL`)
        )
      )
      .where(and(...conditions))
      .orderBy(desc(tracks.createdAt));

    return result;
  }

  // async searchTracks(query: string): Promise<Track[]> {
  //   const result = await db
  //     .select({
  //       id: tracks.id,
  //       title: tracks.title,
  //       artistId: tracks.artistId,
  //       description: tracks.description,
  //       genre: tracks.genre,
  //       mood: tracks.mood,
  //       tags: tracks.tags,
  //       duration: tracks.duration,
  //       fileUrl: tracks.fileUrl,
  //       previewUrl: tracks.previewUrl,
  //       previewDuration: tracks.previewDuration,
  //       hasPreviewOnly: tracks.hasPreviewOnly,
  //       coverImage: tracks.coverImage,
  //       waveformData: tracks.waveformData,
  //       price: tracks.price,
  //       playCount: tracks.playCount,
  //       likesCount: tracks.likesCount,
  //       downloadCount: tracks.downloadCount,
  //       isExplicit: tracks.isExplicit,
  //       isPublic: tracks.isPublic,
  //       submitToRadio: tracks.submitToRadio,
  //       createdAt: tracks.createdAt,
  //       updatedAt: tracks.updatedAt,
  //       artistName: users.username,
  //     })
  //     .from(tracks)
  //     .leftJoin(users, eq(tracks.artistId, users.id))
  //     .where(
  //       and(
  //         eq(tracks.isPublic, true),
  //         or(
  //           like(tracks.title, `%${query}%`),
  //           like(tracks.genre, `%${query}%`),
  //           like(tracks.description, `%${query}%`),
  //           like(users.username, `%${query}%`)
  //         )
  //       )
  //     )
  //     .orderBy(desc(tracks.playCount));

  //   return result as Track[];
  // }

  async createTrack(insertTrack: InsertTrack): Promise<Track> {
    const id = randomUUID();
    const trackData = { ...insertTrack, id };

    await db.insert(tracks).values(trackData);
    const result = await this.getTrack(id);
    if (!result) throw new Error("Failed to create track");
    return result;
  }

  async updateTrack(id: string, updates: Partial<Track>): Promise<Track> {
    await db.update(tracks).set(updates).where(eq(tracks.id, id));
    const result = await this.getTrack(id);
    if (!result) throw new Error("Track not found");
    return result;
  }

  async deleteTrack(id: string): Promise<void> {
    await db.delete(tracks).where(eq(tracks.id, id));
  }

  async incrementPlayCount(id: string): Promise<void> {
    await db
      .update(tracks)
      .set({ playCount: sql`${tracks.playCount} + 1` })
      .where(eq(tracks.id, id));
  }

  // Playlist operations
  async getPlaylist(id: string): Promise<Playlist | undefined> {
    const result = await db
      .select()
      .from(playlists)
      .where(eq(playlists.id, id))
      .limit(1);
    return result[0];
  }

  async getPlaylistsByUser(userId: string): Promise<Playlist[]> {
    return db
      .select()
      .from(playlists)
      .where(eq(playlists.creatorId, userId))
      .orderBy(desc(playlists.createdAt));
  }

  async getPlaylistsByUserWithTrackFlag(userId: string, trackId: string) {
    const result = await db
      .select({
        ...getTableColumns(playlists),
        hasTrack: exists(
          db
            .select()
            .from(playlistTracks)
            .where(
              and(
                eq(playlistTracks.playlistId, playlists.id),
                eq(playlistTracks.trackId, trackId)
              )
            )
        ),
      })
      .from(playlists)
      .where(eq(playlists.creatorId, userId))
      .orderBy(desc(playlists.createdAt));

    return result;
  }

  async getPublicPlaylists(filters?: { search?: string }): Promise<Playlist[]> {
    const conditions = [eq(playlists.isPublic, true)] as any[];

    if (filters?.search) {
      conditions.push(
        or(
          ilike(playlists.name, `%${filters.search}%`),
          ilike(playlists.description, `%${filters.search}%`)
        )
      );
    }

    return db
      .select()
      .from(playlists)
      .where(and(...conditions))
      .orderBy(desc(playlists.createdAt))
      .limit(20);
  }

  async createPlaylist(insertPlaylist: InsertPlaylist): Promise<Playlist> {
    const id = randomUUID();
    const playlistData = { ...insertPlaylist, id };

    await db.insert(playlists).values(playlistData);
    const result = await this.getPlaylist(id);
    if (!result) throw new Error("Failed to create playlist");
    return result;
  }

  async updatePlaylist(
    id: string,
    updates: Partial<Playlist>
  ): Promise<Playlist> {
    await db.update(playlists).set(updates).where(eq(playlists.id, id));
    const result = await this.getPlaylist(id);
    if (!result) throw new Error("Playlist not found");
    return result;
  }

  async deletePlaylist(id: string): Promise<void> {
    await db.delete(playlists).where(eq(playlists.id, id));
  }

  async addTrackToPlaylist(
    playlistId: string,
    trackId: string,
    addedBy?: string
  ): Promise<void> {
    const id = randomUUID();

    // Get the next position for this playlist
    const lastTrack = await db
      .select({ position: playlistTracks.position })
      .from(playlistTracks)
      .where(eq(playlistTracks.playlistId, playlistId))
      .orderBy(desc(playlistTracks.position))
      .limit(1);

    const nextPosition = (lastTrack[0]?.position || 0) + 1;

    await db.insert(playlistTracks).values({
      id,
      playlistId,
      trackId,
      addedBy: addedBy || playlistId, // Use the provided user ID or fallback to playlist ID
      position: nextPosition,
    });

    // Update playlist track count
    await db
      .update(playlists)
      .set({ trackCount: sql`${playlists.trackCount} + 1` })
      .where(eq(playlists.id, playlistId));
  }

  async removeTrackFromPlaylist(
    playlistId: string,
    trackId: string
  ): Promise<void> {
    await db
      .delete(playlistTracks)
      .where(
        and(
          eq(playlistTracks.playlistId, playlistId),
          eq(playlistTracks.trackId, trackId)
        )
      );

    // Update playlist track count
    await db
      .update(playlists)
      .set({ trackCount: sql`${playlists.trackCount} - 1` })
      .where(eq(playlists.id, playlistId));
  }

  async getPlaylistTracks(playlistId: string, userId: string): Promise<any[]> {
    const result = await db
      .select({
        id: tracks.id,
        title: tracks.title,
        artistId: tracks.artistId,
        description: tracks.description,
        genre: tracks.genre,
        mood: tracks.mood,
        tags: tracks.tags,
        duration: tracks.duration,
        fileUrl: tracks.fileUrl,
        previewUrl: tracks.previewUrl,
        previewDuration: tracks.previewDuration,
        hasPreviewOnly: tracks.hasPreviewOnly,
        coverImage: tracks.coverImage,
        waveformData: tracks.waveformData,
        price: tracks.price,
        playCount: tracks.playCount,
        likesCount: tracks.likesCount,
        downloadCount: tracks.downloadCount,
        isExplicit: tracks.isExplicit,
        isPublic: tracks.isPublic,
        submitToRadio: tracks.submitToRadio,
        createdAt: tracks.createdAt,
        updatedAt: tracks.updatedAt,

        position: playlistTracks.position,

        hasAccess: sql<boolean>`
        CASE
          WHEN ${tracks.artistId} = ${userId} THEN TRUE
          WHEN ${tracks.hasPreviewOnly} = FALSE THEN TRUE
          WHEN ${purchasedTracks.id} IS NOT NULL THEN TRUE
          ELSE FALSE
        END
      `,
      })
      .from(playlistTracks)
      .innerJoin(tracks, eq(playlistTracks.trackId, tracks.id))
      .leftJoin(
        purchasedTracks,
        and(
          eq(purchasedTracks.trackId, tracks.id),
          eq(purchasedTracks.userId, userId ?? sql`NULL`)
        )
      )
      .where(eq(playlistTracks.playlistId, playlistId))
      .orderBy(asc(playlistTracks.position));

    return result;
  }

  // Social operations
  async followUser(followerId: string, followingId: string): Promise<void> {
    const id = randomUUID();
    await db.insert(follows).values({
      id,
      followerId,
      followingId,
    });
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      );
  }

  async getFollowers(userId: string): Promise<User[]> {
    const result = await db
      .select({ user: users })
      .from(follows)
      .innerJoin(users, eq(follows.followerId, users.id))
      .where(eq(follows.followingId, userId));

    return result.map((r) => r.user);
  }

  async getFollowing(userId: string): Promise<User[]> {
    const result = await db
      .select({ user: users })
      .from(follows)
      .innerJoin(users, eq(follows.followingId, users.id))
      .where(eq(follows.followerId, userId));

    return result.map((r) => r.user);
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const result = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      )
      .limit(1);

    return result.length > 0;
  }

  // Legacy message operations (keeping for compatibility but not used)
  async getMessages(userId1: string, userId2: string): Promise<Message[]> {
    // This method is deprecated - use conversation-based messaging instead
    return [];
  }

  async sendMessage(insertMessage: InsertMessage): Promise<Message> {
    // This method is deprecated - use sendConversationMessage instead
    const id = randomUUID();
    const messageData = { ...insertMessage, id };

    await db.insert(messages).values(messageData);
    const result = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id))
      .limit(1);
    if (!result[0]) throw new Error("Failed to create message");
    return result[0];
  }

  async markMessagesAsRead(
    conversationId: string,
    userId: string
  ): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true, readAt: new Date() })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          ne(messages.senderId, userId) // Mark messages from others as read
        )
      );
  }

  // Payment operations
  async createTip(insertTip: InsertTip): Promise<Tip> {
    const id = randomUUID();
    const tipData = { ...insertTip, id };

    await db.insert(tips).values(tipData);
    const result = await db.select().from(tips).where(eq(tips.id, id)).limit(1);
    if (!result[0]) throw new Error("Failed to create tip");
    return result[0];
  }

  async updateTipStatus(
    id: string,
    status: string,
    paymentIntentId?: string
  ): Promise<Tip> {
    const updates: any = { status };
    if (paymentIntentId) {
      updates.stripePaymentIntentId = paymentIntentId;
    }

    await db.update(tips).set(updates).where(eq(tips.id, id));
    const result = await db.select().from(tips).where(eq(tips.id, id)).limit(1);
    if (!result[0]) throw new Error("Tip not found");
    return result[0];
  }

  async getTipsByUser(userId: string): Promise<Tip[]> {
    return db
      .select()
      .from(tips)
      .where(or(eq(tips.fromUserId, userId), eq(tips.toUserId, userId)))
      .orderBy(desc(tips.createdAt));
  }

  // Radio operations
  async createRadioSession(
    insertSession: InsertRadioSession
  ): Promise<RadioSession> {
    // Check for overlapping
    if (
      insertSession.scheduledStart &&
      insertSession.scheduledEnd &&
      !(await isTimeSlotAvailable(
        insertSession.scheduledStart,
        insertSession.scheduledEnd
      ))
    ) {
      throw new Error("Time slot is already taken");
    }

    const id = randomUUID();
    const sessionData = { ...insertSession, id };

    await db.insert(radioSessions).values(sessionData);
    const result = await this.getRadioSession(id);
    if (!result) throw new Error("Failed to create radio session");
    return result;
  }

  async updateRadioSession(
    id: string,
    updates: Partial<RadioSession>
  ): Promise<RadioSession> {
    // Only check if both start and end are being updated
    if (updates.scheduledStart && updates.scheduledEnd) {
      const available = await isTimeSlotAvailable(
        updates.scheduledStart,
        updates.scheduledEnd,
        id // exclude self
      );
      log("available", available?.toString());
      log("scheduledStart", updates.scheduledStart.toString());
      log("scheduledEnd", updates.scheduledEnd.toString());
      if (!available) {
        throw new Error("Time slot is already taken");
      }
    }

    await db.update(radioSessions).set(updates).where(eq(radioSessions.id, id));
    const result = await this.getRadioSession(id);
    if (!result) throw new Error("Radio session not found");
    return result;
  }

  // Radio Sessions
  async goLive(sessionId: string) {
    const updated = await db
      .update(radioSessions)
      .set({
        isLive: true,
        actualStart: sql`NOW()`,
      })
      .where(eq(radioSessions.id, sessionId))
      .returning();

    return updated[0] ?? null;
  }

  async endSession(sessionId: string) {
    const updated = await db
      .update(radioSessions)
      .set({
        isLive: false,
        actualEnd: sql`NOW()`,
      })
      .where(eq(radioSessions.id, sessionId))
      .returning();

    return updated[0] ?? null;
  }

  async getActiveRadioSession(): Promise<
    | (RadioSession & {
        host: {
          id: string;
          username: string;
          profileImage: string | null;
          bio: string | null;
        } | null;
      })
    | undefined
  > {
    const result = await db
      .select({
        id: radioSessions.id,
        title: radioSessions.title,
        description: radioSessions.description,
        hostId: radioSessions.hostId,
        radioCoStreamId: radioSessions.radioCoStreamId,
        isLive: radioSessions.isLive,
        listenerCount: radioSessions.listenerCount,
        currentTrackId: radioSessions.currentTrackId,
        scheduledStart: radioSessions.scheduledStart,
        scheduledEnd: radioSessions.scheduledEnd,
        actualStart: radioSessions.actualStart,
        actualEnd: radioSessions.actualEnd,
        createdAt: radioSessions.createdAt,
        host: {
          id: users.id,
          username: users.username,
          profileImage: users.profileImage,
          bio: users.bio,
        },
      })
      .from(radioSessions)
      .leftJoin(users, eq(radioSessions.hostId, users.id))
      .where(eq(radioSessions.isLive, true))
      .orderBy(desc(radioSessions.actualStart))
      .limit(1);

    return result[0] ?? undefined;
  }

  async getAllRadioSessions(): Promise<RadioSession[]> {
    return db
      .select()
      .from(radioSessions)
      .orderBy(desc(radioSessions.actualStart));
  }

  async getRadioSession(id: string): Promise<RadioSession | undefined> {
    const result = await db
      .select()
      .from(radioSessions)
      .where(eq(radioSessions.id, id))
      .limit(1);
    return result[0];
  }

  // Radio Live Chats
  async getRadioChatMessages(
    sessionId: string,
    limit = 50
  ): Promise<RadioChatMessageWithUser[] | undefined> {
    return db
      .select({
        id: radioChat.id,
        sessionId: radioChat.sessionId,
        userId: radioChat.userId, // <-- add this
        message: radioChat.message,
        messageType: radioChat.messageType,
        createdAt: radioChat.createdAt,
        user: {
          id: users.id,
          username: users.username,
          role: users.role,
          profileImage: users.profileImage,
        },
      })
      .from(radioChat)
      .innerJoin(users, eq(users.id, radioChat.userId))
      .where(eq(radioChat.sessionId, sessionId))
      .orderBy(asc(radioChat.createdAt))
      .limit(limit);
  }

  // Collaboration operations
  async createCollaboration(
    insertCollab: InsertCollaboration
  ): Promise<Collaboration> {
    const id = randomUUID();
    const collabData = { ...insertCollab, id };

    await db.insert(collaborations).values(collabData);
    const result = await db
      .select()
      .from(collaborations)
      .where(eq(collaborations.id, id))
      .limit(1);
    if (!result[0]) throw new Error("Failed to create collaboration");
    return result[0];
  }

  async updateCollaborationStatus(
    id: string,
    status: "pending" | "accepted" | "rejected" | "completed"
  ): Promise<Collaboration> {
    await db
      .update(collaborations)
      .set({ status })
      .where(eq(collaborations.id, id));
    const result = await db
      .select()
      .from(collaborations)
      .where(eq(collaborations.id, id))
      .limit(1);
    if (!result[0]) throw new Error("Collaboration not found");
    return result[0];
  }

  async getCollaborationsByUser(userId: string): Promise<Collaboration[]> {
    return db
      .select()
      .from(collaborations)
      .where(
        or(
          eq(collaborations.requesterId, userId),
          eq(collaborations.targetId, userId)
        )
      )
      .orderBy(desc(collaborations.createdAt));
  }

  async getPendingCollaborations(userId: string): Promise<Collaboration[]> {
    return db
      .select()
      .from(collaborations)
      .where(
        and(
          eq(collaborations.targetId, userId),
          eq(collaborations.status, "pending")
        )
      )
      .orderBy(desc(collaborations.createdAt));
  }

  // Live Stream operations
  async createLiveStream(insertStream: InsertLiveStream): Promise<LiveStream> {
    const id = randomUUID();
    const streamKey = randomUUID(); // Generate unique stream key

    const streamData = {
      ...insertStream,
      id,
      streamKey,
      status: "scheduled" as const,
    };

    await db.insert(liveStreams).values(streamData);
    const result = await this.getLiveStream(id);
    if (!result) throw new Error("Failed to create live stream");
    return result;
  }

  async getLiveStream(id: string): Promise<LiveStream | undefined> {
    const result = await db
      .select()
      .from(liveStreams)
      .where(eq(liveStreams.id, id))
      .limit(1);
    return result[0];
  }

  async getLiveStreamsByArtist(artistId: string): Promise<LiveStream[]> {
    return db
      .select()
      .from(liveStreams)
      .where(eq(liveStreams.artistId, artistId))
      .orderBy(desc(liveStreams.createdAt));
  }

  async getActiveLiveStreams(): Promise<LiveStream[]> {
    return db
      .select()
      .from(liveStreams)
      .where(eq(liveStreams.status, "live"))
      .orderBy(desc(liveStreams.startedAt));
  }

  async updateLiveStream(
    id: string,
    updates: Partial<LiveStream>
  ): Promise<LiveStream> {
    await db.update(liveStreams).set(updates).where(eq(liveStreams.id, id));
    const result = await this.getLiveStream(id);
    if (!result) throw new Error("Live stream not found");
    return result;
  }

  async startLiveStream(id: string): Promise<LiveStream> {
    const updates = {
      status: "live" as const,
      startedAt: new Date(),
    };
    return this.updateLiveStream(id, updates);
  }

  async endLiveStream(id: string): Promise<LiveStream> {
    const updates = {
      status: "ended" as const,
      endedAt: new Date(),
      viewerCount: 0,
    };
    return this.updateLiveStream(id, updates);
  }

  async joinLiveStream(streamId: string, userId: string): Promise<void> {
    // Add viewer to live stream
    await db.insert(liveStreamViewers).values({
      id: randomUUID(),
      streamId,
      userId,
      joinedAt: new Date(),
    });

    // Update viewer count
    const currentViewers = await db
      .select({ count: count() })
      .from(liveStreamViewers)
      .where(
        and(
          eq(liveStreamViewers.streamId, streamId),
          sql`${liveStreamViewers.leftAt} IS NULL`
        )
      );

    const viewerCount = currentViewers[0]?.count || 0;
    await db
      .update(liveStreams)
      .set({ viewerCount })
      .where(eq(liveStreams.id, streamId));
  }

  async leaveLiveStream(streamId: string, userId: string): Promise<void> {
    // Update viewer left time
    await db
      .update(liveStreamViewers)
      .set({ leftAt: new Date() })
      .where(
        and(
          eq(liveStreamViewers.streamId, streamId),
          eq(liveStreamViewers.userId, userId),
          sql`${liveStreamViewers.leftAt} IS NULL`
        )
      );

    // Update viewer count
    const currentViewers = await db
      .select({ count: count() })
      .from(liveStreamViewers)
      .where(
        and(
          eq(liveStreamViewers.streamId, streamId),
          sql`${liveStreamViewers.leftAt} IS NULL`
        )
      );

    const viewerCount = currentViewers[0]?.count || 0;
    await db
      .update(liveStreams)
      .set({ viewerCount })
      .where(eq(liveStreams.id, streamId));
  }

  async getLiveStreamViewers(streamId: string): Promise<User[]> {
    const viewers = await db
      .select({
        user: users,
      })
      .from(liveStreamViewers)
      .innerJoin(users, eq(liveStreamViewers.userId, users.id))
      .where(
        and(
          eq(liveStreamViewers.streamId, streamId),
          sql`${liveStreamViewers.leftAt} IS NULL`
        )
      );

    return viewers.map((v) => v.user);
  }

  async addLiveStreamMessage(
    insertMessage: InsertLiveStreamMessage
  ): Promise<LiveStreamMessage> {
    const id = randomUUID();
    const messageData = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };

    await db.insert(liveStreamMessages).values(messageData);
    const result = await db
      .select()
      .from(liveStreamMessages)
      .where(eq(liveStreamMessages.id, id))
      .limit(1);
    if (!result[0]) throw new Error("Failed to create message");
    return result[0];
  }

  async getLiveStreamMessages(
    streamId: string,
    limit = 50
  ): Promise<LiveStreamMessage[]> {
    return db
      .select()
      .from(liveStreamMessages)
      .where(eq(liveStreamMessages.streamId, streamId))
      .orderBy(desc(liveStreamMessages.createdAt))
      .limit(limit);
  }

  // Conversation operations
  async getOrCreateConversation(
    participant1Id: string,
    participant2Id: string
  ): Promise<Conversation> {
    // Check if conversation already exists (check both participant orders)
    const existing = await db
      .select()
      .from(conversations)
      .where(
        or(
          and(
            eq(conversations.participant1Id, participant1Id),
            eq(conversations.participant2Id, participant2Id)
          ),
          and(
            eq(conversations.participant1Id, participant2Id),
            eq(conversations.participant2Id, participant1Id)
          )
        )
      )
      .limit(1);

    if (existing[0]) {
      return existing[0];
    }

    // Create new conversation
    const id = randomUUID();
    const conversationData = {
      id,
      participant1Id,
      participant2Id,
    };

    await db.insert(conversations).values(conversationData);
    const result = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, id))
      .limit(1);
    if (!result[0]) throw new Error("Failed to create conversation");
    return result[0];
  }

  async getConversations(userId: string): Promise<any[]> {
    const rawConversations = await db
      .select()
      .from(conversations)
      .where(
        or(
          eq(conversations.participant1Id, userId),
          eq(conversations.participant2Id, userId)
        )
      )
      .orderBy(desc(conversations.lastMessageAt));

    // For each conversation, get the other participant's details
    const conversationsWithParticipants = await Promise.all(
      rawConversations.map(async (conversation) => {
        const participant1 = await this.getUser(conversation.participant1Id);
        const participant2 = await this.getUser(conversation.participant2Id);

        return {
          ...conversation,
          participant1,
          participant2,
        };
      })
    );

    return conversationsWithParticipants;
  }

  async getConversationMessages(
    conversationId: string,
    limit = 50
  ): Promise<Message[]> {
    return db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt))
      .limit(limit);
  }

  async sendConversationMessage(
    insertMessage: InsertMessage
  ): Promise<Message> {
    const id = randomUUID();
    const messageData = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };

    await db.insert(messages).values(messageData);

    // Update conversation's last message info
    await db
      .update(conversations)
      .set({
        lastMessageId: id,
        lastMessageAt: new Date(),
      })
      .where(eq(conversations.id, insertMessage.conversationId));

    const result = await db
      .select()
      .from(messages)
      .where(eq(messages.id, id))
      .limit(1);
    if (!result[0]) throw new Error("Failed to create message");
    return result[0];
  }

  // Notification operations
  async createNotification(
    insertNotification: InsertNotification
  ): Promise<Notification> {
    const id = randomUUID();
    const notificationData = {
      ...insertNotification,
      id,
      createdAt: new Date(),
    };

    await db.insert(notifications).values(notificationData);
    const result = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id))
      .limit(1);
    if (!result[0]) throw new Error("Failed to create notification");
    return result[0];
  }

  async getUserNotifications(
    userId: string,
    limit = 50
  ): Promise<Notification[]> {
    const results = await db
      .select({
        notification: notifications,
        actor: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImage: users.profileImage,
          emailVerified: users.emailVerified,
        },
      })
      .from(notifications)
      .innerJoin(users, eq(notifications.actorId, users.id))
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    return results.map((r) => ({
      ...r.notification,
      actor: r.actor,
    })) as any[];
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(notifications)
      .where(
        and(eq(notifications.userId, userId), eq(notifications.isRead, false))
      );

    return result[0]?.count || 0;
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(eq(notifications.id, notificationId));
  }

  async markAllNotificationsAsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
      })
      .where(
        and(eq(notifications.userId, userId), eq(notifications.isRead, false))
      );
  }

  async notifyFollowers(artistId: string, message: string): Promise<void> {
    // Get all followers of the artist
    const followers = await db
      .select({ followerId: follows.followerId })
      .from(follows)
      .where(eq(follows.followingId, artistId));

    // In a real implementation, this would send push notifications, emails, etc.
    // For now, we'll just log the notification
    console.log(
      `Notifying ${followers.length} followers of artist ${artistId}: ${message}`
    );
  }

  async searchUsers(query: string): Promise<any[]> {
    try {
      console.log("Executing search query for:", query);
      const results = await db
        .select({
          id: users.id,
          username: users.username,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          profileImage: users.profileImage,
          emailVerified: users.emailVerified,
        })
        .from(users)
        .where(
          or(
            like(users.username, `%${query}%`),
            like(users.firstName, `%${query}%`),
            like(users.lastName, `%${query}%`)
          )
        )
        .limit(10);

      console.log("Search results from DB:", results);
      return results;
    } catch (error) {
      console.error("Search users error:", error);
      throw error;
    }
  }

  // Mixxlist/Fan operations
  async getUserMixxlists(userId: string): Promise<any[]> {
    return await db
      .select()
      .from(playlists)
      .where(
        and(
          eq(playlists.creatorId, userId),
          or(eq(playlists.type, "mixxlist"), sql`${playlists.type} IS NULL`)
        )
      )
      .orderBy(desc(playlists.createdAt));
  }

  async getUserPurchasedTracks(userId: string): Promise<any[]> {
    return await db
      .select({
        id: purchasedTracks.id,
        price: purchasedTracks.price,
        purchasedAt: purchasedTracks.purchasedAt,
        track: {
          id: tracks.id,
          title: tracks.title,
          artistId: tracks.artistId,
          genre: tracks.genre,
          duration: tracks.duration,
          fileUrl: tracks.fileUrl,
          coverImage: tracks.coverImage,
          price: tracks.price,
        },
      })
      .from(purchasedTracks)
      .leftJoin(tracks, eq(purchasedTracks.trackId, tracks.id))
      .where(eq(purchasedTracks.userId, userId))
      .orderBy(desc(purchasedTracks.purchasedAt));
  }

  async getPurchasedTracksByUser(userId: string): Promise<TrackExtended[]> {
    const result = await db
      .select({
        id: tracks.id,
        title: tracks.title,
        description: tracks.description,
        artistId: tracks.artistId,
        artistName: users.username,
        genre: tracks.genre,
        duration: tracks.duration,
        fileUrl: tracks.fileUrl,
        previewUrl: tracks.previewUrl,
        previewDuration: tracks.previewDuration,
        hasPreviewOnly: tracks.hasPreviewOnly,
        coverImage: tracks.coverImage,
        price: tracks.price,
        isPublic: tracks.isPublic,
        isExplicit: tracks.isExplicit,
        submitToRadio: tracks.submitToRadio,
        playCount: tracks.playCount,
        likesCount: tracks.likesCount,
        createdAt: tracks.createdAt,
        updatedAt: tracks.updatedAt,
        mood: tracks.mood,
        tags: tracks.tags,
        waveformData: tracks.waveformData,
        stripePriceId: tracks.stripePriceId,
        downloadCount: tracks.downloadCount,
        hasAccess: sql<boolean>`TRUE`.as("hasAccess"), // always true if purchased
      })
      .from(purchasedTracks)
      .innerJoin(tracks, eq(purchasedTracks.trackId, tracks.id))
      .innerJoin(users, eq(tracks.artistId, users.id))
      .where(eq(purchasedTracks.userId, userId))
      .orderBy(desc(purchasedTracks.purchasedAt));

    return result;
  }

  async getUserFavoriteArtists(userId: string): Promise<any[]> {
    // Get artists that the user follows
    const followingUserTable = users;
    return await db
      .select({
        id: followingUserTable.id,
        username: followingUserTable.username,
        firstName: followingUserTable.firstName,
        lastName: followingUserTable.lastName,
        role: followingUserTable.role,
        bio: followingUserTable.bio,
        profileImage: followingUserTable.profileImage,
        emailVerified: followingUserTable.emailVerified,
      })
      .from(follows)
      .leftJoin(
        followingUserTable,
        eq(follows.followingId, followingUserTable.id)
      )
      .where(
        and(
          eq(follows.followerId, userId),
          eq(followingUserTable.role, "artist")
        )
      )
      .orderBy(desc(follows.createdAt));
  }

  async getUserTrackPurchase(
    userId: string,
    trackId: string
  ): Promise<any | null> {
    const [purchase] = await db
      .select()
      .from(purchasedTracks)
      .where(
        and(
          eq(purchasedTracks.userId, userId),
          eq(purchasedTracks.trackId, trackId)
        )
      );
    return purchase || null;
  }

  async recordTrackPurchase(purchaseData: InsertPurchasedTrack): Promise<any> {
    const id = randomUUID();
    const data = { ...purchaseData, id };
    const [purchase] = await db
      .insert(purchasedTracks)
      .values(data)
      .returning();
    return purchase;
  }

  async hasTrackAccess(userId: string, trackId: string): Promise<boolean> {
    try {
      // Get track info
      const track = await this.getTrack(trackId);
      if (!track) return false;

      // Artist always has access to their own tracks
      if (track.artistId === userId) return true;

      // If track doesn't have preview-only mode, everyone has access
      if (!track.hasPreviewOnly) return true;

      // Check if user has purchased the track
      const purchase = await this.getUserTrackPurchase(userId, trackId);
      return !!purchase;
    } catch (error) {
      console.error("Error checking track access:", error);
      return false;
    }
  }

  // ✅ Update purchased track by Stripe PaymentIntent ID
  async updatePurchasedTrackByIntentId(
    intentId: string,
    updates: Partial<{
      paymentStatus: "pending" | "succeeded" | "failed" | "refunded";
      stripeTransferId: string | null;
      purchasedAt: Date | null;
    }>
  ): Promise<any | null> {
    const [purchase] = await db
      .update(purchasedTracks)
      .set({
        ...(updates.paymentStatus && { paymentStatus: updates.paymentStatus }),
        ...(updates.stripeTransferId !== undefined && {
          stripeTransferId: updates.stripeTransferId,
        }),
        ...(updates.purchasedAt && { purchasedAt: updates.purchasedAt }),
      })
      .where(eq(purchasedTracks.stripePaymentIntentId, intentId))
      .returning();

    return purchase || null;
  }

  // Email verification operations
  async createEmailVerificationToken(
    token: InsertEmailVerificationToken
  ): Promise<EmailVerificationToken> {
    const [newToken] = await db
      .insert(emailVerificationTokens)
      .values(token)
      .returning();
    return newToken;
  }

  async getEmailVerificationToken(
    token: string
  ): Promise<EmailVerificationToken | undefined> {
    const [verificationToken] = await db
      .select()
      .from(emailVerificationTokens)
      .where(eq(emailVerificationTokens.token, token));
    return verificationToken;
  }

  async deleteEmailVerificationToken(token: string): Promise<void> {
    await db
      .delete(emailVerificationTokens)
      .where(eq(emailVerificationTokens.token, token));
  }

  async markEmailAsVerified(userId: string): Promise<void> {
    await db
      .update(users)
      .set({
        emailVerified: true,
        emailVerifiedAt: new Date(),
      })
      .where(eq(users.id, userId));
  }

  // Admin statistics
  async getAdminStats(): Promise<any> {
    const [userStats] = await db
      .select({
        total: sql<number>`COUNT(*)`,
        artists: sql<number>`COUNT(CASE WHEN role = 'artist' THEN 1 END)`,
        fans: sql<number>`COUNT(CASE WHEN role = 'fan' THEN 1 END)`,
        subscribed: sql<number>`COUNT(CASE WHEN stripe_customer_id IS NOT NULL THEN 1 END)`,
      })
      .from(users);

    const [featuredStats] = await db
      .select({
        active: sql<number>`COUNT(CASE WHEN status = 'active' THEN 1 END)`,
        total: sql<number>`COUNT(*)`,
      })
      .from(featuredSpots);

    const [broadcastStats] = await db
      .select({
        total: sql<number>`COUNT(*)`,
      })
      .from(adminBroadcasts);

    return {
      users: userStats,
      featuredSpots: featuredStats || { active: 0, total: 0 },
      broadcasts: broadcastStats || { total: 0 },
    };
  }

  // Admin operations - Featured Spots
  async getFeaturedSpots(status?: string): Promise<any[]> {
    let baseQuery = db
      .select({
        id: featuredSpots.id,
        artistId: featuredSpots.artistId,
        title: featuredSpots.title,
        description: featuredSpots.description,
        imageUrl: featuredSpots.imageUrl,
        videoUrl: featuredSpots.videoUrl,
        buttonText: featuredSpots.buttonText,
        buttonUrl: featuredSpots.buttonUrl,
        priceUSD: featuredSpots.priceUSD,
        startDate: featuredSpots.startDate,
        endDate: featuredSpots.endDate,
        status: featuredSpots.status,
        sortOrder: featuredSpots.sortOrder,
        createdAt: featuredSpots.createdAt,
        artist: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImage: users.profileImage,
        },
      })
      .from(featuredSpots)
      .leftJoin(users, eq(featuredSpots.artistId, users.id));

    if (status) {
      return await baseQuery
        .where(
          eq(
            featuredSpots.status,
            status as "pending" | "cancelled" | "active" | "expired"
          )
        )
        .orderBy(featuredSpots.sortOrder, featuredSpots.createdAt);
    } else {
      return await baseQuery.orderBy(
        featuredSpots.sortOrder,
        featuredSpots.createdAt
      );
    }
  }

  async getFeaturedSpot(id: string): Promise<any | null> {
    const [spot] = await db
      .select({
        id: featuredSpots.id,
        artistId: featuredSpots.artistId,
        title: featuredSpots.title,
        description: featuredSpots.description,
        imageUrl: featuredSpots.imageUrl,
        videoUrl: featuredSpots.videoUrl,
        buttonText: featuredSpots.buttonText,
        buttonUrl: featuredSpots.buttonUrl,
        priceUSD: featuredSpots.priceUSD,
        startDate: featuredSpots.startDate,
        endDate: featuredSpots.endDate,
        status: featuredSpots.status,
        sortOrder: featuredSpots.sortOrder,
        createdAt: featuredSpots.createdAt,
        artist: {
          id: users.id,
          username: users.username,
          firstName: users.firstName,
          lastName: users.lastName,
          profileImage: users.profileImage,
        },
      })
      .from(featuredSpots)
      .leftJoin(users, eq(featuredSpots.artistId, users.id))
      .where(eq(featuredSpots.id, id))
      .limit(1);

    return spot || null;
  }

  async createFeaturedSpot(spot: any): Promise<any> {
    const id = randomUUID();
    const spotData = { ...spot, id, status: "active" };
    const [newSpot] = await db
      .insert(featuredSpots)
      .values(spotData)
      .returning();
    return await this.getFeaturedSpot(newSpot.id);
  }

  async updateFeaturedSpot(id: string, updates: any): Promise<any> {
    await db.update(featuredSpots).set(updates).where(eq(featuredSpots.id, id));
    return await this.getFeaturedSpot(id);
  }

  async deleteFeaturedSpot(id: string): Promise<void> {
    await db.delete(featuredSpots).where(eq(featuredSpots.id, id));
  }

  // Admin operations - Broadcasts
  async getAdminBroadcasts(status?: string): Promise<any[]> {
    let query = db.select().from(adminBroadcasts);
    if (status) {
      return await query
        .where(
          eq(
            adminBroadcasts.status,
            status as "failed" | "scheduled" | "draft" | "sent"
          )
        )
        .orderBy(desc(adminBroadcasts.createdAt));
    }
    return await query.orderBy(desc(adminBroadcasts.createdAt));
  }

  async getAdminBroadcast(id: string): Promise<AdminBroadcast | undefined> {
    const [broadcast] = await db
      .select()
      .from(adminBroadcasts)
      .where(eq(adminBroadcasts.id, id))
      .limit(1);
    return broadcast || null;
  }

  async createAdminBroadcast(broadcast: any): Promise<any> {
    const id = randomUUID();
    const broadcastData = { ...broadcast, id };
    const [newBroadcast] = await db
      .insert(adminBroadcasts)
      .values(broadcastData)
      .returning();
    return newBroadcast;
  }

  async updateAdminBroadcast(id: string, updates: any): Promise<any> {
    await db
      .update(adminBroadcasts)
      .set(updates)
      .where(eq(adminBroadcasts.id, id));
    return await this.getAdminBroadcast(id);
  }

  async deleteAdminBroadcast(id: string): Promise<void> {
    await db.delete(adminBroadcasts).where(eq(adminBroadcasts.id, id));
  }

  async getUsersByRole(role: string): Promise<any[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.role, role as "fan" | "artist" | "admin"));
  }

  async getSubscribedUsers(): Promise<any[]> {
    return await db
      .select()
      .from(users)
      .where(eq(users.subscriptionStatus, "active"));
  }

  async getActiveFeaturedSpots(): Promise<any[]> {
    return await this.getFeaturedSpots("active");
  }

  async createBroadcastRecipient(recipient: any): Promise<any> {
    const id = randomUUID();
    const recipientData = { ...recipient, id };
    const [newRecipient] = await db
      .insert(broadcastRecipients)
      .values(recipientData)
      .returning();
    return newRecipient;
  }

  async updateBroadcastRecipient(id: string, updates: any): Promise<any> {
    await db
      .update(broadcastRecipients)
      .set(updates)
      .where(eq(broadcastRecipients.id, id));
    const [recipient] = await db
      .select()
      .from(broadcastRecipients)
      .where(eq(broadcastRecipients.id, id))
      .limit(1);
    return recipient;
  }

  async getBroadcastRecipients(broadcastId: string): Promise<any[]> {
    return await db
      .select()
      .from(broadcastRecipients)
      .where(eq(broadcastRecipients.broadcastId, broadcastId));
  }

  // Discount code operations
  async createDiscountCode(
    insertCode: InsertDiscountCode
  ): Promise<DiscountCode> {
    const id = randomUUID();
    const codeData = {
      ...insertCode,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.insert(discountCodes).values(codeData);
    const result = await db
      .select()
      .from(discountCodes)
      .where(eq(discountCodes.id, id))
      .limit(1);
    if (!result[0]) throw new Error("Failed to create discount code");
    return result[0];
  }

  async getDiscountCodes(): Promise<DiscountCode[]> {
    return db
      .select()
      .from(discountCodes)
      .orderBy(desc(discountCodes.createdAt));
  }

  async getDiscountCodeById(id: string): Promise<DiscountCode | undefined> {
    const result = await db
      .select()
      .from(discountCodes)
      .where(eq(discountCodes.id, id))
      .limit(1);
    return result[0];
  }

  async getDiscountCodeByCode(code: string): Promise<DiscountCode | undefined> {
    const result = await db
      .select()
      .from(discountCodes)
      .where(eq(discountCodes.code, code))
      .limit(1);
    return result[0];
  }

  async updateDiscountCode(
    id: string,
    updates: Partial<DiscountCode>
  ): Promise<DiscountCode> {
    const updateData = { ...updates, updatedAt: new Date() };
    await db
      .update(discountCodes)
      .set(updateData)
      .where(eq(discountCodes.id, id));

    const result = await db
      .select()
      .from(discountCodes)
      .where(eq(discountCodes.id, id))
      .limit(1);
    if (!result[0]) throw new Error("Discount code not found");
    return result[0];
  }

  async deleteDiscountCode(id: string): Promise<void> {
    await db.delete(discountCodes).where(eq(discountCodes.id, id));
  }

  async useDiscountCode(
    codeId: string,
    userId: string,
    orderId: string,
    discountAmount: number,
    originalAmount?: number
  ): Promise<DiscountCodeUsage> {
    const id = randomUUID();
    const usageData = {
      id,
      codeId,
      userId,
      orderId,
      discountAmount: discountAmount.toString(),
      originalAmount: originalAmount?.toString() || null,
      usedAt: new Date(),
    };

    await db.insert(discountCodeUsage).values(usageData);

    // Increment used count
    await db
      .update(discountCodes)
      .set({ usedCount: sql`used_count + 1` })
      .where(eq(discountCodes.id, codeId));

    const result = await db
      .select()
      .from(discountCodeUsage)
      .where(eq(discountCodeUsage.id, id))
      .limit(1);
    if (!result[0]) throw new Error("Failed to record discount code usage");
    return result[0];
  }

  async getDiscountCodeUsage(codeId: string): Promise<DiscountCodeUsage[]> {
    return db
      .select()
      .from(discountCodeUsage)
      .where(eq(discountCodeUsage.codeId, codeId))
      .orderBy(desc(discountCodeUsage.usedAt));
  }

  async validateDiscountCode(
    code: string,
    userId: string,
    role?: string
  ): Promise<{ valid: boolean; discount?: DiscountCode; reason?: string }> {
    const discountCode = await this.getDiscountCodeByCode(code);

    if (!discountCode) {
      return { valid: false, reason: "Invalid discount code" };
    }

    if (discountCode.status !== "active") {
      return { valid: false, reason: "Discount code is inactive" };
    }

    const now = new Date();
    if (now < new Date(discountCode.validFrom)) {
      return { valid: false, reason: "Discount code not yet valid" };
    }

    if (discountCode.validUntil && now > new Date(discountCode.validUntil)) {
      return { valid: false, reason: "Discount code has expired" };
    }

    if (
      discountCode.maxUses &&
      (discountCode.usedCount || 0) >= discountCode.maxUses
    ) {
      return { valid: false, reason: "Discount code usage limit reached" };
    }

    // Check if code is applicable to user's role
    if (discountCode.applicableRoles) {
      const applicableRoles = Array.isArray(discountCode.applicableRoles)
        ? discountCode.applicableRoles
        : JSON.parse(discountCode.applicableRoles as string);

      if (role && !applicableRoles.includes(role)) {
        return {
          valid: false,
          reason: "Discount code not applicable to your account type",
        };
      }
    }

    // Check if user has already used this code (for single-use codes)
    const existingUsage = await db
      .select()
      .from(discountCodeUsage)
      .where(
        and(
          eq(discountCodeUsage.codeId, discountCode.id),
          eq(discountCodeUsage.userId, userId)
        )
      )
      .limit(1);

    if (existingUsage[0] && discountCode.type === "free_subscription") {
      return {
        valid: false,
        reason: "You have already used this discount code",
      };
    }

    return { valid: true, discount: discountCode };
  }

  async getAllMyBanners(userId: string) {
    return db
      .select()
      .from(banners)
      .where(and(eq(banners.createdBy, userId), isNull(banners.deletedAt)));
  }

  async getMyBannerById(userId: string, bannerId: string) {
    const [banner] = await db
      .select()
      .from(banners)
      .where(
        and(
          eq(banners.createdBy, userId),
          eq(banners.id, bannerId),
          isNull(banners.deletedAt)
        )
      );

    return banner;
  }

  async getAllBanners() {
    return db
      .select()
      .from(banners)
      .where(and(eq(banners.active, true), isNull(banners.deletedAt)));
  }
  async createBanner(data: InsertBanner) {
    const [banner] = await db.insert(banners).values(data).returning();
    return banner;
  }

  async updateBanner(id: string, updates: Partial<InsertBanner>) {
    const [banner] = await db
      .update(banners)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(banners.id, id))
      .returning();
    return banner;
  }

  async deleteBanner(id: string): Promise<void> {
    await db
      .update(banners)
      .set({ deletedAt: new Date() })
      .where(eq(banners.id, id));
  }
}

export const storage = new MySQLStorage();
