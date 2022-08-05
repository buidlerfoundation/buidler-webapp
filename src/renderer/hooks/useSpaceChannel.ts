import { useMemo } from "react";
import useAppSelector from "./useAppSelector";
import useMatchCommunityId from "./useMatchCommunityId";

const useSpaceChannel = () => {
  const spaceChannelMap = useAppSelector((state) => state.user.spaceChannelMap);
  const communityId = useMatchCommunityId();
  return useMemo(
    () => spaceChannelMap[communityId] || [],
    [spaceChannelMap, communityId]
  );
};

export default useSpaceChannel;
