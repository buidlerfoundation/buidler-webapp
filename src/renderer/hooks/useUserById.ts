import React, { useEffect, useState } from "react";
import { getUserDetail } from "renderer/actions/UserActions";
import { DeletedUser } from "renderer/common/AppConfig";
import { UserData } from "renderer/models";
import useAppDispatch from "./useAppDispatch";
import useMatchCommunityId from "./useMatchCommunityId";
import useTeamUserData from "./useTeamUserData";

function useUserById(userId?: string, defaultValue?: UserData) {
  const users = useTeamUserData();
  const dispatch = useAppDispatch();
  const communityId = useMatchCommunityId();
  const [user, setUser] = useState<UserData | null>(null);
  useEffect(() => {
    if (userId) {
      const existed = users.find((el) => el.user_id === userId) || defaultValue;
      if (!existed) {
        dispatch(getUserDetail(userId, communityId));
      } else if (!existed.fetching && !existed.user_name) {
        setUser(DeletedUser);
      } else if (existed.user_name) {
        setUser(existed);
      }
    }
  }, [communityId, defaultValue, dispatch, userId, users]);
  return React.useMemo(() => {
    if (user?.is_deleted) return DeletedUser;
    return user;
  }, [user]);
}

export default useUserById;
