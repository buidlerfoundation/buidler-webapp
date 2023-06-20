import React from "react";
import useTeamUserData from "./useTeamUserData";
import { UserData } from "models/User";
import { DeletedUser } from "common/AppConfig";

function useUserById(userId?: string, defaultValue?: UserData) {
  const users = useTeamUserData();
  return React.useMemo(
    () =>
      userId
        ? users?.find((el) => el.user_id === userId) ||
          defaultValue ||
          DeletedUser
        : null,
    [defaultValue, userId, users]
  );
}

export default useUserById;
