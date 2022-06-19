import React, { useCallback, useState } from "react";
import { createTeam, findTeamAndChannel } from "renderer/actions/UserActions";
import useAppDispatch from "renderer/hooks/useAppDispatch";
import ModalTeam from "../../../../shared/ModalTeam";
import NormalButton from "../../../../shared/NormalButton";
import "./index.scss";

const EmptyView = () => {
  const dispatch = useAppDispatch();
  const [isOpenModalTeam, setOpenModalTeam] = useState(false);
  const toggleModalTeam = useCallback(
    () => setOpenModalTeam((current) => !current),
    []
  );
  const handleCreateTeam = useCallback(
    async (body) => {
      await dispatch(
        createTeam?.({
          team_id: body.teamId,
          team_display_name: body.name,
          team_icon: body.teamIcon?.url,
        })
      );
      setOpenModalTeam(false);
    },
    [dispatch]
  );
  const handleAcceptTeam = useCallback(() => {
    dispatch(findTeamAndChannel());
    setOpenModalTeam(false);
  }, [dispatch]);
  return (
    <div className="empty-view__container">
      <span className="empty-text">
        You don&apos;t have any community yet,
        <br />
        create a new community to start using Buidler.
      </span>
      <NormalButton
        title="New Community"
        onPress={toggleModalTeam}
        type="main"
      />
      <ModalTeam
        open={isOpenModalTeam}
        handleClose={toggleModalTeam}
        onCreateTeam={handleCreateTeam}
        onAcceptTeam={handleAcceptTeam}
      />
    </div>
  );
};

export default EmptyView;
