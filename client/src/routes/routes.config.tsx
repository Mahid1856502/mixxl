// src/routes.config.ts
import type { ComponentType } from "react";

// Auth / Public pages
import Home from "@/pages/home";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import VerifyEmail from "@/pages/verify-email";
import ResetPassword from "@/pages/reset-password";
import SetupRole from "@/pages/setup-role";
import Onboarding from "@/pages/onboarding";
import PricingComparison from "@/pages/pricing-comparison";
import WhyFansChooseMixxl from "@/pages/why-fans-choose-mixxl";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsConditions from "@/pages/terms-conditions";
import Blog from "@/pages/blog";
import Contact from "@/pages/contact";
import FAQ from "@/pages/faq";
import NotFound from "@/pages/not-found";

// Shared / Logged-in pages
import Dashboard from "@/pages/dashboard";
import Upload from "@/pages/upload";
import Discover from "@/pages/discover";
import Radio from "@/pages/radio";
import Profile from "@/pages/profile";
import ProfileSettings from "@/pages/profile-settings";
import Subscribe from "@/pages/subscribe";
import Checkout from "@/pages/checkout";
import LiveStreamPage from "@/pages/live-stream";
import Messages from "@/pages/messages";
import Notifications from "@/pages/notifications";
import StripeSetup from "@/pages/stripe-setup";
import FanProfile from "@/pages/fan-profile";
import PlaylistPage from "@/pages/playlist";
import TrackPage from "@/pages/track";

// Admin pages
import AdminDashboard from "@/pages/admin/index";
import ManageBannersPage from "@/pages/banners";
import Admin from "@/pages/admin";
import FeaturedSpotsAdmin from "@/pages/admin/featured-spots";
import BroadcastsAdmin from "@/pages/admin/broadcasts";
import UsersAdmin from "@/pages/admin/users";
import AdminDiscountCodes from "@/pages/admin/discount-codes";
import Unauthorized from "@/pages/unauthorized";
import UnverifiedPage from "@/pages/unverified";

export interface AppRoute {
  path: string;
  component: ComponentType<any>;
  roles?: string[]; // undefined = public
}

export const appRoutes: AppRoute[] = [
  // Public
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/signup", component: Signup },
  { path: "/verify-email", component: VerifyEmail },
  { path: "/reset-password", component: ResetPassword },
  { path: "/setup-role", component: SetupRole },
  { path: "/onboarding", component: Onboarding },
  { path: "/pricing-comparison", component: PricingComparison },
  { path: "/why-fans-choose-mixxl", component: WhyFansChooseMixxl },
  { path: "/privacy-policy", component: PrivacyPolicy },
  { path: "/terms-conditions", component: TermsConditions },
  { path: "/blog", component: Blog },
  { path: "/contact", component: Contact },
  { path: "/faq", component: FAQ },

  // Logged-in: any role
  {
    path: "/dashboard",
    component: Dashboard,
    roles: ["fan", "artist", "admin"],
  },
  { path: "/discover", component: Discover, roles: ["fan", "artist", "admin"] },
  { path: "/radio", component: Radio, roles: ["fan", "artist", "admin"] },
  {
    path: "/profile/:id?",
    component: Profile,
    roles: ["fan", "artist", "admin"],
  },
  {
    path: "/profile-settings",
    component: ProfileSettings,
    roles: ["fan", "artist", "admin"],
  },
  {
    path: "/subscribe",
    component: Subscribe,
    roles: ["fan", "artist", "admin"],
  },
  { path: "/checkout", component: Checkout, roles: ["fan", "artist", "admin"] },
  {
    path: "/live",
    component: LiveStreamPage,
    roles: ["fan", "artist", "admin"],
  },
  { path: "/messages", component: Messages, roles: ["fan", "artist", "admin"] },
  {
    path: "/notifications",
    component: Notifications,
    roles: ["fan", "artist", "admin"],
  },
  {
    path: "/stripe-setup",
    component: StripeSetup,
    roles: ["fan", "artist", "admin"],
  },
  {
    path: "/fan-profile/:id?",
    component: FanProfile,
    roles: ["fan", "artist", "admin"],
  },
  {
    path: "/playlist/:id",
    component: PlaylistPage,
    roles: ["fan", "artist", "admin"],
  },
  {
    path: "/track/:id",
    component: TrackPage,
    roles: ["fan", "artist", "admin"],
  },

  // Artist-only
  { path: "/upload", component: Upload, roles: ["artist"] },

  // Admin-only
  { path: "/admin", component: AdminDashboard, roles: ["admin"] },
  { path: "/admin/banners", component: ManageBannersPage, roles: ["admin"] },
  { path: "/admin/legacy", component: Admin, roles: ["admin"] },
  {
    path: "/admin/featured-spots",
    component: FeaturedSpotsAdmin,
    roles: ["admin"],
  },
  {
    path: "/admin/featured-spots/new",
    component: FeaturedSpotsAdmin,
    roles: ["admin"],
  },
  { path: "/admin/broadcasts", component: BroadcastsAdmin, roles: ["admin"] },
  {
    path: "/admin/broadcasts/new",
    component: BroadcastsAdmin,
    roles: ["admin"],
  },
  { path: "/admin/users", component: UsersAdmin, roles: ["admin"] },
  {
    path: "/admin/discount-codes",
    component: AdminDiscountCodes,
    roles: ["admin"],
  },

  // Unauthorized
  { path: "/unauthorized", component: Unauthorized },
  { path: "/unverified", component: UnverifiedPage },

  // Fallback
  { path: "*", component: NotFound },
];
