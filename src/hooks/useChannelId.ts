import React, { useMemo } from "react";
import { useRouteMatch } from "react-router-dom";

function useChannelId() {
  const match = useRouteMatch<{
    channel_id?: string;
  }>();
  const channel_id = useMemo(
    () => match.params?.channel_id,
    [match.params?.channel_id]
  );

  return React.useMemo(() => channel_id || "", [channel_id]);
}

export default useChannelId;
