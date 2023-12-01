"use client";
import AppConfig, { AsyncKey } from "common/AppConfig";
import { getCookie } from "common/Cookie";
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "react-hot-toast";
import { Socket, io } from "socket.io-client";

type SocketState = "connecting" | "connected" | "disconnected";

export interface ISocketContext {
  disconnect: () => void;
  initSocket: (onConnected?: () => void, channelId?: string) => void;
  socketState: SocketState;
}

export const SocketContext = createContext<ISocketContext>({
  disconnect: () => {},
  initSocket: () => {},
  socketState: "disconnected",
});

export function useSocket(): ISocketContext {
  return useContext(SocketContext);
}

interface ISocketProps {
  children?: ReactNode;
}

const SocketProvider = ({ children }: ISocketProps) => {
  const socket = useRef<Socket | null>(null);
  const [socketState, setSocketState] = useState<SocketState>("disconnected");
  const removeListener = useCallback(() => {}, []);
  const listener = useCallback(() => {}, []);
  const initSocket = useCallback(
    async (onConnected?: () => void, channelId?: string) => {
      if (socket.current?.connected) return;
      setSocketState("connecting");
      const accessToken = await getCookie(AsyncKey.accessTokenKey);
      socket.current = io(`${AppConfig.apiBaseUrl}`, {
        query: {
          token: accessToken || "",
          platform: "Web",
          channel_id: channelId || "",
        },
        transports: ["websocket"],
        upgrade: false,
      });
      socket.current?.on("connect_error", (err) => {
        toast.error(err.message);
        setSocketState("disconnected");
      });
      socket.current?.on("connect", () => {
        console.log("socket connected");
        onConnected?.();
        setSocketState("connected");
      });
      socket.current?.on("disconnect", (reason: string) => {
        setSocketState("disconnected");
        if (reason === "io server disconnect") {
          socket.current?.connect();
        }
      });
    },
    []
  );
  useEffect(() => {
    if (socketState === "connected") {
      removeListener();
      listener();
    }
  }, [listener, removeListener, socketState]);
  const disconnect = useCallback(() => {
    socket.current?.disconnect();
  }, []);
  return (
    <SocketContext.Provider
      value={{
        disconnect,
        initSocket,
        socketState,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
