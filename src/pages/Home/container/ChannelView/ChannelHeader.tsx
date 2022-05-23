import { CircularProgress } from "@material-ui/core";
import { Emoji } from "emoji-mart";
import React, {
  useRef,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useSelector } from "react-redux";
import ImageHelper from "common/ImageHelper";
import EmojiAndAvatarPicker from "components/EmojiAndAvatarPicker";
import { normalizeUserName } from "helpers/MessageHelper";
import images from "../../../../common/images";
import AvatarView from "../../../../components/AvatarView";
import PopoverButton from "../../../../components/PopoverButton";
import ChannelSettings from "./ChannelSettings";
import "./index.scss";

type ChannelHeaderProps = {
  currentChannel?: any;
  teamUserData: Array<any>;
  setCurrentChannel?: (channel: any) => any;
  deleteChannel?: (channelId: string) => any;
  updateChannel?: (channelId: string, body: any) => any;
  teamId: string;
  uploadChannelAvatar?: (teamId: string, channelId: string, file: any) => any;
};

const ChannelHeader = forwardRef(
  (
    {
      currentChannel,
      teamUserData,
      setCurrentChannel,
      deleteChannel,
      updateChannel,
      teamId,
      uploadChannelAvatar,
    }: ChannelHeaderProps,
    ref
  ) => {
    const userData = useSelector((state: any) => state.user.userData);
    const popupChannelIconRef = useRef<any>();
    const [isActiveMember, setActiveMember] = useState(false);
    const [isActiveName, setActiveName] = useState(false);
    const settingButtonRef = useRef<any>();
    const settingRef = useRef<any>();
    const users = useMemo(() => {
      if (!currentChannel) return [];
      const { channel_type, channel_member } = currentChannel;
      if (channel_type === "Public") {
        return teamUserData;
      }
      if (!channel_member) return [];
      return channel_member
        .filter((id: string) => !!teamUserData.find((el) => el.user_id === id))
        .map((id: any) => teamUserData.find((el) => el.user_id === id));
    }, [currentChannel, teamUserData]);
    const isChannelPrivate = currentChannel?.channel_type === "Private";
    const role = teamUserData?.find?.(
      (el) => el.user_id === userData?.user_id
    )?.role;
    const isOwner = role === "Owner";
    useImperativeHandle(ref, () => {
      return {
        showSetting(action: "edit-member" | "edit-name") {
          if (action === "edit-member") {
            setActiveMember(true);
          }
          if (action === "edit-name") {
            setActiveName(true);
          }
          settingButtonRef.current.click();
        },
        hideSetting() {
          settingRef.current?.hide?.();
        },
      };
    });
    const renderChannelIcon = () => {
      if (currentChannel?.user) {
        return (
          <AvatarView
            user={teamUserData.find(
              (u) => u.user_id === currentChannel?.user?.user_id
            )}
            size={25}
          />
        );
      }
      if (currentChannel.attachment) {
        return (
          <>
            <img
              className="channel-icon"
              src={currentChannel.attachment.file}
              alt=""
            />
            {currentChannel?.attachment?.loading && (
              <div className="attachment-loading">
                <CircularProgress size={20} />
              </div>
            )}
          </>
        );
      }
      if (currentChannel?.channel_emoji) {
        return (
          <Emoji emoji={currentChannel?.channel_emoji} set="apple" size={20} />
        );
      }
      if (currentChannel?.channel_image_url) {
        return (
          <img
            className="channel-icon"
            src={ImageHelper.normalizeImage(
              currentChannel?.channel_image_url,
              teamId
            )}
            alt=""
          />
        );
      }
      return <img src={images.icCirclePublicChannel} alt="" />;
    };
    const onAddFiles = async (fs: any) => {
      if (fs == null || fs.length === 0) return;
      const file = [...fs][0];
      uploadChannelAvatar?.(teamId, currentChannel.channel_id, file);
      popupChannelIconRef.current?.hide();
    };
    const onSelectRecentFile = async (file: any) => {
      await updateChannel?.(currentChannel.channel_id, {
        channel_emoji: "",
        channel_image_url: file.file_url,
      });
      popupChannelIconRef.current?.hide();
    };
    const onAddEmoji = async (emoji: any) => {
      await updateChannel?.(currentChannel.channel_id, {
        channel_emoji: emoji.id,
        channel_image_url: "",
      });
      popupChannelIconRef.current?.hide();
    };
    return (
      <>
        <div className="channel-view__header">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              flex: 1,
            }}
          >
            {isOwner && !currentChannel?.user ? (
              <PopoverButton
                ref={popupChannelIconRef}
                componentButton={
                  <div className="channel-icon__wrapper">
                    {renderChannelIcon()}
                  </div>
                }
                componentPopup={
                  <div
                    className="emoji-picker__container"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <EmojiAndAvatarPicker
                      onAddFiles={onAddFiles}
                      onAddEmoji={onAddEmoji}
                      onSelectRecentFile={onSelectRecentFile}
                      channelId={currentChannel.channel_id}
                    />
                  </div>
                }
              />
            ) : (
              <div className="channel-icon__wrapper">{renderChannelIcon()}</div>
            )}
            <div
              ref={settingButtonRef}
              onClick={(e) => {
                if (!currentChannel?.user) {
                  settingRef.current?.show(e.currentTarget, {
                    x: 385,
                    y: 110,
                  });
                }
              }}
              style={{ display: "flex", width: 0, flex: 1 }}
            >
              <span className="channel-view__title text-ellipsis">
                {currentChannel?.user?.user_name
                  ? normalizeUserName(currentChannel?.user?.user_name)
                  : currentChannel?.channel_name}
              </span>
            </div>
            {isChannelPrivate && (
              <img
                className="icon-private"
                src={images.icPrivateWhite}
                alt=""
              />
            )}
          </div>
          {isChannelPrivate && (
            <div className="channel-view__members-wrapper">
              <div
                className="channel-view__members"
                onClick={(e) => {
                  setActiveMember(true);
                  settingRef.current?.show(e.currentTarget, {
                    x: e.pageX,
                    y: e.pageY,
                  });
                }}
              >
                {users.slice(0, 10).map((el: any, index: number) => (
                  <div
                    key={el.user_id}
                    className="avatar__wrapper"
                    style={{ right: 15 * (users.slice(0, 10).length - index) }}
                  >
                    <img
                      className="avatar"
                      src={ImageHelper.normalizeImage(
                        el.avatar_url,
                        el.user_id
                      )}
                      alt=""
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ))}
                {users.length - 10 > 0 && (
                  <div
                    className="avatar-more__wrapper"
                    style={{ left: 15 * Math.min(10, users.length) }}
                  >
                    <span>{users.length - 10}+</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="channel-view__actions">
          <PopoverButton
            popupOnly
            ref={settingRef}
            onClose={() => {
              setActiveMember(false);
              setActiveName(false);
            }}
            componentPopup={
              <ChannelSettings
                currentChannel={currentChannel}
                setCurrentChannel={setCurrentChannel}
                teamUserData={teamUserData}
                isActiveMember={isActiveMember}
                isActiveName={isActiveName}
                deleteChannel={deleteChannel}
                updateChannel={updateChannel}
                onClose={() => {
                  settingRef.current?.hide?.();
                }}
              />
            }
          />
        </div>
      </>
    );
  }
);

export default ChannelHeader;
