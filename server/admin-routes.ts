import type { Express } from "express";
import { z } from "zod";
import Stripe from "stripe";
import { storage } from "./storage";
import {
  insertFeaturedSpotSchema,
  insertAdminBroadcastSchema,
  insertCompetitionSchema,
  insertCompetitionEntrySchema,
  insertDiscountCodeSchema,
  insertBannerSchema,
  insertTrackSchema,
  updateTrackSchema,
  User,
  InsertBanner,
  Banner,
  DEFAULT_PRIZE_TEXT,
} from "@shared/schema";
import { sendEmail, EMAIL_FROM } from "./email";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { log } from "./vite";
import { stripe } from "./stripe";

declare global {
  namespace Express {
    export interface Request {
      user: User;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

const bannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads", "banners");

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

export const uploadBanner = multer({
  storage: bannerStorage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "image" && !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

const competitionBannerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), "uploads", "competition-banners");
    try {
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

export const uploadCompetitionBanner = multer({
  storage: competitionBannerStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "banner" && !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
});

// Generate broadcast email template
function generateBroadcastEmail(
  title: string,
  message: string,
  userName: string
) {
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

  const text = `Hi ${userName}, ${message} Visit Mixxl: https://app.mixxl.fm © 2025 Mixxl. All rights reserved.`;
  return { subject, html, text };
}

// JWT authentication middleware (copied from routes.ts)
export const authenticate = async (req: any, res: any, next: any) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUser(decoded.userId);

    if (!user) {
      return res.status(401).json({ error: "Authentication required" });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Authentication required" });
  }
};

// Admin middleware to check if user is admin
export const requireAdmin = async (req: any, res: any, next: any) => {
  await authenticate(req, res, () => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  });
};

export function registerAdminRoutes(app: Express) {
  // ========== ADMIN STATS ==========

  // Get admin dashboard stats
  // app.get("/api/admin/stats", authenticate, requireAdmin, async (req, res) => {
  //   try {
  //     const stats = await storage.getAdminStats();
  //     res.json(stats);
  //   } catch (error: any) {
  //     res.status(500).json({ error: error.message });
  //   }
  // });

  // ========== DELETE USER ==========

  app.delete(
    "/api/auth/user/:id",
    authenticate,
    requireAdmin,
    async (req, res) => {
      try {
        const { id } = req.params;

        if (!id) {
          return res.status(400).json({ message: "User ID is required" });
        }

        await storage.deleteUser(id);

        return res.status(200).json({ message: "User deleted successfully" });
      } catch (error) {
        console.error("Delete user error:", error);
        return res.status(500).json({ message: "Failed to delete user" });
      }
    }
  );

  app.patch(
    "/api/auth/user/:id/status",
    authenticate,
    requireAdmin,
    async (req, res) => {
      try {
        const { id } = req.params;
        const { isActive } = req.body; // expects boolean true/false

        if (typeof isActive !== "boolean") {
          return res
            .status(400)
            .json({ message: "isActive (boolean) is required" });
        }

        const user = await storage.updateUser(id, { isActive });

        if (!user) {
          return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
          message: `User ${
            isActive ? "activated" : "deactivated"
          } successfully`,
          user,
        });
      } catch (error) {
        console.error("User status update error:", error);
        return res
          .status(500)
          .json({ message: "Failed to update user status" });
      }
    }
  );

  // ========== DEMO SUBMISSIONS (Label A&R) ==========

  app.get(
    "/api/admin/demo-submissions",
    authenticate,
    requireAdmin,
    async (req, res) => {
      try {
        const submissions = await storage.getDemoSubmissionsWithDetails();
        res.json(submissions);
      } catch (error: any) {
        console.error("Demo submissions error:", error);
        res.status(500).json({ error: error.message });
      }
    }
  );

  app.patch(
    "/api/admin/demo-submissions/:id/status",
    authenticate,
    requireAdmin,
    async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;
        if (!status || !["pending", "accepted", "rejected", "awaiting_payment", "active"].includes(status)) {
          return res.status(400).json({ error: "Invalid status. Use: pending, accepted, rejected, awaiting_payment, active" });
        }
        const updated = await storage.updateDemoSubmissionStatus(id, status);
        if (!updated) {
          return res.status(404).json({ error: "Demo submission not found" });
        }
        res.json(updated);
      } catch (error: any) {
        console.error("Update demo status error:", error);
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ========== ADMIN UPLOAD FOR ARTIST ==========

  app.post(
    "/api/admin/tracks",
    authenticate,
    requireAdmin,
    async (req: any, res) => {
      try {
        const trackData = req.body;
        const validatedData = insertTrackSchema.parse(trackData);

        // Verify artist exists and has artist role
        const artist = await storage.getUser(validatedData.artistId);
        if (!artist) {
          return res.status(404).json({ error: "Artist not found" });
        }
        if (artist.role !== "artist") {
          return res.status(400).json({ error: "User must be an artist to receive track uploads" });
        }

        const track = await storage.createTrack(validatedData);
        res.json(track);
      } catch (error: any) {
        if (error.name === "ZodError") {
          return res.status(400).json({ message: "Invalid data", errors: error.errors });
        }
        console.error("Admin track upload error:", error);
        res.status(500).json({ error: error.message });
      }
    }
  );

  // List all tracks with artist data (for admin selection UI)
  app.get("/api/admin/tracks/list", requireAdmin, async (req, res) => {
    try {
      const rows = await storage.getAllTracksWithArtists();
      res.json(rows);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bulk download selected tracks and cover images as ZIP (must be before /:id)
  app.post("/api/admin/tracks/export-zip", requireAdmin, async (req, res) => {
    try {
      const { trackIds } = req.body || {};
      let rows = await storage.getAllTracksWithArtists();
      if (Array.isArray(trackIds) && trackIds.length > 0) {
        const idSet = new Set(trackIds);
        rows = rows.filter((r: any) => idSet.has(r.trackId));
      }
      if (rows.length === 0) {
        return res.status(400).json({ error: "No tracks selected" });
      }

      const sanitize = (s: string) =>
        String(s || "unknown").replace(/[<>:"/\\|?*]/g, "_").slice(0, 80);

      res.setHeader("Content-Type", "application/zip");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="tracks-export-${new Date().toISOString().slice(0, 10)}.zip"`
      );

      const archive = archiver("zip", { zlib: { level: 6 } });
      archive.pipe(res);

      const getBuffer = async (urlOrPath: string): Promise<Buffer | null> => {
        if (!urlOrPath) return null;
        try {
          if (urlOrPath.startsWith("http://") || urlOrPath.startsWith("https://")) {
            const resp = await fetch(urlOrPath);
            if (!resp.ok) return null;
            const ab = await resp.arrayBuffer();
            return Buffer.from(ab);
          }
          const localPath = path.join(process.cwd(), urlOrPath.replace(/^\//, ""));
          if (fs.existsSync(localPath)) {
            return fs.readFileSync(localPath);
          }
        } catch {
          /* ignore */
        }
        return null;
      };

      for (let i = 0; i < rows.length; i++) {
        const r = rows[i];
        const dirName = `${r.artistId}_${sanitize(r.artistUsername || "artist")}`;
        const titleSlug = sanitize(r.trackTitle || "track");

        if (r.fileUrl) {
          const buf = await getBuffer(r.fileUrl);
          if (buf) {
            const ext = path.extname(r.fileUrl.split("?")[0]) || ".mp3";
            archive.append(buf, { name: `${dirName}/${titleSlug}${ext}` });
          }
        }
        if (r.coverImage) {
          const buf = await getBuffer(r.coverImage);
          if (buf) {
            const ext = path.extname(r.coverImage.split("?")[0]) || ".jpg";
            archive.append(buf, { name: `${dirName}/${titleSlug}_cover${ext}` });
          }
        }
      }

      await archive.finalize();
    } catch (error: any) {
      if (!res.headersSent) {
        res.status(500).json({ error: error.message });
      }
    }
  });

  // Bulk export all tracks with artist data as CSV (must be before /:id)
  app.get("/api/admin/tracks/export", requireAdmin, async (req, res) => {
    try {
      const rows = await storage.getAllTracksWithArtists();
      const escape = (s: string) =>
        `"${String(s ?? "").replace(/"/g, '""')}"`;
      const header =
        "track_id,track_title,track_description,genre,mood,duration,file_url,cover_image,price,is_public,is_explicit,play_count,likes_count,download_count,track_created_at,track_updated_at,artist_id,artist_username,artist_full_name,artist_email,artist_country,artist_location,artist_website\n";
      const csvRows = rows.map((r: any) =>
        [
          r.trackId,
          escape(r.trackTitle || ""),
          escape((r.trackDescription || "").replace(/\n/g, " ")),
          escape(r.genre || ""),
          escape(r.mood || ""),
          r.duration ?? "",
          escape(r.fileUrl || ""),
          escape(r.coverImage || ""),
          r.price ?? "",
          r.isPublic ? "true" : "false",
          r.isExplicit ? "true" : "false",
          r.playCount ?? 0,
          r.likesCount ?? 0,
          r.downloadCount ?? 0,
          r.trackCreatedAt || "",
          r.trackUpdatedAt || "",
          r.artistId,
          escape(r.artistUsername || ""),
          escape(r.artistFullName || ""),
          escape(r.artistEmail || ""),
          escape(r.artistCountry || ""),
          escape(r.artistLocation || ""),
          escape(r.artistWebsite || ""),
        ].join(",")
      );
      const csv = header + csvRows.join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="tracks-export-${new Date().toISOString().slice(0, 10)}.csv"`
      );
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get(
    "/api/admin/tracks/:id",
    authenticate,
    requireAdmin,
    async (req: any, res) => {
      try {
        const track = await storage.getTrack(req.params.id);
        if (!track) {
          return res.status(404).json({ error: "Track not found" });
        }
        res.json(track);
      } catch (error: any) {
        console.error("Admin get track error:", error);
        res.status(500).json({ error: error.message });
      }
    }
  );

  app.put(
    "/api/admin/tracks/:id",
    authenticate,
    requireAdmin,
    async (req: any, res) => {
      try {
        const { id } = req.params;
        const validatedUpdates = updateTrackSchema.parse(req.body);

        const existingTrack = await storage.getTrack(id);
        if (!existingTrack) {
          return res.status(404).json({ error: "Track not found" });
        }

        const updatedTrack = await storage.updateTrack(id, validatedUpdates);
        res.json(updatedTrack);
      } catch (error: any) {
        if (error.name === "ZodError") {
          return res.status(400).json({ message: "Invalid data", errors: error.errors });
        }
        console.error("Admin track update error:", error);
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ========== FEATURED SPOTS MANAGEMENT ==========

  // Get all featured spots (with filtering)
  app.get(
    "/api/admin/featured-spots",
    authenticate,
    requireAdmin,
    async (req, res) => {
      try {
        const { status } = req.query;
        const spots = await storage.getFeaturedSpots(status as string);
        res.json(spots);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Get single featured spot
  app.get("/api/admin/featured-spots/:id", requireAdmin, async (req, res) => {
    try {
      const spot = await storage.getFeaturedSpot(req.params.id);
      if (!spot) {
        return res.status(404).json({ error: "Featured spot not found" });
      }
      res.json(spot);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  //public featured-spots
  app.get("/api/featured-spots", async (req, res) => {
    try {
      const { status } = req.query;
      const spots = await storage.getFeaturedSpots(status as string);
      res.json(spots);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create featured spot
  app.post("/api/admin/featured-spots", requireAdmin, async (req, res) => {
    try {
      const bodyWithDates = {
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
      };

      const validatedData = insertFeaturedSpotSchema.parse(bodyWithDates);

      const spot = await storage.createFeaturedSpot(validatedData);
      res.status(201).json(spot);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Update featured spot
  app.put("/api/admin/featured-spots/:id", requireAdmin, async (req, res) => {
    try {
      const updates = req.body;

      // Convert date strings to Date objects if needed
      if (updates.startDate && typeof updates.startDate === "string") {
        updates.startDate = new Date(updates.startDate);
      }
      if (updates.endDate && typeof updates.endDate === "string") {
        updates.endDate = new Date(updates.endDate);
      }

      const spot = await storage.updateFeaturedSpot(req.params.id, updates);
      res.json(spot);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete featured spot
  app.delete(
    "/api/admin/featured-spots/:id",
    requireAdmin,
    async (req, res) => {
      try {
        await storage.deleteFeaturedSpot(req.params.id);
        res.json({ message: "Featured spot deleted successfully" });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Create payment intent for featured spot
  app.post(
    "/api/admin/featured-spots/:id/payment",
    requireAdmin,
    async (req, res) => {
      try {
        const spot = await storage.getFeaturedSpot(req.params.id);
        if (!spot) {
          return res.status(404).json({ error: "Featured spot not found" });
        }

        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(parseFloat(spot.priceUSD) * 100), // Convert to cents
          currency: "gbp",
          metadata: {
            type: "featured_spot",
            spotId: spot.id,
            artistId: spot.artistId,
          },
        });

        // Update spot with payment intent ID
        await storage.updateFeaturedSpot(spot.id, {
          stripePaymentIntentId: paymentIntent.id,
        });

        res.json({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id,
        });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Confirm featured spot payment
  app.post(
    "/api/admin/featured-spots/:id/confirm-payment",
    requireAdmin,
    async (req, res) => {
      try {
        const { paymentIntentId } = req.body;

        // Verify payment with Stripe
        const paymentIntent = await stripe.paymentIntents.retrieve(
          paymentIntentId
        );

        if (paymentIntent.status === "succeeded") {
          await storage.updateFeaturedSpot(req.params.id, {
            status: "active",
            paidAt: new Date(),
          });

          res.json({ message: "Featured spot activated successfully" });
        } else {
          res.status(400).json({ error: "Payment not completed" });
        }
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ========== COMPETITION MANAGEMENT ==========

  // ========== PUBLIC VOTING ROUTES ==========

  // List competitions for voting (public - voting_live or accepting_demos)
  app.get("/api/voting/competitions", async (req, res) => {
    try {
      const list = await storage.getCompetitions();
      const forVoting = list.filter(
        (c: any) =>
          c.status === "voting_live" || c.status === "accepting_demos"
      );
      res.json(forVoting);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get competition with entries (public)
  app.get("/api/voting/competitions/:id", async (req, res) => {
    try {
      const competition = await storage.getCompetition(req.params.id);
      if (!competition) {
        return res.status(404).json({ error: "Competition not found" });
      }
      const entries = await storage.getCompetitionEntries(req.params.id);
      const voteCounts =
        competition.showVoteCount !== false
          ? await storage.getVoteCountByEntry(req.params.id)
          : {};
      res.json({ ...competition, entries, voteCounts });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Cast vote (requires auth, fan role)
  app.post("/api/voting/vote", authenticate, async (req: any, res) => {
    try {
      if (req.user.role !== "fan") {
        return res.status(403).json({
          error: "Only fans can vote. Sign up as a fan to participate.",
        });
      }
      const { competitionId, entryId } = req.body;
      if (!competitionId || !entryId) {
        return res.status(400).json({ error: "competitionId and entryId required" });
      }
      const alreadyVoted = await storage.hasUserVotedForEntry(
        req.user.id,
        entryId
      );
      if (alreadyVoted) {
        return res.status(400).json({ error: "You have already voted for this entry" });
      }
      const competition = await storage.getCompetition(competitionId);
      if (!competition || competition.status !== "voting_live") {
        return res.status(400).json({ error: "Voting is not open for this competition" });
      }
      const vote = await storage.createCompetitionVote({
        fanUserId: req.user.id,
        competitionId,
        entryId,
      });
      res.json(vote);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user's voted entry IDs for a competition (requires auth)
  app.get(
    "/api/voting/competitions/:id/my-votes",
    authenticate,
    async (req: any, res) => {
      try {
        const votes = await storage.getVotesForCompetition(req.params.id);
        const myVotes = votes
          .filter((v: any) => v.fanUserId === req.user.id)
          .map((v: any) => v.entryId);
        res.json({ entryIds: myVotes });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ========== ADMIN COMPETITION MANAGEMENT ==========

  // Get default prize text
  app.get("/api/admin/competitions/default-prize", requireAdmin, (req, res) => {
    res.json({ prizeDescription: DEFAULT_PRIZE_TEXT });
  });

  // Get all competitions (optionally grouped by city)
  app.get("/api/admin/competitions", requireAdmin, async (req, res) => {
    try {
      const { status, grouped } = req.query;
      if (grouped === "true") {
        const groupedByCity = await storage.getCompetitionsGroupedByCity();
        return res.json(groupedByCity);
      }
      const list = await storage.getCompetitions(status as string);
      res.json(list);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single competition
  app.get("/api/admin/competitions/:id", requireAdmin, async (req, res) => {
    try {
      const competition = await storage.getCompetition(req.params.id);
      if (!competition) {
        return res.status(404).json({ error: "Competition not found" });
      }
      res.json(competition);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create competition
  app.post("/api/admin/competitions", requireAdmin, async (req, res) => {
    try {
      const bodyWithDates = {
        ...req.body,
        startDate: new Date(req.body.startDate),
        endDate: new Date(req.body.endDate),
        maxFinalists: req.body.maxFinalists ?? 20,
        prizeDescription: req.body.prizeDescription ?? DEFAULT_PRIZE_TEXT,
      };
      const validatedData = insertCompetitionSchema.parse(bodyWithDates);
      const competition = await storage.createCompetition(validatedData);
      res.status(201).json(competition);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Update competition
  app.put("/api/admin/competitions/:id", requireAdmin, async (req, res) => {
    try {
      const updates = { ...req.body };
      if (updates.startDate && typeof updates.startDate === "string") {
        updates.startDate = new Date(updates.startDate);
      }
      if (updates.endDate && typeof updates.endDate === "string") {
        updates.endDate = new Date(updates.endDate);
      }
      const competition = await storage.updateCompetition(req.params.id, updates);
      res.json(competition);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete competition
  app.delete("/api/admin/competitions/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteCompetition(req.params.id);
      res.json({ message: "Competition deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Upload competition banner
  app.put(
    "/api/admin/competitions/:id/banner",
    requireAdmin,
    uploadCompetitionBanner.single("banner"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "Banner image is required" });
        }
        const updated = await storage.updateCompetition(req.params.id, {
          bannerImage: `/uploads/competition-banners/${req.file.filename}`,
        });
        res.json(updated);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Competition entries CRUD
  app.get(
    "/api/admin/competitions/:id/entries",
    requireAdmin,
    async (req, res) => {
      try {
        const entries = await storage.getCompetitionEntries(req.params.id);
        res.json(entries);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  app.post(
    "/api/admin/competitions/:id/entries",
    requireAdmin,
    async (req, res) => {
      try {
        const validated = insertCompetitionEntrySchema.parse({
          ...req.body,
          competitionId: req.params.id,
        });
        const entry = await storage.createCompetitionEntry(validated);
        res.status(201).json(entry);
      } catch (error: any) {
        if (error instanceof z.ZodError) {
          return res
            .status(400)
            .json({ error: "Validation error", details: error.errors });
        }
        res.status(500).json({ error: error.message });
      }
    }
  );

  app.put(
    "/api/admin/competitions/:competitionId/entries/:entryId",
    requireAdmin,
    async (req, res) => {
      try {
        const { entryId } = req.params;
        const updates = req.body;
        const entry = await storage.updateCompetitionEntry(entryId, updates);
        res.json(entry);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  app.delete(
    "/api/admin/competitions/:competitionId/entries/:entryId",
    requireAdmin,
    async (req, res) => {
      try {
        await storage.deleteCompetitionEntry(req.params.entryId);
        res.json({ message: "Entry deleted successfully" });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Competition votes admin - leaderboard
  app.get(
    "/api/admin/competitions/:id/leaderboard",
    requireAdmin,
    async (req, res) => {
      try {
        const leaderboard = await storage.getLeaderboard(req.params.id);
        res.json(leaderboard);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Competition votes admin - export CSV
  app.get(
    "/api/admin/competitions/:id/votes/export",
    requireAdmin,
    async (req, res) => {
      try {
        const votes = await storage.getVotesForCompetition(req.params.id);
        const entries = await storage.getCompetitionEntries(req.params.id);
        const entryMap = Object.fromEntries(entries.map((e: any) => [e.id, e]));
        const fanIds = [...new Set(votes.map((v: any) => v.fanUserId))];
        const fans = await Promise.all(
          fanIds.map((id) => storage.getUser(id))
        );
        const fanMap = Object.fromEntries(
          fans.filter(Boolean).map((u: any) => [u.id, u])
        );
        const escape = (s: string) => `"${String(s || "").replace(/"/g, '""')}"`;
        const header =
          "fan_user_id,fan_email,fan_name,competition_id,entry_id,entry_song_title,artist_name,timestamp\n";
        const rows = votes.map((v: any) => {
          const entry = entryMap[v.entryId];
          const fan = fanMap[v.fanUserId];
          const artistName =
            entry?.artist?.fullName || entry?.artist?.username || "";
          const songTitle = entry?.songTitle || "";
          const fanEmail = fan?.email || "";
          const fanName = fan?.fullName || fan?.username || "";
          return `${v.fanUserId},${escape(fanEmail)},${escape(fanName)},${v.competitionId},${v.entryId},${escape(songTitle)},${escape(artistName)},${v.createdAt}`;
        });
        const csv = header + rows.join("\n");
        res.setHeader("Content-Type", "text/csv");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename="votes-${req.params.id}.csv"`
        );
        res.send(csv);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ========== BROADCAST MANAGEMENT ==========

  // Get all broadcasts
  app.get("/api/admin/broadcasts", requireAdmin, async (req, res) => {
    try {
      const { status } = req.query;
      const broadcasts = await storage.getAdminBroadcasts(status as string);
      res.json(broadcasts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single broadcast
  app.get("/api/admin/broadcasts/:id", requireAdmin, async (req, res) => {
    try {
      const broadcast = await storage.getAdminBroadcast(req.params.id);
      if (!broadcast) {
        return res.status(404).json({ error: "Broadcast not found" });
      }
      res.json(broadcast);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create broadcast
  app.post("/api/admin/broadcasts", requireAdmin, async (req, res) => {
    try {
      // Prepare data for validation
      const requestData = { ...req.body };

      // Remove scheduledFor if it's empty/null, or convert to Date if it's a string
      if (!requestData.scheduledFor || requestData.scheduledFor === "") {
        delete requestData.scheduledFor;
      } else if (typeof requestData.scheduledFor === "string") {
        requestData.scheduledFor = new Date(requestData.scheduledFor);
      }

      const validatedData = insertAdminBroadcastSchema.parse({
        ...requestData,
        createdBy: req.user.id,
      });

      const broadcast = await storage.createAdminBroadcast(validatedData);
      res.status(201).json(broadcast);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Update broadcast
  app.put("/api/admin/broadcasts/:id", requireAdmin, async (req, res) => {
    try {
      // Prepare data for validation
      const updates = { ...req.body };

      log("before", JSON.stringify(updates));
      // Remove scheduledFor if it's empty/null, or convert to Date if it's a string
      if (typeof updates.scheduledFor === "string") {
        updates.scheduledFor = new Date(updates.scheduledFor);
      }
      log("after", JSON.stringify(updates));
      const broadcast = await storage.updateAdminBroadcast(
        req.params.id,
        updates
      );
      res.json(broadcast);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete broadcast
  app.delete("/api/admin/broadcasts/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteAdminBroadcast(req.params.id);
      res.json({ message: "Broadcast deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Send broadcast immediately
  app.post("/api/admin/broadcasts/:id/send", requireAdmin, async (req, res) => {
    try {
      const broadcast = await storage.getAdminBroadcast(req.params.id);
      if (!broadcast) {
        return res.status(404).json({ error: "Broadcast not found" });
      }

      if (broadcast.status !== "draft") {
        return res
          .status(400)
          .json({ error: "Only draft broadcasts can be sent" });
      }

      // Get target users based on audience
      let targetUsers = [];
      if (broadcast.targetAudience === "all") {
        targetUsers = await storage
          .getUsersByRole("fan")
          .then((fans) =>
            storage
              .getUsersByRole("artist")
              .then((artists) => [...fans, ...artists])
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
          userIds.map(async (id: string) => storage.getUser(id))
        );
        targetUsers = targetUsers.filter(Boolean);
      }

      let sentCount = 0;
      let failedCount = 0;

      // Send to each user
      for (const user of targetUsers) {
        try {
          // Create recipient record
          await storage.createBroadcastRecipient({
            broadcastId: broadcast.id,
            userId: user.id,
            status: "pending",
          });

          // Send notification (always)
          if (broadcast.type === "notification" || broadcast.type === "both") {
            await storage.createNotification({
              userId: user.id,
              actorId: req.user.id,
              type: "comment", // Using generic type for admin notifications
              title: broadcast.title,
              message: broadcast.message,
              actionUrl: "/",
            });
          }

          // Send email if type includes email
          if (
            (broadcast.type === "email" || broadcast.type === "both") &&
            process.env.SENDGRID_API_KEY
          ) {
            const emailContent = generateBroadcastEmail(
              broadcast.title,
              broadcast.message,
              user.fullName || "User"
            );

            const emailSent = await sendEmail({
              to: user.email,
              from: EMAIL_FROM,
              subject: emailContent.subject,
              html: emailContent.html,
              text: emailContent.text,
            });

            if (emailSent) {
              await storage.updateBroadcastRecipient(user.id, {
                status: "sent",
                sentAt: new Date(),
              });
            }
          }

          sentCount++;
        } catch (error) {
          console.error(`Failed to send broadcast to user ${user.id}:`, error);
          failedCount++;
        }
      }

      // Update broadcast status
      await storage.updateAdminBroadcast(broadcast.id, {
        status: "sent",
        sentAt: new Date(),
        recipientCount: sentCount,
      });

      res.json({
        message: "Broadcast sent successfully",
        sentCount,
        failedCount,
        totalTargeted: targetUsers.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get broadcast recipients
  app.get(
    "/api/admin/broadcasts/:id/recipients",
    requireAdmin,
    async (req, res) => {
      try {
        const recipients = await storage.getBroadcastRecipients(req.params.id);
        res.json(recipients);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ========== ANALYTICS & STATS ==========

  // Get admin dashboard stats
  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const [totalUsers, totalArtists, totalFans, subscribedUsers] =
        await Promise.all([
          storage
            .getUsersByRole("fan")
            .then((fans) =>
              storage
                .getUsersByRole("artist")
                .then((artists) => fans.length + artists.length)
            ),
          storage.getUsersByRole("artist").then((artists) => artists.length),
          storage.getUsersByRole("fan").then((fans) => fans.length),
          storage.getSubscribedUsers().then((users) => users.length),
        ]);

      const [activeFeaturedSpots, totalBroadcasts] = await Promise.all([
        storage.getActiveFeaturedSpots().then((spots) => spots.length),
        storage.getAdminBroadcasts().then((broadcasts) => broadcasts.length),
      ]);

      res.json({
        users: {
          total: totalUsers,
          artists: totalArtists,
          fans: totalFans,
          subscribed: subscribedUsers,
        },
        featuredSpots: {
          active: activeFeaturedSpots,
        },
        broadcasts: {
          total: totalBroadcasts,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get user management data
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const { role, limit = 50, offset = 0 } = req.query;

      let users;
      if (role && role !== "all") {
        users = await storage.getUsersByRole(role as string);
      } else {
        users = await storage.getAllUsers();
      }

      // Apply pagination
      const paginatedUsers = users.map((user) => ({
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        emailVerified: user.emailVerified,
        subscriptionStatus: user.subscriptionStatus,
        createdAt: user.createdAt,
        isActive: user.isActive,
      }));

      res.json({
        users: paginatedUsers,
        total: users.length,
        // hasMore:
        //   parseInt(offset as string) + parseInt(limit as string) < users.length,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ========== DISCOUNT CODES MANAGEMENT ==========

  // Get all discount codes
  app.get("/api/admin/discount-codes", requireAdmin, async (req, res) => {
    try {
      const codes = await storage.getDiscountCodes();
      res.json(codes);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single discount code
  app.get("/api/admin/discount-codes/:id", requireAdmin, async (req, res) => {
    try {
      const code = await storage.getDiscountCodeById(req.params.id);
      if (!code) {
        return res.status(404).json({ error: "Discount code not found" });
      }
      res.json(code);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create discount code
  app.post("/api/admin/discount-codes", requireAdmin, async (req, res) => {
    try {
      // Handle applicableRoles properly for JSON column
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
        minimumAmount: req.body.minimumAmount
          ? req.body.minimumAmount.toString()
          : null,
        applicableRoles,
      });

      const newCode = await storage.createDiscountCode(validatedData);
      res.status(201).json(newCode);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res
          .status(400)
          .json({ error: "Validation error", details: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Update discount code
  app.put("/api/admin/discount-codes/:id", requireAdmin, async (req, res) => {
    try {
      // Handle applicableRoles properly for JSON column
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
        validFrom: req.body.validFrom
          ? new Date(req.body.validFrom)
          : undefined,
        validUntil: req.body.validUntil ? new Date(req.body.validUntil) : null,
        maxUses: req.body.maxUses ? parseInt(req.body.maxUses) : null,
        value: req.body.value ? req.body.value.toString() : null,
        minimumAmount: req.body.minimumAmount
          ? req.body.minimumAmount.toString()
          : null,
        applicableRoles,
      };

      const updatedCode = await storage.updateDiscountCode(
        req.params.id,
        updates
      );
      res.json(updatedCode);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete discount code
  app.delete(
    "/api/admin/discount-codes/:id",
    requireAdmin,
    async (req, res) => {
      try {
        await storage.deleteDiscountCode(req.params.id);
        res.json({ message: "Discount code deleted successfully" });
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // Validate discount code (public endpoint for subscription flow)
  app.post("/api/discount-codes/validate", async (req, res) => {
    try {
      const { code, userId, role } = req.body;

      if (!code || !userId) {
        return res.status(400).json({ error: "Code and userId are required" });
      }

      const validation = await storage.validateDiscountCode(code, userId, role);
      res.json(validation);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Use discount code (called during subscription process)
  app.post("/api/discount-codes/use", async (req, res) => {
    try {
      const { code, userId, orderId, discountAmount, originalAmount } =
        req.body;

      if (!code || !userId || !orderId || discountAmount === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // First validate the code
      const validation = await storage.validateDiscountCode(code, userId);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.reason });
      }

      // Record the usage
      const usage = await storage.useDiscountCode(
        validation.discount!.id,
        userId,
        orderId,
        discountAmount,
        originalAmount
      );

      res.json(usage);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get discount code usage history
  app.get(
    "/api/admin/discount-codes/:id/usage",
    requireAdmin,
    async (req, res) => {
      try {
        const usage = await storage.getDiscountCodeUsage(req.params.id);
        res.json(usage);
      } catch (error: any) {
        res.status(500).json({ error: error.message });
      }
    }
  );

  // ========== ADVERTISING BANNER MANAGEMENT ==========

  // Get all my banners (ignore active, exclude deleted)
  app.get("/api/my/banners", requireAdmin, async (req, res) => {
    try {
      const banners = await storage.getAllMyBanners(req.user.id);
      res.json(banners);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get my banner by ID (exclude deleted)
  app.get("/api/my/banners/:id", requireAdmin, async (req, res) => {
    try {
      const banner = await storage.getMyBannerById(req.user.id, req.params.id);

      if (!banner) {
        return res.status(404).json({ error: "Banner not found" });
      }

      res.json(banner);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all banners (only active + not deleted)
  app.get("/api/banners", async (req, res) => {
    try {
      const banners = await storage.getAllBanners();
      res.json(banners);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create banner
  app.post(
    "/api/admin/banners",
    requireAdmin,
    uploadBanner.single("image"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: "Image file is required" });
        }

        const insertBannerData: InsertBanner = {
          ...req.body,
          active: req.body.active ? true : false,
          createdBy: req.user.id,
          imageUrl: `/uploads/banners/${req.file.filename}`,
        };

        const validatedData = insertBannerSchema.parse(insertBannerData);

        const banner: Banner = await storage.createBanner(validatedData);
        res.status(201).json(banner);
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ details: error.errors });
        }
        if (error instanceof Error) {
          return res.status(500).json({ error: error.message });
        }
        res.status(500).json({ error: "Unknown error" });
      }
    }
  );

  app.put(
    "/api/admin/banners/:id",
    requireAdmin,
    uploadBanner.single("image"),
    async (req, res) => {
      try {
        const bannerId = req.params.id;

        // 1. Fetch the existing banner
        const existingBanner: Banner | null = await storage.getMyBannerById(
          req.user.id,
          bannerId
        );
        if (!existingBanner) {
          return res.status(404).json({ error: "Banner not found" });
        }

        // 2. Prepare updates, keeping existing values for fields not provided
        const updates: Partial<InsertBanner> = {
          title: req.body.title ?? existingBanner.title,
          description: req.body.description ?? existingBanner.description,
          cta: req.body.cta ?? existingBanner.cta,
          ctaUrl: req.body.ctaUrl ?? existingBanner.ctaUrl,
          active:
            req.body.active !== undefined
              ? req.body.active === "true"
              : existingBanner.active,
          // imageUrl will be handled below
        };

        // 3. If new file uploaded, delete old image and set new imageUrl
        if (req.file) {
          // Delete old image file if exists
          if (existingBanner.imageUrl) {
            const oldImagePath = path.join(
              process.cwd(),
              existingBanner.imageUrl
            );
            fs.unlink(oldImagePath, (err) => {
              if (err) {
                console.warn("Failed to delete old image:", oldImagePath, err);
              }
            });
          }

          updates.imageUrl = `/uploads/banners/${req.file.filename}`;
        } else {
          updates.imageUrl = existingBanner.imageUrl; // keep existing if no new file
        }

        // 4. Update banner in DB/storage
        const updatedBanner: Banner = await storage.updateBanner(
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

  // Delete banner
  app.delete("/api/admin/banners/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteBanner(req.params.id);
      res.json({ message: "Banner deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}
