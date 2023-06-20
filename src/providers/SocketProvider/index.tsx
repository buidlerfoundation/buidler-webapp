"use client";
import AppConfig, { AsyncKey } from "common/AppConfig";
import { GeneratedPrivateKey, getCookie, getDeviceCode } from "common/Cookie";
import { utils } from "ethers";
import useAppDispatch from "hooks/useAppDispatch";
import useUser from "hooks/useUser";
import { EmitMessageData } from "models/Message";
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
import { MESSAGE_ACTIONS } from "reducers/MessageReducers";
import { REACT_ACTIONS } from "reducers/ReactReducers";
import { Socket, io } from "socket.io-client";

type SocketState = "connecting" | "connected" | "disconnected";

export interface ISocketContext {
  emitMessage: (payload: EmitMessageData) => void;
  disconnect: () => void;
  initSocket: (onConnected: () => void) => void;
  socketState: SocketState;
}

export const SocketContext = createContext<ISocketContext>({
  emitMessage: () => {},
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
  const user = useUser();
  const dispatch = useAppDispatch();
  const [socketState, setSocketState] = useState<SocketState>("disconnected");
  const removeListener = useCallback(() => {
    socket.current?.off("ON_NEW_MESSAGE");
    socket.current?.off("ON_DELETE_MESSAGE");
    socket.current?.off("ON_EDIT_MESSAGE");
    socket.current?.off("ON_REACTION_ADDED");
    socket.current?.off("ON_REACTION_REMOVED");
    socket.current?.off("disconnect");
  }, []);
  const listener = useCallback(() => {
    socket.current?.on("ON_NEW_MESSAGE", async (data: any) => {
      dispatch(MESSAGE_ACTIONS.newMessage(data.message_data));
    });
    socket.current?.on("ON_DELETE_MESSAGE", async (data: any) => {
      console.log("XXX: delete message", data);
    });
    socket.current?.on("ON_EDIT_MESSAGE", async (data: any) => {
      console.log("XXX: edit message", data);
    });
    socket.current?.on("ON_REACTION_ADDED", (data: any) => {
      const { attachment_id, emoji_id, user_id } = data.reaction_data;
      dispatch(
        REACT_ACTIONS.addReact({
          id: attachment_id,
          reactName: emoji_id,
          mine: user.user_id === user_id,
        })
      );
    });
    socket.current?.on("ON_REACTION_REMOVED", (data: any) => {
      const { attachment_id, emoji_id, user_id } = data.reaction_data;
      dispatch(
        REACT_ACTIONS.removeReact({
          id: attachment_id,
          reactName: emoji_id,
          mine: user.user_id === user_id,
        })
      );
    });
  }, [dispatch, user.user_id]);
  const initSocket = useCallback(async (onConnected: () => void) => {
    if (socket.current?.connected) return;
    setSocketState("connecting");
    const accessToken = await getCookie(AsyncKey.accessTokenKey);
    const deviceCode = await getDeviceCode();
    const generatedPrivateKey = await GeneratedPrivateKey();
    const publicKey = utils.computePublicKey(generatedPrivateKey, true);
    socket.current = io(`${AppConfig.apiBaseUrl}`, {
      query: {
        token: accessToken,
        device_code: deviceCode,
        encrypt_message_key: publicKey,
        platform: "Web",
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
  }, []);
  useEffect(() => {
    if (socketState === "connected" && user.user_id) {
      removeListener();
      listener();
    }
  }, [listener, removeListener, socketState, user.user_id]);
  const emitMessage = useCallback(
    (payload: EmitMessageData) => {
      const message: any = {
        ...payload,
        createdAt: new Date().toISOString(),
        sender_id: user.user_id,
        isSending: true,
        conversation_data: null,
        content: payload.text || "",
        plain_text: payload.text || "",
      };
      dispatch(MESSAGE_ACTIONS.emitMessage(message));
      socket.current?.emit("NEW_MESSAGE", payload);
    },
    [dispatch, user.user_id]
  );
  const disconnect = useCallback(() => {
    socket.current?.disconnect();
  }, []);
  return (
    <SocketContext.Provider
      value={{
        emitMessage,
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
