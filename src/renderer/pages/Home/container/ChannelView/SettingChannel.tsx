import React, { useState, useEffect, useCallback, useMemo } from "react";
import toast from "react-hot-toast";
import { useHistory } from "react-router-dom";
import { deleteChannel, updateChannel } from "renderer/actions/UserActions";
import useAppDispatch from "renderer/hooks/useAppDispatch";
import useChannel from "renderer/hooks/useChannel";
import useCurrentCommunity from "renderer/hooks/useCurrentCommunity";
import { Channel } from "renderer/models";
import api from "../../../../api";
import images from "../../../../common/images";
import AppInput from "../../../../shared/AppInput";
import ModalConfirmDeleteChannel from "../../../../shared/ModalConfirmDeleteChannel";
import NormalButton from "../../../../shared/NormalButton";
import PopoverButton, { PopoverItem } from "../../../../shared/PopoverButton";

type SettingChannelProps = {
  currentChannel?: Channel;
  onClose: () => void;
  isActiveName: boolean;
  isOwner?: boolean;
};

const SettingChannel = ({
  currentChannel,
  onClose,
  isActiveName,
  isOwner,
}: SettingChannelProps) => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const currentTeam = useCurrentCommunity();
  const channels = useChannel();
  const [isOpenConfirm, setOpenConfirm] = useState(false);
  const [currentName, setCurrentName] = useState("");
  const [isOpenEditName, setOpenEditName] = useState(false);
  const [currentNotificationType, setNotificationType] = useState<string>();
  useEffect(() => {
    setNotificationType(currentChannel?.notification_type);
  }, [currentChannel?.notification_type]);
  const handleSelectChannelType = useCallback(
    (item: PopoverItem) => {
      if (!currentChannel?.channel_id) return;
      dispatch(
        updateChannel(currentChannel.channel_id, {
          channel_type: item.value,
        })
      );
    },
    [currentChannel?.channel_id, dispatch]
  );
  const handleChangeName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setCurrentName(e.target.value.toLowerCase().replaceAll(" ", "-")),
    []
  );
  const toggleEditName = useCallback(
    () => setOpenEditName((current) => !current),
    []
  );
  useEffect(() => {
    if (isActiveName) {
      setOpenEditName(true);
    }
  }, [isActiveName]);
  useEffect(() => {
    setCurrentName(currentChannel?.channel_name || "");
  }, [currentChannel?.channel_name, isOpenEditName]);
  const handleSave = useCallback(async () => {
    if (!currentChannel?.channel_id) return;
    if (!currentName) {
      toast.error("Channel name cannot be empty");
      return;
    }
    const success = await dispatch(
      updateChannel(currentChannel.channel_id, {
        channel_name: currentName,
      })
    );
    if (!!success) {
      toggleEditName();
    }
  }, [currentChannel?.channel_id, currentName, toggleEditName, dispatch]);
  const handleSelectMenu = useCallback(
    async (item: PopoverItem) => {
      if (!currentChannel?.channel_id) return;
      await api.updateChannelNotification(
        currentChannel.channel_id,
        item.value
      );
      setNotificationType(item.value);
    },
    [currentChannel]
  );
  const handleToggleModalDelete = useCallback(
    () => setOpenConfirm((current) => !current),
    []
  );
  const nextChannelId = useMemo(() => {
    const currentIdx = channels.findIndex(
      (el) => el.channel_id === currentChannel?.channel_id
    );
    const newChannels = channels.filter(
      (el) => el.channel_id !== currentChannel?.channel_id
    );
    return (
      newChannels?.[currentIdx]?.channel_id ||
      newChannels?.[0]?.channel_id ||
      ""
    );
  }, [channels, currentChannel?.channel_id]);
  const handleDeleteChannel = useCallback(async () => {
    if (!currentChannel?.channel_id) return;
    const success = await dispatch(
      deleteChannel(currentChannel.channel_id, currentTeam.team_id)
    );
    if (!!success) {
      history.replace(`/channels/${currentTeam.team_id}/${nextChannelId}`);
      setOpenConfirm(false);
      onClose();
    }
  }, [
    currentChannel?.channel_id,
    currentTeam?.team_id,
    dispatch,
    history,
    nextChannelId,
    onClose,
  ]);
  return (
    <div className="setting-body">
      {currentChannel?.channel_type !== "Direct" && false && (
        <div className="setting-item">
          <div
            style={{
              borderRadius: "50%",
              width: 25,
              height: 25,
              backgroundColor: "#4D08A4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img src={images.icPrivateWhite} alt="" />
          </div>
          <span className="setting-label">Channel Type</span>
          <PopoverButton
            title={currentChannel?.channel_type}
            icon={images.icCollapse}
            data={[
              { value: "Public", label: "Public" },
              { value: "Private", label: "Private" },
            ]}
            onSelected={handleSelectChannelType}
          />
        </div>
      )}
      {isOwner && (
        <div
          className="setting-item normal-button"
          style={{ marginTop: 12 }}
          onClick={toggleEditName}
        >
          <img src={images.icSettingChannelEdit} alt="" />
          <span className="setting-label">Edit channel name</span>
        </div>
      )}
      {isOpenEditName && (
        <div className="edit-name-input__wrapper">
          <AppInput
            className="edit-name-input"
            value={currentName}
            placeholder="Channel name"
            onChange={handleChangeName}
            autoFocus
          />
          <NormalButton title="Cancel" onPress={toggleEditName} type="normal" />
          <div style={{ width: 10 }} />
          <NormalButton title="Save" onPress={handleSave} type="main" />
        </div>
      )}
      {currentChannel?.notification_type && (
        <div className="setting-item">
          <img src={images.icSettingChannelNotification} alt="" />
          <span className="setting-label">Notification</span>
          <PopoverButton
            title={currentNotificationType}
            icon={images.icCollapse}
            data={[
              { value: "Quiet", label: "Quiet" },
              { value: "Alert", label: "Alert" },
              { value: "Muted", label: "Muted" },
            ]}
            onSelected={handleSelectMenu}
          />
        </div>
      )}
      {isOwner && (
        <div
          className="setting-item normal-button"
          onClick={handleToggleModalDelete}
        >
          <img src={images.icSettingChannelDelete} alt="" />
          <span className="setting-label">Delete channel</span>
        </div>
      )}
      <ModalConfirmDeleteChannel
        open={isOpenConfirm}
        handleClose={handleToggleModalDelete}
        channelName={currentChannel?.channel_name || ""}
        onDelete={handleDeleteChannel}
      />
    </div>
  );
};

export default SettingChannel;
