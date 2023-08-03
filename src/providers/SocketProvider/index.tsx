"use client";
import AppConfig, { AsyncKey } from "common/AppConfig";
import { getCookie } from "common/Cookie";
import useAppDispatch from "hooks/useAppDispatch";
import useUser from "hooks/useUser";
import { Channel, Community, Space } from "models/Community";
import { EmitMessageData, MessageData, PostData } from "models/Message";
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
import { USER_ACTIONS } from "reducers/UserReducers";
import { Socket, io } from "socket.io-client";
import EventName from "./EventName";
import { UserData } from "models/User";
import { getParamsFromPath } from "helpers/LinkHelper";
import { PIN_POST_ACTIONS } from "reducers/PinPostReducers";
import useIsPlugin from "hooks/useIsPlugin";

type SocketState = "connecting" | "connected" | "disconnected";

export interface ISocketContext {
  emitMessage: (payload: EmitMessageData) => void;
  disconnect: () => void;
  initSocket: (onConnected?: () => void, channelId?: string) => void;
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
  const isPlugin = useIsPlugin();
  const dispatch = useAppDispatch();
  const [socketState, setSocketState] = useState<SocketState>("disconnected");
  const removeListener = useCallback(() => {
    socket.current?.off(EventName.ON_NEW_MESSAGE);
    socket.current?.off(EventName.ON_DELETE_MESSAGE);
    socket.current?.off(EventName.ON_EDIT_MESSAGE);
    socket.current?.off(EventName.ON_REACTION_ADDED);
    socket.current?.off(EventName.ON_REACTION_REMOVED);
    socket.current?.off(EventName.ON_CREATE_NEW_COMMUNITY);
    socket.current?.off(EventName.ON_USER_JOIN_COMMUNITY);
    socket.current?.off(EventName.ON_USER_JOIN_CHANNEL);
    socket.current?.off(EventName.ON_USER_LEAVE_CHANNEL);
    socket.current?.off(EventName.ON_NEW_TOPIC);
    socket.current?.off(EventName.ON_USER_UPDATE_PROFILE);
    socket.current?.off("disconnect");
  }, []);
  const onNewMessage = useCallback(
    (data: MessageData) => {
      dispatch(MESSAGE_ACTIONS.newMessage(data));
    },
    [dispatch]
  );
  const onDeleteMessage = useCallback(
    (data: any) => {
      dispatch(
        MESSAGE_ACTIONS.deleteMessage({
          entityId: data.entity_id,
          messageId: data.message_id,
        })
      );
    },
    [dispatch]
  );
  const onEditMessage = useCallback(
    (data: MessageData) => {
      dispatch(MESSAGE_ACTIONS.editMessage(data));
    },
    [dispatch]
  );
  const onAddReact = useCallback(
    (data: any) => {
      const { attachment_id, emoji_id, user_id } = data;
      dispatch(
        REACT_ACTIONS.addReact({
          id: attachment_id,
          reactName: emoji_id,
          mine: user.user_id === user_id,
        })
      );
    },
    [dispatch, user.user_id]
  );
  const onRemoveReact = useCallback(
    (data: any) => {
      const { attachment_id, emoji_id, user_id } = data;
      dispatch(
        REACT_ACTIONS.removeReact({
          id: attachment_id,
          reactName: emoji_id,
          mine: user.user_id === user_id,
        })
      );
    },
    [dispatch, user.user_id]
  );
  const onCreateCommunity = useCallback(
    (data: Community) => {
      dispatch(USER_ACTIONS.createNewCommunity(data));
    },
    [dispatch]
  );
  const onUserJoinCommunity = useCallback(
    (data: { community: Community; user: UserData }) => {
      if (user.user_id === data.user.user_id) {
        dispatch(USER_ACTIONS.createNewCommunity(data.community));
      }
    },
    [dispatch, user.user_id]
  );
  const onUserJoinChannel = useCallback(
    (data: { channel: Channel; space: Space; user: UserData }) => {
      if (isPlugin) return;
      if (user.user_id === data.user.user_id) {
        const matchParams = getParamsFromPath();
        if (data.channel.community_id === matchParams?.match_community_id) {
          dispatch(
            USER_ACTIONS.joinNewChannel({
              channel: {
                ...data.channel,
                is_channel_member: true,
              },
              space: data.space,
            })
          );
        }
      }
    },
    [dispatch, isPlugin, user.user_id]
  );
  const onUserLeaveChannel = useCallback(
    (data: { channel: Channel; user: UserData }) => {
      if (isPlugin) return;
      if (user.user_id === data.user.user_id) {
        if (data.channel.is_default_channel) {
          dispatch(
            USER_ACTIONS.updateChannel({
              channelId: data.channel.channel_id,
              spaceId: data.channel.space_id,
              communityId: data.channel.community_id || "",
              data: {
                is_channel_member: false,
                total_channel_members:
                  (data.channel?.total_channel_members || 1) - 1,
              },
            })
          );
        } else {
          dispatch(
            USER_ACTIONS.leaveChannel({
              channel: data.channel,
            })
          );
        }
      }
    },
    [dispatch, isPlugin, user.user_id]
  );
  const onNewTopic = useCallback(
    (data: PostData) => {
      dispatch(PIN_POST_ACTIONS.addNewTopic(data));
    },
    [dispatch]
  );
  const onUserUpdateProfile = useCallback(
    (data: UserData) => {
      if (data.user_id === user.user_id) {
        dispatch(USER_ACTIONS.updateCurrentUser({ user: data }));
      }
      const matchParams = getParamsFromPath();
      const { match_channel_id } = matchParams || {};
      if (match_channel_id) {
        dispatch(
          MESSAGE_ACTIONS.updateUser({
            user: data,
            channelId: match_channel_id,
          })
        );
      }
    },
    [dispatch, user.user_id]
  );
  const listener = useCallback(() => {
    socket.current?.on(EventName.ON_NEW_MESSAGE, onNewMessage);
    socket.current?.on(EventName.ON_DELETE_MESSAGE, onDeleteMessage);
    socket.current?.on(EventName.ON_EDIT_MESSAGE, onEditMessage);
    socket.current?.on(EventName.ON_REACTION_ADDED, onAddReact);
    socket.current?.on(EventName.ON_REACTION_REMOVED, onRemoveReact);
    socket.current?.on(EventName.ON_CREATE_NEW_COMMUNITY, onCreateCommunity);
    socket.current?.on(EventName.ON_USER_JOIN_COMMUNITY, onUserJoinCommunity);
    socket.current?.on(EventName.ON_USER_JOIN_CHANNEL, onUserJoinChannel);
    socket.current?.on(EventName.ON_USER_LEAVE_CHANNEL, onUserLeaveChannel);
    socket.current?.on(EventName.ON_NEW_TOPIC, onNewTopic);
    socket.current?.on(EventName.ON_USER_UPDATE_PROFILE, onUserUpdateProfile);
  }, [
    onAddReact,
    onCreateCommunity,
    onDeleteMessage,
    onEditMessage,
    onNewMessage,
    onNewTopic,
    onRemoveReact,
    onUserJoinChannel,
    onUserJoinCommunity,
    onUserLeaveChannel,
    onUserUpdateProfile,
  ]);
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
    if (socketState === "connected" && user.user_id) {
      removeListener();
      listener();
    }
  }, [listener, removeListener, socketState, user.user_id]);
  const emitMessage = useCallback(
    (payload: EmitMessageData) => {
      const message: any = {
        ...payload,
        created_at: new Date().toISOString(),
        sender_id: user.user_id,
        sender: user,
        isSending: true,
        content: payload.text || "",
        plain_text: payload.text || "",
      };
      dispatch(MESSAGE_ACTIONS.emitMessage(message));
      socket.current?.emit("NEW_MESSAGE", payload);
    },
    [dispatch, user]
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
