import actionTypes from 'actions/ActionTypes';

const initialState = {
  privateKey: '',
  seed: '',
  channelPrivateKey: {},
  openOTP: false,
  requestOtpCode: '',
  dataFromUrl: '',
};

const configReducers = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.SET_DATA_FROM_URL: {
      return {
        ...state,
        dataFromUrl: payload,
      };
    }
    case actionTypes.REMOVE_DATA_FROM_URL: {
      return {
        ...state,
        dataFromUrl: '',
      };
    }
    case actionTypes.TOGGLE_OTP: {
      return {
        ...state,
        openOTP: payload?.open != null ? payload?.open : !state.openOTP,
        requestOtpCode: payload?.otp || '',
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
        seed: '',
      };
    }
    case actionTypes.REMOVE_PRIVATE_KEY: {
      return {
        ...state,
        privateKey: '',
      };
    }
    case actionTypes.LOGOUT: {
      return {
        privateKey: '',
        seed: '',
      };
    }
    default:
      return state;
  }
};

export default configReducers;
