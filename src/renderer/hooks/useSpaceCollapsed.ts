import React from 'react';
import useAppSelector from './useAppSelector';

function useSpaceCollapsed(spaceId: string) {
  const spaceToggle = useAppSelector(state => state.sideBar.spaceToggle);

  return React.useMemo(() => !spaceToggle?.[spaceId], [spaceId, spaceToggle]);
}

export default useSpaceCollapsed;
