import { LocalNotifications } from '@capacitor/local-notifications';

export async function requestNotificationPermissions() {
  try {
    const permission = await LocalNotifications.requestPermissions();
    return permission.display === 'granted';
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

export async function scheduleHabitReminder(
  habitId: string,
  habitName: string,
  emoji: string,
  reminderTime: string // "09:00" format
) {
  try {
    const [hours, minutes] = reminderTime.split(':').map(Number);

    const now = new Date();
    const scheduledDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes
    );

    // If time has passed today, schedule for tomorrow
    if (scheduledDate < now) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          id: parseInt(habitId),
          title: `${emoji} Time for ${habitName}!`,
          body: 'Open the app to mark it complete',
          schedule: {
            at: scheduledDate,
            repeats: true,
            every: 'day'
          },
          sound: 'default',
          actionTypeId: 'HABIT_REMINDER',
          extra: { habitId }
        }
      ]
    });

    console.log(`Scheduled reminder for ${habitName} at ${reminderTime}`);
  } catch (error) {
    console.error('Error scheduling reminder:', error);
  }
}

export async function cancelHabitReminder(habitId: string) {
  try {
    await LocalNotifications.cancel({
      notifications: [{ id: parseInt(habitId) }]
    });
    console.log(`Cancelled reminder for habit ${habitId}`);
  } catch (error) {
    console.error('Error cancelling reminder:', error);
  }
}
