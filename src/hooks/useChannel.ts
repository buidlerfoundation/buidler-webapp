import { useMemo } from "react";
import useChannels from "./useChannels";
import useChannelId from "./useChannelId";

const useChannel = () => {
  const channels = useChannels();
  const channelId = useChannelId();
  return useMemo(
    () => channels?.find((el) => el.channel_id === channelId),
    [channelId, channels]
  );
};

export default useChannel;
