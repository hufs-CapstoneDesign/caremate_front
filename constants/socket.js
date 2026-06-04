// 수정 전 (Socket.io 방식)
// import { io } from 'socket.io-client';
// const socket = io(`http://${SERVER_IP}:8000`);

// 수정 후 (순정 WebSocket 방식)
const SERVER_IP = '192.168.0.6'; // 아까 확인한 노트북 IP
const socket = new WebSocket(`ws://${SERVER_IP}:8000/ws/calls`); 
// 주의: 주소 앞에 http가 아니라 'ws'가 붙어야 하고, 
// 백엔드 websocket.py에 정의된 경로(예: /ws/chat)를 정확히 써야 합니다.

// 연결 성공 시
socket.onopen = () => {
  console.log('웹소켓 연결 성공!');
};

// 메시지 수신 시
socket.onmessage = (e) => {
  console.log('받은 메시지:', e.data);
};

// 에러 발생 시
socket.onerror = (e) => {
  console.log('에러 발생:', e.message);
};

// 연결 종료 시
socket.onclose = () => {
  console.log('연결 종료');
};

// 메시지 전송 함수 예시
const sendMessage = (msg) => {
  socket.send(JSON.stringify({ message: msg }));
};