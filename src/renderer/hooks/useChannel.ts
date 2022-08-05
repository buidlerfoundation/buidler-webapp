import { useMemo } from "react";
import useAppSelector from "./useAppSelector";
import useMatchCommunityId from "./useMatchCommunityId";

const useChannel = () => {
  const channelMap = useAppSelector((state) => state.user.channelMap);
  const communityId = useMatchCommunityId();
  return useMemo(
    () => channelMap[communityId] || [],
    [channelMap, communityId]
  );
};

export default useChannel;
