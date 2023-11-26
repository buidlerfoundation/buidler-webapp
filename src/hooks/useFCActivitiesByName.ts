import React from "react";
import useAppSelector from "./useAppSelector";
import { ActivityPeriod } from "models/FC";

function useFCActivitiesByName(username?: string, period?: ActivityPeriod) {
  const activityMap = useAppSelector((state) => state.insights.activityMap);
  return React.useMemo(
    () => activityMap?.[username || ""]?.[period || "1d"],
    [activityMap, period, username]
  );
}

export default useFCActivitiesByName;
