import { AnyAction, Reducer } from "redux";
import actionTypes from "renderer/actions/ActionTypes";
import { TransactionApiData } from "renderer/models";

type TransactionReducerState = {
  data: Array<TransactionApiData>;
  metadata: {
    page: number;
    canMore: boolean;
  };
  toastData: {
    title: string;
    message: string;
    hash: string;
    type: "success" | "error";
  } | null;
};

const initialState: TransactionReducerState = {
  data: [],
  metadata: {
    page: 1,
    canMore: true,
  },
  toastData: null,
};

const transactionReducers: Reducer<TransactionReducerState, AnyAction> = (
  state = initialState,
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.UPDATE_TRANSACTION_TOAST: {
      return {
        ...state,
        toastData: payload,
      };
    }
    case actionTypes.TRANSACTION_SUCCESS: {
      const { data, page, canMore } = payload;
      return {
        ...state,
        data: page > 1 ? [...state.data, ...data] : data,
        metadata: {
          page,
          canMore,
        },
      };
    }
    default:
      return state;
  }
};

export default transactionReducers;
