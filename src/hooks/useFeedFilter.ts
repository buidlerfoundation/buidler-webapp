import React from "react";
import useAppSelector from "./useAppSelector";

function useFeedFilter() {
  const feedFilter = useAppSelector((state) => state.homeFeed.currentFilter);

  return React.useMemo(() => feedFilter, [feedFilter]);
}

export default useFeedFilter;
