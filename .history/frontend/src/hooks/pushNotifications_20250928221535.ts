// Utility functions for push notifications

export const isPushSupported = (): boolean => {
  return 'PushManager' in window && 'serviceWorker' in navigator;
};

export const getPermissionState = (): NotificationPermission => {
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported');
  }
  
  return await Notification.requestPermission();
};

export const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const subscribeToPush = async (vapidPublicKey: string): Promise<PushSubscription | null> => {
  if (!isPushSupported()) {
    throw new Error('Push notifications are not supported');
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });
  } catch (error) {
    console.error('Error subscribing to push:', error);
    return null;
  }
};

export const getExistingSubscription = async (): Promise<PushSubscription | null> => {
  if (!isPushSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('Error getting existing subscription:', error);
    return null;
  }
};

export const unsubscribeFromPush = async (): Promise<boolean> => {
  try {
    const subscription = await getExistingSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error unsubscribing from push:', error);
    return false;
  }
};

// Notification utility functions
export const showLocalNotification = async (title: string, options?: NotificationOptions) => {
  if (!('Notification' in window)) return;

  if (Notification.permission === 'granted') {
    new Notification(title, options);
  } else if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      new Notification(title, options);
    }
  }
};

export const scheduleNotification = (title: string, body: string, delay: number) => {
  setTimeout(() => {
    showLocalNotification(title, { body, icon: '/icons/icon-192x192.png' });
  }, delay);
};