import { useMemo } from "react";
import useAppSelector from "./useAppSelector";
import useMatchCommunityId from "./useMatchCommunityId";

const useTeamUserData = () => {
  const teamUserMap = useAppSelector((state) => state.user.teamUserMap);
  const communityId = useMatchCommunityId();
  return useMemo(
    () => teamUserMap[communityId]?.data || [],
    [teamUserMap, communityId]
  );
};

export default useTeamUserData;
