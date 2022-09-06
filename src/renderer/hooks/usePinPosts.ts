import { useMemo } from "react";
import useAppSelector from "./useAppSelector";
import useMatchChannelId from "./useMatchChannelId";

const usePinPosts = () => {
  const channelId = useMatchChannelId();
  const pinPostData = useAppSelector((state) => state.task.taskData);
  return useMemo(
    () => pinPostData[channelId]?.tasks || [],
    [pinPostData, channelId]
  );
};

export default usePinPosts;
