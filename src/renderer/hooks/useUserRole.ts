import {useMemo} from 'react';
import useAppSelector from './useAppSelector';
import useTeamUserData from './useTeamUserData';

function useUserRole() {
  const teamUserData = useTeamUserData();
  const userData = useAppSelector(state => state.user.userData);
  return useMemo(
    () => teamUserData.find(el => el.user_id === userData.user_id)?.role,
    [teamUserData, userData.user_id],
  );
}

export default useUserRole;
