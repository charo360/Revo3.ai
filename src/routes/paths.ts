/**
 * App Route Paths Configuration
 * Central location for all application routes
 */

export const AppRoutePaths = {
  // Public Routes
  home: "/",
  about: "/about",
  features: "/features",
  pricing: "/pricing",
  business: "/business",
  login: "/login",
  signup: "/signup",
  
  // Platform Routes
  platforms: {
    youtube: "/platforms/youtube",
    podcast: "/platforms/podcast",
    tiktok: "/platforms/tiktok",
    twitter: "/platforms/twitter",
    repurpose: "/platforms/repurpose",
  },
  
  // Dashboard Routes (Protected)
  dashboard: {
    root: "/dashboard",
    home: "/dashboard/home",
    improveThumbnail: "/dashboard/improve-thumbnail",
    youtubeThumbnail: "/dashboard/youtube-thumbnail",
    podcastCover: "/dashboard/podcast-cover",
    contentRepurpose: "/dashboard/content-repurpose",
    twitterCard: "/dashboard/twitter-card",
    tiktokThumbnail: "/dashboard/tiktok-thumbnail",
  },
  
  // User Routes (Protected)
  profile: "/profile",
  settings: "/settings",
  creditManagement: "/dashboard/credits",
};

/**
 * Dashboard view to platform mapping
 */
export const DashboardViewToPlatform = {
  'home': 'youtube_improve',
  'improve-thumbnail': 'youtube_improve',
  'youtube-thumbnail': 'youtube_improve',
  'podcast-cover': 'podcast',
  'content-repurpose': 'repurpose',
  'twitter-card': 'twitter',
  'tiktok-thumbnail': 'tiktok',
} as const;

/**
 * Platform to route mapping
 */
export const PlatformToRoute = {
  'youtube_improve': '/dashboard/improve-thumbnail',
  'podcast': '/dashboard/podcast-cover',
  'repurpose': '/dashboard/content-repurpose',
  'twitter': '/dashboard/twitter-card',
  'tiktok': '/dashboard/tiktok-thumbnail',
} as const;
