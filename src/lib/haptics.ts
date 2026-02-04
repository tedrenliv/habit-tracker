import { Haptics, ImpactStyle } from '@capacitor/haptics';

export async function celebrateCompletion() {
  try {
    // Medium impact for checkbox toggle
    await Haptics.impact({ style: ImpactStyle.Medium });

    // Celebration pattern for completing all habits
    setTimeout(() => Haptics.impact({ style: ImpactStyle.Heavy }), 100);
    setTimeout(() => Haptics.impact({ style: ImpactStyle.Heavy }), 200);
  } catch (error) {
    console.error('Error providing haptic feedback:', error);
  }
}

export async function notificationVibration() {
  try {
    await Haptics.vibrate({ duration: 200 });
  } catch (error) {
    console.error('Error vibrating device:', error);
  }
}
