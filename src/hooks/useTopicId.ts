import { useMemo } from "react";
import useAppSelector from "./useAppSelector";

function useTopId() {
  const topicId = useAppSelector((state) => state.pinPost.selectedTopicId);
  return useMemo(() => topicId, [topicId]);
}

export default useTopId;
