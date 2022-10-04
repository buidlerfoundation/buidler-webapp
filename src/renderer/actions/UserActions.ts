import { ActionCreator, Dispatch } from "redux";
import GlobalVariable from "renderer/services/GlobalVariable";
import { getSpaceBackgroundColor } from "renderer/helpers/SpaceHelper";
import api from "../api";
import ActionTypes from "./ActionTypes";
import { AsyncKey, UserRole } from "../common/AppConfig";
import { getCookie, removeCookie, setCookie } from "../common/Cookie";
import ImageHelper from "../common/ImageHelper";
import SocketUtils from "../utils/SocketUtils";
import { Community, UserData, UserRoleType } from "renderer/models";
import store from "renderer/store";

export const getInitial: ActionCreator<any> =
  () => async (dispatch: Dispatch) => {
    const { data } = (await api.getInitial()) || {};
    ImageHelper.initial(data?.img_domain || "", data?.img_config || "");
    if (data?.force_update && data?.version > GlobalVariable.version) {
      // Update Desktop App
    }
    if (data) {
      dispatch({ type: ActionTypes.GET_INITIAL, payload: { data } });
    }
  };

export const logout: ActionCreator<any> = () => (dispatch: Dispatch) => {
  SocketUtils.disconnect();
  dispatch({ type: ActionTypes.LOGOUT });
};

export const refreshToken = () => async (dispatch: Dispatch) => {
  dispatch({ type: ActionTypes.REFRESH_TOKEN_REQUEST });
  try {
    const refreshTokenExpire = await getCookie(AsyncKey.refreshTokenExpire);
    const refreshToken = await getCookie(AsyncKey.refreshTokenKey);
    if (
      !refreshTokenExpire ||
      !refreshToken ||
      new Date().getTime() / 1000 > refreshTokenExpire
    ) {
      return false;
    }
    const refreshTokenRes = await api.refreshToken(refreshToken);
    if (refreshTokenRes.success) {
      dispatch({
        type: ActionTypes.UPDATE_CURRENT_TOKEN,
        payload: refreshTokenRes?.data?.token,
      });
      await setCookie(AsyncKey.accessTokenKey, refreshTokenRes?.data?.token);
      await setCookie(
        AsyncKey.refreshTokenKey,
        refreshTokenRes?.data?.refresh_token
      );
      await setCookie(
        AsyncKey.tokenExpire,
        refreshTokenRes?.data?.token_expire_at
      );
      await setCookie(
        AsyncKey.refreshTokenExpire,
        refreshTokenRes?.data?.refresh_token_expire_at
      );
    } else {
      dispatch({
        type: ActionTypes.REFRESH_TOKEN_FAIL,
        payload: refreshTokenRes,
      });
    }
    return refreshTokenRes.success;
  } catch (error) {
    dispatch({ type: ActionTypes.REFRESH_TOKEN_FAIL, payload: error });
    return false;
  }
};

export const getMemberData =
  (teamId: string, role: UserRoleType, page: number) =>
  async (dispatch: Dispatch) => {
    if (page > 1) {
      dispatch({
        type: ActionTypes.MEMBER_DATA_MORE,
        payload: { teamId, role, page },
      });
    } else {
      dispatch({
        type: ActionTypes.MEMBER_DATA_REQUEST,
        payload: { teamId, role, page },
      });
    }
    const roles = role === UserRole.Member ? Object.values(UserRole) : [role];
    const res = await api.getMembersByRole(teamId, roles, { page });
    if (res.success) {
      dispatch({
        type: ActionTypes.MEMBER_DATA_SUCCESS,
        payload: { role, page, data: res.data, total: res.metadata?.total },
      });
    } else {
      dispatch({
        type: ActionTypes.MEMBER_DATA_FAIL,
        payload: res,
      });
    }
  };

export const acceptTeam =
  (invitationId: string) => async (dispatch: Dispatch) => {
    const res = await api.acceptInvitation(invitationId);
    if (res.statusCode === 200) {
      dispatch({
        type: ActionTypes.ACCEPT_TEAM_SUCCESS,
        payload: res.data,
      });
    }
    return res;
  };

