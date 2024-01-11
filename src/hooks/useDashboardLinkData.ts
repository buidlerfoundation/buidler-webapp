import React from "react";
import useAppSelector from "./useAppSelector";

function useDashboardLinkData(filter: string) {
  const dashboardLinkMap = useAppSelector(
    (state) => state.communityNote.dashboardLinkMap
  );
  return React.useMemo(
    () => dashboardLinkMap?.[filter],
    [dashboardLinkMap, filter]
  );
}

export default useDashboardLinkData;
