import React, { useState, useEffect } from 'react';
import api from '../../../../api';
import images from '../../../../common/images';
import AppInput from '../../../../components/AppInput';
import ModalConfirmDeleteChannel from '../../../../components/ModalConfirmDeleteChannel';
import NormalButton from '../../../../components/NormalButton';
import PopoverButton from '../../../../components/PopoverButton';

type SettingChannelProps = {
  currentChannel?: any;
  setCurrentChannel?: (channel: any) => any;
  deleteChannel?: (channelId: string) => any;
  updateChannel?: (channelId: string, body: any) => any;
  onClose: () => void;
  isActiveName: boolean;
};

const SettingChannel = ({
  currentChannel,
  setCurrentChannel,
  deleteChannel,
  updateChannel,
  onClose,
  isActiveName,
}: SettingChannelProps) => {
  const [isOpenConfirm, setOpenConfirm] = useState(false);
  const [currentName, setCurrentName] = useState('');
  const [isOpenEditName, setOpenEditName] = useState(false);
  const toggleEditName = () => setOpenEditName(!isOpenEditName);
  useEffect(() => {
    if (isActiveName) {
      setOpenEditName(true);
    }
  }, [isActiveName]);
  useEffect(() => {
    setCurrentName(currentChannel.channel_name);
  }, [currentChannel.channel_name, isOpenEditName]);
  return (
    <div className="setting-body">
      {currentChannel?.channel_type !== 'Direct' && false && (
        <div className="setting-item">
          <div
            style={{
              borderRadius: '50%',
              width: 25,
              height: 25,
              backgroundColor: '#4D08A4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img src={images.icPrivateWhite} alt="" />
          </div>
          <span className="setting-label">Channel Type</span>
          <PopoverButton
            title={currentChannel?.channel_type}
            icon={images.icCollapse}
            data={[
              { value: 'Public', label: 'Public' },
              { value: 'Private', label: 'Private' },
            ]}
            onSelected={(item) => {
              updateChannel?.(currentChannel.channel_id, {
                channel_type: item.value,
              });
            }}
          />
        </div>
      )}
      <div className="setting-item normal-button" onClick={toggleEditName}>
        <img src={images.icSettingChannelEdit} alt="" />
        <span className="setting-label">Edit channel name</span>
      </div>
      {isOpenEditName && (
        <div className="edit-name-input__wrapper">
          <AppInput
            className="edit-name-input"
            value={currentName}
            placeholder="Channel name"
            onChange={(e) =>
              setCurrentName(e.target.value.toLowerCase().replaceAll(' ', '-'))
            }
            autoFocus
          />
          <NormalButton title="Cancel" onPress={toggleEditName} type="normal" />
          <div style={{ width: 10 }} />
          <NormalButton
            title="Save"
            onPress={async () => {
              await updateChannel?.(currentChannel.channel_id, {
                channel_name: currentName,
              });
              toggleEditName();
            }}
            type="main"
          />
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
              { value: 'Quiet', label: 'Quiet' },
              { value: 'Alert', label: 'Alert' },
              { value: 'Muted', label: 'Muted' },
            ]}
            onSelected={async (item) => {
              await api.updateChannelNotification(
                currentChannel.channel_id,
                item.value
              );
              setCurrentChannel?.({
                ...currentChannel,
                notification_type: item.value,
              });
            }}
          />
        </div>
      )}
      <div
        className="setting-item normal-button"
        onClick={() => setOpenConfirm(true)}
      >
        <img src={images.icSettingChannelDelete} alt="" />
        <span className="setting-label">Delete channel</span>
      </div>
      <ModalConfirmDeleteChannel
        open={isOpenConfirm}
        handleClose={() => setOpenConfirm(false)}
        channelName={currentChannel.channel_name}
        onDelete={async () => {
          await deleteChannel?.(currentChannel.channel_id);
          setOpenConfirm(false);
          onClose();
        }}
      />
    </div>
  );
};

export default SettingChannel;