export const clearLastChannel: ActionCreator<any> =
  (communityId: string) => (dispatch: Dispatch) => {
    removeCookie(AsyncKey.lastChannelId);
    dispatch({
      type: ActionTypes.CLEAR_LAST_CHANNEL,
      payload: { communityId },
    });
  };

export const findUser = () => async (dispatch: Dispatch) => {
  dispatch({ type: ActionTypes.USER_REQUEST });
  const res = await api.findUser();
  if (res.statusCode === 200) {
    actionFetchWalletBalance(dispatch);
    dispatch({ type: ActionTypes.USER_SUCCESS, payload: { user: res.data } });
  } else {
    dispatch({ type: ActionTypes.USER_FAIL, payload: res });
  }
  return res.statusCode === 200;
};

export const dragChannel =
  (channelId: string, groupId: string) => async (dispatch: Dispatch) => {
    const res = await api.updateChannel(channelId, {
      group_channel_id: groupId,
    });
    if (res.statusCode === 200) {
      dispatch({
        type: ActionTypes.UPDATE_GROUP_CHANNEL,
        payload: { channelId, groupId },
      });
    }
  };

export const findTeamAndChannel =
  (initCommunityId?: string) => async (dispatch: Dispatch) => {
    dispatch({ type: ActionTypes.TEAM_REQUEST, payload: { initCommunityId } });
    const res = await api.findTeam();
    let lastTeamId = "";
    if (initCommunityId && initCommunityId !== "user") {
      lastTeamId = initCommunityId;
    } else {
      lastTeamId = await getCookie(AsyncKey.lastTeamId);
    }
    if (res.statusCode === 200) {
      const communities = res.data || [];
      if (communities.length > 0) {
        const currentTeam =
          communities.find((t: Community) => t.team_id === lastTeamId) ||
          communities[0];
        const teamId = currentTeam.team_id;
        const lastChannelId = await getCookie(AsyncKey.lastChannelId);
        const [resSpace, resChannel, teamUsersRes] = await Promise.all([
          api.getSpaceChannel(teamId),
          api.findChannel(teamId),
          api.getTeamUsers(teamId),
        ]);
        if (teamUsersRes.statusCode === 200) {
          dispatch({
            type: ActionTypes.GET_TEAM_USER,
            payload: {
              teamUsers: teamUsersRes,
              teamId,
            },
          });
        }
        SocketUtils.init(currentTeam.team_id);
        const directChannelUser = teamUsersRes?.data?.find(
          (u: UserData) => u.direct_channel === lastChannelId
        );
        dispatch({
          type: ActionTypes.CURRENT_TEAM_SUCCESS,
          payload: {
            team: currentTeam,
            lastChannelId,
            directChannelUser,
            resChannel,
            teamUsersRes,
            resSpace,
          },
        });
      } else {
        SocketUtils.init();
      }
      dispatch({ type: ActionTypes.TEAM_SUCCESS, payload: { team: res.data } });
    } else {
      dispatch({ type: ActionTypes.TEAM_FAIL, payload: { message: res } });
      dispatch({
        type: ActionTypes.CHANNEL_FAIL,
      });
    }
  };

export const setCurrentChannel =
  (channel: any, communityId?: string) => (dispatch: Dispatch) => {
    if (channel?.channel_id)
      setCookie(AsyncKey.lastChannelId, channel?.channel_id);
    dispatch({
      type: ActionTypes.SET_CURRENT_CHANNEL,
      payload: { channel, communityId },
    });
  };

export const updateChannel =
  (channelId: string, body: any) => async (dispatch: Dispatch) => {
    dispatch({
      type: ActionTypes.UPDATE_CHANNEL_REQUEST,
      payload: { channelId, body },
    });
    const res = await api.updateChannel(channelId, body);
    return res.statusCode === 200;
  };

