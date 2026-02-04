import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if credentials are available
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found in environment variables. Using mock data. ' +
    'To enable Supabase integration, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
  )
}

// Create Supabase client or use mock
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const isSupabaseConfigured = !!supabase

/**
 * Fetch habits from Supabase or return mock data
 */
export async function fetchHabits(userId?: string) {
  if (!supabase || !userId) {
    // Return mock data if Supabase not configured or no userId
    return {
      data: [
        { id: '1', name: 'Morning Run', emoji: '🏃', reminder: '06:00', streak: 42, user_id: userId, created_at: new Date().toISOString() },
        { id: '2', name: 'Meditation', emoji: '🧘', reminder: '21:00', streak: 28, user_id: userId, created_at: new Date().toISOString() },
        { id: '3', name: 'Reading', emoji: '📚', reminder: '20:00', streak: 15, user_id: userId, created_at: new Date().toISOString() },
        { id: '4', name: 'Fitness', emoji: '💪', reminder: '18:00', streak: 12, user_id: userId, created_at: new Date().toISOString() },
      ],
      error: null,
    }
  }

  return await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
}

/**
 * Create a new habit
 */
export async function createHabit(
  userId: string,
  name: string,
  emoji: string,
  reminder: string
) {
  if (!supabase || !userId) {
    return {
      data: { id: Date.now().toString(), name, emoji, reminder, streak: 0, user_id: userId },
      error: null,
    }
  }

  return await supabase
    .from('habits')
    .insert([{ user_id: userId, name, emoji, reminder, streak: 0 }])
    .select()
}

/**
 * Update habit streak
 */
export async function updateHabitStreak(habitId: string, newStreak: number) {
  if (!supabase) {
    return { data: null, error: null }
  }

  return await supabase
    .from('habits')
    .update({ streak: newStreak, updated_at: new Date().toISOString() })
    .eq('id', habitId)
    .select()
}

/**
 * Delete a habit
 */
export async function deleteHabit(habitId: string) {
  if (!supabase) {
    return { error: null }
  }

  return await supabase
    .from('habits')
    .delete()
    .eq('id', habitId)
}

/**
 * Save a daily check-in
 */
export async function saveDailyCheckIn(
  userId: string,
  habitId: string,
  completed: boolean
) {
  if (!supabase || !userId) {
    return { data: null, error: null }
  }

  const today = new Date().toISOString().split('T')[0]

  return await supabase
    .from('daily_habits')
    .upsert({
      user_id: userId,
      habit_id: habitId,
      check_in_date: today,
      completed,
    }, {
      onConflict: 'user_id, habit_id, check_in_date'
    })
    .select()
}

/**
 * Fetch daily data for analytics
 */
export async function fetchDailyData(userId: string, days: number = 90) {
  if (!supabase || !userId) {
    // Return mock data
    const mockData = []
    const current = new Date()

    for (let i = days; i > 0; i--) {
      const date = new Date(current)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      const completedCount = Math.floor(Math.random() * 5)

      mockData.push({
        date: dateStr,
        completed: completedCount,
        total: 4,
      })
    }

    return { data: mockData, error: null }
  }

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0]

  const { data, error } = await supabase
    .from('daily_habits')
    .select('check_in_date, completed')
    .eq('user_id', userId)
    .gte('check_in_date', startDate)
    .order('check_in_date', { ascending: true })

  if (error) {
    return { data: null, error }
  }

  // Process data into daily summaries
  const dailySummary: Record<string, number> = {}

  data?.forEach((item: any) => {
    if (item.completed) {
      dailySummary[item.check_in_date] = (dailySummary[item.check_in_date] || 0) + 1
    }
  })

  return {
    data: Object.entries(dailySummary).map(([date, completed]) => ({
      date,
      completed,
      total: 4,
    })),
    error: null,
  }
}

/**
 * Fetch achievements
 */
export async function fetchAchievements(userId?: string) {
  if (!supabase || !userId) {
    // Return mock achievements
    return {
      data: [
        { id: '1', name: 'Beginner', emoji: '🌱', description: 'Check in for 7 days', requirement: 7, progress: 42, isUnlocked: true, unlockedAt: '2024-01-08' },
        { id: '2', name: 'Persister', emoji: '🔥', description: 'Check in for 30 days', requirement: 30, progress: 42, isUnlocked: true, unlockedAt: '2024-02-01' },
        { id: '3', name: 'Warrior', emoji: '⚔️', description: 'Check in for 100 days', requirement: 100, progress: 42, isUnlocked: false, unlockedAt: null },
        { id: '4', name: 'Perfect Week', emoji: '✨', description: 'Complete all habits for 7 consecutive days', requirement: 7, progress: 7, isUnlocked: true, unlockedAt: '2024-01-20' },
        { id: '5', name: 'Trio Master', emoji: '🎯', description: 'Maintain 3 habits simultaneously', requirement: 3, progress: 4, isUnlocked: false, unlockedAt: null },
        { id: '6', name: '1000 Days Practice', emoji: '👑', description: 'Check in for 1000 days', requirement: 1000, progress: 42, isUnlocked: false, unlockedAt: null },
      ],
      error: null,
    }
  }

  return await supabase
    .from('user_achievements')
    .select(`
      id,
      unlocked_at,
      achievement:achievements(id, name, emoji, description, requirement)
    `)
    .eq('user_id', userId)
}

/**
 * Subscribe to real-time habit changes
 */
export function subscribeToHabitChanges(userId: string, callback: () => void) {
  if (!supabase) return null

  return supabase
    .channel(`habits-${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'habits',
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
    .subscribe()
}

/**
 * Sign up a new user
 */
export async function signUp(email: string, password: string) {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase is not configured' } }
  }
  return await supabase.auth.signUp({ email, password })
}

/**
 * Sign in an existing user
 */
export async function signIn(email: string, password: string) {
  if (!supabase) {
    return { data: null, error: { message: 'Supabase is not configured' } }
  }
  return await supabase.auth.signInWithPassword({ email, password })
}

/**
 * Sign out the current user
 */
export async function signOut() {
  if (!supabase) return
  return await supabase.auth.signOut()
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  if (!supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  if (!supabase) return null
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback)
  return subscription
}
