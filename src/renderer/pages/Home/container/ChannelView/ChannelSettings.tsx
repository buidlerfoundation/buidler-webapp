import React, { useState, useEffect } from "react";
import useAppSelector from "renderer/hooks/useAppSelector";
import SettingChannel from "./SettingChannel";
import SettingMember from "./SettingMember";

type ChannelSettingsProps = {
  currentChannel?: any;
  teamUserData: Array<any>;
  isActiveMember: boolean;
  isActiveName: boolean;
  onClose: () => void;
  isOwner?: boolean;
};

const ChannelSettings = ({
  currentChannel,
  teamUserData,
  isActiveMember,
  onClose,
  isActiveName,
  isOwner,
}: ChannelSettingsProps) => {
  const [page, setPage] = useState(1);
  const spaceMembers = useAppSelector((state) => state.user.spaceMembers);
  const isChannelPrivate = currentChannel?.channel_type === "Private";
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
            className={`tab-item normal-button ${page === 0 ? "active" : ""}`}
            onClick={() => setPage(0)}
          >
            <span>Members</span>
          </div>
        )}
        <div
          className={`tab-item normal-button ${page === 1 ? "active" : ""}`}
          onClick={() => setPage(1)}
        >
          <span>Settings</span>
        </div>
      </div>
      {page === 1 && (
        <SettingChannel
          currentChannel={currentChannel}
          onClose={onClose}
          isActiveName={isActiveName}
          isOwner={isOwner}
        />
      )}
      {page === 0 && (
        <SettingMember
          currentChannel={currentChannel}
          teamUserData={isChannelPrivate ? spaceMembers : teamUserData}
        />
      )}
    </div>
  );
};

export default ChannelSettings;
