# Backend Integration - Quick Start

Get your Habit Tracker running with Supabase and serverless APIs in 15 minutes.

## Prerequisites

- Node.js 18+ installed
- GitHub account (already have it!)
- Supabase account: https://supabase.com (free tier)

## Step 1: Create Supabase Project (5 minutes)

1. Go to https://supabase.com and sign up
2. Click "New Project"
3. Fill in details:
   - **Name**: `habit-tracker`
   - **Database Password**: Create a strong password
   - **Region**: Pick closest to you
4. Wait for project creation (1-2 minutes)
5. Go to **SQL Editor** and paste all SQL from [SUPABASE_SETUP.md](./SUPABASE_SETUP.md#step-1-create-supabase-tables)
6. Execute the SQL

## Step 2: Get Your Credentials (2 minutes)

1. Go to **Project Settings** → **API**
2. Copy:
   - `Project URL` → This is your `VITE_SUPABASE_URL`
   - `anon public` key → This is your `VITE_SUPABASE_ANON_KEY`

## Step 3: Set Up Local Environment (3 minutes)

```bash
cd C:\Users\ENRJREN\habit-tracker

# Install Supabase dependency
npm install @supabase/supabase-js

# Create environment file
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
notepad .env.local
```

Paste this with YOUR credentials:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 4: Test It Works (3 minutes)

```bash
# Start dev server
npm run dev

# Open http://localhost:5173 in browser
# The app should work with Supabase data!
```

## Step 5: Deploy to Vercel (2 minutes)

```bash
# Commit your changes
git add .
git commit -m "feat: Add Supabase backend integration"
git push

# Go to your Vercel dashboard
# Settings → Environment Variables
# Add:
#   VITE_SUPABASE_URL = https://your-project-id.supabase.co
#   VITE_SUPABASE_ANON_KEY = your-anon-key-here

# Vercel automatically redeploys from GitHub!
```

Done! Your app now persists data to Supabase! 🎉

## What's Included

✅ **3 API Endpoints**
- `/api/habits` - CRUD operations
- `/api/achievements` - Read achievements
- `/api/daily-data` - Track daily check-ins

✅ **Supabase Integration**
- Database client in `src/lib/supabase.ts`
- Helper functions for all operations
- Real-time subscription support

✅ **Environment Variables**
- Local dev: `.env.local`
- Production: Vercel dashboard

## Your Supabase Dashboard

Access your database at:
`https://app.supabase.com/project/your-project-id`

Features available:
- **SQL Editor**: Run custom queries
- **Table Editor**: Browse and edit data visually
- **Authentication**: User management (optional)
- **Backups**: Automatic daily backups
- **Monitoring**: Query performance

## Common Tasks

### Query Your Data

In Supabase Dashboard → SQL Editor:
```sql
SELECT * FROM habits;
SELECT * FROM daily_habits WHERE check_in_date = CURRENT_DATE;
SELECT * FROM user_achievements WHERE unlocked_at IS NOT NULL;
```

### Add a New User's Data

```sql
INSERT INTO users (email) VALUES ('user@example.com');
INSERT INTO habits (user_id, name, emoji, reminder, streak)
VALUES ('user-id-here', 'New Habit', '💪', '09:00', 0);
```

### Monitor API Calls

In your Vercel dashboard:
- Go to **Functions** → See logs
- Click on `api/habits`, `api/achievements`, etc.
- View request/response logs

### Backup Your Data

Supabase automatically backs up daily. To manually backup:
1. Settings → Backups
2. Click the three dots on any backup
3. Download as SQL or CSV

## Troubleshooting

### "Supabase credentials not found"
- Check `.env.local` exists
- Variable names must be exact: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server: `npm run dev`

### 403 Forbidden Error
- Check RLS (Row Level Security) policies
- In Supabase: Table → RLS → verify policies
- Or temporarily disable RLS for testing (not recommended for production)

### Data not saving
- Open browser DevTools → Network tab
- Look for failed requests
- Check Supabase logs: Project → Logs → Functions

### CORS Errors
- In Supabase: Settings → API → CORS
- Add your Vercel domain: `https://habit-tracker-xxx.vercel.app`

## Next Steps

1. **Add Authentication**:
   - Use `supabase.auth.signUp()` in your app
   - Only show user's own data

2. **Real-time Updates**:
   - Use `subscribeToHabitChanges()` from `lib/supabase`
   - Updates sync across devices instantly

3. **Custom Functions**:
   - Add PostgreSQL functions for complex queries
   - Example: Calculate streaks automatically

4. **Monitoring & Analytics**:
   - Set up Vercel Speed Insights
   - Track API performance
   - Monitor database usage

## Resources

- 📚 [Supabase Docs](https://supabase.com/docs)
- 🚀 [Vercel Functions](https://vercel.com/docs/functions/serverless-functions)
- 📖 [Full Backend Guide](./BACKEND_INTEGRATION.md)
- 🛠️ [Supabase Setup](./SUPABASE_SETUP.md)

## Support

If something doesn't work:

1. Check the error in browser console (DevTools)
2. Look at Vercel logs: Dashboard → Function logs
3. Check Supabase logs: Project → Logs
4. Read the full guides: [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) or [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)

Good luck! 🚀
