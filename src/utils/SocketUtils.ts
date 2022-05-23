import actionTypes from "../actions/ActionTypes";
import AppConfig, { AsyncKey } from "../common/AppConfig";
import { getCookie, getDeviceCode, setCookie } from "../common/Cookie";
import store from "../store";
import toast from "react-hot-toast";
import api from "../api";
import { createRefreshSelector } from "../reducers/selectors";
import { Dispatch } from "redux";
import {
  getChannelPrivateKey,
  getPrivateChannel,
  getRawPrivateChannel,
  normalizeMessageData,
  normalizeMessageItem,
  normalizePublicMessageData,
  storePrivateChannel,
} from "helpers/ChannelHelper";
import { io } from "socket.io-client";
import { uniqBy } from "lodash";

const getTasks = async (channelId: string, dispatch: Dispatch) => {
  dispatch({ type: actionTypes.TASK_REQUEST, payload: { channelId } });
  try {
    const [taskRes, archivedCountRes] = await Promise.all([
      api.getTasks(channelId),
      api.getArchivedTaskCount(channelId),
    ]);
    if (taskRes.statusCode === 200 && archivedCountRes.statusCode === 200) {
      dispatch({
        type: actionTypes.TASK_SUCCESS,
        payload: {
          channelId,
          tasks: taskRes.data,
          archivedCount: archivedCountRes.total,
        },
      });
    } else {
      dispatch({
        type: actionTypes.TASK_FAIL,
        payload: { message: "Error", taskRes, archivedCountRes },
      });
    }
  } catch (e) {
    dispatch({ type: actionTypes.TASK_FAIL, payload: { message: e } });
  }
};

const getTaskFromUser = async (
  userId: string,
  channelId: string,
  teamId: string,
  dispatch: Dispatch
) => {
  dispatch({ type: actionTypes.TASK_REQUEST, payload: { channelId } });
  try {
    const [taskRes, archivedCountRes] = await Promise.all([
      api.getTaskFromUser(userId, teamId),
      api.getArchivedTaskCountFromUser(userId, teamId),
    ]);
    if (taskRes.statusCode === 200 && archivedCountRes.statusCode === 200) {
      dispatch({
        type: actionTypes.TASK_SUCCESS,
        payload: {
          channelId,
          tasks: taskRes.data,
          archivedCount: archivedCountRes.total,
        },
      });
    } else {
      dispatch({
        type: actionTypes.TASK_FAIL,
        payload: { message: "Error", taskRes, archivedCountRes },
      });
    }
  } catch (e) {
    dispatch({ type: actionTypes.TASK_FAIL, payload: { message: e } });
  }
};

const getMessages = async (
  channelId: string,
  channelType: string,
  dispatch: Dispatch
) => {
  const messageRes = await api.getMessages(channelId, 50);
  const isPrivate = channelType === "Private" || channelType === "Direct";
  const messageData = isPrivate
    ? await normalizeMessageData(messageRes.data, channelId)
    : await normalizePublicMessageData(messageRes.data);
  if (messageRes.statusCode === 200) {
    dispatch({
      type: actionTypes.MESSAGE_SUCCESS,
      payload: { data: messageData, channelId },
    });
  }
};

const actionSetCurrentTeam = async (
  team: any,
  dispatch: Dispatch,
  channelId?: string
) => {
  const teamUsersRes = await api.getTeamUsers(team.team_id);
  let lastChannelId: any = null;
  if (channelId) {
    lastChannelId = channelId;
  } else {
    lastChannelId = getCookie(AsyncKey.lastChannelId);
  }
  const resChannel = await api.findChannel(team.team_id);
  if (teamUsersRes.statusCode === 200) {
    dispatch({
      type: actionTypes.GET_TEAM_USER,
      payload: { teamUsers: teamUsersRes.data, teamId: team.team_id },
    });
  }
  const directChannelUser = teamUsersRes?.data?.find(
    (u: any) => u.direct_channel === lastChannelId
  );
  dispatch({
    type: actionTypes.SET_CURRENT_TEAM,
    payload: { team, resChannel, directChannelUser, lastChannelId },
  });
  setCookie(AsyncKey.lastTeamId, team.team_id);
  const resSpace = await api.getSpaceChannel(team.team_id);
  if (resSpace.statusCode === 200) {
    dispatch({
      type: actionTypes.GROUP_CHANNEL,
      payload: resSpace.data,
    });
  }
  if (resChannel.statusCode === 200) {
    if (resChannel.data.length > 0) {
      dispatch({
        type: actionTypes.CHANNEL_SUCCESS,
        payload: {
          channel: resChannel.data.map((c: any) => {
            if (c.channel_id === lastChannelId) {
              c.seen = true;
            }
            return c;
          }),
        },
      });
    } else {
      dispatch({
        type: actionTypes.CHANNEL_FAIL,
      });
    }
  }
};

