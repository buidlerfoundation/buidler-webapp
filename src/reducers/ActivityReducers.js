import actionTypes from '../actions/ActionTypes';

const initialState = {
  activityData: {},
};

const messageReducers = (state = initialState, action) => {
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
