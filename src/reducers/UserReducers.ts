import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Channel, Community, Space } from "models/Community";
import { BalanceApiData, InitialApiData, UserData } from "models/User";
import {
  getCommunities,
  getDataFromExternalUrl,
  getPinnedCommunities,
  getUserAction,
  getWalletBalance,
  openNewTabFromIframe,
  pinCommunity,
  setUserCommunityData,
  unPinCommunity,
} from "./UserActions";
import { logoutAction } from "./actions";
import { uniqBy } from "lodash";

interface UserState {
  data: UserData;
  imgDomain?: string;
  imgBucket?: string;
  currentToken?: string;
  pinnedCommunities?: Community[];
  communities?: Community[];
  spaceMap: { [key: string]: Space[] };
  teamUserMap: {
    [key: string]: {
      data: UserData[];
      total: number;
    };
  };
  loadingCommunityData?: boolean;
  walletBalance?: BalanceApiData | null;
  externalData?: {
    community: Community;
    space: Space | null;
    channel: Channel;
  };
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
  spaceMap: {},
  teamUserMap: {},
  loadingCommunityData: false,
  currentToken: "",
};

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
      if (
        !communities.find(
          (el) => el.community_id === action.payload.community_id
        )
      ) {
        communities.push({ ...action.payload, seen: true });
      }
      state.communities = communities;
    },
    updateChannel: (
      state: UserState,
      action: PayloadAction<{
        communityId: string;
        channelId: string;
        spaceId: string;
        data: any;
      }>
    ) => {
      const { communityId, channelId, spaceId, data } = action.payload;
      const newSpaceMap = state.spaceMap;
      if (newSpaceMap[communityId]) {
        newSpaceMap[communityId] = newSpaceMap[communityId].map((space) => {
          if (space.space_id === spaceId) {
            return {
              ...space,
              channels: space.channels?.map((channel) => {
                if (channel.channel_id === channelId) {
                  return {
                    ...channel,
                    ...data,
                  };
                }
                return channel;
              }),
            };
          }
          return space;
        });
      }
      state.spaceMap = newSpaceMap;
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
      .addCase(pinCommunity, (state, action) => {
        const community = action.payload;
        const pinnedCommunities = state.pinnedCommunities || [];
        pinnedCommunities.push(community);
        state.pinnedCommunities = pinnedCommunities;
      })
      .addCase(unPinCommunity, (state, action) => {
        const communityId = action.payload;
        state.pinnedCommunities = state.pinnedCommunities?.filter(
          (el) => el.community_id !== communityId
        );
      })
      .addCase(getUserAction.fulfilled, (state: UserState, action) => {
        const user = action.payload;
        if (user) {
          state.data = user;
        }
      })
      .addCase(getPinnedCommunities.fulfilled, (state: UserState, action) => {
        if (action.payload) {
          const { pinnedCommunities, externalUrlRes } = action.payload;
          if (!externalUrlRes?.data) {
            if (pinnedCommunities) {
              state.pinnedCommunities = pinnedCommunities;
            }
          } else {
            const { community, space, channel } = externalUrlRes.data;
            const communities = pinnedCommunities;
            if (
              !communities.find(
                (el) => el.community_id === community.community_id
              )
            ) {
              communities.push({ ...community, fromExternal: true });
              if (space && channel) {
                state.spaceMap = {
                  ...state.spaceMap,
                  [community.community_id]: [{ ...space, channels: [channel] }],
                };
              }
            } else if (community && space && channel) {
              state.externalData = {
                community,
                space,
                channel,
              };
            }
            state.pinnedCommunities = communities;
          }
        }
      })
      .addCase(getCommunities.fulfilled, (state, action) => {
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
          let spaces = resChannel.data || [];
          const { community, space, channel } = state.externalData || {};
          if (space && channel && community?.community_id === communityId) {
            if (!spaces.find((el) => el.space_id === space?.space_id)) {
              spaces.push({ ...space, channels: [channel] });
            } else {
              spaces = spaces.map((el) => {
                if (el.space_id === space.space_id) {
                  return {
                    ...el,
                    channels: uniqBy(
                      [...(el.channels || []), channel],
                      "channel_id"
                    ),
                  };
                }
                return el;
              });
            }
          }
          state.spaceMap = {
            ...state.spaceMap,
            [communityId]: spaces,
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
      })
      .addCase(getDataFromExternalUrl.fulfilled, (state: UserState, action) => {
        if (action.payload) {
          const { channel, community } = action.payload;
          state.pinnedCommunities = [community];
          state.spaceMap = {
            [community.community_id]: [
              {
                space_id: channel.space_id || "",
                space_name: "",
                channels: [channel],
              },
            ],
          };
        }
      })
      .addCase(openNewTabFromIframe.fulfilled, (state, action) => {
        if (action.payload) {
          const { channel, community, space } = action.payload;
          if (
            !state.pinnedCommunities?.find(
              (el) => el.community_id === community.community_id
            )
          ) {
            state.pinnedCommunities = [
              ...(state.pinnedCommunities || []),
              community,
            ];
            if (space && channel) {
              state.spaceMap = {
                ...state.spaceMap,
                [community.community_id]: [{ ...space, channels: [channel] }],
              };
            }
          } else if (
            !state.spaceMap?.[community.community_id]?.find(
              (el) => el.space_id === space?.space_id
            )
          ) {
            if (space && channel) {
              state.spaceMap = {
                ...state.spaceMap,
                [community.community_id]: [
                  ...(state.spaceMap?.[community.community_id] || []),
                  { ...space, channels: [channel] },
                ],
              };
            }
          } else {
            state.spaceMap = {
              ...state.spaceMap,
              [community.community_id]: state.spaceMap[
                community.community_id
              ]?.map((el) => {
                if (
                  el.space_id === channel.space_id &&
                  !el.channels?.find((c) => c.channel_id === channel.channel_id)
                ) {
                  return {
                    ...el,
                    channels: [...(el.channels || []), channel],
                  };
                }
                return el;
              }),
            };
          }
        }
      });
  },
});

export const USER_ACTIONS = userSlice.actions;

export default userSlice.reducer;
