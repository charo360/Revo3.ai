# Revo3.ai

**AI-Powered Content Creation Platform for Creators**

Revo3.ai is a comprehensive content creation platform that leverages AI to help creators generate stunning thumbnails, repurpose content, and optimize designs for multiple social media platforms. Built with React, TypeScript, and Supabase, it provides an intuitive interface for creating platform-optimized content at scale.

## 🚀 Features

### 🎨 AI Design Generation
- **Thumbnail Creation**: Generate stunning, clickable thumbnails from video content, descriptions, or creative ideas
- **Thumbnail Enhancement**: AI-powered improvement of existing thumbnails with better colors, clearer text, and optimized composition
- **Multiple Variations**: Generate 10+ thumbnail variations instantly to test different styles and layouts
- **Platform Optimization**: Automatically optimized for YouTube, TikTok, Instagram, Twitter, and Podcast platforms

### ✨ Magic Studio
- **Background Removal**: Automatically remove backgrounds from images
- **Image Upscaling**: Enhance image quality with AI-powered upscaling
- **Face Extraction**: Extract faces from images for use in designs
- **Smart Editing**: Add or remove elements, color correction, and object removal
- **AI-Powered Transformations**: Transform images with intelligent editing tools

### 📱 Platform Support
- **YouTube**: Thumbnail improvement and generation (1280x720)
- **Podcast**: Cover art generation (3000x3000)
- **TikTok**: Vertical content optimization (1080x1920)
- **Twitter**: Card generation (1200x675)
- **Instagram**: Posts and stories support
- **Custom Dimensions**: Support for custom aspect ratios

### 🎬 Content Repurposing
- **Video Repurposing**: Transform long-form videos into viral short clips
- **Multi-Platform Generation**: Create optimized content for TikTok, YouTube Shorts, and Instagram Reels simultaneously
- **AI-Powered Clip Detection**: Signal-based heuristics to identify viral moments
- **Caption Generation**: Automatic caption generation for video clips
- **Viral Moment Analysis**: AI analysis to find the most engaging segments

### 💳 Credit System
- **Flexible Pricing**: Pay-as-you-go credit system
- **Credit Management**: Track and manage your usage through the dashboard
- **Stripe Integration**: Secure payment processing

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **React Toastify** - Notifications

### Backend & Infrastructure
- **Supabase** - Backend as a Service (Database, Auth, Storage, Edge Functions)
- **Supabase Edge Functions** - Serverless functions for video processing and uploads
- **Stripe** - Payment processing

### AI & Media Processing
- **Google Gemini API** - AI image generation and analysis
- **FFmpeg** - Video processing (client-side)
- **Google GenAI SDK** - AI model integration

### Development Tools
- **TypeScript** - Type checking
- **PostCSS** - CSS processing
- **Terser** - Code minification

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Supabase Account** - For backend services
- **Google Cloud Account** - For Gemini API access
- **Stripe Account** - For payment processing (optional for development)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/charo360/Revo3.ai
cd Revo3.ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_CLOUD_API_KEY=your_google_cloud_api_key
GOOGLE_CLOUD_PROJECT_ID=your_project_id

# Stripe (Optional)
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Optional APIs
YOUTUBE_API_KEY=your_youtube_api_key
RUNWAY_API_KEY=your_runway_api_key
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
```

### 4. Supabase Setup

#### Database Migrations

Run the Supabase migrations to set up the database schema:

```bash
# Apply migrations
supabase db push

# Or manually run migrations from supabase/migrations/
```

#### Edge Functions

Deploy the Supabase Edge Functions:

```bash
# Deploy all functions
supabase functions deploy upload-video
supabase functions deploy repurpose-video
supabase functions deploy create-checkout-session
supabase functions deploy stripe-webhook
supabase functions deploy download-youtube
```

#### Storage Buckets

Create the required storage buckets in Supabase Dashboard:
- `repurpose-videos` - For uploaded video files
- Configure RLS policies as needed

### 5. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
Revo3.ai/
├── src/
│   ├── components/          # React components
│   │   ├── design/          # Design-related components
│   │   ├── landing/         # Landing page components
│   │   ├── layout/          # Layout components (Header, Canvas)
│   │   ├── modals/          # Modal components
│   │   ├── modules/         # Feature modules (Sidebar, etc.)
│   │   └── dashboard/       # Dashboard components
│   ├── constants/           # Constants and configurations
│   ├── contexts/            # React contexts (Auth)
│   ├── core/                # Core business logic
│   │   ├── algorithms/      # Content analysis algorithms
│   │   ├── infrastructure/  # Infrastructure services
│   │   ├── processors/      # Media processors
│   │   └── services/        # Core services
│   ├── features/            # Feature modules
│   │   ├── content-repurpose/  # Content repurposing feature
│   │   └── thumbnail-generation/ # Thumbnail generation
│   ├── pages/               # Page components
│   │   └── platforms/       # Platform-specific pages
│   ├── routes/              # Routing configuration
│   ├── services/            # Application services
│   │   ├── payments/        # Payment services
│   │   └── video/           # Video services
│   ├── shared/              # Shared utilities and components
│   ├── styles/              # Global styles
│   └── types/               # TypeScript type definitions
├── supabase/
│   ├── functions/           # Supabase Edge Functions
│   │   ├── upload-video/    # Video upload handler
│   │   ├── repurpose-video/ # Video repurposing handler
│   │   ├── create-checkout-session/ # Stripe checkout
│   │   ├── stripe-webhook/  # Stripe webhook handler
│   │   └── download-youtube/ # YouTube downloader
│   └── migrations/          # Database migrations
├── public/                  # Static assets
├── generate-viral-videos.mjs # Test script for content repurposing
└── package.json
```

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Code Structure

- **Components**: Reusable UI components organized by feature
- **Pages**: Route-level page components
- **Services**: Business logic and API integrations
- **Core**: Core algorithms and infrastructure
- **Features**: Feature-specific modules with their own components and services

### TypeScript

The project uses TypeScript for type safety. Type definitions are in `src/types/`.

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Deploy to Vercel/Netlify

1. Connect your repository to Vercel or Netlify
2. Set environment variables in the platform dashboard
3. Deploy

### Supabase Edge Functions

Edge Functions are deployed separately:

```bash
supabase functions deploy <function-name>
```

## 🔐 Authentication

The application uses Supabase Auth for user authentication. Users can:
- Sign up with email/password
- Sign in to access protected routes
- Manage their profile and credits

## 💳 Payment Integration

Stripe is integrated for payment processing:
- Credit-based system
- Secure checkout sessions
- Webhook handling for payment events
- Credit management dashboard

## 📝 Content Repurposing Feature

The content repurposing feature allows users to:
1. Upload long-form videos
2. AI analyzes the video for viral moments using signal-based heuristics
3. Generate short clips optimized for TikTok, YouTube Shorts, and Instagram Reels
4. Automatically add captions and metadata
5. Export clips with platform-specific optimizations

**Note**: Video downloading from storage is currently being improved to handle large files more reliably.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For support, please open an issue in the repository or contact the development team.

## 🔮 Roadmap

- [ ] Enhanced video processing with FFmpeg server-side
- [ ] Real-time collaboration features
- [ ] Advanced AI model fine-tuning
- [ ] Mobile app support
- [ ] API for third-party integrations
- [ ] Advanced analytics dashboard

---

Built with ❤️ by the Revo3.ai team