export const deleteChannel =
  (channelId: string, communityId: string) => async (dispatch: Dispatch) => {
    dispatch({
      type: ActionTypes.DELETE_CHANNEL_REQUEST,
      payload: { channelId, communityId },
    });
    removeCookie(AsyncKey.lastChannelId);
    const res = await api.deleteChannel(channelId);
    return res.statusCode === 200;
  };

export const createNewChannel =
  (teamId: string, body: any, groupName: string) =>
  async (dispatch: Dispatch) => {
    dispatch({
      type: ActionTypes.CREATE_CHANNEL_REQUEST,
      payload: { teamId, body },
    });
    const res = await api.createChannel(teamId, body);
    if (res.statusCode === 200) {
      dispatch({
        type: ActionTypes.CREATE_CHANNEL_SUCCESS,
        payload: {
          ...res.data,
          group_channel: {
            group_channel_name: groupName,
          },
        },
      });
    } else {
      dispatch({
        type: ActionTypes.CREATE_CHANNEL_FAIL,
        payload: res,
      });
    }
    return res.data;
  };

const actionSetCurrentTeam = async (
  team: any,
  dispatch: Dispatch,
  channelId?: string
) => {
  const lastController = store.getState().user?.apiTeamController;
  lastController?.abort?.();
  const controller = new AbortController();
  dispatch({
    type: ActionTypes.CURRENT_TEAM_REQUEST,
    payload: { controller },
  });
  try {
    const teamUsersRes = await api.getTeamUsers(team.team_id, controller);
    let lastChannelId: any = null;
    const resSpace = await api.getSpaceChannel(team.team_id, controller);
    const resChannel = await api.findChannel(team.team_id, controller);
    const lastChannel = store.getState().user?.lastChannel?.[team.team_id];
    if (channelId) {
      lastChannelId = channelId;
    } else if (lastChannel) {
      lastChannelId = lastChannel.channel_id;
    } else {
      lastChannelId = resChannel.data?.find(
        (el) => el.channel_type !== "Direct"
      )?.[0]?.channel_id;
    }
    await setCookie(AsyncKey.lastChannelId, lastChannelId);
    if (teamUsersRes.statusCode === 200) {
      dispatch({
        type: ActionTypes.GET_TEAM_USER,
        payload: { teamUsers: teamUsersRes, teamId: team.team_id },
      });
    }
    SocketUtils.changeTeam(team.team_id);
    dispatch({
      type: ActionTypes.CURRENT_TEAM_SUCCESS,
      payload: { team, resChannel, lastChannelId, teamUsersRes, resSpace },
    });
    setCookie(AsyncKey.lastTeamId, team.team_id);
  } catch (error) {
    dispatch({
      type: ActionTypes.CURRENT_TEAM_FAIL,
      payload: { message: error },
    });
  }
};

export const setCurrentTeam =
  (team: any, channelId?: string) => async (dispatch: Dispatch) =>
    actionSetCurrentTeam(team, dispatch, channelId);

export const deleteSpaceChannel =
  (spaceId: string) => async (dispatch: Dispatch) => {
    dispatch({
      type: ActionTypes.DELETE_GROUP_CHANNEL_REQUEST,
      payload: { spaceId },
    });
    const res = await api.deleteSpaceChannel(spaceId);
    return res.statusCode === 200;
  };

export const uploadChannelAvatar =
  (teamId: string, channelId: string, file: any) =>
  async (dispatch: Dispatch) => {
    const attachment = {
      file: URL.createObjectURL(file),
      loading: true,
      type: file.type,
    };
    dispatch({
      type: ActionTypes.UPDATE_CHANNEL_AVATAR_REQUEST,
      payload: { channelId, attachment },
    });
    const fileRes = await api.uploadFile(teamId, channelId, file);
    if (fileRes.statusCode === 200) {
      await api.updateChannel(channelId, {
        channel_emoji: "",
        channel_image_url: fileRes.data?.file_url,
      });
    } else {
      dispatch({
        type: ActionTypes.UPDATE_CHANNEL_AVATAR_FAIL,
        payload: { message: fileRes.message, channelId },
      });
    }
  };

