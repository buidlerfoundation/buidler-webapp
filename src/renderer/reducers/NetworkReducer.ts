import { AnyAction, Reducer } from "redux";
import ChainId from "renderer/services/connectors/ChainId";
import actionTypes from "../actions/ActionTypes";

type NetworkReducerState = {
  chainId: number;
};

const initialState: NetworkReducerState = {
  chainId: ChainId.EthereumMainnet,
};

const messageReducers: Reducer<NetworkReducerState, AnyAction> = (
  state = initialState,
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.SWITCH_NETWORK: {
      return {
        chainId: payload,
      };
    }

    default:
      return state;
  }
};

export default messageReducers;
