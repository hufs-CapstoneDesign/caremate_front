// constants/socket.js
import io from 'socket.io-client';

// 1. 내 컴퓨터의 IP 주소를 확인하세요 (예: 192.168.0.15)
// 2. 백엔드에서 설정한 포트 번호를 확인하세요 (예: 3000)
const SOCKET_URL = 'http://192.168.X.X:8000'; // https가 아닌 http입니다.

const socket = io(SOCKET_URL, {
  transports: ['websocket'], // 모바일 연결 안정성을 위해 권장
});

export default socket;