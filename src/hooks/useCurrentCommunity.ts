import React from "react";
import useCommunityId from "./useCommunityId";
import useCommunities from "./useCommunities";
import { Community } from "models/Community";

function useCurrentCommunity() {
  const communityId = useCommunityId();
  const communities = useCommunities();

  return React.useMemo<Community>(() => {
    const res = communities?.find((el) => el.community_id === communityId) || {
      community_name: "",
      community_image: "",
      community_id: "",
      community_url: "",
      role: "",
    };
    return res;
  }, [communities, communityId]);
}

export default useCurrentCommunity;
