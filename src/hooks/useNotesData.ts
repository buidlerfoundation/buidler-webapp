import React from "react";
import useAppSelector from "./useAppSelector";

function useNotesData(url: string) {
  const feedMap = useAppSelector((state) => state.communityNote.feedMap);
  return React.useMemo(() => feedMap?.[url], [feedMap, url]);
}

export default useNotesData;
