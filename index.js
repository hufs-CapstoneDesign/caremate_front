import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import * as Notifications from 'expo-notifications';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('백그라운드 메시지 수신:', remoteMessage);
  
  const { title, body } = remoteMessage.data;

  // 🌟 직접 로컬 알림 배너를 생성
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title ?? '알림',
      body: body ?? '',
      data: remoteMessage.data,
    },
    trigger: null, // 즉시 표시
  });
});