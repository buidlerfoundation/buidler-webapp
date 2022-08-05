import React, { useMemo } from "react";
import { useRouteMatch } from "react-router-dom";
import useAppSelector from "./useAppSelector";

function useMatchChannelId() {
  const match = useRouteMatch<{
    match_channel_id?: string;
    match_community_id?: string;
  }>();
  const currentChannel = useAppSelector((state) => state.user.currentChannel);
  const { match_community_id, match_channel_id } = useMemo(
    () => match.params,
    [match.params]
  );

  return React.useMemo(
    () =>
      match_community_id === "user"
        ? currentChannel.channel_id
        : match_channel_id || currentChannel.channel_id,
    [currentChannel.channel_id, match_channel_id, match_community_id]
  );
}

export default useMatchChannelId;
