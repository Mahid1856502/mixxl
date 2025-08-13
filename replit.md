# Mixxl - Independent Music Platform

## Overview

Mixxl is a full-stack music streaming and social platform designed for independent artists and music lovers. The application enables users to upload, stream, and discover music while providing social features like following artists, real-time radio broadcasting, and collaborative playlists. The platform includes monetization features through Stripe integration and supports both fan and artist user roles.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

The application follows a monorepo structure with a clear separation between client and server code:

- **Frontend**: React-based SPA using Vite for development and building
- **Backend**: Express.js REST API with WebSocket support for real-time features
- **Database**: MySQL with Drizzle ORM for type-safe database operations
- **Styling**: Tailwind CSS with shadcn/ui components for consistent UI
- **State Management**: TanStack Query for server state and React Context for authentication

## Key Components

### Frontend Architecture (React/TypeScript)
- **Framework**: React 18 with TypeScript in SPA mode
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite with custom configuration for monorepo support
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom color scheme and dark mode support
- **Forms**: React Hook Form with Zod validation schemas

### Backend Architecture (Node.js/Express)
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with structured error handling
- **Real-time**: WebSocket server for live radio chat and notifications
- **File Uploads**: Multer middleware for handling audio files and images
- **Authentication**: JWT-based auth with bcrypt password hashing

### Database Layer
- **Database**: MySQL (can be swapped for PostgreSQL via Drizzle config)
- **ORM**: Drizzle ORM for type-safe database queries
- **Schema**: Shared TypeScript schema definitions between client and server
- **Migrations**: Drizzle Kit for database migrations and schema management

### External Integrations
- **Payments**: Stripe for subscription management and tips
- **Email**: SendGrid for transactional emails (based on package.json)
- **File Storage**: Local file system with configurable upload directory

## Data Flow

1. **Authentication Flow**: JWT tokens stored in localStorage, validated on each API request
2. **Music Upload**: Files processed via Multer, metadata stored in database
3. **Real-time Features**: WebSocket connections for radio chat and live sessions
4. **Payment Processing**: Stripe webhooks for subscription and payment events
5. **Social Features**: Following relationships, collaborative playlists, and messaging

## External Dependencies

### Core Dependencies
- **@stripe/stripe-js**: Payment processing on frontend
- **@tanstack/react-query**: Server state management
- **@neondatabase/serverless**: Database connection (Neon-compatible)
- **bcrypt**: Password hashing
- **jsonwebtoken**: JWT authentication
- **multer**: File upload handling
- **ws**: WebSocket server implementation

