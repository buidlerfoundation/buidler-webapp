import React, { useCallback, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import NormalButton from "renderer/shared/NormalButton";
import TeamUserItem from "renderer/shared/TeamUserItem";
import { createMemberChannelData } from "renderer/helpers/ChannelHelper";
import api from "../../../../api";
import images from "../../../../common/images";
import AvatarView from "../../../../shared/AvatarView";

type SettingMemberProps = {
  currentChannel?: any;
  teamUserData: Array<any>;
};

const SettingMember = ({
  currentChannel,
  teamUserData,
}: SettingMemberProps) => {
  const user = useSelector((state: any) => state.user.userData);
  const [isOpenUser, setOpenUser] = useState(false);
  const toggleUser = useCallback(() => setOpenUser((current) => !current), []);
  const [members, setMembers] = useState(currentChannel?.channel_members);
  const users = useMemo(() => {
    if (!currentChannel) return [];
    const { channel_type, channel_members } = currentChannel;
    if (channel_type === "Public") {
      return teamUserData;
    }
    if (!channel_members) return [];
    return channel_members
      .filter((id: string) => !!teamUserData.find((el) => el.user_id === id))
      .map((id: any) => teamUserData.find((el) => el.user_id === id));
  }, [currentChannel, teamUserData]);
  const onSave = useCallback(async () => {
    const { res } = await createMemberChannelData(
      members.map((el: string) => ({ user_id: el }))
    );
    const channel_member_data = res;
    await api.updateChannelMember(currentChannel.channel_id, {
      channel_member_data,
    });
    toggleUser();
  }, [currentChannel?.channel_id, members, toggleUser]);
  const handleSelectUser = useCallback(
    (el, isSelected) => {
      const newMembers = isSelected
        ? members.filter((u: string) => u !== el.user_id)
        : [...members, el.user_id];
      setMembers(newMembers);
    },
    [members]
  );
  const renderUser = useCallback(
    (el: any) => (
      <div key={el.user_id} className="setting-member-item">
        <AvatarView user={el} />
        <span className="member-name">{el.user_name}</span>
      </div>
    ),
    []
  );
  const renderTeamUser = useCallback(
    (el) => {
      const isSelected = members.find((u: string) => u === el.user_id);
      return (
        <TeamUserItem
          key={el.user_id}
          user={el}
          disabled={el.user_id === user.user_id}
          isSelected={isSelected}
          onClick={handleSelectUser}
        />
      );
    },
    [handleSelectUser, members, user.user_id]
  );
  return (
    <div className="setting-body">
      <div style={{ height: 7.5 }} />
      {!isOpenUser && (
        <>
          {users.map(renderUser)}
          <div
            className="setting-member-item normal-button"
            onClick={toggleUser}
          >
            <div
              style={{
                width: 25,
                height: 25,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img src={images.icEditMember} alt="" />
            </div>
            <span className="member-name">Edit member</span>
          </div>
        </>
      )}
      {isOpenUser && (
        <div className="team-user-container">
          {teamUserData.map(renderTeamUser)}
          <div style={{ flex: 1 }} />
          <div className="user-bottom">
            <NormalButton title="Cancel" type="normal" onPress={toggleUser} />
            <div style={{ width: 10 }} />
            <NormalButton title="Save" type="main" onPress={onSave} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingMember;
