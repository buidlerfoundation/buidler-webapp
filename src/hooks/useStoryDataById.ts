import { useMemo } from "react";
import useTopicData from "./useTopicData";
import useChannel from "./useChannel";

function useStoryDataById(id?: string | null) {
  const channel = useChannel();
  const topicData = useTopicData(channel?.display_channel_url);
  return useMemo(
    () => topicData?.stories?.find((el) => el.id === id),
    [id, topicData?.stories]
  );
}

export default useStoryDataById;
