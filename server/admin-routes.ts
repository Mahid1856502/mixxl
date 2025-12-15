import type { Express } from "express";
import { z } from "zod";
import Stripe from "stripe";
import { storage } from "./storage";
import {
  insertFeaturedSpotSchema,
  insertAdminBroadcastSchema,
  insertDiscountCodeSchema,
  insertBannerSchema,
  User,
  InsertBanner,
  Banner,
} from "@shared/schema";
import { sendEmail } from "./email";
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "fs";
import path from "path";
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
              from: "noreply@mixxl.fm",
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
