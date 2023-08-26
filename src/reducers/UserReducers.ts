import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Channel, Community, Space } from "models/Community";
import {
  BalanceApiData,
  InitialApiData,
  IOnlineUsers,
  IUserAsset,
  UserData,
} from "models/User";
import {
  getCommunities,
  getDataFromExternalUrl,
  getExternalCommunityByChannelId,
  getPinnedCommunities,
  getUserAction,
  getUserAssets,
  getWalletBalance,
  openNewTabFromIframe,
  pinCommunity,
  setUserCommunityData,
  unPinCommunity,
} from "./UserActions";
import { channelChanged, logoutAction } from "./actions";
import { uniqBy } from "lodash";

interface IOpeningNewTab {
  entityType: "channel" | "space" | "community";
  entityId?: string;
  url?: string;
}

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
  openingNewTab?: IOpeningNewTab;
  userAssets: IUserAsset[];
  onlineUsers: {
    [key: string]: string[];
  };
}

const initialState: UserState = {
  data: {
    avatar_url: "",
    user_id: "",
    user_name: "",
    user_addresses: [],
    user_assets: [],
  },
  imgDomain: "",
  imgBucket: "",
  spaceMap: {},
  teamUserMap: {},
  loadingCommunityData: false,
  currentToken: "",
  userAssets: [],
  onlineUsers: {},
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
    updateOnlineUsers: (state, action: PayloadAction<IOnlineUsers>) => {
      const { user_ids, add_user_id, channel_ids, remove_user_id } =
        action.payload;
      channel_ids.forEach((id) => {
        if (user_ids) {
          state.onlineUsers[id] = user_ids;
        } else if (add_user_id && state.onlineUsers[id]) {
          if (!state.onlineUsers[id]?.includes?.(add_user_id)) {
            state.onlineUsers[id]?.push?.(add_user_id);
          }
        } else if (remove_user_id && state.onlineUsers[id]) {
          const idx = state.onlineUsers[id]?.indexOf?.(remove_user_id);
          if (idx >= 0) {
            state.onlineUsers[id]?.splice?.(idx, 1);
          }
        }
      });
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
    userJoinCommunity: (state, action: PayloadAction<Community>) => {
      state.communities = state.communities?.map((el) => {
        if (el.community_id === action.payload.community_id) {
          return action.payload;
        }
        return el;
      });
      state.pinnedCommunities = state.pinnedCommunities?.map((el) => {
        if (el.community_id === action.payload.community_id) {
          return action.payload;
        }
        return el;
      });
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
        state.communities = communities;
      }
      state.communities = state.communities?.map((el) => {
        if (el.community_id === action.payload.community_id) {
          return action.payload;
        }
        return el;
      });
      state.pinnedCommunities = state.pinnedCommunities?.map((el) => {
        if (el.community_id === action.payload.community_id) {
          return action.payload;
        }
        return el;
      });
    },
    joinNewChannel: (
      state,
      action: PayloadAction<{
        channel: Channel;
        space: Space;
      }>
    ) => {
      const { channel, space } = action.payload;
      if (channel.community_id) {
        let spaces = state.spaceMap?.[channel.community_id] || [];
        if (!spaces.find((el) => el.space_id === space.space_id)) {
          spaces.push({ ...space, channels: [channel] });
        } else {
          spaces = spaces.map((el) => {
            if (el.space_id === space.space_id) {
              if (
                el.channels?.find((c) => c.channel_id === channel.channel_id)
              ) {
                return {
                  ...el,
                  channels: el.channels?.map((c) => {
                    if (c.channel_id === channel.channel_id) {
                      return {
                        ...c,
                        ...channel,
                      };
                    }
                    return c;
                  }),
                };
              } else {
                return {
                  ...el,
                  channels: uniqBy(
                    [...(el.channels || []), channel],
                    "channel_id"
                  ),
                };
              }
            }
            return el;
          });
        }
        state.spaceMap[channel.community_id] = spaces;
      }
    },
    leaveChannel: (state, action: PayloadAction<{ channel: Channel }>) => {
      const { channel } = action.payload;
      if (channel.community_id) {
        let spaces = state.spaceMap?.[channel.community_id] || [];
        spaces = spaces.map((el) => {
          if (el.space_id === channel.space_id) {
            return {
              ...el,
              channels:
                (el.channels?.length || 0) > 1
                  ? el.channels?.filter(
                      (c) => c.channel_id !== channel.channel_id
                    )
                  : el.channels?.map((el) => {
                      if (el.channel_id === channel.channel_id) {
                        return {
                          ...el,
                          is_channel_member: false,
                        };
                      }
                      return el;
                    }),
            };
          }
          return el;
        });
        state.spaceMap[channel.community_id] = spaces;
      }
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
    updateOpeningNewTab: (
      state,
      action: PayloadAction<IOpeningNewTab | undefined>
    ) => {
      state.openingNewTab = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(logoutAction, (state: UserState) => {
        state.data = initialState.data;
        state.currentToken = "";
      })
      .addCase(getUserAssets.fulfilled, (state, action) => {
        state.userAssets = [
          ...(action.payload.resNFT.data || []),
          ...(action.payload.resENS.data || []),
        ];
      })
      .addCase(channelChanged, (state) => {
        state.openingNewTab = undefined;
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
      .addCase(getExternalCommunityByChannelId.fulfilled, (state, action) => {
        const { externalUrlRes, spaceRes } = action.payload;
        const { community, space, channel } = externalUrlRes.data || {};
        if (community && space && channel) {
          const communities = state.pinnedCommunities || [];
          let spaces = spaceRes?.data || [];
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
          if (
            !communities.find(
              (el) => el.community_id === community.community_id
            )
          ) {
            communities.push({
              ...community,
              fromExternal: action.meta.arg.fromExternal,
            });
            if (space && channel) {
              state.spaceMap = {
                ...state.spaceMap,
                [community.community_id]: spaces,
              };
            }
            state.pinnedCommunities = communities;
          } else {
            state.spaceMap[community.community_id] = spaces;
          }
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
