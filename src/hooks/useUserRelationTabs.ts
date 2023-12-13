import React from "react";
import useAppSelector from "./useAppSelector";

function useUserRelationTabs() {
  const userRelationTabs = useAppSelector(
    (state) => state.insights.userRelationTabs
  );

  return React.useMemo(() => userRelationTabs, [userRelationTabs]);
}

export default useUserRelationTabs;
