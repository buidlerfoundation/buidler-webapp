import { useMemo } from "react";
import useAppSelector from "./useAppSelector";
import useCommunityId from "./useCommunityId";

const useSpaces = () => {
  const spaceMap = useAppSelector((state) => state.user.spaceMap);
  const communityId = useCommunityId();
  return useMemo(() => spaceMap[communityId], [spaceMap, communityId]);
};

export default useSpaces;
