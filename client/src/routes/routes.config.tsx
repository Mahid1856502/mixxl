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
import OnboardingComplete from "@/pages/connect-account/onboarding-complete";
import PurchasingCancel from "@/pages/track-purchasing/cancel";
import PurchasingSuccess from "@/pages/track-purchasing/success";
import SubscriptionSuccess from "@/pages/subscription/success";
import SubscriptionCancel from "@/pages/subscription/cancel";

export interface AppRoute {
  path: string;
  component: ComponentType<any>;
  roles?: string[]; // undefined = public
}

export const PUBLIC_ROUTES: AppRoute[] = [
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
  // Unauthorized
  { path: "/unauthorized", component: Unauthorized },
  // keep fallback here if you want it public
  { path: "*", component: NotFound },
];

export const appRoutes: AppRoute[] = [
  // Logged-in: any role
  {
    path: "/dashboard",
    component: Dashboard,
    roles: ["fan", "artist", "admin"],
  },
  { path: "/discover", component: Discover, roles: ["fan", "artist", "admin"] },
  { path: "/radio", component: Radio },
  {
    path: "/profile/:id?",
    component: Profile,
    roles: ["fan", "artist", "admin", "DJ"],
  },
  {
    path: "/profile-settings",
    component: ProfileSettings,
    roles: ["fan", "artist", "admin", "DJ"],
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
    roles: ["fan", "artist", "admin", "DJ"],
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
  // artist subscription return urls
  {
    path: "/subscription/cancel",
    component: SubscriptionCancel,
    roles: ["fan", "artist", "admin", "DJ"],
  },
  {
    path: "/subscription/success",
    component: SubscriptionSuccess,
    roles: ["fan", "artist", "admin", "DJ"],
  },

  // fan track purchasing return urls
  {
    path: "/purchase/cancel",
    component: PurchasingCancel,
    roles: ["fan", "artist", "admin", "DJ"],
  },
  {
    path: "/purchase/success",
    component: PurchasingSuccess,
    roles: ["fan", "artist", "admin", "DJ"],
  },

  // artist connect accounts return urls
  {
    path: "/artist/onboarding/complete",
    component: OnboardingComplete,
    roles: ["fan", "artist", "admin", "DJ"],
  },
  {
    path: "/artist/onboarding/refresh",
    component: OnboardingComplete,
    roles: ["fan", "artist", "admin", "DJ"],
  },

  ...PUBLIC_ROUTES,
];
