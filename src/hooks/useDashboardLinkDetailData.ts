import React from "react";
import useAppSelector from "./useAppSelector";

function useDashboardLinkDetailData(url: string) {
  const dashboardLinkDetailMap = useAppSelector(
    (state) => state.communityNote.dashboardLinkDetailMap
  );
  return React.useMemo(
    () => dashboardLinkDetailMap?.[url],
    [dashboardLinkDetailMap, url]
  );
}

export default useDashboardLinkDetailData;
