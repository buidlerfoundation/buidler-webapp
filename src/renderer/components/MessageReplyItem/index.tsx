import { EmojiData } from "emoji-mart";
import React, { useRef, useCallback, useMemo, useState, memo } from "react";
import { useHistory } from "react-router-dom";
import { addReact, removeReact } from "renderer/actions/ReactActions";
import useAppDispatch from "renderer/hooks/useAppDispatch";
import useAppSelector from "renderer/hooks/useAppSelector";
import { MessageData, ReactReducerData } from "renderer/models";
import images from "../../common/images";
import {
  normalizeMessageText,
  normalizeUserName,
} from "../../helpers/MessageHelper";
import { dateFormatted, messageFromNow } from "../../utils/DateUtils";
import AvatarView from "../AvatarView";
import EmojiPicker from "../EmojiPicker";
import MessagePhotoItem from "../MessagePhotoItem";
import PopoverButton, { PopoverItem } from "../PopoverButton";
import ReactView from "../ReactView";
import "./index.scss";

type MessageReplyItemProps = {
  message: MessageData;
  onCreateTask: (message: MessageData) => void;
  onClick?: (message: MessageData) => void;
  onReplyPress?: (message: MessageData) => void;
  disableHover?: boolean;
  disableMenu?: boolean;
  onMenuSelected: (menu: PopoverItem, message: MessageData) => void;
  onSelectTask: (task: any) => void;
  content: string;
  reacts: Array<ReactReducerData>;
  replyCount: number;
};

