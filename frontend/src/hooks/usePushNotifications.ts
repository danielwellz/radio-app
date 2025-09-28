import { useState, useCallback, useEffect } from 'react';

export const usePushNotifications = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    setIsSupported('PushManager' in window && 'serviceWorker' in navigator);
    setPermission(Notification.permission);
    
    // Check for existing subscription
    checkExistingSubscription();
  }, []);

  const checkExistingSubscription = async () => {
    if (!isSupported) return;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();
      setSubscription(existingSubscription);
    } catch (error) {
      console.error('Error checking existing subscription:', error);
    }
  };

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) return false;
    
    try {
      const newPermission = await Notification.requestPermission();
      setPermission(newPermission);
      return newPermission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }, [isSupported]);

  const subscribe = useCallback(async (): Promise<PushSubscription | null> => {
    if (!isSupported || permission !== 'granted') {
      console.warn('Push notifications not supported or permission not granted');
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Unsubscribe first if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        await existingSubscription.unsubscribe();
      }

      // Get VAPID public key from backend
      const response = await fetch('/api/vapid-public-key');
      const { publicKey } = await response.json();

      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey
      });

      setSubscription(newSubscription);

      // Send subscription to backend
      await fetch('/api/push-subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSubscription)
      });

      return newSubscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      return null;
    }
  }, [isSupported, permission]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!subscription) return false;

    try {
      await subscription.unsubscribe();
      setSubscription(null);

      // Notify backend about unsubscribe
      await fetch('/api/push-unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint: subscription.endpoint })
      });

      return true;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }, [subscription]);

  const sendTestNotification = useCallback(async (title: string, body: string) => {
    if (!subscription) return;

    try {
      await fetch('/api/send-notification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body,
          icon: '/icons/icon-192x192.png'
        })
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }, [subscription]);

  return {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification
  };
};