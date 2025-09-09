var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  adminBroadcasts: () => adminBroadcasts,
  badgeTypeEnum: () => badgeTypeEnum,
  badges: () => badges,
  banners: () => banners,
  broadcastRecipients: () => broadcastRecipients,
  broadcastStatusEnum: () => broadcastStatusEnum,
  broadcastTypeEnum: () => broadcastTypeEnum,
  collaborationStatusEnum: () => collaborationStatusEnum,
  collaborationTypeEnum: () => collaborationTypeEnum,
  collaborations: () => collaborations,
  conversations: () => conversations,
  currencyEnum: () => currencyEnum,
  discountCodeStatusEnum: () => discountCodeStatusEnum,
  discountCodeTypeEnum: () => discountCodeTypeEnum,
  discountCodeUsage: () => discountCodeUsage,
  discountCodes: () => discountCodes,
  emailVerificationTokens: () => emailVerificationTokens,
  featuredSpotStatusEnum: () => featuredSpotStatusEnum,
  featuredSpots: () => featuredSpots,
  follows: () => follows,
  insertAdminBroadcastSchema: () => insertAdminBroadcastSchema,
  insertBannerSchema: () => insertBannerSchema,
  insertBroadcastRecipientSchema: () => insertBroadcastRecipientSchema,
  insertCollaborationSchema: () => insertCollaborationSchema,
  insertConversationSchema: () => insertConversationSchema,
  insertDiscountCodeSchema: () => insertDiscountCodeSchema,
  insertDiscountCodeUsageSchema: () => insertDiscountCodeUsageSchema,
  insertEmailVerificationTokenSchema: () => insertEmailVerificationTokenSchema,
  insertFeaturedSpotSchema: () => insertFeaturedSpotSchema,
  insertFollowerSchema: () => insertFollowerSchema,
  insertLiveStreamMessageSchema: () => insertLiveStreamMessageSchema,
  insertLiveStreamSchema: () => insertLiveStreamSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertNotificationSchema: () => insertNotificationSchema,
  insertPlaylistSchema: () => insertPlaylistSchema,
  insertPurchasedTrackSchema: () => insertPurchasedTrackSchema,
  insertRadioSessionSchema: () => insertRadioSessionSchema,
  insertTipSchema: () => insertTipSchema,
  insertTrackSchema: () => insertTrackSchema,
  insertUserSchema: () => insertUserSchema,
  liveStreamMessages: () => liveStreamMessages,
  liveStreamStatusEnum: () => liveStreamStatusEnum,
  liveStreamViewers: () => liveStreamViewers,
  liveStreams: () => liveStreams,
  messageTypeEnum: () => messageTypeEnum,
  messages: () => messages,
  notificationTypeEnum: () => notificationTypeEnum,
  notifications: () => notifications,
  passwordResets: () => passwordResets,
  paymentStatusEnum: () => paymentStatusEnum,
  playlistTracks: () => playlistTracks,
  playlists: () => playlists,
  purchasedTracks: () => purchasedTracks,
  radioChat: () => radioChat,
  radioChatMessageTypeEnum: () => radioChatMessageTypeEnum,
  radioSessions: () => radioSessions,
  roleEnum: () => roleEnum,
  statusEnum: () => statusEnum,
  subscriptionStatusEnum: () => subscriptionStatusEnum,
  tips: () => tips,
  tracks: () => tracks,
  updateRadioSessionSchema: () => updateRadioSessionSchema,
  userBadges: () => userBadges,
  users: () => users
});
import { sql } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  decimal,
  json,
  pgEnum,
  index,
  uuid,
  bigint
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var roleEnum, messageTypeEnum, statusEnum, collaborationStatusEnum, collaborationTypeEnum, badgeTypeEnum, liveStreamStatusEnum, featuredSpotStatusEnum, broadcastTypeEnum, broadcastStatusEnum, discountCodeTypeEnum, discountCodeStatusEnum, currencyEnum, paymentStatusEnum, emailVerificationTokens, subscriptionStatusEnum, passwordResets, users, playlists, playlistTracks, follows, tracks, purchasedTracks, tips, radioSessions, radioChatMessageTypeEnum, radioChat, collaborations, badges, userBadges, liveStreams, liveStreamViewers, liveStreamMessages, conversations, messages, banners, insertBannerSchema, insertUserSchema, insertTrackSchema, insertPlaylistSchema, insertMessageSchema, insertTipSchema, insertRadioSessionSchema, updateRadioSessionSchema, insertCollaborationSchema, insertLiveStreamSchema, insertLiveStreamMessageSchema, insertFollowerSchema, insertConversationSchema, notificationTypeEnum, notifications, insertNotificationSchema, insertPurchasedTrackSchema, insertEmailVerificationTokenSchema, featuredSpots, adminBroadcasts, broadcastRecipients, discountCodes, discountCodeUsage, insertFeaturedSpotSchema, insertAdminBroadcastSchema, insertBroadcastRecipientSchema, insertDiscountCodeSchema, insertDiscountCodeUsageSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    roleEnum = pgEnum("role", ["fan", "artist", "admin", "DJ"]);
    messageTypeEnum = pgEnum("message_type", [
      "text",
      "track",
      "collaboration"
    ]);
    statusEnum = pgEnum("status", ["pending", "completed", "failed"]);
    collaborationStatusEnum = pgEnum("collaboration_status", [
      "pending",
      "accepted",
      "rejected",
      "completed"
    ]);
    collaborationTypeEnum = pgEnum("collaboration_type", [
      "remix",
      "feature",
      "production",
      "songwriting"
    ]);
    badgeTypeEnum = pgEnum("badge_type", [
      "achievement",
      "milestone",
      "special"
    ]);
    liveStreamStatusEnum = pgEnum("live_stream_status", [
      "scheduled",
      "live",
      "ended",
      "cancelled"
    ]);
    featuredSpotStatusEnum = pgEnum("featured_spot_status", [
      "active",
      "pending",
      "expired",
      "cancelled"
    ]);
    broadcastTypeEnum = pgEnum("broadcast_type", [
      "notification",
      "email",
      "both"
    ]);
    broadcastStatusEnum = pgEnum("broadcast_status", [
      "draft",
      "scheduled",
      "sent",
      "failed"
    ]);
    discountCodeTypeEnum = pgEnum("discount_code_type", [
      "free_subscription",
      "percentage_off",
      "fixed_amount"
    ]);
    discountCodeStatusEnum = pgEnum("discount_code_status", [
      "active",
      "inactive",
      "expired",
      "used_up"
    ]);
    currencyEnum = pgEnum("currency", [
      "GBP",
      "USD",
      "EUR",
      "CAD",
      "AUD",
      "JPY",
      "CHF",
      "SEK",
      "NOK",
      "DKK",
      "INR",
      "BRL",
      "MXN",
      "KRW",
      "SGD",
      "NZD",
      "ZAR",
      "RUB",
      "CNY",
      "HKD"
    ]);
    paymentStatusEnum = pgEnum("payment_status", [
      "pending",
      "succeeded",
      "failed",
      "refunded"
    ]);
    emailVerificationTokens = pgTable(
      "email_verification_tokens",
      {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id").notNull(),
        token: varchar("token", { length: 255 }).notNull().unique(),
        expiresAt: timestamp("expires_at").notNull(),
        createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
      },
      (table) => ({
        userIdx: index("email_verification_tokens_user_idx").on(table.userId),
        tokenIdx: index("email_verification_tokens_token_idx").on(table.token)
      })
    );
    subscriptionStatusEnum = pgEnum("subscription_status_enum", [
      "incomplete",
      "incomplete_expired",
      "trialing",
      "active",
      "past_due",
      "canceled",
      "unpaid",
      "paused"
    ]);
    passwordResets = pgTable("password_resets", {
      id: uuid("id").primaryKey().defaultRandom(),
      userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
      token: text("token").notNull(),
      // hashed token
      expiresAt: bigint("expires_at", { mode: "number" }).notNull()
    });
    users = pgTable(
      "users",
      {
        id: uuid("id").primaryKey().defaultRandom(),
        email: varchar("email", { length: 255 }).notNull().unique(),
        username: varchar("username", { length: 50 }).notNull().unique(),
        password: text("password").notNull(),
        firstName: varchar("first_name", { length: 100 }),
        lastName: varchar("last_name", { length: 100 }),
        role: roleEnum("role").notNull().default("fan"),
        bio: text("bio"),
        profileImage: varchar("profile_image", { length: 500 }),
        backgroundImage: varchar("background_image", { length: 500 }),
        location: varchar("location", { length: 255 }),
        website: varchar("website", { length: 500 }),
        socialMedia: json("social_media"),
        emailVerified: boolean("email_verified").default(false),
        emailVerifiedAt: timestamp("email_verified_at"),
        isActive: boolean("is_active").default(true),
        stripeCustomerId: varchar("stripe_customer_id", { length: 100 }),
        stripeSubscriptionId: varchar("stripe_subscription_id", { length: 100 }),
        subscriptionStatus: subscriptionStatusEnum("subscription_status").default(
          "incomplete"
        ),
        trialEndsAt: timestamp("trial_ends_at"),
        hasUsedTrial: boolean("has_used_trial").default(false),
        onboardingComplete: boolean("onboarding_complete").default(false),
        preferredCurrency: currencyEnum("preferred_currency").default("GBP"),
        // NEW: Stripe Connect Account for payouts
        stripeAccountId: varchar("stripe_account_id", { length: 100 }),
        createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
        updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
      },
      (table) => ({
        emailIdx: index("email_idx").on(table.email),
        usernameIdx: index("username_idx").on(table.username),
        roleIdx: index("role_idx").on(table.role)
      })
    );
    playlists = pgTable(
      "playlists",
      {
        id: uuid("id").primaryKey().defaultRandom(),
        name: varchar("name", { length: 255 }).notNull(),
        description: text("description"),
        creatorId: uuid("creator_id").notNull(),
        isPublic: boolean("is_public").default(true),
        coverImage: varchar("cover_image", { length: 500 }),
        trackCount: integer("track_count").default(0),
        totalDuration: integer("total_duration").default(0),
        // in seconds
        type: varchar("type", { length: 50 }).default("playlist"),
        // "playlist" or "mixxlist"
        createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
        updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
      },
      (table) => ({
        creatorIdx: index("playlists_creator_idx").on(table.creatorId),
        publicIdx: index("playlists_public_idx").on(table.isPublic),
        typeIdx: index("playlists_type_idx").on(table.type)
      })
    );
    playlistTracks = pgTable(
      "playlist_tracks",
      {
        id: uuid("id").primaryKey().defaultRandom(),
        playlistId: uuid("playlist_id").notNull(),
        trackId: uuid("track_id").notNull(),
        addedBy: uuid("added_by").notNull(),
        sortOrder: integer("sort_order").default(0),
        position: integer("position").notNull(),
        addedAt: timestamp("added_at").default(sql`CURRENT_TIMESTAMP`)
      },
      (table) => ({
        playlistIdx: index("playlist_tracks_playlist_idx").on(table.playlistId),
        trackIdx: index("playlist_tracks_track_idx").on(table.trackId)
      })
    );
    follows = pgTable(
      "follows",
      {
        id: uuid("id").primaryKey().defaultRandom(),
        followerId: uuid("follower_id").notNull(),
        followingId: uuid("following_id").notNull(),
        createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
      },
      (table) => ({
        followerIdx: index("follows_follower_idx").on(table.followerId),
        followingIdx: index("follows_following_idx").on(table.followingId)
      })
    );
    tracks = pgTable(
      "tracks",
      {
        id: uuid("id").primaryKey().defaultRandom(),
        title: varchar("title", { length: 255 }).notNull(),
        artistId: uuid("artist_id").notNull(),
        description: text("description"),
        genre: varchar("genre", { length: 100 }),
        mood: varchar("mood", { length: 100 }),
        tags: json("tags"),
        duration: integer("duration"),
        // in seconds
        fileUrl: varchar("file_url", { length: 500 }).notNull(),
        previewUrl: varchar("preview_url", { length: 500 }),
        // 30-second preview file
        previewDuration: integer("preview_duration").default(30),
        // preview length in seconds
        hasPreviewOnly: boolean("has_preview_only").default(false),
        // if true, only preview available until purchased
        waveformData: json("waveform_data"),
        coverImage: varchar("cover_image", { length: 500 }),
        price: decimal("price", { precision: 10, scale: 2 }),
        isPublic: boolean("is_public").default(true),
        isExplicit: boolean("is_explicit").default(false),
        submitToRadio: boolean("submit_to_radio").default(false),
        downloadCount: integer("download_count").default(0),
        playCount: integer("play_count").default(0),
        likesCount: integer("likes_count").default(0),
        // NEW: Stripe Price ID for one-time payment
        stripePriceId: varchar("stripe_price_id", { length: 255 }),
        createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
        updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
      },
      (table) => ({
        artistIdx: index("tracks_artist_idx").on(table.artistId),
        genreIdx: index("tracks_genre_idx").on(table.genre),
        publicIdx: index("tracks_public_idx").on(table.isPublic),
        createdIdx: index("tracks_created_idx").on(table.createdAt),
        previewIdx: index("tracks_preview_idx").on(table.hasPreviewOnly)
      })
    );
    purchasedTracks = pgTable(
      "purchased_tracks",
      {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id").notNull(),
        trackId: uuid("track_id").notNull(),
        price: decimal("price", { precision: 10, scale: 2 }).notNull(),
        currency: varchar("currency", { length: 10 }).notNull().default("usd"),
        stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
        stripeTransferId: varchar("stripe_transfer_id", { length: 255 }),
        paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
        purchasedAt: timestamp("purchased_at").default(sql`CURRENT_TIMESTAMP`)
      },
      (table) => ({
        userIdx: index("purchased_tracks_user_idx").on(table.userId),
        trackIdx: index("purchased_tracks_track_idx").on(table.trackId),
        userTrackIdx: index("purchased_tracks_user_track_idx").on(
          table.userId,
          table.trackId
        )
      })
    );
    tips = pgTable(
      "tips",
      {
        id: uuid("id").primaryKey().defaultRandom(),
        fromUserId: uuid("from_user_id").notNull(),
        toUserId: uuid("to_user_id").notNull(),
        trackId: uuid("track_id"),
        liveStreamId: uuid("live_stream_id"),
        // For live stream tips
        amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
        message: text("message"),
        stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 100 }),
        status: statusEnum("status").default("pending"),
        createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
      },
      (table) => ({
        fromUserIdx: index("tips_from_user_idx").on(table.fromUserId),
        toUserIdx: index("tips_to_user_idx").on(table.toUserId),
        trackIdx: index("tips_track_idx").on(table.trackId),
        liveStreamIdx: index("tips_live_stream_idx").on(table.liveStreamId)
      })
    );
    radioSessions = pgTable(
      "radio_sessions",
      {
        id: uuid("id").primaryKey().defaultRandom(),
        title: varchar("title", { length: 255 }).notNull(),
        description: text("description"),
        hostId: uuid("host_id").notNull(),
        radioCoStreamId: varchar("radio_co_stream_id", { length: 100 }),
        isLive: boolean("is_live").default(false),
        listenerCount: integer("listener_count").default(0),
        currentTrackId: uuid("current_track_id"),
        scheduledStart: timestamp("scheduled_start").notNull(),
        scheduledEnd: timestamp("scheduled_end").notNull(),
        actualStart: timestamp("actual_start"),
        actualEnd: timestamp("actual_end"),
        createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
      },
      (table) => ({
        hostIdx: index("host_idx").on(table.hostId),
        liveIdx: index("live_idx").on(table.isLive),
        scheduledIdx: index("scheduled_idx").on(table.scheduledStart)
      })
    );
    radioChatMessageTypeEnum = pgEnum("radio_chat_message_type", [
      "chat",
      "reaction",
      "system"
    ]);
    radioChat = pgTable(
      "radio_chat",
      {
        id: uuid("id").primaryKey().defaultRandom(),
        sessionId: uuid("session_id").notNull(),
        userId: uuid("user_id").notNull(),
        message: text("message").notNull(),
        messageType: radioChatMessageTypeEnum("message_type").default("chat"),
        createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
      },
      (table) => ({
        sessionIdx: index("session_idx").on(table.sessionId),
        userIdx: index("user_idx").on(table.userId),
        typeIdx: index("type_idx").on(table.messageType)
      })
    );
    collaborations = pgTable(
      "collaborations",
      {
        id: uuid("id").primaryKey().defaultRandom(),
        requesterId: uuid("requester_id").notNull(),
        targetId: uuid("target_id").notNull(),
        trackId: uuid("track_id"),
        message: text("message"),
        status: collaborationStatusEnum("status").default("pending"),
        collaborationType: collaborationTypeEnum("collaboration_type"),
        createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
        updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
      },
      (table) => ({
        requesterIdx: index("requester_idx").on(table.requesterId),
        targetIdx: index("target_idx").on(table.targetId),
        statusIdx: index("status_idx").on(table.status)
      })
    );
    badges = pgTable("badges", {
      id: uuid("id").primaryKey().defaultRandom(),
      name: varchar("name", { length: 100 }).notNull(),
      description: text("description"),
      iconUrl: varchar("icon_url", { length: 500 }),
      badgeType: badgeTypeEnum("badge_type").default("achievement"),
      criteria: json("criteria"),
      isActive: boolean("is_active").default(true),
      createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
    });
    userBadges = pgTable(
      "user_badges",
      {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id").notNull(),
        badgeId: uuid("badge_id").notNull(),
        earnedAt: timestamp("earned_at").default(sql`CURRENT_TIMESTAMP`)
      },
      (table) => ({
        userIdx: index("user_badges_user_idx").on(table.userId),
        badgeIdx: index("user_badges_badge_idx").on(table.badgeId)
      })
    );
    liveStreams = pgTable(
      "live_streams",
      {
        id: uuid("id").primaryKey().defaultRandom(),
        artistId: uuid("artist_id").notNull(),
        title: varchar("title", { length: 255 }).notNull(),
        description: text("description"),
        scheduledFor: timestamp("scheduled_for"),
        startedAt: timestamp("started_at"),
        endedAt: timestamp("ended_at"),
        status: liveStreamStatusEnum("status").default("scheduled"),
        viewerCount: integer("viewer_count").default(0),
        maxViewers: integer("max_viewers").default(0),
        totalTips: decimal("total_tips", { precision: 10, scale: 2 }).default(
          "0.00"
        ),
        streamKey: varchar("stream_key", { length: 255 }),
        thumbnailUrl: varchar("thumbnail_url", { length: 500 }),
        isRecorded: boolean("is_recorded").default(false),
        recordingUrl: varchar("recording_url", { length: 500 }),
        createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
      },
      (table) => ({
        artistIdx: index("artist_stream_idx").on(table.artistId),
        statusIdx: index("stream_status_idx").on(table.status)
      })
    );
    liveStreamViewers = pgTable(
      "live_stream_viewers",
      {
        id: uuid("id").primaryKey().defaultRandom(),
        streamId: uuid("stream_id").notNull(),
        userId: uuid("user_id").notNull(),
        joinedAt: timestamp("joined_at").default(sql`CURRENT_TIMESTAMP`),
        leftAt: timestamp("left_at")
      },
      (table) => ({
        streamIdx: index("stream_viewers_idx").on(table.streamId),
        userIdx: index("viewer_user_idx").on(table.userId)
      })
    );
    liveStreamMessages = pgTable(
      "live_stream_messages",
      {
        id: uuid("id").primaryKey().defaultRandom(),
        streamId: uuid("stream_id").notNull(),
        userId: uuid("user_id").notNull(),
        message: text("message").notNull(),
        isTip: boolean("is_tip").default(false),
        tipAmount: decimal("tip_amount", { precision: 10, scale: 2 }),
        createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
      },
      (table) => ({
        streamIdx: index("stream_messages_idx").on(table.streamId),
        createdAtIdx: index("stream_messages_time_idx").on(table.createdAt)
      })
    );
    conversations = pgTable(
      "conversations",
      {
        id: uuid("id").primaryKey().defaultRandom(),
        participant1Id: uuid("participant1_id").notNull(),
        participant2Id: uuid("participant2_id").notNull(),
        lastMessageId: uuid("last_message_id"),
        lastMessageAt: timestamp("last_message_at").default(sql`CURRENT_TIMESTAMP`),
        createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
      },
      (table) => ({
        participant1Idx: index("conversations_p1_idx").on(table.participant1Id),
        participant2Idx: index("conversations_p2_idx").on(table.participant2Id),
        lastMessageIdx: index("conversations_last_msg_idx").on(table.lastMessageAt)
      })
    );
    messages = pgTable(
      "messages",
      {
        id: uuid("id").primaryKey().defaultRandom(),
        conversationId: uuid("conversation_id").notNull(),
        senderId: uuid("sender_id").notNull(),
        content: text("content").notNull(),
        messageType: messageTypeEnum("message_type").default("text"),
        trackId: uuid("track_id"),
        // for sharing tracks
        isRead: boolean("is_read").default(false),
        readAt: timestamp("read_at"),
        createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
      },
      (table) => ({
        conversationIdx: index("messages_conversation_idx").on(
          table.conversationId
        ),
        senderIdx: index("messages_sender_idx").on(table.senderId),
        createdAtIdx: index("messages_time_idx").on(table.createdAt)
      })
    );
    banners = pgTable(
      "banners",
      {
        id: uuid("id").primaryKey().defaultRandom(),
        title: varchar("title", { length: 255 }).notNull(),
        description: text("description"),
        cta: varchar("cta", { length: 100 }),
        ctaUrl: varchar("cta_url", { length: 500 }),
        imageUrl: varchar("image_url", { length: 500 }).notNull(),
        active: boolean("active").default(true).notNull(),
        // Audit fields
        createdBy: uuid("created_by").notNull(),
        // FK to users.id
        deletedAt: timestamp("deleted_at"),
        // null = not deleted
        createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
        updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
      },
      (table) => ({
        activeIdx: index("banners_active_idx").on(table.active),
        createdByIdx: index("banners_created_by_idx").on(table.createdBy)
      })
    );
    insertBannerSchema = createInsertSchema(banners).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    }).extend({
      active: z.coerce.boolean()
    });
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertTrackSchema = createInsertSchema(tracks).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      playCount: true,
      downloadCount: true,
      likesCount: true
    });
    insertPlaylistSchema = createInsertSchema(playlists).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      trackCount: true,
      totalDuration: true
    });
    insertMessageSchema = createInsertSchema(messages).omit({
      id: true,
      createdAt: true,
      isRead: true
    });
    insertTipSchema = createInsertSchema(tips).omit({
      id: true,
      createdAt: true,
      status: true,
      stripePaymentIntentId: true
    });
    insertRadioSessionSchema = createInsertSchema(radioSessions).omit({
      id: true,
      createdAt: true,
      isLive: true,
      listenerCount: true,
      actualStart: true,
      actualEnd: true
    });
    updateRadioSessionSchema = insertRadioSessionSchema.extend({
      scheduledStart: z.date().optional(),
      scheduledEnd: z.date().optional(),
      actualStart: z.date().optional(),
      actualEnd: z.date().optional()
    }).partial();
    insertCollaborationSchema = createInsertSchema(
      collaborations
    ).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      status: true
    });
    insertLiveStreamSchema = createInsertSchema(liveStreams).omit({
      id: true,
      createdAt: true,
      viewerCount: true,
      maxViewers: true,
      totalTips: true,
      streamKey: true
    });
    insertLiveStreamMessageSchema = createInsertSchema(
      liveStreamMessages
    ).omit({
      id: true,
      createdAt: true
    });
    insertFollowerSchema = createInsertSchema(follows).omit({
      id: true,
      createdAt: true
    });
    insertConversationSchema = createInsertSchema(conversations).omit({
      id: true,
      createdAt: true,
      lastMessageId: true,
      lastMessageAt: true
    });
    notificationTypeEnum = pgEnum("notification_type", [
      "follow",
      "unfollow",
      "message",
      "tip",
      "live_stream",
      "profile_visit",
      "track_like",
      "playlist_follow",
      "collaboration_request",
      "comment"
    ]);
    notifications = pgTable(
      "notifications",
      {
        id: uuid("id").primaryKey().defaultRandom(),
        userId: uuid("user_id").notNull(),
        // recipient of notification
        actorId: uuid("actor_id").notNull(),
        // person who performed the action
        type: notificationTypeEnum("type").notNull(),
        title: varchar("title", { length: 255 }).notNull(),
        message: text("message").notNull(),
        isRead: boolean("is_read").default(false),
        readAt: timestamp("read_at"),
        actionUrl: varchar("action_url", { length: 500 }),
        // link to relevant page
        metadata: json("metadata"),
        // additional context data
        createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
      },
      (table) => ({
        userIdx: index("notifications_user_idx").on(table.userId),
        actorIdx: index("notifications_actor_idx").on(table.actorId),
        typeIdx: index("notifications_type_idx").on(table.type),
        readIdx: index("notifications_read_idx").on(table.isRead),
        createdAtIdx: index("notifications_time_idx").on(table.createdAt)
      })
    );
    insertNotificationSchema = createInsertSchema(notifications).omit({
      id: true,
      createdAt: true,
      isRead: true,
      readAt: true
    });
    insertPurchasedTrackSchema = createInsertSchema(
      purchasedTracks
    ).omit({
      id: true,
      purchasedAt: true
    });
    insertEmailVerificationTokenSchema = createInsertSchema(
      emailVerificationTokens
    ).omit({
      id: true,
      createdAt: true
    });
    featuredSpots = pgTable(
      "featured_spots",
      {
        id: uuid("id").primaryKey().defaultRandom(),
        artistId: uuid("artist_id").notNull(),
        title: varchar("title", { length: 255 }).notNull(),
        description: text("description"),
        imageUrl: varchar("image_url", { length: 500 }),
        videoUrl: varchar("video_url", { length: 500 }),
        buttonText: varchar("button_text", { length: 100 }).default(
          "Visit Profile"
        ),
        buttonUrl: varchar("button_url", { length: 500 }),
        sortOrder: integer("sort_order").default(0),
        status: featuredSpotStatusEnum("status").default("pending"),
        startDate: timestamp("start_date").notNull(),
        endDate: timestamp("end_date").notNull(),
        priceUSD: decimal("price_usd", { precision: 10, scale: 2 }).notNull(),
        stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 100 }),
        paidAt: timestamp("paid_at"),
        createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
        updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
      },
      (table) => ({
        artistIdx: index("featured_spots_artist_idx").on(table.artistId),
        statusIdx: index("featured_spots_status_idx").on(table.status),
        dateIdx: index("featured_spots_date_idx").on(
          table.startDate,
          table.endDate
        ),
        sortIdx: index("featured_spots_sort_idx").on(table.sortOrder)
      })
    );
    adminBroadcasts = pgTable(
      "admin_broadcasts",
      {
        id: uuid("id").primaryKey().defaultRandom(),
        createdBy: uuid("created_by").notNull(),
        title: varchar("title", { length: 255 }).notNull(),
        message: text("message").notNull(),
        type: broadcastTypeEnum("type").notNull(),
        status: broadcastStatusEnum("status").default("draft"),
        targetAudience: varchar("target_audience", { length: 100 }).notNull(),
        // "all", "artists", "fans", "subscribers"
        specificUserIds: json("specific_user_ids").$type(),
        // array of user IDs for targeted messages
        scheduledFor: timestamp("scheduled_for"),
        sentAt: timestamp("sent_at"),
        recipientCount: integer("recipient_count").default(0),
        openCount: integer("open_count").default(0),
        clickCount: integer("click_count").default(0),
        createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
        updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
      },
      (table) => ({
        createdByIdx: index("admin_broadcasts_creator_idx").on(table.createdBy),
        statusIdx: index("admin_broadcasts_status_idx").on(table.status),
        typeIdx: index("admin_broadcasts_type_idx").on(table.type),
        targetIdx: index("admin_broadcasts_target_idx").on(table.targetAudience),
        scheduledIdx: index("admin_broadcasts_scheduled_idx").on(
          table.scheduledFor
        )
      })
    );
    broadcastRecipients = pgTable(
      "broadcast_recipients",
      {
        id: uuid("id").primaryKey().defaultRandom(),
        broadcastId: uuid("broadcast_id").notNull(),
        userId: uuid("user_id").notNull(),
        status: varchar("status", { length: 50 }).default("pending"),
        // "pending", "sent", "delivered", "opened", "clicked", "failed"
        sentAt: timestamp("sent_at"),
        deliveredAt: timestamp("delivered_at"),
        openedAt: timestamp("opened_at"),
        clickedAt: timestamp("clicked_at"),
        failureReason: text("failure_reason"),
        createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`)
      },
      (table) => ({
        broadcastIdx: index("broadcast_recipients_broadcast_idx").on(
          table.broadcastId
        ),
        userIdx: index("broadcast_recipients_user_idx").on(table.userId),
        statusIdx: index("broadcast_recipients_status_idx").on(table.status)
      })
    );
    discountCodes = pgTable(
      "discount_codes",
      {
        id: uuid("id").primaryKey().defaultRandom(),
        code: varchar("code", { length: 50 }).notNull().unique(),
        name: varchar("name", { length: 255 }).notNull(),
        description: text("description"),
        type: discountCodeTypeEnum("type").notNull(),
        value: decimal("value", { precision: 10, scale: 2 }),
        // percentage or fixed amount
        maxUses: integer("max_uses"),
        // null = unlimited
        usedCount: integer("used_count").default(0),
        status: discountCodeStatusEnum("status").default("active"),
        validFrom: timestamp("valid_from").notNull(),
        validUntil: timestamp("valid_until"),
        createdBy: uuid("created_by").notNull(),
        applicableRoles: json("applicable_roles"),
        // ["artist", "fan"] or null for all
        minimumAmount: decimal("minimum_amount", { precision: 10, scale: 2 }),
        // minimum order amount
        createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
        updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`)
      },
      (table) => ({
        codeIdx: index("discount_codes_code_idx").on(table.code),
        statusIdx: index("discount_codes_status_idx").on(table.status),
        typeIdx: index("discount_codes_type_idx").on(table.type),
        validityIdx: index("discount_codes_validity_idx").on(
          table.validFrom,
          table.validUntil
        ),
        createdByIdx: index("discount_codes_creator_idx").on(table.createdBy)
      })
    );
    discountCodeUsage = pgTable(
      "discount_code_usage",
      {
        id: uuid("id").primaryKey().defaultRandom(),
        codeId: uuid("code_id").notNull(),
        userId: uuid("user_id").notNull(),
        orderId: varchar("order_id", { length: 255 }),
        // Stripe payment intent or subscription ID
        discountAmount: decimal("discount_amount", {
          precision: 10,
          scale: 2
        }).notNull(),
        originalAmount: decimal("original_amount", { precision: 10, scale: 2 }),
        usedAt: timestamp("used_at").default(sql`CURRENT_TIMESTAMP`)
      },
      (table) => ({
        codeIdx: index("discount_code_usage_code_idx").on(table.codeId),
        userIdx: index("discount_code_usage_user_idx").on(table.userId),
        orderIdx: index("discount_code_usage_order_idx").on(table.orderId)
      })
    );
    insertFeaturedSpotSchema = createInsertSchema(featuredSpots).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      status: true,
      paidAt: true
    });
    insertAdminBroadcastSchema = createInsertSchema(adminBroadcasts).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      // status: true,
      sentAt: true,
      recipientCount: true,
      openCount: true,
      clickCount: true
    }).extend({
      scheduledFor: z.union([z.date(), z.string(), z.null()]).optional().nullable()
    });
    insertBroadcastRecipientSchema = createInsertSchema(
      broadcastRecipients
    ).omit({
      id: true,
      createdAt: true
    });
    insertDiscountCodeSchema = createInsertSchema(discountCodes).omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      usedCount: true
    });
    insertDiscountCodeUsageSchema = createInsertSchema(
      discountCodeUsage
    ).omit({
      id: true,
      usedAt: true
    });
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
import "dotenv/config";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    console.log("process.env.DATABASE_URL", process.env.DATABASE_URL);
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle({ client: pool, schema: schema_exports });
  }
});

