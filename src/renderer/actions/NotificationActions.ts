import { ActionCreator, Dispatch } from "redux";
import api from "renderer/api";
import { NotificationFilterType } from "renderer/models";
import actionTypes from "./ActionTypes";

export const getNotifications: ActionCreator<any> =
  (filterType: NotificationFilterType, before?: string) =>
  async (dispatch: Dispatch) => {
    if (before) {
      dispatch({ type: actionTypes.NOTIFICATION_MORE });
    } else {
      dispatch({ type: actionTypes.NOTIFICATION_REQUEST });
    }
    const res = await api.getNotification(filterType, before);
    if (res.statusCode === 200) {
      dispatch({
        type: actionTypes.NOTIFICATION_SUCCESS,
        payload: {
          before,
          data: res.data,
          metadata: res.metadata,
        },
      });
    } else {
      dispatch({
        type: actionTypes.NOTIFICATION_FAIL,
        payload: res,
      });
    }
  };

export const markAsReadNotification =
  (notificationId) => (dispatch: Dispatch) => {
    api.readNotification(notificationId);
    dispatch({
      type: actionTypes.MARK_AS_READ_NOTIFICATION,
      payload: notificationId,
    });
  };

export const markAsReadAllNotification = () => (dispatch: Dispatch) => {
  api.readAllNotification();
  dispatch({
    type: actionTypes.READ_ALL_NOTIFICATION,
  });
};

export const deleteNotification = (notificationId) => (dispatch: Dispatch) => {
  api.deleteNotification(notificationId);
  dispatch({
    type: actionTypes.DELETE_NOTIFICATION,
    payload: notificationId,
  });
};
