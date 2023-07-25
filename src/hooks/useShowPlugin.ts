import { useMemo } from "react";
import useChannel from "./useChannel";
import useTopicData from "./useTopicData";
import useMessageData from "./useMessageData";
import { ActiveTab } from "models/Message";

function useShowPlugin() {
  const channel = useChannel();
  const topicData = useTopicData(channel?.display_channel_url);
  const messageData = useMessageData();
  return useMemo<{ isShow: boolean; activeTab: ActiveTab }>(() => {
    const isShow =
      (topicData?.stories?.length || 0) > 0 ||
      (messageData?.data?.length || 0) > 0;
    return {
      isShow,
      activeTab:
        (topicData?.stories?.length || 0) > 0
          ? "pin"
          : (messageData?.data?.length || 0) > 0
          ? "chat"
          : "pin",
    };
  }, [messageData?.data?.length, topicData?.stories?.length]);
}

export default useShowPlugin;
