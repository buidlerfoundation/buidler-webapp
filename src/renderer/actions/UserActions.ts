import { ActionCreator, Dispatch } from "redux";
import GlobalVariable from "renderer/services/GlobalVariable";
import { getSpaceBackgroundColor } from "renderer/helpers/SpaceHelper";
import api from "../api";
import ActionTypes from "./ActionTypes";
import { AsyncKey } from "../common/AppConfig";
import { getCookie, setCookie } from "../common/Cookie";
import ImageHelper from "../common/ImageHelper";
import SocketUtils from "../utils/SocketUtils";
import { Channel, Community, UserData } from "renderer/models";
import store from "renderer/store";

export const testActions = () => async (dispatch: Dispatch) => {
  dispatch({ type: "TEST_ACTION" });
};

export const getInitial: ActionCreator<any> =
  () => async (dispatch: Dispatch) => {
    const { data } = await api.getInitial();
    ImageHelper.initial(data?.img_domain || "", data?.img_config || "");
    if (data?.force_update && data?.version > GlobalVariable.version) {
      // Update Desktop App
    }
    dispatch({ type: ActionTypes.GET_INITIAL, payload: { data } });
  };

export const logout: ActionCreator<any> = () => (dispatch: Dispatch) => {
  SocketUtils.disconnect();
  dispatch({ type: ActionTypes.LOGOUT });
};

export const findUser = () => async (dispatch: Dispatch) => {
  dispatch({ type: ActionTypes.USER_REQUEST });
  const res = await api.findUser();
  if (res.statusCode === 200) {
    actionFetchWalletBalance(dispatch);
    dispatch({ type: ActionTypes.USER_SUCCESS, payload: { user: res.data } });
  } else {
    dispatch({ type: ActionTypes.USER_FAIL });
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
    dispatch({ type: ActionTypes.TEAM_REQUEST });
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
        const resSpace = await api.getSpaceChannel(teamId);
        if (resSpace.statusCode === 200) {
          dispatch({
            type: ActionTypes.GROUP_CHANNEL,
            payload: resSpace.data,
          });
        }
        const resChannel = await api.findChannel(teamId);
        const lastChannelId = await getCookie(AsyncKey.lastChannelId);
        const teamUsersRes = await api.getTeamUsers(currentTeam.team_id);
        if (teamUsersRes.statusCode === 200) {
          dispatch({
            type: ActionTypes.GET_TEAM_USER,
            payload: {
              teamUsers: teamUsersRes.data,
              teamId: currentTeam.team_id,
            },
          });
        }
        SocketUtils.init(currentTeam.team_id);
        const directChannelUser = teamUsersRes?.data?.find(
          (u: UserData) => u.direct_channel === lastChannelId
        );
        dispatch({
          type: ActionTypes.SET_CURRENT_TEAM,
          payload: {
            team: currentTeam,
            lastChannelId,
            directChannelUser,
            resChannel,
            teamUsersRes,
          },
        });
        if (resChannel.statusCode === 200) {
          const channels = resChannel.data || [];
          if (channels.length > 0) {
            dispatch({
              type: ActionTypes.CHANNEL_SUCCESS,
              payload: { channel: channels },
            });
          }
        } else {
          dispatch({
            type: ActionTypes.CHANNEL_FAIL,
          });
        }
      }
      dispatch({ type: ActionTypes.TEAM_SUCCESS, payload: { team: res.data } });
    } else {
      dispatch({ type: ActionTypes.TEAM_FAIL, payload: { message: res } });
      dispatch({
        type: ActionTypes.CHANNEL_FAIL,
      });
    }
  };

export const setCurrentChannel = (channel: any) => (dispatch: Dispatch) => {
  if (channel?.channel_id)
    setCookie(AsyncKey.lastChannelId, channel?.channel_id);
  dispatch({
    type: ActionTypes.SET_CURRENT_CHANNEL,
    payload: { channel },
  });
};

export const updateChannel =
  (channelId: string, body: any) => async (dispatch: Dispatch) => {
    dispatch({
      type: ActionTypes.UPDATE_CHANNEL_REQUEST,
      payload: { channelId, body },
    });
    const res = await api.updateChannel(channelId, body);
  };