// server/utils.ts
import { and, gt, lt, ne } from "drizzle-orm";
import AWS from "aws-sdk";
async function isTimeSlotAvailable(start, end, excludeSessionId) {
  const overlappingSessions = await db.select().from(radioSessions).where(
    and(
      lt(radioSessions.scheduledStart, end),
      // existing.start < newEnd
      gt(radioSessions.scheduledEnd, start),
      // existing.end > newStart
      excludeSessionId ? ne(radioSessions.id, excludeSessionId) : void 0
    )
  );
  return overlappingSessions.length === 0;
}
var s3;
var init_utils = __esm({
  "server/utils.ts"() {
    "use strict";
    init_db();
    init_schema();
    s3 = new AWS.S3({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });
  }
});

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var __filename, __dirname, vite_config_default;
var init_vite_config = __esm({
  "vite.config.ts"() {
    "use strict";
    __filename = fileURLToPath(import.meta.url);
    __dirname = path.dirname(__filename);
    vite_config_default = defineConfig(async () => {
      const plugins = [react(), runtimeErrorOverlay()];
      if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0) {
        const { cartographer } = await import("@replit/vite-plugin-cartographer");
        plugins.push(cartographer());
      }
      return {
        plugins,
        resolve: {
          alias: {
            "@": path.resolve(__dirname, "client", "src"),
            "@shared": path.resolve(__dirname, "shared"),
            "@assets": path.resolve(__dirname, "attached_assets")
          }
        },
        root: path.resolve(__dirname, "client"),
        build: {
          outDir: path.resolve(__dirname, "dist/public"),
          emptyOutDir: true
        },
        server: {
          fs: {
            strict: true,
            deny: ["**/.*"]
          },
          hmr: { overlay: false }
        }
      };
    });
  }
});

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client/src",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}
var viteLogger;
var init_vite = __esm({
  "server/vite.ts"() {
    "use strict";
    init_vite_config();
    viteLogger = createLogger();
  }
});

