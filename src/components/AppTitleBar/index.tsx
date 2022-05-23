import React, { useEffect, useState, useRef, useCallback } from "react";
import { connect, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import actions from "../../actions";
import "./index.scss";
import TeamItem from "./TeamItem";
import images from "../../common/images";
import ModalTeam from "../ModalTeam";
import ModalUserSetting from "../ModalUserSetting";
import PopoverButton from "../PopoverButton";
import { clearData, getDeviceCode } from "../../common/Cookie";
import { useNavigate, useLocation } from "react-router-dom";
import ModalBackup from "../ModalBackup";
import ModalConfirmDelete from "../ModalConfirmDelete";
import ModalTeamSetting from "../ModalTeamSetting";
import ModalConfirmDeleteTeam from "../ModalConfirmDeleteTeam";
import api from "api";
import ModalWalletSetting from "../ModalWalletSetting";

type AppTitleBarProps = {
  team?: Array<any>;
  currentTeam?: any;
  setCurrentTeam?: (team: any) => any;
  imgDomain?: string;
  channels?: Array<any>;
  createTeam?: (body: any) => any;
  leaveTeam?: (teamId: string) => any;
  userData?: any;
  currentChannel?: any;
  updateUserChannel?: (channels: Array<any>) => any;
  logout?: () => any;
  updateUser?: (userData: any) => any;
  privateKey?: string;
  findTeamAndChannel?: () => any;
  updateTeam?: (teamId: string, body: any) => any;
  deleteTeam?: (teamId: string) => any;
};

const AppTitleBar = ({
  team,
  currentTeam,
  setCurrentTeam,
  imgDomain,
  channels,
  createTeam,
  leaveTeam,
  userData,
  currentChannel,
  updateUserChannel,
  logout,
  updateUser,
  privateKey,
  findTeamAndChannel,
  updateTeam,
  deleteTeam,
}: AppTitleBarProps) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
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
  const [isOpenModalWallet, setOpenModalWallet] = useState(false);
  const [isOpenModalBackup, setOpenModalBackup] = useState(false);
  const [selectedMenuTeam, setSelectedMenuTeam] = useState<any>(null);
  const [hoverTeam, setHoverTeam] = useState(false);
  const setTeam = useCallback(
    (t: any) => {
      navigate("/home", { replace: true });
      setCurrentTeam?.(t);
    },
    [setCurrentTeam, navigate]
  );
  const onDeleteClick = () => {
    setOpenConfirmDeleteTeam(true);
  };
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
  }, [team, setTeam, currentTeam, channels, dispatch, navigate]);
  const onDeleteTeam = async () => {
    const nextTeam =
      currentTeam.team_id === selectedMenuTeam.team_id
        ? team?.filter?.((el) => el.team_id !== currentTeam.team_id)?.[0]
        : null;
    const success = await deleteTeam?.(selectedMenuTeam?.team_id);
    if (nextTeam && success) {
      setTeam(nextTeam);
    }
    setOpenConfirmDeleteTeam(false);
    setOpenTeamSetting(false);
  };
  const onLeaveTeam = async () => {
    const nextTeam =
      currentTeam.team_id === selectedMenuTeam.team_id
        ? team?.filter?.((el) => el.team_id !== currentTeam.team_id)?.[0]
        : null;
    const success = await leaveTeam?.(selectedMenuTeam.team_id);
    if (nextTeam && success) {
      setTeam(nextTeam);
    }
    setOpenConfirmLeave(false);
  };
  const onSelectedMenu = async (menu: any) => {
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
  };

  const onBackupPress = () => {
    setOpenModalUser(false);
    setOpenModalBackup(true);
  };

  if (!privateKey) {
    return (
      <div
        id="title-bar"
        className={location.pathname === "/unlock" ? "hide" : ""}
      />
    );
  }
  return (
    <div id="title-bar">
      <div
        className="list-team hide-scroll-bar"
        onMouseEnter={() => setHoverTeam(true)}
        onMouseLeave={() => setHoverTeam(false)}
      >
        {imgDomain &&
          team?.map?.((t) => {
            const isSelected = t.team_id === currentTeam.team_id;
            return (
              <TeamItem
                key={t.team_id}
                isSelected={isSelected}
                t={t}
                onChangeTeam={() => {
                  if (currentTeam.team_id !== t.team_id) setTeam(t);
                }}
                onContextMenu={(e) => {
                  setSelectedMenuTeam(t);
                  menuTeamRef.current?.show(e.currentTarget, {
                    x: e.pageX,
                    y: e.pageY,
                  });
                }}
              />
            );
          })}
        {hoverTeam && (
          <div
            className="normal-button create-team-button"
            onClick={() => setOpenModalTeam(true)}
          >
            <img alt="" src={images.icPlus} />
          </div>
        )}
      </div>
      {userData && (
        <div className="action-right">
          {/* <div
            className="action-item normal-button"
            style={{ marginRight: 10 }}
            onClick={() => history.replace('/started')}
          >
            <img src={images.icSearch} alt="" />
          </div> */}
          <div
            className="action-item normal-button"
            onClick={() => setOpenModalWallet(true)}
          >
            <img src={images.icWallet} alt="" />
          </div>
          <div
            className="action-item normal-button"
            onClick={() => setOpenModalUser(true)}
          >
            <img src={images.icUser} alt="" />
          </div>
        </div>
      )}
      <ModalTeam
        open={isOpenModalTeam}
        handleClose={() => setOpenModalTeam(false)}
        onCreateTeam={async (body) => {
          await createTeam?.({
            team_id: body.teamId,
            team_display_name: body.name,
            team_icon: body.teamIcon?.url,
          });
          setOpenModalTeam(false);
        }}
        onAcceptTeam={() => {
          findTeamAndChannel?.();
          setOpenModalTeam(false);
        }}
      />
      <ModalUserSetting
        open={isOpenModalUser}
        handleClose={() => setOpenModalUser(false)}
        user={userData}
        currentChannel={currentChannel}
        updateUserChannel={updateUserChannel}
        channels={channels}
        updateUser={updateUser}
        onLogout={async () => {
          const deviceCode = await getDeviceCode();
          await api.removeDevice({
            device_code: deviceCode,
          });
          clearData();
          setOpenModalUser(false);
          navigate("/started", { replace: true });
          logout?.();
        }}
        onBackupPress={onBackupPress}
      />
      <ModalBackup
        open={isOpenModalBackup}
        handleClose={() => setOpenModalBackup(false)}
      />
      <PopoverButton
        popupOnly
        ref={menuTeamRef}
        data={teamMenu}
        onSelected={onSelectedMenu}
        onClose={() => {}}
      />
      <ModalConfirmDelete
        open={isOpenConfirmLeave}
        handleClose={() => {
          setSelectedMenuTeam(null);
          setOpenConfirmLeave(false);
        }}
        title="Leave community"
        description="Are you sure you want to leave?"
        contentName={selectedMenuTeam?.team_display_name}
        contentDelete="Leave"
        onDelete={onLeaveTeam}
      />
      <ModalConfirmDeleteTeam
        open={isOpenConfirmDeleteTeam}
        handleClose={() => setOpenConfirmDeleteTeam(false)}
        teamName={selectedMenuTeam?.team_display_name}
        onDelete={onDeleteTeam}
      />
      <ModalTeamSetting
        open={openTeamSetting}
        handleClose={() => {
          setSelectedMenuTeam(null);
          setOpenTeamSetting(false);
        }}
        team={selectedMenuTeam}
        updateTeam={updateTeam}
        onDeleteClick={onDeleteClick}
      />
      <ModalWalletSetting
        open={isOpenModalWallet}
        handleClose={() => setOpenModalWallet(false)}
      />
    </div>
  );
};

const mapStateToProps = (state: any) => {
  return {
    team: state.user.team,
    currentTeam: state.user.currentTeam,
    imgDomain: state.user.imgDomain,
    channels: state.user.channel,
    userData: state.user.userData,
    currentChannel: state.user.currentChannel,
    privateKey: state.configs.privateKey,
  };
};

const mapActionsToProps = (dispatch: any) =>
  bindActionCreators(actions, dispatch);

export default connect(mapStateToProps, mapActionsToProps)(AppTitleBar);
