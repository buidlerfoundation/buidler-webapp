import { useMemo } from "react";
import useAppSelector from "./useAppSelector";
import useCommunityId from "./useCommunityId";

const useGlobalChannels = () => {
  const globalChannelMap = useAppSelector((state) => state.user.globalChannelMap);
  const communityId = useCommunityId();
  return useMemo(() => globalChannelMap?.[communityId] || [], [communityId, globalChannelMap]);
};

export default useGlobalChannels;
