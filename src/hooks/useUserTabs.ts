import React from "react";
import useAppSelector from "./useAppSelector";

function useUserTabs() {
  const userTabs = useAppSelector((state) => state.fcAnalytic.userTabs);

  return React.useMemo(() => userTabs, [userTabs]);
}

export default useUserTabs;
