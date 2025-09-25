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
  bigint,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const roleEnum = pgEnum("role", ["fan", "artist", "admin", "DJ"]);
export const messageTypeEnum = pgEnum("message_type", [
  "text",
  "track",
  "collaboration",
]);
export const statusEnum = pgEnum("status", ["pending", "completed", "failed"]);
export const collaborationStatusEnum = pgEnum("collaboration_status", [
  "pending",
  "accepted",
  "rejected",
  "completed",
]);
export const collaborationTypeEnum = pgEnum("collaboration_type", [
  "remix",
  "feature",
  "production",
  "songwriting",
]);
export const badgeTypeEnum = pgEnum("badge_type", [
  "achievement",
  "milestone",
  "special",
]);
export const liveStreamStatusEnum = pgEnum("live_stream_status", [
  "scheduled",
  "live",
  "ended",
  "cancelled",
]);
export const featuredSpotStatusEnum = pgEnum("featured_spot_status", [
  "active",
  "pending",
  "expired",
  "cancelled",
]);
export const broadcastTypeEnum = pgEnum("broadcast_type", [
  "notification",
  "email",
  "both",
]);
export const broadcastStatusEnum = pgEnum("broadcast_status", [
  "draft",
  "scheduled",
  "sent",
  "failed",
]);
export const discountCodeTypeEnum = pgEnum("discount_code_type", [
  "free_subscription",
  "percentage_off",
  "fixed_amount",
]);
export const discountCodeStatusEnum = pgEnum("discount_code_status", [
  "active",
  "inactive",
  "expired",
  "used_up",
]);
export const currencyEnum = pgEnum("currency", [
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
  "HKD",
]);

// payment_status enum
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "succeeded",
  "failed",
  "refunded",
]);

// Email verification tokens table
export const emailVerificationTokens = pgTable(
  "email_verification_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userIdx: index("email_verification_tokens_user_idx").on(table.userId),
    tokenIdx: index("email_verification_tokens_token_idx").on(table.token),
  })
);
// user subscription_status
export const subscriptionStatusEnum = pgEnum("subscription_status_enum", [
  "incomplete",
  "incomplete_expired",
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "paused",
  "lifetime_free",
]);

export const contactSubmissions = pgTable("contact_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  category: text("category").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const passwordResets = pgTable("password_resets", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull(), // hashed token
  expiresAt: bigint("expires_at", { mode: "number" }).notNull(),
});

// Users table
export const users = pgTable(
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
    country: varchar("country", { length: 2 }).notNull().default("GB"),
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

    // ✅ NEW: Stripe account state (kept in sync via webhook)
    stripeAccountId: varchar("stripe_account_id", { length: 100 }), // Stripe Connect account ID (express account for payouts)
    stripeChargesEnabled: boolean("stripe_charges_enabled").default(false), // true if account can accept charges
    stripePayoutsEnabled: boolean("stripe_payouts_enabled").default(false), // true if account can receive payouts
    stripeDisabledReason: varchar("stripe_disabled_reason", { length: 255 }), // reason why Stripe disabled account (e.g. "requirements.past_due")
    stripeRequirements: json("stripe_requirements"), // snapshot of Stripe's requirements object (what info is missing/needed)
    stripeAccountRaw: json("stripe_account_raw"), // optional: redacted raw account object for debugging/auditing (watch PII)

    lastStripeSyncAt: timestamp("last_stripe_sync_at"),
    // timestamp of last webhook sync with Stripe

    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
    usernameIdx: index("username_idx").on(table.username),
    roleIdx: index("role_idx").on(table.role),
  })
);

// Playlists/Mixxlists table (used for both artist playlists and fan Mixxlists)
export const playlists = pgTable(
  "playlists",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    creatorId: uuid("creator_id").notNull(),
    isPublic: boolean("is_public").default(true),
    coverImage: varchar("cover_image", { length: 500 }),
    trackCount: integer("track_count").default(0),
    totalDuration: integer("total_duration").default(0), // in seconds
    type: varchar("type", { length: 50 }).default("playlist"), // "playlist" or "mixxlist"
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    creatorIdx: index("playlists_creator_idx").on(table.creatorId),
    publicIdx: index("playlists_public_idx").on(table.isPublic),
    typeIdx: index("playlists_type_idx").on(table.type),
  })
);

