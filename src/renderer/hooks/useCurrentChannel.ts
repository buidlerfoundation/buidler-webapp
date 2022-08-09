import React from "react";
import { Channel } from "renderer/models";
import useChannel from "./useChannel";
import useMatchChannelId from "./useMatchChannelId";

function useCurrentChannel() {
  const channelId = useMatchChannelId();
  const channels = useChannel();

  return React.useMemo<Channel>(() => {
    const res = channels.find((el) => el.channel_id === channelId) || {
      channel_id: "",
      channel_member: [],
      channel_name: "",
      channel_type: "Public",
      notification_type: "",
      seen: true,
    };
    return res;
  }, [channelId, channels]);
}

export default useCurrentChannel;
