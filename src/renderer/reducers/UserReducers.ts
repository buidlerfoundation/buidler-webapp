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
  channel: Array<Channel>;
  directChannel: Array<Channel>;
  spaceChannel: Array<Space>;
  currentTeam: Community;
  currentChannel: Channel;
  imgDomain: string;
  imgConfig: any;
  teamUserData: Array<UserData>;
  totalTeamUser: number;
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
  channel: [],
  directChannel: [],
  spaceChannel: [],
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
  teamUserData: [],
  totalTeamUser: 0,
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
  const { type, payload } = action;
  switch (type) {
    case actionTypes.MEMBER_DATA_SUCCESS: {
      const { role, page, data, total } = payload;
      const { memberData } = state;
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
        spaceChannel: state.spaceChannel.map((el) => {
          if (el.space_id === spaceId) {
            el.is_expand = isExpand;
          }
          return el;
        }),
      };
    }
    case actionTypes.ACCEPT_TEAM_SUCCESS: {
      return {
        ...state,
        team: [...(state.team || []), payload],
      };
    }
    case actionTypes.CLEAR_LAST_CHANNEL: {
      return {
        ...state,
        lastChannel: {
          ...state.lastChannel,
          [payload.communityId]: null,
        },
      };
    }
    case actionTypes.ADD_USER_TO_SPACE: {
      return {
        ...state,
        channel: [...state.channel, ...payload.channelFromSpace],
        spaceChannel: state.spaceChannel.map((el) => {
          if (el.space_id === payload.space_id) {
            el.channels = [...(el.channels || []), ...payload.channelFromSpace];
            el.is_space_member = true;
          }
          return el;
        }),
      };
    }
    case actionTypes.REMOVE_USER_FROM_SPACE: {
      return {
        ...state,
        channel: state.channel.filter((el) => el.space_id !== payload.space_id),
        spaceChannel: state.spaceChannel.map((el) => {
          if (el.space_id === payload.space_id) {
            el.channels = [];
            el.is_space_member = false;
          }
          return el;
        }),
      };
    }
    case actionTypes.ADD_USER_TOKEN: {
      const newWalletBalance = state.walletBalance
        ? {
            ...state.walletBalance,
            tokens: [
              ...(state.walletBalance.tokens || []).filter(
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
          payload.user_id === state.userData.user_id
            ? {
                ...state.userData,
                ...payload,
              }
            : state.userData,
        teamUserData: state.teamUserData.map((el) => {
          if (el.user_id === payload.user_id) {
            return {
              ...el,
              ...payload,
            };
          }
          return el;
        }),
      };
    }
    case actionTypes.NEW_USER: {
      return {
        ...state,
        teamUserData: [...state.teamUserData, payload],
        totalTeamUser: state.totalTeamUser + 1,
      };
    }
    case actionTypes.NEW_CHANNEL: {
      let newTeamUserData = state.teamUserData;
      const { currentChannel } = state;
      if (payload.channel_type === "Direct") {
        newTeamUserData = newTeamUserData.map((el) => {
          if (
            !!payload.channel_member.find((id) => id === el.user_id) &&
            (el.user_id !== state.userData.user_id ||
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
        channel:
          payload.channel_type === "Direct"
            ? state.channel
            : [...state.channel, payload],
        directChannel:
          payload.channel_type === "Direct"
            ? [...state.directChannel, payload]
            : state.directChannel,
        teamUserData: newTeamUserData,
        currentChannel,
        spaceChannel: state.spaceChannel.map((el) => {
          if (el.space_id === payload.space_id) {
            el.channels = [...(el.channels || []), payload];
          }
          return el;
        }),
      };
    }
    case actionTypes.DELETE_GROUP_CHANNEL_SUCCESS: {
      const { currentChannel, channel } = state;
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
        spaceChannel: state.spaceChannel.filter(
          (el) => el.space_id !== payload.spaceId
        ),
        channel: nextChannels,
        currentChannel: newCurrentChannel,
      };
    }
    case actionTypes.CREATE_GROUP_CHANNEL_SUCCESS: {
      return {
        ...state,
        spaceChannel: [...state.spaceChannel, payload],
      };
    }
    case actionTypes.UPDATE_GROUP_CHANNEL_SUCCESS: {
      return {
        ...state,
        spaceChannel: state.spaceChannel.map((el) => {
          if (el.space_id === payload.space_id) {
            return {
              ...el,
              ...payload,
              attachment: null,
            };
          }
          return el;
        }),
      };
    }
    case actionTypes.UPDATE_SPACE_AVATAR_FAIL: {
      return {
        ...state,
        spaceChannel: state.spaceChannel.map((el) => {
          if (el.space_id === payload.spaceId) {
            return {
              ...el,
              attachment: null,
            };
          }
          return el;
        }),
      };
    }
    // case actionTypes.UPDATE_SPACE_AVATAR_SUCCESS: {
    //   return {
    //     ...state,
    //     spaceChannel: state.spaceChannel.map((el) => {
    //       if (el.space_id === payload.space_id) {
    //         return {
    //           ...el,
    //           ...payload,
    //           attachment: null,
    //         };
    //       }
    //       return el;
    //     }),
    //   };
    // }
    case actionTypes.UPDATE_SPACE_AVATAR_REQUEST: {
      return {
        ...state,
        spaceChannel: state.spaceChannel.map((el) => {
          if (el.space_id === payload.spaceId) {
            return {
              ...el,
              attachment: payload.attachment,
            };
          }
          return el;
        }),
      };
    }
    case actionTypes.UPDATE_CHANNEL_AVATAR_FAIL: {
      return {
        ...state,
        channel: state.channel.map((el) => {
          if (el.channel_id === payload.channelId) {
            return {
              ...el,
              attachment: null,
            };
          }
          return el;
        }),
        currentChannel:
          state.currentChannel.channel_id === payload.channel_id
            ? { ...state.currentChannel, ...payload, attachment: null }
            : state.currentChannel,
      };
    }
    case actionTypes.UPDATE_CHANNEL_AVATAR_REQUEST: {
      return {
        ...state,
        channel: state.channel.map((el) => {
          if (el.channel_id === payload.channelId) {
            return {
              ...el,
              attachment: payload.attachment,
            };
          }
          return el;
        }),
        currentChannel:
          state.currentChannel.channel_id === payload.channelId
            ? { ...state.currentChannel, attachment: payload.attachment }
            : state.currentChannel,
      };
    }
    case actionTypes.USER_ONLINE: {
      const { user_id } = payload;
      return {
        ...state,
        teamUserData: state.teamUserData.map((el) => {
          if (el.user_id === user_id) {
            el.status = "online";
          }
          return el;
        }),
      };
    }
    case actionTypes.USER_OFFLINE: {
      const { user_id } = payload;
      return {
        ...state,
        teamUserData: state.teamUserData.map((el) => {
          if (el.user_id === user_id) {
            el.status = "offline";
          }
          return el;
        }),
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
        imgDomain: state.imgDomain,
        imgConfig: state.imgConfig,
      };
    }
    case actionTypes.GET_TEAM_USER: {
      const { teamUsers } = payload;
      return {
        ...state,
        teamUserData: teamUsers.data,
        totalTeamUser: teamUsers?.metadata?.total,
      };
    }
    case actionTypes.USER_SUCCESS: {
      return {
        ...state,
        userData: payload.user,
      };
    }
    case actionTypes.GROUP_CHANNEL: {
      return {
        ...state,
        spaceChannel: payload,
      };
    }
    case actionTypes.SET_CURRENT_TEAM: {
      const {
        lastChannelId,
        resChannel,
        directChannelUser,
        team,
        teamUsersRes,
      } = payload;
      let channel: Channel = initialState.currentChannel;
      if (directChannelUser && lastChannelId) {
        const directChannel = resChannel.data.find(
          (c) => c?.channel_id === directChannelUser.direct_channel
        );
        channel = {
          channel_id: lastChannelId,
          channel_name: "",
          channel_type: "Direct",
          seen: true,
          user: directChannelUser,
          channel_member: directChannel?.channel_member || [],
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
              c.channel_id === state.lastChannel?.[team.team_id]?.channel_id
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
        channel: resChannel.data.filter((el) => el.channel_type !== "Direct"),
        directChannel: resChannel.data.filter(
          (el) => el.channel_type === "Direct"
        ),
        currentTeam: team,
        currentChannel: channel,
        lastChannel: {
          ...state.lastChannel,
          [team.team_id]: channel,
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
        team: [...(state.team || []), payload],
      };
    }
    case actionTypes.SET_CURRENT_CHANNEL: {
      const lastChannel = state.lastChannel;
      if (payload.communityId) {
        lastChannel[payload.communityId] = payload.channel;
      } else {
        lastChannel[state?.currentTeam?.team_id] = payload.channel;
      }
      return {
        ...state,
        currentChannel: payload.channel,
        lastChannel,
        channel:
          payload.channel.channel_type === "Direct"
            ? state.channel.map((c) => {
                if (c.channel_id === payload.channel.channel_id) {
                  c.seen = true;
                  return { ...c };
                }
                return c;
              })
            : state.channel,
        spaceChannel:
          payload.channel.channel_type !== "Direct"
            ? state.spaceChannel.map((el) => {
                if (el.space_id === payload?.channel?.space_id) {
                  el.channels = el.channels?.map((c) => {
                    if (c.channel_id === payload?.channel?.channel_id) {
                      c.seen = true;
                      return { ...c };
                    }
                    return c;
                  });
                  return { ...el };
                }
                return el;
              })
            : state.spaceChannel,
      };
    }
    case actionTypes.UPDATE_GROUP_CHANNEL: {
      const { channelId, spaceId } = payload;
      const space = state.spaceChannel.find((g) => g.space_id === spaceId);
      if (!space) return state;
      return {
        ...state,
        channel: state.channel.map((c) => {
          if (c.channel_id === channelId) {
            c.space_id = spaceId;
            c.space = space;
          }
          return c;
        }),
      };
    }
    case actionTypes.MARK_UN_SEEN_CHANNEL: {
      const { channelId } = payload;
      const unSeenChannel =
        state.channel.find((el) => el.channel_id === channelId) ||
        state.directChannel.find((el) => el.channel_id === channelId);
      if (!unSeenChannel?.seen) {
        return state;
      }
      const spaceId = state.channel.find(
        (el) => el.channel_id === channelId
      )?.space_id;
      if (!spaceId) {
        return {
          ...state,
          directChannel: state.directChannel.map((el) => {
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
        spaceChannel: state.spaceChannel.map((el) => {
          if (el.space_id === spaceId) {
            el.channels = el.channels?.map((c) => {
              if (c.channel_id === channelId) {
                c.seen = false;
                return { ...c };
              }
              return c;
            });
            return { ...el };
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
    case actionTypes.CHANNEL_SUCCESS: {
      return {
        ...state,
        channel: payload.channel.filter((el) => el.channel_type !== "Direct"),
        directChannel: payload.channel.filter(
          (el) => el.channel_type === "Direct"
        ),
        spaceChannel: state.spaceChannel.map((el) => {
          el.channels = payload.channel.filter(
            (c) => c.space_id === el.space_id
          );
          return el;
        }),
      };
    }
    case actionTypes.DELETE_CHANNEL_REQUEST: {
      const { currentChannel, channel, teamUserData } = state;
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
          ...state.lastChannel,
          [payload.communityId]: newCurrentChannel,
        },
      };
    }
    case actionTypes.DELETE_CHANNEL_SUCCESS: {
      const { currentChannel, channel, teamUserData, directChannel } = state;
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
        channel: newChannel,
        directChannel: newDirectChannel,
        currentChannel: newCurrentChannel,
        spaceChannel: state.spaceChannel.map((el) => {
          if (el.space_id === spaceId) {
            el.channels = el.channels?.filter(
              (c) => c.channel_id !== payload.channelId
            );
          }
          return el;
        }),
      };
    }
    case actionTypes.UPDATE_CHANNEL_SUCCESS: {
      return {
        ...state,
        spaceChannel: state.spaceChannel.map((el) => {
          if (el.space_id === payload.space_id) {
            el.channels = el.channels.map((c) => {
              if (c.channel_id === payload.channel_id) {
                return { ...c, ...payload };
              }
              return c;
            });
          }
          return el;
        }),
        channel: state.channel.map((el) => {
          if (el.channel_id === payload.channel_id) {
            return { ...el, ...payload };
          }
          return el;
        }),
        currentChannel:
          state.currentChannel.channel_id === payload.channel_id
            ? { ...state.currentChannel, ...payload }
            : state.currentChannel,
      };
    }
    case actionTypes.CREATE_CHANNEL_SUCCESS: {
      return {
        ...state,
        lastChannel: {
          ...state.lastChannel,
          [state.currentTeam.team_id]: payload,
        },
        spaceChannel: state.spaceChannel.map((el) => {
          if (el.space_id === payload.space_id) {
            el.is_expand = true;
          }
          return el;
        }),
      };
    }
    case actionTypes.REMOVE_MEMBER_SUCCESS: {
      return {
        ...state,
        teamUserData: state.teamUserData.filter(
          (el) => el.user_id !== payload.userId
        ),
        totalTeamUser: state.totalTeamUser - 1,
      };
    }
    case actionTypes.LEAVE_TEAM_SUCCESS: {
      if (payload.teamId === state.currentTeam.team_id) {
        return {
          ...state,
          channel: [],
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
          ...state.userData,
          user_channels: payload.channels.map((el) => el.channel_id),
        },
      };
    }
    case actionTypes.UPDATE_TEAM_SUCCESS: {
      const { teamId, body } = payload;
      return {
        ...state,
        currentTeam:
          state.currentTeam.team_id === teamId
            ? { ...state.currentTeam, ...body }
            : state.currentTeam,
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
      const newTeam = state?.team?.filter((el) => el.team_id !== teamId);
      return {
        ...state,
        currentTeam:
          state.currentTeam.team_id === teamId
            ? newTeam?.[0]
            : state.currentTeam,
        team: newTeam,
      };
    }
    default:
      return state;
  }
};

export default userReducers;
