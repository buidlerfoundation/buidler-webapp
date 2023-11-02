import React from "react";
import useAppSelector from "./useAppSelector";

function useFeedFilters() {
  const feedFilters = useAppSelector((state) => state.homeFeed.filters);

  return React.useMemo(() => feedFilters, [feedFilters]);
}

export default useFeedFilters;
