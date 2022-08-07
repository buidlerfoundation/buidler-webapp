import { uniqBy } from "lodash";
import { AnyAction, Reducer } from "redux";
import {
  BalanceApiData,
  Channel,
  Community,
  Space,
  UserData,
} from "renderer/models";
import actionTypes from "../actions/ActionTypes";
import { AsyncKey } from "../common/AppConfig";
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
  currentTeam: Community;
  currentChannel: Channel;
  imgDomain: string;
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
  memberData: {
    admin: MemberRoleData;
    owner: MemberRoleData;
    member: MemberRoleData;
  };
}

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
  currentTeam: {
    team_display_name: "",
    team_icon: "",
    team_id: "",
    team_url: "",
    role: "",
  },
  currentChannel: {
    channel_id: "",
    channel_member: [],
    channel_name: "",
    channel_type: "Public",
    notification_type: "",
    seen: true,
  },
  imgDomain: "",
  imgConfig: {},
  teamUserMap: {},
  lastChannel: {},
  spaceMembers: [],
  walletBalance: null,
  memberData: {
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
  },
};

const userReducers: Reducer<UserReducerState, AnyAction> = (
  state = initialState,
  action
) => {
  const {
    currentTeam,
    teamUserMap,
    spaceChannelMap,
    walletBalance,
    memberData,
    currentChannel,
    channelMap,
    lastChannel,
    team,
    userData,
    directChannel,
    imgDomain,
    imgConfig,
  } = state;
  const { type, payload } = action;
  switch (type) {
    case actionTypes.MEMBER_DATA_SUCCESS: {
      const { role, page, data, total } = payload;
      memberData[role] = {
        data: page === 1 ? data : [...(memberData[role]?.data || []), ...data],
        total,
        canMore: data.length === 50,
        currentPage: page,
      };
      return {
        ...state,
        memberData,
      };
    }
    case actionTypes.UPDATE_EXPAND_SPACE_ITEM: {
      const { spaceId, isExpand } = payload;
      return {
        ...state,
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeam.team_id]: spaceChannelMap[currentTeam.team_id].map(
            (el) => {
              if (el.space_id === spaceId) {
                el.is_expand = isExpand;
              }
              return el;
            }
          ),
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
          [currentTeam.team_id]: [
            ...(channelMap[currentTeam.team_id] || []),
            ...payload.channelFromSpace,
          ],
        },
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeam.team_id]: spaceChannelMap[currentTeam.team_id]?.map(
            (el) => {
              if (el.space_id === payload.space_id) {
                el.channel_ids = [
                  ...(el.channel_ids || []),
                  ...payload.channelFromSpace.map((c) => c.channel_id),
                ];
                el.is_space_member = true;
              }
              return el;
            }
          ),
        },
      };
    }
    case actionTypes.REMOVE_USER_FROM_SPACE: {
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [currentTeam.team_id]: channelMap[currentTeam.team_id]?.filter(
            (el) => el.space_id !== payload.space_id
          ),
        },
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeam.team_id]: spaceChannelMap[currentTeam.team_id]?.map(
            (el) => {
              if (el.space_id === payload.space_id) {
                el.channel_ids = [];
                el.is_space_member = false;
              }
              return el;
            }
          ),
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
    case actionTypes.SPACE_MEMBER_SUCCESS: {
      return {
        ...state,
        spaceMembers: payload.data,
      };
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
          [currentTeam.team_id]: {
            data: teamUserMap[currentTeam.team_id]?.data?.map((el) => {
              if (el.user_id === payload.user_id) {
                return {
                  ...el,
                  ...payload,
                };
              }
              return el;
            }),
            total: teamUserMap[currentTeam.team_id].total,
          },
        },
      };
    }
    case actionTypes.NEW_USER: {
      return {
        ...state,
        teamUserMap: {
          ...teamUserMap,
          [currentTeam.team_id]: {
            data: [...(teamUserMap[currentTeam.team_id]?.data || []), payload],
            total: teamUserMap[currentTeam.team_id]?.total + 1,
          },
        },
      };
    }
    case actionTypes.NEW_CHANNEL: {
      let newTeamUserData = teamUserMap[currentTeam.team_id]?.data;
      if (payload.channel_type === "Direct" && !!newTeamUserData) {
        newTeamUserData = newTeamUserData.map((el) => {
          if (
            !!payload.channel_member.find((id) => id === el.user_id) &&
            (el.user_id !== userData.user_id ||
              payload.channel_member.length === 1)
          ) {
            el.direct_channel = payload.channel_id;
          }
          return el;
        });
        if (
          !!payload.channel_member.find(
            (el) => el === currentChannel.user?.user_id
          )
        ) {
          currentChannel.channel_id = payload.channel_id;
        }
      }
      return {
        ...state,
        channelMap:
          payload.channel_type === "Direct"
            ? channelMap
            : {
                ...channelMap,
                [currentTeam.team_id]: [
                  ...(channelMap[currentTeam.team_id] || []),
                  payload,
                ],
              },
        directChannel:
          payload.channel_type === "Direct"
            ? [...directChannel, payload]
            : directChannel,
        teamUserMap: {
          ...teamUserMap,
          [currentTeam.team_id]: {
            ...teamUserMap[currentTeam.team_id],
            data: newTeamUserData,
          },
        },
        currentChannel,
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeam.team_id]: spaceChannelMap[currentTeam.team_id].map(
            (el) => {
              if (el.space_id === payload.space_id) {
                el.channel_ids = [
                  ...(el.channel_ids || []),
                  payload.channel_id,
                ];
              }
              return el;
            }
          ),
        },
      };
    }
    case actionTypes.DELETE_GROUP_CHANNEL_SUCCESS: {
      const channel = channelMap[currentTeam.team_id] || [];
      const currentIdx = channel.findIndex(
        (el) => el.channel_id === currentChannel.channel_id
      );
      const nextChannels = channel.filter(
        (el) => el.space_id !== payload.spaceId
      );
      const newCurrentChannel =
        nextChannels?.[currentIdx] ||
        nextChannels?.[0] ||
        initialState.currentChannel;
      return {
        ...state,
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeam.team_id]: spaceChannelMap[currentTeam.team_id].filter(
            (el) => el.space_id !== payload.spaceId
          ),
        },
        channelMap: {
          ...channelMap,
          [currentTeam.team_id]: nextChannels,
        },
        currentChannel: newCurrentChannel,
      };
    }
    case actionTypes.CREATE_GROUP_CHANNEL_SUCCESS: {
      return {
        ...state,
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeam.team_id]: [
            ...(spaceChannelMap[currentTeam.team_id] || []),
            payload,
          ],
        },
      };
    }
    case actionTypes.UPDATE_GROUP_CHANNEL_SUCCESS: {
      return {
        ...state,
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeam.team_id]: spaceChannelMap[currentTeam.team_id]?.map(
            (el) => {
              if (el.space_id === payload.space_id) {
                return {
                  ...el,
                  ...payload,
                  attachment: null,
                };
              }
              return el;
            }
          ),
        },
      };
    }
    case actionTypes.UPDATE_SPACE_AVATAR_FAIL: {
      return {
        ...state,
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeam.team_id]: spaceChannelMap[currentTeam.team_id]?.map(
            (el) => {
              if (el.space_id === payload.spaceId) {
                return {
                  ...el,
                  attachment: null,
                };
              }
              return el;
            }
          ),
        },
      };
    }
    case actionTypes.UPDATE_SPACE_AVATAR_REQUEST: {
      return {
        ...state,
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeam.team_id]: spaceChannelMap[currentTeam.team_id]?.map(
            (el) => {
              if (el.space_id === payload.spaceId) {
                return {
                  ...el,
                  attachment: payload.attachment,
                };
              }
              return el;
            }
          ),
        },
      };
    }
    case actionTypes.UPDATE_CHANNEL_AVATAR_FAIL: {
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [currentTeam.team_id]: channelMap[currentTeam.team_id]?.map((el) => {
            if (el.channel_id === payload.channelId) {
              return {
                ...el,
                attachment: null,
              };
            }
            return el;
          }),
        },
        currentChannel:
          currentChannel.channel_id === payload.channel_id
            ? { ...currentChannel, ...payload, attachment: null }
            : currentChannel,
      };
    }
    case actionTypes.UPDATE_CHANNEL_AVATAR_REQUEST: {
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [currentTeam.team_id]: channelMap[currentTeam.team_id]?.map((el) => {
            if (el.channel_id === payload.channelId) {
              return {
                ...el,
                attachment: payload.attachment,
              };
            }
            return el;
          }),
        },
        currentChannel:
          currentChannel.channel_id === payload.channelId
            ? { ...currentChannel, attachment: payload.attachment }
            : currentChannel,
      };
    }
    case actionTypes.USER_ONLINE: {
      const { user_id } = payload;
      return {
        ...state,
        teamUserMap: {
          ...teamUserMap,
          [currentTeam.team_id]: {
            ...teamUserMap[currentTeam.team_id],
            data: teamUserMap[currentTeam.team_id]?.data?.map((el) => {
              if (el.user_id === user_id) {
                el.status = "online";
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
          [currentTeam.team_id]: {
            ...teamUserMap[currentTeam.team_id],
            data: teamUserMap[currentTeam.team_id]?.data?.map((el) => {
              if (el.user_id === user_id) {
                el.status = "offline";
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
        imgDomain: payload.data.img_domain,
        imgConfig: payload.data.img_config,
        loginGoogleUrl: payload.data.login_url,
      };
    }
    case actionTypes.LOGOUT: {
      return {
        ...initialState,
        imgDomain,
        imgConfig,
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
    case actionTypes.CURRENT_TEAM_SUCCESS: {
      const {
        lastChannelId,
        resChannel,
        directChannelUser,
        teamUsersRes,
        resSpace,
      } = payload;
      let channel: Channel = initialState.currentChannel;
      if (directChannelUser && lastChannelId) {
        const directChannelData = resChannel.data.find(
          (c) => c?.channel_id === directChannelUser.direct_channel
        );
        channel = {
          channel_id: lastChannelId,
          channel_name: "",
          channel_type: "Direct",
          seen: true,
          user: directChannelUser,
          channel_member: directChannelData?.channel_member || [],
          notification_type:
            resChannel.data.find(
              (c) => c?.channel_id === directChannelUser.direct_channel
            )?.notification_type || "Alert",
        };
      } else if (resChannel?.data?.length > 0) {
        channel =
          resChannel.data.find(
            (c) =>
              c.channel_id === lastChannelId ||
              c.channel_id === lastChannel?.[payload.team.team_id]?.channel_id
          ) || resChannel.data.filter((c) => c.channel_type !== "Direct")[0];
        if (channel?.channel_type === "Direct") {
          channel.user = teamUsersRes?.data?.find(
            (u) => u.direct_channel === channel.channel_id
          );
        }
      }
      setCookie(AsyncKey.lastChannelId, channel?.channel_id);
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [payload.team.team_id]: resChannel.data.filter(
            (el) => el.channel_type !== "Direct"
          ),
        },
        spaceChannelMap: {
          ...spaceChannelMap,
          [payload.team.team_id]: resSpace?.data?.map((el) => {
            const lastExpand = spaceChannelMap[payload.team.team_id]?.find(
              (space) => space.space_id === el.space_id
            )?.is_expand;
            el.is_expand = lastExpand;
            el.channel_ids = resChannel.data
              ?.filter((c) => c.space_id === el.space_id)
              .map((c) => c.channel_id);
            return el;
          }),
        },
        directChannel: resChannel.data.filter(
          (el) => el.channel_type === "Direct"
        ),
        currentTeam: payload.team,
        currentChannel: channel,
        lastChannel: {
          ...lastChannel,
          [payload.team.team_id]: channel,
        },
        memberData: {
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
        },
      };
    }
    case actionTypes.CREATE_TEAM_SUCCESS: {
      return {
        ...state,
        team: [...(team || []), payload],
      };
    }
    case actionTypes.SET_CURRENT_CHANNEL: {
      if (payload.communityId) {
        lastChannel[payload.communityId] = payload.channel;
      } else {
        lastChannel[state?.currentTeam?.team_id] = payload.channel;
      }
      return {
        ...state,
        currentChannel: payload.channel,
        lastChannel,
        channelMap: {
          ...channelMap,
          [currentTeam.team_id]: channelMap[currentTeam.team_id]?.map((c) => {
            if (c.channel_id === payload.channel.channel_id) {
              c.seen = true;
              return { ...c };
            }
            return c;
          }),
        },
      };
    }
    case actionTypes.UPDATE_GROUP_CHANNEL: {
      const { channelId, spaceId } = payload;
      const space = spaceChannelMap[currentTeam.team_id]?.find(
        (g) => g.space_id === spaceId
      );
      if (!space) return state;
      return {
        ...state,
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeam.team_id]: spaceChannelMap[currentTeam.team_id]?.map(
            (el) => {
              if (el.space_id === spaceId) {
                el.channel_ids = [...el.channel_ids, channelId];
              } else {
                el.channel_ids = el.channel_ids.filter(
                  (id) => id !== channelId
                );
              }
              return el;
            }
          ),
        },
      };
    }
    case actionTypes.MARK_SEEN_CHANNEL: {
      const { channel_id } = payload;
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [currentTeam.team_id]: channelMap[currentTeam.team_id]?.map((el) => {
            if (el.channel_id === channel_id) {
              return {
                ...el,
                seen: true,
              };
            }
            return el;
          }),
        },
      };
    }
    case actionTypes.MARK_UN_SEEN_CHANNEL: {
      const { channelId } = payload;
      const unSeenChannel =
        channelMap[currentTeam.team_id]?.find(
          (el) => el.channel_id === channelId
        ) || directChannel.find((el) => el.channel_id === channelId);
      if (!unSeenChannel?.seen) {
        return state;
      }
      const spaceId = unSeenChannel?.space_id;
      if (!spaceId) {
        return {
          ...state,
          directChannel: directChannel.map((el) => {
            if (el.channel_id === channelId) {
              el.seen = false;
              return { ...el };
            }
            return el;
          }),
        };
      }
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [currentTeam.team_id]: channelMap[currentTeam.team_id]?.map((el) => {
            if (el.channel_id === channelId) {
              return {
                ...el,
                seen: false,
              };
            }
            return el;
          }),
        },
      };
    }
    case actionTypes.TEAM_SUCCESS: {
      return {
        ...state,
        team: payload.team,
      };
    }
    case actionTypes.DELETE_CHANNEL_REQUEST: {
      const channel = channelMap[currentTeam.team_id] || [];
      const teamUserData = teamUserMap[currentTeam.team_id]?.data;
      const currentIdx = channel.findIndex(
        (el) => el.channel_id === currentChannel.channel_id
      );
      const newChannel = channel.filter(
        (el) => el.channel_id !== payload.channelId
      );
      let newCurrentChannel = initialState.currentChannel;
      if (currentChannel.channel_id === payload.channelId) {
        newCurrentChannel =
          newChannel?.[currentIdx] ||
          newChannel?.[0] ||
          initialState.currentChannel;
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
      const channel = channelMap[currentTeam.team_id] || [];
      const teamUserData = teamUserMap[currentTeam.team_id]?.data;
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
      let newCurrentChannel = initialState.currentChannel;
      if (currentChannel.channel_id === payload.channelId) {
        newCurrentChannel =
          newChannel?.[currentIdx] ||
          newChannel?.[0] ||
          initialState.currentChannel;
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
          [currentTeam.team_id]: newChannel,
        },
        directChannel: newDirectChannel,
        currentChannel: newCurrentChannel,
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeam.team_id]: spaceChannelMap[currentTeam.team_id]?.map(
            (el) => {
              if (el.space_id === spaceId) {
                el.channel_ids = el.channel_ids?.filter(
                  (id) => id !== payload.channelId
                );
              }
              return el;
            }
          ),
        },
      };
    }
    case actionTypes.UPDATE_CHANNEL_SUCCESS: {
      return {
        ...state,
        channelMap: {
          ...channelMap,
          [currentTeam.team_id]: channelMap[currentTeam.team_id]?.map((el) => {
            if (el.channel_id === payload.channel_id) {
              return { ...el, ...payload };
            }
            return el;
          }),
        },
        currentChannel:
          currentChannel.channel_id === payload.channel_id
            ? { ...currentChannel, ...payload }
            : currentChannel,
      };
    }
    case actionTypes.CREATE_CHANNEL_SUCCESS: {
      return {
        ...state,
        lastChannel: {
          ...lastChannel,
          [currentTeam.team_id]: payload,
        },
        spaceChannelMap: {
          ...spaceChannelMap,
          [currentTeam.team_id]: spaceChannelMap[currentTeam.team_id].map(
            (el) => {
              if (el.space_id === payload.space_id) {
                el.is_expand = true;
              }
              return el;
            }
          ),
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
            data: teamUserMap[payload.teamId]?.data?.filter(
              (el) => el.user_id !== payload.userId
            ),
            total: teamUserMap[payload.teamId]?.total - 1,
          },
        },
      };
    }
    case actionTypes.LEAVE_TEAM_SUCCESS: {
      if (payload.teamId === currentTeam.team_id) {
        return {
          ...state,
          directChannel: [],
          currentChannel: {
            channel_id: "",
            channel_member: [],
            channel_name: "",
            channel_type: "Public",
            notification_type: "",
            seen: true,
          },
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
        currentTeam:
          currentTeam.team_id === teamId
            ? { ...currentTeam, ...body }
            : currentTeam,
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
        currentTeam:
          currentTeam.team_id === teamId ? newTeam?.[0] : currentTeam,
        team: newTeam,
      };
    }
    default:
      return state;
  }
};

export default userReducers;
