import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import SettingChannel from './SettingChannel';
import SettingMember from './SettingMember';

type ChannelSettingsProps = {
  currentChannel?: any;
  setCurrentChannel?: (channel: any) => any;
  teamUserData: Array<any>;
  isActiveMember: boolean;
  isActiveName: boolean;
  deleteChannel?: (channelId: string) => any;
  updateChannel?: (channelId: string, body: any) => any;
  onClose: () => void;
};

const ChannelSettings = ({
  currentChannel,
  setCurrentChannel,
  teamUserData,
  isActiveMember,
  deleteChannel,
  updateChannel,
  onClose,
  isActiveName,
}: ChannelSettingsProps) => {
  const [page, setPage] = useState(1);
  const spaceMembers = useSelector((state: any) => state.user.spaceMembers);
  const isChannelPrivate = currentChannel?.channel_type === 'Private';
  useEffect(() => {
    if (isActiveMember) {
      setPage(0);
    }
    if (isActiveName) {
      setPage(1);
    }
  }, [isActiveMember, isActiveName]);
  return (
    <div className="channel-setting__container">
      <div className="setting-header">
        {isChannelPrivate && (
          <div
            className={`tab-item normal-button ${page === 0 ? 'active' : ''}`}
            onClick={() => setPage(0)}
          >
            <span>Members</span>
          </div>
        )}
        <div
          className={`tab-item normal-button ${page === 1 ? 'active' : ''}`}
          onClick={() => setPage(1)}
        >
          <span>Settings</span>
        </div>
      </div>
      {page === 1 && (
        <SettingChannel
          currentChannel={currentChannel}
          setCurrentChannel={setCurrentChannel}
          deleteChannel={deleteChannel}
          updateChannel={updateChannel}
          onClose={onClose}
          isActiveName={isActiveName}
        />
      )}
      {page === 0 && (
        <SettingMember
          currentChannel={currentChannel}
          setCurrentChannel={setCurrentChannel}
          teamUserData={isChannelPrivate ? spaceMembers : teamUserData}
        />
      )}
    </div>
  );
};

export default ChannelSettings;
