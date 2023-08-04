import { useMemo } from "react";
import useAppSelector from "./useAppSelector";

function useTopicDetail(topicId?: string | null) {
  const topicDetail = useAppSelector((state) => state.pinPost.topicDetail);
  return useMemo(() => {
    if (!topicId) return null;
    return topicDetail[topicId];
  }, [topicDetail, topicId]);
}

export default useTopicDetail;
