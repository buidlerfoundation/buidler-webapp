import React from "react";
import useAppSelector from "./useAppSelector";

function useFCUserDataEngagement(username?: string) {
  const dataEngagementMap = useAppSelector(
    (state) => state.insights.dataEngagementMap
  );
  return React.useMemo(
    () => dataEngagementMap?.[username || ""],
    [dataEngagementMap, username]
  );
}

export default useFCUserDataEngagement;
