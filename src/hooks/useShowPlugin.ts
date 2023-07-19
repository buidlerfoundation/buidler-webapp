import { useMemo } from "react";
import useChannel from "./useChannel";
import useTopicData from "./useTopicData";
import useMessageData from "./useMessageData";

function useShowPlugin() {
  const channel = useChannel();
  const topicData = useTopicData(channel?.display_channel_url);
  const messageData = useMessageData();
  return useMemo(
    () =>
      (topicData?.stories?.length || 0) > 0 &&
      (messageData?.data?.length || 0) > 0,
    [messageData?.data?.length, topicData?.stories?.length]
  );
}

export default useShowPlugin;
