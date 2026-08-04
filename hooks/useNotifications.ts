
// import * as Notifications from 'expo-notifications';
// import * as Device from 'expo-device';
// import { useEffect, useRef } from 'react';

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: true,
//     shouldSetBadge: true,
//     shouldShowBanner: true,
//     shouldShowList: true,
//   }),
// });

// export function useNotifications() {
//   const notificationListener = useRef<any>(null);
//   const responseListener = useRef<any>(null);

//   async function registerForPushNotifications(): Promise<string | null> {
//     if (!Device.isDevice) {
//       console.log('Must use physical device');
//       return null;
//     }

//     const { status } = await Notifications.requestPermissionsAsync();
//     if (status !== 'granted') {
//       console.log('Permission not granted');
//       return null;
//     }

//     // ✅ FCM Token مباشرة — ده اللي Firebase SDK بيحتاجه
//     const deviceToken = await Notifications.getDevicePushTokenAsync();
//     const fcmToken = deviceToken.data as string;

//     console.log('FCM Token:', fcmToken);
//     return fcmToken;
//   }

//   useEffect(() => {
//     notificationListener.current =
//       Notifications.addNotificationReceivedListener(notification => {
//         console.log('Notification received:', notification);
//       });

//     responseListener.current =
//       Notifications.addNotificationResponseReceivedListener(response => {
//         console.log('Notification clicked:', response);
//       });

//     return () => {
//       notificationListener.current?.remove();
//       responseListener.current?.remove();
//     };
//   }, []);

//   return { registerForPushNotifications };
// }


// hooks/useNotifications.ts

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// ✅ إنشاء Android Channel بالإعدادات الصح
async function setupAndroidChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('default', {
    name: 'الإشعارات العامة',
    importance: Notifications.AndroidImportance.MAX, // ✅ MAX مش HIGH
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#500d75',
    sound: 'default',
    enableLights: true,
    enableVibrate: true,
    showBadge: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC, // ✅ ده اللي بيخلي الإشعار يظهر على شاشة القفل
  });
}

export function useNotifications() {
  const notificationListener = useRef<any>(null);
  const responseListener = useRef<any>(null);

  async function registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('Must use physical device');
      return null;
    }

    // ✅ إعداد الـ Channel أول حاجة
    await setupAndroidChannel();

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.log('Permission not granted');
      return null;
    }

    const deviceToken = await Notifications.getDevicePushTokenAsync();
    const fcmToken = deviceToken.data as string;

    console.log('FCM Token:', fcmToken);
    return fcmToken;
  }

  useEffect(() => {
    notificationListener.current =
      Notifications.addNotificationReceivedListener(notification => {
        console.log('Notification received:', notification);
      });

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener(response => {
        console.log('Notification clicked:', response);
      });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  return { registerForPushNotifications };
}