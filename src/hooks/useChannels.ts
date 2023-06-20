import { useMemo } from "react";
import useAppSelector from "./useAppSelector";
import useCommunityId from "./useCommunityId";

const useChannels = () => {
  const channelMap = useAppSelector((state) => state.user.channelMap);
  const communityId = useCommunityId();
  return useMemo(() => channelMap[communityId], [channelMap, communityId]);
};

export default useChannels;