export const deleteChannel =
  (channelId: string) => async (dispatch: Dispatch) => {
    dispatch({
      type: ActionTypes.DELETE_CHANNEL_PREFIX,
      payload: { channelId },
    });
    const res = await api.deleteChannel(channelId);
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
  dispatch({
    type: ActionTypes.CHANNEL_REQUEST,
  });
  const teamUsersRes = await api.getTeamUsers(team.team_id);
  let lastChannelId: any = null;
  const resChannel = await api.findChannel(team.team_id);
  const lastChannel = store.getState().user?.lastChannel?.[team.team_id];
  if (channelId) {
    lastChannelId = channelId;
  } else if (lastChannel) {
    lastChannelId = lastChannel.channel_id;
  } else {
    lastChannelId = resChannel.data?.[0]?.channel_id;
  }
  await setCookie(AsyncKey.lastChannelId, lastChannelId);
  if (teamUsersRes.statusCode === 200) {
    dispatch({
      type: ActionTypes.GET_TEAM_USER,
      payload: { teamUsers: teamUsersRes.data, teamId: team.team_id },
    });
  }
  SocketUtils.changeTeam(team.team_id);
  dispatch({
    type: ActionTypes.SET_CURRENT_TEAM,
    payload: { team, resChannel, lastChannelId, teamUsersRes },
  });
  setCookie(AsyncKey.lastTeamId, team.team_id);
  const resSpace = await api.getSpaceChannel(team.team_id);
  if (resSpace.statusCode === 200) {
    dispatch({
      type: ActionTypes.GROUP_CHANNEL,
      payload: resSpace.data,
    });
  }
  if (resChannel.statusCode === 200) {
    const channels = resChannel.data || [];
    if (channels.length > 0) {
      dispatch({
        type: ActionTypes.CHANNEL_SUCCESS,
        payload: {
          channel: channels.map((c: Channel) => {
            if (c.channel_id === lastChannelId) {
              c.seen = true;
            }
            return c;
          }),
        },
      });
    } else {
      dispatch({
        type: ActionTypes.CHANNEL_FAIL,
      });
    }
  }
  return { lastChannelId };
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
    if (res.statusCode === 200) {
      dispatch({
        type: ActionTypes.REMOVE_MEMBER_SUCCESS,
        payload: { teamId, userId },
      });
    } else {
      dispatch({
        type: ActionTypes.REMOVE_MEMBER_FAIL,
        payload: res,
      });
    }
  };

export const leaveTeam = (teamId: string) => async (dispatch: Dispatch) => {
  dispatch({
    type: ActionTypes.LEAVE_TEAM_REQUEST,
    payload: { teamId },
  });
  const res = await api.leaveTeam(teamId);
  if (res.statusCode === 200) {
    dispatch({
      type: ActionTypes.LEAVE_TEAM_SUCCESS,
      payload: { teamId },
    });
  } else {
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
  const dataUpdate = {
    ens_asset: userData?.ensAsset,
    nft_asset: userData?.nftAsset
      ? {
          address: userData?.nftAsset?.asset_contract_address,
          token_id: userData?.nftAsset?.token_id,
        }
      : null,
    username: userData?.userName,
    avatar_url: userData?.avatarUrl,
  };
  try {
    const res = await api.updateUser(dataUpdate);
    if (res.statusCode !== 200) {
      dispatch({ type: ActionTypes.UPDATE_USER_FAIL, message: res.message });
    }
  } catch (error) {
    dispatch({ type: ActionTypes.UPDATE_USER_FAIL, message: error });
  }
};

export const getSpaceMembers =
  (spaceId: string) => async (dispatch: Dispatch) => {
    dispatch({ type: ActionTypes.SPACE_MEMBER_REQUEST, payload: spaceId });
    const res = await api.getSpaceMembers(spaceId);
    if (res.statusCode === 200) {
      dispatch({ type: ActionTypes.SPACE_MEMBER_SUCCESS, payload: res });
    } else {
      dispatch({ type: ActionTypes.SPACE_MEMBER_FAIL, payload: res });
    }
  };

const actionFetchWalletBalance = async (dispatch: Dispatch) => {
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