const loadMessageIfNeeded = async () => {
  const refreshSelector = createRefreshSelector([actionTypes.MESSAGE_PREFIX]);
  const user: any = store.getState()?.user;
  const { currentChannel } = user;
  const refresh = refreshSelector(store.getState());
  if (!currentChannel || refresh || currentChannel.channel_type === "Public")
    return;
  store.dispatch({
    type: actionTypes.MESSAGE_FRESH,
    payload: { channelId: currentChannel.channel_id },
  });
  const messageRes = await api.getMessages(currentChannel.channel_id);
  const messageData =
    currentChannel.channel_type === "Private" ||
    currentChannel.channel_type === "Direct"
      ? await normalizeMessageData(messageRes.data, currentChannel.channel_id)
      : await normalizePublicMessageData(messageRes.data);
  if (messageRes.statusCode === 200) {
    store.dispatch({
      type: actionTypes.MESSAGE_SUCCESS,
      payload: {
        data: messageData,
        channelId: currentChannel.channel_id,
        isFresh: true,
      },
    });
  }
};

class SocketUtil {
  socket: any = null;
  firstLoad = false;
  async init(teamId?: string) {
    if (this.socket?.connected) return;
    const accessToken = getCookie(AsyncKey.accessTokenKey);
    if (!accessToken) {
      return;
    }
    this.socket = io(
      // `${AppConfig.baseUrl}`,
      `${AppConfig.stagingBaseUrl}`,
      {
        query: { token: accessToken },
        transports: ["websocket"],
        upgrade: false,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      }
    );
    this.socket.on("connect", () => {
      console.log("socket connected");
      if (this.firstLoad) {
        this.reloadData();
      }
      this.firstLoad = true;
      this.listenSocket();
      this.socket.on("disconnect", (reason: string) => {
        console.log(`socket disconnect: ${reason}`);
        this.socket.off("ON_NEW_MESSAGE");
        this.socket.off("ON_NEW_TASK");
        this.socket.off("ON_UPDATE_TASK");
        this.socket.off("ON_ERROR");
        this.socket.off("ON_EDIT_MESSAGE");
        this.socket.off("ON_USER_ONLINE");
        this.socket.off("ON_USER_OFFLINE");
        this.socket.off("ON_DELETE_TASK");
        this.socket.off("ON_DELETE_MESSAGE");
        this.socket.off("ON_REACTION_ADDED");
        this.socket.off("ON_REACTION_REMOVED");
        this.socket.off("ON_USER_JOIN_TEAM");
        this.socket.off("ON_CREATE_NEW_CHANNEL");
        this.socket.off("ON_CREATE_NEW_SPACE");
        this.socket.off("ON_ADD_NEW_MEMBER_TO_PRIVATE_CHANNEL");
        this.socket.off("ON_REMOVE_NEW_MEMBER_FROM_PRIVATE_CHANNEL");
        this.socket.off("ON_UPDATE_MEMBER_IN_PRIVATE_CHANNEL");
        this.socket.off("ON_CHANNEL_KEY_SEND");
        this.socket.off("ON_VERIFY_DEVICE_OTP_SEND");
        this.socket.off("ON_SYNC_DATA_SEND");
        this.socket.off("ON_UPDATE_CHANNEL");
        this.socket.off("ON_DELETE_CHANNEL");
        this.socket.off("ON_UPDATE_SPACE");
        this.socket.off("ON_DELETE_SPACE");
        this.socket.off("disconnect");
      });
      const user: any = store.getState()?.user;
      const { currentTeam } = user || {};
      this.emitOnline(teamId || currentTeam?.team_id);
    });
  }
  reloadData = async () => {
    const user: any = store.getState()?.user;
    const { currentTeam, currentChannel } = user;
    if (currentTeam && currentChannel) {
      await actionSetCurrentTeam(
        currentTeam,
        store.dispatch,
        currentChannel.channel_id
      );
      // load message
      getMessages(
        currentChannel.channel_id,
        currentChannel.channel_type,
        store.dispatch
      );
      // load task
      if (currentChannel?.user) {
        getTaskFromUser(
          currentChannel.user.user_id,
          currentChannel.channel_id || currentChannel.user.user_id,
          currentTeam?.team_id,
          store.dispatch
        );
      } else {
        getTasks(currentChannel.channel_id, store.dispatch);
      }
    }
  };
  handleChannelPrivateKey = async (
    channel_id: string,
    key: string,
    timestamp: number
  ) => {
    const configs: any = store.getState()?.configs;
    const { channelPrivateKey, privateKey } = configs;
    const decrypted = await getChannelPrivateKey(key, privateKey);
    storePrivateChannel(channel_id, key, timestamp);
    this.emitReceivedKey(channel_id, timestamp);
    store.dispatch({
      type: actionTypes.SET_CHANNEL_PRIVATE_KEY,
      payload: {
        ...channelPrivateKey,
        [channel_id]: [
          ...(channelPrivateKey?.[channel_id] || []),
          { key: decrypted, timestamp },
        ],
      },
    });
  };
  listenSocket() {
    this.socket.on("ON_DELETE_SPACE", (data: any) => {
      store.dispatch({
        type: actionTypes.DELETE_GROUP_CHANNEL_SUCCESS,
        payload: { spaceId: data.space_id },
      });
    });
    this.socket.on("ON_UPDATE_SPACE", (data: any) => {
      store.dispatch({
        type: actionTypes.UPDATE_GROUP_CHANNEL_SUCCESS,
        payload: data,
      });
    });
    this.socket.on("ON_DELETE_CHANNEL", (data: any) => {
      store.dispatch({
        type: actionTypes.DELETE_CHANNEL_SUCCESS,
        payload: { channelId: data.channel_id },
      });
    });
    this.socket.on("ON_UPDATE_CHANNEL", (data: any) => {
      store.dispatch({
        type: actionTypes.UPDATE_CHANNEL_SUCCESS,
        payload: { ...data, attachment: null },
      });
    });
    this.socket.on("ON_SYNC_DATA_SEND", async (data: any) => {
      const dataKey = await getRawPrivateChannel();
      const deviceCode = await getDeviceCode();
      const res = await api.syncChannelKey({
        requested_device_code: data?.[0],
        channel_key_data: dataKey,
      });
      if (res.statusCode === 200) {
        this.socket.emit("ON_SYNC_DATA_RECEIVED", {
          device_code: deviceCode,
          requested_device_code: data?.[0],
        });
      }
    });
    this.socket.on("ON_VERIFY_DEVICE_OTP_SEND", async (data: any) => {
      const deviceCode = await getDeviceCode();
      if (Object.keys(data).length > 0) {
        store.dispatch({
          type: actionTypes.TOGGLE_OTP,
          payload: !Object.keys(data).find((el) => el === deviceCode)
            ? { otp: Object.values(data)?.[0], open: true }
            : { open: true },
        });
        if (!Object.keys(data).find((el) => el === deviceCode)) {
          this.socket.emit("ON_VERIFY_DEVICE_OTP_RECEIVED", {
            device_code: deviceCode,
            requested_device_code: Object.keys(data)?.[0],
          });
        }
      }
    });
    this.socket.on("ON_CHANNEL_KEY_SEND", async (data: any) => {
      const configs: any = store.getState()?.configs;
      const { privateKey } = configs;
      const current = getCookie(AsyncKey.channelPrivateKey);
      let dataLocal: any = {};
      if (typeof current === "string") {
        dataLocal = JSON.parse(current);
      }
      Object.keys(data).forEach((k) => {
        const arr = data[k];
        dataLocal[k] = uniqBy([...(dataLocal?.[k] || []), ...arr], "key");
        arr.forEach((el: any) => {
          const { timestamp } = el;
          this.emitReceivedKey(k, timestamp);
        });
      });
      setCookie(AsyncKey.channelPrivateKey, JSON.stringify(dataLocal));
      const res = await getPrivateChannel(privateKey);
      store.dispatch({
        type: actionTypes.SET_CHANNEL_PRIVATE_KEY,
        payload: res,
      });
      loadMessageIfNeeded();
      return null;
    });
    this.socket.on("ON_UPDATE_MEMBER_IN_PRIVATE_CHANNEL", async (data: any) => {
      const user: any = store.getState()?.user;
      const { channel, key, timestamp } = data;
      if (user.currentTeam.team_id === channel.team_id) {
        const isExistChannel = !!user.channel.find(
          (el: any) => el.channel_id === channel.channel_id
        );
        if (
          isExistChannel &&
          !channel.channel_member.find(
            (el: string) => el === user.userData.user_id
          )
        ) {
          store.dispatch({
            type: actionTypes.DELETE_CHANNEL_SUCCESS,
            payload: { channelId: channel.channel_id },
          });
        } else if (isExistChannel) {
          store.dispatch({
            type: actionTypes.UPDATE_CHANNEL_SUCCESS,
            payload: data.channel,
          });
        } else if (
          !!channel.channel_member.find(
            (el: string) => el === user.userData.user_id
          )
        ) {
          store.dispatch({
            type: actionTypes.NEW_CHANNEL,
            payload: data.channel,
          });
        }
      }
      this.handleChannelPrivateKey(channel.channel_id, key, timestamp);
    });
    this.socket.on("ON_CREATE_NEW_SPACE", (data: any) => {
      store.dispatch({
        type: actionTypes.CREATE_GROUP_CHANNEL_SUCCESS,
        payload: data,
      });
    });
    this.socket.on("ON_CREATE_NEW_CHANNEL", (data: any) => {
      const { channel, key, timestamp } = data;
      if (key && timestamp) {
        this.handleChannelPrivateKey(channel.channel_id, key, timestamp);
      }
      const user: any = store.getState()?.user;
      const { currentTeam } = user;
      if (currentTeam.team_id === channel.team_id) {
        store.dispatch({
          type: actionTypes.NEW_CHANNEL,
          payload: channel,
        });
      }
    });
    this.socket.on("ON_ADD_NEW_MEMBER_TO_PRIVATE_CHANNEL", (data: any) => {
      const user: any = store.getState()?.user;
      const { currentTeam, channel, userData } = user;
      if (currentTeam.team_id === data.team_id) {
        const isExistChannel = !!channel.find(
          (el: any) => el.channel_id === data.channel_id
        );
        if (isExistChannel) {
          store.dispatch({
            type: actionTypes.UPDATE_CHANNEL_SUCCESS,
            payload: data.channel,
          });
        } else if (
          !!data.channel_member.find((el: string) => el === userData.user_id)
        ) {
          store.dispatch({
            type: actionTypes.NEW_CHANNEL,
            payload: data.channel,
          });
        }
      }
    });
    this.socket.on("ON_REMOVE_NEW_MEMBER_FROM_PRIVATE_CHANNEL", (data: any) => {
      const user: any = store.getState()?.user;
      const { currentTeam, channel, userData } = user;
      if (currentTeam.team_id === data.team_id) {
        const isExistChannel = !!channel.find(
          (el: any) => el.channel_id === data.channel_id
        );
        if (
          isExistChannel &&
          !data.channel_member.find((el: string) => el === userData.user_id)
        ) {
          store.dispatch({
            type: actionTypes.DELETE_CHANNEL_SUCCESS,
            payload: { channelId: data.channel.channel_id },
          });
        }
      }
    });
    this.socket.on("ON_USER_JOIN_TEAM", (data: any) => {
      const user: any = store.getState()?.user;
      const { currentTeam } = user;
      if (currentTeam.team_id === data.team_id) {
        store.dispatch({
          type: actionTypes.NEW_USER,
          payload: data.user,
        });
      }
    });
    this.socket.on("ON_REACTION_ADDED", (data: any) => {
      const { attachment_id, emoji_id, user_id } = data.reaction_data;
      const user: any = store.getState()?.user;
      const userData = user?.userData;
      store.dispatch({
        type: actionTypes.ADD_REACT,
        payload: {
          id: attachment_id,
          reactName: emoji_id,
          userId: user_id,
          isReacted: userData.user_id === user_id,
        },
      });
    });
    this.socket.on("ON_REACTION_REMOVED", (data: any) => {
      const { attachment_id, emoji_id, user_id } = data.reaction_data;
      store.dispatch({
        type: actionTypes.REMOVE_REACT,
        payload: {
          id: attachment_id,
          reactName: emoji_id,
          userId: user_id,
        },
      });
    });
    this.socket.on("ON_USER_ONLINE", (data: any) => {
      store.dispatch({
        type: actionTypes.USER_ONLINE,
        payload: data,
      });
    });
    this.socket.on("ON_USER_OFFLINE", (data: any) => {
      store.dispatch({
        type: actionTypes.USER_OFFLINE,
        payload: data,
      });
    });
    this.socket.on("ON_DELETE_MESSAGE", (data: any) => {
      store.dispatch({
        type: actionTypes.DELETE_MESSAGE,
        payload: {
          messageId: data.message_id,
          channelId: data.channel_id,
          parentId: data.parent_id,
        },
      });
    });
    this.socket.on("ON_DELETE_TASK", (data: any) => {
      data.channel_ids.forEach((el: string) => {
        store.dispatch({
          type: actionTypes.DELETE_TASK_REQUEST,
          payload: {
            taskId: data.task_id,
            channelId: el,
          },
        });
      });
    });
    this.socket.on("ON_USER_OFFLINE", (data: any) => {});
    this.socket.on("ON_NEW_MESSAGE", async (data: any) => {
      const { message_data, notification_data } = data;
      const { notification_type } = notification_data;
      const configs: any = store.getState()?.configs;
      const { channelPrivateKey } = configs;
      const user: any = store.getState()?.user;
      const { userData, teamUserData, channel, currentChannel } = user;
      const messageData: any = store.getState()?.message.messageData;
      const channelNotification = channel.find(
        (c: any) => c.channel_id === message_data.channel_id
      );
      if (!currentChannel.channel_id) {
        if (currentChannel.channel_type === "Direct") {
          return;
        }
        store.dispatch({
          type: actionTypes.SET_CURRENT_CHANNEL,
          payload: {
            channel: {
              ...currentChannel,
              channel_id: message_data.channel_id,
              user: {
                ...currentChannel.user,
                direct_channel: message_data.channel_id,
              },
            },
          },
        });
        setCookie(AsyncKey.lastChannelId, message_data.channel_id);
      } else if (
        userData?.user_id !== notification_data?.sender_data?.user_id
      ) {
        if (notification_type !== "Muted") {
          if (currentChannel.channel_id !== message_data.channel_id) {
            store.dispatch({
              type: actionTypes.MARK_UN_SEEN_CHANNEL,
              payload: {
                channelId: message_data.channel_id,
              },
            });
          }
        }
        if (channelNotification?.channel_type === "Direct") {
          channelNotification.user = teamUserData.find(
            (u: any) =>
              u.user_id ===
              channelNotification.channel_member.find(
                (el: string) => el !== userData?.user_id
              )
          );
        }
        if (currentChannel.channel_id === message_data.channel_id) {
          const { scrollData } = messageData?.[currentChannel.channel_id] || {};
          if (scrollData?.showScrollDown) {
            store.dispatch({
              type: actionTypes.SET_CHANNEL_SCROLL_DATA,
              payload: {
                channelId: currentChannel.channel_id,
                data: {
                  showScrollDown: scrollData?.showScrollDown,
                  unreadCount: (scrollData?.unreadCount || 0) + 1,
                },
              },
            });
          }
        }
      }
      let res = message_data;
      if (
        !channelNotification ||
        channelNotification?.channel_type === "Private" ||
        channelNotification?.channel_type === "Direct"
      ) {
        const keys = channelPrivateKey[message_data.channel_id];
        if (keys?.length > 0) {
          res = await normalizeMessageItem(
            message_data,
            keys[keys.length - 1].key,
            message_data.channel_id
          );
        } else {
          res = null;
        }
      }
      if (res) {
        store.dispatch({
          type: actionTypes.RECEIVE_MESSAGE,
          payload: { data: res },
        });
      }
    });
    this.socket.on("ON_NEW_TASK", (data: any) => {
      if (!data) return;
      const user: any = store.getState()?.user;
      const { currentChannel } = user || {};
      store.dispatch({
        type: actionTypes.CREATE_TASK_SUCCESS,
        payload: {
          res: data,
          channelId:
            currentChannel?.user?.user_id === data?.assignee_id
              ? currentChannel?.channel_id
              : data?.channel?.[0]?.channel_id,
        },
      });
    });
    this.socket.on("ON_EDIT_MESSAGE", async (data: any) => {
      if (!data) return;
      const configs: any = store.getState()?.configs;
      const { channelPrivateKey } = configs;
      const user: any = store.getState()?.user;
      const { channel } = user;
      const channelNotification = channel.find(
        (c: any) => c.channel_id === data.channel_id
      );
      let res = data;
      if (channelNotification?.channel_type === "Private") {
        const keys = channelPrivateKey[data.channel_id];
        res = await normalizeMessageItem(
          data,
          keys[keys.length - 1].key,
          data.channel_id
        );
      }
      store.dispatch({
        type: actionTypes.EDIT_MESSAGE,
        payload: { data: res },
      });
    });
    this.socket.on("ON_UPDATE_TASK", (data: any) => {
      if (!data) return;
      const user: any = store.getState()?.user;
      const { currentChannel } = user || {};
      store.dispatch({
        type: actionTypes.UPDATE_TASK_REQUEST,
        payload: {
          taskId: data.task_id,
          data: {
            [data.updated_key]: data[data.updated_key],
            comment_count: data.comment_count,
          },
          channelId:
            currentChannel?.user?.direct_channel ||
            data?.channel?.[0]?.channel_id,
          channelUserId:
            data.updated_key === "assignee_id" &&
            currentChannel?.user?.direct_channel
              ? currentChannel?.user?.user_id
              : null,
        },
      });
    });
    this.socket.on("ON_ERROR", (data: any) => {
      toast.error(data);
    });
  }
  async changeTeam(teamId: string) {
    if (!this.socket) {
      await this.init(teamId);
      return;
    }
    this.emitOnline(teamId);
  }
  async emitOnline(teamId: string) {
    const deviceCode = await getDeviceCode();
    this.socket.emit("ONLINE", { team_id: teamId, device_code: deviceCode });
  }
  async emitReceivedKey(channelId: string, timestamp: number) {
    const deviceCode = await getDeviceCode();
    this.socket.emit("ON_CHANNEL_KEY_RECEIVED", {
      channel_id: channelId,
      device_code: deviceCode,
      timestamp,
    });
  }
  sendMessage = (message: {
    channel_id: string;
    content: string;
    plain_text: string;
    mentions?: Array<any>;
    message_id?: string;
    member_data?: Array<{ key: string; timestamp: number; user_id: string }>;
    parent_id?: string;
    text?: string;
  }) => {
    const user: any = store.getState()?.user;
    const messageData: any = store.getState()?.message?.messageData;
    const { userData } = user;
    const conversationData =
      messageData?.[message.channel_id]?.data
        ?.filter(
          (el: any) =>
            el.parent_id === message.parent_id ||
            el.message_id === message.parent_id
        )
        .map((el: any) => ({ ...el, conversation_data: null })) || [];
    if (conversationData.length > 0) {
      conversationData.unshift({ ...message, sender_id: userData.user_id });
    }
    store.dispatch({
      type: actionTypes.EMIT_NEW_MESSAGE,
      payload: {
        ...message,
        createdAt: new Date(),
        sender_id: userData.user_id,
        isSending: true,
        conversation_data: message.parent_id ? conversationData : [],
        content: message.text,
        plain_text: message.text,
      },
    });
    this.socket.emit("NEW_MESSAGE", message);
  };

