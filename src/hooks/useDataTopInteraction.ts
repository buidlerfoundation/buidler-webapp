import React from "react";
import useAppSelector from "./useAppSelector";

function useDataTopInteraction(username?: string) {
  const dataInteractionMap = useAppSelector(
    (state) => state.insights.dataInteractionMap
  );
  return React.useMemo(
    () => dataInteractionMap?.[username || ""],
    [dataInteractionMap, username]
  );
}

export default useDataTopInteraction;