// server/storage.ts
import {
  eq,
  and as and2,
  or,
  desc,
  asc,
  count,
  like,
  sql as sql3,
  ne as ne2,
  isNull,
  ilike,
  gt as gt2
} from "drizzle-orm";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";
var MySQLStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_db();
    init_utils();
    init_vite();
    MySQLStorage = class {
      getBanner(id) {
        throw new Error("Method not implemented.");
      }
      getBanners(activeOnly) {
        throw new Error("Method not implemented.");
      }
      // User operations
      async getUser(id) {
        const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
        return result[0];
      }
      async getUserByEmail(email) {
        const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
        return result[0];
      }
      async getUserByUsername(username) {
        const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
        return result[0];
      }
      async createUser(insertUser) {
        const id = randomUUID();
        const hashedPassword = await bcrypt.hash(insertUser.password, 10);
        const userData = {
          ...insertUser,
          id,
          password: hashedPassword
        };
        await db.insert(users).values(userData);
        const result = await this.getUser(id);
        if (!result) throw new Error("Failed to create user");
        return result;
      }
      async updateUser(id, updates) {
        await db.update(users).set(updates).where(eq(users.id, id));
        const result = await this.getUser(id);
        if (!result) throw new Error("User not found");
        return result;
      }
      async updateUserStripeInfo(id, customerId, subscriptionId) {
        const updates = { stripeCustomerId: customerId };
        if (subscriptionId) {
          updates.stripeSubscriptionId = subscriptionId;
        }
        return this.updateUser(id, updates);
      }
      async deleteUser(id) {
        await db.delete(users).where(eq(users.id, id));
      }
      /**
       * Create a password reset record
       */
      async createPasswordReset(data) {
        const [record] = await db.insert(passwordResets).values(data).returning();
        return record;
      }
      /**
       * Get a password reset by userId
       */
      async getPasswordResetByUserId(userId) {
        const [record] = await db.select().from(passwordResets).where(
          and2(
            eq(passwordResets.userId, userId),
            gt2(passwordResets.expiresAt, Date.now())
          )
        );
        return record || null;
      }
      /**
       * Delete a password reset by userId
       */
      async deletePasswordReset(userId) {
        await db.delete(passwordResets).where(eq(passwordResets.userId, userId));
      }
      // inside your function
      async getFeaturedArtists(search) {
        let whereCondition;
        if (typeof search === "string" && search.length > 0) {
          whereCondition = and2(
            eq(users.role, "artist"),
            ilike(users.username, `%${search}%`)
          );
        } else {
          whereCondition = eq(users.role, "artist");
        }
        const artistsWithFollowerCount = await db.select({
          id: users.id,
          email: users.email,
          username: users.username,
          password: users.password,
          firstName: users.firstName,
          lastName: users.lastName,
          bio: users.bio,
          profileImage: users.profileImage,
          backgroundImage: users.backgroundImage,
          role: users.role,
          location: users.location,
          website: users.website,
          socialMedia: users.socialMedia,
          isActive: users.isActive,
          stripeCustomerId: users.stripeCustomerId,
          stripeSubscriptionId: users.stripeSubscriptionId,
          subscriptionStatus: users.subscriptionStatus,
          trialEndsAt: users.trialEndsAt,
          hasUsedTrial: users.hasUsedTrial,
          onboardingComplete: users.onboardingComplete,
          createdAt: users.createdAt,
          updatedAt: users.updatedAt,
          followerCount: count(follows.followerId)
        }).from(users).leftJoin(follows, eq(follows.followingId, users.id)).where(whereCondition).groupBy(users.id).orderBy(users.username);
        return artistsWithFollowerCount.map((artist) => ({
          ...artist,
          followers: Number(artist.followerCount) || 0
        }));
      }
      async getAllArtists() {
        const artists = await db.select({
          id: users.id,
          email: users.email,
          username: users.username,
          password: users.password,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          bio: users.bio,
          profileImage: users.profileImage,
          backgroundImage: users.backgroundImage,
          location: users.location,
          website: users.website,
          socialMedia: users.socialMedia,
          emailVerified: users.emailVerified,
          // Add this
          emailVerifiedAt: users.emailVerifiedAt,
          // Add this
          isActive: users.isActive,
          stripeCustomerId: users.stripeCustomerId,
          stripeSubscriptionId: users.stripeSubscriptionId,
          subscriptionStatus: users.subscriptionStatus,
          trialEndsAt: users.trialEndsAt,
          hasUsedTrial: users.hasUsedTrial,
          onboardingComplete: users.onboardingComplete,
          preferredCurrency: users.preferredCurrency,
          // Add this
          createdAt: users.createdAt,
          updatedAt: users.updatedAt
        }).from(users).where(eq(users.role, "artist")).orderBy(users.username);
        return artists;
      }
      // Track operations
      async getTrack(id) {
        const result = await db.select().from(tracks).where(eq(tracks.id, id)).limit(1);
        return result[0];
      }
      async getTracksByArtist(artistId) {
        return db.select().from(tracks).where(eq(tracks.artistId, artistId)).orderBy(desc(tracks.createdAt));
      }
      async getTracks(query, limit = 50, offset = 0) {
        const conditions = [eq(tracks.isPublic, true)];
        if (query) {
          conditions.push(
            or(
              like(tracks.title, `%${query}%`),
              like(tracks.genre, `%${query}%`),
              like(tracks.description, `%${query}%`),
              like(users.username, `%${query}%`)
            )
          );
        }
        const result = await db.select({
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
          artistName: users.username
        }).from(tracks).leftJoin(users, eq(tracks.artistId, users.id)).where(and2(...conditions)).orderBy(query ? desc(tracks.playCount) : desc(tracks.createdAt)).limit(limit).offset(offset);
        return result;
      }
      async searchTracks(query) {
        const result = await db.select({
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
          artistName: users.username
        }).from(tracks).leftJoin(users, eq(tracks.artistId, users.id)).where(
          and2(
            eq(tracks.isPublic, true),
            or(
              like(tracks.title, `%${query}%`),
              like(tracks.genre, `%${query}%`),
              like(tracks.description, `%${query}%`),
              like(users.username, `%${query}%`)
            )
          )
        ).orderBy(desc(tracks.playCount));
        return result;
      }
      async createTrack(insertTrack) {
        const id = randomUUID();
        const trackData = { ...insertTrack, id };
        await db.insert(tracks).values(trackData);
        const result = await this.getTrack(id);
        if (!result) throw new Error("Failed to create track");
        return result;
      }
      async updateTrack(id, updates) {
        await db.update(tracks).set(updates).where(eq(tracks.id, id));
        const result = await this.getTrack(id);
        if (!result) throw new Error("Track not found");
        return result;
      }
      async deleteTrack(id) {
        await db.delete(tracks).where(eq(tracks.id, id));
      }
      async incrementPlayCount(id) {
        await db.update(tracks).set({ playCount: sql3`${tracks.playCount} + 1` }).where(eq(tracks.id, id));
      }
      // Playlist operations
      async getPlaylist(id) {
        const result = await db.select().from(playlists).where(eq(playlists.id, id)).limit(1);
        return result[0];
      }
      async getPlaylistsByUser(userId) {
        return db.select().from(playlists).where(eq(playlists.creatorId, userId)).orderBy(desc(playlists.createdAt));
      }
      async getPublicPlaylists() {
        return db.select().from(playlists).where(eq(playlists.isPublic, true)).orderBy(desc(playlists.createdAt)).limit(20);
      }
      async createPlaylist(insertPlaylist) {
        const id = randomUUID();
        const playlistData = { ...insertPlaylist, id };
        await db.insert(playlists).values(playlistData);
        const result = await this.getPlaylist(id);
        if (!result) throw new Error("Failed to create playlist");
        return result;
      }
      async updatePlaylist(id, updates) {
        await db.update(playlists).set(updates).where(eq(playlists.id, id));
        const result = await this.getPlaylist(id);
        if (!result) throw new Error("Playlist not found");
        return result;
      }
      async deletePlaylist(id) {
        await db.delete(playlists).where(eq(playlists.id, id));
      }
      async addTrackToPlaylist(playlistId, trackId, addedBy) {
        const id = randomUUID();
        const lastTrack = await db.select({ position: playlistTracks.position }).from(playlistTracks).where(eq(playlistTracks.playlistId, playlistId)).orderBy(desc(playlistTracks.position)).limit(1);
        const nextPosition = (lastTrack[0]?.position || 0) + 1;
        await db.insert(playlistTracks).values({
          id,
          playlistId,
          trackId,
          addedBy: addedBy || playlistId,
          // Use the provided user ID or fallback to playlist ID
          position: nextPosition
        });
        await db.update(playlists).set({ trackCount: sql3`${playlists.trackCount} + 1` }).where(eq(playlists.id, playlistId));
      }
      async removeTrackFromPlaylist(playlistId, trackId) {
        await db.delete(playlistTracks).where(
          and2(
            eq(playlistTracks.playlistId, playlistId),
            eq(playlistTracks.trackId, trackId)
          )
        );
        await db.update(playlists).set({ trackCount: sql3`${playlists.trackCount} - 1` }).where(eq(playlists.id, playlistId));
      }
      async getPlaylistTracks(playlistId) {
        const result = await db.select({
          track: tracks,
          position: playlistTracks.position
        }).from(playlistTracks).innerJoin(tracks, eq(playlistTracks.trackId, tracks.id)).where(eq(playlistTracks.playlistId, playlistId)).orderBy(asc(playlistTracks.position));
        return result.map((r) => r.track);
      }
      // Social operations
      async followUser(followerId, followingId) {
        const id = randomUUID();
        await db.insert(follows).values({
          id,
          followerId,
          followingId
        });
      }
      async unfollowUser(followerId, followingId) {
        await db.delete(follows).where(
          and2(
            eq(follows.followerId, followerId),
            eq(follows.followingId, followingId)
          )
        );
      }
      async getFollowers(userId) {
        const result = await db.select({ user: users }).from(follows).innerJoin(users, eq(follows.followerId, users.id)).where(eq(follows.followingId, userId));
        return result.map((r) => r.user);
      }
      async getFollowing(userId) {
        const result = await db.select({ user: users }).from(follows).innerJoin(users, eq(follows.followingId, users.id)).where(eq(follows.followerId, userId));
        return result.map((r) => r.user);
      }
      async isFollowing(followerId, followingId) {
        const result = await db.select().from(follows).where(
          and2(
            eq(follows.followerId, followerId),
            eq(follows.followingId, followingId)
          )
        ).limit(1);
        return result.length > 0;
      }
      // Legacy message operations (keeping for compatibility but not used)
      async getMessages(userId1, userId2) {
        return [];
      }
      async sendMessage(insertMessage) {
        const id = randomUUID();
        const messageData = { ...insertMessage, id };
        await db.insert(messages).values(messageData);
        const result = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
        if (!result[0]) throw new Error("Failed to create message");
        return result[0];
      }
      async markMessagesAsRead(conversationId, userId) {
        await db.update(messages).set({ isRead: true, readAt: /* @__PURE__ */ new Date() }).where(
          and2(
            eq(messages.conversationId, conversationId),
            ne2(messages.senderId, userId)
            // Mark messages from others as read
          )
        );
      }
      // Payment operations
      async createTip(insertTip) {
        const id = randomUUID();
        const tipData = { ...insertTip, id };
        await db.insert(tips).values(tipData);
        const result = await db.select().from(tips).where(eq(tips.id, id)).limit(1);
        if (!result[0]) throw new Error("Failed to create tip");
        return result[0];
      }
      async updateTipStatus(id, status, paymentIntentId) {
        const updates = { status };
        if (paymentIntentId) {
          updates.stripePaymentIntentId = paymentIntentId;
        }
        await db.update(tips).set(updates).where(eq(tips.id, id));
        const result = await db.select().from(tips).where(eq(tips.id, id)).limit(1);
        if (!result[0]) throw new Error("Tip not found");
        return result[0];
      }
      async getTipsByUser(userId) {
        return db.select().from(tips).where(or(eq(tips.fromUserId, userId), eq(tips.toUserId, userId))).orderBy(desc(tips.createdAt));
      }
      // Radio operations
      async createRadioSession(insertSession) {
        if (insertSession.scheduledStart && insertSession.scheduledEnd && !await isTimeSlotAvailable(
          insertSession.scheduledStart,
          insertSession.scheduledEnd
        )) {
          throw new Error("Time slot is already taken");
        }
        const id = randomUUID();
        const sessionData = { ...insertSession, id };
        await db.insert(radioSessions).values(sessionData);
        const result = await this.getRadioSession(id);
        if (!result) throw new Error("Failed to create radio session");
        return result;
      }
      async updateRadioSession(id, updates) {
        if (updates.scheduledStart && updates.scheduledEnd) {
          const available = await isTimeSlotAvailable(
            updates.scheduledStart,
            updates.scheduledEnd,
            id
            // exclude self
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
      async goLive(sessionId) {
        const updated = await db.update(radioSessions).set({
          isLive: true,
          actualStart: sql3`NOW()`
        }).where(eq(radioSessions.id, sessionId)).returning();
        return updated[0] ?? null;
      }
      async endSession(sessionId) {
        const updated = await db.update(radioSessions).set({
          isLive: false,
          actualEnd: sql3`NOW()`
        }).where(eq(radioSessions.id, sessionId)).returning();
        return updated[0] ?? null;
      }
      async getActiveRadioSession() {
        const result = await db.select({
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
            bio: users.bio
          }
        }).from(radioSessions).leftJoin(users, eq(radioSessions.hostId, users.id)).where(eq(radioSessions.isLive, true)).orderBy(desc(radioSessions.actualStart)).limit(1);
        return result[0] ?? void 0;
      }
      async getAllRadioSessions() {
        return db.select().from(radioSessions).orderBy(desc(radioSessions.actualStart));
      }
      async getRadioSession(id) {
        const result = await db.select().from(radioSessions).where(eq(radioSessions.id, id)).limit(1);
        return result[0];
      }
      // Radio Live Chats
      async getRadioChatMessages(sessionId, limit = 50) {
        return db.select({
          id: radioChat.id,
          sessionId: radioChat.sessionId,
          userId: radioChat.userId,
          // <-- add this
          message: radioChat.message,
          messageType: radioChat.messageType,
          createdAt: radioChat.createdAt,
          user: {
            id: users.id,
            username: users.username,
            role: users.role,
            profileImage: users.profileImage
          }
        }).from(radioChat).innerJoin(users, eq(users.id, radioChat.userId)).where(eq(radioChat.sessionId, sessionId)).orderBy(asc(radioChat.createdAt)).limit(limit);
      }
      // Collaboration operations
      async createCollaboration(insertCollab) {
        const id = randomUUID();
        const collabData = { ...insertCollab, id };
        await db.insert(collaborations).values(collabData);
        const result = await db.select().from(collaborations).where(eq(collaborations.id, id)).limit(1);
        if (!result[0]) throw new Error("Failed to create collaboration");
        return result[0];
      }
      async updateCollaborationStatus(id, status) {
        await db.update(collaborations).set({ status }).where(eq(collaborations.id, id));
        const result = await db.select().from(collaborations).where(eq(collaborations.id, id)).limit(1);
        if (!result[0]) throw new Error("Collaboration not found");
        return result[0];
      }
      async getCollaborationsByUser(userId) {
        return db.select().from(collaborations).where(
          or(
            eq(collaborations.requesterId, userId),
            eq(collaborations.targetId, userId)
          )
        ).orderBy(desc(collaborations.createdAt));
      }
      async getPendingCollaborations(userId) {
        return db.select().from(collaborations).where(
          and2(
            eq(collaborations.targetId, userId),
            eq(collaborations.status, "pending")
          )
        ).orderBy(desc(collaborations.createdAt));
      }
      // Live Stream operations
      async createLiveStream(insertStream) {
        const id = randomUUID();
        const streamKey = randomUUID();
        const streamData = {
          ...insertStream,
          id,
          streamKey,
          status: "scheduled"
        };
        await db.insert(liveStreams).values(streamData);
        const result = await this.getLiveStream(id);
        if (!result) throw new Error("Failed to create live stream");
        return result;
      }
      async getLiveStream(id) {
        const result = await db.select().from(liveStreams).where(eq(liveStreams.id, id)).limit(1);
        return result[0];
      }
      async getLiveStreamsByArtist(artistId) {
        return db.select().from(liveStreams).where(eq(liveStreams.artistId, artistId)).orderBy(desc(liveStreams.createdAt));
      }
      async getActiveLiveStreams() {
        return db.select().from(liveStreams).where(eq(liveStreams.status, "live")).orderBy(desc(liveStreams.startedAt));
      }
      async updateLiveStream(id, updates) {
        await db.update(liveStreams).set(updates).where(eq(liveStreams.id, id));
        const result = await this.getLiveStream(id);
        if (!result) throw new Error("Live stream not found");
        return result;
      }
      async startLiveStream(id) {
        const updates = {
          status: "live",
          startedAt: /* @__PURE__ */ new Date()
        };
        return this.updateLiveStream(id, updates);
      }
      async endLiveStream(id) {
        const updates = {
          status: "ended",
          endedAt: /* @__PURE__ */ new Date(),
          viewerCount: 0
        };
        return this.updateLiveStream(id, updates);
      }
      async joinLiveStream(streamId, userId) {
        await db.insert(liveStreamViewers).values({
          id: randomUUID(),
          streamId,
          userId,
          joinedAt: /* @__PURE__ */ new Date()
        });
        const currentViewers = await db.select({ count: count() }).from(liveStreamViewers).where(
          and2(
            eq(liveStreamViewers.streamId, streamId),
            sql3`${liveStreamViewers.leftAt} IS NULL`
          )
        );
        const viewerCount = currentViewers[0]?.count || 0;
        await db.update(liveStreams).set({ viewerCount }).where(eq(liveStreams.id, streamId));
      }
      async leaveLiveStream(streamId, userId) {
        await db.update(liveStreamViewers).set({ leftAt: /* @__PURE__ */ new Date() }).where(
          and2(
            eq(liveStreamViewers.streamId, streamId),
            eq(liveStreamViewers.userId, userId),
            sql3`${liveStreamViewers.leftAt} IS NULL`
          )
        );
        const currentViewers = await db.select({ count: count() }).from(liveStreamViewers).where(
          and2(
            eq(liveStreamViewers.streamId, streamId),
            sql3`${liveStreamViewers.leftAt} IS NULL`
          )
        );
        const viewerCount = currentViewers[0]?.count || 0;
        await db.update(liveStreams).set({ viewerCount }).where(eq(liveStreams.id, streamId));
      }
      async getLiveStreamViewers(streamId) {
        const viewers = await db.select({
          user: users
        }).from(liveStreamViewers).innerJoin(users, eq(liveStreamViewers.userId, users.id)).where(
          and2(
            eq(liveStreamViewers.streamId, streamId),
            sql3`${liveStreamViewers.leftAt} IS NULL`
          )
        );
        return viewers.map((v) => v.user);
      }
      async addLiveStreamMessage(insertMessage) {
        const id = randomUUID();
        const messageData = {
          ...insertMessage,
          id,
          createdAt: /* @__PURE__ */ new Date()
        };
        await db.insert(liveStreamMessages).values(messageData);
        const result = await db.select().from(liveStreamMessages).where(eq(liveStreamMessages.id, id)).limit(1);
        if (!result[0]) throw new Error("Failed to create message");
        return result[0];
      }
      async getLiveStreamMessages(streamId, limit = 50) {
        return db.select().from(liveStreamMessages).where(eq(liveStreamMessages.streamId, streamId)).orderBy(desc(liveStreamMessages.createdAt)).limit(limit);
      }
      // Conversation operations
      async getOrCreateConversation(participant1Id, participant2Id) {
        const existing = await db.select().from(conversations).where(
          or(
            and2(
              eq(conversations.participant1Id, participant1Id),
              eq(conversations.participant2Id, participant2Id)
            ),
            and2(
              eq(conversations.participant1Id, participant2Id),
              eq(conversations.participant2Id, participant1Id)
            )
          )
        ).limit(1);
        if (existing[0]) {
          return existing[0];
        }
        const id = randomUUID();
        const conversationData = {
          id,
          participant1Id,
          participant2Id
        };
        await db.insert(conversations).values(conversationData);
        const result = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
        if (!result[0]) throw new Error("Failed to create conversation");
        return result[0];
      }
      async getConversations(userId) {
        const rawConversations = await db.select().from(conversations).where(
          or(
            eq(conversations.participant1Id, userId),
            eq(conversations.participant2Id, userId)
          )
        ).orderBy(desc(conversations.lastMessageAt));
        const conversationsWithParticipants = await Promise.all(
          rawConversations.map(async (conversation) => {
            const participant1 = await this.getUser(conversation.participant1Id);
            const participant2 = await this.getUser(conversation.participant2Id);
            return {
              ...conversation,
              participant1,
              participant2
            };
          })
        );
        return conversationsWithParticipants;
      }
      async getConversationMessages(conversationId, limit = 50) {
        return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(asc(messages.createdAt)).limit(limit);
      }
      async sendConversationMessage(insertMessage) {
        const id = randomUUID();
        const messageData = {
          ...insertMessage,
          id,
          createdAt: /* @__PURE__ */ new Date()
        };
        await db.insert(messages).values(messageData);
        await db.update(conversations).set({
          lastMessageId: id,
          lastMessageAt: /* @__PURE__ */ new Date()
        }).where(eq(conversations.id, insertMessage.conversationId));
        const result = await db.select().from(messages).where(eq(messages.id, id)).limit(1);
        if (!result[0]) throw new Error("Failed to create message");
        return result[0];
      }
      // Notification operations
      async createNotification(insertNotification) {
        const id = randomUUID();
        const notificationData = {
          ...insertNotification,
          id,
          createdAt: /* @__PURE__ */ new Date()
        };
        await db.insert(notifications).values(notificationData);
        const result = await db.select().from(notifications).where(eq(notifications.id, id)).limit(1);
        if (!result[0]) throw new Error("Failed to create notification");
        return result[0];
      }
      async getUserNotifications(userId, limit = 50) {
        const results = await db.select({
          notification: notifications,
          actor: {
            id: users.id,
            username: users.username,
            firstName: users.firstName,
            lastName: users.lastName,
            profileImage: users.profileImage,
            emailVerified: users.emailVerified
          }
        }).from(notifications).innerJoin(users, eq(notifications.actorId, users.id)).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(limit);
        return results.map((r) => ({
          ...r.notification,
          actor: r.actor
        }));
      }
      async getUnreadNotificationCount(userId) {
        const result = await db.select({ count: count() }).from(notifications).where(
          and2(eq(notifications.userId, userId), eq(notifications.isRead, false))
        );
        return result[0]?.count || 0;
      }
      async markNotificationAsRead(notificationId) {
        await db.update(notifications).set({
          isRead: true,
          readAt: /* @__PURE__ */ new Date()
        }).where(eq(notifications.id, notificationId));
      }
      async markAllNotificationsAsRead(userId) {
        await db.update(notifications).set({
          isRead: true,
          readAt: /* @__PURE__ */ new Date()
        }).where(
          and2(eq(notifications.userId, userId), eq(notifications.isRead, false))
        );
      }
      async notifyFollowers(artistId, message) {
        const followers = await db.select({ followerId: follows.followerId }).from(follows).where(eq(follows.followingId, artistId));
        console.log(
          `Notifying ${followers.length} followers of artist ${artistId}: ${message}`
        );
      }
      async searchUsers(query) {
        try {
          console.log("Executing search query for:", query);
          const results = await db.select({
            id: users.id,
            username: users.username,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            role: users.role,
            profileImage: users.profileImage,
            emailVerified: users.emailVerified
          }).from(users).where(
            or(
              like(users.username, `%${query}%`),
              like(users.firstName, `%${query}%`),
              like(users.lastName, `%${query}%`)
            )
          ).limit(10);
          console.log("Search results from DB:", results);
          return results;
        } catch (error) {
          console.error("Search users error:", error);
          throw error;
        }
      }
      // Mixxlist/Fan operations
      async getUserMixxlists(userId) {
        return await db.select().from(playlists).where(
          and2(
            eq(playlists.creatorId, userId),
            or(eq(playlists.type, "mixxlist"), sql3`${playlists.type} IS NULL`)
          )
        ).orderBy(desc(playlists.createdAt));
      }
      async getUserPurchasedTracks(userId) {
        return await db.select({
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
            price: tracks.price
          }
        }).from(purchasedTracks).leftJoin(tracks, eq(purchasedTracks.trackId, tracks.id)).where(eq(purchasedTracks.userId, userId)).orderBy(desc(purchasedTracks.purchasedAt));
      }
      async getPurchasedTracksByUser(userId) {
        const result = await db.select({
          id: tracks.id,
          title: tracks.title,
          description: tracks.description,
          artistId: tracks.artistId,
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
          artistName: sql3`CONCAT(${users.firstName}, ' ', ${users.lastName})`.as(
            "artistName"
          )
        }).from(purchasedTracks).innerJoin(tracks, eq(purchasedTracks.trackId, tracks.id)).innerJoin(users, eq(tracks.artistId, users.id)).where(eq(purchasedTracks.userId, userId)).orderBy(desc(purchasedTracks.purchasedAt));
        return result;
      }
      async getUserFavoriteArtists(userId) {
        const followingUserTable = users;
        return await db.select({
          id: followingUserTable.id,
          username: followingUserTable.username,
          firstName: followingUserTable.firstName,
          lastName: followingUserTable.lastName,
          role: followingUserTable.role,
          bio: followingUserTable.bio,
          profileImage: followingUserTable.profileImage,
          emailVerified: followingUserTable.emailVerified
        }).from(follows).leftJoin(
          followingUserTable,
          eq(follows.followingId, followingUserTable.id)
        ).where(
          and2(
            eq(follows.followerId, userId),
            eq(followingUserTable.role, "artist")
          )
        ).orderBy(desc(follows.createdAt));
      }
      async getUserTrackPurchase(userId, trackId) {
        const [purchase] = await db.select().from(purchasedTracks).where(
          and2(
            eq(purchasedTracks.userId, userId),
            eq(purchasedTracks.trackId, trackId)
          )
        );
        return purchase || null;
      }
      async recordTrackPurchase(purchaseData) {
        const id = randomUUID();
        const data = { ...purchaseData, id };
        const [purchase] = await db.insert(purchasedTracks).values(data).returning();
        return purchase;
      }
      async hasTrackAccess(userId, trackId) {
        try {
          const track = await this.getTrack(trackId);
          if (!track) return false;
          if (track.artistId === userId) return true;
          if (!track.hasPreviewOnly) return true;
          const purchase = await this.getUserTrackPurchase(userId, trackId);
          return !!purchase;
        } catch (error) {
          console.error("Error checking track access:", error);
          return false;
        }
      }
      // ✅ Update purchased track by Stripe PaymentIntent ID
      async updatePurchasedTrackByIntentId(intentId, updates) {
        const [purchase] = await db.update(purchasedTracks).set({
          ...updates.paymentStatus && { paymentStatus: updates.paymentStatus },
          ...updates.stripeTransferId !== void 0 && {
            stripeTransferId: updates.stripeTransferId
          },
          ...updates.purchasedAt && { purchasedAt: updates.purchasedAt }
        }).where(eq(purchasedTracks.stripePaymentIntentId, intentId)).returning();
        return purchase || null;
      }
      // Email verification operations
      async createEmailVerificationToken(token) {
        const [newToken] = await db.insert(emailVerificationTokens).values(token).returning();
        return newToken;
      }
      async getEmailVerificationToken(token) {
        const [verificationToken] = await db.select().from(emailVerificationTokens).where(eq(emailVerificationTokens.token, token));
        return verificationToken;
      }
      async deleteEmailVerificationToken(token) {
        await db.delete(emailVerificationTokens).where(eq(emailVerificationTokens.token, token));
      }
      async markEmailAsVerified(userId) {
        await db.update(users).set({
          emailVerified: true,
          emailVerifiedAt: /* @__PURE__ */ new Date()
        }).where(eq(users.id, userId));
      }
      // Admin statistics
      async getAdminStats() {
        const [userStats] = await db.select({
          total: sql3`COUNT(*)`,
          artists: sql3`COUNT(CASE WHEN role = 'artist' THEN 1 END)`,
          fans: sql3`COUNT(CASE WHEN role = 'fan' THEN 1 END)`,
          subscribed: sql3`COUNT(CASE WHEN stripe_customer_id IS NOT NULL THEN 1 END)`
        }).from(users);
        const [featuredStats] = await db.select({
          active: sql3`COUNT(CASE WHEN status = 'active' THEN 1 END)`,
          total: sql3`COUNT(*)`
        }).from(featuredSpots);
        const [broadcastStats] = await db.select({
          total: sql3`COUNT(*)`
        }).from(adminBroadcasts);
        return {
          users: userStats,
          featuredSpots: featuredStats || { active: 0, total: 0 },
          broadcasts: broadcastStats || { total: 0 }
        };
      }
      // Admin operations - Featured Spots
      async getFeaturedSpots(status) {
        let baseQuery = db.select({
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
            profileImage: users.profileImage
          }
        }).from(featuredSpots).leftJoin(users, eq(featuredSpots.artistId, users.id));
        if (status) {
          return await baseQuery.where(
            eq(
              featuredSpots.status,
              status
            )
          ).orderBy(featuredSpots.sortOrder, featuredSpots.createdAt);
        } else {
          return await baseQuery.orderBy(
            featuredSpots.sortOrder,
            featuredSpots.createdAt
          );
        }
      }
      async getFeaturedSpot(id) {
        const [spot] = await db.select({
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
            profileImage: users.profileImage
          }
        }).from(featuredSpots).leftJoin(users, eq(featuredSpots.artistId, users.id)).where(eq(featuredSpots.id, id)).limit(1);
        return spot || null;
      }
      async createFeaturedSpot(spot) {
        const id = randomUUID();
        const spotData = { ...spot, id, status: "active" };
        const [newSpot] = await db.insert(featuredSpots).values(spotData).returning();
        return await this.getFeaturedSpot(newSpot.id);
      }
      async updateFeaturedSpot(id, updates) {
        await db.update(featuredSpots).set(updates).where(eq(featuredSpots.id, id));
        return await this.getFeaturedSpot(id);
      }
      async deleteFeaturedSpot(id) {
        await db.delete(featuredSpots).where(eq(featuredSpots.id, id));
      }
      // Admin operations - Broadcasts
      async getAdminBroadcasts(status) {
        let query = db.select().from(adminBroadcasts);
        if (status) {
          return await query.where(
            eq(
              adminBroadcasts.status,
              status
            )
          ).orderBy(desc(adminBroadcasts.createdAt));
        }
        return await query.orderBy(desc(adminBroadcasts.createdAt));
      }
      async getAdminBroadcast(id) {
        const [broadcast] = await db.select().from(adminBroadcasts).where(eq(adminBroadcasts.id, id)).limit(1);
        return broadcast || null;
      }
      async createAdminBroadcast(broadcast) {
        const id = randomUUID();
        const broadcastData = { ...broadcast, id };
        const [newBroadcast] = await db.insert(adminBroadcasts).values(broadcastData).returning();
        return newBroadcast;
      }
      async updateAdminBroadcast(id, updates) {
        await db.update(adminBroadcasts).set(updates).where(eq(adminBroadcasts.id, id));
        return await this.getAdminBroadcast(id);
      }
      async deleteAdminBroadcast(id) {
        await db.delete(adminBroadcasts).where(eq(adminBroadcasts.id, id));
      }
      async getUsersByRole(role) {
        return await db.select().from(users).where(eq(users.role, role));
      }
      async getSubscribedUsers() {
        return await db.select().from(users).where(eq(users.subscriptionStatus, "active"));
      }
      async getActiveFeaturedSpots() {
        return await this.getFeaturedSpots("active");
      }
      async createBroadcastRecipient(recipient) {
        const id = randomUUID();
        const recipientData = { ...recipient, id };
        const [newRecipient] = await db.insert(broadcastRecipients).values(recipientData).returning();
        return newRecipient;
      }
      async updateBroadcastRecipient(id, updates) {
        await db.update(broadcastRecipients).set(updates).where(eq(broadcastRecipients.id, id));
        const [recipient] = await db.select().from(broadcastRecipients).where(eq(broadcastRecipients.id, id)).limit(1);
        return recipient;
      }
      async getBroadcastRecipients(broadcastId) {
        return await db.select().from(broadcastRecipients).where(eq(broadcastRecipients.broadcastId, broadcastId));
      }
      // Discount code operations
      async createDiscountCode(insertCode) {
        const id = randomUUID();
        const codeData = {
          ...insertCode,
          id,
          createdAt: /* @__PURE__ */ new Date(),
          updatedAt: /* @__PURE__ */ new Date()
        };
        await db.insert(discountCodes).values(codeData);
        const result = await db.select().from(discountCodes).where(eq(discountCodes.id, id)).limit(1);
        if (!result[0]) throw new Error("Failed to create discount code");
        return result[0];
      }
      async getDiscountCodes() {
        return db.select().from(discountCodes).orderBy(desc(discountCodes.createdAt));
      }
      async getDiscountCodeById(id) {
        const result = await db.select().from(discountCodes).where(eq(discountCodes.id, id)).limit(1);
        return result[0];
      }
      async getDiscountCodeByCode(code) {
        const result = await db.select().from(discountCodes).where(eq(discountCodes.code, code)).limit(1);
        return result[0];
      }
      async updateDiscountCode(id, updates) {
        const updateData = { ...updates, updatedAt: /* @__PURE__ */ new Date() };
        await db.update(discountCodes).set(updateData).where(eq(discountCodes.id, id));
        const result = await db.select().from(discountCodes).where(eq(discountCodes.id, id)).limit(1);
        if (!result[0]) throw new Error("Discount code not found");
        return result[0];
      }
      async deleteDiscountCode(id) {
        await db.delete(discountCodes).where(eq(discountCodes.id, id));
      }
      async useDiscountCode(codeId, userId, orderId, discountAmount, originalAmount) {
        const id = randomUUID();
        const usageData = {
          id,
          codeId,
          userId,
          orderId,
          discountAmount: discountAmount.toString(),
          originalAmount: originalAmount?.toString() || null,
          usedAt: /* @__PURE__ */ new Date()
        };
        await db.insert(discountCodeUsage).values(usageData);
        await db.update(discountCodes).set({ usedCount: sql3`used_count + 1` }).where(eq(discountCodes.id, codeId));
        const result = await db.select().from(discountCodeUsage).where(eq(discountCodeUsage.id, id)).limit(1);
        if (!result[0]) throw new Error("Failed to record discount code usage");
        return result[0];
      }
      async getDiscountCodeUsage(codeId) {
        return db.select().from(discountCodeUsage).where(eq(discountCodeUsage.codeId, codeId)).orderBy(desc(discountCodeUsage.usedAt));
      }
      async validateDiscountCode(code, userId, role) {
        const discountCode = await this.getDiscountCodeByCode(code);
        if (!discountCode) {
          return { valid: false, reason: "Invalid discount code" };
        }
        if (discountCode.status !== "active") {
          return { valid: false, reason: "Discount code is inactive" };
        }
        const now = /* @__PURE__ */ new Date();
        if (now < new Date(discountCode.validFrom)) {
          return { valid: false, reason: "Discount code not yet valid" };
        }
        if (discountCode.validUntil && now > new Date(discountCode.validUntil)) {
          return { valid: false, reason: "Discount code has expired" };
        }
        if (discountCode.maxUses && (discountCode.usedCount || 0) >= discountCode.maxUses) {
          return { valid: false, reason: "Discount code usage limit reached" };
        }
        if (discountCode.applicableRoles) {
          const applicableRoles = Array.isArray(discountCode.applicableRoles) ? discountCode.applicableRoles : JSON.parse(discountCode.applicableRoles);
          if (role && !applicableRoles.includes(role)) {
            return {
              valid: false,
              reason: "Discount code not applicable to your account type"
            };
          }
        }
        const existingUsage = await db.select().from(discountCodeUsage).where(
          and2(
            eq(discountCodeUsage.codeId, discountCode.id),
            eq(discountCodeUsage.userId, userId)
          )
        ).limit(1);
        if (existingUsage[0] && discountCode.type === "free_subscription") {
          return {
            valid: false,
            reason: "You have already used this discount code"
          };
        }
        return { valid: true, discount: discountCode };
      }
      async getAllMyBanners(userId) {
        return db.select().from(banners).where(and2(eq(banners.createdBy, userId), isNull(banners.deletedAt)));
      }
      async getMyBannerById(userId, bannerId) {
        const [banner] = await db.select().from(banners).where(
          and2(
            eq(banners.createdBy, userId),
            eq(banners.id, bannerId),
            isNull(banners.deletedAt)
          )
        );
        return banner;
      }
      async getAllBanners() {
        return db.select().from(banners).where(and2(eq(banners.active, true), isNull(banners.deletedAt)));
      }
      async createBanner(data) {
        const [banner] = await db.insert(banners).values(data).returning();
        return banner;
      }
      async updateBanner(id, updates) {
        const [banner] = await db.update(banners).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(banners.id, id)).returning();
        return banner;
      }
      async deleteBanner(id) {
        await db.update(banners).set({ deletedAt: /* @__PURE__ */ new Date() }).where(eq(banners.id, id));
      }
    };
    storage = new MySQLStorage();
  }
});

