CREATE TYPE "public"."badge_type" AS ENUM('achievement', 'milestone', 'special');--> statement-breakpoint
CREATE TYPE "public"."broadcast_status" AS ENUM('draft', 'scheduled', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."broadcast_type" AS ENUM('notification', 'email', 'both');--> statement-breakpoint
CREATE TYPE "public"."collaboration_status" AS ENUM('pending', 'accepted', 'rejected', 'completed');--> statement-breakpoint
CREATE TYPE "public"."collaboration_type" AS ENUM('remix', 'feature', 'production', 'songwriting');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('GBP', 'USD', 'EUR', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK', 'INR', 'BRL', 'MXN', 'KRW', 'SGD', 'NZD', 'ZAR', 'RUB', 'CNY', 'HKD');--> statement-breakpoint
CREATE TYPE "public"."discount_code_status" AS ENUM('active', 'inactive', 'expired', 'used_up');--> statement-breakpoint
CREATE TYPE "public"."discount_code_type" AS ENUM('free_subscription', 'percentage_off', 'fixed_amount');--> statement-breakpoint
CREATE TYPE "public"."featured_spot_status" AS ENUM('active', 'pending', 'expired', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."live_stream_status" AS ENUM('scheduled', 'live', 'ended', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."message_type" AS ENUM('text', 'track', 'collaboration');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('follow', 'unfollow', 'message', 'tip', 'live_stream', 'profile_visit', 'track_like', 'playlist_follow', 'collaboration_request', 'comment', 'purchase');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'succeeded', 'failed', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."radio_chat_message_type" AS ENUM('chat', 'reaction', 'system');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('fan', 'artist', 'admin', 'DJ');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."subscription_status_enum" AS ENUM('incomplete', 'incomplete_expired', 'trialing', 'active', 'past_due', 'canceled', 'unpaid', 'paused', 'lifetime_free');--> statement-breakpoint
CREATE TABLE "admin_broadcasts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_by" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"type" "broadcast_type" NOT NULL,
	"status" "broadcast_status" DEFAULT 'draft',
	"target_audience" varchar(100) NOT NULL,
	"specific_user_ids" json,
	"scheduled_for" timestamp,
	"sent_at" timestamp,
	"recipient_count" integer DEFAULT 0,
	"open_count" integer DEFAULT 0,
	"click_count" integer DEFAULT 0,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "albums" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"artist_id" uuid NOT NULL,
	"description" text,
	"cover_image" varchar(500),
	"release_date" timestamp DEFAULT CURRENT_TIMESTAMP,
	"is_public" boolean DEFAULT true,
	"price" numeric(10, 2) NOT NULL,
	"stripe_price_id" varchar(255),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"icon_url" varchar(500),
	"badge_type" "badge_type" DEFAULT 'achievement',
	"criteria" json,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "banners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"cta" varchar(100),
	"cta_url" varchar(500),
	"image_url" varchar(500) NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_by" uuid NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "broadcast_recipients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"broadcast_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" varchar(50) DEFAULT 'pending',
	"sent_at" timestamp,
	"delivered_at" timestamp,
	"opened_at" timestamp,
	"clicked_at" timestamp,
	"failure_reason" text,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "collaborations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"requester_id" uuid NOT NULL,
	"target_id" uuid NOT NULL,
	"track_id" uuid,
	"message" text,
	"status" "collaboration_status" DEFAULT 'pending',
	"collaboration_type" "collaboration_type",
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "contact_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"subject" text NOT NULL,
	"category" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "conversations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant1_id" uuid NOT NULL,
	"participant2_id" uuid NOT NULL,
	"last_message_id" uuid,
	"last_message_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "discount_code_usage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"order_id" varchar(255),
	"discount_amount" numeric(10, 2) NOT NULL,
	"original_amount" numeric(10, 2),
	"used_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "discount_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"type" "discount_code_type" NOT NULL,
	"value" numeric(10, 2),
	"max_uses" integer,
	"used_count" integer DEFAULT 0,
	"status" "discount_code_status" DEFAULT 'active',
	"valid_from" timestamp NOT NULL,
	"valid_until" timestamp,
	"created_by" uuid NOT NULL,
	"applicable_roles" json,
	"minimum_amount" numeric(10, 2),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "discount_codes_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "email_verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "email_verification_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "featured_spots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"artist_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"image_url" varchar(500),
	"video_url" varchar(500),
	"button_text" varchar(100) DEFAULT 'Visit Profile',
	"button_url" varchar(500),
	"sort_order" integer DEFAULT 0,
	"status" "featured_spot_status" DEFAULT 'pending',
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"price_usd" numeric(10, 2) NOT NULL,
	"stripe_payment_intent_id" varchar(100),
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follower_id" uuid NOT NULL,
	"following_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "live_stream_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stream_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"message" text NOT NULL,
	"is_tip" boolean DEFAULT false,
	"tip_amount" numeric(10, 2),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "live_stream_viewers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stream_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"joined_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"left_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "live_streams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"artist_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"scheduled_for" timestamp,
	"started_at" timestamp,
	"ended_at" timestamp,
	"status" "live_stream_status" DEFAULT 'scheduled',
	"viewer_count" integer DEFAULT 0,
	"max_viewers" integer DEFAULT 0,
	"total_tips" numeric(10, 2) DEFAULT '0.00',
	"stream_key" varchar(255),
	"thumbnail_url" varchar(500),
	"is_recorded" boolean DEFAULT false,
	"recording_url" varchar(500),
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"conversation_id" uuid NOT NULL,
	"sender_id" uuid NOT NULL,
	"content" text NOT NULL,
	"message_type" "message_type" DEFAULT 'text',
	"track_id" uuid,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"actor_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"read_at" timestamp,
	"action_url" varchar(500),
	"metadata" json,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "password_resets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"token" text NOT NULL,
	"expires_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "playlist_tracks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"playlist_id" uuid NOT NULL,
	"track_id" uuid NOT NULL,
	"added_by" uuid NOT NULL,
	"sort_order" integer DEFAULT 0,
	"position" integer NOT NULL,
	"added_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "playlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"creator_id" uuid NOT NULL,
	"is_public" boolean DEFAULT true,
	"cover_image" varchar(500),
	"track_count" integer DEFAULT 0,
	"total_duration" integer DEFAULT 0,
	"type" varchar(50) DEFAULT 'playlist',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "purchased_tracks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"track_id" uuid,
	"album_id" uuid,
	"price" numeric(10, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'gbp' NOT NULL,
	"stripe_payment_intent_id" varchar(255),
	"stripe_checkout_session_id" varchar(255),
	"stripe_transfer_id" varchar(255),
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"purchased_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "track_or_album_not_null" CHECK ((track_id IS NOT NULL OR album_id IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "radio_chat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"message" text NOT NULL,
	"message_type" "radio_chat_message_type" DEFAULT 'chat',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "radio_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"host_id" uuid NOT NULL,
	"radio_co_stream_id" varchar(100),
	"is_live" boolean DEFAULT false,
	"listener_count" integer DEFAULT 0,
	"current_track_id" uuid,
	"scheduled_start" timestamp NOT NULL,
	"scheduled_end" timestamp NOT NULL,
	"actual_start" timestamp,
	"actual_end" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "tips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"from_user_id" uuid NOT NULL,
	"to_user_id" uuid NOT NULL,
	"track_id" uuid,
	"live_stream_id" uuid,
	"amount" numeric(10, 2) NOT NULL,
	"message" text,
	"stripe_payment_intent_id" varchar(100),
	"status" "status" DEFAULT 'pending',
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "tracks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"artist_id" uuid NOT NULL,
	"description" text,
	"genre" varchar(100),
	"mood" varchar(100),
	"tags" json,
	"duration" integer,
	"file_url" varchar(500) NOT NULL,
	"preview_url" varchar(500),
	"preview_duration" integer DEFAULT 30,
	"has_preview_only" boolean DEFAULT false,
	"waveform_data" json,
	"cover_image" varchar(500),
	"price" numeric(10, 2),
	"is_public" boolean DEFAULT true,
	"is_explicit" boolean DEFAULT false,
	"submit_to_radio" boolean DEFAULT false,
	"download_count" integer DEFAULT 0,
	"play_count" integer DEFAULT 0,
	"likes_count" integer DEFAULT 0,
	"stripe_price_id" varchar(255),
	"album_id" uuid,
	"track_number" integer,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"badge_id" uuid NOT NULL,
	"earned_at" timestamp DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(50) NOT NULL,
	"password" text NOT NULL,
	"full_name" varchar(100),
	"role" "role" DEFAULT 'fan' NOT NULL,
	"bio" text,
	"country" varchar(2) DEFAULT 'GB' NOT NULL,
	"profile_image" varchar(500),
	"background_image" varchar(500),
	"location" varchar(255),
	"website" varchar(500),
	"social_media" json,
	"email_verified" boolean DEFAULT false,
	"email_verified_at" timestamp,
	"is_active" boolean DEFAULT true,
	"stripe_customer_id" varchar(100),
	"stripe_subscription_id" varchar(100),
	"subscription_status" "subscription_status_enum" DEFAULT 'incomplete',
	"trial_ends_at" timestamp,
	"has_used_trial" boolean DEFAULT false,
	"onboarding_complete" boolean DEFAULT false,
	"preferred_currency" "currency" DEFAULT 'GBP',
	"stripe_account_id" varchar(100),
	"stripe_charges_enabled" boolean DEFAULT false,
	"stripe_payouts_enabled" boolean DEFAULT false,
	"stripe_disabled_reason" varchar(255),
	"stripe_requirements" json,
	"stripe_account_raw" json,
	"last_stripe_sync_at" timestamp,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchased_tracks" ADD CONSTRAINT "purchased_tracks_track_id_tracks_id_fk" FOREIGN KEY ("track_id") REFERENCES "public"."tracks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchased_tracks" ADD CONSTRAINT "purchased_tracks_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_artist_id_users_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tracks" ADD CONSTRAINT "tracks_album_id_albums_id_fk" FOREIGN KEY ("album_id") REFERENCES "public"."albums"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "admin_broadcasts_creator_idx" ON "admin_broadcasts" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "admin_broadcasts_status_idx" ON "admin_broadcasts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "admin_broadcasts_type_idx" ON "admin_broadcasts" USING btree ("type");--> statement-breakpoint
CREATE INDEX "admin_broadcasts_target_idx" ON "admin_broadcasts" USING btree ("target_audience");--> statement-breakpoint
CREATE INDEX "admin_broadcasts_scheduled_idx" ON "admin_broadcasts" USING btree ("scheduled_for");--> statement-breakpoint
CREATE INDEX "albums_artist_idx" ON "albums" USING btree ("artist_id");--> statement-breakpoint
CREATE INDEX "albums_created_idx" ON "albums" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "banners_active_idx" ON "banners" USING btree ("active");--> statement-breakpoint
CREATE INDEX "banners_created_by_idx" ON "banners" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "broadcast_recipients_broadcast_idx" ON "broadcast_recipients" USING btree ("broadcast_id");--> statement-breakpoint
CREATE INDEX "broadcast_recipients_user_idx" ON "broadcast_recipients" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "broadcast_recipients_status_idx" ON "broadcast_recipients" USING btree ("status");--> statement-breakpoint
CREATE INDEX "requester_idx" ON "collaborations" USING btree ("requester_id");--> statement-breakpoint
CREATE INDEX "target_idx" ON "collaborations" USING btree ("target_id");--> statement-breakpoint
CREATE INDEX "status_idx" ON "collaborations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "conversations_p1_idx" ON "conversations" USING btree ("participant1_id");--> statement-breakpoint
CREATE INDEX "conversations_p2_idx" ON "conversations" USING btree ("participant2_id");--> statement-breakpoint
CREATE INDEX "conversations_last_msg_idx" ON "conversations" USING btree ("last_message_at");--> statement-breakpoint
CREATE INDEX "discount_code_usage_code_idx" ON "discount_code_usage" USING btree ("code_id");--> statement-breakpoint
CREATE INDEX "discount_code_usage_user_idx" ON "discount_code_usage" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "discount_code_usage_order_idx" ON "discount_code_usage" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "discount_codes_code_idx" ON "discount_codes" USING btree ("code");--> statement-breakpoint
CREATE INDEX "discount_codes_status_idx" ON "discount_codes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "discount_codes_type_idx" ON "discount_codes" USING btree ("type");--> statement-breakpoint
CREATE INDEX "discount_codes_validity_idx" ON "discount_codes" USING btree ("valid_from","valid_until");--> statement-breakpoint
CREATE INDEX "discount_codes_creator_idx" ON "discount_codes" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "email_verification_tokens_user_idx" ON "email_verification_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_verification_tokens_token_idx" ON "email_verification_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "featured_spots_artist_idx" ON "featured_spots" USING btree ("artist_id");--> statement-breakpoint
CREATE INDEX "featured_spots_status_idx" ON "featured_spots" USING btree ("status");--> statement-breakpoint
CREATE INDEX "featured_spots_date_idx" ON "featured_spots" USING btree ("start_date","end_date");--> statement-breakpoint
CREATE INDEX "featured_spots_sort_idx" ON "featured_spots" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "follows_follower_idx" ON "follows" USING btree ("follower_id");--> statement-breakpoint
CREATE INDEX "follows_following_idx" ON "follows" USING btree ("following_id");--> statement-breakpoint
CREATE INDEX "stream_messages_idx" ON "live_stream_messages" USING btree ("stream_id");--> statement-breakpoint
CREATE INDEX "stream_messages_time_idx" ON "live_stream_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "stream_viewers_idx" ON "live_stream_viewers" USING btree ("stream_id");--> statement-breakpoint
CREATE INDEX "viewer_user_idx" ON "live_stream_viewers" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "artist_stream_idx" ON "live_streams" USING btree ("artist_id");--> statement-breakpoint
CREATE INDEX "stream_status_idx" ON "live_streams" USING btree ("status");--> statement-breakpoint
CREATE INDEX "messages_conversation_idx" ON "messages" USING btree ("conversation_id");--> statement-breakpoint
CREATE INDEX "messages_sender_idx" ON "messages" USING btree ("sender_id");--> statement-breakpoint
CREATE INDEX "messages_time_idx" ON "messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_actor_idx" ON "notifications" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "notifications_type_idx" ON "notifications" USING btree ("type");--> statement-breakpoint
CREATE INDEX "notifications_read_idx" ON "notifications" USING btree ("is_read");--> statement-breakpoint
CREATE INDEX "notifications_time_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "playlist_tracks_playlist_idx" ON "playlist_tracks" USING btree ("playlist_id");--> statement-breakpoint
CREATE INDEX "playlist_tracks_track_idx" ON "playlist_tracks" USING btree ("track_id");--> statement-breakpoint
CREATE INDEX "playlists_creator_idx" ON "playlists" USING btree ("creator_id");--> statement-breakpoint
CREATE INDEX "playlists_public_idx" ON "playlists" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "playlists_type_idx" ON "playlists" USING btree ("type");--> statement-breakpoint
CREATE INDEX "purchased_tracks_user_idx" ON "purchased_tracks" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "purchased_tracks_track_idx" ON "purchased_tracks" USING btree ("track_id");--> statement-breakpoint
CREATE INDEX "purchased_tracks_user_track_idx" ON "purchased_tracks" USING btree ("user_id","track_id");--> statement-breakpoint
CREATE INDEX "session_idx" ON "radio_chat" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "user_idx" ON "radio_chat" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "type_idx" ON "radio_chat" USING btree ("message_type");--> statement-breakpoint
CREATE INDEX "host_idx" ON "radio_sessions" USING btree ("host_id");--> statement-breakpoint
CREATE INDEX "live_idx" ON "radio_sessions" USING btree ("is_live");--> statement-breakpoint
CREATE INDEX "scheduled_idx" ON "radio_sessions" USING btree ("scheduled_start");--> statement-breakpoint
CREATE INDEX "tips_from_user_idx" ON "tips" USING btree ("from_user_id");--> statement-breakpoint
CREATE INDEX "tips_to_user_idx" ON "tips" USING btree ("to_user_id");--> statement-breakpoint
CREATE INDEX "tips_track_idx" ON "tips" USING btree ("track_id");--> statement-breakpoint
CREATE INDEX "tips_live_stream_idx" ON "tips" USING btree ("live_stream_id");--> statement-breakpoint
CREATE INDEX "tracks_artist_idx" ON "tracks" USING btree ("artist_id");--> statement-breakpoint
CREATE INDEX "tracks_genre_idx" ON "tracks" USING btree ("genre");--> statement-breakpoint
CREATE INDEX "tracks_public_idx" ON "tracks" USING btree ("is_public");--> statement-breakpoint
CREATE INDEX "tracks_created_idx" ON "tracks" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "tracks_preview_idx" ON "tracks" USING btree ("has_preview_only");--> statement-breakpoint
CREATE INDEX "user_badges_user_idx" ON "user_badges" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "user_badges_badge_idx" ON "user_badges" USING btree ("badge_id");--> statement-breakpoint
CREATE INDEX "email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "username_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "role_idx" ON "users" USING btree ("role");