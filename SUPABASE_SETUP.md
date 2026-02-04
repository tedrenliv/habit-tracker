# Supabase Integration Guide

This guide explains how to set up your Habit Tracker with Supabase for data persistence.

## Prerequisites
- A Supabase account: https://supabase.com
- Your project created on Supabase

## Step 1: Create Supabase Tables

In your Supabase project, go to **SQL Editor** and run these commands:

### 1. Create Users Table
```sql
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see only their own data
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid() = id);
```

### 2. Create Habits Table
```sql
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  emoji VARCHAR(10),
  reminder TIME,
  streak INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX habits_user_id_idx ON habits(user_id);

-- Enable RLS
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can read their own habits" ON habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own habits" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits" ON habits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits" ON habits
  FOR DELETE USING (auth.uid() = user_id);
```

### 3. Create Daily Habits Table (Check-ins)
```sql
CREATE TABLE IF NOT EXISTS daily_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  habit_id UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  check_in_date DATE NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, habit_id, check_in_date)
);

-- Create index for faster queries
CREATE INDEX daily_habits_user_id_idx ON daily_habits(user_id);
CREATE INDEX daily_habits_habit_id_idx ON daily_habits(habit_id);
CREATE INDEX daily_habits_date_idx ON daily_habits(check_in_date);

-- Enable RLS
ALTER TABLE daily_habits ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own daily data" ON daily_habits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily data" ON daily_habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily data" ON daily_habits
  FOR UPDATE USING (auth.uid() = user_id);
```

### 4. Create Achievements Table
```sql
CREATE TABLE IF NOT EXISTS achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  emoji VARCHAR(10),
  description TEXT,
  requirement INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default achievements
INSERT INTO achievements (name, emoji, description, requirement) VALUES
  ('Beginner', '🌱', 'Check in for 7 days', 7),
  ('Persister', '🔥', 'Check in for 30 days', 30),
  ('Warrior', '⚔️', 'Check in for 100 days', 100),
  ('Perfect Week', '✨', 'Complete all habits for 7 consecutive days', 7),
  ('Trio Master', '🎯', 'Maintain 3 habits simultaneously', 3),
  ('1000 Days Practice', '👑', 'Check in for 1000 days', 1000);
```

### 5. Create User Achievements Table
```sql
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id),
  unlocked_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);

-- Create index for faster queries
CREATE INDEX user_achievements_user_id_idx ON user_achievements(user_id);

-- Enable RLS
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Step 2: Get Your Supabase Credentials

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`

## Step 3: Set Environment Variables

### For Local Development

Create a `.env.local` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_API_URL=http://localhost:3000/api
```

### For Vercel Production

1. Go to your Vercel project dashboard
2. **Settings** → **Environment Variables**
3. Add each variable:
   - Name: `VITE_SUPABASE_URL`
   - Value: `https://your-project.supabase.co`
   - Environments: Production, Preview, Development

4. Repeat for `VITE_SUPABASE_ANON_KEY`

## Step 4: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

## Step 5: Create Supabase Client Utility

Create a new file `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials in environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Step 6: Update Frontend to Use Supabase

### Example: Fetch Habits

Replace mock data in `src/App.tsx`:

```typescript
import { supabase } from './lib/supabase'

// Fetch habits from Supabase
async function loadHabits() {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching habits:', error)
  } else {
    setHabits(data || [])
  }
}

// Create new habit
async function addHabit(name: string, emoji: string, reminder: string) {
  const { data, error } = await supabase
    .from('habits')
    .insert([{ name, emoji, reminder, streak: 0 }])
    .select()

  if (error) {
    console.error('Error creating habit:', error)
  } else {
    setHabits([...habits, data[0]])
  }
}

// Update habit streak
async function updateHabitStreak(habitId: string, newStreak: number) {
  const { error } = await supabase
    .from('habits')
    .update({ streak: newStreak })
    .eq('id', habitId)

  if (error) {
    console.error('Error updating habit:', error)
  }
}

// Save daily check-in
async function saveDailyCheckIn(habitId: string, completed: boolean) {
  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase
    .from('daily_habits')
    .upsert({
      habit_id: habitId,
      check_in_date: today,
      completed
    })

  if (error) {
    console.error('Error saving check-in:', error)
  }
}

// Fetch daily data for analytics
async function loadDailyData(days: number = 90) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)

  const { data, error } = await supabase
    .from('daily_habits')
    .select('*')
    .gte('check_in_date', startDate.toISOString().split('T')[0])
    .order('check_in_date', { ascending: true })

  if (error) {
    console.error('Error fetching daily data:', error)
  } else {
    processAnalytics(data || [])
  }
}
```

## Step 7: Real-time Subscriptions (Optional)

For real-time updates across devices:

```typescript
// Subscribe to habit changes
const subscription = supabase
  .channel('habits-changes')
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'habits' },
    (payload) => {
      console.log('Change received!', payload)
      loadHabits() // Reload habits when they change
    }
  )
  .subscribe()

// Cleanup on unmount
return () => {
  subscription.unsubscribe()
}
```

## Step 8: Authentication (Optional)

For user authentication:

```typescript
// Sign up
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

// Sign in
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

// Get current user
const { data: { user } } = await supabase.auth.getUser()

// Sign out
await supabase.auth.signOut()

// Listen to auth changes
const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session)
})
```

## Deployment to Vercel

When you push these changes to GitHub:

1. Vercel will automatically detect the API changes
2. Your serverless functions will be deployed at:
   - `https://habit-tracker-xxx.vercel.app/api/habits`
   - `https://habit-tracker-xxx.vercel.app/api/achievements`
   - `https://habit-tracker-xxx.vercel.app/api/daily-data`

3. Your frontend will use Supabase directly for data persistence

## Database Backup & Security

### Backup Your Data
Supabase automatically backs up your data. To export:
1. Go to **Database** → **Backups**
2. Click **Download** on any backup

### Enable RLS (Row Level Security)
Already configured in the SQL above! Users can only access their own data.

### API Key Rotation
1. Go to **Project Settings** → **API**
2. Click **Rotate** next to the anon key
3. Update environment variables in Vercel

## Troubleshooting

### "Missing Supabase credentials" error
- Check that `.env.local` file exists
- Verify variable names are correct: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart dev server: `npm run dev`

### CORS errors
- Ensure Supabase is configured to allow your domain
- In Supabase: **Project Settings** → **API** → **CORS**
- Add your Vercel domain: `https://habit-tracker-xxx.vercel.app`

### Data not persisting
- Check RLS policies are enabled
- Verify user authentication is working
- Check browser console for errors

## Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)
