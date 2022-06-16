import { ActionCreator, Dispatch } from 'redux';
import api from '../api';
import actionTypes from './ActionTypes';

export const getActivities: ActionCreator<any> = (taskId: string) => async (
  dispatch: Dispatch
) => {
  dispatch({
    type: actionTypes.ACTIVITY_REQUEST,
    payload: { taskId },
  });
  try {
    const activityRes = await api.getTaskActivity(taskId);
    if (activityRes.statusCode === 200) {
      dispatch({
        type: actionTypes.ACTIVITY_SUCCESS,
        payload: { data: activityRes.data, taskId },
      });
    } else {
      dispatch({
        type: actionTypes.ACTIVITY_FAIL,
        payload: {
          message: activityRes.message,
        },
      });
    }
  } catch (e) {
    dispatch({
      type: actionTypes.ACTIVITY_FAIL,
      payload: {
        message: e,
      },
    });
  }
};