### UI Dependencies
- **@radix-ui/***: Headless UI components for accessibility
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **react-hook-form**: Form state management
- **zod**: Runtime type validation

## Deployment Strategy

### Development
- **Command**: `npm run dev` starts the Express server with tsx for TypeScript execution
- **Hot Reload**: Vite dev server with HMR for frontend changes
- **WebSocket**: Development WebSocket server for real-time features

### Production Build
- **Frontend**: `vite build` creates optimized static assets
- **Backend**: `esbuild` bundles server code for production
- **Process**: `npm run build` handles both frontend and backend builds
- **Start**: `npm start` runs the production server

### Environment Configuration
- Database connection via `DATABASE_URL` environment variable
- Stripe keys for payment processing
- JWT secret for authentication
- Upload directory configuration
- Replit-specific optimizations when `REPL_ID` is present

### Database Setup
- Drizzle migrations via `npm run db:push`
- Schema changes automatically generate TypeScript types
- Support for both development and production database environments

## Key Architectural Decisions

### Monorepo Structure
- **Problem**: Organizing full-stack TypeScript application with shared code
- **Solution**: Unified workspace with client/, server/, and shared/ directories
- **Benefits**: Shared TypeScript types, single dependency management, simplified deployment

### Type-Safe Database Layer
- **Problem**: Maintaining type safety between database schema and application code
- **Solution**: Drizzle ORM with shared schema definitions
- **Benefits**: Compile-time error checking, auto-completion, refactoring safety

### Real-time Communication
- **Problem**: Live radio features and real-time chat requirements
- **Solution**: WebSocket server integrated with Express application
- **Benefits**: Low-latency communication, persistent connections, scalable architecture

### Payment Integration
- **Problem**: Monetization through subscriptions and tips
- **Solution**: Stripe integration with webhook handling
- **Benefits**: Secure payment processing, subscription management, compliance

### File Upload Strategy
- **Problem**: Handling large audio files and images
- **Solution**: Multer with local file system storage
- **Benefits**: Simple implementation, configurable storage location, type validation

## Recent Changes

- **Audio Playback Error Resolution Complete (January 30, 2025)**: Successfully fixed all "Playback failed" console errors and restored reliable music streaming functionality
  - Implemented comprehensive 5-phase audio fix plan from Instructions.md with enhanced error handling system
  - Created centralized audio manager (`use-audio-manager.tsx`) to prevent conflicts between multiple audio components
  - Enhanced PreviewPlayer and GlobalAudioPlayer with proper error classification and user-friendly messaging
  - Added audio URL validation, autoplay policy compliance, and detailed error logging for debugging
  - Coordinated audio playback between preview players and global music player to eliminate race conditions
  - Zero console errors achieved - platform now displays user-friendly error messages instead of silent failures
  - Both "Synthwave Sunset" and "Midnight Groove" tracks confirmed working with reliable playback functionality
  - Launch-critical audio reliability issues fully resolved with stable cross-browser compatibility
- **Contact Us and FAQ Pages Implementation (January 30, 2025)**: Complete user support infrastructure for enhanced customer service
  - Created comprehensive Contact Us page with contact form, support information, and response times
  - Built detailed FAQ page with 20+ questions organized by categories (Getting Started, Music & Uploads, Social Features, Payments, Account Settings)
  - Added both pages to main navigation routing for seamless user access
  - Updated homepage footer with "Contact Us" and "FAQ" links in new "Support & Legal" section
  - Backend endpoint ready for contact form submissions with proper logging
  - Updated contact information with The Old Shed Studios address (Dyfan Road, Barry, CF63 1DP) and phone number as "Coming Soon"
  - Both pages maintain Mixxl gradient branding consistency throughout platform

### January 30, 2025
- **International Currency Support with £GBP Default (January 30, 2025)**: Comprehensive multi-currency system implemented for global artist support
  - Set £GBP as default platform currency reflecting UK-based operations
  - Added currency selection to signup wizard with 20+ international currencies (USD, EUR, CAD, AUD, JPY, CHF, SEK, NOK, DKK, INR, BRL, MXN, KRW, SGD, NZD, ZAR, RUB, CNY, HKD)
  - Enhanced tip modal with currency selector and localized minimum amounts
  - Implemented currency conversion utilities with simplified exchange rates for development
  - Updated subscription pricing to display £10/month throughout platform
  - Database schema updated with preferredCurrency field defaulting to GBP
  - Currency-aware tip notifications displaying correct symbols (£, $, €, etc.)
  - Smart currency suggestions in tip modal based on user's preferred currency
  - International artist onboarding now includes currency preference selection
  - Platform ready for global expansion with proper currency infrastructure
- **Complete Discount Codes System with Mixxl Branding (January 30, 2025)**: Fully functional discount codes management system with beautiful gradient branding
  - Applied complete Mixxl gradient branding with purple-to-pink header design matching admin interface
  - Dark theme styling throughout with gray-900 background and proper color contrast for accessibility
  - Enhanced UI elements with purple accent colors on code badges and interactive elements
  - Fixed all JSX structure issues and database integration for seamless functionality
  - Admin can create, edit, delete, and manage discount codes with full CRUD operations
  - Support for free subscription codes, percentage discounts, and fixed amount discounts
  - Working code generation, copy functionality, and usage tracking
  - Beautiful table design with dark theme borders and proper hover states
  - Consistent button styling with gradient effects matching the rest of the admin section
- **User Profile Routes & Featured Spot Profile Linking Fixed (January 30, 2025)**: Complete resolution of profile access issues affecting both featured spots and admin user management
  - Diagnosed and resolved critical UUID validation errors preventing username-based profile access
  - Implemented smart identifier detection to handle both user IDs and usernames seamlessly in all user-related API routes
  - Removed authentication requirement from public profile routes while maintaining security for logged-in user interactions
  - Updated all user endpoints (/api/users/:identifier, /tracks, /playlists, /followers, /following) to support username lookup
  - Fixed profile visit notification system to work correctly with optional authentication
  - Resolved featured spot carousel artist profile linking - all featured spots now properly redirect to working artist profiles
  - Fixed admin dashboard user management "View Profile" buttons - all profile links now functional
  - Featured spots homepage carousel fully operational with real-time admin-managed content and working profile navigation
  - Admin user management system completely functional with profile access for all users
  - Test verified: featured spot "Damn good spot this!" successfully links to indie_melody artist profile with full content display

### January 29, 2025
- **Complete Admin Backend System Implementation (January 29, 2025)**: Comprehensive admin dashboard for site content management deployed
  - Database schema extensions with admin tables for featured artists, broadcasts, and user management
  - Featured spots management system with charging capabilities via Stripe integration for carousel placement
  - Site-wide broadcast system supporting both in-app notifications and SendGrid email delivery to targeted user groups
  - Admin routes with proper authentication and role-based access control protecting sensitive operations
  - Featured artist carousel management with pricing, scheduling, and payment processing for homepage promotion spots
  - User broadcast system with audience targeting (all users, artists, fans, subscribers, specific users) and dual delivery methods
  - Admin dashboard with comprehensive statistics, user management, and quick action panels
  - Test admin account configured (test@mixxl.fm upgraded to admin role) for full system testing and management
- **Sign Up Wizard Restoration Complete**: Successfully restored the original multi-step Sign Up Wizard with role selection and comprehensive onboarding
- **Fixed Genre Selection Bug**: Resolved critical form state synchronization issue preventing genre selection in Music Preferences step
- **Improved Welcome Step**: Removed forced choice between "Community" and "Discover" options, making first step purely informational
- **Enhanced User Experience**: Users can now complete full 6-step onboarding flow without forced selections they don't need to make
- **Branding Integration**: Successfully integrated custom Mixxl logo and favicon with gradient design across platform
- **Logo Component**: Created reusable Logo component with multiple size variants and fallback support
- **Password Reset Utility**: Added functional password reset page for recovering user access
- **90-Day Free Trial Subscription System**: Implemented comprehensive subscription system with Stripe integration
  - Dashboard displays "Start Free Trial" call-to-action for £10/month after 90 days
  - Upload page blocks non-subscribers with detailed subscription requirement screen
  - Subscription page with full trial period signup flow
  - Server endpoints handle subscription creation with 90-day trial period
  - System ready for production with live Stripe keys
- **Live Streaming Feature Implementation**: Complete "Go Live" functionality for artists with online busking capabilities
  - Database schema for live streams, viewers, and chat messages
  - WebRTC video streaming with camera/microphone controls
  - Real-time chat system with WebSocket integration
  - Live tipping system with Stripe integration for fan support during streams
  - "Go Live" button added to artist dashboard with gradient styling
  - Fixed currency display (£ instead of $) and interactive functionality
- **Complete Messaging System Implementation**: Full conversation-based messaging architecture deployed and debugged
  - Database tables and API endpoints for conversations and messages with PostgreSQL integration
  - Modern messaging interface with real-time WebSocket support for instant communication
  - "Message [Username]" buttons integrated throughout platform (profiles, user cards, discover pages)
  - Real-time user search functionality in conversation creation dialog working with proper endpoint `/api/search/users`
  - Functional conversation navigation from URL parameters for deep linking
  - Storage layer messaging methods updated to use conversation-based architecture instead of direct messaging
  - Fixed search endpoint routing conflicts that were causing 500 server errors
  - Test users created for full functionality testing (musiclover, indieartist, beatmaker) with proper UUID format
- **Complete Notifications System Implementation**: Comprehensive notification tracking system for all user interactions
  - Database schema for notifications table with comprehensive types (follow, message, tip, live_stream, profile_visit, track_like, etc.)
  - Backend API endpoints for notifications CRUD operations with proper authentication
  - Real-time notification bell in navbar with unread count badge that updates automatically
  - Dedicated notifications page with interactive notification list and mark-as-read functionality
  - Automatic notification creation for user interactions (follows, messages, tips, profile visits)
  - Notification system integrated throughout platform to track all social interactions
- **Upload File Size Limit Increase**: Increased maximum upload file size from 50MB to 100MB to accommodate larger WAV files
  - Backend multer configuration updated to support files up to 100MB
  - Frontend upload interface updated to display new 100MB limit to users
  - System now supports high-quality WAV files up to 80MB as requested
- **Pricing Comparison Page Recreation**: Complete recreation of original pricing comparison page with enhanced features
  - Beautiful comparison showing Mixxl vs SoundCloud, Spotify, Bandcamp with earnings breakdown
  - Platform feature comparison cards highlighting commission rates and benefits
  - Mixxl highlighted as "Best Value" with 97% earnings retention and 90-day free trial
  - "Start Free Trial" button linking to subscription page
  - Comprehensive Stripe Setup Guide page with step-by-step instructions matching original design
  - Internal navigation flow from pricing comparison to stripe setup to profile settings
- **Homepage Hero Carousel Implementation**: Featured artist promotion system with admin content management capability
  - Full-screen hero carousel replacing static "make a dent in the music industry" section
  - Support for image and video backgrounds with custom gradient overlays
  - Auto-advancing slideshow with manual navigation controls (arrows and indicators)
  - Featured artist showcase with names, descriptions, and profile links
  - TypeScript interfaces and API endpoint structure ready for admin backend integration
  - Sample featured artists data structure for testing and development
  - "Why Choose Mixxl" sections positioned strategically for both artists and fans
- **Homepage Content Updates**: Section title changed to "Make a dent in the music scene: An Independent" for features section
  - Admin backend content management system planned for featured artists carousel control
- **Fan Profile and Mixxlist System Complete**: Full implementation of fan profile dashboard with playlist functionality
  - Created comprehensive fan profile page with Mixxlists (fan playlists) for organizing purchased tracks
  - Built track purchasing modal system with Stripe integration allowing fans to buy tracks and add to Mixxlists
  - Fixed database schema issues by adding missing 'type' column to playlists table
  - Connected "Create Playlist" buttons throughout dashboard to direct fans to their profile for Mixxlist creation
  - Resolved authentication issues and created test fan account (testfan@example.com) for testing functionality
  - Database APIs now properly distinguish between artist playlists and fan Mixxlists using type column
  - **Mixxlist Modal Issues Resolved**: Fixed duplicate modal boxes and invisible text input problems
    - Removed duplicate Dialog components causing double modal display
    - Updated input styling with proper contrast (gray-800 background with white text)
    - Cleaned up unused code and resolved all TypeScript errors
    - Modal now works smoothly with single display and visible text inputs
  - **Follow and Notification System Verified**: Complete testing of social features confirms proper functionality
    - Created sample artist accounts (indie_melody, beatmaker) for follow testing
    - Follow functionality works correctly with proper API responses
    - Notification system creates and displays follow notifications properly
    - Unread notification count updates correctly in real-time
    - Notification bell shows badge when unread notifications exist
- **Comprehensive Emoji Selection System Implementation**: Full emoji picker functionality deployed across messaging platforms
    - Created feature-rich emoji picker component with 6 categorized emoji collections (Smileys & People, Animals & Nature, Food & Drink, Activities, Objects, Music)
    - Integrated emoji picker into direct messaging system with seamless text insertion
    - Added emoji picker to live radio chat system for enhanced community interaction
    - Popover-based interface with intuitive category navigation and emoji grid display
    - Works alongside existing keyboard shortcuts (Enter to send) and maintains message flow continuity
    - Enhanced user expression capabilities across all communication features of the platform
- **Fan Dashboard Optimization**: Improved dashboard relevance by replacing artist-specific features with fan-focused content
    - Removed "Collaboration Requests" section from fan dashboard (only relevant for artists)
    - Replaced with "Following Artists" section showing artists the user follows
    - Displays up to 3 followed artists with names, genres, and profile links
    - Includes "Discover Artists" call-to-action when no artists are followed
    - Added "View all" functionality when following more than 3 artists
    - Created `/api/users/:id/following` backend endpoint for fetching followed artists
    - Enhanced fan user experience with more relevant and actionable dashboard content
- **Rising Artists Follower Count Fix**: Resolved display issue showing incorrect follower counts in Discover page
    - Modified `getFeaturedArtists()` storage method to include accurate follower count calculations
    - Added LEFT JOIN with follows table to count actual followers for each featured artist
    - Updated backend API to properly return follower data with artist information
    - Fixed frontend caching issues that were preventing updated follower counts from displaying
    - Rising Artists section now correctly shows real follower counts (e.g., "2 followers") instead of "0 followers"
- **Upload Page Subscription Enhancement (January 29, 2025)**: Final polish of upload functionality and subscription screens
    - Made homepage "Upload First Track" button conditional - only displays for artist accounts, not fans
    - Completely redesigned upload page subscription requirement screen with proper Mixxl gradient branding
    - Added daily cost breakdown showing "Just 33p per day" (£10/month ÷ 30 days) as requested
    - Enhanced benefits list highlighting industry-leading 97% earnings retention and 100MB file upload support
    - Improved two-column layout showcasing comprehensive artist features and transparent pricing
    - Updated subscribe page with matching daily cost breakdown and consistent Mixxl brand styling
    - Enhanced call-to-action buttons with "Compare Plans" linking to pricing comparison page
- **Complete Admin Backend System with Working Broadcast Creation (January 30, 2025)**: Full functionality restored for comprehensive site management
    - Fixed critical authentication middleware issues preventing admin API calls by implementing proper JWT authentication for admin routes
    - Resolved database schema inconsistencies by adding missing columns (type, specific_user_ids, scheduled_for, etc.) to admin_broadcasts table
    - Created comprehensive admin_broadcasts table with proper UUID constraints for site-wide notifications and email campaigns
    - Restored admin dashboard statistics display with proper data from users, featured_spots, and admin_broadcasts tables
    - Fixed storage layer methods to properly reference adminBroadcasts table with all required CRUD operations
    - Fixed database field references (priceUsd to priceUSD) preventing featured spots API from working
    - Updated routing so /admin shows AdminDashboard with Featured Artist Spots section and working broadcast creation
    - Applied Mixxl gradient branding to admin dashboard with dark theme, purple/pink gradients, and proper styling
    - Successfully implemented broadcast creation functionality - "Create Broadcast" modal now works with all form fields
    - Admin dashboard now loads properly with statistics cards, Quick Actions section, and functional broadcast management
    - Test admin user (test@mixxl.fm) can now successfully create, view, and manage site-wide broadcasts and notifications
    - All admin API endpoints working: /api/admin/stats, /api/admin/featured-spots, /api/admin/broadcasts (GET/POST/PUT/DELETE)
    - Featured spots API returns actual data: 3 active spots including "Homepage Feature Spotlight", "Featured Artist Showcase", and "Holiday Music Special"
- **Purchase Modal Playlist Selection Enhancement (January 29, 2025)**: Complete playlist selection functionality in purchase modal
  - Added dropdown to purchase modal allowing fans to select which Mixxlist to add purchased tracks to
  - Implemented "Don't add to any playlist" option for flexible user experience
  - Fixed SelectItem error that was causing blank screen crashes by removing empty string values
  - Server-side integration automatically adds purchased tracks to selected playlists
  - Purchase flow now includes: track preview → purchase modal → playlist selection → automatic playlist addition
  - Error handling ensures purchase succeeds even if playlist addition fails
- **Complete Music Player System Implementation (January 29, 2025)**: Full-featured audio playbook system for playlists and tracks
  - Built comprehensive MusicPlayerProvider context with global state management for audio playback
  - Implemented GlobalAudioPlayer component with full controls (play/pause, previous/next, volume, seek bar)
  - Added playlist playback functionality with "Play All" button and individual track play capabilities
  - Fixed UI overlap issues between global audio player and page content with proper z-index and spacing
  - Individual track play buttons now correctly toggle play/pause for currently playing tracks
  - Global player displays at bottom with track info, progress bar, and volume controls
  - Smart playlist detection shows correct play/pause states across all interface elements
  - Audio player integrated across entire application through App.tsx provider structure
- **Dashboard Recent Tracks Functionality Fixed (January 29, 2025)**: Complete restoration of Recent Tracks section with working play buttons
  - Fixed non-functional play buttons in dashboard Recent Tracks section by integrating with music player system
  - Added proper play/pause state management with visual feedback showing correct button icons
  - Implemented server-side play count increment API calls with automatic cache invalidation
  - Added null safety for play count display preventing crashes when counts are undefined
  - Real-time play count updates now working - counts increment when tracks are played and refresh automatically
  - Recent Tracks section now fully functional with proper music playback integration
- **Complete Email Verification System Implementation (January 29, 2025)**: Full email authentication for secure user signup process
  - Database schema with email verification tokens table and user email verification fields
  - SendGrid email service integration with beautifully branded verification emails
  - Backend API endpoints for email verification, token management, and resending verification emails
  - Frontend verification page with comprehensive success/error handling and user guidance
  - Email verification banner in dashboard with resend functionality and dismissal options
  - Secure token generation with 24-hour expiration and automatic cleanup
  - System prevents fake accounts by requiring email verification before full platform access
  - Professional email templates with Mixxl gradient branding and clear call-to-action buttons