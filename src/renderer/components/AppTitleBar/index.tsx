import React, { useEffect, useState, useRef, useCallback, memo } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { AsyncKey, LoginType } from "renderer/common/AppConfig";
import api from "renderer/api";
import WalletConnectUtils from "renderer/services/connectors/WalletConnectUtils";
import { normalizeUserName } from "renderer/helpers/MessageHelper";
import useAppSelector from "renderer/hooks/useAppSelector";
import {
  createTeam,
  deleteTeam,
  findTeamAndChannel,
  leaveTeam,
  logout,
  setCurrentTeam,
} from "renderer/actions/UserActions";
import { Community } from "renderer/models";
import "./index.scss";
import TeamItem from "./TeamItem";
import images from "../../common/images";
import ModalTeam from "../ModalTeam";
import ModalUserSetting from "../ModalUserSetting";
import PopoverButton from "../PopoverButton";
import { clearData, getCookie, getDeviceCode } from "../../common/Cookie";
import ModalConfirmDelete from "../ModalConfirmDelete";
import ModalTeamSetting from "../ModalTeamSetting";
import ModalConfirmDeleteTeam from "../ModalConfirmDeleteTeam";
import AvatarView from "../AvatarView";
import useAppDispatch from "renderer/hooks/useAppDispatch";

