import { useMemo } from "react";
import useAppSelector from "./useAppSelector";
import useMatchChannelId from "./useMatchChannelId";

const useArchivedPinPosts = () => {
  const channelId = useMatchChannelId();
  const pinPostData = useAppSelector((state) => state.task.taskData);
  return useMemo(
    () => pinPostData[channelId]?.archivedTasks || [],
    [pinPostData, channelId]
  );
};

export default useArchivedPinPosts;
