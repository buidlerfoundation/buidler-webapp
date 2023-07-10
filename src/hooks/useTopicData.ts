import { useMemo } from "react";
import useAppSelector from "./useAppSelector";

function useTopicData(url?: string) {
  const topic = useAppSelector((state) => state.pinPost.topicData);
  return useMemo(() => (!url ? null : topic?.[url]), [topic, url]);
}

export default useTopicData;
