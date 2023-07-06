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
  async () => {
    const res = await api.getPinnedCommunities();
    if (res.statusCode === 200) {
      return res.data || [];
    }
  }
);

export const setUserCommunityData = createAsyncThunk(
  "user/setCommunity",
  async (communityId: string) => {
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
  async (payload: { url?: string | null }) => {
    if (!payload.url) return null;
    const res = await api.getCommunityDataFromUrl(payload.url);
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
