import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

class SocketService {
  private socket: Socket | null = null;

  connect(userId: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.socket?.emit('register', userId);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  onNotification(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('notification', callback);
    }
  }

  offNotification() {
    if (this.socket) {
      this.socket.off('notification');
    }
  }
}

export default new SocketService();
