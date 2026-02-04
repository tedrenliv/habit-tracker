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
      // GET /api/daily-data - Fetch daily check-in data for a date range
      const { userId, startDate, endDate } = req.query;

      if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
      }

      const start = new Date(String(startDate) || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000));
      const end = new Date(String(endDate) || new Date());

      // TODO: Replace with actual database query
      // const data = await db.query(
      //   `SELECT * FROM daily_habits
      //    WHERE user_id = ? AND check_in_date BETWEEN ? AND ?
      //    ORDER BY check_in_date ASC`,
      //   [userId, start, end]
      // );

      // Generate mock data for demonstration
      const mockData = generateMockDailyData(start, end);

      return res.status(200).json({
        success: true,
        data: mockData,
        dateRange: { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] },
        message: 'Daily data fetched successfully',
      });
    } else if (req.method === 'POST') {
      // POST /api/daily-data - Record a daily habit check-in
      const { userId, habitId, date, completed } = req.body;

      if (!userId || !habitId || !date) {
        return res.status(400).json({
          error: 'userId, habitId, and date are required',
        });
      }

      // TODO: Replace with actual database insert/update
      // const result = await db.query(
      //   `INSERT INTO daily_habits (user_id, habit_id, check_in_date, completed)
      //    VALUES (?, ?, ?, ?)
      //    ON DUPLICATE KEY UPDATE completed = VALUES(completed)`,
      //   [userId, habitId, date, completed]
      // );

      return res.status(201).json({
        success: true,
        data: {
          userId,
          habitId,
          date,
          completed,
          timestamp: new Date().toISOString(),
        },
        message: 'Daily check-in recorded successfully',
      });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Error in daily-data API:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// Helper function to generate mock daily data for testing
function generateMockDailyData(startDate: Date, endDate: Date) {
  const data = [];
  const current = new Date(startDate);

  while (current <= endDate) {
    const dateStr = current.toISOString().split('T')[0];
    const completedCount = Math.floor(Math.random() * 5); // 0-4 habits completed

    data.push({
      date: dateStr,
      completed: completedCount,
      total: 4,
      habits: [
        { habitId: '1', completed: completedCount > 0 },
        { habitId: '2', completed: completedCount > 1 },
        { habitId: '3', completed: completedCount > 2 },
        { habitId: '4', completed: completedCount > 3 },
      ],
    });

    current.setDate(current.getDate() + 1);
  }

  return data;
}