const MessageReplyItem = ({
  message,
  onCreateTask,
  onClick,
  disableHover,
  disableMenu = false,
  onReplyPress,
  onMenuSelected,
  onSelectTask,
  content,
  reacts,
  replyCount,
}: MessageReplyItemProps) => {
  const dispatch = useAppDispatch();
  const [isPopoverOpen, setPopoverOpen] = useState(false);
  const { userData, teamUserData, currentTeam } = useAppSelector(
    (state) => state.user
  );
  const history = useHistory();
  const sender = useMemo(
    () => teamUserData.find((u) => u.user_id === message.sender_id),
    [message.sender_id, teamUserData]
  );
  const messageMenu = useMemo<Array<PopoverItem>>(() => {
    const menu: Array<PopoverItem> = [];
    if (userData?.user_id === sender?.user_id) {
      menu.push({
        label: "Edit",
        value: "Edit",
      });
      menu.push({
        label: "Delete",
        value: "Delete",
        type: "destructive",
      });
    }
    return menu;
  }, [sender?.user_id, userData?.user_id]);
  const popupMenuRef = useRef<any>();
  const head = useMemo(
    () => message.isHead || message.isConversationHead,
    [message.isConversationHead, message.isHead]
  );
  const popupEmojiRef = useRef<any>();
  const handleHeadClick = useCallback(() => {
    if (message.task) {
      onSelectTask?.(message.task);
    } else {
      onClick?.(message);
    }
  }, [message, onClick, onSelectTask]);
  const onReactPress = useCallback(
    (name: string) => {
      const isExisted = !!reacts?.find(
        (react: any) => react.reactName === name && react?.isReacted
      );
      if (isExisted) {
        dispatch(removeReact(message.message_id, name, userData.user_id));
      } else {
        dispatch(addReact(message.message_id, name, userData.user_id));
      }
    },
    [dispatch, message.message_id, reacts, userData.user_id]
  );
  const renderSpaceLeft = useCallback(() => {
    if (head) return null;
    if (!disableHover) {
      return (
        <div className="message-reply-item__space-left">
          <span className="message-reply-item__time">
            {dateFormatted(message.createdAt, "HH:mm A")}
          </span>
        </div>
      );
    }
    return <div className="message-reply-item__space-left" />;
  }, [disableHover, head, message.createdAt]);
  const onUserClick = useCallback(() => {
    history.replace(`/home?user_id=${sender?.user_id}`);
  }, [history, sender?.user_id]);
  const handleEmojiClick = useCallback(
    (emoji: EmojiData) => {
      onReactPress(emoji.id || "");
      setPopoverOpen(false);
      popupEmojiRef.current?.hide();
    },
    [onReactPress]
  );
  const handleReplyPress = useCallback(
    () => onReplyPress?.(message),
    [message, onReplyPress]
  );
  const onPinned = useCallback(
    () => onCreateTask(message),
    [message, onCreateTask]
  );
  const handleSelectedMenu = useCallback(
    (menu: PopoverItem) => {
      onMenuSelected(menu, message);
      setPopoverOpen(false);
    },
    [message, onMenuSelected]
  );
  const handlePopoverButtonClose = useCallback(() => setPopoverOpen(false), []);
  const handlePopoverButtonOpen = useCallback(() => setPopoverOpen(true), []);
  if (!sender) return null;
  return (
    <div className="message-reply-item-wrapper">
      {head && <div style={{ height: 15 }} />}
      <div className="message-reply-item-container">
        {head && (
          <div
            className="message-reply-item__avatar-view"
            onClick={onUserClick}
          >
            <AvatarView user={sender} size={35} />
          </div>
        )}
        {renderSpaceLeft()}
        <div className="message-reply-item__content">
          {head && (
            <div className="message-reply-item__user" onClick={onUserClick}>
              <span className="message-reply-item__user-name">
                {normalizeUserName(sender?.user_name)}
              </span>
              <span
                className="message-reply-item__time"
                style={{ marginLeft: 5 }}
              >
                {messageFromNow(message.createdAt)}
              </span>
            </div>
          )}
          {head && (
            <div className="message-root__container">
              <div className="message-root__indicator" />
              <div className="message-root__content">
                <span
                  className="message-reply-item__reply"
                  onClick={handleHeadClick}
                >
                  {message.task && <span className="view-task">View task</span>}
                  {message.task?.comment_count > 0
                    ? `${message.task?.comment_count} Replies`
                    : replyCount > 0 && (
                        <span className="mention">{replyCount} Replies</span>
                      )}
                </span>
              </div>
            </div>
          )}
          <div
            className={`message-reply-item__message ${
              head ? "message-head__message" : ""
            } ${
              message.isSending ? "message-reply-sending" : ""
            } enable-user-select`}
            dangerouslySetInnerHTML={{
              __html: normalizeMessageText(content),
            }}
          />
          <MessagePhotoItem
            photos={message?.message_attachment || []}
            teamId={currentTeam.team_id}
            isHead={head}
          />
          {reacts?.length > 0 && (
            <div
              className={`message-reply-item__reacts ${
                head && "message-reply-item__reacts-head"
              }`}
            >
              <ReactView
                reacts={reacts}
                onClick={onReactPress}
                teamUserData={teamUserData}
                parentId={message.message_id}
              />
            </div>
          )}
        </div>
        {!disableHover && !disableMenu && (
          <div
            className={`message-reply-item__menu ${
              isPopoverOpen ? "popover-open" : ""
            }`}
          >
            <PopoverButton
              ref={popupEmojiRef}
              componentButton={
                <div className="message-reply-item__menu-item">
                  <img alt="" src={images.icReact} />
                </div>
              }
              onClose={handlePopoverButtonClose}
              onOpen={handlePopoverButtonOpen}
              componentPopup={
                <div className="emoji-picker__container">
                  <EmojiPicker onClick={handleEmojiClick} />
                </div>
              }
            />
            <div
              className="message-reply-item__menu-item"
              onClick={handleReplyPress}
            >
              <img alt="" src={images.icReply} />
            </div>
            <div className="message-reply-item__menu-item" onClick={onPinned}>
              <img alt="" src={images.icPinned} />
            </div>
            {messageMenu.length > 0 && (
              <PopoverButton
                ref={popupMenuRef}
                data={messageMenu}
                onSelected={handleSelectedMenu}
                onClose={handlePopoverButtonClose}
                onOpen={handlePopoverButtonOpen}
                componentButton={
                  <div className="message-reply-item__menu-item">
                    <img alt="" src={images.icMoreWhite} />
                  </div>
                }
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(MessageReplyItem);
