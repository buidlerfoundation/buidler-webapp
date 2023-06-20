import { useMemo } from "react";
import useAppSelector from "./useAppSelector";
import useCommunityId from "./useCommunityId";

const useTeamUserData = () => {
  const teamUserMap = useAppSelector((state) => state.user.teamUserMap);
  const communityId = useCommunityId();
  return useMemo(
    () => teamUserMap[communityId]?.data || [],
    [teamUserMap, communityId]
  );
};

export default useTeamUserData;
