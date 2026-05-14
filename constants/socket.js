// constants/socket.js
import io from 'socket.io-client';

// 1. 내 컴퓨터의 IP 주소를 확인하세요 (예: 192.168.0.15)
// 2. 백엔드에서 설정한 포트 번호를 확인하세요 (예: 3000)
const SOCKET_URL = 'http://172.16.2.28:8000'; // 

const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  autoConnect: true // 모바일 연결 안정성을 위해 권장
});

export default socket;