import React, { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Settings, Trash2, Archive, Bell, RotateCw, Calendar, TrendingUp, Star, Lock, Unlock, LogOut } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { celebrateCompletion } from './lib/haptics';
import { scheduleHabitReminder, requestNotificationPermissions } from './lib/notifications';
import {
  signUp, signIn, signOut, onAuthStateChange,
  fetchHabits, createHabit, deleteHabit, saveDailyCheckIn, fetchDailyData, fetchAchievements,
  isSupabaseConfigured,
} from './lib/supabase';

// Mock data
const mockHabits = [
  { id: 1, name: '晨跑', icon: '🏃', color: '#FF6B6B', reminder: '06:00', frequency: 'daily', streak: 42, totalDone: 128, createdAt: '2024-01-01' },
  { id: 2, name: '冥想', icon: '🧘', color: '#4ECDC4', reminder: '21:00', frequency: 'daily', streak: 28, totalDone: 95, createdAt: '2024-01-15' },
  { id: 3, name: '阅读', icon: '📚', color: '#95E1D3', reminder: '20:00', frequency: 'daily', streak: 15, totalDone: 62, createdAt: '2024-02-01' },
  { id: 4, name: '健身', icon: '💪', color: '#F38181', reminder: '18:00', frequency: 'weekdays', streak: 12, totalDone: 48, createdAt: '2024-02-10' },
];

const mockAchievements = [
  { id: 1, name: '初心者', description: '打卡7天', icon: '🌱', unlocked: true, unlockedDate: '2024-01-08', progress: 100 },
  { id: 2, name: '坚持者', description: '打卡30天', icon: '🔥', unlocked: true, unlockedDate: '2024-02-01', progress: 100 },
  { id: 3, name: '勇士', description: '打卡100天', icon: '⚔️', unlocked: false, progress: 42 },
  { id: 4, name: '完美周', description: '连续7天完成所有习惯', icon: '✨', unlocked: true, unlockedDate: '2024-01-20', progress: 100 },
  { id: 5, name: '三式达人', description: '同时坚持3个习惯', icon: '🎯', unlocked: false, progress: 66 },
  { id: 6, name: '千日修行', description: '打卡1000天', icon: '👑', unlocked: false, progress: 12 },
];

const mockDailyData = {
  today: Array.from({ length: 4 }, (_, i) => ({
    habitId: mockHabits[i].id,
    completed: [true, true, false, true][i],
  })),
  history: Array.from({ length: 90 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return {
      date: date.toISOString().split('T')[0],
      completedCount: Math.floor(Math.random() * 5),
      totalHabits: 4,
    };
  }).reverse(),
};

const generateMockChartData = (habitId) => {
  const data = [];
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
      completion: Math.floor(Math.random() * 100),
    });
  }
  return data;
};

