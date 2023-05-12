import React, { useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import actionTypes from "renderer/actions/ActionTypes";
import { findTeamAndChannel } from "renderer/actions/UserActions";
import api from "renderer/api";
import { AsyncKey } from "renderer/common/AppConfig";
import { setCookie } from "renderer/common/Cookie";
import useAppDispatch from "renderer/hooks/useAppDispatch";
import useAppSelector from "renderer/hooks/useAppSelector";
import EmptyView from "renderer/pages/Home/container/EmptyView";
import "./index.scss";

const EmptyTeamView = () => {
  const dispatch = useAppDispatch();
  const { dataFromUrl } = useAppSelector((state) => state.configs);
  const handleDataFromUrl = useCallback(async () => {
    if (dataFromUrl?.invitationId) {
      const { invitationId, invitationRef } = dataFromUrl;
      const res = await api.acceptInvitation(invitationId, invitationRef);
      if (res.statusCode === 200) {
        if (res.metadata?.is_new_team_member) {
          toast.success("You have successfully joined new community.");
        }
        dispatch({ type: actionTypes.REMOVE_DATA_FROM_URL });
        setCookie(AsyncKey.lastTeamId, res.data?.team_id);
        dispatch(findTeamAndChannel());
      }
    }
  }, [dataFromUrl, dispatch]);
  useEffect(() => {
    handleDataFromUrl();
  }, [handleDataFromUrl]);
  return (
    <div className="empty__container">
      <div className="page-body">
        <div className="side-bar-view" />
        <EmptyView />
      </div>
    </div>
  );
};

export default EmptyTeamView;
