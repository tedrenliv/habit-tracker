import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === 'GET') {
      // GET /api/habits - Fetch all habits for a user
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      // TODO: Replace with actual database query
      // const habits = await db.query('SELECT * FROM habits WHERE user_id = ?', [userId]);

      const mockHabits = [
        {
          id: '1',
          name: 'Morning Run',
          emoji: '🏃',
          reminder: '06:00',
          streak: 42,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Meditation',
          emoji: '🧘',
          reminder: '21:00',
          streak: 28,
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Reading',
          emoji: '📚',
          reminder: '20:00',
          streak: 15,
          createdAt: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Fitness',
          emoji: '💪',
          reminder: '18:00',
          streak: 12,
          createdAt: new Date().toISOString(),
        },
      ];

      return res.status(200).json({
        success: true,
        data: mockHabits,
        message: 'Habits fetched successfully',
      });
    } else if (req.method === 'POST') {
      // POST /api/habits - Create a new habit
      const { userId, name, emoji, reminder } = req.body;

      if (!userId || !name || !emoji) {
        return res.status(400).json({
          error: 'userId, name, and emoji are required',
        });
      }

      // TODO: Replace with actual database insert
      // const habit = await db.query('INSERT INTO habits (user_id, name, emoji, reminder) VALUES (?, ?, ?, ?)',
      //   [userId, name, emoji, reminder]);

      const newHabit = {
        id: Date.now().toString(),
        name,
        emoji,
        reminder: reminder || '09:00',
        streak: 0,
        createdAt: new Date().toISOString(),
      };

      return res.status(201).json({
        success: true,
        data: newHabit,
        message: 'Habit created successfully',
      });
    } else if (req.method === 'PUT') {
      // PUT /api/habits - Update a habit
      const { habitId, ...updates } = req.body;

      if (!habitId) {
        return res.status(400).json({ error: 'habitId is required' });
      }

      // TODO: Replace with actual database update
      // const updated = await db.query('UPDATE habits SET ? WHERE id = ?', [updates, habitId]);

      return res.status(200).json({
        success: true,
        data: { id: habitId, ...updates },
        message: 'Habit updated successfully',
      });
    } else if (req.method === 'DELETE') {
      // DELETE /api/habits - Delete a habit
      const { habitId } = req.body;

      if (!habitId) {
        return res.status(400).json({ error: 'habitId is required' });
      }

      // TODO: Replace with actual database delete
      // await db.query('DELETE FROM habits WHERE id = ?', [habitId]);

      return res.status(200).json({
        success: true,
        message: 'Habit deleted successfully',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in habits API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
