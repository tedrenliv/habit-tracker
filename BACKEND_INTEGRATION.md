# Backend Integration Guide

This guide explains how to integrate your Habit Tracker with backend APIs and databases.

## Architecture Overview

```
┌─────────────────┐
│   Frontend      │ (React + TypeScript)
│  (Vite Build)   │
└────────┬────────┘
         │
    ┌────▼─────────────────┐
    │  Vercel Serverless   │
    │   Functions (API)    │
    │  /api/habits         │
    │  /api/achievements   │
    │  /api/daily-data     │
    └────┬────────────────┘
         │
    ┌────▼──────────────┐
    │  Supabase         │
    │  (Database)       │
    │  ┌──────────────┐ │
    │  │ users        │ │
    │  │ habits       │ │
    │  │ daily_habits │ │
    │  │ achievements │ │
    │  └──────────────┘ │
    └───────────────────┘
```

## Project Structure

```
habit-tracker/
├── api/                          # Vercel serverless functions
│   ├── habits.ts                 # GET/POST/PUT/DELETE habits
│   ├── achievements.ts           # GET achievements
│   └── daily-data.ts             # GET/POST daily check-ins
├── src/
│   ├── lib/
│   │   └── supabase.ts          # Supabase client & helper functions
│   └── App.tsx                   # Main app component
├── .env.example                  # Template for environment variables
├── SUPABASE_SETUP.md            # Supabase configuration guide
└── BACKEND_INTEGRATION.md       # This file
```

## Environment Variables

### For Local Development

Create `.env.local` in project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# API Configuration
VITE_API_URL=http://localhost:3000/api

# Optional: Database connection for serverless functions
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres
JWT_SECRET=your-secret-key
```

### For Vercel Production

1. Navigate to your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add the following variables:

| Variable | Value | Scope |
|----------|-------|-------|
| `VITE_SUPABASE_URL` | `https://your-project.supabase.co` | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `VITE_API_URL` | `https://habit-tracker-xxx.vercel.app/api` | Production |
| `DATABASE_URL` | Your database connection string | Production |

## Setup Instructions

### 1. Install Dependencies

```bash
cd C:\Users\ENRJREN\habit-tracker
npm install
```

This will install:
- `@supabase/supabase-js` - Supabase client for frontend
- `@vercel/node` - Types for serverless functions

### 2. Create `.env.local`

Copy the template and fill in your credentials:

```bash
cp .env.example .env.local
```

### 3. Set Up Supabase

Follow the instructions in [SUPABASE_SETUP.md](./SUPABASE_SETUP.md):

1. Create a Supabase account
2. Create the tables using the provided SQL
3. Get your project credentials
4. Add them to `.env.local`

### 4. Test Locally

```bash
# Start dev server
npm run dev

# In another terminal, you can test the API endpoints
curl http://localhost:3000/api/habits?userId=test-user
```

### 5. Deploy to Vercel

```bash
# Commit your changes
git add .
git commit -m "feat: Add backend API and Supabase integration"

# Push to GitHub
git push

# Vercel will automatically build and deploy!
```

## API Endpoints

All endpoints are available at your Vercel deployment URL:
`https://habit-tracker-xxx.vercel.app/api/`

### Habits Endpoint

**GET** `/api/habits`
- Query: `userId` (required)
- Response: List of habits for the user

```bash
curl "https://habit-tracker-xxx.vercel.app/api/habits?userId=user123"
```

**POST** `/api/habits`
- Body: `{ userId, name, emoji, reminder }`
- Response: Created habit object

```bash
curl -X POST https://habit-tracker-xxx.vercel.app/api/habits \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "name": "Yoga",
    "emoji": "🧘",
    "reminder": "07:00"
  }'
```

**PUT** `/api/habits`
- Body: `{ habitId, ...updates }`
- Response: Updated habit object

**DELETE** `/api/habits`
- Body: `{ habitId }`
- Response: Success message

### Achievements Endpoint

**GET** `/api/achievements`
- Query: `userId` (required)
- Response: List of achievements with unlock status

```bash
curl "https://habit-tracker-xxx.vercel.app/api/achievements?userId=user123"
```

### Daily Data Endpoint

