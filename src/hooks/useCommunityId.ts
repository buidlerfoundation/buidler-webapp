import React from "react";
import { useParams } from "react-router-dom";

function useCommunityId() {
  const params = useParams<{
    community_id?: string;
  }>();
  return React.useMemo(
    () => params?.community_id || "",
    [params?.community_id]
  );
}

export default useCommunityId;
