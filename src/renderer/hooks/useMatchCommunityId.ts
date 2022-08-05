import React, { useMemo } from "react";
import { useRouteMatch } from "react-router-dom";
import useAppSelector from "./useAppSelector";

function useMatchCommunityId() {
  const match = useRouteMatch<{
    match_channel_id?: string;
    match_community_id?: string;
  }>();
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const { match_community_id } = useMemo(() => match.params, [match.params]);

  return React.useMemo(
    () =>
      match_community_id === "user"
        ? currentTeam.team_id
        : match_community_id || currentTeam.team_id,
    [currentTeam.team_id, match_community_id]
  );
}

export default useMatchCommunityId;
