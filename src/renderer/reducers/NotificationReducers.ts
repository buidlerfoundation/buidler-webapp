import { AnyAction, Reducer } from "redux";
import actionTypes from "renderer/actions/ActionTypes";
import { NotificationData, NotificationFilterType } from "renderer/models";

type NotificationReducerState = {
  data: {
    All: NotificationData[];
    Mention: NotificationData[];
    Unread: NotificationData[];
  };
  canMore: boolean;
  currentFilter: NotificationFilterType;
};

const initialState: NotificationReducerState = {
  data: {
    All: [],
    Mention: [],
    Unread: [],
  },
  canMore: false,
  currentFilter: "All",
};

const notificationReducers: Reducer<NotificationReducerState, AnyAction> = (
  state = initialState,
  action
) => {
  const { type, payload } = action;
  const { currentFilter } = state;
  switch (type) {
    case actionTypes.UPDATE_ACTIVE_NOTIFICATION_FILTER: {
      return {
        ...state,
        currentFilter: payload,
      };
    }
    case actionTypes.RECEIVE_NOTIFICATION: {
      const newData = [...state.data[currentFilter]];
      if (
        currentFilter === "All" ||
        currentFilter === "Unread" ||
        payload.notification_type === "channel_mention" ||
        payload.notification_type === "post_mention"
      ) {
        newData.unshift(payload);
      }
      return {
        ...state,
        data: {
          ...state.data,
          [currentFilter]: newData,
        },
      };
    }
    case actionTypes.NOTIFICATION_SUCCESS: {
      const { data, before, metadata, filterType } = payload;
      const notifications = before
        ? [...state.data[filterType], ...data]
        : data;
      return {
        ...state,
        data: {
          ...state.data,
          [filterType]: notifications,
        },
        canMore: notifications.length < metadata?.total,
      };
    }
    case actionTypes.MARK_AS_READ_NOTIFICATION: {
      return {
        ...state,
        data: {
          ...state.data,
          [currentFilter]: state.data[currentFilter].map((el) => {
            if (el.notification_id === payload) {
              return {
                ...el,
                is_read: true,
              };
            }
            return el;
          }),
        },
      };
    }
    case actionTypes.READ_ALL_NOTIFICATION: {
      return {
        ...state,
        data: {
          ...state.data,
          [currentFilter]: state.data[currentFilter].map((el) => ({
            ...el,
            is_read: true,
          })),
        },
      };
    }
    case actionTypes.DELETE_NOTIFICATION: {
      return {
        ...state,
        data: {
          ...state.data,
          [currentFilter]: state.data[currentFilter].filter(
            (el) => el.notification_id !== payload
          ),
        },
      };
    }
    default:
      return state;
  }
};

export default notificationReducers;
