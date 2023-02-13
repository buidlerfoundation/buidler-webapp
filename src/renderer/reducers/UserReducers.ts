import { uniqBy } from "lodash";
import { AnyAction, Reducer } from "redux";
import { getChannelId } from "renderer/helpers/StoreHelper";
import {
  BalanceApiData,
  Channel,
  Community,
  Space,
  UserData,
} from "renderer/models";
import actionTypes from "../actions/ActionTypes";
import { AsyncKey, DirectCommunity } from "../common/AppConfig";
import { setCookie } from "../common/Cookie";

interface MemberRoleData {
  data: Array<UserData>;
  total: number;
  canMore: boolean;
  currentPage: number;
}

interface UserReducerState {
  userData: UserData;
  team?: Array<Community>;
  channelMap: { [key: string]: Array<Channel> };
  directChannel: Array<Channel>;
  spaceChannelMap: { [key: string]: Array<Space> };
  currentTeamId: string;
  currentChannelId: string;
  imgDomain: string;
  imgBucket: string;
  imgConfig: any;
  teamUserMap: {
    [key: string]: {
      data: Array<UserData>;
      total: number;
    };
  };
  lastChannel: { [key: string]: Channel };
  spaceMembers: Array<UserData>;
  walletBalance?: BalanceApiData | null;
  memberDataMap: {
    [key: string]: {
      admin: MemberRoleData;
      owner: MemberRoleData;
      member: MemberRoleData;
    };
  };
  apiTeamController?: AbortController | null;
  apiSpaceMemberController?: AbortController | null;
  currentUserProfileId?: string | null;
  updateFromSocket?: boolean;
}

const defaultChannel: Channel = {
  channel_id: "",
  channel_members: [],
  channel_name: "",
  channel_type: "Public",
  notification_type: "",
  seen: true,
};

const initialState: UserReducerState = {
  userData: {
    avatar_url: "",
    user_id: "",
    user_name: "",
  },
  team: undefined,
  channelMap: {},
  directChannel: [],
  spaceChannelMap: {},
  currentTeamId: "",
  currentChannelId: "",
  imgDomain: "",
  imgBucket: "",
  imgConfig: {},
  teamUserMap: {},
  lastChannel: {},
  spaceMembers: [],
  walletBalance: null,
  memberDataMap: {},
  apiTeamController: null,
  currentUserProfileId: null,
  updateFromSocket: false,
};

export const defaultMemberData = {
  admin: {
    data: [],
    total: 0,
    canMore: false,
    currentPage: 1,
  },
  owner: {
    data: [],
    total: 0,
    canMore: false,
    currentPage: 1,
  },
  member: {
    data: [],
    total: 0,
    canMore: false,
    currentPage: 1,
  },
};

