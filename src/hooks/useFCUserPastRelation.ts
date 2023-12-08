import React from "react";
import useAppSelector from "./useAppSelector";

function useFCUserPastRelation(username?: string) {
  const pastRelationMap = useAppSelector(
    (state) => state.insights.pastRelationMap
  );
  return React.useMemo(
    () => pastRelationMap?.[username || ""],
    [pastRelationMap, username]
  );
}

export default useFCUserPastRelation;
