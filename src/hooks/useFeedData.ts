import React from "react";
import useFeedFilter from "./useFeedFilter";
import useAppSelector from "./useAppSelector";

function useFeedData() {
  const feedFilter = useFeedFilter();
  const feedMap = useAppSelector((state) => state.homeFeed.feedMap);

  return React.useMemo(
    () => feedMap?.[feedFilter.label],
    [feedFilter.label, feedMap]
  );
}

export default useFeedData;
