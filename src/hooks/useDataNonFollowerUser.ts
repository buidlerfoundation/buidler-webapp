import React from "react";
import useAppSelector from "./useAppSelector";

function useDataNonFollowerUser(username?: string) {
  const dataNonFollowerUser = useAppSelector(
    (state) => state.fcAnalytic.nonFollowUserMap
  );
  return React.useMemo(
    () => dataNonFollowerUser?.[username || ""],
    [dataNonFollowerUser, username]
  );
}

export default useDataNonFollowerUser;
