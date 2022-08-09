import { CircularProgress } from "@material-ui/core";
import { Emoji } from "emoji-mart";
import React, {
  useRef,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from "react";
import {
  updateChannel,
  uploadChannelAvatar,
} from "renderer/actions/UserActions";
import ImageHelper from "renderer/common/ImageHelper";
import EmojiAndAvatarPicker from "renderer/shared/EmojiAndAvatarPicker";
import useAppDispatch from "renderer/hooks/useAppDispatch";
import useAppSelector from "renderer/hooks/useAppSelector";
import images from "../../../../common/images";
import AvatarView from "../../../../shared/AvatarView";
import PopoverButton from "../../../../shared/PopoverButton";
import ChannelSettings from "./ChannelSettings";
import "./index.scss";
import { Channel, UserData } from "renderer/models";

type ChannelHeaderProps = {
  currentChannel?: Channel;
  teamUserData: Array<UserData>;
  teamId: string;
};

const ChannelHeader = forwardRef(
  ({ currentChannel, teamUserData, teamId }: ChannelHeaderProps, ref) => {
    const dispatch = useAppDispatch();
    const userData = useAppSelector((state) => state.user.userData);
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
    const renderChannelIcon = useCallback(() => {
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
      if (currentChannel?.attachment) {
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
    }, [
      currentChannel?.attachment,
      currentChannel?.channel_emoji,
      currentChannel?.channel_image_url,
      currentChannel?.user,
      teamId,
      teamUserData,
    ]);
    const handleEmojiClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => e.stopPropagation(),
      []
    );
    const onAddFiles = useCallback(
      async (fs) => {
        if (fs == null || fs.length === 0 || !currentChannel?.channel_id)
          return;
        const file = [...fs][0];
        dispatch(uploadChannelAvatar(teamId, currentChannel?.channel_id, file));
        popupChannelIconRef.current?.hide();
      },
      [currentChannel?.channel_id, dispatch, teamId]
    );
    const onSelectRecentFile = useCallback(
      async (file) => {
        if (!currentChannel?.channel_id) return;
        await dispatch(
          updateChannel(currentChannel.channel_id, {
            channel_emoji: "",
            channel_image_url: file.file_url,
          })
        );
        popupChannelIconRef.current?.hide();
      },
      [currentChannel?.channel_id, dispatch]
    );
    const onAddEmoji = useCallback(
      async (emoji) => {
        if (!currentChannel?.channel_id) return;
        await dispatch(
          updateChannel(currentChannel.channel_id, {
            channel_emoji: emoji.id,
            channel_image_url: "",
          })
        );
        popupChannelIconRef.current?.hide();
      },
      [currentChannel?.channel_id, dispatch]
    );
    const handleChannelClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (!currentChannel?.user) {
          settingRef.current?.show(e.currentTarget, {
            x: 570,
            y: 110,
          });
        }
      },
      [currentChannel?.user]
    );
    const handleMemberClick = useCallback(
      (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        setActiveMember(true);
        settingRef.current?.show(e.currentTarget, {
          x: e.pageX,
          y: e.pageY,
        });
      },
      []
    );
    const onCloseChannelSetting = useCallback(() => {
      setActiveMember(false);
      setActiveName(false);
    }, []);
    const handleCloseChannelSetting = useCallback(() => {
      settingRef.current?.hide?.();
    }, []);
    const renderUser = useCallback(
      (el: any, index: number) => (
        <div
          key={el.user_id}
          className="avatar__wrapper"
          style={{ right: 15 * (users.slice(0, 10).length - index) }}
        >
          <img
            className="avatar"
            src={ImageHelper.normalizeImage(el.avatar_url, el.user_id)}
            alt=""
            referrerPolicy="no-referrer"
          />
        </div>
      ),
      [users]
    );
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
                    onClick={handleEmojiClick}
                  >
                    <EmojiAndAvatarPicker
                      onAddFiles={onAddFiles}
                      onAddEmoji={onAddEmoji}
                      onSelectRecentFile={onSelectRecentFile}
                      channelId={currentChannel?.channel_id}
                    />
                  </div>
                }
              />
            ) : (
              <div className="channel-icon__wrapper">{renderChannelIcon()}</div>
            )}
            <div
              ref={settingButtonRef}
              onClick={handleChannelClick}
              style={{ display: "flex", width: 0, flex: 1 }}
            >
              <span className="channel-view__title text-ellipsis">
                {currentChannel?.user?.user_name
                  ? currentChannel?.user?.user_name
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
                onClick={handleMemberClick}
              >
                {users.slice(0, 10).map(renderUser)}
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
            onClose={onCloseChannelSetting}
            componentPopup={
              <ChannelSettings
                currentChannel={currentChannel}
                teamUserData={teamUserData}
                isActiveMember={isActiveMember}
                isActiveName={isActiveName}
                onClose={handleCloseChannelSetting}
              />
            }
          />
        </div>
      </>
    );
  }
);

export default ChannelHeader;
