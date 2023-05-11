import { AnyAction, Reducer } from "redux";
import actionTypes from "renderer/actions/ActionTypes";
import { LocalAttachment } from "renderer/models";

type DraftReducerState = {
  data: { [key: string]: { text?: string } };
  attachmentData: { [key: string]: { attachments: LocalAttachment[] } };
};

const initialState: DraftReducerState = {
  data: {},
  attachmentData: {},
};

const draftReducers: Reducer<DraftReducerState, AnyAction> = (
  state = initialState,
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.UPDATE_ATTACHMENT_DRAFT: {
      const { entityId, attachments } = payload;
      return {
        ...state,
        attachmentData: {
          ...state.attachmentData,
          [entityId]: {
            attachments,
          },
        },
      };
    }
    case actionTypes.INITIAL_DRAFT: {
      return {
        data: payload,
        attachmentData: {},
      };
    }
    case actionTypes.UPDATE_DRAFT: {
      const { entityId, text } = payload;
      return {
        ...state,
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
