import { useMemo } from 'react';
import { DirectCommunity } from 'renderer/common/AppConfig';
import useAppSelector from './useAppSelector';

const useUnseenDirect = () => {
  const channelMap = useAppSelector((state) => state.user.channelMap);
  const directChannels = useMemo(
    () => channelMap?.[DirectCommunity.team_id],
    [channelMap]
  );
  return useMemo(
    () => !!directChannels?.find((el) => !el.seen),
    [directChannels]
  );
};

export default useUnseenDirect;
