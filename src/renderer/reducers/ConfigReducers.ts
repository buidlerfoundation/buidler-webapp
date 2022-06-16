import { AnyAction, Reducer } from "redux";
import actionTypes from "renderer/actions/ActionTypes";

interface ConfigReducerState {
  privateKey: string;
  seed: string;
  channelPrivateKey: { [key: string]: any };
  openOTP: boolean;
  requestOtpCode: string;
  dataFromUrl: string;
  isFullScreen: boolean;
}

const initialState: ConfigReducerState = {
  privateKey: "",
  seed: "",
  channelPrivateKey: {},
  openOTP: false,
  requestOtpCode: "",
  dataFromUrl: "",
  isFullScreen: false,
};

const configReducers: Reducer<ConfigReducerState, AnyAction> = (
  state = initialState,
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.UPDATE_FULL_SCREEN: {
      return {
        ...state,
        isFullScreen: payload,
      };
    }
    case actionTypes.SET_DATA_FROM_URL: {
      return {
        ...state,
        dataFromUrl: payload,
      };
    }
    case actionTypes.REMOVE_DATA_FROM_URL: {
      return {
        ...state,
        dataFromUrl: "",
      };
    }
    case actionTypes.TOGGLE_OTP: {
      return {
        ...state,
        openOTP: payload?.open != null ? payload?.open : !state.openOTP,
        requestOtpCode: payload?.otp || "",
      };
    }
    case actionTypes.SET_CHANNEL_PRIVATE_KEY: {
      return {
        ...state,
        channelPrivateKey: payload,
      };
    }
    case actionTypes.SET_PRIVATE_KEY: {
      return {
        ...state,
        privateKey: payload,
      };
    }
    case actionTypes.SET_SEED_PHRASE: {
      return {
        ...state,
        seed: payload,
      };
    }
    case actionTypes.REMOVE_SEED_PHRASE: {
      return {
        ...state,
        seed: "",
      };
    }
    case actionTypes.REMOVE_PRIVATE_KEY: {
      return {
        ...state,
        privateKey: "",
      };
    }
    case actionTypes.LOGOUT: {
      return initialState;
    }
    default:
      return state;
  }
};

export default configReducers;
