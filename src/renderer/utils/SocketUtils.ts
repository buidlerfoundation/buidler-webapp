import toast from "react-hot-toast";
import { Dispatch } from "redux";
import {
  getChannelPrivateKey,
  getPrivateChannel,
  getRawPrivateChannel,
  normalizeMessageData,
  normalizeMessageItem,
  normalizePublicMessageData,
  storePrivateChannel,
} from "renderer/helpers/ChannelHelper";
import { io, Socket } from "socket.io-client";
import { uniqBy } from "lodash";
import { TransactionApiData, UserData } from "renderer/models";
import { utils } from "ethers";
import actionTypes from "renderer/actions/ActionTypes";
import AppConfig, { AsyncKey, LoginType } from "../common/AppConfig";
import {
  clearData,
  GeneratedPrivateKey,
  getCookie,
  getDeviceCode,
  removeCookie,
  setCookie,
} from "../common/Cookie";
import store from "../store";
import api from "../api";
import { createRefreshSelector } from "../reducers/selectors";
import GlobalVariable from "renderer/services/GlobalVariable";
import { dispatchChangeRoute } from "renderer/services/events/WindowEvent";
import {
  actionFetchWalletBalance,
  logout,
  refreshToken,
} from "renderer/actions/UserActions";
import { getTransactions } from "renderer/actions/TransactionActions";
import { formatTokenValue } from "renderer/helpers/TokenHelper";
import { normalizeUserName } from "renderer/helpers/MessageHelper";
import {
  getCurrentChannel,
  getCurrentCommunity,
  getPostId,
} from "renderer/helpers/StoreHelper";
import { getCollectibles } from "renderer/actions/CollectibleActions";
import { getPinPostMessages } from "renderer/actions/MessageActions";
import GoogleAnalytics from "renderer/services/analytics/GoogleAnalytics";

