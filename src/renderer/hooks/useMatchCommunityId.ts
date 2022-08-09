import React, { useMemo } from "react";
import { useRouteMatch } from "react-router-dom";
import useAppSelector from "./useAppSelector";

function useMatchCommunityId() {
  const match = useRouteMatch<{
    match_channel_id?: string;
    match_community_id?: string;
  }>();
  const currentTeamId = useAppSelector((state) => state.user.currentTeamId);
  const { match_community_id } = useMemo(() => match.params, [match.params]);

  return React.useMemo(
    () =>
      match_community_id === "user"
        ? currentTeamId
        : match_community_id || currentTeamId,
    [currentTeamId, match_community_id]
  );
}

export default useMatchCommunityId;
