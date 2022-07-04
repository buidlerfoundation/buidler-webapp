import React, { useState, useEffect, useCallback } from "react";
import {
  deleteChannel,
  setCurrentChannel,
  updateChannel,
} from "renderer/actions/UserActions";
import useAppDispatch from "renderer/hooks/useAppDispatch";
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
};

const SettingChannel = ({
  currentChannel,
  onClose,
  isActiveName,
}: SettingChannelProps) => {
  const dispatch = useAppDispatch();
  const [isOpenConfirm, setOpenConfirm] = useState(false);
  const [currentName, setCurrentName] = useState("");
  const [isOpenEditName, setOpenEditName] = useState(false);
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
    await dispatch(
      updateChannel(currentChannel.channel_id, {
        channel_name: currentName,
      })
    );
    toggleEditName();
  }, [currentChannel?.channel_id, currentName, toggleEditName, dispatch]);
  const handleSelectMenu = useCallback(
    async (item: PopoverItem) => {
      if (!currentChannel?.channel_id) return;
      await api.updateChannelNotification(
        currentChannel.channel_id,
        item.value
      );
      dispatch(
        setCurrentChannel?.({
          ...currentChannel,
          notification_type: item.value,
        })
      );
    },
    [currentChannel, dispatch]
  );
  const handleToggleModalDelete = useCallback(
    () => setOpenConfirm((current) => !current),
    []
  );
  const handleDeleteChannel = useCallback(async () => {
    if (!currentChannel?.channel_id) return;
    await dispatch(deleteChannel(currentChannel.channel_id));
    setOpenConfirm(false);
    onClose();
  }, [currentChannel?.channel_id, dispatch, onClose]);
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
      <div
        className="setting-item normal-button"
        style={{ marginTop: 12 }}
        onClick={toggleEditName}
      >
        <img src={images.icSettingChannelEdit} alt="" />
        <span className="setting-label">Edit channel name</span>
      </div>
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
            title={currentChannel?.notification_type}
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
      <div
        className="setting-item normal-button"
        onClick={handleToggleModalDelete}
      >
        <img src={images.icSettingChannelDelete} alt="" />
        <span className="setting-label">Delete channel</span>
      </div>
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
