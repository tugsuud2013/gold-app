import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { apiClient } from '../api/client';
import { useToast } from '../components/common/Toast';

export const useNotifications = () => {
  const { showToast } = useToast();

  useEffect(() => {
    let mounted = true;
    const register = async () => {
      if (!Device.isDevice) return;
      const settings = await Notifications.getPermissionsAsync();
      let status = settings.status;
      if (status !== 'granted') {
        const request = await Notifications.requestPermissionsAsync();
        status = request.status;
      }
      if (status !== 'granted') return;

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });
      if (!mounted) return;
      await apiClient.put('/api/user/push-token', { pushToken: token.data });
    };

    register();

    const sub = Notifications.addNotificationReceivedListener((notification) => {
      showToast(notification.request.content.title ?? 'Шинэ мэдэгдэл', 'info');
    });

    return () => {
      mounted = false;
      sub.remove();
    };
  }, [showToast]);
};
