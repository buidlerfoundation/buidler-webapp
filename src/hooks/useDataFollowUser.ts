import React from "react";
import useAppSelector from "./useAppSelector";
import { IUserTabPath } from "models/FC";

function useDataFollowUser(username?: string, path?: IUserTabPath) {
  const followUserMap = useAppSelector(
    (state) => state.fcAnalytic.followUserMap
  );
  return React.useMemo(
    () => followUserMap?.[username || ""]?.[path || ""],
    [followUserMap, path, username]
  );
}

export default useDataFollowUser;
