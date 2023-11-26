import React from "react";
import useAppSelector from "./useAppSelector";

function useFCUserByName(username?: string) {
  const userMap = useAppSelector((state) => state.insights.userMap);
  return React.useMemo(() => userMap?.[username || ""], [userMap, username]);
}

export default useFCUserByName;
