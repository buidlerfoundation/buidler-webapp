import { useMemo } from "react";
import useAppSelector from "./useAppSelector";

function usePinnedCommunities() {
  const pinnedCommunities = useAppSelector(
    (state) => state.user.pinnedCommunities
  );
  return useMemo(() => pinnedCommunities, [pinnedCommunities]);
}

export default usePinnedCommunities;
