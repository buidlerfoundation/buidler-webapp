import React, { useCallback, useMemo, useState } from "react";
import Popover from "@material-ui/core/Popover";
import { useSelector } from "react-redux";
import "./index.scss";
import NormalButton from "../NormalButton";
import images from "../../common/images";
import GroupChannelPopup from "../GroupChannelPopup";
import AppInput from "../AppInput";
import TeamUserItem from "../TeamUserItem";
import { UserData } from "renderer/models";

type CreateChannelViewProps = {
  onCancel: () => void;
  onCreate: () => void;
  channelData: any;
  update: (key: string, val: any) => void;
  space: Array<any>;
};

const CreateChannelView = ({
  onCancel,
  onCreate,
  channelData,
  update,
  space,
}: CreateChannelViewProps) => {
  const [anchorPopupGroupChannel, setPopupGroupChannel] = useState(null);
  const idPopupGroupChannel = useMemo(() => {
    return !!anchorPopupGroupChannel ? "group-channel-popover" : undefined;
  }, [anchorPopupGroupChannel]);

  const handleUpdateChannelName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      update("name", e.target.value.toLowerCase().replaceAll(" ", "-")),
    [update]
  );
  const openGroupChannelSelection = useCallback((event: any) => {
    setPopupGroupChannel(event.currentTarget);
  }, []);
  const teamUserData = useSelector((state: any) => state.user.teamUserData);
  const user = useSelector((state: any) => state.user.userData);
  const handleUserClick = useCallback(
    (userItem: UserData, isSelected?: boolean) => {
      const newMembers = isSelected
        ? channelData?.members.filter(
            (u: any) => u.user_id !== userItem.user_id
          )
        : [...(channelData?.members || []), userItem];
      update("members", newMembers);
    },
    [channelData?.members, update]
  );
  const handleUpdatePrivateChannel = useCallback(() => {
    update("members", !channelData.isPrivate ? [user] : []);
    update("isPrivate", !channelData.isPrivate);
  }, [channelData?.isPrivate, update, user]);
  const handleCloseSelectSpace = useCallback(
    () => setPopupGroupChannel(null),
    []
  );
  const handleSelectSpace = useCallback(
    (item: any) => {
      update("space", item);
      setPopupGroupChannel(null);
    },
    [update]
  );
  const renderTeamUserData = useCallback(
    (el: any) => {
      const isSelected = !!channelData?.members?.find(
        (u: any) => u.user_id === el.user_id
      );
      return (
        <TeamUserItem
          user={el}
          key={el.user_id}
          isSelected={isSelected}
          disabled={el.user_id === user.user_id}
          onClick={handleUserClick}
        />
      );
    },
    [channelData, handleUserClick, user?.user_id]
  );
  return (
    <div className="create-channel-view__container">
      <span className="create-channel__title">Create channel</span>
      <div style={{ height: 35 }} />
      <AppInput
        className="app-input-highlight"
        placeholder="Enter channel name"
        onChange={handleUpdateChannelName}
        value={channelData?.name}
        autoFocus
      />
      <div style={{ height: 10 }} />
      <div
        className="input-channel-item__container normal-button row__space-between"
        onClick={openGroupChannelSelection}
      >
        <span className="add-channel-group">
          {channelData?.space?.space_name || "Add Channel to Space"}
        </span>
        <img className="group-title__icon" alt="" src={images.icCollapse} />
      </div>
      <div className="row__center" style={{ marginTop: 30, display: "none" }}>
        <span className="private-channel">Private Channel</span>
        <div style={{ width: 15 }} />
        <div style={{ display: "flex" }} onClick={handleUpdatePrivateChannel}>
          <img
            src={
              channelData.isPrivate ? images.icCheckMain : images.icCheckOutline
            }
            alt=""
          />
        </div>
      </div>
      {channelData.isPrivate && (
        <div className="team-user hide-scroll-bar">
          <div style={{ height: 10 }} />
          {teamUserData.map(renderTeamUserData)}
        </div>
      )}
      <div className="channel__bottom">
        <NormalButton title="Cancel" onPress={onCancel} type="normal" />
        <div style={{ width: 10 }} />
        <NormalButton title="Create channel" onPress={onCreate} type="main" />
      </div>
      <Popover
        elevation={0}
        id={idPopupGroupChannel}
        open={!!anchorPopupGroupChannel}
        anchorEl={anchorPopupGroupChannel}
        onClose={handleCloseSelectSpace}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <GroupChannelPopup space={space} onSelect={handleSelectSpace} />
      </Popover>
    </div>
  );
};

export default CreateChannelView;