const userReducers: Reducer<UserReducerState, AnyAction> = (
  state = initialState,
  action
) => {
  const {
    currentTeamId,
    teamUserMap,
    spaceChannelMap,
    walletBalance,
    memberDataMap,
    channelMap,
    lastChannel,
    team,
    userData,
    directChannel,
    imgDomain,
    imgConfig,
    imgBucket,
  } = state;
  const channelId = getChannelId();
  const currentChannel =
    channelMap?.[currentTeamId]?.find((el) => el.channel_id === channelId) ||
    defaultChannel;
  const { type, payload } = action;
  switch (type) {
    case actionTypes.UPDATE_TEAM_FROM_SOCKET: {
      return {
        ...state,
        updateFromSocket: payload,
      };
    }
    case actionTypes.RECEIVE_MESSAGE: {
      if (!payload.direct) {
        return state;
      }
      const newChannels = channelMap?.[currentTeamId]?.map((el) => {
        if (el.channel_id === payload.data.entity_id) {
          return {
            ...el,
            updatedAt: new Date().toISOString(),
          };
        }
        return el;
      });
      return {
        ...state,
        channelMap: {
          ...state.channelMap,
          [currentTeamId]: newChannels,
        },
      };
    }
    case actionTypes.UPDATE_NOTIFICATION_CONFIG: {
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [currentTeamId]: channelMap[currentTeamId]?.map((el) => {
            if (
              payload.entity_type === "channel" &&
              el.channel_id === payload.entity_id
            ) {
              return { ...el, notification_type: payload.notification_type };
            }
            return el;
          }),
        },
      };
    }
    case actionTypes.UPDATE_USER_PERMISSION: {
      const { role, team_id, user_id } = payload;
      return {
        ...state,
        team: state.team?.map((el) => {
          if (el.team_id === team_id && user_id === userData.user_id)
            return {
              ...el,
              role,
            };
          return el;
        }),
      };
    }
    case actionTypes.UPDATE_CURRENT_USER_PROFILE_ID: {
      return {
        ...state,
        currentUserProfileId: payload,
      };
    }
    case actionTypes.UPDATE_LAST_CHANNEL: {
      state.lastChannel = {
        ...state.lastChannel,
        [payload.communityId]: { channel_id: payload.channelId },
      };
      return state;
    }
    case actionTypes.MEMBER_DATA_REQUEST: {
      const { teamId } = payload;
      return {
        ...state,
        memberDataMap: {
          ...memberDataMap,
          [teamId]: {
            admin: memberDataMap?.[teamId]?.admin || defaultMemberData.admin,
            member: memberDataMap?.[teamId]?.member || defaultMemberData.member,
            owner: memberDataMap?.[teamId]?.owner || defaultMemberData.owner,
          },
        },
      };
    }
    case actionTypes.MEMBER_DATA_SUCCESS: {
      const { role, page, data, total, teamId } = payload;
      const memberData = memberDataMap?.[teamId] || defaultMemberData;
      memberData[role] = {
        data: page === 1 ? data : [...(memberData[role]?.data || []), ...data],
        total,
        canMore: data.length === 50,
        currentPage: page,
      };
      return {
        ...state,
        memberDataMap: {
          ...memberDataMap,
          [teamId]: memberData,
        },
      };
    }
    case actionTypes.ACCEPT_TEAM_SUCCESS: {
      return {
        ...state,
        team: uniqBy([...(team || []), payload], "team_id"),
      };
    }
    case actionTypes.CLEAR_LAST_CHANNEL: {
      return {
        ...state,
        lastChannel: {
          ...lastChannel,
          [payload.communityId]: null,
        },
      };
    }
    case actionTypes.ADD_USER_TO_SPACE: {
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [currentTeamId]: [
            ...(channelMap[currentTeamId] || []),
            ...payload.channelFromSpace,
          ],
        },
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeamId]: spaceChannelMap[currentTeamId]?.map((el) => {
            if (el.space_id === payload.space_id) {
              el.channel_ids = [
                ...(el.channel_ids || []),
                ...payload.channelFromSpace.map((c) => c.channel_id),
              ];
              el.is_space_member = true;
            }
            return el;
          }),
        },
      };
    }
    case actionTypes.REMOVE_USER_FROM_SPACE: {
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [currentTeamId]: channelMap[currentTeamId]?.filter(
            (el) => el.space_id !== payload.space_id
          ),
        },
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeamId]: spaceChannelMap[currentTeamId]?.map((el) => {
            if (el.space_id === payload.space_id) {
              el.channel_ids = [];
              el.is_space_member = false;
            }
            return el;
          }),
        },
      };
    }
    case actionTypes.ADD_USER_TOKEN: {
      const newWalletBalance = walletBalance
        ? {
            ...walletBalance,
            tokens: [
              ...(walletBalance.tokens || []).filter(
                (el) =>
                  el.contract.contract_address !==
                  payload.contract.contract_address
              ),
              payload,
            ],
          }
        : null;

      return {
        ...state,
        walletBalance: newWalletBalance,
      };
    }
    case actionTypes.WALLET_BALANCE_SUCCESS: {
      return {
        ...state,
        walletBalance: payload,
      };
    }
    case actionTypes.SPACE_MEMBER_REQUEST: {
      state.apiSpaceMemberController = payload.controller;
      return state;
    }
    case actionTypes.SPACE_MEMBER_SUCCESS: {
      state.spaceMembers = payload.data;
      state.apiSpaceMemberController = null;
      return state;
    }
    case actionTypes.UPDATE_USER_SUCCESS: {
      return {
        ...state,
        userData:
          payload.user_id === userData.user_id
            ? {
                ...userData,
                ...payload,
              }
            : userData,
        teamUserMap: {
          ...teamUserMap,
          [currentTeamId]: {
            data: teamUserMap[currentTeamId]?.data?.map((el) => {
              if (el.user_id === payload.user_id) {
                return {
                  ...el,
                  ...payload,
                };
              }
              return el;
            }),
            total: teamUserMap[currentTeamId].total,
          },
        },
      };
    }
    case actionTypes.NEW_DIRECT_USER: {
      const directChannelId = DirectCommunity.team_id;
      return {
        ...state,
        teamUserMap: {
          ...teamUserMap,
          [directChannelId]: {
            data: uniqBy(
              [...(teamUserMap[directChannelId]?.data || []), ...payload],
              "user_id"
            ),
            total: teamUserMap[directChannelId]?.total + payload.length,
          },
        },
      };
    }
    case actionTypes.NEW_USER: {
      return {
        ...state,
        teamUserMap: {
          ...teamUserMap,
          [currentTeamId]: {
            data: [
              ...(teamUserMap[currentTeamId]?.data || []).filter(
                (el) => el.user_id !== payload.user_id
              ),
              payload,
            ],
            total: teamUserMap[currentTeamId]?.total + 1,
          },
        },
        memberDataMap: {
          ...memberDataMap,
          [currentTeamId]: {
            ...(memberDataMap[currentTeamId] || defaultMemberData),
            member: {
              ...(memberDataMap[currentTeamId]?.member || {}),
              data: [
                payload,
                ...(memberDataMap[currentTeamId]?.member?.data || []).filter(
                  (el) => el.user_id !== payload.user_id
                ),
              ],
            },
          },
        },
      };
    }
    case actionTypes.NEW_CHANNEL: {
      const isDirect = payload?.channel_type === "Direct";
      const newChannels = channelMap[currentTeamId] || [];
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [payload.team_id]: uniqBy(
            [payload, ...(channelMap?.[payload.team_id] || [])],
            "channel_id"
          ),
        },
        spaceChannelMap: isDirect
          ? spaceChannelMap
          : {
              ...spaceChannelMap,
              [currentTeamId]: spaceChannelMap[currentTeamId].map((el) => {
                if (el.space_id === payload.space_id) {
                  el.channel_ids = [
                    ...(el.channel_ids || []),
                    payload.channel_id,
                  ]
                    .sort((a1, a2) => {
                      const name1 =
                        newChannels.find((el) => el.channel_id === a1)
                          ?.channel_name || "";
                      const name2 =
                        newChannels.find((el) => el.channel_id === a2)
                          ?.channel_name || "";
                      return name1.localeCompare(name2);
                    })
                    .sort((a1, a2) => {
                      const type1 =
                        newChannels.find((el) => el.channel_id === a1)
                          ?.channel_type || "";
                      const type2 =
                        newChannels.find((el) => el.channel_id === a2)
                          ?.channel_type || "";
                      return type2.localeCompare(type1);
                    });
                }
                return el;
              }),
            },
      };
    }
    case actionTypes.DELETE_GROUP_CHANNEL_SUCCESS: {
      const channel = channelMap[currentTeamId] || [];
      const currentIdx = channel.findIndex(
        (el) => el.channel_id === currentChannel.channel_id
      );
      const nextChannels = channel.filter(
        (el) => el.space_id !== payload.spaceId
      );
      const newCurrentChannel =
        nextChannels?.[currentIdx] || nextChannels?.[0] || defaultChannel;
      return {
        ...state,
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeamId]: spaceChannelMap[currentTeamId].filter(
            (el) => el.space_id !== payload.spaceId
          ),
        },
        channelMap: {
          ...channelMap,
          [currentTeamId]: nextChannels,
        },
        currentChannelId: newCurrentChannel.channel_id,
      };
    }
    case actionTypes.CREATE_GROUP_CHANNEL_SUCCESS: {
      return {
        ...state,
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeamId]: [...(spaceChannelMap[currentTeamId] || []), payload],
        },
      };
    }
    case actionTypes.UPDATE_GROUP_CHANNEL_SUCCESS: {
      return {
        ...state,
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeamId]: spaceChannelMap[currentTeamId]
            ?.map((el) => {
              if (el.space_id === payload.space_id) {
                return {
                  ...el,
                  ...payload,
                  attachment: null,
                };
              }
              return el;
            })
            .sort((a1, a2) => {
              const name1 = a1.space_name;
              const name2 = a2.space_name;
              return name1.localeCompare(name2);
            }),
        },
      };
    }
    case actionTypes.UPDATE_SPACE_AVATAR_FAIL: {
      return {
        ...state,
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeamId]: spaceChannelMap[currentTeamId]?.map((el) => {
            if (el.space_id === payload.spaceId) {
              return {
                ...el,
                attachment: null,
              };
            }
            return el;
          }),
        },
      };
    }
    case actionTypes.UPDATE_SPACE_AVATAR_REQUEST: {
      return {
        ...state,
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeamId]: spaceChannelMap[currentTeamId]?.map((el) => {
            if (el.space_id === payload.spaceId) {
              return {
                ...el,
                attachment: payload.attachment,
              };
            }
            return el;
          }),
        },
      };
    }
    case actionTypes.UPDATE_CHANNEL_AVATAR_FAIL: {
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [currentTeamId]: channelMap[currentTeamId]?.map((el) => {
            if (el.channel_id === payload.channelId) {
              return {
                ...el,
                attachment: null,
              };
            }
            return el;
          }),
        },
      };
    }
    case actionTypes.UPDATE_CHANNEL_AVATAR_REQUEST: {
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [currentTeamId]: channelMap[currentTeamId]?.map((el) => {
            if (el.channel_id === payload.channelId) {
              return {
                ...el,
                attachment: payload.attachment,
              };
            }
            return el;
          }),
        },
      };
    }
    case actionTypes.USER_ONLINE: {
      const { user_id } = payload;
      return {
        ...state,
        teamUserMap: {
          ...teamUserMap,
          [currentTeamId]: {
            ...teamUserMap[currentTeamId],
            data: teamUserMap[currentTeamId]?.data?.map((el) => {
              if (el.user_id === user_id) {
                el.status = "online";
                return { ...el };
              }
              return el;
            }),
          },
        },
      };
    }
    case actionTypes.USER_OFFLINE: {
      const { user_id } = payload;
      return {
        ...state,
        teamUserMap: {
          ...teamUserMap,
          [currentTeamId]: {
            ...teamUserMap[currentTeamId],
            data: teamUserMap[currentTeamId]?.data?.map((el) => {
              if (el.user_id === user_id) {
                el.status = "offline";
                return { ...el };
              }
              return el;
            }),
          },
        },
      };
    }
    case actionTypes.GET_INITIAL: {
      return {
        ...state,
        imgDomain: payload.data.imgproxy?.domain,
        imgBucket: payload.data.imgproxy?.bucket_name,
        imgConfig: payload.data.img_config,
        loginGoogleUrl: payload.data.login_url,
      };
    }
    case actionTypes.LOGOUT: {
      return {
        ...initialState,
        imgDomain,
        imgConfig,
        imgBucket,
      };
    }
    case actionTypes.GET_TEAM_USER: {
      const { teamUsers, teamId } = payload;
      return {
        ...state,
        teamUserMap: {
          ...teamUserMap,
          [teamId]: {
            data: teamUsers.data,
            total: teamUsers?.metadata?.total,
          },
        },
      };
    }
    case actionTypes.USER_SUCCESS: {
      return {
        ...state,
        userData: payload.user,
      };
    }
    case actionTypes.CURRENT_TEAM_REQUEST: {
      state.apiTeamController = payload.controller;
      return state;
    }
    case actionTypes.CURRENT_TEAM_SUCCESS: {
      const { lastChannelId, resChannel, resSpace } = payload;
      let channel: Channel = defaultChannel;
      if (resChannel?.data?.length > 0) {
        channel =
          resChannel.data.find((c) => c.channel_id === lastChannelId) ||
          resChannel.data.find(
            (c) =>
              c.channel_id === lastChannel?.[payload.team.team_id]?.channel_id
          ) ||
          resChannel.data[0];
      }
      setCookie(AsyncKey.lastChannelId, channel?.channel_id);
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [payload.team.team_id]: resChannel.data,
        },
        spaceChannelMap: {
          ...spaceChannelMap,
          [payload.team.team_id]: resSpace?.data?.map((el) => {
            el.channel_ids = resChannel.data
              ?.filter((c) => c.space_id === el.space_id)
              .map((c) => c.channel_id);
            return el;
          }),
        },
        currentTeamId: payload.team.team_id,
        currentChannelId: channel.channel_id,
        lastChannel: {
          ...lastChannel,
          [payload.team.team_id]: channel,
        },
        apiTeamController: null,
      };
    }
    case actionTypes.CREATE_TEAM_SUCCESS: {
      return {
        ...state,
        team: [...(team || []), { ...payload, seen: true }],
      };
    }
    case actionTypes.SET_CURRENT_CHANNEL: {
      if (payload.communityId) {
        lastChannel[payload.communityId] = payload.channel;
      } else {
        lastChannel[state?.currentTeamId] = payload.channel;
      }
      return {
        ...state,
        currentChannelId: payload.channel.channel_id,
        lastChannel,
      };
    }
    case actionTypes.UPDATE_GROUP_CHANNEL: {
      const { channelId, spaceId } = payload;
      const space = spaceChannelMap[currentTeamId]?.find(
        (g) => g.space_id === spaceId
      );
      if (!space) return state;
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [currentTeamId]: channelMap[currentTeamId]?.map((el) => {
            if (el.channel_id === channelId) {
              return {
                ...el,
                space_id: spaceId,
                space,
              };
            }
            return el;
          }),
        },
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeamId]: spaceChannelMap[currentTeamId]?.map((el) => {
            if (el.space_id === spaceId) {
              el.channel_ids = [...(el.channel_ids || []), channelId];
            } else {
              el.channel_ids = el.channel_ids?.filter((id) => id !== channelId);
            }
            return el;
          }),
        },
      };
    }
    case actionTypes.MARK_SEEN_CHANNEL: {
      const { channel_id, team_id } = payload;
      const channels = channelMap[team_id]?.map((el) => {
        if (el.channel_id === channel_id) {
          return {
            ...el,
            seen: true,
          };
        }
        return el;
      });
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [team_id]: channels,
        },
        team: state.team?.map((el) => {
          if (el.team_id === team_id) {
            return {
              ...el,
              seen:
                channels?.find(
                  (c) => !c.seen && c.notification_type !== "muted"
                ) === undefined,
            };
          }
          return el;
        }),
      };
    }
    case actionTypes.MARK_UN_SEEN_CHANNEL: {
      const { channelId, communityId } = payload;
      const unSeenChannel = channelMap[currentTeamId]?.find(
        (el) => el.channel_id === channelId
      );
      if (!unSeenChannel?.seen && communityId === currentTeamId) {
        return state;
      }
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [currentTeamId]: channelMap[currentTeamId]?.map((el) => {
            if (el.channel_id === channelId) {
              return {
                ...el,
                seen: false,
              };
            }
            return el;
          }),
        },
        team: state.team?.map((el) => {
          if (el.team_id === communityId) {
            return {
              ...el,
              seen: false,
            };
          }
          return el;
        }),
      };
    }
    case actionTypes.TEAM_SUCCESS: {
      return {
        ...state,
        team: payload.team,
      };
    }
    case actionTypes.DELETE_CHANNEL_REQUEST: {
      const channel = channelMap[currentTeamId] || [];
      const teamUserData = teamUserMap[currentTeamId]?.data;
      const currentIdx = channel.findIndex(
        (el) => el.channel_id === currentChannel.channel_id
      );
      const newChannel = channel.filter(
        (el) => el.channel_id !== payload.channelId
      );
      let newCurrentChannel = defaultChannel;
      if (currentChannel.channel_id === payload.channelId) {
        newCurrentChannel =
          newChannel?.[currentIdx] || newChannel?.[0] || defaultChannel;
        if (newCurrentChannel.channel_type === "Direct") {
          newCurrentChannel.user = teamUserData?.find(
            (u) => u.direct_channel === newCurrentChannel.channel_id
          );
        }
      }
      return {
        ...state,
        lastChannel: {
          ...lastChannel,
          [payload.communityId]: newCurrentChannel,
        },
      };
    }
    case actionTypes.DELETE_CHANNEL_SUCCESS: {
      const channel = channelMap[currentTeamId] || [];
      const teamUserData = teamUserMap[currentTeamId]?.data;
      const currentIdx = channel.findIndex(
        (el) => el.channel_id === currentChannel.channel_id
      );
      const spaceId = channel?.find(
        (el) => el.channel_id === payload.channelId
      )?.space_id;
      const newChannel = channel.filter(
        (el) => el.channel_id !== payload.channelId
      );
      const newDirectChannel = directChannel.filter(
        (el) => el.channel_id !== payload.channelId
      );
      let newCurrentChannel = defaultChannel;
      if (currentChannel.channel_id === payload.channelId) {
        newCurrentChannel =
          newChannel?.[currentIdx] || newChannel?.[0] || defaultChannel;
        if (newCurrentChannel.channel_type === "Direct") {
          newCurrentChannel.user = teamUserData?.find(
            (u) => u.direct_channel === newCurrentChannel.channel_id
          );
        }
        setCookie(AsyncKey.lastChannelId, newCurrentChannel?.channel_id);
      } else {
        newCurrentChannel = currentChannel;
      }
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [currentTeamId]: newChannel,
        },
        directChannel: newDirectChannel,
        currentChannelId: newCurrentChannel.channel_id,
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeamId]: spaceChannelMap[currentTeamId]?.map((el) => {
            if (el.space_id === spaceId) {
              el.channel_ids = el.channel_ids?.filter(
                (id) => id !== payload.channelId
              );
            }
            return el;
          }),
        },
      };
    }
    case actionTypes.UPDATE_CHANNEL_SUCCESS: {
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [currentTeamId]: channelMap[currentTeamId]?.map((el) => {
            if (el.channel_id === payload.channel_id) {
              return { ...el, ...payload };
            }
            return el;
          }),
        },
      };
    }
    case actionTypes.CREATE_CHANNEL_SUCCESS: {
      let newTeamUserData = teamUserMap[currentTeamId]?.data;
      if (payload.channel_type === "Direct" && !!newTeamUserData) {
        newTeamUserData = newTeamUserData.map((el) => {
          if (
            !!payload.channel_members.find((id) => id === el.user_id) &&
            (el.user_id !== userData.user_id ||
              payload.channel_members.length === 1)
          ) {
            el.direct_channel = payload.channel_id;
          }
          return el;
        });
        if (
          !!payload.channel_members.find(
            (el) => el === currentChannel.user?.user_id
          )
        ) {
          currentChannel.channel_id = payload.channel_id;
        }
      }
      const newChannels = channelMap[currentTeamId] || [];
      if (payload.channel_type !== "Direct") {
        newChannels.push(payload);
      }
      return {
        ...state,
        channelMap:
          payload.channel_type === "Direct"
            ? channelMap
            : {
                ...channelMap,
                [currentTeamId]: uniqBy(newChannels, "channel_id"),
              },
        directChannel:
          payload.channel_type === "Direct"
            ? uniqBy([...directChannel, payload], "channel_id")
            : directChannel,
        teamUserMap: {
          ...teamUserMap,
          [currentTeamId]: {
            ...teamUserMap[currentTeamId],
            data: newTeamUserData,
          },
        },
        lastChannel: {
          ...lastChannel,
          [currentTeamId]: payload,
        },
      };
    }
    case actionTypes.REMOVE_MEMBER_SUCCESS: {
      return {
        ...state,
        team:
          userData.user_id === payload.userId
            ? state.team?.filter((el) => el.team_id !== payload.teamId)
            : state.team,
        teamUserMap: {
          ...teamUserMap,
          [payload.teamId]: {
            data: teamUserMap[payload.teamId]?.data?.map((el) => {
              if (el.user_id === payload.userId) {
                return {
                  ...el,
                  is_deleted: true,
                };
              }
              return el;
            }),
            total: teamUserMap[payload.teamId]?.total - 1,
          },
        },
        memberDataMap: {
          ...memberDataMap,
          [payload.teamId]: {
            member: {
              ...(memberDataMap[payload.teamId]?.member || {}),
              data: (memberDataMap[payload.teamId]?.member.data || []).filter(
                (el) => el.user_id !== payload.userId
              ),
            },
            admin: {
              ...(memberDataMap[payload.teamId].admin || {}),
              data: (memberDataMap[payload.teamId].admin.data || []).filter(
                (el) => el.user_id !== payload.userId
              ),
            },
            owner: {
              ...(memberDataMap[payload.teamId].owner || {}),
              data: (memberDataMap[payload.teamId].owner.data || []).filter(
                (el) => el.user_id !== payload.userId
              ),
            },
          },
        },
      };
    }
    case actionTypes.LEAVE_TEAM_SUCCESS: {
      if (payload.teamId === currentTeamId) {
        return {
          ...state,
          directChannel: [],
          currentChannelId: "",
          spaceChannel: [],
          team: state?.team?.filter((el) => el.team_id !== payload.teamId),
        };
      }
      return {
        ...state,
        team: state?.team?.filter((el) => el.team_id !== payload.teamId),
      };
    }
    case actionTypes.USER_CHANNEL_SUCCESS: {
      return {
        ...state,
        userData: {
          ...userData,
          user_channels: payload.channels.map((el) => el.channel_id),
        },
      };
    }
    case actionTypes.UPDATE_TEAM_SUCCESS: {
      const { teamId, body } = payload;
      return {
        ...state,
        team: state?.team?.map((el) => {
          if (el.team_id === teamId) {
            return {
              ...el,
              ...body,
            };
          }
          return el;
        }),
      };
    }
    case actionTypes.DELETE_TEAM_SUCCESS: {
      const { teamId } = payload;
      const newTeam = team?.filter((el) => el.team_id !== teamId);
      return {
        ...state,
        currentTeamId:
          currentTeamId === teamId
            ? newTeam?.[0]?.team_id || currentTeamId
            : currentTeamId,
        team: newTeam,
      };
    }
    default:
      return state;
  }
};

export default userReducers;
