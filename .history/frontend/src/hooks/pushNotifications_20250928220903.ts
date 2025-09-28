// Utility functions for push notifications

export const isPushSupported = (): boolean => {
  return 'PushManager' in window && 'serviceWorker' in navigator;
};

export const getPermissionState = (): NotificationPermission => {
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  return await Notification.requestPermission();
};

export const subscribeToPush = async (vapidPublicKey: string): Promise<PushSubscription | null> => {
  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey
    });
  } catch (error) {
    console.error('Error subscribing to push:', error);
    return null;
  }
};

export const sendTestNotification = async (title: string, body: string) => {
  if (!('serviceWorker' in navigator)) return;

  const registration = await navigator.serviceWorker.ready;
  registration.active?.postMessage({
    type: 'TEST_NOTIFICATION',
    title,
    body
  });
};