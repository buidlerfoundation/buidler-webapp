import { CircularProgress } from '@material-ui/core';
import { Emoji } from 'emoji-mart';
import React, { memo, useCallback, useMemo, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import {
  updateChannel,
  uploadChannelAvatar,
} from 'renderer/actions/UserActions';
import ImageHelper from 'renderer/common/ImageHelper';
import images from 'renderer/common/images';
import EmojiAndAvatarPicker from 'renderer/components/EmojiAndAvatarPicker';
import PopoverButton from 'renderer/components/PopoverButton';
import useAppDispatch from 'renderer/hooks/useAppDispatch';
import useAppSelector from 'renderer/hooks/useAppSelector';
import { Channel } from 'renderer/models';
import './index.scss';

type ChannelItemProps = {
  c: Channel;
  onContextChannel: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    channel: Channel
  ) => void;
  isOwner: boolean;
  isSelected: boolean;
};

const ChannelItem = ({
  c,
  onContextChannel,
  isOwner,
  isSelected,
}: ChannelItemProps) => {
  const dispatch = useAppDispatch();
  const popupChannelIconRef = useRef<any>();
  const history = useHistory();
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const isPrivate = useMemo(
    () => c.channel_type === 'Private',
    [c.channel_type]
  );
  const isUnSeen = useMemo(() => !c.seen, [c.seen]);
  const isMuted = useMemo(
    () => c.notification_type === 'Muted',
    [c.notification_type]
  );
  const isQuiet = useMemo(
    () => c.notification_type === 'Quiet',
    [c.notification_type]
  );
  const renderChannelIcon = useCallback(() => {
    if (c.attachment) {
      return (
        <>
          <img className="channel-icon" src={c.attachment.file} alt="" />
          {c?.attachment?.loading && (
            <div className="attachment-loading">
              <CircularProgress size={20} />
            </div>
          )}
        </>
      );
    }
    if (c.channel_image_url) {
      return (
        <img
          className="channel-icon"
          src={ImageHelper.normalizeImage(
            c.channel_image_url,
            currentTeam.team_id
          )}
          alt=""
        />
      );
    }
    if (c.channel_emoji) {
      return <Emoji emoji={c.channel_emoji} set="apple" size={16} />;
    }
    if (isPrivate) {
      return <img className="img-private" alt="" src={images.icPrivateWhite} />;
    }
    return <img className="img-private" alt="" src={images.icPublicChannel} />;
  }, [
    c.attachment,
    c.channel_emoji,
    c.channel_image_url,
    currentTeam.team_id,
    isPrivate,
  ]);
  const handleClick = useCallback(
    () => history.replace(`/?channel_id=${c?.channel_id}`),
    [c?.channel_id, history]
  );
  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => onContextChannel(e, c),
    [c, onContextChannel]
  );
  const handlePopupClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => e.stopPropagation(),
    []
  );
  const onAddFiles = useCallback(
    async (fs) => {
      if (fs == null || fs.length === 0) return;
      const file = [...fs][0];
      dispatch(uploadChannelAvatar(currentTeam.team_id, c?.channel_id, file));
      popupChannelIconRef.current?.hide();
    },
    [c?.channel_id, currentTeam?.team_id, dispatch]
  );
  const onAddEmoji = useCallback(
    async (emoji) => {
      await dispatch(
        updateChannel(c?.channel_id, {
          channel_emoji: emoji.id,
          channel_image_url: '',
        })
      );
      popupChannelIconRef.current?.hide();
    },
    [c?.channel_id, dispatch]
  );
  const onSelectRecentFile = useCallback(
    async (file) => {
      await dispatch(
        updateChannel(c?.channel_id, {
          channel_emoji: '',
          channel_image_url: file.file_url,
        })
      );
      popupChannelIconRef.current?.hide();
    },
    [c?.channel_id, dispatch]
  );
  return (
    <div
      className={`channel-wrapper ${isSelected ? 'channel-selected' : ''} ${
        isMuted ? 'channel-muted' : ''
      } ${isUnSeen ? 'channel-un-seen' : ''}`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      {isOwner ? (
        <PopoverButton
          ref={popupChannelIconRef}
          componentButton={
            <div className="channel-icon__wrapper">{renderChannelIcon()}</div>
          }
          componentPopup={
            <div className="emoji-picker__container" onClick={handlePopupClick}>
              <EmojiAndAvatarPicker
                onAddFiles={onAddFiles}
                onAddEmoji={onAddEmoji}
                channelId={c?.channel_id}
                onSelectRecentFile={onSelectRecentFile}
              />
            </div>
          }
        />
      ) : (
        <div className="channel-icon__wrapper">{renderChannelIcon()}</div>
      )}
      <span className="channel-name">{c.channel_name}</span>
      {isQuiet && <img className="img-bell" alt="" src={images.icBellQuite} />}
    </div>
  );
};

export default memo(ChannelItem);
