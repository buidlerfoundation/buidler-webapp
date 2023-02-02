import { useMemo } from "react";
import actionTypes from "renderer/actions/ActionTypes";
import { createLoadingSelector } from "renderer/reducers/selectors";
import useAppSelector from "./useAppSelector";

const loadingSelector = createLoadingSelector([actionTypes.MESSAGE_PREFIX]);

const useMessageLoading = () => {
  const loading = useAppSelector((state) => loadingSelector(state));
  return useMemo(() => loading, [loading]);
};

export default useMessageLoading;
