import { CircularProgress } from "@material-ui/core";
import { Emoji } from "emoji-mart";
import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import {
  updateSpaceChannel,
  uploadSpaceAvatar,
} from "renderer/actions/UserActions";
import ImageHelper from "renderer/common/ImageHelper";
import DefaultSpaceIcon from "renderer/components/DefaultSpaceIcon";
import EmojiAndAvatarPicker from "renderer/components/EmojiAndAvatarPicker";
import PopoverButton from "renderer/components/PopoverButton";
import SpaceItemBadge from "renderer/components/SpaceItemBadge";
import { getSpaceBackgroundColor } from "renderer/helpers/SpaceHelper";
import useAppDispatch from "renderer/hooks/useAppDispatch";
import useAppSelector from "renderer/hooks/useAppSelector";
import { Channel, Space } from "renderer/models";
import ChannelItem from "./ChannelItem";
import "./index.scss";

type SpaceItemProps = {
  space: Space;
  channels: Array<Channel>;
  onContextChannel: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    channel: Channel
  ) => void;
  onContextSpaceChannel: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    s: Space
  ) => void;
  isOwner: boolean;
  onSpaceBadgeClick: (space: Space) => void;
};

const SpaceItem = ({
  space,
  channels,
  onContextChannel,
  onContextSpaceChannel,
  isOwner,
  onSpaceBadgeClick,
}: SpaceItemProps) => {
  const dispatch = useAppDispatch();
  const popupSpaceIconRef = useRef<any>();
  const [isCollapsed, setCollapsed] = useState(true);
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const currentChannel = useAppSelector((state) => state.user.currentChannel);
  const toggleCollapsed = useCallback(
    () => setCollapsed((current) => !current),
    []
  );
  const handleContextMenuSpaceChannel = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      onContextSpaceChannel(e, space);
    },
    [onContextSpaceChannel, space]
  );
  const channelSpace = useMemo(() => {
    return channels
      ?.sort((a1, a2) => {
        if (a1.channel_name < a2.channel_name) return 1;
        if (a1.channel_name > a2.channel_name) return -1;
        return 0;
      })
      ?.sort((b1, b2) => {
        if (b1.channel_type < b2.channel_type) return 1;
        return -1;
      });
  }, [channels]);
  const renderSpaceIcon = useCallback(() => {
    if (space.attachment) {
      return (
        <>
          <img className="space-icon" src={space.attachment.file} alt="" />
          {space?.attachment?.loading && (
            <div className="attachment-loading">
              <CircularProgress size={30} />
            </div>
          )}
        </>
      );
    }
    if (space.space_image_url) {
      return (
        <img
          className="space-icon"
          src={ImageHelper.normalizeImage(
            space.space_image_url,
            currentTeam.team_id
          )}
          alt=""
        />
      );
    }
    if (space.space_emoji) {
      return <Emoji emoji={space.space_emoji} set="apple" size={20} />;
    }
    return <DefaultSpaceIcon name={space.space_name} />;
  }, [
    currentTeam?.team_id,
    space?.attachment,
    space?.space_emoji,
    space?.space_image_url,
    space?.space_name,
  ]);
  const handlePopupClick = useCallback((e) => e.stopPropagation(), []);
  const onAddFiles = useCallback(
    async (fs) => {
      if (fs == null || fs.length === 0) return;
      const file = [...fs][0];
      dispatch(uploadSpaceAvatar(currentTeam.team_id, space.space_id, file));
      popupSpaceIconRef.current?.hide();
    },
    [currentTeam?.team_id, space?.space_id, dispatch]
  );
  const onAddEmoji = useCallback(
    async (emoji) => {
      await dispatch(
        updateSpaceChannel(space.space_id, {
          space_emoji: emoji.id,
          space_image_url: "",
        })
      );
      popupSpaceIconRef.current?.hide();
    },
    [space?.space_id, dispatch]
  );
  const onSelectRecentFile = useCallback(
    async (file) => {
      const url = ImageHelper.normalizeImage(
        file.file_url,
        currentTeam.team_id
      );
      const colorAverage = await getSpaceBackgroundColor(url);
      await dispatch(
        updateSpaceChannel(space.space_id, {
          space_emoji: "",
          space_image_url: file.file_url,
          space_background_color: colorAverage,
        })
      );
      popupSpaceIconRef.current?.hide();
    },
    [currentTeam?.team_id, space.space_id, dispatch]
  );
  const handleBadgeClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
      onSpaceBadgeClick(space);
    },
    [onSpaceBadgeClick, space]
  );
  const renderChannelItem = useCallback(
    (c: Channel) => (
      <ChannelItem
        key={c.channel_id}
        c={c}
        onContextChannel={onContextChannel}
        isOwner={isOwner}
        isSelected={currentChannel?.channel_id === c.channel_id}
      />
    ),
    [currentChannel?.channel_id, isOwner, onContextChannel]
  );
  return (
    <div
      className={`space-item__container ${
        isCollapsed ? "space-collapsed" : ""
      }`}
    >
      <div
        className="title-wrapper"
        onClick={toggleCollapsed}
        onContextMenu={handleContextMenuSpaceChannel}
      >
        {isOwner ? (
          <PopoverButton
            ref={popupSpaceIconRef}
            componentButton={
              <div className="space-icon__wrapper">{renderSpaceIcon()}</div>
            }
            componentPopup={
              <div
                className="emoji-picker__container"
                onClick={handlePopupClick}
              >
                <EmojiAndAvatarPicker
                  onAddFiles={onAddFiles}
                  onAddEmoji={onAddEmoji}
                  spaceId={space.space_id}
                  onSelectRecentFile={onSelectRecentFile}
                />
              </div>
            }
          />
        ) : (
          <div className="space-icon__wrapper">{renderSpaceIcon()}</div>
        )}
        <span className="title text-ellipsis">{space.space_name}</span>
        {space.space_type === "Private" && (
          <SpaceItemBadge
            color={space.icon_color || ""}
            backgroundColor={space.icon_sub_color || ""}
            onClick={handleBadgeClick}
          />
        )}
      </div>
      {channelSpace?.map?.(renderChannelItem)}
    </div>
  );
};

export default memo(SpaceItem);
