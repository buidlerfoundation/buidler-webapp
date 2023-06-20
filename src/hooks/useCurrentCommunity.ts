import React from "react";
import useCommunityId from "./useCommunityId";
import useCommunities from "./useCommunities";
import { Community } from "models/Community";

function useCurrentCommunity() {
  const communityId = useCommunityId();
  const communities = useCommunities();

  return React.useMemo<Community>(() => {
    const res = communities?.find((el) => el.team_id === communityId) || {
      team_display_name: "",
      team_icon: "",
      team_id: "",
      team_url: "",
      role: "",
    };
    return res;
  }, [communities, communityId]);
}

export default useCurrentCommunity;
