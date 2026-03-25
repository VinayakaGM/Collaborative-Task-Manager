import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

let socketInstance = null;

export const useSocket = () => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('tf_token');
    if (!token) return;

    if (!socketInstance) {
      socketInstance = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000', {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });
    }

    setSocket(socketInstance);

    return () => {
      // Don't disconnect on unmount — keep singleton alive
    };
  }, []);

  // Disconnect when logged out
  useEffect(() => {
    return () => {
      const token = localStorage.getItem('tf_token');
      if (!token && socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        setSocket(null);
      }
    };
  }, []);

  return socket;
};
