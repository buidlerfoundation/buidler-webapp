import { useMemo } from "react";
import useChannelId from "./useChannelId";
import useAppSelector from "./useAppSelector";

function usePinPostData() {
  const channelId = useChannelId();
  const pinPostData = useAppSelector((state) => state.pinPost.pinPostData);
  return useMemo(() => pinPostData[channelId], [channelId, pinPostData]);
}

export default usePinPostData;
