import React from "react";
import { DeletedUser } from "renderer/common/AppConfig";
import { UserData } from "renderer/models";
import useTeamUserData from "./useTeamUserData";

function usePublicUser(userId?: string, defaultValue?: UserData) {
  const teamUserData = useTeamUserData();

  return React.useMemo(
    () =>
      teamUserData.find((el) => !el.is_deleted && el.user_id === userId) ||
      defaultValue ||
      DeletedUser,
    [defaultValue, teamUserData, userId]
  );
}

export default usePublicUser;
