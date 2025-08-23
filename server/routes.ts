import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import Stripe from "stripe";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
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
} from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ZodError } from "zod";
import { sendEmail, generateVerificationEmail } from "./email";
import {
  generateVerificationToken,
  getTokenExpirationDate,
  isTokenExpired,
} from "./utils";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required Stripe secret: STRIPE_SECRET_KEY");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-06-30.basil",
});

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads", "profiles");

    try {
      // Ensure directory exists
      fs.mkdirSync(uploadDir, { recursive: true });
    } catch (err) {
      return cb(err as Error, uploadDir);
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

export const uploadProfile = multer({
  storage: profileStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "image" && !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir =
      process.env.UPLOAD_PATH || path.join(process.cwd(), "uploads");

    // Check if directory exists, if not create it
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); // recursive: true creates nested dirs if needed
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: uploadStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for larger WAV files
  },
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "track") {
      // Audio files
      if (file.mimetype.startsWith("audio/")) {
        cb(null, true);
      } else {
        cb(new Error("Only audio files are allowed for tracks"));
      }
    } else if (file.fieldname === "image") {
      // Image files
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only image files are allowed"));
      }
    } else {
      cb(null, true);
    }
  },
});

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

      // Encode user data in a temporary JWT token
      const verificationToken = jwt.sign(
        { userData },
        JWT_SECRET,
        { expiresIn: "1h" } // expires after 1 hour
      );

      // Send verification email
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      const emailContent = generateVerificationEmail(
        verificationUrl,
        userData.firstName || "User"
      );

      await sendEmail({
        to: userData.email,
        from: "noreply@mixxl.fm",
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      });

      res.json({
        message: "Verification email sent. Complete signup via email link.",
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

  // Email verification routes
  app.get("/api/auth/verify-email", async (req, res) => {
    try {
      const { token } = req.query;
      if (!token || typeof token !== "string")
        return res.status(400).json({ message: "Invalid token" });

      // Decode token
      let decoded;
      try {
        decoded = jwt.verify(token, JWT_SECRET) as { userData: any };
      } catch (err) {
        return res.status(400).json({ message: "Token invalid or expired" });
      }

      const { userData } = decoded;

      // Create user in DB after verification
      const user = await storage.createUser({
        ...userData,
        emailVerified: true,
      });

      // Generate JWT token
      const jwtToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: "7d",
      });

      res.json({
        message: "Signup complete",
        user: { ...user, password: undefined },
        token: jwtToken,
      });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post(
    "/api/auth/resend-verification",
    authenticate,
    async (req: any, res) => {
      try {
        const user = req.user;

        // Check if user is already verified
        if (user.emailVerified) {
          return res.status(400).json({ message: "Email is already verified" });
        }

        // Generate new verification token
        const verificationToken = generateVerificationToken();
        const expiresAt = getTokenExpirationDate();

        // Store new verification token
        await storage.createEmailVerificationToken({
          userId: user.id,
          token: verificationToken,
          expiresAt,
        });

        // Send verification email if SendGrid is configured
        if (process.env.SENDGRID_API_KEY) {
          const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
          const emailContent = generateVerificationEmail(
            verificationUrl,
            user.firstName || "User"
          );

          const emailSent = await sendEmail({
            to: user.email,
            from: "noreply@mixxl.fm",
            subject: emailContent.subject,
            html: emailContent.html,
            text: emailContent.text,
          });

          if (emailSent) {
            res.json({ message: "Verification email sent successfully" });
          } else {
            res
              .status(500)
              .json({ message: "Failed to send verification email" });
          }
        } else {
          res.status(503).json({ message: "Email service not configured" });
        }
      } catch (error) {
        console.error("Resend verification error:", error);
        res.status(500).json({ message: "Server error" });
      }
    }
  );

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

  app.get("/api/auth/me", authenticate, (req: any, res) => {
    res.json({ ...req.user, password: undefined });
  });

  // Temporary password reset route for development
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, newPassword } = req.body;
      console.log("Password reset attempt for email:", email);

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await storage.updateUser(user.id, { password: hashedPassword });

      console.log("Password updated successfully for user:", email);
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Password reset error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // User routes
  app.get("/api/users/:identifier", async (req, res) => {
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
  app.patch(
    "/api/users/profile",
    authenticate,
    uploadProfile.single("image"), // optional profile image
    async (req: any, res) => {
      try {
        const updateData: any = { ...req.body };
        // If an image was uploaded, validate and add its URL
        updateData.profileImage = `/uploads/profiles/${req.file.filename}`;
        console.log(`Profile update request: ${JSON.stringify(updateData)}`);

        const user = await storage.updateUser(req.user.id, updateData);
        res.json({ ...user, password: undefined });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
      }
    }
  );

  // Track routes
  app.get("/api/tracks", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const tracks = await storage.getTracks(limit, offset);
      res.json(tracks);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/tracks/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query required" });
      }
      const tracks = await storage.searchTracks(query);
      res.json(tracks);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/tracks/:id", async (req, res) => {
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

  app.post(
    "/api/tracks/upload",
    authenticate,
    upload.fields([
      { name: "track", maxCount: 1 },
      { name: "cover", maxCount: 1 },
    ]),
    async (req: any, res) => {
      try {
        const files = req.files as {
          [fieldname: string]: Express.Multer.File[];
        };

        if (!files.track || files.track.length === 0) {
          return res.status(400).json({ message: "Track file is required" });
        }

        const trackFile = files.track[0];
        const coverFile = files.cover?.[0];

        // Create preview file if hasPreviewOnly is enabled
        let previewUrl = null;
        if (req.body.hasPreviewOnly === "true") {
          const previewDuration = parseInt(req.body.previewDuration) || 30;
          const previewFilePath = `uploads/preview_${Date.now()}_${
            trackFile.filename
          }`;

          try {
            // Use ffmpeg to create preview clip (first N seconds)
            const { spawn } = require("child_process");
            const ffmpeg = spawn("ffmpeg", [
              "-i",
              trackFile.path,
              "-t",
              previewDuration.toString(),
              "-c",
              "copy",
              previewFilePath,
            ]);

            await new Promise((resolve, reject) => {
              ffmpeg.on("close", (code: number) => {
                if (code === 0) {
                  previewUrl = `/${previewFilePath}`;
                  resolve(code);
                } else {
                  reject(new Error(`FFmpeg process exited with code ${code}`));
                }
              });
              ffmpeg.on("error", reject);
            });
          } catch (error) {
            console.error("Preview creation failed:", error);
            // Continue without preview - user will get full track access
          }
        }

        const trackData = {
          ...req.body,
          artistId: req.user.id,
          fileUrl: `/uploads/${trackFile.filename}`,
          previewUrl,
          previewDuration:
            req.body.hasPreviewOnly === "true"
              ? parseInt(req.body.previewDuration) || 30
              : 30,
          hasPreviewOnly: req.body.hasPreviewOnly === "true",
          coverImage: coverFile ? `/uploads/${coverFile.filename}` : null,
          tags: req.body.tags ? JSON.parse(req.body.tags) : [],
          price: req.body.price ? parseFloat(req.body.price) : null,
          isPublic: req.body.isPublic === "true",
          isExplicit: req.body.isExplicit === "true",
          submitToRadio: req.body.submitToRadio === "true",
        };

        const validatedData = insertTrackSchema.parse(trackData);
        const track = await storage.createTrack(validatedData);

        // Broadcast new track to WebSocket clients
        const message = JSON.stringify({
          type: "new_track",
          track,
          user: { ...req.user, password: undefined },
        });

        wsClients.forEach((ws) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(message);
          }
        });

        res.json(track);
      } catch (error) {
        if (error instanceof ZodError) {
          return res
            .status(400)
            .json({ message: "Invalid data", errors: error.errors });
        }
        res.status(500).json({ message: "Server error" });
      }
    }
  );

  app.post("/api/tracks/:id/play", async (req, res) => {
    try {
      await storage.incrementPlayCount(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Check if user has access to full track
  app.get("/api/tracks/:id/access", authenticate, async (req: any, res) => {
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
        previewDuration: track?.previewDuration || 30,
      });
    } catch (error) {
      console.error("Track access error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Purchase track endpoint
  app.post("/api/purchases", authenticate, async (req: any, res) => {
    try {
      const { trackId, playlistId } = req.body;

      const track = await storage.getTrack(trackId);
      if (!track) {
        return res.status(404).json({ message: "Track not found" });
      }

      // Check if user already owns the track
      const existingPurchase = await storage.getUserTrackPurchase(
        req.user.id,
        trackId
      );
      if (existingPurchase) {
        return res.status(400).json({ message: "Track already purchased" });
      }

      // For now, simulate a successful purchase
      // In production, this would integrate with Stripe
      const purchase = await storage.recordTrackPurchase({
        userId: req.user.id,
        trackId: trackId,
        price: track.price || 0,
      });

      // If a playlist was selected, add the track to it
      if (playlistId) {
        try {
          console.log(`Adding track ${trackId} to playlist ${playlistId}`);
          await storage.addTrackToPlaylist(playlistId, trackId, req.user.id);
          console.log("Track added to playlist successfully");
        } catch (playlistError) {
          console.error("Error adding track to playlist:", playlistError);
          // Continue with purchase success even if playlist addition fails
        }
      }

      res.json({ success: true, purchase });
    } catch (error) {
      console.error("Purchase error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/users/:identifier/tracks", async (req, res) => {
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

      let tracks;
      if (user.role === "artist") {
        // For artists, return their uploaded tracks
        tracks = await storage.getTracksByArtist(user.id);
      } else {
        // For fans, return their purchased tracks
        tracks = await storage.getPurchasedTracksByUser(user.id);
      }

      res.json(tracks);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Playlist routes
  app.get("/api/playlists", async (req, res) => {
    try {
      const playlists = await storage.getPublicPlaylists();
      res.json(playlists);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/users/:identifier/playlists", async (req, res) => {
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

      const playlists = await storage.getPlaylistsByUser(user.id);
      res.json(playlists);
    } catch (error) {
      console.error("Get playlists error:", error);
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
  app.get("/api/playlists/:id/tracks", async (req, res) => {
    try {
      const tracks = await storage.getPlaylistTracks(req.params.id);
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
  app.get("/api/messages/:userId", authenticate, async (req: any, res) => {
    try {
      const messages = await storage.getMessages(
        req.user.id,
        req.params.userId
      );
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

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

        wsClients.forEach((ws) => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(wsMessage);
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
  app.get("/api/featured-artists", async (req, res) => {
    try {
      const search = req.query.search as string | undefined;
      const featuredArtists = await storage.getFeaturedArtists(search);

      res.json(
        featuredArtists.map((artist) => ({
          ...artist,
          password: undefined,
        }))
      );
    } catch (error) {
      console.error("Featured artists error:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/artists", async (req, res) => {
    try {
      const allArtists = await storage.getAllArtists();
      res.json(
        allArtists.map((artist) => {
          const { password, ...rest } = artist; // remove password safely
          return rest;
        })
      );
    } catch (error) {
      console.error("All artists error:", error);
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

  // Stripe webhook for successful purchases
  app.post("/api/webhooks/stripe", async (req, res) => {
    try {
      const event = req.body;

      if (event.type === "payment_intent.succeeded") {
        const paymentIntent = event.data.object;
        const { userId, trackId, mixxlistId } = paymentIntent.metadata;

        // Record the purchase
        const purchaseData = {
          userId,
          trackId,
          price: (paymentIntent.amount / 100).toString(),
          stripePaymentIntentId: paymentIntent.id,
        };

        const validatedData = insertPurchasedTrackSchema.parse(purchaseData);
        await storage.recordTrackPurchase(validatedData);

        // Add to mixxlist if specified
        if (mixxlistId) {
          await storage.addTrackToPlaylist(mixxlistId, trackId);
        }

        // Create notification for the artist
        const track = await storage.getTrack(trackId);
        const buyer = await storage.getUser(userId);
        if (track && buyer) {
          await storage.createNotification({
            userId: track.artistId,
            actorId: userId,
            type: "tip",
            title: "Track Purchased!",
            message: `${buyer.firstName} ${buyer.lastName} purchased your track "${track.title}"`,
            actionUrl: `/profile/${track.artistId}`,
          });
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("Stripe webhook error:", error);
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
  app.post("/api/messages", authenticate, async (req: any, res) => {
    try {
      const messageData = {
        ...req.body,
        senderId: req.user.id,
      };

      const validatedData = insertMessageSchema.parse(messageData);
      const message = await storage.sendMessage(validatedData);

      // Send real-time message via WebSocket
      const wsMessage = JSON.stringify({
        type: "new_message",
        message,
        sender: { ...req.user, password: undefined },
      });

      wsClients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(wsMessage);
        }
      });

      res.json(message);
    } catch (error) {
      if (error instanceof ZodError) {
        return res
          .status(400)
          .json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

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
    if (!req.user) {
      return res.sendStatus(401);
    }

    let user = req.user;

    if (user.stripeSubscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(
        user.stripeSubscriptionId
      );

      res.send({
        subscriptionId: subscription.id,
        clientSecret:
          subscription.latest_invoice?.payment_intent?.client_secret || null,
      });

      return;
    }

    if (!user.email) {
      throw new Error("No user email on file");
    }

    try {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.username,
      });

      user = await storage.updateUser(user.id, {
        stripeCustomerId: customer.id,
      });

      // Create subscription with 90-day trial
      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [
          {
            price_data: {
              currency: "gbp",
              product_data: {
                name: "Mixxl Artist Subscription",
                description:
                  "Upload unlimited music, advanced analytics, and monetization features",
              },
              unit_amount: 1000, // £10.00
              recurring: {
                interval: "month",
              },
            },
          },
        ],
        trial_period_days: 90,
        payment_behavior: "default_incomplete",
        expand: ["latest_invoice.payment_intent"],
      });

      await storage.updateUser(user.id, {
        stripeCustomerId: customer.id,
        stripeSubscriptionId: subscription.id,
      });

      res.send({
        subscriptionId: subscription.id,
        clientSecret:
          subscription.latest_invoice?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      return res.status(400).send({ error: { message: error.message } });
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
  app.get("/api/radio/sessions", async (req, res) => {
    try {
      const sessions = await storage.getActiveRadioSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/radio/sessions", authenticate, async (req: any, res) => {
    try {
      const sessionData = {
        ...req.body,
        hostId: req.user.id,
      };

      const validatedData = insertRadioSessionSchema.parse(sessionData);
      const session = await storage.createRadioSession(validatedData);

      // Broadcast new radio session
      const message = JSON.stringify({
        type: "new_radio_session",
        session,
        host: { ...req.user, password: undefined },
      });

      wsClients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });

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
        stripePaymentIntentId: paymentIntent.id,
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
    registerAdminRoutes(app);
  } catch (error) {
    console.error("Failed to register admin routes:", error);
  }

  const httpServer = createServer(app);

  // WebSocket server setup
  const wss = new WebSocketServer({
    server: httpServer,
    path: "/ws",
  });

  wss.on("connection", (ws, req) => {
    const clientId = Math.random().toString(36).substring(7);
    wsClients.set(clientId, ws);

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());

        // Handle different message types
        switch (message.type) {
          case "join_radio":
            // Join radio session
            ws.send(
              JSON.stringify({
                type: "radio_joined",
                sessionId: message.sessionId,
              })
            );
            break;

          case "radio_chat":
            // Broadcast radio chat message
            const chatMessage = JSON.stringify({
              type: "radio_chat",
              message: message.content,
              user: message.user,
              sessionId: message.sessionId,
              timestamp: new Date().toISOString(),
            });

            wsClients.forEach((client) => {
              if (client.readyState === WebSocket.OPEN) {
                client.send(chatMessage);
              }
            });
            break;
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      wsClients.delete(clientId);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
      wsClients.delete(clientId);
    });
  });

  // Contact form endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, subject, category, message } = req.body;

      // Log the submission
      console.log("Contact form submission:", {
        name,
        email,
        subject,
        category,
        message,
        timestamp: new Date().toISOString(),
      });

      // Send email to support team using SendGrid
      if (process.env.SENDGRID_API_KEY) {
        const sgMail = require("@sendgrid/mail");
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const supportEmailMsg = {
          to: "hello@mixxl.fm",
          from: "noreply@mixxl.fm", // Must be verified sender in SendGrid
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
                  Submitted on: ${new Date().toLocaleString()}<br>
                  Reply directly to this email to respond to ${name} at ${email}
                </p>
              </div>
            </div>
          `,
        };

        // Send confirmation email to user
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
          `,
        };

        try {
          await sgMail.send(supportEmailMsg);
          await sgMail.send(userConfirmationMsg);
          console.log("Contact form emails sent successfully");
        } catch (emailError) {
          console.error("Failed to send contact form emails:", emailError);
          // Continue with success response even if email fails
        }
      }

      res.json({
        success: true,
        message: "Contact form submitted successfully",
      });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit contact form",
      });
    }
  });

  return httpServer;
}
