import React, { useMemo } from "react";
import { useRouteMatch } from "react-router-dom";
import { DirectCommunity } from "renderer/common/AppConfig";
import useAppSelector from "./useAppSelector";

function useMatchChannelId() {
  const match = useRouteMatch<{
    match_channel_id?: string;
    match_community_id?: string;
  }>();
  const currentChannelId = useAppSelector(
    (state) => state.user.currentChannelId
  );
  const { match_community_id, match_channel_id } = useMemo(
    () => match.params,
    [match.params]
  );

  return React.useMemo(
    () =>
      match_community_id === DirectCommunity.team_id
        ? match_channel_id || ""
        : match_channel_id || currentChannelId,
    [currentChannelId, match_channel_id, match_community_id]
  );
}

export default useMatchChannelId;