export const uploadSpaceAvatar =
  (teamId: string, spaceId: string, file: any) =>
  async (dispatch: Dispatch) => {
    const attachment = {
      file: URL.createObjectURL(file),
      loading: true,
      type: file.type,
    };
    dispatch({
      type: ActionTypes.UPDATE_SPACE_AVATAR_REQUEST,
      payload: { spaceId, attachment },
    });
    const fileRes = await api.uploadFile(teamId, spaceId, file);
    if (fileRes.statusCode === 200) {
      const url = ImageHelper.normalizeImage(
        fileRes.data?.file_url || "",
        teamId
      );
      const colorAverage = await getSpaceBackgroundColor(url);
      await api.updateSpaceChannel(spaceId, {
        space_emoji: "",
        space_image_url: fileRes.data?.file_url,
        space_background_color: colorAverage,
      });
    } else {
      dispatch({
        type: ActionTypes.UPDATE_SPACE_AVATAR_FAIL,
        payload: { message: fileRes.message, spaceId },
      });
    }
  };

export const updateSpaceChannel =
  (spaceId: string, body: any) => async (dispatch: Dispatch) => {
    dispatch({
      type: ActionTypes.UPDATE_GROUP_CHANNEL_REQUEST,
      payload: { spaceId, body },
    });
    const res = await api.updateSpaceChannel(spaceId, body);
    return res.statusCode === 200;
  };

export const createSpaceChannel =
  (teamId: string, body: any) => async (dispatch: Dispatch) => {
    dispatch({
      type: ActionTypes.CREATE_GROUP_CHANNEL_REQUEST,
      payload: { teamId, body },
    });
    const res = await api.createSpaceChannel(teamId, body);
    if (res.statusCode !== 200) {
      dispatch({
        type: ActionTypes.CREATE_GROUP_CHANNEL_FAIL,
        payload: res,
      });
    }
    return res.statusCode === 200;
  };

export const createTeam = (body: any) => async (dispatch: Dispatch) => {
  dispatch({
    type: ActionTypes.CREATE_TEAM_REQUEST,
    payload: { body },
  });
  const res = await api.createTeam(body);
  if (res.statusCode === 200) {
    dispatch({
      type: ActionTypes.CREATE_TEAM_SUCCESS,
      payload: res,
    });
  } else {
    dispatch({
      type: ActionTypes.CREATE_TEAM_FAIL,
      payload: res,
    });
  }
  return res;
};

export const removeTeamMember =
  (teamId: string, userId: string) => async (dispatch: Dispatch) => {
    dispatch({
      type: ActionTypes.REMOVE_MEMBER_REQUEST,
      payload: { teamId, userId },
    });
    const res = await api.removeTeamMember(teamId, userId);
    if (res.statusCode !== 200) {
      dispatch({
        type: ActionTypes.REMOVE_MEMBER_FAIL,
        payload: res,
      });
    }
    return res.statusCode === 200;
  };

export const leaveTeam = (teamId: string) => async (dispatch: Dispatch) => {
  dispatch({
    type: ActionTypes.LEAVE_TEAM_REQUEST,
    payload: { teamId },
  });
  const res = await api.leaveTeam(teamId);
  if (res.statusCode !== 200) {
    dispatch({
      type: ActionTypes.LEAVE_TEAM_FAIL,
      payload: res,
    });
  }
  return res.statusCode === 200;
};

export const updateUserChannel =
  (channels: Array<any>) => async (dispatch: Dispatch) => {
    dispatch({
      type: ActionTypes.USER_CHANNEL_REQUEST,
      payload: { channels },
    });
    const res = await api.updateUserChannel(
      channels.map((el) => el.channel_id)
    );
    if (res.statusCode === 200) {
      dispatch({
        type: ActionTypes.USER_CHANNEL_SUCCESS,
        payload: { channels },
      });
    } else {
      dispatch({
        type: ActionTypes.USER_CHANNEL_FAIL,
        payload: res,
      });
    }
    return res.statusCode === 200;
  };

