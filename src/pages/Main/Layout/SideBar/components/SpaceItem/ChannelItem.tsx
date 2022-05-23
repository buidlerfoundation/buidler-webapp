import { CircularProgress } from "@material-ui/core";
import { Emoji } from "emoji-mart";
import { useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ImageHelper from "common/ImageHelper";
import images from "common/images";
import EmojiAndAvatarPicker from "components/EmojiAndAvatarPicker";
import PopoverButton from "components/PopoverButton";
import "./index.scss";

type ChannelItemProps = {
  c: any;
  currentChannel: any;
  onContextChannel: (e: any, channel: any) => void;
  collapsed: boolean;
  isOwner: boolean;
  updateChannel?: (channelId: string, body: any) => any;
  uploadChannelAvatar?: (teamId: string, channelId: string, file: any) => any;
};

const ChannelItem = ({
  c,
  currentChannel,
  onContextChannel,
  collapsed,
  isOwner,
  updateChannel,
  uploadChannelAvatar,
}: ChannelItemProps) => {
  const popupChannelIconRef = useRef<any>();
  const navigate = useNavigate();
  const currentTeam = useSelector((state: any) => state.user.currentTeam);
  const isSelected = c?.channel_id === currentChannel?.channel_id;
  const isPrivate = c.channel_type === "Private";
  const isUnSeen = !c.seen;
  const isMuted = c.notification_type === "Muted";
  const isQuiet = c.notification_type === "Quiet";
  const renderChannelIcon = () => {
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
  };
  const onAddFiles = async (fs: any) => {
    if (fs == null || fs.length === 0) return;
    const file = [...fs][0];
    uploadChannelAvatar?.(currentTeam.team_id, c?.channel_id, file);
    popupChannelIconRef.current?.hide();
  };
  const onAddEmoji = async (emoji: any) => {
    await updateChannel?.(c?.channel_id, {
      channel_emoji: emoji.id,
      channel_image_url: "",
    });
    popupChannelIconRef.current?.hide();
  };
  const onSelectRecentFile = async (file: any) => {
    await updateChannel?.(currentChannel?.channel_id, {
      channel_emoji: "",
      channel_image_url: file.file_url,
    });
    popupChannelIconRef.current?.hide();
  };
  return (
    <div
      className={`channel-wrapper ${collapsed ? "collapsed" : ""} ${
        isSelected ? "channel-selected" : ""
      } ${isMuted ? "channel-muted" : ""} ${isUnSeen ? "channel-un-seen" : ""}`}
      onClick={() =>
        navigate(`/home?channel_id=${c?.channel_id}`, { replace: true })
      }
      onContextMenu={(e) => onContextChannel(e, c)}
    >
      {isOwner ? (
        <PopoverButton
          ref={popupChannelIconRef}
          componentButton={
            <div className="channel-icon__wrapper">{renderChannelIcon()}</div>
          }
          componentPopup={
            <div
              className="emoji-picker__container"
              onClick={(e) => e.stopPropagation()}
            >
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

export default ChannelItem;
