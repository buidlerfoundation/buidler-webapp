import actionTypes from '../actions/ActionTypes';
import { AsyncKey } from '../common/AppConfig';
import { setCookie } from '../common/Cookie';

const initialState = {
  userData: null,
  team: null,
  channel: [],
  spaceChannel: [],
  currentTeam: null,
  currentChannel: null,
  imgDomain: null,
  imgConfig: null,
  loginGoogleUrl: null,
  teamUserData: [],
  lastChannel: {},
  spaceMembers: [],
};

const userReducers = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.SPACE_MEMBER_SUCCESS: {
      return {
        ...state,
        spaceMembers: payload.data,
      };
    }
    case actionTypes.UPDATE_USER_SUCCESS: {
      return {
        ...state,
        userData: {
          ...state.userData,
          ...payload,
        },
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
      };
    }
    case actionTypes.NEW_CHANNEL: {
      let newTeamUserData = state.teamUserData;
      const { currentChannel } = state;
      if (payload.channel_type === 'Direct') {
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
        channel: [...state.channel, payload],
        teamUserData: newTeamUserData,
        currentChannel,
      };
    }
    case actionTypes.DELETE_GROUP_CHANNEL_SUCCESS: {
      return {
        ...state,
        spaceChannel: state.spaceChannel.filter(
          (el) => el.space_id !== payload.spaceId
        ),
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
            el.status = 'online';
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
            el.status = 'offline';
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
        ...state,
        userData: null,
        team: null,
        channel: [],
        spaceChannel: [],
        currentTeam: null,
        currentChannel: null,
        lastChannel: {},
        teamUserData: [],
      };
    }
    case actionTypes.GET_TEAM_USER: {
      const { teamUsers, teamId } = payload;
      return {
        ...state,
        teamUserData: teamUsers,
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
      let channel;
      if (directChannelUser && lastChannelId) {
        const directChannel = resChannel.data.find(
          (c) => c?.channel_id === directChannelUser.direct_channel
        );
        channel = {
          channel_id: lastChannelId,
          channel_name: '',
          channel_type: 'Direct',
          seen: true,
          user: directChannelUser,
          channel_member: directChannel?.channel_member || [],
          notification_type:
            resChannel.data.find(
              (c) => c?.channel_id === directChannelUser.direct_channel
            )?.notification_type || 'Alert',
        };
      } else if (resChannel?.data?.length > 0) {
        channel =
          resChannel.data.find(
            (c) =>
              c.channel_id === lastChannelId ||
              c.channel_id === state.lastChannel?.[team.team_id]?.channel_id
          ) || resChannel.data.filter((c) => c.channel_type !== 'Direct')[0];
        if (channel?.channel_type === 'Direct') {
          channel.user = teamUsersRes?.data?.find(
            (u) => u.direct_channel === channel.channel_id
          );
        }
      }
      setCookie(AsyncKey.lastChannelId, channel?.channel_id);
      return {
        ...state,
        currentTeam: team,
        currentChannel: channel,
        lastChannel: {
          ...state.lastChannel,
          [team.team_id]: channel,
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
      return {
        ...state,
        currentChannel: payload.channel,
        lastChannel: {
          ...state.lastChannel,
          [state?.currentTeam?.team_id]: payload.channel,
        },
        channel: state.channel.map((c) => {
          if (c?.channel_id === payload?.channel?.channel_id) {
            c.seen = true;
            c.notification_type = payload.channel.notification_type;
          }
          return c;
        }),
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
      return {
        ...state,
        channel: state.channel.map((c) => {
          if (c.channel_id === channelId) {
            c.seen = false;
          }
          return c;
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
        channel: payload.channel,
      };
    }
    case actionTypes.DELETE_CHANNEL_SUCCESS: {
      const { currentChannel, channel, teamUserData } = state;
      const currentIdx = channel.findIndex(
        (el) => el.channel_id === currentChannel.channel_id
      );
      const newChannel = channel.filter(
        (el) => el.channel_id !== payload.channelId
      );
      let newCurrentChannel = currentChannel;
      if (currentChannel.channel_id === payload.channelId) {
        newCurrentChannel = newChannel?.[currentIdx] || newChannel?.[0];
        if (newCurrentChannel.channel_type === 'Direct') {
          newCurrentChannel.user = teamUserData?.find(
            (u) => u.direct_channel === newCurrentChannel.channel_id
          );
        }
        setCookie(AsyncKey.lastChannelId, newCurrentChannel?.channel_id);
      }
      return {
        ...state,
        channel: newChannel,
        currentChannel: newCurrentChannel,
      };
    }
    case actionTypes.UPDATE_CHANNEL_SUCCESS: {
      return {
        ...state,
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
        currentChannel: payload,
        lastChannel: {
          ...state.lastChannel,
          [state.currentTeam.team_id]: payload,
        },
      };
    }
    case actionTypes.REMOVE_MEMBER_SUCCESS: {
      return {
        ...state,
        teamUserData: state.teamUserData.filter(
          (el) => el.user_id !== payload.userId
        ),
      };
    }
    case actionTypes.LEAVE_TEAM_SUCCESS: {
      return {
        ...state,
        team: state.team.filter((el) => el.team_id !== payload.teamId),
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
        team: state.team.map((el) => {
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
      const newTeam = state.team.filter((el) => el.team_id !== teamId);
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
