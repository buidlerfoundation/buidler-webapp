import React from "react";
import useAppSelector from "./useAppSelector";

function useReportsData(url: string) {
  const reportsMap = useAppSelector((state) => state.communityNote.reportsMap);
  return React.useMemo(() => reportsMap?.[url], [reportsMap, url]);
}

export default useReportsData;