// Playlist tracks junction table
export const playlistTracks = pgTable(
  "playlist_tracks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    playlistId: uuid("playlist_id").notNull(),
    trackId: uuid("track_id").notNull(),
    addedBy: uuid("added_by").notNull(),
    sortOrder: integer("sort_order").default(0),
    position: integer("position").notNull(),
    addedAt: timestamp("added_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    playlistIdx: index("playlist_tracks_playlist_idx").on(table.playlistId),
    trackIdx: index("playlist_tracks_track_idx").on(table.trackId),
  })
);

// Follows table for user relationships
export const follows = pgTable(
  "follows",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    followerId: uuid("follower_id").notNull(),
    followingId: uuid("following_id").notNull(),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    followerIdx: index("follows_follower_idx").on(table.followerId),
    followingIdx: index("follows_following_idx").on(table.followingId),
  })
);

// Tracks table
export const tracks = pgTable(
  "tracks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).notNull(),
    artistId: uuid("artist_id").notNull(),
    description: text("description"),
    genre: varchar("genre", { length: 100 }),
    mood: varchar("mood", { length: 100 }),
    tags: json("tags"),
    duration: integer("duration"), // in seconds
    fileUrl: varchar("file_url", { length: 500 }).notNull(),
    previewUrl: varchar("preview_url", { length: 500 }), // 30-second preview file
    previewDuration: integer("preview_duration").default(30), // preview length in seconds
    hasPreviewOnly: boolean("has_preview_only").default(false), // if true, only preview available until purchased
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
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    artistIdx: index("tracks_artist_idx").on(table.artistId),
    genreIdx: index("tracks_genre_idx").on(table.genre),
    publicIdx: index("tracks_public_idx").on(table.isPublic),
    createdIdx: index("tracks_created_idx").on(table.createdAt),
    previewIdx: index("tracks_preview_idx").on(table.hasPreviewOnly),
  })
);

// Purchased tracks table
export const purchasedTracks = pgTable(
  "purchased_tracks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    trackId: uuid("track_id").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 10 }).notNull().default("usd"),
    stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
    stripeCheckoutSessionId: varchar("stripe_checkout_session_id", {
      length: 255,
    }),
    stripeTransferId: varchar("stripe_transfer_id", { length: 255 }),
    paymentStatus: paymentStatusEnum("payment_status")
      .notNull()
      .default("pending"),
    purchasedAt: timestamp("purchased_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userIdx: index("purchased_tracks_user_idx").on(table.userId),
    trackIdx: index("purchased_tracks_track_idx").on(table.trackId),
    userTrackIdx: index("purchased_tracks_user_track_idx").on(
      table.userId,
      table.trackId
    ),
  })
);

// Tips table
export const tips = pgTable(
  "tips",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fromUserId: uuid("from_user_id").notNull(),
    toUserId: uuid("to_user_id").notNull(),
    trackId: uuid("track_id"),
    liveStreamId: uuid("live_stream_id"), // For live stream tips
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    message: text("message"),
    stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 100 }),
    status: statusEnum("status").default("pending"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    fromUserIdx: index("tips_from_user_idx").on(table.fromUserId),
    toUserIdx: index("tips_to_user_idx").on(table.toUserId),
    trackIdx: index("tips_track_idx").on(table.trackId),
    liveStreamIdx: index("tips_live_stream_idx").on(table.liveStreamId),
  })
);

// Radio sessions table
export const radioSessions = pgTable(
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
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    hostIdx: index("host_idx").on(table.hostId),
    liveIdx: index("live_idx").on(table.isLive),
    scheduledIdx: index("scheduled_idx").on(table.scheduledStart),
  })
);

