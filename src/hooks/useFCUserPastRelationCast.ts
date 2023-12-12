import React from "react";
import useAppSelector from "./useAppSelector";

function useFCUserPastRelationCast(
  type: "mention" | "reply",
  username?: string
) {
  const pastRelationCastMap = useAppSelector(
    (state) => state.insights.pastRelationCastMap
  );
  return React.useMemo(
    () => pastRelationCastMap?.[type]?.[username || ""],
    [pastRelationCastMap, type, username]
  );
}

export default useFCUserPastRelationCast;
