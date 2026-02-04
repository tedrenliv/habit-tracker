# Habit Tracker

A beautiful, responsive habit tracking application with analytics and achievement system. Built with React, TypeScript, Tailwind CSS, and Vite.

## Features

- **Today's Tracking**: Daily habit check-in with progress visualization
- **Analytics Dashboard**: Detailed statistics including:
  - Longest streak tracking
  - Average completion rate
  - Active habits count
  - Habit completion rankings
  - Heatmap of check-ins (last 90 days)
  - Completion trends chart
- **Achievement System**: Unlock achievements as you build consistency
- **Responsive Design**: Works seamlessly on mobile and desktop
- **Real-time Updates**: Instant feedback on habit completion

## Project Structure

```
habit-tracker/
├── src/
│   ├── main.tsx              # React entry point
│   ├── App.tsx               # Main application component
│   └── index.css             # Global styles with Tailwind
├── index.html                # HTML template
├── package.json              # Dependencies and scripts
├── vite.config.ts            # Vite configuration
├── tsconfig.json             # TypeScript configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── postcss.config.js         # PostCSS configuration
└── standalone.html           # Single-file version for quick demos
```

## Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

## Development

Start the development server with hot reload:

```bash
npm run dev
```

The app will open automatically at `http://localhost:5173`

## Build

Create a production-optimized build:

```bash
npm run build
```

The optimized files will be in the `dist/` directory.

## Preview Build

Preview the production build locally:

```bash
npm run preview
```

## Standalone Version

For quick demos or sharing without Node.js:

1. Open `standalone.html` directly in your browser
2. No build step or installation required
3. All functionality works identically to the React version

## Technologies Used

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **Vite** - Build tool with hot reload
- **PostCSS** - CSS processing

## Backend Integration

### Quick Start

Ready to add persistent data storage? Follow the 15-minute setup:

**[👉 Backend Quick Start Guide](./BACKEND_QUICK_START.md)**

### Deployment Status

- ✅ **Frontend**: Live on Vercel with Custom Domain
  - **Primary Domain**: https://aithinking.uk (Active ✨)
  - **Vercel URL**: https://habit-tracker-iota-sepia.vercel.app (backup)
  - **DNS**: A record configured (216.198.79.1)
  - **Auto-deploys**: Push to GitHub → Automatic deployment

- ✅ **Serverless API**: Ready (with example functions in `api/`)
  - GET/POST/PUT/DELETE habits
  - GET achievements
  - GET/POST daily check-ins

- ⭐ **Supabase Database**: Recommended for data persistence
  - PostgreSQL-based
  - Real-time subscriptions
  - Row-level security
  - Free tier available

### Custom Domain Configuration

The application is accessible via custom domain **https://aithinking.uk** with the following DNS setup:

**DNS Records (Squarespace):**
- Type: A
- Host: @ (root domain)
- Value: 216.198.79.1
- TTL: 3600

**To set up a custom domain for your own deployment:**
1. Add your domain to Vercel project settings
2. Update your DNS provider with the A record provided by Vercel
3. Wait 5-30 minutes for DNS propagation
4. Verify domain is active in Vercel dashboard

### Guides

| Guide | Purpose |
|-------|---------|
| [Backend Quick Start](./BACKEND_QUICK_START.md) | 15-minute setup with Supabase |
| [Backend Integration](./BACKEND_INTEGRATION.md) | Complete API & database guide |
| [Supabase Setup](./SUPABASE_SETUP.md) | Detailed Supabase configuration |

### Architecture

```
Frontend (React)
    ↓
Vercel Serverless APIs (/api/*)
    ↓
Supabase PostgreSQL
```

### Default Behavior

- Without Supabase: Uses mock data (resets on page refresh)
- With Supabase: Data persists and syncs across devices

### Mock Data

The application includes pre-configured mock data as fallback:

- 4 sample habits (Morning Run, Meditation, Reading, Fitness)
- 6 achievements with unlock progress
- 90 days of history for analytics

## Version History

### v0.2.0 - Backend Integration & Custom Domain (February 2026)
- ✅ **Deployed to Vercel** with custom domain https://aithinking.uk (Active ✨)
- ✅ **DNS Configuration**: A record (216.198.79.1) set up on Squarespace
- ✅ **Default Vercel URL** also available at https://habit-tracker-iota-sepia.vercel.app
- ✅ **Supabase Integration**: Connected to PostgreSQL database with real-time support
- ✅ **Serverless API Endpoints**:
  - `/api/habits` - Full CRUD operations for habits
  - `/api/achievements` - Fetch user achievements
  - `/api/daily-data` - Track and retrieve daily check-ins
- ✅ **Database Tables**: 5 PostgreSQL tables with Row-Level Security (RLS) policies
  - `users` - User profiles
  - `habits` - Habit definitions
  - `daily_habits` - Daily check-in history
  - `achievements` - Achievement definitions (6 pre-loaded)
  - `user_achievements` - Achievement unlock tracking
- ✅ **Frontend Library**: Supabase client with 7 helper functions in `src/lib/supabase.ts`
- ✅ **Environment Variables**: `.env.local` for development, Vercel dashboard for production
- ✅ **Data Persistence**: All user data now persists across devices and page refreshes
- 📚 Added comprehensive guides:
  - `BACKEND_QUICK_START.md` - 15-minute setup guide
  - `BACKEND_INTEGRATION.md` - Complete technical architecture
  - `SUPABASE_SETUP.md` - Database configuration guide
- 🔄 Fallback to mock data when Supabase credentials unavailable

### v0.1.0 - Initial Release (January 2026)
- ✅ **React Frontend**: Built with TypeScript, React 18, Tailwind CSS
- ✅ **Three Core Pages**:
  - Today's Tracking - Daily habit check-ins with progress visualization
  - Analytics Dashboard - Stats, heatmap, trends, rankings
  - Achievements - 6 unlockable achievements for consistency milestones
- ✅ **Responsive Design**: Mobile-first approach, tested on all screen sizes
- ✅ **Mock Data System**: 4 sample habits with 90-day history
- ✅ **Standalone Version**: `standalone.html` for quick demos without build
- ✅ **Build Optimization**: Production build ~168KB, fast load times
- ✅ **TypeScript**: Full type safety for components and data

## Roadmap - Upcoming Features

### Phase 3: Enhanced User Experience
- 🔐 **User Authentication** - Supabase Auth with sign up/login
- 📱 **Real-time Sync** - Cross-device synchronization
- 🎯 **Performance Optimization** - Query optimization, caching
- 📊 **Analytics Tracking** - User behavior and usage insights

## Browser Support

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## License

Open source - free to use and modify.
