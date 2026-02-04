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
      // GET /api/achievements - Fetch all achievements for a user
      const { userId } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      // TODO: Replace with actual database query
      // const achievements = await db.query(
      //   'SELECT a.*, ux.unlockedAt FROM achievements a LEFT JOIN user_achievements ux ON a.id = ux.achievement_id WHERE ux.user_id = ?',
      //   [userId]
      // );

      const mockAchievements = [
        {
          id: '1',
          name: 'Beginner',
          emoji: '🌱',
          description: 'Check in for 7 days',
          requirement: 7,
          progress: 42,
          unlockedAt: '2024-01-08',
          isUnlocked: true,
        },
        {
          id: '2',
          name: 'Persister',
          emoji: '🔥',
          description: 'Check in for 30 days',
          requirement: 30,
          progress: 42,
          unlockedAt: '2024-02-01',
          isUnlocked: true,
        },
        {
          id: '3',
          name: 'Warrior',
          emoji: '⚔️',
          description: 'Check in for 100 days',
          requirement: 100,
          progress: 42,
          unlockedAt: null,
          isUnlocked: false,
        },
        {
          id: '4',
          name: 'Perfect Week',
          emoji: '✨',
          description: 'Complete all habits for 7 consecutive days',
          requirement: 7,
          progress: 7,
          unlockedAt: '2024-01-20',
          isUnlocked: true,
        },
        {
          id: '5',
          name: 'Trio Master',
          emoji: '🎯',
          description: 'Maintain 3 habits simultaneously',
          requirement: 3,
          progress: 4,
          unlockedAt: null,
          isUnlocked: false,
        },
        {
          id: '6',
          name: '1000 Days Practice',
          emoji: '👑',
          description: 'Check in for 1000 days',
          requirement: 1000,
          progress: 42,
          unlockedAt: null,
          isUnlocked: false,
        },
      ];

      return res.status(200).json({
        success: true,
        data: mockAchievements,
        message: 'Achievements fetched successfully',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in achievements API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