const AppTitleBar = () => {
  const dispatch = useAppDispatch();
  const { team, userData, currentTeam, imgDomain } = useAppSelector(
    (state) => state.user
  );
  const { privateKey } = useAppSelector((state) => state.configs);
  const history = useHistory();
  const [openTeamSetting, setOpenTeamSetting] = useState(false);
  const teamMenu = [
    {
      label: "Edit community profile",
      value: "Edit community profile",
      icon: images.icSettingChannelEdit,
    },
    {
      label: "Leave community",
      value: "Leave community",
      icon: images.icLeaveTeam,
    },
  ];
  const menuTeamRef = useRef<any>();
  const [isOpenConfirmLeave, setOpenConfirmLeave] = useState(false);
  const [isOpenConfirmDeleteTeam, setOpenConfirmDeleteTeam] = useState(false);
  const [isOpenModalTeam, setOpenModalTeam] = useState(false);
  const [isOpenModalUser, setOpenModalUser] = useState(false);
  const [selectedMenuTeam, setSelectedMenuTeam] = useState<Community | null>(
    null
  );
  const setTeam = useCallback(
    (t?: Community) => {
      dispatch(setCurrentTeam?.(t));
    },
    [dispatch]
  );
  const handleCloseTeamSetting = useCallback(() => {
    setSelectedMenuTeam(null);
    setOpenTeamSetting(false);
  }, []);
  const onDeleteClick = useCallback(() => {
    setOpenConfirmDeleteTeam(true);
  }, []);
  useEffect(() => {
    const listener = (event: any) => {
      if (event.metaKey) {
        const { key } = event;
        const num = parseInt(key);
        if (
          !isNaN(num) &&
          typeof num === "number" &&
          num <= (team?.length || 0)
        ) {
          if (currentTeam.team_id !== team?.[num - 1].team_id)
            setTeam(team?.[num - 1]);
        }
      }
    };
    document.addEventListener("keydown", listener);
    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, [currentTeam?.team_id, setTeam, team]);
  const handleCloseDeleteTeam = useCallback(
    () => setOpenConfirmDeleteTeam(false),
    []
  );
  const onDeleteTeam = useCallback(async () => {
    if (!selectedMenuTeam?.team_id) return;
    const nextTeam =
      currentTeam.team_id === selectedMenuTeam?.team_id
        ? team?.filter?.((el) => el.team_id !== currentTeam.team_id)?.[0]
        : null;
    const success = await dispatch(deleteTeam(selectedMenuTeam?.team_id));
    if (nextTeam && success) {
      setTeam(nextTeam);
    }
    setOpenConfirmDeleteTeam(false);
    setOpenTeamSetting(false);
  }, [
    currentTeam?.team_id,
    dispatch,
    selectedMenuTeam?.team_id,
    setTeam,
    team,
  ]);
  const handleCloseModalConfirmDelete = useCallback(() => {
    setSelectedMenuTeam(null);
    setOpenConfirmLeave(false);
  }, []);
  const onLeaveTeam = useCallback(async () => {
    if (!selectedMenuTeam?.team_id) return;
    const nextTeam =
      currentTeam.team_id === selectedMenuTeam.team_id
        ? team?.filter?.((el) => el.team_id !== currentTeam.team_id)?.[0]
        : null;
    const success = await dispatch(leaveTeam?.(selectedMenuTeam.team_id));
    if (nextTeam && success) {
      setTeam(nextTeam);
    }
    setOpenConfirmLeave(false);
  }, [
    currentTeam?.team_id,
    dispatch,
    selectedMenuTeam?.team_id,
    setTeam,
    team,
  ]);
  const handleCommunityContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>, t: Community) => {
      setSelectedMenuTeam(t);
      menuTeamRef.current?.show(e.currentTarget, {
        x: e.pageX,
        y: e.pageY,
      });
    },
    []
  );
  const handleOpenModalTeam = useCallback(() => setOpenModalTeam(true), []);
  const handleOpenModalUser = useCallback(() => setOpenModalUser(true), []);
  const handleCloseModalTeam = useCallback(() => setOpenModalTeam(false), []);
  const handleCreateTeam = useCallback(
    async (body: any) => {
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
  const handleCloseModalUserSetting = useCallback(
    () => setOpenModalUser(false),
    []
  );
  const handleLogout = useCallback(async () => {
    const loginType = await getCookie(AsyncKey.loginType);
    if (
      loginType === LoginType.WalletConnect ||
      WalletConnectUtils.connector?.connected
    ) {
      WalletConnectUtils.disconnect();
    }
    if (
      loginType === LoginType.WalletImport ||
      loginType === LoginType.Metamask
    ) {
      const deviceCode = await getDeviceCode();
      await api.removeDevice({
        device_code: deviceCode,
      });
      clearData(() => {
        setOpenModalUser(false);
        history.replace("/started");
        dispatch(logout?.());
      });
    }
  }, [dispatch, history]);
  const onSelectedMenu = useCallback(async (menu: any) => {
    switch (menu.value) {
      case "Leave community": {
        setOpenConfirmLeave(true);
        break;
      }
      case "Edit community profile": {
        setOpenTeamSetting(true);
        break;
      }
      default:
        break;
    }
  }, []);

  const renderTeam = useCallback(
    (el: Community) => {
      return (
        <TeamItem
          key={el.team_id}
          isSelected={el.team_id === currentTeam?.team_id}
          t={el}
          onChangeTeam={setTeam}
          onContextMenu={handleCommunityContextMenu}
        />
      );
    },
    [currentTeam?.team_id, handleCommunityContextMenu, setTeam]
  );

  if (privateKey || WalletConnectUtils?.connector?.connected) {
    return (
      <div id="title-bar">
        <div className="list-team hide-scroll-bar">
          {imgDomain && team?.map?.(renderTeam)}
          <div
            className="normal-button create-team-button"
            onClick={handleOpenModalTeam}
          >
            <img alt="" src={images.icPlus} />
          </div>
        </div>
        {userData && (
          <div className="action-right">
            <div
              className="user-setting__wrap normal-button"
              onClick={handleOpenModalUser}
            >
              <span className="user-name">
                {normalizeUserName(userData.user_name)}
              </span>
              <AvatarView user={userData} />
            </div>
          </div>
        )}
        <ModalTeam
          open={isOpenModalTeam}
          handleClose={handleCloseModalTeam}
          onCreateTeam={handleCreateTeam}
          onAcceptTeam={handleAcceptTeam}
        />
        <ModalUserSetting
          open={isOpenModalUser}
          handleClose={handleCloseModalUserSetting}
          user={userData}
          onLogout={handleLogout}
        />
        <PopoverButton
          popupOnly
          ref={menuTeamRef}
          data={teamMenu}
          onSelected={onSelectedMenu}
        />
        <ModalConfirmDelete
          open={isOpenConfirmLeave}
          handleClose={handleCloseModalConfirmDelete}
          title="Leave community"
          description="Are you sure you want to leave?"
          contentName={selectedMenuTeam?.team_display_name || ""}
          contentDelete="Leave"
          onDelete={onLeaveTeam}
        />
        <ModalConfirmDeleteTeam
          open={isOpenConfirmDeleteTeam}
          handleClose={handleCloseDeleteTeam}
          teamName={selectedMenuTeam?.team_display_name || ""}
          onDelete={onDeleteTeam}
        />
        <ModalTeamSetting
          open={openTeamSetting}
          handleClose={handleCloseTeamSetting}
          team={selectedMenuTeam}
          onDeleteClick={onDeleteClick}
        />
      </div>
    );
  }

  return <div id="title-bar" />;
};

export default memo(AppTitleBar);
