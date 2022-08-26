import React, { useMemo } from "react";
import { useRouteMatch } from "react-router-dom";

function useMatchPostId() {
  const match = useRouteMatch<{
    entity_type?: string;
    post_id?: string;
  }>();
  const { entity_type, post_id } = useMemo(() => match.params, [match.params]);

  return React.useMemo(
    () => (entity_type === "post" && !!post_id ? post_id : ""),
    [entity_type, post_id]
  );
}

export default useMatchPostId;
