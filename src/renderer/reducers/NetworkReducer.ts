import { AnyAction, Reducer } from "redux";
import ChainId from "renderer/services/connectors/ChainId";
import actionTypes from "../actions/ActionTypes";

type NetworkReducerState = {
  chainId: number | string;
};

const initialState: NetworkReducerState = {
  chainId: process.env.REACT_APP_DEFAULT_CHAIN_ID || ChainId.EthereumMainnet,
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
