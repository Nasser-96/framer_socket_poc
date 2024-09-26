import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useUserStore from "@/core/stores/user-store";
import GetBackendUrl from "@/core/helpers/backend-url";

export interface WebSocketStateType {
  socket: WebSocket | null;
  isConnected: boolean;
}

const useWebSocket = (url: string = "", token?: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const router = useRouter();
  const { userData } = useUserStore();

  useEffect(() => {
    const wsUrl = `${GetBackendUrl()}`;
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      setIsConnected(true);
    };

    newSocket.onerror = (error) => {
      console.error("WebSocket error:", error);
      // You can add more error-handling logic here
    };

    newSocket.onclose = (event) => {
      console.log("WebSocket closed:", event);
      setIsConnected(false);
    };

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.close();
      }
    };
  }, [userData.token]);

  useEffect(() => {
    const failedConnection = (data: any) => {
      if (data && data.message && data.message === "Invalid token") {
        router.push("login");
      }
    };

    if (socket) {
      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        failedConnection(data);
      };
    }

    return () => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  return { socket, isConnected };
};

export default useWebSocket;
