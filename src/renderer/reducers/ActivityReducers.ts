import { AnyAction, Reducer } from 'redux';
import { TaskActivityData } from 'renderer/models';
import actionTypes from '../actions/ActionTypes';

type ActivityReducerState = {
  activityData: {
    [key: string]: {
      data: Array<TaskActivityData>;
    };
  };
};

const initialState: ActivityReducerState = {
  activityData: {},
};

const messageReducers: Reducer<ActivityReducerState, AnyAction> = (
  state = initialState,
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.ACTIVITY_SUCCESS: {
      return {
        activityData: {
          ...state.activityData,
          [payload.taskId]: {
            data: payload.data,
          },
        },
      };
    }

    default:
      return state;
  }
};

export default messageReducers;
