
import io from 'socket.io-client';
import { getSession } from 'next-auth/react';

class SocketService {
  private socket: any = null;
  private static instance: SocketService;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public async connect(): Promise<any> {
    if (this.socket?.connected) return this.socket;

    // Retry session fetch if needed
    let token: string | undefined;
    
    try {
        const session = await getSession();
        token = session?.accessToken;
    } catch (e) {
        console.error("Failed to get session for WS connection", e);
    }

    if (!token) {
      console.warn("Cannot connect to WebSocket: No access token found.");
      return null;
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';

    // Disconnect existing socket if it exists but is in a bad state
    if (this.socket) {
        this.socket.disconnect();
    }

    this.socket = io(`${backendUrl}/collaboration`, {
      auth: {
        token: `Bearer ${token}`
      },
      // Backend checks handshake.headers.authorization
      extraHeaders: {
        Authorization: `Bearer ${token}`
      },
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    } as any);

    this.socket.on('connect', () => {
      console.log('WS Connected:', this.socket?.id);
    });

    this.socket.on('connect_error', (err: any) => {
      console.warn('WS Connection Error:', err.message);
    });

    return this.socket;
  }

  public getSocket(): any {
    return this.socket;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = SocketService.getInstance();