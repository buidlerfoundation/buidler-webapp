import React from "react";
import useAppSelector from "./useAppSelector";

function useCommunityNoteFilters() {
  const communityNoteFilters = useAppSelector(
    (state) => state.communityNote.filters
  );

  return React.useMemo(() => communityNoteFilters, [communityNoteFilters]);
}

export default useCommunityNoteFilters;
