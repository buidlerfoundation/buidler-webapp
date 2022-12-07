import React from "react";
import { DeletedUser } from "renderer/common/AppConfig";
import useTeamUserData from "./useTeamUserData";

function usePublicUser(userId?: string) {
  const teamUserData = useTeamUserData();

  return React.useMemo(
    () => teamUserData.find((el) => el.user_id === userId) || DeletedUser,
    [teamUserData, userId]
  );
}

export default usePublicUser;