// Radio chat message type enum
export const radioChatMessageTypeEnum = pgEnum("radio_chat_message_type", [
  "chat",
  "reaction",
  "system",
]);

// Radio chat table
export const radioChat = pgTable(
  "radio_chat",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id").notNull(),
    userId: uuid("user_id").notNull(),
    message: text("message").notNull(),
    messageType: radioChatMessageTypeEnum("message_type").default("chat"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    sessionIdx: index("session_idx").on(table.sessionId),
    userIdx: index("user_idx").on(table.userId),
    typeIdx: index("type_idx").on(table.messageType),
  })
);

// Collaborations table
export const collaborations = pgTable(
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
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    requesterIdx: index("requester_idx").on(table.requesterId),
    targetIdx: index("target_idx").on(table.targetId),
    statusIdx: index("status_idx").on(table.status),
  })
);

// Badges table
export const badges = pgTable("badges", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  iconUrl: varchar("icon_url", { length: 500 }),
  badgeType: badgeTypeEnum("badge_type").default("achievement"),
  criteria: json("criteria"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// User badges table
export const userBadges = pgTable(
  "user_badges",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(),
    badgeId: uuid("badge_id").notNull(),
    earnedAt: timestamp("earned_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userIdx: index("user_badges_user_idx").on(table.userId),
    badgeIdx: index("user_badges_badge_idx").on(table.badgeId),
  })
);

// Live Streams table
export const liveStreams = pgTable(
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
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    artistIdx: index("artist_stream_idx").on(table.artistId),
    statusIdx: index("stream_status_idx").on(table.status),
  })
);

// Live Stream Viewers table
export const liveStreamViewers = pgTable(
  "live_stream_viewers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    streamId: uuid("stream_id").notNull(),
    userId: uuid("user_id").notNull(),
    joinedAt: timestamp("joined_at").default(sql`CURRENT_TIMESTAMP`),
    leftAt: timestamp("left_at"),
  },
  (table) => ({
    streamIdx: index("stream_viewers_idx").on(table.streamId),
    userIdx: index("viewer_user_idx").on(table.userId),
  })
);

// Live Stream Messages/Chat table
export const liveStreamMessages = pgTable(
  "live_stream_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    streamId: uuid("stream_id").notNull(),
    userId: uuid("user_id").notNull(),
    message: text("message").notNull(),
    isTip: boolean("is_tip").default(false),
    tipAmount: decimal("tip_amount", { precision: 10, scale: 2 }),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    streamIdx: index("stream_messages_idx").on(table.streamId),
    createdAtIdx: index("stream_messages_time_idx").on(table.createdAt),
  })
);

// Conversations table for direct messaging
export const conversations = pgTable(
  "conversations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    participant1Id: uuid("participant1_id").notNull(),
    participant2Id: uuid("participant2_id").notNull(),
    lastMessageId: uuid("last_message_id"),
    lastMessageAt: timestamp("last_message_at").default(sql`CURRENT_TIMESTAMP`),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    participant1Idx: index("conversations_p1_idx").on(table.participant1Id),
    participant2Idx: index("conversations_p2_idx").on(table.participant2Id),
    lastMessageIdx: index("conversations_last_msg_idx").on(table.lastMessageAt),
  })
);

// Messages table for direct messaging
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    conversationId: uuid("conversation_id").notNull(),
    senderId: uuid("sender_id").notNull(),
    content: text("content").notNull(),
    messageType: messageTypeEnum("message_type").default("text"),
    trackId: uuid("track_id"), // for sharing tracks
    isRead: boolean("is_read").default(false),
    readAt: timestamp("read_at"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    conversationIdx: index("messages_conversation_idx").on(
      table.conversationId
    ),
    senderIdx: index("messages_sender_idx").on(table.senderId),
    createdAtIdx: index("messages_time_idx").on(table.createdAt),
  })
);

