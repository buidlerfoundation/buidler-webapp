import { AnyAction, Reducer } from "redux";
import ChainId from "renderer/services/connectors/ChainId";
import actionTypes from "../actions/ActionTypes";

type NetworkReducerState = {
  chainId: number | string;
  metaMaskAccount?: string;
};

const initialState: NetworkReducerState = {
  chainId: process.env.REACT_APP_DEFAULT_CHAIN_ID
    ? parseInt(process.env.REACT_APP_DEFAULT_CHAIN_ID)
    : ChainId.EthereumMainnet,
  metaMaskAccount: "",
};

const networkReducers: Reducer<NetworkReducerState, AnyAction> = (
  state = initialState,
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.SET_METAMASK_ACCOUNT: {
      return {
        ...state,
        metaMaskAccount: payload,
      };
    }
    case actionTypes.SWITCH_NETWORK: {
      return {
        ...state,
        chainId: payload,
      };
    }

    default:
      return state;
  }
};

export default networkReducers;
