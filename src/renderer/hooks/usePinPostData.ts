import { useMemo } from "react";
import useAppSelector from "./useAppSelector";
import useMatchChannelId from "./useMatchChannelId";

const usePinPostData = () => {
  const channelId = useMatchChannelId();
  const pinPostData = useAppSelector((state) => state.task.taskData);
  return useMemo(() => pinPostData[channelId] || {}, [pinPostData, channelId]);
};

export default usePinPostData;