// Banners table to manage from admin dashboard
export const banners = pgTable(
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
    createdBy: uuid("created_by").notNull(), // FK to users.id
    deletedAt: timestamp("deleted_at"), // null = not deleted

    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    activeIdx: index("banners_active_idx").on(table.active),
    createdByIdx: index("banners_created_by_idx").on(table.createdBy),
  })
);

// Insert Banners schema
export const insertBannerSchema = createInsertSchema(banners)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    active: z.coerce.boolean(),
  });

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTrackSchema = createInsertSchema(tracks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  playCount: true,
  downloadCount: true,
  likesCount: true,
});

export const insertPlaylistSchema = createInsertSchema(playlists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  trackCount: true,
  totalDuration: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export const insertTipSchema = createInsertSchema(tips).omit({
  id: true,
  createdAt: true,
  status: true,
  stripePaymentIntentId: true,
});

export const insertRadioSessionSchema = createInsertSchema(radioSessions).omit({
  id: true,
  createdAt: true,
  isLive: true,
  listenerCount: true,
  actualStart: true,
  actualEnd: true,
});

export const updateRadioSessionSchema = insertRadioSessionSchema
  .extend({
    scheduledStart: z.date().optional(),
    scheduledEnd: z.date().optional(),
    actualStart: z.date().optional(),
    actualEnd: z.date().optional(),
  })
  .partial(); // make all fields optional for PATCH

export const insertCollaborationSchema = createInsertSchema(
  collaborations
).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export const insertLiveStreamSchema = createInsertSchema(liveStreams).omit({
  id: true,
  createdAt: true,
  viewerCount: true,
  maxViewers: true,
  totalTips: true,
  streamKey: true,
});

export const insertLiveStreamMessageSchema = createInsertSchema(
  liveStreamMessages
).omit({
  id: true,
  createdAt: true,
});

export const insertFollowerSchema = createInsertSchema(follows).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  lastMessageId: true,
  lastMessageAt: true,
});

export const insertContactSubmission = createInsertSchema(
  contactSubmissions
).omit({
  id: true,
  createdAt: true,
});

// Notifications table
export const notificationTypeEnum = pgEnum("notification_type", [
  "follow",
  "unfollow",
  "message",
  "tip",
  "live_stream",
  "profile_visit",
  "track_like",
  "playlist_follow",
  "collaboration_request",
  "comment",
  "purchase",
]);

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(), // recipient of notification
    actorId: uuid("actor_id").notNull(), // person who performed the action
    type: notificationTypeEnum("type").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    isRead: boolean("is_read").default(false),
    readAt: timestamp("read_at"),
    actionUrl: varchar("action_url", { length: 500 }), // link to relevant page
    metadata: json("metadata"), // additional context data
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    userIdx: index("notifications_user_idx").on(table.userId),
    actorIdx: index("notifications_actor_idx").on(table.actorId),
    typeIdx: index("notifications_type_idx").on(table.type),
    readIdx: index("notifications_read_idx").on(table.isRead),
    createdAtIdx: index("notifications_time_idx").on(table.createdAt),
  })
);

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  isRead: true,
  readAt: true,
});

export const insertPurchasedTrackSchema = createInsertSchema(
  purchasedTracks
).omit({
  id: true,
  purchasedAt: true,
});

export const insertEmailVerificationTokenSchema = createInsertSchema(
  emailVerificationTokens
).omit({
  id: true,
  createdAt: true,
});

// Featured spots table - paid placements in carousel
export const featuredSpots = pgTable(
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
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    artistIdx: index("featured_spots_artist_idx").on(table.artistId),
    statusIdx: index("featured_spots_status_idx").on(table.status),
    dateIdx: index("featured_spots_date_idx").on(
      table.startDate,
      table.endDate
    ),
    sortIdx: index("featured_spots_sort_idx").on(table.sortOrder),
  })
);

