const loadingReducers = (state = {}, action) => {
  const { type } = action;
  const matches = /(.*)_(REQUEST|SUCCESS|FAIL)/.exec(type);

  // not a *_REQUEST / *_SUCCESS /  *_FAIL actions, so we ignore them
  if (!matches) {
    return state;
  }

  const [, requestName, requestState] = matches;

  return {
    ...state,
    // Store whether a request is happening at the moment or not
    // e.g. will be true when receiving *_REQUEST
    //      and false when receiving *_SUCCESS / *_FAIL
    [requestName]: requestState === 'REQUEST',
  };
};

export default loadingReducers;
