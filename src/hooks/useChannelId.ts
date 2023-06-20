import React, { useMemo } from "react";
import { useParams } from "react-router-dom";

function useChannelId() {
  const params = useParams<{
    channel_id?: string;
  }>();
  const channel_id = useMemo(
    () => params?.channel_id,
    [params?.channel_id]
  );

  return React.useMemo(() => channel_id || "", [channel_id]);
}

export default useChannelId;