// Admin broadcasts table - site-wide notifications and emails
export const adminBroadcasts = pgTable(
  "admin_broadcasts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    createdBy: uuid("created_by").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    type: broadcastTypeEnum("type").notNull(),
    status: broadcastStatusEnum("status").default("draft"),
    targetAudience: varchar("target_audience", { length: 100 }).notNull(), // "all", "artists", "fans", "subscribers"
    specificUserIds: json("specific_user_ids").$type<string[]>(), // array of user IDs for targeted messages
    scheduledFor: timestamp("scheduled_for"),
    sentAt: timestamp("sent_at"),
    recipientCount: integer("recipient_count").default(0),
    openCount: integer("open_count").default(0),
    clickCount: integer("click_count").default(0),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    createdByIdx: index("admin_broadcasts_creator_idx").on(table.createdBy),
    statusIdx: index("admin_broadcasts_status_idx").on(table.status),
    typeIdx: index("admin_broadcasts_type_idx").on(table.type),
    targetIdx: index("admin_broadcasts_target_idx").on(table.targetAudience),
    scheduledIdx: index("admin_broadcasts_scheduled_idx").on(
      table.scheduledFor
    ),
  })
);

// Admin broadcast recipients table - tracking individual delivery
export const broadcastRecipients = pgTable(
  "broadcast_recipients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    broadcastId: uuid("broadcast_id").notNull(),
    userId: uuid("user_id").notNull(),
    status: varchar("status", { length: 50 }).default("pending"), // "pending", "sent", "delivered", "opened", "clicked", "failed"
    sentAt: timestamp("sent_at"),
    deliveredAt: timestamp("delivered_at"),
    openedAt: timestamp("opened_at"),
    clickedAt: timestamp("clicked_at"),
    failureReason: text("failure_reason"),
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    broadcastIdx: index("broadcast_recipients_broadcast_idx").on(
      table.broadcastId
    ),
    userIdx: index("broadcast_recipients_user_idx").on(table.userId),
    statusIdx: index("broadcast_recipients_status_idx").on(table.status),
  })
);

// Discount codes table - for free artist profiles and other discounts
export const discountCodes = pgTable(
  "discount_codes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: varchar("code", { length: 50 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    type: discountCodeTypeEnum("type").notNull(),
    value: decimal("value", { precision: 10, scale: 2 }), // percentage or fixed amount
    maxUses: integer("max_uses"), // null = unlimited
    usedCount: integer("used_count").default(0),
    status: discountCodeStatusEnum("status").default("active"),
    validFrom: timestamp("valid_from").notNull(),
    validUntil: timestamp("valid_until"),
    createdBy: uuid("created_by").notNull(),
    applicableRoles: json("applicable_roles"), // ["artist", "fan"] or null for all
    minimumAmount: decimal("minimum_amount", { precision: 10, scale: 2 }), // minimum order amount
    createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    codeIdx: index("discount_codes_code_idx").on(table.code),
    statusIdx: index("discount_codes_status_idx").on(table.status),
    typeIdx: index("discount_codes_type_idx").on(table.type),
    validityIdx: index("discount_codes_validity_idx").on(
      table.validFrom,
      table.validUntil
    ),
    createdByIdx: index("discount_codes_creator_idx").on(table.createdBy),
  })
);

// Discount code usage tracking
export const discountCodeUsage = pgTable(
  "discount_code_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    codeId: uuid("code_id").notNull(),
    userId: uuid("user_id").notNull(),
    orderId: varchar("order_id", { length: 255 }), // Stripe payment intent or subscription ID
    discountAmount: decimal("discount_amount", {
      precision: 10,
      scale: 2,
    }).notNull(),
    originalAmount: decimal("original_amount", { precision: 10, scale: 2 }),
    usedAt: timestamp("used_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    codeIdx: index("discount_code_usage_code_idx").on(table.codeId),
    userIdx: index("discount_code_usage_user_idx").on(table.userId),
    orderIdx: index("discount_code_usage_order_idx").on(table.orderId),
  })
);

export const insertFeaturedSpotSchema = createInsertSchema(featuredSpots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  paidAt: true,
});

export const insertAdminBroadcastSchema = createInsertSchema(adminBroadcasts)
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
    // status: true,
    sentAt: true,
    recipientCount: true,
    openCount: true,
    clickCount: true,
  })
  .extend({
    scheduledFor: z
      .union([z.date(), z.string(), z.null()])
      .optional()
      .nullable(),
  });

