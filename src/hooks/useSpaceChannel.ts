import { useMemo } from "react";
import useAppSelector from "./useAppSelector";
import useCommunityId from "./useCommunityId";

const useSpaces = () => {
  const spaceChannelMap = useAppSelector((state) => state.user.spaceChannelMap);
  const communityId = useCommunityId();
  return useMemo(
    () => spaceChannelMap[communityId] || [],
    [spaceChannelMap, communityId]
  );
};

export default useSpaces;
