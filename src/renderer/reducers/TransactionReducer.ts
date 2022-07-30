import { AnyAction, Reducer } from "redux";
import actionTypes from "renderer/actions/ActionTypes";
import { TransactionApiData } from "renderer/models";

type TransactionReducerState = {
  data: Array<TransactionApiData>;
  metadata: {
    page: number;
    canMore: boolean;
  };
};

const initialState: TransactionReducerState = {
  data: [],
  metadata: {
    page: 1,
    canMore: true,
  },
};

const transactionReducers: Reducer<TransactionReducerState, AnyAction> = (
  state = initialState,
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.TRANSACTION_SUCCESS: {
      const { data, page, canMore } = payload;
      return {
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
