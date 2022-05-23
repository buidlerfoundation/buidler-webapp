import { CircularProgress } from '@material-ui/core';
import { Emoji } from 'emoji-mart';
import { useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import ImageHelper from 'common/ImageHelper';
import images from 'common/images';
import DefaultSpaceIcon from 'components/DefaultSpaceIcon';
import EmojiAndAvatarPicker from 'components/EmojiAndAvatarPicker';
import EmojiPicker from 'components/EmojiPicker';
import PopoverButton from 'components/PopoverButton';
import ChannelItem from './ChannelItem';
import './index.scss';

type SpaceItemProps = {
  space: any;
  channel: Array<any>;
  currentChannel: any;
  onCreateChannel: (group: any) => void;
  onContextChannel: (e: any, channel: any) => void;
  onContextSpaceChannel: (e: any) => void;
  updateSpaceChannel?: (spaceId: string, body: any) => any;
  uploadSpaceAvatar?: (teamId: string, spaceId: string, file: any) => any;
  isOwner: boolean;
  updateChannel?: (channelId: string, body: any) => any;
  uploadChannelAvatar?: (teamId: string, channelId: string, file: any) => any;
};

const SpaceItem = ({
  space,
  channel,
  currentChannel,
  onCreateChannel,
  onContextChannel,
  onContextSpaceChannel,
  updateSpaceChannel,
  uploadSpaceAvatar,
  isOwner,
  updateChannel,
  uploadChannelAvatar,
}: SpaceItemProps) => {
  const popupSpaceIconRef = useRef<any>();
  const [isCollapsed, setCollapsed] = useState(true);
  const currentTeam = useSelector((state: any) => state.user.currentTeam);
  const toggleCollapsed = () => setCollapsed(!isCollapsed);
  const channelSpace = useMemo(() => {
    return channel
      ?.filter((c: any) => c?.space_id === space?.space_id)
      .sort((a1, a2) => {
        if (a1.channel_name < a2.channel_name) return 1;
        if (a1.channel_name > a2.channel_name) return -1;
        return 0;
      })
      .sort((b1, b2) => {
        if (b1.channel_type < b2.channel_type) return 1;
        return -1;
      });
  }, [channel, space?.space_id]);
  const renderSpaceIcon = () => {
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
    // return <img className="space-icon" src={images.icLogoSquare} alt="" />;
  };
  const onAddFiles = async (fs: any) => {
    if (fs == null || fs.length === 0) return;
    const file = [...fs][0];
    uploadSpaceAvatar?.(currentTeam.team_id, space.space_id, file);
    popupSpaceIconRef.current?.hide();
  };
  const onAddEmoji = async (emoji: any) => {
    await updateSpaceChannel?.(space.space_id, {
      space_emoji: emoji.id,
      space_image_url: '',
    });
    popupSpaceIconRef.current?.hide();
  };
  const onSelectRecentFile = async (file: any) => {
    await updateSpaceChannel?.(space.space_id, {
      space_emoji: '',
      space_image_url: file.file_url,
    });
    popupSpaceIconRef.current?.hide();
  };
  return (
    <div className={`space-item__container ${isCollapsed ? '' : 'space-open'}`}>
      <div
        className="title-wrapper"
        onClick={toggleCollapsed}
        onContextMenu={onContextSpaceChannel}
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
                onClick={(e) => e.stopPropagation()}
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
      </div>
      {channelSpace?.map?.((c: any) => (
        <ChannelItem
          key={c.channel_id}
          c={c}
          currentChannel={currentChannel}
          onContextChannel={onContextChannel}
          collapsed={isCollapsed}
          isOwner={isOwner}
          updateChannel={updateChannel}
          uploadChannelAvatar={uploadChannelAvatar}
        />
      ))}
    </div>
  );
};

export default SpaceItem;