export const updateTeam =
  (teamId: string, body: any) => async (dispatch: Dispatch) => {
    dispatch({
      type: ActionTypes.UPDATE_TEAM_REQUEST,
      payload: { teamId, body },
    });
    const res = await api.updateTeam(teamId, body);
    if (res.statusCode === 200) {
      dispatch({
        type: ActionTypes.UPDATE_TEAM_SUCCESS,
        payload: { teamId, body, res },
      });
    } else {
      dispatch({
        type: ActionTypes.UPDATE_TEAM_FAIL,
        payload: res,
      });
    }
    return res.statusCode === 200;
  };

export const deleteTeam = (teamId: string) => async (dispatch: Dispatch) => {
  dispatch({
    type: ActionTypes.DELETE_TEAM_REQUEST,
    payload: { teamId },
  });
  const res = await api.removeTeam(teamId);
  if (res.statusCode === 200) {
    dispatch({
      type: ActionTypes.DELETE_TEAM_SUCCESS,
      payload: { teamId, res },
    });
  } else {
    dispatch({
      type: ActionTypes.DELETE_TEAM_FAIL,
      payload: res,
    });
  }
  return res.statusCode === 200;
};

export const updateUser = (userData: any) => async (dispatch: Dispatch) => {
  dispatch({ type: ActionTypes.UPDATE_USER_REQUEST, payload: userData });
  const dataUpdate: any = {};
  if (userData.isUpdateENS && userData?.ensAsset) {
    dataUpdate.ens_asset = {
      contract_address: userData?.ensAsset?.contract_address,
      token_id: userData?.ensAsset?.token_id,
      network: userData?.ensAsset?.network,
    };
  }
  if (!userData?.ensAsset && userData?.userName) {
    dataUpdate.username = userData?.userName;
  }
  if (userData?.nftAsset) {
    dataUpdate.nft_asset = {
      contract_address: userData?.nftAsset?.contract_address,
      token_id: userData?.nftAsset?.token_id,
      network: userData?.nftAsset?.network,
    };
  }
  try {
    const res = await api.updateUser(dataUpdate);
    if (res.statusCode !== 200) {
      dispatch({ type: ActionTypes.UPDATE_USER_FAIL, message: res.message });
    }
    return res.statusCode === 200;
  } catch (error) {
    dispatch({ type: ActionTypes.UPDATE_USER_FAIL, message: error });
    return false;
  }
};

export const getSpaceMembers =
  (spaceId: string) => async (dispatch: Dispatch) => {
    const { apiSpaceMemberController } = store.getState().user;
    apiSpaceMemberController?.abort?.();
    const controller = new AbortController();
    dispatch({
      type: ActionTypes.SPACE_MEMBER_REQUEST,
      payload: { spaceId, controller },
    });
    try {
      const res = await api.getSpaceMembers(spaceId, controller);
      if (res.statusCode === 200) {
        dispatch({ type: ActionTypes.SPACE_MEMBER_SUCCESS, payload: res });
      } else {
        dispatch({ type: ActionTypes.SPACE_MEMBER_FAIL, payload: res });
      }
    } catch (error) {
      dispatch({ type: ActionTypes.SPACE_MEMBER_FAIL, payload: error });
    }
  };

export const actionFetchWalletBalance = async (dispatch: Dispatch) => {
  dispatch({ type: ActionTypes.WALLET_BALANCE_REQUEST });
  try {
    const res = await api.fetchWalletBalance();
    if (res.statusCode === 200) {
      dispatch({ type: ActionTypes.WALLET_BALANCE_SUCCESS, payload: res.data });
    } else {
      dispatch({
        type: ActionTypes.WALLET_BALANCE_FAIL,
        payload: { message: res.message },
      });
    }
  } catch (error: any) {
    dispatch({
      type: ActionTypes.WALLET_BALANCE_FAIL,
      payload: { message: error.message },
    });
  }
};

export const fetchWalletBalance = () => async (dispatch: Dispatch) =>
  actionFetchWalletBalance(dispatch);
