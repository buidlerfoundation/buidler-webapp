import React from "react";
import useAppSelector from "./useAppSelector";

function useFCUserActiveBadgeCheck(username?: string) {
  const activeBadgeCheckMap = useAppSelector(
    (state) => state.insights.activeBadgeCheckMap
  );
  return React.useMemo(
    () => activeBadgeCheckMap?.[username || ""],
    [activeBadgeCheckMap, username]
  );
}

export default useFCUserActiveBadgeCheck;
