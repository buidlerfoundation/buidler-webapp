import React from "react";
import { useParams } from "react-router-dom";
import { getURLObject } from "helpers/LinkHelper";
import usePinnedCommunities from "./usePinnedCommunities";
import useWebsiteUrl from "./useWebsiteUrl";

function useCommunityId() {
  const websiteUrl = useWebsiteUrl();
  const pinnedCommunities = usePinnedCommunities();
  const params = useParams<{
    community_id?: string;
  }>();
  return React.useMemo(() => {
    if (params?.community_id) return params?.community_id;
    if (websiteUrl) {
      const obj = getURLObject(websiteUrl);
      return (
        pinnedCommunities?.find((el) => el.community_url === obj.community_url)
          ?.community_id || ""
      );
    }
    return "";
  }, [pinnedCommunities, params?.community_id, websiteUrl]);
}

export default useCommunityId;
