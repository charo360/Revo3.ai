# Revo3.ai - AI-Powered Design Studio

An AI-powered design studio for creating viral content across multiple platforms. Generate YouTube thumbnails, podcast covers, TikTok covers, Twitter cards, and more with the power of AI.

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## Features

- 🎨 **AI Design Generation** - Create stunning designs with AI that understands platform requirements
- ✨ **Magic Studio** - Edit, enhance, and transform images with AI-powered tools
- 📱 **Multi-Platform Support** - YouTube, Podcast, TikTok, Twitter, and more
- 🎬 **Video Integration** - Extract frames and generate designs from video content
- 🖼️ **Full-Featured Editor** - Professional design editor with text, shapes, and more
- 🤖 **AI Assistant** - Get intelligent design recommendations and suggestions

## Tech Stack

- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe development
- **Vite 6** - Fast build tool and dev server
- **Google Gemini AI** - AI image and video generation (Gemini 2.5 Flash Image, Imagen 4.0, Veo)
- **Supabase** - Authentication and backend services

## Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **Google Gemini API key** - [Get one here](https://makersuite.google.com/app/apikey)
- **Supabase account** - [Sign up here](https://supabase.com)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Revo3.ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the template file:
   ```bash
   cp .env.template .env.local
   ```
   
   Open `.env.local` and fill in your actual values (see [Environment Variables](#environment-variables) section below).

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Environment Variables

### Setup Instructions

1. **Copy the template file:**
   ```bash
   cp .env.template .env.local
   ```

2. **Fill in your actual values in `.env.local`**

### Required Variables

#### Supabase Configuration

Get these from your [Supabase Dashboard](https://supabase.com/dashboard) → Settings → API

```env
# Your Supabase project URL
VITE_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_URL=https://your-project-id.supabase.co

# Your Supabase anonymous (public) key
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** 
- Variables prefixed with `VITE_` are exposed to client-side code
- Both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are **required** for authentication to work
- Never commit `.env.local` to version control

#### Google Gemini API

Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

```env
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Optional Variables

```env
# Supabase Service Role Key (server-side only, keep secret!)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase JWT Secret (keep secret!)
SUPABASE_JWT_SECRET=your_jwt_secret_here
```

### Variable Reference Table

| Variable | Required | Client-Side | Description | Where to Get It |
|----------|----------|-------------|-------------|-----------------|
| `VITE_SUPABASE_URL` | ✅ Yes | ✅ Yes | Supabase project URL | Supabase Dashboard → Settings → API |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | ✅ Yes | Supabase anonymous key | Supabase Dashboard → Settings → API |
| `SUPABASE_URL` | ❌ No | ❌ No | Same as VITE_SUPABASE_URL | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | ❌ No | ❌ No | Same as VITE_SUPABASE_ANON_KEY | Supabase Dashboard → Settings → API |
| `GEMINI_API_KEY` | ✅ Yes | ✅ Yes | Google Gemini API key | [Google AI Studio](https://makersuite.google.com/app/apikey) |
| `SUPABASE_SERVICE_ROLE_KEY` | ❌ No | ❌ No | Service role key (server-side) | Supabase Dashboard → Settings → API |
| `SUPABASE_JWT_SECRET` | ❌ No | ❌ No | JWT secret | Supabase Dashboard → Settings → API |

## Supabase Setup Guide

### Step 1: Create a Supabase Project

1. Visit [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in project details:
   - **Name**: Your project name
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to you
5. Wait for project creation (~2 minutes)

### Step 2: Get Your Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. You'll find:
   - **Project URL**: `https://xxxxx.supabase.co` → Use for `VITE_SUPABASE_URL`
   - **anon public** key: A long JWT token → Use for `VITE_SUPABASE_ANON_KEY`

### Step 3: Configure Authentication (Important!)

**Disable Email Confirmation (Recommended for Development):**

1. Go to **Authentication** → **Providers** → **Email**
2. Find **"Confirm email"** toggle
3. Toggle it **OFF**
4. Click **Save**

This allows users to sign up and sign in immediately without email verification.

**Note:** For production, you may want to enable email confirmation for better security.

### Step 4: Update .env.local

Copy the values from Step 2 into your `.env.local` file:

```env
VITE_SUPABASE_URL=https://your-actual-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your-actual-key-here
```

### Step 5: Restart Dev Server

After updating `.env.local`, restart your dev server:

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

## Google Gemini API Setup

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **"Get API Key"** or **"Create API Key"**
4. Copy the generated API key
5. Add it to `.env.local`:
   ```env
   GEMINI_API_KEY=AIzaSyYourActualKeyHere
   ```

## Project Structure

```
Revo3.ai/
├── src/
│   ├── components/          # React components
│   │   ├── landing/         # Landing page components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Pricing.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ...           # Other landing components
│   │   ├── layout/           # Layout components
│   │   │   ├── Header.tsx
│   │   │   └── Canvas.tsx
│   │   ├── modules/          # Feature modules
│   │   │   ├── Sidebar.tsx
│   │   │   └── ...           # Various modules
│   │   └── modals/           # Modal dialogs
│   ├── contexts/             # React contexts
│   │   └── AuthContext.tsx
│   ├── constants/            # Constants and configuration
│   │   ├── icons.tsx
│   │   ├── platforms.tsx
│   │   └── ...
│   ├── services/             # Business logic and AI services
│   │   └── ai/               # AI service functions
│   ├── types/                # TypeScript type definitions
│   ├── utils/                # Utility functions
│   ├── pages/                # Page components
│   │   ├── LandingPage.tsx
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── FeaturesPage.tsx
│   │   ├── PricingPage.tsx
│   │   ├── BusinessPage.tsx
│   │   └── platforms/        # Platform-specific pages
│   ├── lib/                  # Third-party library configs
│   │   └── supabase.ts
│   ├── styles/               # CSS files
│   ├── App.tsx               # Main app component
│   ├── AppRouter.tsx         # Router configuration
│   └── index.tsx             # Entry point
├── .env.template             # Environment variables template
├── .env.local                # Your local environment variables (gitignored)
├── index.html                # HTML entry point
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (http://localhost:3000) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## Troubleshooting

### "Cannot find module" errors

- **Solution**: Restart your TypeScript server
  - VS Code: `Cmd/Ctrl + Shift + P` → "TypeScript: Restart TS Server"
  - Or restart the dev server

### Supabase connection errors

- **Check**: Verify your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`
- **Ensure**: Variables start with `VITE_` prefix
- **Action**: Restart the dev server after changing `.env.local`
- **Verify**: Check browser console for Supabase initialization messages

### "Email not confirmed" errors

- **Solution**: Disable email confirmation in Supabase Dashboard
  1. Go to **Authentication** → **Providers** → **Email**
  2. Toggle OFF **"Confirm email"**
  3. Save changes
  4. Try signing up again

### Port already in use

- **Solution**: Change the port in `vite.config.ts`:
  ```typescript
  server: {
    port: 3001, // Change to available port
  }
  ```

### Environment variables not loading

- **Check**: File is named exactly `.env.local` (not `.env.local.txt`)
- **Check**: Variables start with `VITE_` for client-side access
- **Action**: Restart dev server after adding/changing variables
- **Verify**: Check browser console for environment variable warnings

## Development Tips

1. **Hot Reload**: The dev server supports hot module replacement - changes reflect instantly
2. **Type Safety**: TypeScript errors will show in terminal and IDE
3. **Environment Variables**: Always restart dev server after changing `.env.local`
4. **Debugging**: Check browser console for helpful error messages and logs

## Deployment

### Build for Production

```bash
npm run build
```

The `dist/` folder will contain the production build.

### Environment Variables in Production

For production deployment:
- Set environment variables in your hosting platform (Vercel, Netlify, etc.)
- Variables with `VITE_` prefix are bundled at build time
- Never commit `.env.local` or expose service role keys

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Open an issue on GitHub
- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Google Gemini Docs**: [https://ai.google.dev/docs](https://ai.google.dev/docs)

## License

Copyright © 2024 Revo3.ai. All rights reserved.

---

**View your app in AI Studio:** https://ai.studio/apps/drive/1imYc9TM6UyueJFDtUY0G1EPKbK889qwn
