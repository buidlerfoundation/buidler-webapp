import React from "react";
import useAppSelector from "./useAppSelector";

function useUserTabs() {
  const userTabs = useAppSelector((state) => state.insights.userTabs);

  return React.useMemo(() => userTabs, [userTabs]);
}

export default useUserTabs;
