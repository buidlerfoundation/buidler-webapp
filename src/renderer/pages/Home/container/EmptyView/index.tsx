import React, { useCallback, useState } from "react";
import { useHistory } from "react-router-dom";
import { createTeam } from "renderer/actions/UserActions";
import useAppDispatch from "renderer/hooks/useAppDispatch";
import ModalTeam from "../../../../shared/ModalTeam";
import NormalButton from "../../../../shared/NormalButton";
import "./index.scss";

const EmptyView = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const [isOpenModalTeam, setOpenModalTeam] = useState(false);
  const toggleModalTeam = useCallback(
    () => setOpenModalTeam((current) => !current),
    []
  );
  const handleCreateTeam = useCallback(
    async (body) => {
      const res: any = await dispatch(
        createTeam?.({
          team_id: body.teamId,
          team_display_name: body.name,
          team_icon: body.teamIcon?.url,
        })
      );
      if (res.statusCode === 200) {
        history.replace(`/channels/${res.team_id}`);
        setOpenModalTeam(false);
      }
    },
    [dispatch, history]
  );
  const handleAcceptTeam = useCallback(
    async (teamId: string) => {
      history.replace(`/channels/${teamId}`);
      setOpenModalTeam(false);
    },
    [history]
  );
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
