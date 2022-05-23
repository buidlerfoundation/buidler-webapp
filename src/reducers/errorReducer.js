const errorReducers = (state = {}, action) => {
  const { type, payload } = action;
  const matches = /(.*)_(REQUEST|FAIL)/.exec(type);

  // not a *_REQUEST / *_FAIL actions, so we ignore them
  if (!matches) {
    return state;
  }

  const [, requestName, requestState] = matches;
  return {
    ...state,
    // Store errorMessage
    // e.g. stores errorMessage when receiving *_FAIL
    //      else clear errorMessage when receiving *_REQUEST
    [requestName]: requestState === "FAIL" ? payload?.message : "",
  };
};

export default errorReducers;
