import { useMemo } from "react";
import actionTypes from "renderer/actions/ActionTypes";
import { createLoadMoreSelector } from "renderer/reducers/selectors";
import useAppSelector from "./useAppSelector";

const loadMoreSelector = createLoadMoreSelector([
  actionTypes.MEMBER_DATA_PREFIX,
]);

const useLoadMoreMemberData = () => {
  const loadMore = useAppSelector((state) => loadMoreSelector(state));
  return useMemo(() => loadMore, [loadMore]);
};

export default useLoadMoreMemberData;
