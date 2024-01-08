import React from "react";
import useAppSelector from "./useAppSelector";

function useReportFeedData(filter: string) {
  const reportMap = useAppSelector((state) => state.communityNote.reportMap);
  return React.useMemo(() => reportMap?.[filter], [reportMap, filter]);
}

export default useReportFeedData;