**GET** `/api/daily-data`
- Query: `userId` (required), `startDate`, `endDate`
- Response: Daily check-in data

```bash
curl "https://habit-tracker-xxx.vercel.app/api/daily-data?userId=user123&startDate=2026-01-01&endDate=2026-02-04"
```

**POST** `/api/daily-data`
- Body: `{ userId, habitId, date, completed }`
- Response: Saved check-in

```bash
curl -X POST https://habit-tracker-xxx.vercel.app/api/daily-data \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "habitId": "habit1",
    "date": "2026-02-04",
    "completed": true
  }'
```

## Using the Frontend with APIs

### Option 1: Direct Supabase (Recommended)

Use the Supabase client functions directly in your React components:

```typescript
import { fetchHabits, createHabit } from './lib/supabase'

async function loadHabits() {
  const { data, error } = await fetchHabits('user123')
  if (error) console.error(error)
  else setHabits(data)
}

async function addNewHabit() {
  const { data, error } = await createHabit(
    'user123',
    'Yoga',
    '🧘',
    '07:00'
  )
  if (error) console.error(error)
  else addHabitToState(data)
}
```

### Option 2: Via Vercel API Endpoints

Or call your Vercel serverless functions:

```typescript
const apiUrl = import.meta.env.VITE_API_URL

async function loadHabits(userId: string) {
  const response = await fetch(`${apiUrl}/habits?userId=${userId}`)
  const { data } = await response.json()
  setHabits(data)
}

async function addNewHabit(userId: string, name: string, emoji: string) {
  const response = await fetch(`${apiUrl}/habits`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, name, emoji, reminder: '09:00' })
  })
  const { data } = await response.json()
  addHabitToState(data)
}
```

## Database Options

### 1. Supabase (Recommended) ✅
- **Pros**:
  - Built on PostgreSQL (powerful and reliable)
  - Real-time subscriptions
  - Easy row-level security (RLS)
  - Free tier: 500MB database
  - Excellent documentation
- **Best for**: This project - great balance of features and ease of use

### 2. Vercel Postgres
- **Pros**:
  - Native Vercel integration
  - Serverless PostgreSQL
  - Auto-scaling
- **Cons**:
  - Paid only ($7/month minimum)
- **Best for**: High-traffic production apps

### 3. MongoDB Atlas
- **Pros**:
  - NoSQL (flexible schema)
  - Generous free tier (512MB)
  - Fast for document storage
- **Cons**:
  - Requires different API patterns
- **Best for**: If you prefer NoSQL

### 4. PlanetScale (MySQL)
- **Pros**:
  - MySQL compatibility
  - Generous free tier
  - Serverless MySQL
- **Cons**:
  - Limited query types
- **Best for**: MySQL preference

## Deployment Checklist

Before pushing to production:

- [ ] Created Supabase project and tables
- [ ] Set environment variables in Vercel dashboard
- [ ] Tested API endpoints locally
- [ ] Verified database queries work
- [ ] Enabled RLS policies in Supabase
- [ ] Tested on mobile/different browsers
- [ ] Set up error monitoring (optional)
- [ ] Configured CORS if needed

## Troubleshooting

### API returns 404
- Verify serverless functions are in `api/` directory
- Check function names match the URL path
- Rebuild and redeploy to Vercel

### "CORS error" in browser console
- Add your domain to Supabase CORS: Settings → API → CORS
- In API functions, ensure `Access-Control-Allow-Origin` is set
- Try with `credentials: 'include'` in fetch

### Data not persisting
- Check RLS policies are correct
- Verify user authentication is working
- Check browser console for actual error messages
- Verify database tables exist and have correct schema

### Env variables not working
- Double-check variable names match exactly
- Make sure they start with `VITE_` for frontend
- Restart dev server after adding `.env.local`
- Redeploy Vercel after adding env vars

## Next Steps

1. **Set up authentication**: Use Supabase Auth for user management
2. **Add error handling**: Better error messages and recovery
3. **Implement caching**: Reduce database queries
4. **Add logging**: Monitor API usage and errors
5. **Performance optimization**: Query optimization and indexing
6. **Unit tests**: Test API endpoints and database functions

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
