import React from "react";
import useAppSelector from "./useAppSelector";

function useFCUserPastRelationReaction(username?: string) {
  const pastRelationReactionMap = useAppSelector(
    (state) => state.insights.pastRelationReactionMap
  );
  return React.useMemo(
    () => pastRelationReactionMap?.[username || ""],
    [pastRelationReactionMap, username]
  );
}

export default useFCUserPastRelationReaction;
