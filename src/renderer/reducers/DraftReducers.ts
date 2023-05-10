import { AnyAction, Reducer } from "redux";
import actionTypes from "renderer/actions/ActionTypes";

type DraftReducerState = {
  data: { [key: string]: { text: string } };
};

const initialState: DraftReducerState = {
  data: {},
};

const draftReducers: Reducer<DraftReducerState, AnyAction> = (
  state = initialState,
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.INITIAL_DRAFT: {
      return {
        data: payload,
      };
    }
    case actionTypes.UPDATE_DRAFT: {
      const { entityId, text } = payload;
      return {
        data: {
          ...state.data,
          [entityId]: {
            text,
          },
        },
      };
    }
    default:
      return state;
  }
};

export default draftReducers;