  setTeamFromNotification = async (
    team: any,
    channelId: string,
    dispatch: any
  ) => {
    dispatch({
      type: actionTypes.CHANNEL_REQUEST,
    });
    const teamUsersRes = await api.getTeamUsers(team.team_id);
    let lastChannelId = null;
    if (channelId) {
      lastChannelId = channelId;
    } else {
      lastChannelId = getCookie(AsyncKey.lastChannelId);
    }
    const resChannel = await api.findChannel(team.team_id);
    if (teamUsersRes.statusCode === 200) {
      dispatch({
        type: actionTypes.GET_TEAM_USER,
        payload: { teamUsers: teamUsersRes.data, teamId: team.team_id },
      });
    }
    this.changeTeam(team.team_id);
    dispatch({
      type: actionTypes.SET_CURRENT_TEAM,
      payload: { team, resChannel, lastChannelId },
    });
    setCookie(AsyncKey.lastTeamId, team.team_id);
    const resGroupChannel = await api.getSpaceChannel(team.team_id);
    if (resGroupChannel.statusCode === 200) {
      dispatch({
        type: actionTypes.GROUP_CHANNEL,
        payload: resGroupChannel.data,
      });
    }
    if (resChannel.statusCode === 200) {
      if (resChannel.data.length > 0) {
        dispatch({
          type: actionTypes.CHANNEL_SUCCESS,
          payload: { channel: resChannel.data },
        });
      } else {
        dispatch({
          type: actionTypes.CHANNEL_FAIL,
        });
      }
    }
  };

  disconnect = () => {
    if (this.socket) {
      this.socket?.disconnect?.();
      this.socket = null;
    }
  };
  reconnectIfNeeded = () => {
    if (!this.socket?.connected) {
      this.socket?.connect?.();
    }
  };
}

export default new SocketUtil();
