import React from "react";
import useCommunityId from "./useCommunityId";
import { Community } from "models/Community";
import usePinnedCommunities from "./usePinnedCommunities";

function useCurrentCommunity() {
  const communityId = useCommunityId();
  const pinnedCommunities = usePinnedCommunities();

  return React.useMemo<Community>(() => {
    const res = pinnedCommunities?.find(
      (el) => el.community_id === communityId
    ) || {
      community_name: "",
      community_image: "",
      community_id: "",
      community_url: "",
      role: "",
    };
    return res;
  }, [pinnedCommunities, communityId]);
}

export default useCurrentCommunity;
