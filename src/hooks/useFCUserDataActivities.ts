import React from "react";
import useAppSelector from "./useAppSelector";

function useFCUserDataActivities(username?: string) {
  const dataActivityMap = useAppSelector(
    (state) => state.insights.dataActivityMap
  );
  return React.useMemo(
    () => dataActivityMap?.[username || ""],
    [dataActivityMap, username]
  );
}

export default useFCUserDataActivities;
