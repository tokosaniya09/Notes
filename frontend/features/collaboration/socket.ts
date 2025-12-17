import io from 'socket.io-client';
import { getSession } from 'next-auth/react';

class SocketService {
  private socket: any = null;
  private static instance: SocketService;
  
  // 1. Add a promise tracker to prevent race conditions during React double-renders
  private connectionPromise: Promise<any> | null = null;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public async connect(): Promise<any> {
    // 2. If we already have a socket, return it immediately
    if (this.socket) {
      return this.socket;
    }

    // 3. If a connection is currently being established, return that existing promise.
    // This prevents creating two sockets if connect() is called twice rapidly.
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // 4. Otherwise, create a new connection promise
    this.connectionPromise = (async () => {
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

      const backendUrl =
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

      const socketInstance = io(`${backendUrl}/collaboration`, {
        auth: { token: `Bearer ${token}` },
        query: { token: `Bearer ${token}` },
        transports: ["websocket"],
        autoConnect: true,
        reconnection: true,
      });

      socketInstance.on("connect", () => {
        console.log("WS Connected:", socketInstance.id);
      });

      socketInstance.on("connect_error", (err: any) => {
        console.warn("WS Connection Error:", err.message);
      });

      this.socket = socketInstance;
      return this.socket;
    })();

    // 5. Wait for the promise to resolve, then clear the lock
    try {
      return await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
    }
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