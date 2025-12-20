import { io, Socket } from "socket.io-client";

class SocketService {
    private socket: Socket | null = null;

    connect() {
        if (this.socket) return;

        const API_URL = import.meta.env.VITE_WEBSOCKET_URL;

        this.socket = io(API_URL, {
            withCredentials: true,
            autoConnect: true,
        });

        this.socket.on("connect", () => {
            console.log("Socket connected:", this.socket?.id);
        });

        this.socket.on("disconnect", () => {
            console.log("Socket disconnected");
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket(): Socket | null {
        return this.socket;
    }

    on(event: string, callback: (...args: any[]) => void) {
        if (!this.socket) return;
        this.socket.on(event, callback);
    }

    off(event: string, callback?: (...args: any[]) => void) {
        if (!this.socket) return;
        this.socket.off(event, callback);
    }
}

export const socketService = new SocketService();
