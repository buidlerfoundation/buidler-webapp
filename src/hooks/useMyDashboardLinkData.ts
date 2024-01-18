import React from "react";
import useAppSelector from "./useAppSelector";

function useMyDashboardLinkData(filter: "notes" | "ratings") {
  const myDashboardLink = useAppSelector(
    (state) => state.communityNote.myDashboardLink
  );
  return React.useMemo(
    () => myDashboardLink?.[filter],
    [myDashboardLink, filter]
  );
}

export default useMyDashboardLinkData;
