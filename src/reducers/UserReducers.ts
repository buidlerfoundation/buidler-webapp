import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import api from "api";
import { AsyncKey, DirectCommunity } from "common/AppConfig";
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
  channelMap: { [key: string]: Channel[] };
  spaceChannelMap: { [key: string]: Space[] };
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
  },
  imgDomain: "",
  imgBucket: "",
  channelMap: {},
  spaceChannelMap: {},
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
    const communitiesWithDM = res.data || [];
    const communities = communitiesWithDM.filter(
      (el) => el.team_id !== DirectCommunity.team_id
    );
    const DM = communitiesWithDM.find(
      (el) => el.team_id === DirectCommunity.team_id
    );
    communities.unshift({ ...DirectCommunity, seen: DM?.seen });
    return communities;
  }
});

export const setUserCommunityData = createAsyncThunk(
  "user/setCommunity",
  async (communityId: string) => {
    const [resSpace, resChannel, teamUsersRes] = await Promise.all([
      api.getSpaceChannel(communityId),
      api.findChannel(communityId),
      api.getTeamUsers(communityId),
    ]);
    let channelId = resChannel.data?.[0]?.channel_id;
    const lastChannelIdByCommunityId = await getLastChannelIdByCommunityId(
      communityId
    );
    if (lastChannelIdByCommunityId) {
      channelId = lastChannelIdByCommunityId;
    }
    return {
      resSpace,
      resChannel,
      teamUsersRes,
      communityId,
      channelId,
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
        state.loadingCommunityData = true;
      })
      .addCase(setUserCommunityData.fulfilled, (state: UserState, action) => {
        const { resChannel, resSpace, teamUsersRes, communityId } =
          action.payload;
        if (resChannel.statusCode === 200 && resChannel.data) {
          state.channelMap = {
            ...state.channelMap,
            [communityId]: resChannel.data,
          };
        }
        if (resSpace.statusCode === 200 && resSpace.data) {
          state.spaceChannelMap = {
            ...state.spaceChannelMap,
            [communityId]: resSpace?.data?.map((el) => {
              el.channel_ids =
                resChannel.data
                  ?.filter((c) => c.space_id === el.space_id)
                  .map((c) => c.channel_id) || [];
              return el;
            }),
          };
        }
        if (teamUsersRes.statusCode === 200 && teamUsersRes.data) {
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