const getTasks = async (channelId: string, dispatch: Dispatch) => {
  dispatch({ type: actionTypes.TASK_REQUEST, payload: { channelId } });
  try {
    const taskRes = await api.getTasks(channelId);
    if (taskRes.statusCode === 200) {
      dispatch({
        type: actionTypes.TASK_SUCCESS,
        payload: {
          channelId,
          tasks: taskRes.data,
          total: taskRes.metadata?.total,
        },
      });
    } else {
      dispatch({
        type: actionTypes.TASK_FAIL,
        payload: { message: "Error", taskRes },
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
  const messageRes = await api.getMessages(channelId);
  if (messageRes?.statusCode === 200) {
    const isPrivate = channelType === "Private" || channelType === "Direct";
    const messageData = isPrivate
      ? await normalizeMessageData(messageRes.data || [], channelId)
      : normalizePublicMessageData(
          messageRes?.data || [],
          messageRes?.metadata?.encrypt_message_key
        );
    dispatch({
      type: actionTypes.MESSAGE_SUCCESS,
      payload: { data: messageData, channelId, reloadSocket: true },
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
    lastChannelId = await getCookie(AsyncKey.lastChannelId);
  }
  const resSpace = await api.getSpaceChannel(team.team_id);
  const resChannel = await api.findChannel(team.team_id);
  if (teamUsersRes.statusCode === 200) {
    dispatch({
      type: actionTypes.GET_TEAM_USER,
      payload: { teamUsers: teamUsersRes, teamId: team.team_id },
    });
  }
  const directChannelUser = teamUsersRes?.data?.find(
    (u: any) => u.direct_channel === lastChannelId
  );
  dispatch({
    type: actionTypes.CURRENT_TEAM_SUCCESS,
    payload: { team, resChannel, directChannelUser, lastChannelId, resSpace },
  });
  setCookie(AsyncKey.lastTeamId, team.team_id);
};

const loadMessageIfNeeded = async () => {
  const refreshSelector = createRefreshSelector([actionTypes.MESSAGE_PREFIX]);
  const currentChannel = getCurrentChannel();
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
      ? await normalizeMessageData(
          messageRes.data || [],
          currentChannel.channel_id
        )
      : normalizePublicMessageData(
          messageRes.data || [],
          messageRes.metadata?.encrypt_message_key
        );
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
  socket: Socket | null = null;
  firstLoad = true;
  connecting = false;
  async init(isRefresh = false) {
    if (!isRefresh) {
      this.firstLoad = true;
    }
    if (this.socket?.connected || this.connecting) return;
    this.connecting = true;
    const accessToken = await getCookie(AsyncKey.accessTokenKey);
    const deviceCode = await getDeviceCode();
    const generatedPrivateKey = await GeneratedPrivateKey();
    const publicKey = utils.computePublicKey(generatedPrivateKey, true);
    this.socket = io(`${AppConfig.apiBaseUrl}`, {
      query: {
        token: accessToken,
        device_code: deviceCode,
        encrypt_message_key: publicKey,
      },
      transports: ["websocket"],
      upgrade: false,
    });
    this.socket?.on("connect_error", async (err) => {
      this.connecting = false;
      const message = err.message || err;
      GoogleAnalytics.tracking("Socket error: ", { message: `${message}` });
      if (message === "Authentication error") {
        const res: any = await store.dispatch(refreshToken());
        if (!!res) {
          this.init(true);
        } else {
          clearData(() => {
            window.location.reload();
            store.dispatch(logout?.());
          });
        }
      }
    });
    this.socket?.on("connect", async () => {
      this.connecting = false;
      console.log("socket connected");
      const socketConnectKey = await getCookie(AsyncKey.socketConnectKey);
      if (!socketConnectKey) {
        setCookie(AsyncKey.socketConnectKey, true);
        if (publicKey) {
          store.dispatch({
            type: actionTypes.SET_PRIVATE_KEY,
            payload: generatedPrivateKey,
          });
        }
      }
      if (!this.firstLoad) {
        this.reloadData();
      }
      this.firstLoad = false;
      this.listenSocket();
      this.socket?.on("disconnect", (reason: string) => {
        this.connecting = false;
        console.log(`socket disconnect: ${reason}`);
        this.socket?.off("ON_NEW_MESSAGE");
        this.socket?.off("ON_NEW_TASK");
        this.socket?.off("ON_UPDATE_TASK");
        this.socket?.off("ON_ERROR");
        this.socket?.off("ON_EDIT_MESSAGE");
        this.socket?.off("ON_USER_ONLINE");
        this.socket?.off("ON_USER_OFFLINE");
        this.socket?.off("ON_DELETE_TASK");
        this.socket?.off("ON_DELETE_MESSAGE");
        this.socket?.off("ON_REACTION_ADDED");
        this.socket?.off("ON_REACTION_REMOVED");
        this.socket?.off("ON_NEW_USER_JOIN_TEAM");
        this.socket?.off("ON_CREATE_NEW_CHANNEL");
        this.socket?.off("ON_CREATE_NEW_SPACE");
        this.socket?.off("ON_ADD_NEW_MEMBER_TO_PRIVATE_CHANNEL");
        this.socket?.off("ON_REMOVE_NEW_MEMBER_FROM_PRIVATE_CHANNEL");
        this.socket?.off("ON_UPDATE_MEMBER_IN_PRIVATE_CHANNEL");
        this.socket?.off("ON_CHANNEL_KEY_SEND");
        this.socket?.off("ON_VERIFY_DEVICE_OTP_SEND");
        this.socket?.off("ON_SYNC_DATA_SEND");
        this.socket?.off("ON_UPDATE_CHANNEL");
        this.socket?.off("ON_DELETE_CHANNEL");
        this.socket?.off("ON_UPDATE_SPACE");
        this.socket?.off("ON_DELETE_SPACE");
        this.socket?.off("ON_USER_UPDATE_PROFILE");
        this.socket?.off("ON_ADD_USER_TO_SPACE");
        this.socket?.off("ON_REMOVE_USER_FROM_SPACE");
        this.socket?.off("ON_NEW_TRANSACTION");
        this.socket?.off("ON_REMOVE_USER_FROM_TEAM");
        this.socket?.off("ON_VIEW_MESSAGE_IN_CHANNEL");
        this.socket?.off("ON_USER_LEAVE_TEAM");
        this.socket?.off("ON_UPDATE_USER_PERMISSION");
        this.socket?.off("ON_ATTACHMENT_UPLOAD_SUCCESSFUL");
        this.socket?.off("ON_NEW_NOTIFICATION");
        this.socket?.off("ON_READ_NOTIFICATION_IN_POST");
        this.socket?.off("ON_UPDATE_NOTIFICATION_CONFIG");
        this.socket?.off("disconnect");
        if (reason === "io server disconnect") {
          this.socket?.connect();
        }
      });
      // this.emitOnline(teamId || store.getState().user?.currentTeamId);
    });
  }
  reloadData = async () => {
    const currentChannel = getCurrentChannel();
    const currentTeam = getCurrentCommunity();
    const postId = getPostId();
    if (!!currentTeam && !!currentChannel) {
      await actionSetCurrentTeam(
        currentTeam,
        store.dispatch,
        currentChannel.channel_id
      );
      // load pin post message
      if (postId) {
        store.dispatch(getPinPostMessages(postId));
      }
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
    this.socket?.on("ON_UPDATE_NOTIFICATION_CONFIG", (data) => {
      store.dispatch({
        type: actionTypes.UPDATE_NOTIFICATION_CONFIG,
        payload: data,
      });
    });
    this.socket?.on("ON_READ_NOTIFICATION_IN_POST", (data) => {
      const { userData } = store.getState().user;
      const currentChannel = getCurrentChannel();
      store.dispatch({
        type: actionTypes.UPDATE_TASK_REQUEST,
        payload: {
          taskId: data.task_id,
          data: { total_unread_notifications: 0 },
          channelId: currentChannel.channel_id,
        },
      });
      store.dispatch({
        type: actionTypes.UPDATE_USER_SUCCESS,
        payload: {
          user_id: userData.user_id,
          total_unread_notifications: data.total_unread_notifications,
        },
      });
    });
    this.socket?.on("ON_NEW_NOTIFICATION", (data) => {
      const { userData } = store.getState().user;
      if (data.post?.task_id) {
        const currentChannel = getCurrentChannel();
        store.dispatch({
          type: actionTypes.UPDATE_TASK_REQUEST,
          payload: {
            taskId: data.post?.task_id,
            data: { total_unread_notifications: 1 },
            channelId: currentChannel.channel_id,
          },
        });
      }
      store.dispatch({
        type: actionTypes.RECEIVE_NOTIFICATION,
        payload: data,
      });
      store.dispatch({
        type: actionTypes.UPDATE_USER_SUCCESS,
        payload: {
          user_id: userData.user_id,
          total_unread_notifications:
            (userData.total_unread_notifications || 0) + 1,
        },
      });
    });
    this.socket?.on("ON_ATTACHMENT_UPLOAD_SUCCESSFUL", (data) => {
      store.dispatch({
        type: actionTypes.UPLOAD_ATTACHMENT_SUCCESS,
        payload: data,
      });
    });
    this.socket?.on("ON_UPDATE_USER_PERMISSION", (data) => {
      const { user_id, role, team_id } = data;
      const { currentTeamId } = store.getState().user;
      if (team_id === currentTeamId) {
        store.dispatch({
          type: actionTypes.UPDATE_USER_SUCCESS,
          payload: { user_id, role },
        });
        store.dispatch({
          type: actionTypes.UPDATE_USER_PERMISSION,
          payload: data,
        });
      }
    });
    this.socket?.on("ON_VIEW_MESSAGE_IN_CHANNEL", (data) => {
      store.dispatch({
        type: actionTypes.MARK_SEEN_CHANNEL,
        payload: data,
      });
    });
    this.socket?.on("ON_USER_LEAVE_TEAM", (data) => {
      const { user_id, team_id } = data;
      const { userData, team, lastChannel, currentTeamId } =
        store.getState().user;
      if (team_id === currentTeamId && user_id === userData.user_id) {
        store.dispatch({
          type: actionTypes.LEAVE_TEAM_SUCCESS,
          payload: {
            teamId: team_id,
            userId: user_id,
          },
        });
        const nextTeam =
          currentTeamId === team_id
            ? team?.filter?.((el) => el.team_id !== currentTeamId)?.[0]
            : null;
        if (nextTeam) {
          const channelId = lastChannel?.[nextTeam.team_id]?.channel_id;
          if (channelId) {
            dispatchChangeRoute(`/channels/${nextTeam.team_id}/${channelId}`);
          } else {
            dispatchChangeRoute(`/channels/${nextTeam.team_id}`);
          }
        } else if (currentTeamId === team_id) {
          removeCookie(AsyncKey.lastTeamId);
          removeCookie(AsyncKey.lastChannelId);
          dispatchChangeRoute("/");
        }
      } else {
        store.dispatch({
          type: actionTypes.REMOVE_MEMBER_SUCCESS,
          payload: {
            teamId: team_id,
            userId: user_id,
          },
        });
      }
    });
    this.socket?.on("ON_REMOVE_USER_FROM_TEAM", (data) => {
      const { user_id, team_id } = data;
      const { userData, currentTeamId } = store.getState().user;
      if (team_id === currentTeamId && user_id === userData.user_id) {
        window.location.reload();
      } else {
        store.dispatch({
          type: actionTypes.REMOVE_MEMBER_SUCCESS,
          payload: {
            teamId: team_id,
            userId: user_id,
          },
        });
      }
    });
    this.socket?.on("ON_NEW_TRANSACTION", async (data: TransactionApiData) => {
      const userData = store.getState().user.userData;
      const address = utils.computeAddress(userData.user_id);
      const { hash, receipt_status, from, input, value, to } = data;
      const amount = formatTokenValue({ value: parseInt(value), decimal: 18 });
      const txType =
        address.toLowerCase() === from.toLowerCase() ? "sent" : "received";
      const txPrefix =
        address.toLowerCase() === from.toLowerCase()
          ? `to ${normalizeUserName(to, 7)}`
          : `from ${normalizeUserName(from, 7)}`;
      const toastData = {
        title: "",
        message: "",
        hash,
        type: "success",
      };

      if (receipt_status === "1") {
        if (input !== "0x") {
          toastData.title = "Success !";
          toastData.message = "Transaction complete.";
        } else if (from === to) {
          toastData.title = "Transaction self !";
          toastData.message = `You sent yourself ${amount} ETH`;
        } else {
          toastData.title = `Transaction ${txType} !`;
          toastData.message = `You ${txType} ${amount} ETH ${txPrefix}`;
        }
      }
      if (receipt_status === "0") {
        toastData.title = `Failed !`;
        toastData.message = `Transaction failed to complete. Please try again.`;
        toastData.type = "error";
      }
      store.dispatch({
        type: actionTypes.UPDATE_TRANSACTION_TOAST,
        payload: toastData,
      });
      store.dispatch(getTransactions(1));
      store.dispatch(getCollectibles());
      actionFetchWalletBalance(store.dispatch);
    });
    this.socket?.on(
      "ON_ADD_USER_TO_SPACE",
      async (data: { space_id: string }) => {
        const channelFromSpaceRes = await api.getChannelFromSpace(
          data.space_id
        );
        store.dispatch({
          type: actionTypes.ADD_USER_TO_SPACE,
          payload: {
            channelFromSpace: channelFromSpaceRes.data || [],
            space_id: data.space_id,
          },
        });
      }
    );
    this.socket?.on(
      "ON_REMOVE_USER_FROM_SPACE",
      (data: { space_id: string }) => {
        const { channelMap, currentTeamId } = store.getState().user;
        const currentChannel = getCurrentChannel();
        if (!currentChannel) return;
        const channel = channelMap[currentTeamId] || [];
        if (data.space_id === currentChannel.space_id) {
          const nextChannelId =
            channel?.filter((el) => el.channel_type !== "Direct")?.[0]
              ?.channel_id || "";
          dispatchChangeRoute(`/channels/${currentTeamId}/${nextChannelId}`);
        }
        store.dispatch({
          type: actionTypes.REMOVE_USER_FROM_SPACE,
          payload: {
            space_id: data.space_id,
          },
        });
      }
    );
    this.socket?.on("ON_USER_UPDATE_PROFILE", (data: UserData) => {
      store.dispatch({
        type: actionTypes.UPDATE_USER_SUCCESS,
        payload: data,
      });
    });
    this.socket?.on("ON_DELETE_SPACE", (data: any) => {
      store.dispatch({
        type: actionTypes.DELETE_GROUP_CHANNEL_SUCCESS,
        payload: { spaceId: data.space_id },
      });
    });
    this.socket?.on("ON_UPDATE_SPACE", (data: any) => {
      store.dispatch({
        type: actionTypes.UPDATE_GROUP_CHANNEL_SUCCESS,
        payload: data,
      });
    });
    this.socket?.on("ON_DELETE_CHANNEL", (data: any) => {
      store.dispatch({
        type: actionTypes.DELETE_CHANNEL_SUCCESS,
        payload: { channelId: data.channel_id },
      });
    });
    this.socket?.on("ON_UPDATE_CHANNEL", (data: any) => {
      store.dispatch({
        type: actionTypes.UPDATE_CHANNEL_SUCCESS,
        payload: { ...data, attachment: null },
      });
    });
    this.socket?.on("ON_SYNC_DATA_SEND", async (data: any) => {
      const dataKey = await getRawPrivateChannel();
      const deviceCode = await getDeviceCode();
      const res = await api.syncChannelKey({
        requested_device_code: data?.[0],
        channel_key_data: dataKey,
      });
      if (res.statusCode === 200) {
        this.socket?.emit("ON_SYNC_DATA_RECEIVED", {
          device_code: deviceCode,
          requested_device_code: data?.[0],
        });
      }
    });
    this.socket?.on("ON_VERIFY_DEVICE_OTP_SEND", async (data: any) => {
      const deviceCode = await getDeviceCode();
      if (Object.keys(data).length > 0) {
        store.dispatch({
          type: actionTypes.TOGGLE_OTP,
          payload: !Object.keys(data).find((el) => el === deviceCode)
            ? { otp: Object.values(data)?.[0], open: true }
            : { open: true },
        });
        if (!Object.keys(data).find((el) => el === deviceCode)) {
          this.socket?.emit("ON_VERIFY_DEVICE_OTP_RECEIVED", {
            device_code: deviceCode,
            requested_device_code: Object.keys(data)?.[0],
          });
        }
      }
    });
    this.socket?.on("ON_CHANNEL_KEY_SEND", async (data: any) => {
      const configs: any = store.getState()?.configs;
      const { privateKey } = configs;
      const current = await getCookie(AsyncKey.channelPrivateKey);
      let dataLocal: any = {};
      if (typeof current === "string") {
        dataLocal = JSON.parse(current);
      }
      const dataKeys = Object.keys(data);
      if (dataKeys.length === 0) {
        return null;
      }
      dataKeys.forEach((k) => {
        const arr = data[k];
        dataLocal[k] = uniqBy([...(dataLocal?.[k] || []), ...arr], "key");
        arr.forEach((el: any) => {
          const { timestamp } = el;
          this.emitReceivedKey(k, timestamp);
        });
      });
      await setCookie(AsyncKey.channelPrivateKey, JSON.stringify(dataLocal));
      const res = await getPrivateChannel(privateKey);
      store.dispatch({
        type: actionTypes.SET_CHANNEL_PRIVATE_KEY,
        payload: res,
      });
      loadMessageIfNeeded();
      return null;
    });
    this.socket?.on(
      "ON_UPDATE_MEMBER_IN_PRIVATE_CHANNEL",
      async (data: any) => {
        const user = store.getState()?.user;
        const { channel, key, timestamp } = data;
        if (user.currentTeamId === channel.team_id) {
          const isExistChannel = !!user.channelMap?.[user.currentTeamId]?.find(
            (el) => el.channel_id === channel.channel_id
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
      }
    );
    this.socket?.on("ON_CREATE_NEW_SPACE", (data: any) => {
      const user = store.getState()?.user;
      if (user?.currentTeamId === data?.team_id) {
        store.dispatch({
          type: actionTypes.CREATE_GROUP_CHANNEL_SUCCESS,
          payload: data,
        });
      }
    });
    this.socket?.on("ON_CREATE_NEW_CHANNEL", (data: any) => {
      const { channel, key, timestamp } = data;
      if (key && timestamp) {
        this.handleChannelPrivateKey(channel.channel_id, key, timestamp);
      }
      const user = store.getState()?.user;
      const { currentTeamId } = user;
      if (currentTeamId === channel.team_id) {
        store.dispatch({
          type: actionTypes.NEW_CHANNEL,
          payload: channel,
        });
      }
    });
    this.socket?.on("ON_ADD_NEW_MEMBER_TO_PRIVATE_CHANNEL", (data: any) => {
      const user = store.getState()?.user;
      const { currentTeamId, channelMap, userData } = user;
      const channel = channelMap?.[currentTeamId] || [];
      if (currentTeamId === data.team_id) {
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
    this.socket?.on(
      "ON_REMOVE_NEW_MEMBER_FROM_PRIVATE_CHANNEL",
      (data: any) => {
        const user = store.getState()?.user;
        const { currentTeamId, channelMap, userData } = user;
        const channel = channelMap?.[currentTeamId] || [];
        if (currentTeamId === data.team_id) {
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
      }
    );
    this.socket?.on("ON_NEW_USER_JOIN_TEAM", (data: any) => {
      const user = store.getState()?.user;
      const { currentTeamId } = user;
      if (currentTeamId === data.team.team_id) {
        store.dispatch({
          type: actionTypes.NEW_USER,
          payload: data.user,
        });
      }
    });
    this.socket?.on("ON_REACTION_ADDED", (data: any) => {
      const { attachment_id, emoji_id, user_id } = data.reaction_data;
      const userData = store.getState()?.user?.userData;
      store.dispatch({
        type: actionTypes.ADD_REACT,
        payload: {
          id: attachment_id,
          reactName: emoji_id,
          mine: userData.user_id === user_id,
        },
      });
    });
    this.socket?.on("ON_REACTION_REMOVED", (data: any) => {
      const { attachment_id, emoji_id, user_id } = data.reaction_data;
      const userData = store.getState()?.user?.userData;
      store.dispatch({
        type: actionTypes.REMOVE_REACT,
        payload: {
          id: attachment_id,
          reactName: emoji_id,
          mine: userData.user_id === user_id,
        },
      });
    });
    this.socket?.on("ON_USER_ONLINE", (data: any) => {
      store.dispatch({
        type: actionTypes.USER_ONLINE,
        payload: data,
      });
    });
    this.socket?.on("ON_USER_OFFLINE", (data: any) => {
      store.dispatch({
        type: actionTypes.USER_OFFLINE,
        payload: data,
      });
    });
    this.socket?.on("ON_DELETE_MESSAGE", (data: any) => {
      const currentChannel = getCurrentChannel();
      if (!currentChannel) return;
      store.dispatch({
        type: actionTypes.DELETE_MESSAGE,
        payload: {
          messageId: data.message_id,
          channelId: data.entity_id,
          parentId: data.parent_id,
          currentChannelId: currentChannel.channel_id,
          entityType: data.entity_type,
        },
      });
    });
    this.socket?.on("ON_DELETE_TASK", (data: any) => {
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
    this.socket?.on("ON_USER_OFFLINE", (data: any) => {});
    this.socket?.on("ON_NEW_MESSAGE", async (data: any) => {
      const { message_data, notification_data } = data;
      const { notification_type } = notification_data;
      const configs: any = store.getState()?.configs;
      const { channelPrivateKey } = configs;
      const user = store.getState()?.user;
      const { userData, teamUserMap, channelMap, currentTeamId } = user;
      const currentChannel = getCurrentChannel();
      if (!currentChannel) return;
      const channel = channelMap?.[currentTeamId] || [];
      const teamUserData = teamUserMap?.[currentTeamId]?.data || [];
      const messageData: any = store.getState()?.message.messageData;
      const channelNotification = channel.find(
        (c) => c.channel_id === message_data.entity_id
      );
      if (currentChannel.channel_id === message_data.entity_id) {
        this.emitSeenChannel(message_data.message_id, message_data.entity_id);
      }
      if (userData?.user_id !== notification_data?.sender_data?.user_id) {
        if (notification_type !== "Muted") {
          if (currentChannel.channel_id !== message_data.entity_id) {
            store.dispatch({
              type: actionTypes.MARK_UN_SEEN_CHANNEL,
              payload: {
                channelId: message_data.entity_id,
                communityId: notification_data.team_id,
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
        if (currentChannel.channel_id === message_data.entity_id) {
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
        message_data.entity_type !== "post" &&
        (!channelNotification ||
          channelNotification?.channel_type === "Private" ||
          channelNotification?.channel_type === "Direct")
      ) {
        const keys = channelPrivateKey[message_data.entity_id];
        if (keys?.length > 0) {
          res = await normalizeMessageItem(
            message_data,
            keys[keys.length - 1].key,
            message_data.entity_id
          );
        } else {
          res = null;
        }
      }
      if (res) {
        store.dispatch({
          type: actionTypes.RECEIVE_MESSAGE,
          payload: { data: res, currentChannelId: currentChannel.channel_id },
        });
      }
    });
    this.socket?.on("ON_NEW_TASK", (data: any) => {
      if (!data) return;
      store.dispatch({
        type: actionTypes.CREATE_TASK_SUCCESS,
        payload: {
          res: data,
          channelId: data?.channels?.[0]?.channel_id,
        },
      });
    });
    this.socket?.on("ON_EDIT_MESSAGE", async (data: any) => {
      if (!data) return;
      const configs: any = store.getState()?.configs;
      const { channelPrivateKey } = configs;
      const user = store.getState()?.user;
      const { channelMap, currentTeamId } = user;
      const channel = channelMap?.[currentTeamId] || [];
      const channelNotification = channel.find(
        (c: any) => c.channel_id === data.entity_id
      );
      let res = data;
      if (channelNotification?.channel_type === "Private") {
        const keys = channelPrivateKey[data.entity_id];
        if (keys?.length > 0) {
          res = await normalizeMessageItem(
            data,
            keys[keys.length - 1].key,
            data.entity_id
          );
        }
      }
      store.dispatch({
        type: actionTypes.EDIT_MESSAGE,
        payload: { data: res },
      });
    });
    this.socket?.on("ON_UPDATE_TASK", (data: any) => {
      if (!data) return;
      const currentChannel = getCurrentChannel();
      if (!currentChannel) return;
      store.dispatch({
        type: actionTypes.UPDATE_TASK_REQUEST,
        payload: {
          taskId: data.task_id,
          data,
          channelId:
            currentChannel.channel_id || data?.channels?.[0]?.channel_id,
        },
      });
    });
    this.socket?.on("ON_ERROR", (data: any) => {
      toast.error(data);
    });
  }
  async changeTeam(teamId: string) {
    if (!this.socket) {
      await this.init();
    }
    // this.emitOnline(teamId);
  }
  emitSeenPost(postId: string) {
    this.socket?.emit?.("ON_READ_NOTIFICATION_IN_POST", {
      task_id: postId,
    });
  }
  emitSeenChannel(messageId: string | undefined, channelId: string) {
    if (!messageId) return;
    this.socket?.emit?.("ON_VIEW_MESSAGE_IN_CHANNEL", {
      message_id: messageId,
      channel_id: channelId,
    });
  }
  async emitOnline(teamId?: string) {
    const deviceCode = await getDeviceCode();
    const generatedPrivateKey = await GeneratedPrivateKey();
    const loginType =
      (await getCookie(AsyncKey.loginType)) || GlobalVariable.loginType;
    if (
      loginType === LoginType.WalletConnect ||
      loginType === LoginType.Metamask
    ) {
      const publicKey = utils.computePublicKey(generatedPrivateKey, true);
      store.dispatch({
        type: actionTypes.SET_PRIVATE_KEY,
        payload: generatedPrivateKey,
      });
      this.socket?.emit("ONLINE", {
        team_id: teamId,
        device_code: deviceCode,
        encrypt_message_key: publicKey,
      });
    } else {
      this.socket?.emit("ONLINE", { team_id: teamId, device_code: deviceCode });
    }
  }
  async emitReceivedKey(channelId: string, timestamp: number) {
    const deviceCode = await getDeviceCode();
    this.socket?.emit("ON_CHANNEL_KEY_RECEIVED", {
      channel_id: channelId,
      device_code: deviceCode,
      timestamp,
    });
  }
  sendMessage = (message: {
    entity_id: string;
    content: string;
    plain_text: string;
    mentions?: Array<any>;
    message_id?: string;
    member_data?: Array<{ key: string; timestamp: number; user_id: string }>;
    reply_message_id?: string;
    text?: string;
    entity_type?: string;
    file_ids?: string[];
  }) => {
    const user: any = store.getState()?.user;
    const messageData: any = store.getState()?.message?.messageData;
    const { userData } = user;
    const conversationData = messageData?.[message.entity_id]?.data?.find(
      (el) => el.message_id === message.reply_message_id
    );
    store.dispatch({
      type: actionTypes.EMIT_NEW_MESSAGE,
      payload: {
        ...message,
        createdAt: new Date(),
        sender_id: userData.user_id,
        isSending: true,
        conversation_data: message.reply_message_id ? conversationData : null,
        content: message.text,
        plain_text: message.text,
      },
    });
    this.socket?.emit("NEW_MESSAGE", message);
  };

  disconnect = () => {
    if (this.socket) {
      this.socket?.disconnect?.();
      this.socket = null;
    }
  };
  reconnectIfNeeded = () => {
    if (!this.socket?.connected && !this.connecting) {
      this.socket?.connect?.();
    }
  };
}

export default new SocketUtil();
