import { useMemo } from "react";
import useAppSelector from "./useAppSelector";
import useChannelId from "./useChannelId";

function useTotalOnlineUsers() {
  const channelId = useChannelId();
  const onlineUsers = useAppSelector((state) => state.user.totalOnlineUsers);
  return useMemo(() => onlineUsers?.[channelId] || 0, [channelId, onlineUsers]);
}

export default useTotalOnlineUsers;
