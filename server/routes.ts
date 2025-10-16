import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocket } from "ws";
import Stripe from "stripe";
import { storage } from "./storage";
import crypto from "crypto";
import {
  insertUserSchema,
  insertTrackSchema,
  insertPlaylistSchema,
  insertMessageSchema,
  insertTipSchema,
  insertRadioSessionSchema,
  insertCollaborationSchema,
  insertLiveStreamSchema,
  insertLiveStreamMessageSchema,
  insertPurchasedTrackSchema,
  updateRadioSessionSchema,
  InsertUser,
  updateTrackSchema,
  updatePlaylistSchema,
  insertAlbumSchema,
  updateAlbumSchema,
} from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";
import {
  sendEmail,
  generateVerificationEmail,
  generateContactEmail,
} from "./email";
// import {
//   generateVerificationToken,
//   getTokenExpirationDate,
//   isTokenExpired,
// } from "./utils";
import { log } from "./vite";
import { getWSS } from "./ws";
import { stripe } from "./stripe";
import { formatCountry } from "./utils";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// WebSocket clients storage
const wsClients = new Map<string, WebSocket>();

// Middleware for JWT authentication
const authenticate = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      let extraFields: Partial<InsertUser> = {};

      // If role = artist → check free quota
      if (userData.role === "artist") {
        const lifetimeFreeCount = await storage.countLifetimeFreeArtists();

        if (lifetimeFreeCount < 30) {
          extraFields = {
            subscriptionStatus: "lifetime_free",
            trialEndsAt: null,
            hasUsedTrial: true, // mark trial consumed so they don’t get double benefit
          };
        }
      }

      // Create user in DB
      const newUser = await storage.createUser({
        ...userData,
        ...extraFields,
        emailVerified: false,
      });

      // Generate verification token (contains only userId)
      const verificationToken = jwt.sign({ userId: newUser.id }, JWT_SECRET, {
        expiresIn: "1h",
      });

      // Send verification email
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
        text: emailContent.text,
      });

      // Auth token
      const jwtToken = jwt.sign({ userId: newUser.id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({
        message: "Signup successful. Verification email sent.",
        user: { ...newUser, password: undefined },
        token: jwtToken,
      });
    } catch (error) {
      console.error("Signup error:", error);
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Email verification route
  app.get("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string") {
        return res.status(400).json({ message: "Invalid token" });
      }

      // Decode token
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
      } catch {
        return res.status(400).json({ message: "Token invalid or expired" });
      }

      // Find user
      const user = await storage.getUser(decoded.userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.emailVerified) {
        return res.status(400).json({ message: "Email already verified" });
      }

      // Mark as verified
      const verifiedUser = await storage.updateUser(user.id, {
        emailVerified: true,
      });

      // Return a fresh JWT (could be same as signup one, but safer to refresh)
      const jwtToken = jwt.sign({ userId: verifiedUser.id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({
        message: "Email verified successfully",
        user: { ...verifiedUser, password: undefined },
        token: jwtToken,
      });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Resend verification route
  app.post("/api/auth/resend-verification", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ message: "Email is required" });

      const user = await storage.getUserByEmail(email);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (user.emailVerified) {
        return res.status(400).json({ message: "Email is already verified" });
      }

      // Generate new verification token
      const verificationToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: "1h",
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
        text: emailContent.text,
      });

      res.json({ message: "Verification email resent" });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("Login attempt for email:", email);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log("User not found for email:", email);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      console.log("User found, checking password...");
      const isValidPassword = await bcrypt.compare(password, user.password);
      console.log("Password check result:", isValidPassword);

      if (!isValidPassword) {
        console.log("Password comparison failed");
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      console.log("Login successful for user:", user.email);

      res.json({
        user: { ...user, password: undefined },
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Create Stripe Connect account for artist
  app.post("/api/artist/stripe-account", authenticate, async (req, res) => {
    try {
      const { id } = req.user;

      // 1. Fetch user
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // 2. Ensure user is an artist (not fan, not admin)
      if (user.role !== "artist") {
        return res
          .status(403)
          .json({ message: "Only artists can create Stripe accounts" });
      }

      // 3. Prevent duplicate accounts
      if (user.stripeAccountId) {
        return res.status(400).json({
          message: "Stripe account already exists",
          stripeAccountId: user.stripeAccountId,
        });
      }

      // 4. Create a Stripe Express account
      const account = await stripe.accounts.create({
        type: "express",
        country: user.country || "GB",
        email: user.email,
        metadata: {
          userId: user.id, // 🔑 useful for webhook reconciliation
        },
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: "individual", // TODO: support company accounts later
        individual: {
          first_name: user.firstName || undefined,
          last_name: user.lastName || undefined,
          email: user.email,
        },
        business_profile: {
          name: user.username,
          product_description: "Musician selling songs on Mixxl FM",
          url: user.website || "https://mixxl.fm",
        },
      } as Stripe.AccountCreateParams);

      // 5. Update DB with Stripe account state
      await storage.updateUser(id, {
        stripeAccountId: account.id,
        stripeChargesEnabled: account.charges_enabled || false,
        stripePayoutsEnabled: account.payouts_enabled || false,
        stripeDisabledReason: account.requirements?.disabled_reason || null,
        stripeRequirements: account.requirements || {},
        stripeAccountRaw: { id: account.id, type: account.type }, // lightweight snapshot, not full PII
        lastStripeSyncAt: new Date(),
      });

      // 6. Generate onboarding link
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.FRONTEND_URL}/artist/onboarding/refresh`,
        return_url: `${process.env.FRONTEND_URL}/artist/onboarding/complete`,
        type: "account_onboarding",
      });

      // 7. Respond with minimal data
      res.json({
        message: "Stripe account created",
        stripeAccountId: account.id,
        onboardingUrl: accountLink.url,
      });
    } catch (error) {
      console.error("Stripe account creation error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/artist/account-status", authenticate, async (req, res) => {
    try {
      const { id } = req.user;

      const user = await storage.getUser(id);
      if (!user) return res.status(404).json({ message: "User not found" });

      if (!user?.stripeAccountId)
        return res
          .status(404)
          .json({ message: "User doesn't have stripe connect account yet!" });
      const account = await stripe.accounts.retrieve(user?.stripeAccountId);

      let status: "none" | "pending" | "complete" | "rejected" = "none";
      let rejectReason: string | null = null;
      if (account.details_submitted) {
        if (account.requirements?.disabled_reason) {
          status = "rejected";
          rejectReason = account.requirements.disabled_reason; // e.g. "requirements.past_due"
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
          requirements: account.requirements,
        },
      });
    } catch (error) {
      console.error("Error fetching Stripe account status:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post(
    "/api/artist/stripe-account/refresh",
    authenticate,
    async (req, res) => {
      try {
        const { id } = req.user;

        // 1️⃣ Fetch user
        const user = await storage.getUser(id);
        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        // 2️⃣ Enforce artist role
        if (user.role !== "artist") {
          return res
            .status(403)
            .json({ message: "Only artists can refresh onboarding" });
        }

        // 3️⃣ Check if Stripe Connect account exists
        if (!user.stripeAccountId) {
          return res
            .status(400)
            .json({ message: "Stripe account not created yet" });
        }

        // 4️⃣ Create a fresh onboarding link
        const accountLink = await stripe.accountLinks.create({
          account: user.stripeAccountId,
          refresh_url: `${process.env.FRONTEND_URL}/artist/onboarding/refresh`,
          return_url: `${process.env.FRONTEND_URL}/artist/onboarding/complete`,
          type: "account_onboarding",
        });

        // 5️⃣ Update last sync timestamp for audit/logging
        await storage.updateUser(user.id, {
          lastStripeSyncAt: new Date(),
        });

        // 6️⃣ Return link to frontend (SPA-friendly)
        res.json({
          onboardingUrl: accountLink.url,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // optional: Stripe links expire in 24h
        });
      } catch (error) {
        console.error("Stripe account refresh error:", error);
        res.status(500).json({ message: "Server error" });
      }
    }
  );

  app.post("/api/artist/transactions", authenticate, async (req, res) => {
    try {
      const { id: userId } = req.user;

      // 1️⃣ Fetch artist from DB
      const artist = await storage.getUser(userId);
      if (!artist) {
        return res.status(404).json({ message: "User not found" });
      }
      if (!artist.stripeAccountId) {
        return res
          .status(400)
          .json({ message: "No Stripe account linked for this user" });
      }

      // 2️⃣ Get balance from Stripe (available + pending)
      const balance = await stripe.balance.retrieve({
        stripeAccount: artist.stripeAccountId,
      });

      // 3️⃣ Get last 20 balance transactions (charges, fees, payouts, refunds, etc.)
      const balanceTransactions = await stripe.balanceTransactions.list(
        { limit: 20 },
        { stripeAccount: artist.stripeAccountId }
      );

      const transactions = balanceTransactions.data.map((txn) => ({
        id: txn.id,
        amount: txn.amount,
        currency: txn.currency,
        type: txn.type,
        description: txn.description,
        net: txn.net,
        fee: txn.fee,
        status: txn.reporting_category,
        createdAt: new Date(txn.created * 1000),
      }));

      // 4️⃣ Get recent payouts
      const payouts = await stripe.payouts.list(
        { limit: 10 }, // configurable
        { stripeAccount: artist.stripeAccountId }
      );

      const payoutDetails = payouts.data.map((p) => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        status: p.status, // "pending" | "paid" | "in_transit" | "canceled" | "failed"
        arrivalDate: new Date(p.arrival_date * 1000),
        description: p.description,
        method: p.method, // "standard" | "instant"
        type: p.type, // always "payout"
        createdAt: new Date(p.created * 1000),
      }));

      // 5️⃣ Local DB purchases
      const localPurchases = await storage.getSoldTracksByArtist(userId);

      // 6️⃣ Response
      res.json({
        balance: {
          available: balance.available.map((b) => ({
            amount: b.amount,
            currency: b.currency,
          })),
          pending: balance.pending.map((b) => ({
            amount: b.amount,
            currency: b.currency,
          })),
        },
        transactions,
        payouts: payoutDetails,
        localPurchases,
      });
    } catch (err) {
      console.error("❌ Failed to fetch artist transactions:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", authenticate, (req: any, res) => {
    res.json({ ...req.user, password: undefined });
  });

  // Request password reset (send email with token)
  app.post("/api/auth/request-reset", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);

      if (!user) {
        // Do not reveal if user exists
        return res.json({
          message: "If the email exists, reset link has been sent",
        });
      }

      // Generate secure random token
      const token = crypto.randomBytes(32).toString("hex");
      const expiresAt = Date.now() + 1000 * 60 * 15; // 15 min expiry

      // Store hashed token in DB (so even if DB leaks, token isn’t usable)
      const hashedToken = await bcrypt.hash(token, 10);

      await storage.createPasswordReset({
        userId: user.id,
        token: hashedToken,
        expiresAt,
      });

      const resetUrl = `${
        process.env.FRONTEND_URL
      }/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

      const emailContent = {
        subject: "Password Reset Request",
        text: `Click the link to reset your password: ${resetUrl}`,
        html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. The link expires in 15 minutes.</p>`,
      };

      await sendEmail({
        to: email,
        from: "noreply@mixxl.fm",
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      res.json({ message: "If the email exists, reset link has been sent" });
    } catch (err) {
      console.error("Request reset error:", err);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Reset or change password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, token, newPassword, oldPassword } = req.body;

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "Invalid request" });
      }

      // --- CASE 1: Token-based reset ---
      if (token) {
        // Fetch latest valid reset record (non-expired handled in storage)
        const resetRecord = await storage.getPasswordResetByUserId(user.id);
        if (!resetRecord) {
          return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Verify token against hashed version in DB
        const isValid = await bcrypt.compare(token, resetRecord.token);
        if (!isValid) {
          return res.status(400).json({ message: "Invalid token" });
        }

        // Update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await storage.updateUser(user.id, { password: hashedPassword });

        // Delete token after use
        await storage.deletePasswordReset(user.id);

        return res.json({ message: "Password updated successfully" });
      }

      // --- CASE 2: Old-password change ---
      if (oldPassword) {
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) {
          return res.status(400).json({ message: "Old password is incorrect" });
        }

        // Update password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await storage.updateUser(user.id, { password: hashedPassword });

        return res.json({ message: "Password updated successfully" });
      }

      // If neither token nor oldPassword provided
      return res
        .status(400)
        .json({ message: "Invalid request: missing credentials" });
    } catch (err) {
      console.error("Reset password error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  });

  // User routes
  app.get("/api/user/:identifier", async (req, res) => {
    try {
      let user;
      const identifier = req.params.identifier;

      // Check if identifier looks like a UUID (36 chars with hyphens)
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
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

      // Create profile visit notification if user is logged in and viewing someone else's profile
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        try {
          const token = authHeader.replace("Bearer ", "");
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          const visitor = await storage.getUser(decoded.userId);

          if (visitor && visitor.id !== user.id) {
            await storage.createNotification({
              userId: user.id,
              actorId: visitor.id,
              type: "profile_visit",
              title: "Profile Visit",
              message: `${visitor.firstName} ${visitor.lastName} (@${visitor.username}) viewed your profile`,
              actionUrl: `/profile/${visitor.username}`,
            });
          }
        } catch (jwtError) {
          // Ignore JWT errors for anonymous profile views
        }
      }

      res.json({ ...user, password: undefined });
    } catch (error) {
      console.error("Get user error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Combined profile update + image upload route
  app.patch("/api/users/profile", authenticate, async (req: any, res) => {
    try {
      // remove null/undefined fields
      const updateData = Object.fromEntries(
        Object.entries(req.body).filter(
          ([_, v]) => v !== null && v !== undefined
        )
      );

      const user = await storage.updateUser(req.user.id, updateData);
      res.json({ ...user, password: undefined });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Album routes
  // -------------------- CREATE --------------------
  app.post("/api/albums", authenticate, async (req: any, res) => {
    try {
      const albumData = req.body;

      const validatedData = insertAlbumSchema.parse(albumData);
      const album = await storage.createAlbum({
        ...validatedData,
        artistId: req.user.id,
      });

      res.json(album);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Invalid data",
          errors: error.errors,
        });
      }
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // -------------------- GET BY ARTIST ID --------------------
  app.get("/api/albums/artist/:artistId", async (req, res) => {
    try {
      const { artistId } = req.params;

      if (!artistId) {
        return res.status(400).json({ message: "artistId is required" });
      }

      const result = await storage.getAlbumsByArtistId(artistId);

      res.json(result);
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // -------------------- GET BY ID --------------------
  app.get("/api/albums/:id", async (req, res) => {
    try {
      const album = await storage.getAlbum(req.params.id);
      if (!album) return res.status(404).json({ message: "Album not found" });
      res.json(album);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // -------------------- UPDATE --------------------
  app.patch("/api/albums/:id", authenticate, async (req: any, res) => {
    const albumId = req.params.id;

    try {
      // Validate payload
      const validatedData = updateAlbumSchema.parse(req.body);

      // Update album in transaction
      const updatedAlbum = await storage.updateAlbum(albumId, {
        ...validatedData,
        artistId: req.user.id, // enforce ownership
      });

      res.json(updatedAlbum);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Invalid data",
          errors: error.errors,
        });
      }
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // -------------------- DELETE --------------------
  // Optional: good to have, even if you don’t need immediately
  app.delete("/api/albums/:id", authenticate, async (req: any, res) => {
    try {
      const { id } = req.params;

      const existing = await storage.getAlbum(id);
      if (!existing)
        return res.status(404).json({ message: "Album not found" });
      if (existing.artistId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      await storage.deleteAlbum(id);
      res.json({ success: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Track routes
  app.get("/api/tracks", authenticate, async (req, res) => {
    try {
      const { id: userId } = req.user;

      const filters = {
        userId,
        search: req.query.search as string,
        submitToRadio:
          req.query.submitToRadio !== undefined
            ? req.query.submitToRadio === "true" // query params are strings
            : undefined,
      };

      const tracks = await storage.getTracks(filters);

      res.json(tracks);
    } catch (error) {
      console.error("Tracks error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // app.get("/api/tracks/search", async (req, res) => {
  //   try {
  //     const query = req.query.q as string;
  //     if (!query) {
  //       return res.status(400).json({ message: "Search query required" });
  //     }
  //     const tracks = await storage.searchTracks(query);
  //     res.json(tracks);
  //   } catch (error) {
  //     res.status(500).json({ message: "Server error" });
  //   }
  // });

  // route
  app.get("/api/tracks/:id", authenticate, async (req, res) => {
    try {
      const track = await storage.getTrack(req.params.id, req.user.id);
      if (!track) {
        return res
          .status(404)
          .json({ message: "Track not found or access denied" });
      }
      res.json(track);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/tracks", authenticate, async (req: any, res) => {
    try {
      const trackData = req.body;

      const validatedData = insertTrackSchema.parse(trackData);
      const track = await storage.createTrack(validatedData);

      res.json(track);
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Update track
  app.put("/api/tracks/:id", authenticate, async (req: any, res) => {
    try {
      const { id } = req.params;

      // Merge user payload with schema
      const validatedUpdates = updateTrackSchema.parse(req.body);

      // ⛔️ Ownership check (artist can only update their own track)
      const existingTrack = await storage.getTrack(id, req.user.id);
      if (!existingTrack) {
        return res
          .status(404)
          .json({ message: "Track not found or access denied" });
      }

      const updatedTrack = await storage.updateTrack(id, validatedUpdates);
      res.json(updatedTrack);
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/tracks/:id/play", async (req, res) => {
    try {
      await storage.incrementPlayCount(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/buy-track", authenticate, async (req, res) => {
    try {
      const { trackId } = req.body;
      const { id: buyerId } = req.user;

      // Fetch buyer, track, and artist
      const buyer = await storage.getUser(buyerId);
      if (!buyer) return res.status(404).json({ message: "Buyer not found" });

      const track = await storage.getTrack(trackId);
      if (!track) return res.status(404).json({ message: "Track not found" });

      // Check if user already owns the track
      const existingPurchase = await storage.getUserTrackPurchase(
        buyerId,
        trackId
      );
      if (existingPurchase && existingPurchase?.paymentStatus === "succeeded") {
        return res.status(400).json({ message: "Track already purchased" });
      }

      const artist = await storage.getUser(track.artistId);
      if (!artist || !artist.stripeAccountId) {
        return res
          .status(400)
          .json({ message: "Artist has no Stripe account set up" });
      }

      // Create Checkout Session on platform account
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: buyer.preferredCurrency || "usd",
              product_data: {
                name: track.title,
                // images: track.coverImage ? [track.coverImage] : [],
              },
              unit_amount: Math.round(Number(track.price) * 100),
            },
            quantity: 1,
          },
        ],
        customer: buyer.stripeCustomerId || undefined,
        success_url: `${process.env.FRONTEND_URL}/dashboard?tab=music`,
        cancel_url: `${process.env.FRONTEND_URL}/purchase/cancel`,
        metadata: {
          buyerId,
          trackId: track.id,
          artistId: artist.id,
        },
        payment_intent_data: {
          // application_fee_amount: Math.round(Number(track.price) * 100 * 0.1), // uncomment this to charge platform fee, take 10% fee (optional)
          transfer_data: {
            destination: artist.stripeAccountId, // 💰 send money to artist
          },
          on_behalf_of: artist.stripeAccountId, // ensures compliance
        },
      });

      // Insert pending purchase record
      await storage.recordTrackPurchase({
        userId: buyerId,
        trackId: track.id,
        price: String(track?.price || 0),
        currency: buyer.preferredCurrency || "usd",
        stripeCheckoutSessionId: session.id as string,
        stripePaymentIntentId: session.payment_intent as string,
        stripeTransferId: null, // transfer will happen in webhook
        paymentStatus: "pending",
      });

      return res.json({ checkoutUrl: session.url });
    } catch (error: any) {
      console.error("Buy track error:", error);
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  });

  app.get("/api/purchase/verify", authenticate, async (req: any, res) => {
    try {
      const { session_id } = req.query;

      if (!session_id) {
        return res.status(400).json({ message: "Missing session_id" });
      }

      // 1️⃣ Retrieve session
      const session = await stripe.checkout.sessions.retrieve(
        session_id as string,
        {
          expand: ["payment_intent"],
        }
      );

      if (!session || !session.payment_intent) {
        return res.status(404).json({ message: "PaymentIntent not found" });
      }

      // 2️⃣ Pull info from PaymentIntent
      const paymentIntent = session.payment_intent as Stripe.PaymentIntent;
      const paymentStatus = paymentIntent.status;
      const amount = paymentIntent.amount_received || paymentIntent.amount;
      const price = (amount / 100).toFixed(2);
      const currency = paymentIntent.currency.toUpperCase();

      // 3️⃣ Return status
      res.json({
        paymentStatus,
        price,
        currency,
      });
    } catch (err: any) {
      console.error("Purchase verify error:", err);
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/users/tracks", authenticate, async (req, res) => {
    try {
      const targetUserId = req.query.userId as string;
      const authUserId = req.user.id as string;

      if (!targetUserId) {
        return res
          .status(400)
          .json({ message: "userId query param is required" });
      }

      const authUser = await storage.getUser(authUserId);
      if (!authUser) {
        return res.status(404).json({ message: "User not authenticated" });
      }

      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }

      let tracks;
      if (targetUser.role === "artist") {
        tracks = await storage.getTracksByArtist(targetUser.id, authUser.id);
      } else {
        tracks = await storage.getPurchasedTracksByUser(targetUser.id);
      }

      res.json(tracks);
    } catch (error) {
      console.error("User tracks error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Playlist routes
  app.get("/api/playlists", authenticate, async (req, res) => {
    try {
      const filters = {
        search: req.query.search as string,
      };

      const playlists = await storage.getPublicPlaylists(filters);
      res.json(playlists);
    } catch (error) {
      console.error("Playlists error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // add track to playlist
  app.get("/api/users/:identifier/playlists", async (req, res) => {
    try {
      const identifier = req.params.identifier;
      const trackId = req.query.trackId as string | undefined;

      // check identifier type (uuid vs username)
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          identifier
        );

      const user = isUUID
        ? await storage.getUser(identifier)
        : await storage.getUserByUsername(identifier);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let playlists;

      if (trackId) {
        // playlists with hasTrack flag
        playlists = await storage.getPlaylistsByUserWithTrackFlag(
          user.id,
          trackId
        );
      } else {
        // normal playlists
        playlists = await storage.getPlaylistsByUser(user.id);
      }

      res.json(playlists);
    } catch (error) {
      console.error("Get playlists error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // remove track to playlist
  app.delete("/api/playlists/:playlistId/tracks/:trackId", async (req, res) => {
    try {
      const { playlistId, trackId } = req.params;

      if (!playlistId || !trackId) {
        return res
          .status(400)
          .json({ message: "Playlist ID and Track ID are required" });
      }

      // remove track
      await storage.removeTrackFromPlaylist(playlistId, trackId);

      res.json({ success: true, message: "Track removed from playlist" });
    } catch (error) {
      console.error("Remove track error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/playlists", authenticate, async (req: any, res) => {
    try {
      const playlistData = {
        ...req.body,
        creatorId: req.user.id,
      };

      const validatedData = insertPlaylistSchema.parse(playlistData);
      const playlist = await storage.createPlaylist(validatedData);
      res.json(playlist);
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/playlists/:id", authenticate, async (req: any, res) => {
    try {
      const playlistId = req.params.id;

      // Validate body (partial updates allowed)
      const validatedData = updatePlaylistSchema.parse(req.body);

      // Fetch existing playlist
      const existing = await storage.getPlaylist(playlistId);
      if (!existing) {
        return res.status(404).json({ message: "Playlist not found" });
      }

      // ✅ Ownership check
      if (existing.creatorId !== req.user.id) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this playlist" });
      }

      // Update playlist in storage
      const updated = await storage.updatePlaylist(playlistId, validatedData);

      res.json(updated);
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      }
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/playlists/:id", async (req, res) => {
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

  app.delete("/api/playlists/:id", authenticate, async (req, res) => {
    try {
      const playlistId = req.params.id;
      const userId = req.user.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Fetch playlist to verify ownership
      const playlist = await storage.getPlaylist(playlistId);
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }

      if (playlist.creatorId !== userId) {
        return res
          .status(403)
          .json({ message: "Forbidden: Not your playlist" });
      }

      // Delete the playlist
      await storage.deletePlaylist(playlistId);

      // Return the deleted playlist as confirmation
      res.status(200).json({
        message: "Playlist deleted successfully",
        deletedPlaylist: playlist,
      });
    } catch (error) {
      console.error("Delete playlist error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Get playlist tracks
  app.get("/api/playlists/:id/tracks", authenticate, async (req, res) => {
    try {
      const { id: userId } = req.user;
      const tracks = await storage.getPlaylistTracks(req.params.id, userId);
      res.json(tracks);
    } catch (error) {
      console.error("Get playlist tracks error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/playlists/:id/tracks", authenticate, async (req: any, res) => {
    try {
      const { trackId } = req.body;
      await storage.addTrackToPlaylist(req.params.id, trackId, req.user.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Social routes
  app.post("/api/users/:id/follow", authenticate, async (req: any, res) => {
    try {
      await storage.followUser(req.user.id, req.params.id);

      // Create notification for the followed user
      const follower = await storage.getUser(req.user.id);
      if (follower) {
        await storage.createNotification({
          userId: req.params.id,
          actorId: req.user.id,
          type: "follow",
          title: "New Follower",
          message: `@${follower.username} started following you`,
          actionUrl: `/profile/${follower.username}`,
        });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/users/:id/follow", authenticate, async (req: any, res) => {
    try {
      await storage.unfollowUser(req.user.id, req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/users/:identifier/followers", async (req, res) => {
    try {
      let user;
      const identifier = req.params.identifier;

      // Check if identifier looks like a UUID
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
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
      res.json(followers.map((f) => ({ ...f, password: undefined })));
    } catch (error) {
      console.error("Get followers error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/users/:identifier/following", async (req, res) => {
    try {
      let user;
      const identifier = req.params.identifier;

      // Check if identifier looks like a UUID
      const isUUID =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
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
      res.json(following.map((f) => ({ ...f, password: undefined })));
    } catch (error) {
      console.error("Get following error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Message routes
  // app.get("/api/messages/:userId", authenticate, async (req: any, res) => {
  //   try {
  //     const messages = await storage.getMessages(
  //       req.user.id,
  //       req.params.userId
  //     );
  //     res.json(messages);
  //   } catch (error) {
  //     res.status(500).json({ message: "Server error" });
  //   }
  // });

  // Conversation routes
  app.get("/api/conversations", authenticate, async (req: any, res) => {
    try {
      const conversations = await storage.getConversations(req.user.id);
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/conversations", authenticate, async (req: any, res) => {
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

  app.get(
    "/api/conversations/:conversationId/messages",
    authenticate,
    async (req: any, res) => {
      try {
        const { conversationId } = req.params;
        const { limit } = req.query;
        const messages = await storage.getConversationMessages(
          conversationId,
          limit ? parseInt(limit) : undefined
        );
        res.json(messages);
      } catch (error) {
        res.status(500).json({ message: "Server error" });
      }
    }
  );

  app.post(
    "/api/conversations/:conversationId/messages",
    authenticate,
    async (req: any, res) => {
      try {
        const { conversationId } = req.params;
        console.log("Sending message:", {
          conversationId,
          body: req.body,
          userId: req.user.id,
        });

        const messageData = {
          ...req.body,
          senderId: req.user.id,
          conversationId,
        };

        console.log("Message data before validation:", messageData);
        const validatedData = insertMessageSchema.parse(messageData);
        console.log("Validated data:", validatedData);

        const message = await storage.sendConversationMessage(validatedData);
        console.log("Message created:", message);

        // Get conversation to find recipient
        const conversations = await storage.getConversations(req.user.id);
        const conversation = conversations.find((c) => c.id === conversationId);
        if (!conversation) {
          return res.status(404).json({ message: "Conversation not found" });
        }
        const recipientId =
          conversation.participant1Id === req.user.id
            ? conversation.participant2Id
            : conversation.participant1Id;

        // Create notification for recipient
        const sender = await storage.getUser(req.user.id);
        if (sender) {
          await storage.createNotification({
            userId: recipientId,
            actorId: req.user.id,
            type: "message",
            title: "New Message",
            message: `${sender.firstName} ${sender.lastName} sent you a message`,
            actionUrl: `/messages?conversation=${conversationId}`,
          });
        }

        // Send real-time message via WebSocket
        const wsMessage = JSON.stringify({
          type: "new_message",
          message,
          sender: { ...req.user, password: undefined },
        });

        const wss = getWSS();
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(wsMessage);
          }
        });

        res.json(message);
      } catch (error) {
        console.error("Error sending message:", error);
        if (error instanceof ZodError) {
          return res
            .status(400)
            .json({ message: "Invalid data", errors: error.errors });
        }
        res.status(500).json({
          message: "Server error",
          error:
            typeof error === "object" && error !== null && "message" in error
              ? (error as { message: string }).message
              : String(error),
        });
      }
    }
  );

  // Featured artists route
  app.get("/api/featured-artists", authenticate, async (req, res) => {
    try {
      const filters = {
        userId: req.user.id as string,
        search: req.query.search as string,
        genre:
          req.query.genre &&
          req.query.genre !== "undefined" &&
          req.query.genre !== "all"
            ? (req.query.genre as string)
            : undefined,
        mood:
          req.query.mood &&
          req.query.mood !== "undefined" &&
          req.query.mood !== "all"
            ? (req.query.mood as string)
            : undefined,
      };

      const featuredArtists = await storage.getFeaturedArtists(filters);
      res.json(featuredArtists);
    } catch (error) {
      console.error("Featured artists error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Working user search endpoint
  app.get("/api/search/users", (req, res) => {
    const q = req.query.q as string;
    const users = [
      {
        id: "550e8400-e29b-41d4-a716-446655440002",
        username: "indieartist",
        firstName: "Indie",
        lastName: "Artist",
        role: "artist",
        profileImage: null,
        emailVerified: true,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440003",
        username: "musiclover",
        firstName: "Music",
        lastName: "Lover",
        role: "fan",
        profileImage: null,
        emailVerified: false,
      },
      {
        id: "550e8400-e29b-41d4-a716-446655440004",
        username: "beatmaker",
        firstName: "Beat",
        lastName: "Maker",
        role: "artist",
        profileImage: null,
        emailVerified: false,
      },
    ];

    if (!q) {
      return res.json([]);
    }

    const query = q.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(query) ||
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query)
    );

    res.json(filtered);
  });

  // Notifications routes
  app.get("/api/notifications", authenticate, async (req: any, res) => {
    try {
      const { limit } = req.query;
      const notifications = await storage.getUserNotifications(
        req.user.id,
        limit ? parseInt(limit) : undefined
      );
      res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get(
    "/api/notifications/unread-count",
    authenticate,
    async (req: any, res) => {
      try {
        const count = await storage.getUnreadNotificationCount(req.user.id);
        res.json({ count });
      } catch (error) {
        console.error("Get unread count error:", error);
        res.status(500).json({ message: "Server error" });
      }
    }
  );

  app.patch("/api/notifications/:id/read", authenticate, async (req, res) => {
    try {
      await storage.markNotificationAsRead(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch(
    "/api/notifications/mark-all-read",
    authenticate,
    async (req: any, res) => {
      try {
        await storage.markAllNotificationsAsRead(req.user.id);
        res.json({ success: true });
      } catch (error) {
        res.status(500).json({ message: "Server error" });
      }
    }
  );

  // Test endpoint
  app.get("/api/test", (req, res) => {
    res.json({ message: "Server is working" });
  });

  // Mixxlists/Playlists routes
  app.get("/api/users/:userId/mixxlists", async (req, res) => {
    try {
      const { userId } = req.params;
      const mixxlists = await storage.getUserMixxlists(userId);
      res.json(mixxlists);
    } catch (error) {
      console.error("Get user mixxlists error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Also support the /playlists route for backward compatibility
  app.get("/api/users/:userId/playlists", async (req, res) => {
    try {
      const { userId } = req.params;
      const mixxlists = await storage.getUserMixxlists(userId);
      res.json(mixxlists);
    } catch (error) {
      console.error("Get user playlists error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/mixxlists", authenticate, async (req: any, res) => {
    try {
      const mixxlistData = {
        ...req.body,
        creatorId: req.user.id,
        type: "mixxlist",
      };

      const validatedData = insertPlaylistSchema.parse(mixxlistData);
      const mixxlist = await storage.createPlaylist(validatedData);
      res.json(mixxlist);
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create mixxlist error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get(
    "/api/users/:userId/purchased-tracks",
    authenticate,
    async (req: any, res) => {
      try {
        const { userId } = req.params;

        // Only allow users to view their own purchased tracks
        if (userId !== req.user.id) {
          return res.status(403).json({ message: "Unauthorized" });
        }

        const purchasedTracks = await storage.getUserPurchasedTracks(userId);
        res.json(purchasedTracks);
      } catch (error) {
        console.error("Get purchased tracks error:", error);
        res.status(500).json({ message: "Server error" });
      }
    }
  );

  app.get("/api/users/:userId/favorite-artists", async (req, res) => {
    try {
      const { userId } = req.params;
      const favoriteArtists = await storage.getUserFavoriteArtists(userId);
      res.json(favoriteArtists);
    } catch (error) {
      console.error("Get favorite artists error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Track purchase endpoint
  app.post("/api/tracks/purchase", authenticate, async (req: any, res) => {
    try {
      const { trackId, mixxlistId } = req.body;

      // Get track details
      const track = await storage.getTrack(trackId);
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }

      // Check if user already owns this track
      const existingPurchase = await storage.getUserTrackPurchase(
        req.user.id,
        trackId
      );
      if (existingPurchase) {
        return res.status(400).json({ message: "You already own this track" });
      }

      // Create Stripe payment intent
      const amount = Math.round(parseFloat(track.price || "0.99") * 100); // Convert to cents
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency: "gbp",
        metadata: {
          userId: req.user.id,
          trackId,
          mixxlistId: mixxlistId || "",
        },
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        amount: track.price || "0.99",
      });
    } catch (error) {
      console.error("Track purchase error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Test notification endpoint for debugging
  app.post("/api/test-notification", authenticate, async (req: any, res) => {
    try {
      await storage.createNotification({
        userId: req.user.id,
        actorId: req.user.id,
        type: "follow",
        title: "Test Notification",
        message: "This is a test notification to verify the system is working",
        actionUrl: "/profile",
      });
      res.json({ success: true, message: "Test notification created" });
    } catch (error) {
      console.error("Test notification error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Legacy message endpoint (for backwards compatibility)
  // app.post("/api/messages", authenticate, async (req: any, res) => {
  //   try {
  //     const messageData = {
  //       ...req.body,
  //       senderId: req.user.id,
  //     };

  //     const validatedData = insertMessageSchema.parse(messageData);
  //     const message = await storage.sendMessage(validatedData);

  //     // Send real-time message via WebSocket
  //     const wsMessage = JSON.stringify({
  //       type: "new_message",
  //       message,
  //       sender: { ...req.user, password: undefined },
  //     });

  //     wsClients.forEach((ws) => {
  //       if (ws.readyState === WebSocket.OPEN) {
  //         ws.send(wsMessage);
  //       }
  //     });

  //     res.json(message);
  //   } catch (error) {
  //     if (error instanceof ZodError) {
  //       return res
  //         .status(400)
  //         .json({ message: "Invalid data", errors: error.errors });
  //     }
  //     res.status(500).json({ message: "Server error" });
  //   }
  // });

  // Payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Subscription route for 90-day free trial
  app.post("/api/create-subscription", authenticate, async (req: any, res) => {
    try {
      const { id, email } = req.user;

      const user = await storage.getUser(id);
      if (!user) return res.status(404).json({ message: "User not found" });

      const priceId = process.env.STRIPE_PRICE_ID;
      if (!priceId)
        return res.status(500).json({ message: "STRIPE_PRICE_ID not set" });

      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({ email });
        customerId = customer.id;
        await storage.updateUser(id, { stripeCustomerId: customerId });
      }

      // Determine if user can create a new subscription
      const inactiveStatuses: string[] = [
        "canceled",
        "unpaid",
        "incomplete_expired",
      ];

      const hasActiveSubscription =
        user.stripeSubscriptionId &&
        user.subscriptionStatus &&
        !inactiveStatuses.includes(user.subscriptionStatus);

      if (hasActiveSubscription) {
        return res
          .status(400)
          .json({ message: "User already has an active subscription" });
      }

      // Create Stripe Checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        subscription_data: { trial_period_days: 90, metadata: { userId: id } },
        expand: ["subscription"], // ensures session.subscription is a Subscription object
        allow_promotion_codes: true,
        success_url: `${process.env.FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/subscription/cancel`,
      });

      const subscriptionObj =
        typeof session.subscription === "string" ? null : session.subscription;

      const trialEndsAt = subscriptionObj
        ? new Date((subscriptionObj.trial_end ?? 0) * 1000)
        : null;

      // Save new subscription ID to user
      await storage.updateUser(id, {
        stripeSubscriptionId:
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id ?? null,
      });

      // Return checkout URL and trial info
      res.json({ url: session.url, trialEndsAt });
    } catch (err: any) {
      console.error("Error creating subscription:", err);
      res.status(500).json({ message: err.message || "Internal server error" });
    }
  });

  app.get("/api/checkout/verify", authenticate, async (req: any, res) => {
    try {
      const { session_id } = req.query;
      const { id: userId } = req.user;

      if (!session_id)
        return res.status(400).json({ message: "Missing session_id" });

      // 1️⃣ Get user from DB
      const user = await storage.getUser(userId);
      if (!user) return res.status(404).json({ message: "User not found" });

      // 2️⃣ If user already has subscription info, return it
      if (user.stripeSubscriptionId && user.subscriptionStatus) {
        return res.json({
          subscriptionId: user.stripeSubscriptionId,
          status: user.subscriptionStatus,
          trialEndsAt: user.trialEndsAt,
        });
      }

      // 3️⃣ Retrieve Checkout Session from Stripe
      const session = await stripe.checkout.sessions.retrieve(
        session_id as string,
        {
          expand: ["subscription"],
        }
      );

      if (!session || !session.subscription) {
        return res
          .status(404)
          .json({ message: "Subscription not found in session" });
      }

      const subscription = session.subscription as Stripe.Subscription;

      console.log("verify subscription", subscription);

      const trialEndsAt = subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null;

      // 5️⃣ Update user in DB
      await storage.updateUser(userId, {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: subscription.status || "trialing",
        trialEndsAt,
        hasUsedTrial: true,
      });

      // 6️⃣ Return subscription info
      res.json({
        subscriptionId: subscription.id,
        status: subscription.status || "trialing",
        trialEndsAt,
      });
    } catch (err: any) {
      console.error(err);
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/subscription/cancel", authenticate, async (req: any, res) => {
    try {
      const { id } = req.user;

      // Fetch user to get Stripe subscription ID
      const user = await storage.getUser(id);
      if (!user?.stripeSubscriptionId) {
        return res
          .status(400)
          .json({ message: "No active subscription found" });
      }

      // Cancel immediately
      const subscription = await stripe.subscriptions.cancel(
        user.stripeSubscriptionId
      );

      // Update user's subscription status in DB
      const updatedUser = await storage.updateUser(id, {
        subscriptionStatus: subscription.status, // "canceled"
        trialEndsAt: null,
        hasUsedTrial: true, // optional, mark trial used if needed
      });

      res.json({
        message: "Subscription cancelled immediately",
        subscription,
        updatedUser,
      });
    } catch (err: any) {
      console.error("Error cancelling subscription:", err);
      res.status(500).json({ message: err.message || "Internal server error" });
    }
  });

  app.post("/api/tips", authenticate, async (req: any, res) => {
    try {
      const tipData = {
        ...req.body,
        fromUserId: req.user.id,
      };

      const validatedData = insertTipSchema.parse(tipData);
      const tip = await storage.createTip(validatedData);

      // Create Stripe payment intent with user's preferred currency
      const currency = req.body.currency || "GBP"; // Default to GBP
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(parseFloat(tip.amount) * 100),
        currency: currency.toLowerCase(),
        metadata: {
          tipId: tip.id,
          fromUserId: tip.fromUserId,
          toUserId: tip.toUserId,
          currency: currency,
        },
      });

      await storage.updateTipStatus(tip.id, "pending", paymentIntent.id);

      // Create notification for tip recipient
      const tipper = await storage.getUser(req.user.id);
      if (tipper) {
        await storage.createNotification({
          userId: tip.toUserId,
          actorId: req.user.id,
          type: "tip",
          title: "New Tip Received",
          message: `${tipper.firstName} ${tipper.lastName} sent you a tip of ${
            currency === "GBP"
              ? "£"
              : currency === "USD"
              ? "$"
              : currency === "EUR"
              ? "€"
              : ""
          }${tip.amount}`,
          actionUrl: `/profile/${tipper.username}`,
        });
      }

      res.json({
        tip,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Radio routes
  app.post("/api/radio/sessions/:id/go-live", async (req, res) => {
    try {
      const updated = await storage.goLive(req.params.id);
      if (!updated) {
        return res.status(404).json({ message: "Session not found" });
      } else {
        // Broadcast to all clients
        const wss = getWSS();
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "radio_session_updated",
                data: updated,
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

  app.post("/api/radio/sessions/:id/end", async (req, res) => {
    try {
      const updated = await storage.endSession(req.params.id);
      if (!updated) {
        return res.status(404).json({ message: "Session not found" });
      } else {
        const wss = getWSS();
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "radio_session_updated",
                data: updated,
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

  app.get("/api/radio/sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllRadioSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/radio/active-session", async (req, res) => {
    try {
      const sessions = await storage.getActiveRadioSession();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/radio/sessions", authenticate, async (req: any, res) => {
    try {
      // Convert date strings to Date objects if they exist
      const sessionData = {
        ...req.body,
        hostId: req.user.id,
        scheduledStart: req.body.scheduledStart
          ? new Date(req.body.scheduledStart)
          : undefined,
        scheduledEnd: req.body.scheduledEnd
          ? new Date(req.body.scheduledEnd)
          : undefined,
        actualStart: req.body.actualStart
          ? new Date(req.body.actualStart)
          : undefined,
        actualEnd: req.body.actualEnd
          ? new Date(req.body.actualEnd)
          : undefined,
      };

      const validatedData = insertRadioSessionSchema.parse(sessionData);
      const session = await storage.createRadioSession(validatedData);

      res.json(session);
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/radio/sessions/:id", authenticate, async (req: any, res) => {
    try {
      const sessionId = req.params.id;

      // Convert date strings to Date objects if they exist
      const updateData = {
        ...req.body,
        scheduledStart: req.body.scheduledStart
          ? new Date(req.body.scheduledStart)
          : undefined,
        scheduledEnd: req.body.scheduledEnd
          ? new Date(req.body.scheduledEnd)
          : undefined,
        actualStart: req.body.actualStart
          ? new Date(req.body.actualStart)
          : undefined,
        actualEnd: req.body.actualEnd
          ? new Date(req.body.actualEnd)
          : undefined,
      };

      // Validate the incoming data
      const validatedData = updateRadioSessionSchema.parse(updateData);

      // Update the session in storage
      const updatedSession = await storage.updateRadioSession(
        sessionId,
        validatedData
      );

      res.json(updatedSession);
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  // Radio Live Chat
  app.get("/api/radio-chat/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;

      const messages = await storage.getRadioChatMessages(sessionId, 150);

      res.json(messages); // already oldest → newest in storage fn
    } catch (error) {
      console.error("Error fetching radio chat:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Collaboration routes
  app.get("/api/collaborations", authenticate, async (req: any, res) => {
    try {
      const collaborations = await storage.getCollaborationsByUser(req.user.id);
      res.json(collaborations);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get(
    "/api/collaborations/pending",
    authenticate,
    async (req: any, res) => {
      try {
        const collaborations = await storage.getPendingCollaborations(
          req.user.id
        );
        res.json(collaborations);
      } catch (error) {
        res.status(500).json({ message: "Server error" });
      }
    }
  );

  app.post("/api/collaborations", authenticate, async (req: any, res) => {
    try {
      const collabData = {
        ...req.body,
        requesterId: req.user.id,
      };

      const validatedData = insertCollaborationSchema.parse(collabData);
      const collaboration = await storage.createCollaboration(validatedData);

      // Send real-time notification
      const message = JSON.stringify({
        type: "collaboration_request",
        collaboration,
        requester: { ...req.user, password: undefined },
      });

      wsClients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });

      res.json(collaboration);
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/collaborations/:id", authenticate, async (req: any, res) => {
    try {
      const { status } = req.body;
      const collaboration = await storage.updateCollaborationStatus(
        req.params.id,
        status
      );

      // Send real-time notification
      const message = JSON.stringify({
        type: "collaboration_update",
        collaboration,
      });

      wsClients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });

      res.json(collaboration);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Live streaming routes
  app.post("/api/livestreams", authenticate, async (req: any, res) => {
    try {
      if (req.user.role !== "artist") {
        return res
          .status(403)
          .json({ message: "Only artists can create live streams" });
      }

      const streamData = insertLiveStreamSchema.parse({
        ...req.body,
        artistId: req.user.id,
      });

      const stream = await storage.createLiveStream(streamData);

      // Notify followers
      await storage.notifyFollowers(
        req.user.id,
        `${req.user.username} is going live: ${stream.title}`
      );

      res.json(stream);
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/livestreams", async (req, res) => {
    try {
      const activeStreams = await storage.getActiveLiveStreams();
      res.json(activeStreams);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/livestreams/:id", async (req, res) => {
    try {
      const stream = await storage.getLiveStream(req.params.id);
      if (!stream) {
        return res.status(404).json({ message: "Stream not found" });
      }
      res.json(stream);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post(
    "/api/livestreams/:id/start",
    authenticate,
    async (req: any, res) => {
      try {
        const stream = await storage.getLiveStream(req.params.id);
        if (!stream) {
          return res.status(404).json({ message: "Stream not found" });
        }
        if (stream.artistId !== req.user.id) {
          return res.status(403).json({ message: "Not authorized" });
        }

        const updatedStream = await storage.startLiveStream(req.params.id);

        // Broadcast stream start via WebSocket
        const message = JSON.stringify({
          type: "stream_started",
          stream: updatedStream,
        });

        wsClients.forEach((ws) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
          }
        });

        res.json(updatedStream);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }
  );

  app.post("/api/livestreams/:id/end", authenticate, async (req: any, res) => {
    try {
      const stream = await storage.getLiveStream(req.params.id);
      if (!stream) {
        return res.status(404).json({ message: "Stream not found" });
      }
      if (stream.artistId !== req.user.id) {
        return res.status(403).json({ message: "Not authorized" });
      }

      const updatedStream = await storage.endLiveStream(req.params.id);

      // Broadcast stream end via WebSocket
      const message = JSON.stringify({
        type: "stream_ended",
        stream: updatedStream,
      });

      wsClients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });

      res.json(updatedStream);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/livestreams/:id/join", authenticate, async (req: any, res) => {
    try {
      await storage.joinLiveStream(req.params.id, req.user.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post(
    "/api/livestreams/:id/leave",
    authenticate,
    async (req: any, res) => {
      try {
        await storage.leaveLiveStream(req.params.id, req.user.id);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    }
  );

  app.get("/api/livestreams/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getLiveStreamMessages(req.params.id);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post(
    "/api/livestreams/:id/messages",
    authenticate,
    async (req: any, res) => {
      try {
        const messageData = insertLiveStreamMessageSchema.parse({
          ...req.body,
          streamId: req.params.id,
          userId: req.user.id,
        });

        const message = await storage.addLiveStreamMessage(messageData);

        // Broadcast message via WebSocket
        const wsMessage = JSON.stringify({
          type: "stream_message",
          message,
        });

        wsClients.forEach((ws) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(wsMessage);
          }
        });

        res.json(message);
      } catch (error: any) {
        if (error instanceof ZodError) {
          return res
            .status(400)
            .json({ message: "Invalid input", errors: error.errors });
        }
        res.status(500).json({ message: error.message });
      }
    }
  );

  // Live stream tip endpoint
  app.post("/api/livestreams/:id/tip", authenticate, async (req: any, res) => {
    try {
      const { amount, message } = req.body;
      const stream = await storage.getLiveStream(req.params.id);

      if (!stream) {
        return res.status(404).json({ message: "Stream not found" });
      }

      // Create payment intent for the tip
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "gbp",
        metadata: {
          type: "livestream_tip",
          streamId: req.params.id,
          fromUserId: req.user.id,
          toUserId: stream.artistId,
        },
      });

      // Create tip record
      const tip = await storage.createTip({
        fromUserId: req.user.id,
        toUserId: stream.artistId,
        liveStreamId: req.params.id,
        amount: amount.toString(),
        message: message,
        // stripePaymentIntentId: paymentIntent.id,
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        tip,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Import and register admin routes
  try {
    const { registerAdminRoutes } = await import("./admin-routes");
    const { registerUploadRoutes } = await import("./upload-routes");
    registerAdminRoutes(app);
    registerUploadRoutes(app);
  } catch (error) {
    console.error("Failed to register admin or upload routes:", error);
  }

  const httpServer = createServer(app);

  // WebSocket server setup
  // const wss = new WebSocketServer({
  //   server: httpServer,
  //   path: "/ws",
  // });

  // wss.on("connection", (ws, req) => {
  //   const clientId = Math.random().toString(36).substring(7);
  //   wsClients.set(clientId, ws);

  //   ws.on("message", (data) => {
  //     try {
  //       const message = JSON.parse(data.toString());

  //       // Handle different message types
  //       switch (message.type) {
  //         case "join_radio":
  //           // Join radio session
  //           ws.send(
  //             JSON.stringify({
  //               type: "radio_joined",
  //               sessionId: message.sessionId,
  //             })
  //           );
  //           break;

  //         case "radio_chat":
  //           // Broadcast radio chat message

  //           const chatMessage = JSON.stringify({
  //             type: "radio_chat",
  //             message: message.content,
  //             user: message.user,
  //             sessionId: message.sessionId,
  //             timestamp: new Date().toISOString(),
  //           });

  //           log("chatMessage", chatMessage);
  //           wsClients.forEach((client) => {
  //             if (client.readyState === WebSocket.OPEN) {
  //               client.send(chatMessage);
  //             }
  //           });
  //           break;
  //       }
  //     } catch (error) {
  //       console.error("WebSocket message error:", error);
  //     }
  //   });

  //   ws.on("close", () => {
  //     wsClients.delete(clientId);
  //   });

  //   ws.on("error", (error) => {
  //     console.error("WebSocket error:", error);
  //     wsClients.delete(clientId);
  //   });
  // });

  // Contact form endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, category, message } = req.body;
      const submission = await storage.submitContact({
        name,
        email,
        subject,
        category,
        message,
      });

      console.log("📩 Contact form stored:", submission);

      // Generate emails
      const supportEmail = generateContactEmail("support", {
        name,
        email,
        subject,
        category,
        message,
      });

      const confirmationEmail = generateContactEmail("user", {
        name,
        email,
        subject,
        category,
        message,
      });

      // Send both emails in parallel
      await Promise.all([
        sendEmail({
          to: "hello@mixxl.fm",
          from: "noreply@mixxl.fm",
          ...supportEmail,
        }),
        sendEmail({
          to: email,
          from: "noreply@mixxl.fm",
          ...confirmationEmail,
        }),
      ]);

      res.json({
        success: true,
        message: "Contact form submitted successfully",
      });
    } catch (error) {
      console.error("❌ Contact form error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit contact form",
      });
    }
  });

  // Track routes
  app.get("/api/feedbacks", authenticate, async (req, res) => {
    try {
      const feedbacks = await storage.getAllSubmissions();

      res.json(feedbacks);
    } catch (error) {
      console.error("Tracks error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/stripe/countries", async (req, res) => {
    const countryId = req.query.id as string | undefined;

    try {
      if (countryId) {
        // Fetch a single country with detailed info
        const country = await stripe.countrySpecs.retrieve(
          countryId.toUpperCase()
        );
        const formatted = formatCountry(country, true); // detailed = true
        return res.status(200).json({ country: formatted });
      }

      // Fetch all countries (no detailed fields)
      const { data } = await stripe.countrySpecs.list({ limit: 100 });
      const formatted = data.map((c) => formatCountry(c));
      res.status(200).json({ countries: formatted });
    } catch (error) {
      console.error(
        `Error fetching country${countryId ? ` ${countryId}` : " list"}:`,
        error
      );
      res.status(countryId ? 404 : 500).json({
        message: countryId
          ? `Country ${countryId} not found`
          : "Failed to fetch Stripe countries",
      });
    }
  });

  return httpServer;
}
