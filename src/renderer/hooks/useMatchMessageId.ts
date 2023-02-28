import React, { useMemo } from "react";
import { useRouteMatch } from "react-router-dom";

function useMatchMessageId() {
  const match = useRouteMatch<{
    entity_type?: string;
    entity_id?: string;
  }>();
  const { entity_type, entity_id } = useMemo(
    () => match.params,
    [match.params]
  );

  return React.useMemo(
    () => (entity_type === "message" && !!entity_id ? entity_id : ""),
    [entity_type, entity_id]
  );
}

export default useMatchMessageId;
