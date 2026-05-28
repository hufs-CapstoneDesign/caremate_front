import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';

// 🌟 앱이 백그라운드/종료 상태일 때 푸시 알림을 처리하는 핸들러 등록
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('백그라운드에서 푸시 메시지 수신:', remoteMessage);
  
  // 여기에 알림을 받았을 때 수행할 가벼운 작업(데이터 저장 등)을 적을 수 있습니다.
  // 주의: 여기선 UI를 그리거나 Alert을 띄울 수 없습니다.
});

// 기존의 AppRegistry.registerComponent나 Expo 관련 설정 코드가 이 아래에 이어집니다.