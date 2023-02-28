import React from 'react';
import useCurrentChannel from './useCurrentChannel';
import usePublicUser from './usePublicUser';
import useUserData from './useUserData';

function useDirectChannelUser() {
  const currentChannel = useCurrentChannel();
  const user = useUserData();
  const otherUserId = React.useMemo(
    () => currentChannel?.channel_members.find(el => el !== user.user_id),
    [currentChannel?.channel_members, user.user_id],
  );

  return usePublicUser(otherUserId);
}

export default useDirectChannelUser;
