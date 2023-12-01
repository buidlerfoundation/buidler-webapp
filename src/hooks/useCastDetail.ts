import React from "react";
import useAppSelector from "./useAppSelector";

function useCastDetail(hash?: string) {
  const castDetailMap = useAppSelector((state) => state.homeFeed.castDetailMap);
  return React.useMemo(() => castDetailMap[hash || ""], [castDetailMap, hash]);
}

export default useCastDetail;
