import { useMemo } from "react";
import useAppSelector from "./useAppSelector";
import useMatchCommunityId from "./useMatchCommunityId";

const useTotalTeamUserData = () => {
  const teamUserMap = useAppSelector((state) => state.user.teamUserMap);
  const communityId = useMatchCommunityId();
  return useMemo(
    () => teamUserMap[communityId]?.total || 0,
    [teamUserMap, communityId]
  );
};

export default useTotalTeamUserData;