// 登录/注册页面
const AuthPage = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) setError(error.message);
      } else {
        if (password.length < 6) {
          setError('密码至少需要6个字符');
          setLoading(false);
          return;
        }
        const { data, error } = await signUp(email, password);
        if (error) {
          setError(error.message);
        } else if (data?.user?.identities?.length === 0) {
          setError('该邮箱已被注册');
        } else if (data?.session) {
          // Auto-confirmed: session exists, onAuthStateChange will handle redirect
        } else {
          setSuccess('注册成功！请查看邮箱并点击确认链接，然后返回登录。');
        }
      }
    } catch (err) {
      setError('发生未知错误，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">习惯追踪器</h1>
          <p className="text-gray-500">{isLogin ? '登录你的账户' : '创建新账户'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={isLogin ? '输入密码' : '至少6个字符'}
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 text-sm p-3 rounded-lg">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? '请稍候...' : isLogin ? '登录' : '注册'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }}
            className="text-blue-500 hover:text-blue-700 text-sm font-medium"
          >
            {isLogin ? '没有账户？立即注册' : '已有账户？立即登录'}
          </button>
        </div>
      </div>
    </div>
  );
};

// 导航栏组件
const Navigation = ({ currentPage, setCurrentPage, onLogout }) => {
  const navItems = [
    { key: 'today', label: '今日打卡', icon: '📋' },
    { key: 'analytics', label: '统计分析', icon: '📊' },
    { key: 'achievements', label: '成就系统', icon: '🏆' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 flex justify-around md:relative md:flex-col md:border-r md:border-t-0 md:w-64 md:h-screen md:p-6 md:bg-gradient-to-br md:from-gray-50 md:to-gray-100">
      {navItems.map((item) => (
        <button
          key={item.key}
          onClick={() => setCurrentPage(item.key)}
          className={`flex flex-col md:flex-row md:items-center md:gap-3 py-2 px-3 rounded-lg transition-all duration-200 ${
            currentPage === item.key
              ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          <span className="text-xl">{item.icon}</span>
          <span className="text-xs md:text-sm font-medium">{item.label}</span>
        </button>
      ))}
      <button
        onClick={onLogout}
        className="flex flex-col md:flex-row md:items-center md:gap-3 py-2 px-3 rounded-lg transition-all duration-200 text-gray-600 hover:text-red-600 hover:bg-red-50 md:mt-auto"
      >
        <LogOut size={20} />
        <span className="text-xs md:text-sm font-medium">退出</span>
      </button>
    </nav>
  );
};

// 今日打卡页面
const TodayPage = ({ habits, dailyData, onHabitToggle, onAddHabit, onDeleteHabit }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddHabit, setShowAddHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');

  const completedCount = dailyData.today.filter((d) => d.completed).length;
  const totalCount = dailyData.today.length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handlePrevDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  return (
    <div className="pb-24 md:pb-0">
      {/* 日期选择器 */}
      <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <button onClick={handlePrevDay} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft size={20} />
          </button>
          <div className="text-center flex-1">
            <h2 className="text-lg font-bold text-gray-900">
              {selectedDate.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
            </h2>
            <p className="text-sm text-gray-500">
              {selectedDate.toLocaleDateString('zh-CN', { weekday: 'long' })}
            </p>
          </div>
          <button onClick={handleNextDay} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* 进度条 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">今日完成进度</span>
            <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500">
              {completionRate}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            已完成 {completedCount} / {totalCount} 个习惯
          </p>
        </div>
      </div>

      {/* 习惯列表 */}
      <div className="p-4 md:p-6 space-y-3">
        {habits.map((habit, idx) => {
          const daily = dailyData.today[idx];
          return (
            <div
              key={habit.id}
              className="bg-white rounded-lg border-l-4 p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
              style={{ borderLeftColor: habit.color }}
            >
              <input
                type="checkbox"
                checked={daily.completed}
                onChange={() => onHabitToggle(habit.id)}
                className="w-6 h-6 rounded-lg cursor-pointer"
                style={{ accentColor: habit.color }}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <span>{habit.icon}</span>
                  {habit.name}
                </h3>
                <p className="text-sm text-gray-500">提醒: {habit.reminder}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900">{habit.streak}天</p>
                <p className="text-xs text-gray-500">连续</p>
              </div>
              <button
                onClick={() => onDeleteHabit(habit.id)}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="删除习惯"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* 添加习惯按钮 */}
      <div className="p-4 md:p-6 flex gap-3">
        <button
          onClick={() => setShowAddHabit(!showAddHabit)}
          className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white py-3 rounded-lg font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          添加新习惯
        </button>
      </div>

      {showAddHabit && (
        <div className="p-4 md:p-6 bg-blue-50 rounded-lg mx-4 md:mx-6">
          <h3 className="font-semibold text-gray-900 mb-3">快速添加习惯</h3>
          <input
            type="text"
            placeholder="输入习惯名称..."
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => {
              if (newHabitName.trim()) {
                onAddHabit(newHabitName);
                setNewHabitName('');
                setShowAddHabit(false);
              }
            }}
            className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600"
          >
            创建
          </button>
        </div>
      )}
    </div>
  );
};

// 统计分析页面
const AnalyticsPage = ({ habits, mockDailyData }) => {
  const completionRates = habits.map((habit) => ({
    name: habit.name,
    rate: Math.round((habit.totalDone / (Math.floor(Math.random() * 50) + 100)) * 100),
    streak: habit.streak,
  })).sort((a, b) => b.rate - a.rate);

  const totalStreak = Math.max(...habits.map((h) => h.streak));
  const avgCompletion = Math.round(
    mockDailyData.history.reduce((sum, d) => sum + (d.completedCount / d.totalHabits) * 100, 0) /
      mockDailyData.history.length
  );

  return (
    <div className="pb-24 md:pb-0 p-4 md:p-6 space-y-6">
      {/* 关键指标 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">最长连续</p>
          <p className="text-3xl font-bold">{totalStreak}</p>
          <p className="text-xs opacity-75">天</p>
        </div>
        <div className="bg-gradient-to-br from-orange-400 to-orange-500 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">平均完成率</p>
          <p className="text-3xl font-bold">{avgCompletion}%</p>
        </div>
        <div className="bg-gradient-to-br from-green-400 to-green-500 rounded-lg p-4 text-white">
          <p className="text-sm opacity-90">活跃习惯</p>
          <p className="text-3xl font-bold">{habits.length}</p>
          <p className="text-xs opacity-75">个</p>
        </div>
      </div>

      {/* 完成率排名 */}
      <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-blue-500" />
          习惯完成率排名
        </h3>
        <div className="space-y-3">
          {completionRates.map((item, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full font-bold text-sm text-gray-600">
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-gray-900">{item.name}</span>
                  <span className="text-sm font-bold text-blue-500">{item.rate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                    style={{ width: `${item.rate}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 打卡日历热力图 */}
      <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-cyan-500" />
          打卡热力图（最近90天）
        </h3>
        <div className="grid grid-cols-7 gap-1">
          {mockDailyData.history.map((day, idx) => {
            const intensity = day.completedCount / day.totalHabits;
            const color = intensity === 0 ? '#e5e7eb' : intensity < 0.5 ? '#bfdbfe' : intensity < 0.8 ? '#60a5fa' : '#3b82f6';
            return (
              <div
                key={idx}
                className="w-4 h-4 rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-500 transition-all"
                style={{ backgroundColor: color }}
                title={`${day.date}: ${day.completedCount}/${day.totalHabits}个习惯`}
              />
            );
          })}
        </div>
        <p className="text-xs text-gray-500 mt-3">颜色越深表示完成度越高</p>
      </div>

      {/* 趋势图表 */}
      <div className="bg-white rounded-lg p-4 md:p-6 border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">完成趋势</h3>
        <div className="h-40 flex items-end gap-1">
          {mockDailyData.history.slice(-30).map((day, idx) => {
            const height = (day.completedCount / day.totalHabits) * 100;
            return (
              <div
                key={idx}
                className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t opacity-70 hover:opacity-100 transition-opacity"
                style={{ height: `${height}%`, minHeight: '2px' }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

// 成就系统页面
const AchievementsPage = ({ achievements }) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="pb-24 md:pb-0 p-4 md:p-6 space-y-6">
      {/* 成就统计 */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">已解锁成就</h2>
        <p className="text-4xl font-bold">{unlockedCount}</p>
        <p className="text-sm opacity-90">/ {achievements.length} 个成就</p>
      </div>

      {/* 成就网格 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={`rounded-lg p-4 text-center border-2 cursor-pointer transition-all hover:scale-105 ${
              achievement.unlocked
                ? 'bg-white border-yellow-300 shadow-lg'
                : 'bg-gray-100 border-gray-300 opacity-60'
            }`}
          >
            <div className="text-4xl mb-2">{achievement.icon}</div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">{achievement.name}</h3>
            <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>

            {!achievement.unlocked && (
              <div className="mt-2">
                <div className="bg-gray-300 rounded-full h-1.5 mb-1">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1.5 rounded-full"
                    style={{ width: `${achievement.progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600">{achievement.progress}% 完成</p>
              </div>
            )}

            {achievement.unlocked && (
              <div className="mt-2">
                <p className="text-xs text-gray-500">
                  已获得 {achievement.unlockedDate}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 主应用
export default function HabitTracker() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('today');
  const [habits, setHabits] = useState(mockHabits);
  const [dailyData, setDailyData] = useState(mockDailyData);

  // Listen for auth state changes
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      return;
    }

    const subscription = onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Load data from Supabase when user logs in
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      // Load habits
      const { data: habitsData } = await fetchHabits(user.id);
      if (habitsData && habitsData.length > 0) {
        const mapped = habitsData.map((h, i) => ({
          id: h.id,
          name: h.name,
          icon: h.emoji || '✨',
          color: ['#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#A8E6CF', '#FFD93D'][i % 6],
          reminder: h.reminder || '09:00',
          frequency: 'daily',
          streak: h.streak || 0,
          totalDone: h.streak || 0,
          createdAt: h.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
        }));
        setHabits(mapped);
        setDailyData((prev) => ({
          ...prev,
          today: mapped.map((h) => ({ habitId: h.id, completed: false })),
        }));
      } else {
        // New user: create default starter habits
        const defaultHabits = [
          { name: '晨跑', emoji: '🏃', reminder: '06:00' },
          { name: '冥想', emoji: '🧘', reminder: '21:00' },
          { name: '阅读', emoji: '📚', reminder: '20:00' },
          { name: '健身', emoji: '💪', reminder: '18:00' },
        ];
        const colors = ['#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181'];
        const created = [];
        for (const h of defaultHabits) {
          const { data } = await createHabit(user.id, h.name, h.emoji, h.reminder);
          if (data) {
            created.push(Array.isArray(data) ? data[0] : data);
          }
        }
        if (created.length > 0) {
          const mapped = created.map((h, i) => ({
            id: h.id,
            name: h.name,
            icon: h.emoji || defaultHabits[i].emoji,
            color: colors[i % colors.length],
            reminder: h.reminder || defaultHabits[i].reminder,
            frequency: 'daily',
            streak: 0,
            totalDone: 0,
            createdAt: new Date().toISOString().split('T')[0],
          }));
          setHabits(mapped);
          setDailyData((prev) => ({
            ...prev,
            today: mapped.map((h) => ({ habitId: h.id, completed: false })),
          }));
        } else {
          // Supabase tables may not exist yet, fall back to mock data
          setHabits(mockHabits);
          setDailyData(mockDailyData);
        }
      }
    };

    loadData();
  }, [user]);

  // Initialize native features on mount
  useEffect(() => {
    const initializeNativeFeatures = async () => {
      if (Capacitor.isNativePlatform()) {
        const hasPermission = await requestNotificationPermissions();

        if (hasPermission) {
          habits.forEach(habit => {
            if (habit.reminder) {
              scheduleHabitReminder(
                habit.id.toString(),
                habit.name,
                habit.icon,
                habit.reminder
              );
            }
          });
        }
      }
    };

    initializeNativeFeatures();
  }, [habits]);

  const handleHabitToggle = async (habitId) => {
    const daily = dailyData.today.find((d) => d.habitId === habitId);
    const newCompleted = !daily?.completed;

    setDailyData((prev) => ({
      ...prev,
      today: prev.today.map((d) => (d.habitId === habitId ? { ...d, completed: newCompleted } : d)),
    }));

    // Persist to Supabase
    if (user) {
      saveDailyCheckIn(user.id, String(habitId), newCompleted);
    }

    if (Capacitor.isNativePlatform()) {
      await celebrateCompletion();
    }
  };

  const handleAddHabit = async (habitName) => {
    let newHabitId = Date.now();

    // Try to persist to Supabase if user is logged in
    if (user) {
      const { data } = await createHabit(user.id, habitName, '✨', '09:00');
      if (data) {
        const created = Array.isArray(data) ? data[0] : data;
        newHabitId = created.id;
      }
    }

    // Always add to local state
    const newHabit = {
      id: newHabitId,
      name: habitName,
      icon: '✨',
      color: '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'),
      reminder: '09:00',
      frequency: 'daily',
      streak: 0,
      totalDone: 0,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setHabits((prev) => [...prev, newHabit]);
    setDailyData((prev) => ({
      ...prev,
      today: [...prev.today, { habitId: newHabit.id, completed: false }],
    }));
  };

  const handleDeleteHabit = async (habitId) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    setDailyData((prev) => ({
      ...prev,
      today: prev.today.filter((d) => d.habitId !== habitId),
    }));

    if (user) {
      deleteHabit(String(habitId));
    }
  };

  const handleLogout = async () => {
    await signOut();
    setUser(null);
    setHabits(mockHabits);
    setDailyData(mockDailyData);
  };

  // Show loading spinner while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
        <div className="text-white text-xl font-semibold">加载中...</div>
      </div>
    );
  }

  // Show auth page if Supabase is configured but user is not logged in
  if (isSupabaseConfigured && !user) {
    return <AuthPage onAuth={setUser} />;
  }

  return (
    <div className="flex flex-col-reverse md:flex-row h-screen bg-gray-50 font-sans">
      {/* 导航栏 */}
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} onLogout={handleLogout} />

      {/* 主内容区域 */}
      <main className="flex-1 overflow-auto md:max-h-screen md:overflow-y-auto">
        {currentPage === 'today' && (
          <TodayPage habits={habits} dailyData={dailyData} onHabitToggle={handleHabitToggle} onAddHabit={handleAddHabit} onDeleteHabit={handleDeleteHabit} />
        )}
        {currentPage === 'analytics' && <AnalyticsPage habits={habits} mockDailyData={dailyData} />}
        {currentPage === 'achievements' && <AchievementsPage achievements={mockAchievements} />}
      </main>
    </div>
  );
}
