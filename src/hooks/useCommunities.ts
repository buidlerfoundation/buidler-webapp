import { useMemo } from "react";
import useAppSelector from "./useAppSelector";

function useCommunities() {
  const communities = useAppSelector((state) => state.user.communities);
  return useMemo(() => communities, [communities]);
}

export default useCommunities;
