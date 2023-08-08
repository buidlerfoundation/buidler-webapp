import { useMemo } from "react";
import useAppSelector from "./useAppSelector";
import useChannelId from "./useChannelId";

function useTotalOnlineUsers() {
  const channelId = useChannelId();
  const onlineUsers = useAppSelector((state) => state.user.onlineUsers);
  return useMemo(
    () => onlineUsers?.[channelId]?.length || 0,
    [channelId, onlineUsers]
  );
}

export default useTotalOnlineUsers;