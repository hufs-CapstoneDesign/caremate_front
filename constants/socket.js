// constants/socket.js

import io from 'socket.io-client';


const SERVER_IP = '172.16.2.28'; // 실제 PC IP로 수정

// 1. 일반 Socket.io 연결
const socket = io(`http://${SERVER_IP}:8000`, {
  transports: ['websocket'],
});

// 2. 음성 전용 웹소켓 변수 선언 (나중에 할당할 수 있도록)
export let voiceSocket = null;

// 3. 웹소켓 연결 함수 정의
export const connectVoiceSocket = () => {
  voiceSocket = new WebSocket(`ws://${SERVER_IP}:8000/ws/calls`);
  voiceSocket.binaryType = 'arraybuffer';
  
  voiceSocket.onopen = () => console.log('음성 소켓 연결 성공');
  voiceSocket.onerror = (e) => console.log('음성 소켓 에러:', e);
};

export default socket;