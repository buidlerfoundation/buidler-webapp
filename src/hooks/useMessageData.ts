import { useMemo } from "react";
import useChannelId from "./useChannelId";
import useAppSelector from "./useAppSelector";

function useMessageData() {
  const channelId = useChannelId();
  const messageData = useAppSelector((state) => state.message.messageData);
  return useMemo(() => messageData[channelId], [channelId, messageData]);
}

export default useMessageData;