// server/email.ts
import { MailService } from "@sendgrid/mail";
async function sendEmail(params) {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn(
      "SendGrid API key not configured - email verification disabled"
    );
    return false;
  }
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text ?? "",
      html: params.html
    });
    return true;
  } catch (error) {
    console.error("SendGrid email error:", error);
    return false;
  }
}
function generateVerificationEmail(verificationUrl, firstName) {
  const subject = "Verify your Mixxl account";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Mixxl Account</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Mixxl!</h1>
      </div>
      
      <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0;">Hi ${firstName}!</h2>
        
        <p>Thanks for signing up for Mixxl, the independent music platform that puts artists first.</p>
        
        <p>To get started, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                    color: white; 
                    padding: 12px 30px; 
                    text-decoration: none; 
                    border-radius: 25px; 
                    font-weight: bold; 
                    display: inline-block;">
            Verify Email Address
          </a>
        </div>
        
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 14px; color: #666;">
          This link will expire in 24 hours. If you didn't create a Mixxl account, you can safely ignore this email.
        </p>
        
        <p style="font-size: 14px; color: #666;">
          Best regards,<br>
          The Mixxl Team
        </p>
      </div>
    </body>
    </html>
  `;
  const text2 = `
    Welcome to Mixxl!
    
    Hi ${firstName}!
    
    Thanks for signing up for Mixxl, the independent music platform that puts artists first.
    
    To get started, please verify your email address by visiting this link:
    ${verificationUrl}
    
    This link will expire in 24 hours. If you didn't create a Mixxl account, you can safely ignore this email.
    
    Best regards,
    The Mixxl Team
  `;
  return {
    subject,
    html,
    text: text2
  };
}
var mailService;
var init_email = __esm({
  "server/email.ts"() {
    "use strict";
    mailService = new MailService();
    if (process.env.SENDGRID_API_KEY) {
      mailService.setApiKey(process.env.SENDGRID_API_KEY);
    }
  }
});

// server/admin-routes.ts
var admin_routes_exports = {};
__export(admin_routes_exports, {
  authenticate: () => authenticate,
  registerAdminRoutes: () => registerAdminRoutes,
  requireAdmin: () => requireAdmin,
  uploadBanner: () => uploadBanner
});
import { z as z2 } from "zod";
import Stripe from "stripe";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs2 from "fs";
import path3 from "path";
function generateBroadcastEmail(title, message, userName) {
  const subject = title;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - Mixxl</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 32px; font-weight: bold; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px; }
        .button { display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
        .footer { text-align: center; color: #666; font-size: 14px; }
        .message { white-space: pre-line; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">Mixxl</div>
        </div>
        <div class="content">
          <h2>Hi ${userName},</h2>
          <div class="message">${message}</div>
          <p style="text-align: center; margin: 30px 0;">
            <a href="https://app.mixxl.fm" class="button">Visit Mixxl</a>
          </p>
        </div>
        <div class="footer">
          <p>You're receiving this email because you're a member of the Mixxl community.</p>
          <p>&copy; 2025 Mixxl. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  const text2 = `Hi ${userName}, ${message} Visit Mixxl: https://app.mixxl.fm \xA9 2025 Mixxl. All rights reserved.`;
  return { subject, html, text: text2 };
}
function registerAdminRoutes(app2) {
  app2.get(
    "/api/admin/featured-spots",
    authenticate,
    requireAdmin,
    async (req, res) => {
      try {
        const { status } = req.query;
        const spots = await storage.getFeaturedSpots(status);
        res.json(spots);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  app2.get("/api/admin/featured-spots/:id", requireAdmin, async (req, res) => {
    try {
      const spot = await storage.getFeaturedSpot(req.params.id);
      if (!spot) {
        return res.status(404).json({ error: "Featured spot not found" });
      }
      res.json(spot);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/featured-spots", async (req, res) => {
    try {
      const { status } = req.query;
      const spots = await storage.getFeaturedSpots(status);
      res.json(spots);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/admin/featured-spots", requireAdmin, async (req, res) => {
    try {
      const bodyWithDates = {
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate)
      };
      const validatedData = insertFeaturedSpotSchema.parse(bodyWithDates);
      const spot = await storage.createFeaturedSpot(validatedData);
      res.status(201).json(spot);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });
  app2.put("/api/admin/featured-spots/:id", requireAdmin, async (req, res) => {
    try {
      const updates = req.body;
      if (updates.startDate && typeof updates.startDate === "string") {
        updates.startDate = new Date(updates.startDate);
      }
      if (updates.endDate && typeof updates.endDate === "string") {
        updates.endDate = new Date(updates.endDate);
      }
      const spot = await storage.updateFeaturedSpot(req.params.id, updates);
      res.json(spot);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.delete(
    "/api/admin/featured-spots/:id",
    requireAdmin,
    async (req, res) => {
      try {
        await storage.deleteFeaturedSpot(req.params.id);
        res.json({ message: "Featured spot deleted successfully" });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  app2.post(
    "/api/admin/featured-spots/:id/payment",
    requireAdmin,
    async (req, res) => {
      try {
        const spot = await storage.getFeaturedSpot(req.params.id);
        if (!spot) {
          return res.status(404).json({ error: "Featured spot not found" });
        }
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(parseFloat(spot.priceUSD) * 100),
          // Convert to cents
          currency: "usd",
          metadata: {
            type: "featured_spot",
            spotId: spot.id,
            artistId: spot.artistId
          }
        });
        await storage.updateFeaturedSpot(spot.id, {
          stripePaymentIntentId: paymentIntent.id
        });
        res.json({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  app2.post(
    "/api/admin/featured-spots/:id/confirm-payment",
    requireAdmin,
    async (req, res) => {
      try {
        const { paymentIntentId } = req.body;
        const paymentIntent = await stripe.paymentIntents.retrieve(
          paymentIntentId
        );
        if (paymentIntent.status === "succeeded") {
          await storage.updateFeaturedSpot(req.params.id, {
            status: "active",
            paidAt: /* @__PURE__ */ new Date()
          });
          res.json({ message: "Featured spot activated successfully" });
        } else {
          res.status(400).json({ error: "Payment not completed" });
        }
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  app2.get("/api/admin/broadcasts", requireAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      const broadcasts = await storage.getAdminBroadcasts(status);
      res.json(broadcasts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/admin/broadcasts/:id", requireAdmin, async (req, res) => {
    try {
      const broadcast = await storage.getAdminBroadcast(req.params.id);
      if (!broadcast) {
        return res.status(404).json({ error: "Broadcast not found" });
      }
      res.json(broadcast);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/admin/broadcasts", requireAdmin, async (req, res) => {
    try {
      const requestData = { ...req.body };
      if (!requestData.scheduledFor || requestData.scheduledFor === "") {
        delete requestData.scheduledFor;
      } else if (typeof requestData.scheduledFor === "string") {
        requestData.scheduledFor = new Date(requestData.scheduledFor);
      }
      const validatedData = insertAdminBroadcastSchema.parse({
        ...requestData,
        createdBy: req.user.id
      });
      const broadcast = await storage.createAdminBroadcast(validatedData);
      res.status(201).json(broadcast);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });
  app2.put("/api/admin/broadcasts/:id", requireAdmin, async (req, res) => {
    try {
      const updates = { ...req.body };
      log("before", JSON.stringify(updates));
      if (typeof updates.scheduledFor === "string") {
        updates.scheduledFor = new Date(updates.scheduledFor);
      }
      log("after", JSON.stringify(updates));
      const broadcast = await storage.updateAdminBroadcast(
        req.params.id,
        updates
      );
      res.json(broadcast);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.delete("/api/admin/broadcasts/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteAdminBroadcast(req.params.id);
      res.json({ message: "Broadcast deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/admin/broadcasts/:id/send", requireAdmin, async (req, res) => {
    try {
      const broadcast = await storage.getAdminBroadcast(req.params.id);
      if (!broadcast) {
        return res.status(404).json({ error: "Broadcast not found" });
      }
      if (broadcast.status !== "draft") {
        return res.status(400).json({ error: "Only draft broadcasts can be sent" });
      }
      let targetUsers = [];
      if (broadcast.targetAudience === "all") {
        targetUsers = await storage.getUsersByRole("fan").then(
          (fans) => storage.getUsersByRole("artist").then((artists) => [...fans, ...artists])
        );
      } else if (broadcast.targetAudience === "artists") {
        targetUsers = await storage.getUsersByRole("artist");
      } else if (broadcast.targetAudience === "fans") {
        targetUsers = await storage.getUsersByRole("fan");
      } else if (broadcast.targetAudience === "subscribers") {
        targetUsers = await storage.getSubscribedUsers();
      } else if (broadcast.specificUserIds) {
        const userIds = broadcast.specificUserIds;
        targetUsers = await Promise.all(
          userIds.map(async (id) => storage.getUser(id))
        );
        targetUsers = targetUsers.filter(Boolean);
      }
      let sentCount = 0;
      let failedCount = 0;
      for (const user of targetUsers) {
        try {
          await storage.createBroadcastRecipient({
            broadcastId: broadcast.id,
            userId: user.id,
            status: "pending"
          });
          if (broadcast.type === "notification" || broadcast.type === "both") {
            await storage.createNotification({
              userId: user.id,
              actorId: req.user.id,
              type: "comment",
              // Using generic type for admin notifications
              title: broadcast.title,
              message: broadcast.message,
              actionUrl: "/"
            });
          }
          if ((broadcast.type === "email" || broadcast.type === "both") && process.env.SENDGRID_API_KEY) {
            const emailContent = generateBroadcastEmail(
              broadcast.title,
              broadcast.message,
              user.firstName || "User"
            );
            const emailSent = await sendEmail({
              to: user.email,
              from: "noreply@mixxl.fm",
              subject: emailContent.subject,
              html: emailContent.html,
              text: emailContent.text
            });
            if (emailSent) {
              await storage.updateBroadcastRecipient(user.id, {
                status: "sent",
                sentAt: /* @__PURE__ */ new Date()
              });
            }
          }
          sentCount++;
        } catch (error) {
          console.error(`Failed to send broadcast to user ${user.id}:`, error);
          failedCount++;
        }
      }
      await storage.updateAdminBroadcast(broadcast.id, {
        status: "sent",
        sentAt: /* @__PURE__ */ new Date(),
        recipientCount: sentCount
      });
      res.json({
        message: "Broadcast sent successfully",
        sentCount,
        failedCount,
        totalTargeted: targetUsers.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get(
    "/api/admin/broadcasts/:id/recipients",
    requireAdmin,
    async (req, res) => {
      try {
        const recipients = await storage.getBroadcastRecipients(req.params.id);
        res.json(recipients);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  app2.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const [totalUsers, totalArtists, totalFans, subscribedUsers] = await Promise.all([
        storage.getUsersByRole("fan").then(
          (fans) => storage.getUsersByRole("artist").then((artists) => fans.length + artists.length)
        ),
        storage.getUsersByRole("artist").then((artists) => artists.length),
        storage.getUsersByRole("fan").then((fans) => fans.length),
        storage.getSubscribedUsers().then((users2) => users2.length)
      ]);
      const [activeFeaturedSpots, totalBroadcasts] = await Promise.all([
        storage.getActiveFeaturedSpots().then((spots) => spots.length),
        storage.getAdminBroadcasts().then((broadcasts) => broadcasts.length)
      ]);
      res.json({
        users: {
          total: totalUsers,
          artists: totalArtists,
          fans: totalFans,
          subscribed: subscribedUsers
        },
        featuredSpots: {
          active: activeFeaturedSpots
        },
        broadcasts: {
          total: totalBroadcasts
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const { role, limit = 50, offset = 0 } = req.query;
      let users2;
      if (role && role !== "all") {
        users2 = await storage.getUsersByRole(role);
      } else {
        const [fans, artists] = await Promise.all([
          storage.getUsersByRole("fan"),
          storage.getUsersByRole("artist")
        ]);
        users2 = [...fans, ...artists];
      }
      const paginatedUsers = users2.slice(
        parseInt(offset),
        parseInt(offset) + parseInt(limit)
      ).map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
        subscriptionStatus: user.subscriptionStatus,
        createdAt: user.createdAt,
        isActive: user.isActive
      }));
      res.json({
        users: paginatedUsers,
        total: users2.length,
        hasMore: parseInt(offset) + parseInt(limit) < users2.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/admin/discount-codes", requireAdmin, async (req, res) => {
    try {
      const codes = await storage.getDiscountCodes();
      res.json(codes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/admin/discount-codes/:id", requireAdmin, async (req, res) => {
    try {
      const code = await storage.getDiscountCodeById(req.params.id);
      if (!code) {
        return res.status(404).json({ error: "Discount code not found" });
      }
      res.json(code);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/admin/discount-codes", requireAdmin, async (req, res) => {
    try {
      let applicableRoles = null;
      if (req.body.applicableRoles) {
        if (Array.isArray(req.body.applicableRoles)) {
          applicableRoles = req.body.applicableRoles;
        } else if (typeof req.body.applicableRoles === "string") {
          applicableRoles = [req.body.applicableRoles];
        }
      }
      const validatedData = insertDiscountCodeSchema.parse({
        ...req.body,
        createdBy: req.user.id,
        validFrom: new Date(req.body.validFrom),
        validUntil: req.body.validUntil ? new Date(req.body.validUntil) : null,
        maxUses: req.body.maxUses ? parseInt(req.body.maxUses) : null,
        value: req.body.value ? req.body.value.toString() : null,
        minimumAmount: req.body.minimumAmount ? req.body.minimumAmount.toString() : null,
        applicableRoles
      });
      const newCode = await storage.createDiscountCode(validatedData);
      res.status(201).json(newCode);
    } catch (error) {
      if (error.name === "ZodError") {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });
  app2.put("/api/admin/discount-codes/:id", requireAdmin, async (req, res) => {
    try {
      let applicableRoles = null;
      if (req.body.applicableRoles) {
        if (Array.isArray(req.body.applicableRoles)) {
          applicableRoles = req.body.applicableRoles;
        } else if (typeof req.body.applicableRoles === "string") {
          applicableRoles = [req.body.applicableRoles];
        }
      }
      const updates = {
        ...req.body,
        validFrom: req.body.validFrom ? new Date(req.body.validFrom) : void 0,
        validUntil: req.body.validUntil ? new Date(req.body.validUntil) : null,
        maxUses: req.body.maxUses ? parseInt(req.body.maxUses) : null,
        value: req.body.value ? req.body.value.toString() : null,
        minimumAmount: req.body.minimumAmount ? req.body.minimumAmount.toString() : null,
        applicableRoles
      };
      const updatedCode = await storage.updateDiscountCode(
        req.params.id,
        updates
      );
      res.json(updatedCode);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.delete(
    "/api/admin/discount-codes/:id",
    requireAdmin,
    async (req, res) => {
      try {
        await storage.deleteDiscountCode(req.params.id);
        res.json({ message: "Discount code deleted successfully" });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  app2.post("/api/discount-codes/validate", async (req, res) => {
    try {
      const { code, userId, role } = req.body;
      if (!code || !userId) {
        return res.status(400).json({ error: "Code and userId are required" });
      }
      const validation = await storage.validateDiscountCode(code, userId, role);
      res.json(validation);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post("/api/discount-codes/use", async (req, res) => {
    try {
      const { code, userId, orderId, discountAmount, originalAmount } = req.body;
      if (!code || !userId || !orderId || discountAmount === void 0) {
        return res.status(400).json({ error: "Missing required fields" });
      }
      const validation = await storage.validateDiscountCode(code, userId);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.reason });
      }
      const usage = await storage.useDiscountCode(
        validation.discount.id,
        userId,
        orderId,
        discountAmount,
        originalAmount
      );
      res.json(usage);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get(
    "/api/admin/discount-codes/:id/usage",
    requireAdmin,
    async (req, res) => {
      try {
        const usage = await storage.getDiscountCodeUsage(req.params.id);
        res.json(usage);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }
  );
  app2.get("/api/my/banners", requireAdmin, async (req, res) => {
    try {
      const banners2 = await storage.getAllMyBanners(req.user.id);
      res.json(banners2);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/my/banners/:id", requireAdmin, async (req, res) => {
    try {
      const banner = await storage.getMyBannerById(req.user.id, req.params.id);
      if (!banner) {
        return res.status(404).json({ error: "Banner not found" });
      }
      res.json(banner);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.get("/api/banners", async (req, res) => {
    try {
      const banners2 = await storage.getAllBanners();
      res.json(banners2);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  app2.post(
    "/api/admin/banners",
    requireAdmin,
    uploadBanner.single("image"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "Image file is required" });
        }
        const insertBannerData = {
          ...req.body,
          active: req.body.active ? true : false,
          createdBy: req.user.id,
          imageUrl: `/uploads/banners/${req.file.filename}`
        };
        const validatedData = insertBannerSchema.parse(insertBannerData);
        const banner = await storage.createBanner(validatedData);
        res.status(201).json(banner);
      } catch (error) {
        if (error instanceof z2.ZodError) {
          return res.status(400).json({ details: error.errors });
        }
        if (error instanceof Error) {
          return res.status(500).json({ error: error.message });
        }
        res.status(500).json({ error: "Unknown error" });
      }
    }
  );
  app2.put(
    "/api/admin/banners/:id",
    requireAdmin,
    uploadBanner.single("image"),
    async (req, res) => {
      try {
        const bannerId = req.params.id;
        const existingBanner = await storage.getMyBannerById(
          req.user.id,
          bannerId
        );
        if (!existingBanner) {
          return res.status(404).json({ error: "Banner not found" });
        }
        const updates = {
          title: req.body.title ?? existingBanner.title,
          description: req.body.description ?? existingBanner.description,
          cta: req.body.cta ?? existingBanner.cta,
          ctaUrl: req.body.ctaUrl ?? existingBanner.ctaUrl,
          active: req.body.active !== void 0 ? req.body.active === "true" : existingBanner.active
          // imageUrl will be handled below
        };
        if (req.file) {
          if (existingBanner.imageUrl) {
            const oldImagePath = path3.join(
              process.cwd(),
              existingBanner.imageUrl
            );
            fs2.unlink(oldImagePath, (err) => {
              if (err) {
                console.warn("Failed to delete old image:", oldImagePath, err);
              }
            });
          }
          updates.imageUrl = `/uploads/banners/${req.file.filename}`;
        } else {
          updates.imageUrl = existingBanner.imageUrl;
        }
        const updatedBanner = await storage.updateBanner(
          bannerId,
          updates
        );
        return res.json(updatedBanner);
      } catch (error) {
        if (error instanceof Error) {
          return res.status(500).json({ error: error.message });
        }
        res.status(500).json({ error: "Unknown error" });
      }
    }
  );
  app2.delete("/api/admin/banners/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteBanner(req.params.id);
      res.json({ message: "Banner deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}
var JWT_SECRET, bannerStorage, uploadBanner, stripe, authenticate, requireAdmin;
var init_admin_routes = __esm({
  "server/admin-routes.ts"() {
    "use strict";
    init_storage();
    init_schema();
    init_email();
    init_vite();
    JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
    bannerStorage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadDir = path3.join(process.cwd(), "uploads", "banners");
        try {
          fs2.mkdirSync(uploadDir, { recursive: true });
        } catch (err) {
          return cb(err, uploadDir);
        }
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
          null,
          file.fieldname + "-" + uniqueSuffix + path3.extname(file.originalname)
        );
      }
    });
    uploadBanner = multer({
      storage: bannerStorage,
      limits: { fileSize: 100 * 1024 * 1024 },
      // 100MB
      fileFilter: (req, file, cb) => {
        if (file.fieldname === "image" && !file.mimetype.startsWith("image/")) {
          return cb(new Error("Only image files are allowed"));
        }
        cb(null, true);
      }
    });
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
    }
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-06-30.basil"
    });
    authenticate = async (req, res, next) => {
      try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) {
          return res.status(401).json({ error: "Authentication required" });
        }
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await storage.getUser(decoded.userId);
        if (!user) {
          return res.status(401).json({ error: "Authentication required" });
        }
        req.user = user;
        next();
      } catch (error) {
        console.log("Auth error:", error);
        return res.status(401).json({ error: "Authentication required" });
      }
    };
    requireAdmin = async (req, res, next) => {
      await authenticate(req, res, () => {
        if (req.user.role !== "admin") {
          return res.status(403).json({ error: "Admin access required" });
        }
        next();
      });
    };
  }
});

// server/upload-routes.ts
var upload_routes_exports = {};
__export(upload_routes_exports, {
  registerUploadRoutes: () => registerUploadRoutes,
  s3: () => s32
});
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID as randomUUID2 } from "crypto";
function registerUploadRoutes(app2) {
  app2.post("/api/upload-url", authenticate, async (req, res) => {
    try {
      const { fileName, fileType, fileSize } = req.body;
      if (!fileName || !fileType || !fileSize) {
        return res.status(400).json({ error: "Missing fields" });
      }
      const fileId = randomUUID2();
      const key = `uploads/${fileId}-${fileName}`;
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        ContentType: fileType
        //   ContentLength: fileSize,
      });
      const uploadUrl = await getSignedUrl(s32, command, { expiresIn: 1e3 });
      const fileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      res.json({ uploadUrl, key, fileUrl });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to generate upload URL" });
    }
  });
}
var s32;
var init_upload_routes = __esm({
  "server/upload-routes.ts"() {
    "use strict";
    init_admin_routes();
    s32 = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
  }
});

// server/index.ts
import express2 from "express";
import path4 from "path";

// server/routes.ts
init_storage();
init_schema();
init_email();
init_vite();
import { createServer } from "http";
import { WebSocketServer as WebSocketServer2, WebSocket as WebSocket2 } from "ws";
import Stripe2 from "stripe";
import crypto from "crypto";
import bcrypt2 from "bcrypt";
import jwt2 from "jsonwebtoken";
import { ZodError } from "zod";

// server/ws/index.ts
init_vite();
import { WebSocketServer } from "ws";

// server/ws/handlers.ts
init_schema();
init_db();
async function handleMessage(wss2, socket, raw) {
  const msg = JSON.parse(raw.toString());
  switch (msg.type) {
    case "radio_chat": {
      const [saved] = await db.insert(radioChat).values({
        sessionId: msg.sessionId,
        userId: msg.user.id,
        message: msg.content,
        messageType: "chat"
      }).returning();
      const payload = {
        id: saved.id,
        sessionId: saved.sessionId,
        userId: saved.userId,
        message: saved.message,
        messageType: saved.messageType,
        createdAt: saved.createdAt,
        user: {
          id: msg.user.id,
          username: msg.user.username,
          role: msg.user.role,
          profileImage: msg.user.profileImage ?? null
        }
      };
      console.log("payload", payload);
      wss2.clients.forEach((client) => {
        if (client.readyState === socket.OPEN) {
          client.send(JSON.stringify(payload));
        }
      });
      break;
    }
    default:
      console.log("\u26A0\uFE0F Unknown message type:", msg.type);
  }
}

// server/ws/index.ts
var wss;
function createWSS(server) {
  wss = new WebSocketServer({ server, path: "/ws" });
  wss.on("connection", (socket) => {
    log("\u{1F50C} WebSocket client connected");
    socket.on("message", (data) => handleMessage(wss, socket, data));
    socket.send(JSON.stringify({ type: "welcome", message: "Hello from WS!" }));
  });
  return wss;
}
function getWSS() {
  if (!wss) throw new Error("WSS not initialized yet");
  return wss;
}

// server/routes.ts
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}
var stripe2 = new Stripe2(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil"
});
var JWT_SECRET2 = process.env.JWT_SECRET || "your-secret-key";
var wsClients = /* @__PURE__ */ new Map();
var authenticate2 = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }
    const decoded = jwt2.verify(token, JWT_SECRET2);
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
async function registerRoutes(app2) {
  app2.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: (/* @__PURE__ */ new Date()).toISOString() });
  });
  app2.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const newUser = await storage.createUser({
        ...userData,
        emailVerified: false
      });
      const verificationToken = jwt2.sign({ userId: newUser.id }, JWT_SECRET2, {
        expiresIn: "1h"
      });
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      const emailContent = generateVerificationEmail(
        verificationUrl,
        newUser.firstName || "User"
      );
      await sendEmail({
        to: newUser.email,
        from: "noreply@mixxl.fm",
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      });
      const jwtToken = jwt2.sign({ userId: newUser.id }, JWT_SECRET2, {
        expiresIn: "7d"
      });
      res.json({
        message: "Signup successful. Verification email sent.",
        user: { ...newUser, password: void 0 },
        token: jwtToken
      });
    } catch (error) {
      console.error("Signup error:", error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.get("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "Invalid token" });
      }
      let decoded;
      try {
        decoded = jwt2.verify(token, JWT_SECRET2);
      } catch {
        return res.status(400).json({ message: "Token invalid or expired" });
      }
      const user = await storage.getUser(decoded.userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.emailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }
      const verifiedUser = await storage.updateUser(user.id, {
        emailVerified: true
      });
      const jwtToken = jwt2.sign({ userId: verifiedUser.id }, JWT_SECRET2, {
        expiresIn: "7d"
      });
      res.json({
        message: "Email verified successfully",
        user: { ...verifiedUser, password: void 0 },
        token: jwtToken
      });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/auth/resend-verification", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });
      const user = await storage.getUserByEmail(email);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.emailVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }
      const verificationToken = jwt2.sign({ userId: user.id }, JWT_SECRET2, {
        expiresIn: "1h"
      });
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      const emailContent = generateVerificationEmail(
        verificationUrl,
        user.firstName || "User"
      );
      await sendEmail({
        to: user.email,
        from: "noreply@mixxl.fm",
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      });
      res.json({ message: "Verification email resent" });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("Login attempt for email:", email);
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log("User not found for email:", email);
        return res.status(401).json({ message: "Invalid credentials" });
      }
      console.log("User found, checking password...");
      const isValidPassword = await bcrypt2.compare(password, user.password);
      console.log("Password check result:", isValidPassword);
      if (!isValidPassword) {
        console.log("Password comparison failed");
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const token = jwt2.sign({ userId: user.id }, JWT_SECRET2, {
        expiresIn: "7d"
      });
      console.log("Login successful for user:", user.email);
      res.json({
        user: { ...user, password: void 0 },
        token
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/artist/stripe-account", authenticate2, async (req, res) => {
    try {
      const { id } = req.user;
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const account = await stripe2.accounts.create({
        type: "express",
        country: "US",
        email: user.email,
        metadata: {
          userId: user.id
          // 🔑 store your app’s userId
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true }
        },
        business_type: "individual",
        individual: {
          first_name: user.firstName || void 0,
          last_name: user.lastName || void 0,
          email: user.email
        },
        business_profile: {
          name: user.username,
          product_description: "Musician selling songs on Mixxl FM",
          url: user.website || "https://mixxl.fm"
        }
      });
      await storage.updateUser(id, { stripeAccountId: account.id });
      const accountLink = await stripe2.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.FRONTEND_URL}/artist/onboarding/refresh`,
        return_url: `${process.env.FRONTEND_URL}/artist/onboarding/complete`,
        type: "account_onboarding"
      });
      res.json({
        message: "Stripe account created",
        stripeAccountId: account.id,
        onboardingUrl: accountLink.url,
        user: { ...user, password: void 0 }
      });
    } catch (error) {
      console.error("Stripe account creation error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/artist/account-status", authenticate2, async (req, res) => {
    try {
      const { id } = req.user;
      const user = await storage.getUser(id);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (!user?.stripeAccountId)
        return res.status(404).json({ message: "User not found" });
      const account = await stripe2.accounts.retrieve(user?.stripeAccountId);
      let status = "none";
      let rejectReason = null;
      if (account.details_submitted) {
        if (account.requirements?.disabled_reason) {
          status = "rejected";
          rejectReason = account.requirements.disabled_reason;
        } else if (account.requirements?.pending_verification?.length) {
          status = "pending";
        } else if (account.requirements?.currently_due?.length) {
          status = "pending";
        } else {
          status = "complete";
        }
      } else {
        status = "none";
      }
      res.json({
        accountId: user?.stripeAccountId,
        status,
        rejectReason,
        raw: {
          details_submitted: account.details_submitted,
          requirements: account.requirements
        }
      });
    } catch (error) {
      console.error("Error fetching Stripe account status:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post(
    "/api/artist/stripe-account/refresh",
    authenticate2,
    async (req, res) => {
      try {
        const { id } = req.user;
        const user = await storage.getUser(id);
        if (!user || !user.stripeAccountId) {
          return res.status(404).json({ message: "Stripe account not found" });
        }
        const accountLink = await stripe2.accountLinks.create({
          account: user.stripeAccountId,
          refresh_url: `${process.env.FRONTEND_URL}/artist/onboarding/refresh`,
          return_url: `${process.env.FRONTEND_URL}/artist/onboarding/complete`,
          type: "account_onboarding"
        });
        res.redirect(accountLink.url);
      } catch (error) {
        console.error("Stripe account refresh error:", error);
        res.status(500).json({ message: "Server error" });
      }
    }
  );
  app2.post("/api/connect/webhook", async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe2.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed.", err);
      return res.sendStatus(400);
    }
    try {
      if (event.type === "account.updated") {
        const account = event.data.object;
        let status = "pending";
        let rejectReason = null;
        if (account.requirements?.disabled_reason) {
          status = "rejected";
          rejectReason = account.requirements.disabled_reason;
        } else if (account.details_submitted && account.charges_enabled) {
          status = "complete";
        } else {
          status = "pending";
        }
        const userId = account.metadata?.userId;
        if (!userId) {
          console.error(
            `No userId found in metadata for account ${account.id}`
          );
          return res.sendStatus(400);
        }
        console.log(`Updated Stripe account ${account.id} \u2192 ${status}`);
        const notification = await storage.createNotification({
          userId,
          // assuming you store userId in Stripe account metadata
          actorId: account.id,
          // could also be system bot uuid
          type: "message",
          // or maybe add a new "payout_status" enum
          title: "Payout Account Update",
          message: status === "rejected" ? `Your payout account was rejected: ${rejectReason}` : `Your payout account status is now: ${status}`,
          actionUrl: "/dashboard/payouts",
          // where you want user to go
          metadata: {
            stripeAccountId: account.id,
            status,
            rejectReason
          }
        });
        const wss3 = getWSS();
        wss3.clients.forEach((client) => {
          if (client.readyState === WebSocket2.OPEN) {
            client.send(
              JSON.stringify({
                type: "notification",
                data: notification
                // send inserted notification
              })
            );
          }
        });
      }
      res.sendStatus(200);
    } catch (err) {
      console.error("Webhook handler failed:", err);
      res.sendStatus(500);
    }
  });
  app2.get("/api/auth/me", authenticate2, (req, res) => {
    res.json({ ...req.user, password: void 0 });
  });
  app2.post("/api/auth/request-reset", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({
          message: "If the email exists, reset link has been sent"
        });
      }
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = Date.now() + 1e3 * 60 * 15;
      const hashedToken = await bcrypt2.hash(token, 10);
      await storage.createPasswordReset({
        userId: user.id,
        token: hashedToken,
        expiresAt
      });
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
      const emailContent = {
        subject: "Password Reset Request",
        text: `Click the link to reset your password: ${resetUrl}`,
        html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. The link expires in 15 minutes.</p>`
      };
      await sendEmail({
        to: email,
        from: "noreply@mixxl.fm",
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text
      });
      res.json({ message: "If the email exists, reset link has been sent" });
    } catch (err) {
      console.error("Request reset error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, token, newPassword, oldPassword } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "Invalid request" });
      }
      if (token) {
        const resetRecord = await storage.getPasswordResetByUserId(user.id);
        if (!resetRecord) {
          return res.status(400).json({ message: "Invalid or expired token" });
        }
        const isValid = await bcrypt2.compare(token, resetRecord.token);
        if (!isValid) {
          return res.status(400).json({ message: "Invalid token" });
        }
        const hashedPassword = await bcrypt2.hash(newPassword, 10);
        await storage.updateUser(user.id, { password: hashedPassword });
        await storage.deletePasswordReset(user.id);
        return res.json({ message: "Password updated successfully" });
      }
      if (oldPassword) {
        const isMatch = await bcrypt2.compare(oldPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Old password is incorrect" });
        }
        const hashedPassword = await bcrypt2.hash(newPassword, 10);
        await storage.updateUser(user.id, { password: hashedPassword });
        return res.json({ message: "Password updated successfully" });
      }
      return res.status(400).json({ message: "Invalid request: missing credentials" });
    } catch (err) {
      console.error("Reset password error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/user/:identifier", async (req, res) => {
    try {
      let user;
      const identifier = req.params.identifier;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        identifier
      );
      console.log(`Looking up user: ${identifier}, isUUID: ${isUUID}`);
      if (isUUID) {
        console.log("Searching by ID");
        user = await storage.getUser(identifier);
      } else {
        console.log("Searching by username");
        user = await storage.getUserByUsername(identifier);
      }
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const token = authHeader.replace("Bearer ", "");
          const decoded = jwt2.verify(token, JWT_SECRET2);
          const visitor = await storage.getUser(decoded.userId);
          if (visitor && visitor.id !== user.id) {
            await storage.createNotification({
              userId: user.id,
              actorId: visitor.id,
              type: "profile_visit",
              title: "Profile Visit",
              message: `${visitor.firstName} ${visitor.lastName} (@${visitor.username}) viewed your profile`,
              actionUrl: `/profile/${visitor.username}`
            });
          }
        } catch (jwtError) {
        }
      }
      res.json({ ...user, password: void 0 });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.patch("/api/users/profile", authenticate2, async (req, res) => {
    try {
      const updateData = Object.fromEntries(
        Object.entries(req.body).filter(
          ([_, v]) => v !== null && v !== void 0
        )
      );
      const user = await storage.updateUser(req.user.id, updateData);
      res.json({ ...user, password: void 0 });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/tracks", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 50;
      const offset = parseInt(req.query.offset) || 0;
      const query = req.query.q;
      const tracks2 = await storage.getTracks(query, limit, offset);
      res.json(tracks2);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/tracks/search", async (req, res) => {
    try {
      const query = req.query.q;
      if (!query) {
        return res.status(400).json({ message: "Search query required" });
      }
      const tracks2 = await storage.searchTracks(query);
      res.json(tracks2);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/tracks/:id", async (req, res) => {
    try {
      const track = await storage.getTrack(req.params.id);
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }
      res.json(track);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/tracks", authenticate2, async (req, res) => {
    try {
      const trackData = req.body;
      const validatedData = insertTrackSchema.parse(trackData);
      const track = await storage.createTrack(validatedData);
      res.json(track);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/tracks/:id/play", async (req, res) => {
    try {
      await storage.incrementPlayCount(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/tracks/:id/access", authenticate2, async (req, res) => {
    try {
      const hasAccess = await storage.hasTrackAccess(
        req.user.id,
        req.params.id
      );
      const track = await storage.getTrack(req.params.id);
      res.json({
        hasAccess,
        hasPreviewOnly: track?.hasPreviewOnly || false,
        previewUrl: track?.previewUrl,
        previewDuration: track?.previewDuration || 30
      });
    } catch (error) {
      console.error("Track access error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/buy-track", authenticate2, async (req, res) => {
    try {
      const { trackId } = req.body;
      const { id: buyerId } = req.user;
      const existingPurchase = await storage.getUserTrackPurchase(
        buyerId,
        trackId
      );
      if (existingPurchase) {
        return res.status(400).json({ message: "Track already purchased" });
      }
      const buyer = await storage.getUser(buyerId);
      if (!buyer) return res.status(404).json({ message: "Buyer not found" });
      const track = await storage.getTrack(trackId);
      if (!track) return res.status(404).json({ message: "Track not found" });
      const artist = await storage.getUser(track.artistId);
      if (!artist || !artist.stripeAccountId) {
        return res.status(400).json({ message: "Artist has no Stripe account set up" });
      }
      const session = await stripe2.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: buyer.preferredCurrency || "usd",
              product_data: {
                name: track.title,
                images: track.coverImage ? [track.coverImage] : []
              },
              unit_amount: Math.round(Number(track.price) * 100)
            },
            quantity: 1
          }
        ],
        customer: buyer.stripeCustomerId || void 0,
        success_url: `${process.env.FRONTEND_URL}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/purchase/cancel`,
        metadata: {
          buyerId,
          trackId: track.id,
          artistId: artist.id
        }
      });
      await storage.recordTrackPurchase({
        userId: buyerId,
        trackId: track.id,
        price: String(track?.price || 0),
        currency: buyer.preferredCurrency || "usd",
        stripePaymentIntentId: session.payment_intent,
        stripeTransferId: null,
        // transfer will happen in webhook
        paymentStatus: "pending"
      });
      return res.json({ checkoutUrl: session.url });
    } catch (error) {
      console.error("Buy track error:", error);
      return res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  app2.get("/api/purchase/verify", authenticate2, async (req, res) => {
    try {
      const { session_id } = req.query;
      if (!session_id) {
        return res.status(400).json({ message: "Missing session_id" });
      }
      const session = await stripe2.checkout.sessions.retrieve(
        session_id,
        {
          expand: ["payment_intent"]
        }
      );
      if (!session || !session.payment_intent) {
        return res.status(404).json({ message: "PaymentIntent not found" });
      }
      const paymentIntent = session.payment_intent;
      const paymentStatus = paymentIntent.status;
      const amount = paymentIntent.amount_received || paymentIntent.amount;
      const price = (amount / 100).toFixed(2);
      const currency = paymentIntent.currency.toUpperCase();
      res.json({
        paymentStatus,
        price,
        currency
      });
    } catch (err) {
      console.error("Purchase verify error:", err);
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/stripe/webhook", async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe2.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("Webhook signature verification failed.", err);
      return res.sendStatus(400);
    }
    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;
          const purchase = await storage.updatePurchasedTrackByIntentId(
            session.payment_intent,
            {
              paymentStatus: "succeeded",
              purchasedAt: /* @__PURE__ */ new Date()
            }
          );
          if (purchase && session.metadata?.artistId) {
            const artist = await storage.getUser(session.metadata.artistId);
            if (artist?.stripeAccountId) {
              await stripe2.transfers.create({
                amount: Math.round(parseFloat(purchase.price) * 100),
                // in cents
                currency: purchase.currency,
                destination: artist.stripeAccountId,
                metadata: {
                  trackId: purchase.trackId,
                  purchaseId: purchase.id
                }
              });
            }
          }
          console.log("\u2705 Purchase and transfer completed", {
            purchaseId: purchase?.id
          });
          break;
        }
        case "payment_intent.payment_failed": {
          const intent = event.data.object;
          await storage.updatePurchasedTrackByIntentId(intent.id, {
            paymentStatus: "failed"
          });
          console.log("\u26A0\uFE0F Purchase failed", { intentId: intent.id });
          break;
        }
        case "charge.refunded": {
          const charge = event.data.object;
          if (charge.payment_intent) {
            await storage.updatePurchasedTrackByIntentId(
              charge.payment_intent,
              { paymentStatus: "refunded" }
            );
            console.log("\u{1F4B8} Purchase refunded", {
              intent: charge.payment_intent
            });
          }
          break;
        }
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      res.json({ received: true });
    } catch (err) {
      console.error("\u{1F525} Webhook handler error:", err);
      res.status(500).send("Webhook handler error");
    }
  });
  app2.get("/api/users/tracks", authenticate2, async (req, res) => {
    try {
      const { id } = req.user;
      log("tracks buyer id", id);
      const user = await storage.getUser(id);
      if (!user)
        return res.status(404).json({ message: "User not found again" });
      let tracks2;
      if (user.role === "artist") {
        tracks2 = await storage.getTracksByArtist(user.id);
      } else {
        tracks2 = await storage.getPurchasedTracksByUser(user.id);
      }
      res.json(tracks2);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/playlists", async (req, res) => {
    try {
      const playlists2 = await storage.getPublicPlaylists();
      res.json(playlists2);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/users/:identifier/playlists", async (req, res) => {
    try {
      let user;
      const identifier = req.params.identifier;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        identifier
      );
      if (isUUID) {
        user = await storage.getUser(identifier);
      } else {
        user = await storage.getUserByUsername(identifier);
      }
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const playlists2 = await storage.getPlaylistsByUser(user.id);
      res.json(playlists2);
    } catch (error) {
      console.error("Get playlists error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/playlists", authenticate2, async (req, res) => {
    try {
      const playlistData = {
        ...req.body,
        creatorId: req.user.id
      };
      const validatedData = insertPlaylistSchema.parse(playlistData);
      const playlist = await storage.createPlaylist(validatedData);
      res.json(playlist);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/playlists/:id", async (req, res) => {
    try {
      const playlist = await storage.getPlaylist(req.params.id);
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      res.json(playlist);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.delete("/api/playlists/:id", authenticate2, async (req, res) => {
    try {
      const playlistId = req.params.id;
      const userId = req.user.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const playlist = await storage.getPlaylist(playlistId);
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      if (playlist.creatorId !== userId) {
        return res.status(403).json({ message: "Forbidden: Not your playlist" });
      }
      await storage.deletePlaylist(playlistId);
      res.status(200).json({
        message: "Playlist deleted successfully",
        deletedPlaylist: playlist
      });
    } catch (error) {
      console.error("Delete playlist error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/playlists/:id/tracks", async (req, res) => {
    try {
      const tracks2 = await storage.getPlaylistTracks(req.params.id);
      res.json(tracks2);
    } catch (error) {
      console.error("Get playlist tracks error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/playlists/:id/tracks", authenticate2, async (req, res) => {
    try {
      const { trackId } = req.body;
      await storage.addTrackToPlaylist(req.params.id, trackId, req.user.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/users/:id/follow", authenticate2, async (req, res) => {
    try {
      await storage.followUser(req.user.id, req.params.id);
      const follower = await storage.getUser(req.user.id);
      if (follower) {
        await storage.createNotification({
          userId: req.params.id,
          actorId: req.user.id,
          type: "follow",
          title: "New Follower",
          message: `@${follower.username} started following you`,
          actionUrl: `/profile/${follower.username}`
        });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.delete("/api/users/:id/follow", authenticate2, async (req, res) => {
    try {
      await storage.unfollowUser(req.user.id, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/users/:identifier/followers", async (req, res) => {
    try {
      let user;
      const identifier = req.params.identifier;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        identifier
      );
      if (isUUID) {
        user = await storage.getUser(identifier);
      } else {
        user = await storage.getUserByUsername(identifier);
      }
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const followers = await storage.getFollowers(user.id);
      res.json(followers.map((f) => ({ ...f, password: void 0 })));
    } catch (error) {
      console.error("Get followers error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/users/:identifier/following", async (req, res) => {
    try {
      let user;
      const identifier = req.params.identifier;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        identifier
      );
      if (isUUID) {
        user = await storage.getUser(identifier);
      } else {
        user = await storage.getUserByUsername(identifier);
      }
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const following = await storage.getFollowing(user.id);
      res.json(following.map((f) => ({ ...f, password: void 0 })));
    } catch (error) {
      console.error("Get following error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/messages/:userId", authenticate2, async (req, res) => {
    try {
      const messages2 = await storage.getMessages(
        req.user.id,
        req.params.userId
      );
      res.json(messages2);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/conversations", authenticate2, async (req, res) => {
    try {
      const conversations2 = await storage.getConversations(req.user.id);
      res.json(conversations2);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/conversations", authenticate2, async (req, res) => {
    try {
      const { participant2Id } = req.body;
      const conversation = await storage.getOrCreateConversation(
        req.user.id,
        participant2Id
      );
      res.json(conversation);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get(
    "/api/conversations/:conversationId/messages",
    authenticate2,
    async (req, res) => {
      try {
        const { conversationId } = req.params;
        const { limit } = req.query;
        const messages2 = await storage.getConversationMessages(
          conversationId,
          limit ? parseInt(limit) : void 0
        );
        res.json(messages2);
      } catch (error) {
        res.status(500).json({ message: "Server error" });
      }
    }
  );
  app2.post(
    "/api/conversations/:conversationId/messages",
    authenticate2,
    async (req, res) => {
      try {
        const { conversationId } = req.params;
        console.log("Sending message:", {
          conversationId,
          body: req.body,
          userId: req.user.id
        });
        const messageData = {
          ...req.body,
          senderId: req.user.id,
          conversationId
        };
        console.log("Message data before validation:", messageData);
        const validatedData = insertMessageSchema.parse(messageData);
        console.log("Validated data:", validatedData);
        const message = await storage.sendConversationMessage(validatedData);
        console.log("Message created:", message);
        const conversations2 = await storage.getConversations(req.user.id);
        const conversation = conversations2.find((c) => c.id === conversationId);
        if (!conversation) {
          return res.status(404).json({ message: "Conversation not found" });
        }
        const recipientId = conversation.participant1Id === req.user.id ? conversation.participant2Id : conversation.participant1Id;
        const sender = await storage.getUser(req.user.id);
        if (sender) {
          await storage.createNotification({
            userId: recipientId,
            actorId: req.user.id,
            type: "message",
            title: "New Message",
            message: `${sender.firstName} ${sender.lastName} sent you a message`,
            actionUrl: `/messages?conversation=${conversationId}`
          });
        }
        const wsMessage = JSON.stringify({
          type: "new_message",
          message,
          sender: { ...req.user, password: void 0 }
        });
        wsClients.forEach((ws2) => {
          if (ws2.readyState === WebSocket2.OPEN) {
            ws2.send(wsMessage);
          }
        });
        res.json(message);
      } catch (error) {
        console.error("Error sending message:", error);
        if (error instanceof ZodError) {
          return res.status(400).json({ message: "Invalid data", errors: error.errors });
        }
        res.status(500).json({
          message: "Server error",
          error: typeof error === "object" && error !== null && "message" in error ? error.message : String(error)
        });
      }
    }
  );
  app2.get("/api/featured-artists", async (req, res) => {
    try {
      const search = req.query.search;
      const featuredArtists = await storage.getFeaturedArtists(search);
      res.json(
        featuredArtists.map((artist) => ({
          ...artist,
          password: void 0
        }))
      );
    } catch (error) {
      console.error("Featured artists error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/artists", async (req, res) => {
    try {
      const allArtists = await storage.getAllArtists();
      res.json(
        allArtists.map((artist) => {
          const { password, ...rest } = artist;
          return rest;
        })
      );
    } catch (error) {
      console.error("All artists error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/search/users", (req, res) => {
    const q = req.query.q;
    const users2 = [
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        username: "indieartist",
        firstName: "Indie",
        lastName: "Artist",
        role: "artist",
        profileImage: null,
        emailVerified: true
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440003",
        username: "musiclover",
        firstName: "Music",
        lastName: "Lover",
        role: "fan",
        profileImage: null,
        emailVerified: false
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440004",
        username: "beatmaker",
        firstName: "Beat",
        lastName: "Maker",
        role: "artist",
        profileImage: null,
        emailVerified: false
      }
    ];
    if (!q) {
      return res.json([]);
    }
    const query = q.toLowerCase();
    const filtered = users2.filter(
      (user) => user.username.toLowerCase().includes(query) || user.firstName.toLowerCase().includes(query) || user.lastName.toLowerCase().includes(query)
    );
    res.json(filtered);
  });
  app2.get("/api/notifications", authenticate2, async (req, res) => {
    try {
      const { limit } = req.query;
      const notifications2 = await storage.getUserNotifications(
        req.user.id,
        limit ? parseInt(limit) : void 0
      );
      res.json(notifications2);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get(
    "/api/notifications/unread-count",
    authenticate2,
    async (req, res) => {
      try {
        const count2 = await storage.getUnreadNotificationCount(req.user.id);
        res.json({ count: count2 });
      } catch (error) {
        console.error("Get unread count error:", error);
        res.status(500).json({ message: "Server error" });
      }
    }
  );
  app2.patch("/api/notifications/:id/read", authenticate2, async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.patch(
    "/api/notifications/mark-all-read",
    authenticate2,
    async (req, res) => {
      try {
        await storage.markAllNotificationsAsRead(req.user.id);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ message: "Server error" });
      }
    }
  );
  app2.get("/api/test", (req, res) => {
    res.json({ message: "Server is working" });
  });
  app2.get("/api/users/:userId/mixxlists", async (req, res) => {
    try {
      const { userId } = req.params;
      const mixxlists = await storage.getUserMixxlists(userId);
      res.json(mixxlists);
    } catch (error) {
      console.error("Get user mixxlists error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/users/:userId/playlists", async (req, res) => {
    try {
      const { userId } = req.params;
      const mixxlists = await storage.getUserMixxlists(userId);
      res.json(mixxlists);
    } catch (error) {
      console.error("Get user playlists error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/mixxlists", authenticate2, async (req, res) => {
    try {
      const mixxlistData = {
        ...req.body,
        creatorId: req.user.id,
        type: "mixxlist"
      };
      const validatedData = insertPlaylistSchema.parse(mixxlistData);
      const mixxlist = await storage.createPlaylist(validatedData);
      res.json(mixxlist);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create mixxlist error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get(
    "/api/users/:userId/purchased-tracks",
    authenticate2,
    async (req, res) => {
      try {
        const { userId } = req.params;
        if (userId !== req.user.id) {
          return res.status(403).json({ message: "Unauthorized" });
        }
        const purchasedTracks2 = await storage.getUserPurchasedTracks(userId);
        res.json(purchasedTracks2);
      } catch (error) {
        console.error("Get purchased tracks error:", error);
        res.status(500).json({ message: "Server error" });
      }
    }
  );
  app2.get("/api/users/:userId/favorite-artists", async (req, res) => {
    try {
      const { userId } = req.params;
      const favoriteArtists = await storage.getUserFavoriteArtists(userId);
      res.json(favoriteArtists);
    } catch (error) {
      console.error("Get favorite artists error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/tracks/purchase", authenticate2, async (req, res) => {
    try {
      const { trackId, mixxlistId } = req.body;
      const track = await storage.getTrack(trackId);
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }
      const existingPurchase = await storage.getUserTrackPurchase(
        req.user.id,
        trackId
      );
      if (existingPurchase) {
        return res.status(400).json({ message: "You already own this track" });
      }
      const amount = Math.round(parseFloat(track.price || "0.99") * 100);
      const paymentIntent = await stripe2.paymentIntents.create({
        amount,
        currency: "gbp",
        metadata: {
          userId: req.user.id,
          trackId,
          mixxlistId: mixxlistId || ""
        }
      });
      res.json({
        clientSecret: paymentIntent.client_secret,
        amount: track.price || "0.99"
      });
    } catch (error) {
      console.error("Track purchase error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/webhooks/stripe", async (req, res) => {
    try {
      const event = req.body;
      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const { userId, trackId, mixxlistId } = paymentIntent.metadata;
        const purchaseData = {
          userId,
          trackId,
          price: (paymentIntent.amount / 100).toString(),
          stripePaymentIntentId: paymentIntent.id
        };
        const validatedData = insertPurchasedTrackSchema.parse(purchaseData);
        await storage.recordTrackPurchase(validatedData);
        if (mixxlistId) {
          await storage.addTrackToPlaylist(mixxlistId, trackId);
        }
        const track = await storage.getTrack(trackId);
        const buyer = await storage.getUser(userId);
        if (track && buyer) {
          await storage.createNotification({
            userId: track.artistId,
            actorId: userId,
            type: "tip",
            title: "Track Purchased!",
            message: `${buyer.firstName} ${buyer.lastName} purchased your track "${track.title}"`,
            actionUrl: `/profile/${track.artistId}`
          });
        }
      }
      res.json({ received: true });
    } catch (error) {
      console.error("Stripe webhook error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/test-notification", authenticate2, async (req, res) => {
    try {
      await storage.createNotification({
        userId: req.user.id,
        actorId: req.user.id,
        type: "follow",
        title: "Test Notification",
        message: "This is a test notification to verify the system is working",
        actionUrl: "/profile"
      });
      res.json({ success: true, message: "Test notification created" });
    } catch (error) {
      console.error("Test notification error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/messages", authenticate2, async (req, res) => {
    try {
      const messageData = {
        ...req.body,
        senderId: req.user.id
      };
      const validatedData = insertMessageSchema.parse(messageData);
      const message = await storage.sendMessage(validatedData);
      const wsMessage = JSON.stringify({
        type: "new_message",
        message,
        sender: { ...req.user, password: void 0 }
      });
      wsClients.forEach((ws2) => {
        if (ws2.readyState === WebSocket2.OPEN) {
          ws2.send(wsMessage);
        }
      });
      res.json(message);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      const paymentIntent = await stripe2.paymentIntents.create({
        amount: Math.round(amount * 100),
        // Convert to cents
        currency: "usd"
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });
  app2.post("/api/create-subscription", authenticate2, async (req, res) => {
    try {
      const { id, email } = req.user;
      const user = await storage.getUser(id);
      if (!user) return res.status(404).json({ message: "User not found" });
      const priceId = process.env.STRIPE_PRICE_ID;
      if (!priceId)
        return res.status(500).json({ message: "STRIPE_PRICE_ID not set" });
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe2.customers.create({ email });
        customerId = customer.id;
        await storage.updateUser(id, { stripeCustomerId: customerId });
      }
      const inactiveStatuses = [
        "canceled",
        "unpaid",
        "incomplete_expired"
      ];
      const hasActiveSubscription = user.stripeSubscriptionId && user.subscriptionStatus && !inactiveStatuses.includes(user.subscriptionStatus);
      if (hasActiveSubscription) {
        return res.status(400).json({ message: "User already has an active subscription" });
      }
      const session = await stripe2.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        subscription_data: { trial_period_days: 90, metadata: { userId: id } },
        expand: ["subscription"],
        // ensures session.subscription is a Subscription object
        allow_promotion_codes: true,
        success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`
      });
      const subscriptionObj = typeof session.subscription === "string" ? null : session.subscription;
      const trialEndsAt = subscriptionObj ? new Date((subscriptionObj.trial_end ?? 0) * 1e3) : null;
      await storage.updateUser(id, {
        stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : session.subscription?.id ?? null
      });
      res.json({ url: session.url, trialEndsAt });
    } catch (err) {
      console.error("Error creating subscription:", err);
      res.status(500).json({ message: err.message || "Internal server error" });
    }
  });
  app2.get("/api/checkout/verify", authenticate2, async (req, res) => {
    try {
      const { session_id } = req.query;
      const { id: userId } = req.user;
      if (!session_id)
        return res.status(400).json({ message: "Missing session_id" });
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      if (user.stripeSubscriptionId && user.subscriptionStatus) {
        return res.json({
          subscriptionId: user.stripeSubscriptionId,
          status: user.subscriptionStatus,
          trialEndsAt: user.trialEndsAt
        });
      }
      const session = await stripe2.checkout.sessions.retrieve(
        session_id,
        {
          expand: ["subscription"]
        }
      );
      if (!session || !session.subscription) {
        return res.status(404).json({ message: "Subscription not found in session" });
      }
      const subscription = session.subscription;
      console.log("verify subscription", subscription);
      const trialEndsAt = subscription.trial_end ? new Date(subscription.trial_end * 1e3) : null;
      await storage.updateUser(userId, {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status || "trialing",
        trialEndsAt,
        hasUsedTrial: true
      });
      res.json({
        subscriptionId: subscription.id,
        status: subscription.status || "trialing",
        trialEndsAt
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  });
  app2.post("/api/subscription/cancel", authenticate2, async (req, res) => {
    try {
      const { id } = req.user;
      const user = await storage.getUser(id);
      if (!user?.stripeSubscriptionId) {
        return res.status(400).json({ message: "No active subscription found" });
      }
      const subscription = await stripe2.subscriptions.cancel(
        user.stripeSubscriptionId
      );
      const updatedUser = await storage.updateUser(id, {
        subscriptionStatus: subscription.status,
        // "canceled"
        trialEndsAt: null,
        hasUsedTrial: true
        // optional, mark trial used if needed
      });
      res.json({
        message: "Subscription cancelled immediately",
        subscription,
        updatedUser
      });
    } catch (err) {
      console.error("Error cancelling subscription:", err);
      res.status(500).json({ message: err.message || "Internal server error" });
    }
  });
  app2.post("/api/tips", authenticate2, async (req, res) => {
    try {
      const tipData = {
        ...req.body,
        fromUserId: req.user.id
      };
      const validatedData = insertTipSchema.parse(tipData);
      const tip = await storage.createTip(validatedData);
      const currency = req.body.currency || "GBP";
      const paymentIntent = await stripe2.paymentIntents.create({
        amount: Math.round(parseFloat(tip.amount) * 100),
        currency: currency.toLowerCase(),
        metadata: {
          tipId: tip.id,
          fromUserId: tip.fromUserId,
          toUserId: tip.toUserId,
          currency
        }
      });
      await storage.updateTipStatus(tip.id, "pending", paymentIntent.id);
      const tipper = await storage.getUser(req.user.id);
      if (tipper) {
        await storage.createNotification({
          userId: tip.toUserId,
          actorId: req.user.id,
          type: "tip",
          title: "New Tip Received",
          message: `${tipper.firstName} ${tipper.lastName} sent you a tip of ${currency === "GBP" ? "\xA3" : currency === "USD" ? "$" : currency === "EUR" ? "\u20AC" : ""}${tip.amount}`,
          actionUrl: `/profile/${tipper.username}`
        });
      }
      res.json({
        tip,
        clientSecret: paymentIntent.client_secret
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/radio/sessions/:id/go-live", async (req, res) => {
    try {
      const updated = await storage.goLive(req.params.id);
      if (!updated) {
        return res.status(404).json({ message: "Session not found" });
      } else {
        const wss3 = getWSS();
        wss3.clients.forEach((client) => {
          if (client.readyState === WebSocket2.OPEN) {
            client.send(
              JSON.stringify({
                type: "radio_session_updated",
                data: updated
              })
            );
          }
        });
      }
      res.json(updated);
    } catch (error) {
      console.error("Go live error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/radio/sessions/:id/end", async (req, res) => {
    try {
      const updated = await storage.endSession(req.params.id);
      if (!updated) {
        return res.status(404).json({ message: "Session not found" });
      } else {
        const wss3 = getWSS();
        wss3.clients.forEach((client) => {
          if (client.readyState === WebSocket2.OPEN) {
            client.send(
              JSON.stringify({
                type: "radio_session_updated",
                data: updated
              })
            );
          }
        });
      }
      res.json(updated);
    } catch (error) {
      console.error("End session error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/radio/sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllRadioSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/radio/active-session", async (req, res) => {
    try {
      const sessions = await storage.getActiveRadioSession();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/radio/sessions", authenticate2, async (req, res) => {
    try {
      const sessionData = {
        ...req.body,
        hostId: req.user.id,
        scheduledStart: req.body.scheduledStart ? new Date(req.body.scheduledStart) : void 0,
        scheduledEnd: req.body.scheduledEnd ? new Date(req.body.scheduledEnd) : void 0,
        actualStart: req.body.actualStart ? new Date(req.body.actualStart) : void 0,
        actualEnd: req.body.actualEnd ? new Date(req.body.actualEnd) : void 0
      };
      const validatedData = insertRadioSessionSchema.parse(sessionData);
      const session = await storage.createRadioSession(validatedData);
      res.json(session);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.patch("/api/radio/sessions/:id", authenticate2, async (req, res) => {
    try {
      const sessionId = req.params.id;
      const updateData = {
        ...req.body,
        scheduledStart: req.body.scheduledStart ? new Date(req.body.scheduledStart) : void 0,
        scheduledEnd: req.body.scheduledEnd ? new Date(req.body.scheduledEnd) : void 0,
        actualStart: req.body.actualStart ? new Date(req.body.actualStart) : void 0,
        actualEnd: req.body.actualEnd ? new Date(req.body.actualEnd) : void 0
      };
      const validatedData = updateRadioSessionSchema.parse(updateData);
      const updatedSession = await storage.updateRadioSession(
        sessionId,
        validatedData
      );
      res.json(updatedSession);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/radio-chat/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const messages2 = await storage.getRadioChatMessages(sessionId, 150);
      res.json(messages2);
    } catch (error) {
      console.error("Error fetching radio chat:", error);
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get("/api/collaborations", authenticate2, async (req, res) => {
    try {
      const collaborations2 = await storage.getCollaborationsByUser(req.user.id);
      res.json(collaborations2);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.get(
    "/api/collaborations/pending",
    authenticate2,
    async (req, res) => {
      try {
        const collaborations2 = await storage.getPendingCollaborations(
          req.user.id
        );
        res.json(collaborations2);
      } catch (error) {
        res.status(500).json({ message: "Server error" });
      }
    }
  );
  app2.post("/api/collaborations", authenticate2, async (req, res) => {
    try {
      const collabData = {
        ...req.body,
        requesterId: req.user.id
      };
      const validatedData = insertCollaborationSchema.parse(collabData);
      const collaboration = await storage.createCollaboration(validatedData);
      const message = JSON.stringify({
        type: "collaboration_request",
        collaboration,
        requester: { ...req.user, password: void 0 }
      });
      wsClients.forEach((ws2) => {
        if (ws2.readyState === WebSocket2.OPEN) {
          ws2.send(message);
        }
      });
      res.json(collaboration);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.patch("/api/collaborations/:id", authenticate2, async (req, res) => {
    try {
      const { status } = req.body;
      const collaboration = await storage.updateCollaborationStatus(
        req.params.id,
        status
      );
      const message = JSON.stringify({
        type: "collaboration_update",
        collaboration
      });
      wsClients.forEach((ws2) => {
        if (ws2.readyState === WebSocket2.OPEN) {
          ws2.send(message);
        }
      });
      res.json(collaboration);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  app2.post("/api/livestreams", authenticate2, async (req, res) => {
    try {
      if (req.user.role !== "artist") {
        return res.status(403).json({ message: "Only artists can create live streams" });
      }
      const streamData = insertLiveStreamSchema.parse({
        ...req.body,
        artistId: req.user.id
      });
      const stream = await storage.createLiveStream(streamData);
      await storage.notifyFollowers(
        req.user.id,
        `${req.user.username} is going live: ${stream.title}`
      );
      res.json(stream);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/livestreams", async (req, res) => {
    try {
      const activeStreams = await storage.getActiveLiveStreams();
      res.json(activeStreams);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/livestreams/:id", async (req, res) => {
    try {
      const stream = await storage.getLiveStream(req.params.id);
      if (!stream) {
        return res.status(404).json({ message: "Stream not found" });
      }
      res.json(stream);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post(
    "/api/livestreams/:id/start",
    authenticate2,
    async (req, res) => {
      try {
        const stream = await storage.getLiveStream(req.params.id);
        if (!stream) {
          return res.status(404).json({ message: "Stream not found" });
        }
        if (stream.artistId !== req.user.id) {
          return res.status(403).json({ message: "Not authorized" });
        }
        const updatedStream = await storage.startLiveStream(req.params.id);
        const message = JSON.stringify({
          type: "stream_started",
          stream: updatedStream
        });
        wsClients.forEach((ws2) => {
          if (ws2.readyState === WebSocket2.OPEN) {
            ws2.send(message);
          }
        });
        res.json(updatedStream);
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
  );
  app2.post("/api/livestreams/:id/end", authenticate2, async (req, res) => {
    try {
      const stream = await storage.getLiveStream(req.params.id);
      if (!stream) {
        return res.status(404).json({ message: "Stream not found" });
      }
      if (stream.artistId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
      }
      const updatedStream = await storage.endLiveStream(req.params.id);
      const message = JSON.stringify({
        type: "stream_ended",
        stream: updatedStream
      });
      wsClients.forEach((ws2) => {
        if (ws2.readyState === WebSocket2.OPEN) {
          ws2.send(message);
        }
      });
      res.json(updatedStream);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/livestreams/:id/join", authenticate2, async (req, res) => {
    try {
      await storage.joinLiveStream(req.params.id, req.user.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post(
    "/api/livestreams/:id/leave",
    authenticate2,
    async (req, res) => {
      try {
        await storage.leaveLiveStream(req.params.id, req.user.id);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ message: error.message });
      }
    }
  );
  app2.get("/api/livestreams/:id/messages", async (req, res) => {
    try {
      const messages2 = await storage.getLiveStreamMessages(req.params.id);
      res.json(messages2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post(
    "/api/livestreams/:id/messages",
    authenticate2,
    async (req, res) => {
      try {
        const messageData = insertLiveStreamMessageSchema.parse({
          ...req.body,
          streamId: req.params.id,
          userId: req.user.id
        });
        const message = await storage.addLiveStreamMessage(messageData);
        const wsMessage = JSON.stringify({
          type: "stream_message",
          message
        });
        wsClients.forEach((ws2) => {
          if (ws2.readyState === WebSocket2.OPEN) {
            ws2.send(wsMessage);
          }
        });
        res.json(message);
      } catch (error) {
        if (error instanceof ZodError) {
          return res.status(400).json({ message: "Invalid input", errors: error.errors });
        }
        res.status(500).json({ message: error.message });
      }
    }
  );
  app2.post("/api/livestreams/:id/tip", authenticate2, async (req, res) => {
    try {
      const { amount, message } = req.body;
      const stream = await storage.getLiveStream(req.params.id);
      if (!stream) {
        return res.status(404).json({ message: "Stream not found" });
      }
      const paymentIntent = await stripe2.paymentIntents.create({
        amount: Math.round(amount * 100),
        // Convert to cents
        currency: "gbp",
        metadata: {
          type: "livestream_tip",
          streamId: req.params.id,
          fromUserId: req.user.id,
          toUserId: stream.artistId
        }
      });
      const tip = await storage.createTip({
        fromUserId: req.user.id,
        toUserId: stream.artistId,
        liveStreamId: req.params.id,
        amount: amount.toString(),
        message
        // stripePaymentIntentId: paymentIntent.id,
      });
      res.json({
        clientSecret: paymentIntent.client_secret,
        tip
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  try {
    const { registerAdminRoutes: registerAdminRoutes2 } = await Promise.resolve().then(() => (init_admin_routes(), admin_routes_exports));
    const { registerUploadRoutes: registerUploadRoutes2 } = await Promise.resolve().then(() => (init_upload_routes(), upload_routes_exports));
    registerAdminRoutes2(app2);
    registerUploadRoutes2(app2);
  } catch (error) {
    console.error("Failed to register admin or upload routes:", error);
  }
  const httpServer = createServer(app2);
  const wss2 = new WebSocketServer2({
    server: httpServer,
    path: "/ws"
  });
  wss2.on("connection", (ws2, req) => {
    const clientId = Math.random().toString(36).substring(7);
    wsClients.set(clientId, ws2);
    ws2.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        switch (message.type) {
          case "join_radio":
            ws2.send(
              JSON.stringify({
                type: "radio_joined",
                sessionId: message.sessionId
              })
            );
            break;
          case "radio_chat":
            const chatMessage = JSON.stringify({
              type: "radio_chat",
              message: message.content,
              user: message.user,
              sessionId: message.sessionId,
              timestamp: (/* @__PURE__ */ new Date()).toISOString()
            });
            log("chatMessage", chatMessage);
            wsClients.forEach((client) => {
              if (client.readyState === WebSocket2.OPEN) {
                client.send(chatMessage);
              }
            });
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });
    ws2.on("close", () => {
      wsClients.delete(clientId);
    });
    ws2.on("error", (error) => {
      console.error("WebSocket error:", error);
      wsClients.delete(clientId);
    });
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, category, message } = req.body;
      console.log("Contact form submission:", {
        name,
        email,
        subject,
        category,
        message,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
      if (process.env.SENDGRID_API_KEY) {
        const sgMail = __require("@sendgrid/mail");
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const supportEmailMsg = {
          to: "hello@mixxl.fm",
          from: "noreply@mixxl.fm",
          // Must be verified sender in SendGrid
          subject: `New Contact Form Submission: ${subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">New Contact Form Submission</h1>
              </div>
              <div style="padding: 20px; background: #f9fafb; border: 1px solid #e5e7eb;">
                <h2 style="color: #374151; margin-top: 0;">Contact Details</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Category:</strong> ${category}</p>
                <p><strong>Subject:</strong> ${subject}</p>
                
                <h3 style="color: #374151;">Message:</h3>
                <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #d1d5db;">
                  ${message.replace(/\n/g, "<br>")}
                </div>
                
                <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px;">
                  Submitted on: ${(/* @__PURE__ */ new Date()).toLocaleString()}<br>
                  Reply directly to this email to respond to ${name} at ${email}
                </p>
              </div>
            </div>
          `
        };
        const userConfirmationMsg = {
          to: email,
          from: "noreply@mixxl.fm",
          subject: "Thank you for contacting Mixxl",
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #ec4899, #8b5cf6); padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">Thank You for Contacting Mixxl</h1>
              </div>
              <div style="padding: 20px; background: #f9fafb; border: 1px solid #e5e7eb;">
                <p>Hi ${name},</p>
                <p>Thank you for reaching out to us! We've received your message and will get back to you within 24 hours.</p>
                
                <div style="background: white; padding: 15px; border-radius: 8px; border: 1px solid #d1d5db; margin: 20px 0;">
                  <h3 style="margin-top: 0; color: #374151;">Your Message Summary:</h3>
                  <p><strong>Subject:</strong> ${subject}</p>
                  <p><strong>Category:</strong> ${category}</p>
                </div>
                
                <p>If you have any urgent concerns, you can also reach us at hello@mixxl.fm</p>
                
                <p>Best regards,<br>The Mixxl Team</p>
              </div>
            </div>
          `
        };
        try {
          await sgMail.send(supportEmailMsg);
          await sgMail.send(userConfirmationMsg);
          console.log("Contact form emails sent successfully");
        } catch (emailError) {
          console.error("Failed to send contact form emails:", emailError);
        }
      }
      res.json({
        success: true,
        message: "Contact form submitted successfully"
      });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit contact form"
      });
    }
  });
  return httpServer;
}

// server/index.ts
init_vite();
import "dotenv/config";
import cors from "cors";
import http from "http";
var app = express2();
var NODE_ENV = process.env.NODE_ENV || "development";
var PORT = parseInt(process.env.PORT || "5000", 10);
var CORS_ORIGIN = NODE_ENV === "development" ? "http://localhost:5173" : "https://mixxl.fm";
app.use(cors({ origin: CORS_ORIGIN, credentials: true }));
app.options("*", cors({ origin: CORS_ORIGIN, credentials: true }));
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use("/uploads", express2.static(path4.join(process.cwd(), "uploads")));
(async () => {
  const server = http.createServer(app);
  await registerRoutes(app);
  createWSS(server);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    if (NODE_ENV === "development") console.error(err);
  });
  if (NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  server.listen(PORT, "0.0.0.0", () => {
    log(`\u{1F680} [${NODE_ENV}] Server running at http://0.0.0.0:${PORT}`);
  });
})();
