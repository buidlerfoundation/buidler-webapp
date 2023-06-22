import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import api from "api";
import { AsyncKey } from "common/AppConfig";
import {
  getCookie,
  getLastChannelIdByCommunityId,
  setCookie,
} from "common/Cookie";
import { Channel, Community, Space } from "models/Community";
import { BalanceApiData, InitialApiData, UserData } from "models/User";
import { logoutAction } from "./UserActions";

interface UserState {
  data: UserData;
  imgDomain?: string;
  imgBucket?: string;
  currentToken?: string;
  communities?: Community[];
  globalChannelMap?: { [key: string]: Channel[] };
  spaceMap: { [key: string]: Space[] };
  teamUserMap: {
    [key: string]: {
      data: UserData[];
      total: number;
    };
  };
  loadingCommunityData?: boolean;
  walletBalance?: BalanceApiData | null;
}

const initialState: UserState = {
  data: {
    avatar_url: "",
    user_id: "",
    user_name: "",
    user_addresses: [],
  },
  imgDomain: "",
  imgBucket: "",
  globalChannelMap: {},
  spaceMap: {},
  teamUserMap: {},
  loadingCommunityData: false,
  currentToken: "",
};

export const getUserAction = createAsyncThunk("user/me", async () => {
  const res = await api.findUser();
  if (res.statusCode === 200) {
    return res.data;
  }
});

export const getWalletBalance = createAsyncThunk("user/balance", async () => {
  const res = await api.fetchWalletBalance();
  if (res.statusCode === 200) {
    return res.data;
  }
});

export const getUserCommunity = createAsyncThunk("user/community", async () => {
  const res = await api.findTeam();
  if (res.statusCode === 200) {
    // const communitiesWithDM = res.data || [];
    // const communities = communitiesWithDM.filter(
    //   (el) => el.community_id !== DirectCommunity.community_id
    // );
    // const DM = communitiesWithDM.find(
    //   (el) => el.community_id === DirectCommunity.community_id
    // );
    // communities.unshift({ ...DirectCommunity, seen: DM?.seen });
    return res.data || [];
  }
});

export const setUserCommunityData = createAsyncThunk(
  "user/setCommunity",
  async (communityId: string) => {
    const [resChannel, teamUsersRes] = await Promise.all([
      api.getListChannel(communityId),
      api.getTeamUsers(communityId),
    ]);
    const channels = resChannel.data?.global_channels || []
    resChannel.data?.spaces?.forEach(space => {
      if (space.channels && space.channels?.length > 0) {
        channels.push(...space.channels)
      }
    })
    const initialSpace = resChannel.data?.spaces?.find(
      (el) => el.channels && el.channels?.length > 0
    );
    let channelId =
      initialSpace?.channels?.[0]?.channel_id ||
      resChannel.data?.global_channels?.[0]?.channel_id;
    
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

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    initial: (
      state: UserState,
      action: PayloadAction<InitialApiData | undefined>
    ) => {
      state.imgBucket = action.payload?.imgproxy.bucket_name;
      state.imgDomain = action.payload?.imgproxy.domain;
    },
    updateCurrentToken: (state: UserState, action: PayloadAction<string>) => {
      state.currentToken = action.payload;
    },
    updateCurrentUser: (
      state: UserState,
      action: PayloadAction<{ user?: UserData }>
    ) => {
      if (action.payload.user) {
        state.data = action.payload.user;
      }
    },
    createNewCommunity: (
      state: UserState,
      action: PayloadAction<Community>
    ) => {
      const communities = state.communities || [];
      communities.push({ ...action.payload, seen: true });
      state.communities = communities;
    },
    // updateCommunity: (
    //   state: UserState,
    //   action: PayloadAction<Community | undefined>
    // ) => {
    //   state.community = action.payload;
    // },
    // updateCurrentChannel: (
    //   state: UserState,
    //   action: PayloadAction<Channel | undefined>
    // ) => {
    //   state.channel = action.payload;
    // },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutAction, (state: UserState) => {
        return {
          ...initialState,
          imgBucket: state.imgBucket,
          imgDomain: state.imgDomain,
        };
      })
      .addCase(getUserAction.fulfilled, (state: UserState, action) => {
        const user = action.payload;
        if (user) {
          state.data = user;
        }
      })
      .addCase(getUserCommunity.fulfilled, (state: UserState, action) => {
        const communities = action.payload;
        if (communities) {
          state.communities = communities;
        }
      })
      .addCase(setUserCommunityData.pending, (state: UserState) => {
        state.loadingCommunityData = true;
      })
      .addCase(setUserCommunityData.rejected, (state: UserState) => {
        state.loadingCommunityData = false;
      })
      .addCase(setUserCommunityData.fulfilled, (state: UserState, action) => {
        const { resChannel, teamUsersRes, communityId } = action.payload;
        if (resChannel.success && resChannel.data) {
          state.spaceMap = {
            ...state.spaceMap,
            [communityId]: resChannel.data?.spaces || [],
          };
          state.globalChannelMap = {
            ...state.globalChannelMap,
            [communityId]: resChannel.data?.global_channels || [],
          };
        }
        if (teamUsersRes.success && teamUsersRes.data) {
          state.teamUserMap = {
            ...state.teamUserMap,
            [communityId]: {
              data: teamUsersRes.data,
              total: teamUsersRes?.metadata?.total || 0,
            },
          };
        }
        state.loadingCommunityData = false;
      })
      .addCase(getWalletBalance.fulfilled, (state: UserState, action) => {
        state.walletBalance = action.payload;
      });
  },
});

export const USER_ACTIONS = userSlice.actions;

export default userSlice.reducer;
