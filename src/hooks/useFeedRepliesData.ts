import { useMemo } from "react";
import useAppSelector from "./useAppSelector";
import { ICast, IPagingData } from "models/FC";

function useFeedRepliesData(hash?: string | null) {
  const castRepliesMap = useAppSelector(
    (state) => state.homeFeed.castRepliesMap
  );
  return useMemo<IPagingData<ICast>>(() => {
    if (!hash)
      return {
        loading: false,
        data: [],
      };
    return (
      castRepliesMap?.[hash] || {
        loading: false,
        data: [],
      }
    );
  }, [castRepliesMap, hash]);
}

export default useFeedRepliesData;
