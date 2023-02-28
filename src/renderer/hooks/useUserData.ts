import { useMemo } from 'react';
import useAppSelector from './useAppSelector';

function useUserData() {
  const userData = useAppSelector((state) => state.user.userData);
  return useMemo(() => userData, [userData]);
}

export default useUserData;
