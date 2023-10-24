import React from "react";
import useAppSelector from "./useAppSelector";

function useFeedData(filter: string) {
  const feedMap = useAppSelector((state) => state.homeFeed.feedMap);
  return React.useMemo(() => feedMap?.[filter], [feedMap, filter]);
}

export default useFeedData;
