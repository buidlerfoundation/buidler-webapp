import { useMemo } from "react";
import useAppSelector from "./useAppSelector";
import useChannelId from "./useChannelId";

function useIsOnline(userId?: string) {
  const channelId = useChannelId();
  const onlineUsers = useAppSelector((state) => state.user.onlineUsers);
  return useMemo(
    () => (!userId ? false : onlineUsers?.[channelId]?.includes(userId)),
    [channelId, onlineUsers, userId]
  );
}

export default useIsOnline;
