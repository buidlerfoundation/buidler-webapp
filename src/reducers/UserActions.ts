import { createAction, createAsyncThunk } from "@reduxjs/toolkit";
import api from "api";
import { AsyncKey } from "common/AppConfig";
import {
  getCookie,
  getLastChannelIdByCommunityId,
  setCookie,
} from "common/Cookie";
import { Channel, Community } from "models/Community";

export const getUserAction = createAsyncThunk("user/me", async () => {
  const res = await api.findUser();
  if (res.statusCode === 200) {
    return res.data;
  }
});

export const getCommunities = createAsyncThunk("user/community", async () => {
  const res = await api.getCommunities();
  if (res.statusCode === 200) {
    return res.data || [];
  }
});

export const getWalletBalance = createAsyncThunk("user/balance", async () => {
  const res = await api.fetchWalletBalance();
  if (res.statusCode === 200) {
    return res.data;
  }
});

export const getPinnedCommunities = createAsyncThunk(
  "user/pinned-community",
  async (payload?: { externalUrl?: string }) => {
    let externalUrlRes;
    if (payload?.externalUrl) {
      externalUrlRes = await api.getCommunityDataFromUrl(payload.externalUrl);
    }
    const res = await api.getPinnedCommunities();
    if (res.statusCode === 200) {
      return {
        pinnedCommunities: res.data || [],
        externalUrlRes,
      };
    }
  }
);

export const getExternalCommunityByChannelId = createAsyncThunk(
  "user/external-by-channel",
  async (payload: {
    channelId: string;
    fromExternal?: boolean;
    communityId?: string;
  }) => {
    const spaceRes = payload.communityId
      ? await api.getListChannel(payload.communityId)
      : null;
    const externalUrlRes = await api.getCommunityDataFromChannel(
      payload.channelId
    );
    return { externalUrlRes, spaceRes };
  }
);

export const setUserCommunityData = createAsyncThunk(
  "user/setCommunity",
  async (communityId: string, store) => {
    const state: any = store.getState();
    const { community, channel } = state?.user?.externalData || {};
    const [resChannel, teamUsersRes] = await Promise.all([
      api.getListChannel(communityId),
      api.getTeamUsers(communityId),
    ]);
    const channels: Channel[] = [];
    resChannel.data?.forEach((space) => {
      if (space.channels && space.channels?.length > 0) {
        channels.push(...space.channels);
      }
    });
    if (
      communityId === community?.community_id &&
      channel &&
      !channels.find((el) => el.channel_id === channel.channel_id)
    ) {
      channels.push(channel);
    }
    const initialSpace = resChannel.data?.find(
      (el) => el.channels && el.channels?.length > 0
    );
    let channelId = initialSpace?.channels?.[0]?.channel_id;

    const lastChannelIdByCommunityId = await getLastChannelIdByCommunityId(
      communityId
    );
    if (lastChannelIdByCommunityId) {
      channelId = lastChannelIdByCommunityId;
    }
    return {
      resChannel,
      teamUsersRes,
      communityId,
      channelId,
      channels,
    };
  }
);

export const getDataFromExternalUrl = createAsyncThunk(
  "user/external_url",
  async (payload: { url?: string | null; metadata?: any }) => {
    if (!payload.url) return null;
    const res = await api.getCommunityDataFromUrl(
      payload.url,
      payload.metadata
    );
    if (res.success) {
      return res.data;
    }
  }
);

export const openNewTabFromIframe = createAsyncThunk(
  "user/open-new-url",
  async (payload: { url?: string | null }) => {
    if (!payload.url) return null;
    const res = await api.getCommunityDataFromUrl(payload.url);
    if (res.success) {
      return res.data;
    }
  }
);

export const refreshTokenAction = createAsyncThunk("user/refresh", async () => {
  const token = await getCookie(AsyncKey.refreshTokenKey);
  try {
    const refreshTokenRes = await api.refreshToken(token);
    if (refreshTokenRes.success) {
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
    } else if (
      refreshTokenRes.message === "Failed to authenticate refresh token" ||
      refreshTokenRes.message === "Failed to authenticate token"
    ) {
      // GoogleAnalytics.tracking("Refresh failed", {
      //   refreshTokenExpire,
      //   message: refreshTokenRes.message || "Some thing wrong",
      // });
    }
    return refreshTokenRes;
  } catch (error: any) {
    const errMessage = error.message || error;
    // GoogleAnalytics.tracking("Refresh failed", {
    //   refreshTokenExpire,
    //   message: errMessage,
    // });
    return {
      success: false,
      message: errMessage,
    };
  }
});

export const updateUser = createAsyncThunk(
  "user/update",
  async (userData: any) => {
    const dataUpdate: any = {};
    if (userData.isUpdateENS && userData?.ensAsset) {
      dataUpdate.user_name_asset = {
        user_name: userData?.ensAsset?.value,
        token_id: userData?.ensAsset?.token_id,
        network: userData?.ensAsset?.network,
      };
    }
    if (!userData?.ensAsset && userData?.userName) {
      dataUpdate.user_name_asset = {
        user_name: userData?.userName,
      };
    }
    if (userData?.nftAsset) {
      dataUpdate.avatar_asset = {
        contract_address: userData?.nftAsset?.contract?.address,
        token_id: userData?.nftAsset?.token_id,
        network: userData?.nftAsset?.network,
      };
    }
    const res = await api.updateUser(dataUpdate);
    return res;
  }
);

export const acceptInvitation = createAsyncThunk(
  "user/accept-invitation",
  async (payload: { invitationId: string; ref?: string | null }) => {
    const { invitationId, ref } = payload;
    const res = await api.acceptInvitation(invitationId, ref);
    return res;
  }
);

export const pinCommunity = createAction<Community>("user/pin-community");

export const unPinCommunity = createAction<string>("user/un-pin-community");

export const getUserAssets = createAsyncThunk(
  "user/get-user-assets",
  async (payload: { userId: string }) => {
    const [resENS, resNFT] = await Promise.all([
      api.getUserAssets({
        userId: payload.userId,
        queryType: "namespace",
      }),
      api.getUserAssets({
        userId: payload.userId,
      }),
    ]);
    return {
      resENS,
      resNFT,
    };
  }
);