export const insertBroadcastRecipientSchema = createInsertSchema(
  broadcastRecipients
).omit({
  id: true,
  createdAt: true,
});

export const insertDiscountCodeSchema = createInsertSchema(discountCodes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usedCount: true,
});

export const insertDiscountCodeUsageSchema = createInsertSchema(
  discountCodeUsage
).omit({
  id: true,
  usedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type Artist = User & {
  isFollowing: boolean;
};
export type PurchasedTrack = typeof purchasedTracks.$inferSelect;
export type InsertPurchasedTrack = z.infer<typeof insertPurchasedTrackSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Track = typeof tracks.$inferSelect;
export type InsertTrack = z.infer<typeof insertTrackSchema>;

export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export type TrackExtended = Track & {
  artistId?: string;
  artistName?: string;
  purchaseStatus: PaymentStatus;
  position?: number;
};
export type Playlist = typeof playlists.$inferSelect;
export type InsertPlaylist = z.infer<typeof insertPlaylistSchema>;
export type PlaylistTrack = typeof playlistTracks.$inferSelect;
export type Follow = typeof follows.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Tip = typeof tips.$inferSelect;
export type InsertTip = z.infer<typeof insertTipSchema>;
export type RadioSession = typeof radioSessions.$inferSelect;
export type InsertRadioSession = z.infer<typeof insertRadioSessionSchema>;
export type RadioChatMessage = typeof radioChat.$inferSelect;
export type RadioChatMessageWithUser = RadioChatMessage & {
  userId: string;
  user: {
    id: string;
    username: string;
    role: string;
    profileImage?: string | null;
  };
};
export type Collaboration = typeof collaborations.$inferSelect;
export type InsertCollaboration = z.infer<typeof insertCollaborationSchema>;
export type Badge = typeof badges.$inferSelect;
export type UserBadge = typeof userBadges.$inferSelect;
export type LiveStream = typeof liveStreams.$inferSelect;
export type InsertLiveStream = z.infer<typeof insertLiveStreamSchema>;
export type LiveStreamMessage = typeof liveStreamMessages.$inferSelect;
export type InsertLiveStreamMessage = z.infer<
  typeof insertLiveStreamMessageSchema
>;
export type Follower = typeof follows.$inferSelect;
export type InsertFollower = z.infer<typeof insertFollowerSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type EmailVerificationToken =
  typeof emailVerificationTokens.$inferSelect;
export type InsertEmailVerificationToken = z.infer<
  typeof insertEmailVerificationTokenSchema
>;
export type FeaturedSpot = typeof featuredSpots.$inferSelect;
export type InsertFeaturedSpot = z.infer<typeof insertFeaturedSpotSchema>;
export type DiscountCode = typeof discountCodes.$inferSelect;
export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;
export type DiscountCodeUsage = typeof discountCodeUsage.$inferSelect;
export type InsertDiscountCodeUsage = z.infer<
  typeof insertDiscountCodeUsageSchema
>;
export type AdminBroadcast = typeof adminBroadcasts.$inferSelect;
export type InsertAdminBroadcast = z.infer<typeof insertAdminBroadcastSchema>;
export type BroadcastRecipient = typeof broadcastRecipients.$inferSelect;
export type InsertBroadcastRecipient = z.infer<
  typeof insertBroadcastRecipientSchema
>;
export type Banner = typeof banners.$inferSelect;
export type InsertBanner = z.infer<typeof insertBannerSchema>;
export type PasswordResetInsert = typeof passwordResets.$inferInsert;
export type PasswordReset = typeof passwordResets.$inferSelect;
export type Contact = typeof contactSubmissions.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSubmission>;
export type FeaturedArtistFilters = {
  search?: string;
  genre?: string;
  mood?: string;
  sort?: "newest" | "oldest" | "most_played" | "most_liked" | "alphabetical";
};
