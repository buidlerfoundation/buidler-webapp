import React from "react";
import { useRouteMatch } from "react-router-dom";

function useCommunityId() {
  const match = useRouteMatch<{
    community_id?: string;
  }>();
  return React.useMemo(
    () => match.params?.community_id || "",
    [match.params?.community_id]
  );
}

export default useCommunityId;
