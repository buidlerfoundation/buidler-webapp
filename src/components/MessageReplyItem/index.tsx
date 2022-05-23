import React, { useState, useRef } from "react";
import { connect } from "react-redux";
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
import { useNavigate } from "react-router-dom";

type MessageReplyItemProps = {
  message: any;
  teamUserData?: Array<any>;
  teamId?: string;
  onCreateTask: () => void;
  onClick?: () => void;
  onReplyPress?: () => void;
  disableHover?: boolean;
  disableMenu?: boolean;
  zIndex?: number;
  reactReducer?: any;
  userData: any;
  onAddReact?: (id: string, name: string, userId: string) => void;
  onRemoveReact?: (id: string, name: string, userId: string) => void;
  onMenuSelected: (menu: PopoverItem) => void;
  onSelectTask: (task: any) => void;
};

const MessageReplyItem = ({
  message,
  teamUserData = [],
  teamId,
  onCreateTask,
  onClick,
  disableHover,
  disableMenu = false,
  zIndex,
  onReplyPress,
  reactReducer,
  userData,
  onAddReact,
  onRemoveReact,
  onMenuSelected,
  onSelectTask,
}: MessageReplyItemProps) => {
  const navigate = useNavigate();
  const messageMenu: Array<PopoverItem> = [];
  const popupMenuRef = useRef<any>();
  const { isConversationHead, isHead, task, isSending } = message;
  const head = isConversationHead || isHead;
  const popupEmojiRef = useRef<any>();
  const [isHover, setHover] = useState(false);
  const sender = teamUserData.find((u) => u.user_id === message.sender_id);
  if (!sender) return null;
  if (userData?.user_id === sender.user_id) {
    messageMenu.push({
      label: "Edit",
      value: "Edit",
    });
    messageMenu.push({
      label: "Delete",
      value: "Delete",
      type: "destructive",
    });
  }
  if (!sender) return null;
  const msgStyle = zIndex ? { zIndex } : {};
  const reacts = reactReducer?.reactData?.[message.message_id] || [];
  const onReactPress = (name: string) => {
    const isExisted = !!reacts.find(
      (react: any) => react.reactName === name && react?.isReacted
    );
    if (isExisted) {
      onRemoveReact?.(message.message_id, name, userData.user_id);
    } else {
      onAddReact?.(message.message_id, name, userData.user_id);
    }
  };
  const renderSpaceLeft = () => {
    if (head) return null;
    if (isHover && !disableHover) {
      return (
        <div className="message-reply-item__space-left">
          <span className="message-reply-item__time">
            {dateFormatted(message.createdAt, "HH:mm A")}
          </span>
        </div>
      );
    }
    return <div className="message-reply-item__space-left" />;
  };
  const onUserClick = () => {
    navigate(`/home?user_id=${sender.user_id}`, { replace: true });
  };
  return (
    <div className="message-reply-item-wrapper">
      {head && <div style={{ height: 15 }} />}
      <div
        className="message-reply-item-container"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
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
                  onClick={() => {
                    if (task) {
                      onSelectTask?.(task);
                    } else {
                      onClick?.();
                    }
                  }}
                >
                  {task && <span className="view-task">View task</span>}
                  {task?.comment_count > 0
                    ? `${task?.comment_count} Replies`
                    : message?.conversation_data?.length - 1 > 0 && (
                        <span className="mention">
                          {message?.conversation_data?.length - 1} Replies
                        </span>
                      )}
                </span>
              </div>
            </div>
          )}
          <div
            className={`message-reply-item__message ${
              head ? "message-head__message" : ""
            } ${isSending ? "message-reply-sending" : ""} enable-user-select`}
            dangerouslySetInnerHTML={{
              __html: normalizeMessageText(message.content),
            }}
          />
          <MessagePhotoItem
            photos={message?.message_attachment || []}
            teamId={teamId}
            isHead={head}
          />
          {reacts.length > 0 && (
            <div
              className={`message-reply-item__reacts ${
                head && "message-reply-item__reacts-head"
              }`}
            >
              <ReactView
                reacts={reacts.map((r: any) => ({
                  name: r.reactName,
                  count: r.count,
                  isReacted: r.isReacted,
                }))}
                onClick={onReactPress}
                teamUserData={teamUserData}
                parentId={message.message_id}
              />
            </div>
          )}
        </div>
        {isHover && !disableHover && !disableMenu && (
          <div className="message-reply-item__menu" style={msgStyle}>
            <PopoverButton
              ref={popupEmojiRef}
              onClose={() => setHover(false)}
              componentButton={
                <div className="message-reply-item__menu-item">
                  <img alt="" src={images.icReact} />
                </div>
              }
              componentPopup={
                <div className="emoji-picker__container">
                  <EmojiPicker
                    onClick={(emoji) => {
                      onReactPress(emoji.id);
                      popupEmojiRef.current?.hide();
                    }}
                  />
                </div>
              }
            />
            <div
              className="message-reply-item__menu-item"
              onClick={() => onReplyPress?.()}
            >
              <img alt="" src={images.icReply} />
            </div>
            <div
              className="message-reply-item__menu-item"
              onClick={onCreateTask}
            >
              <img alt="" src={images.icPinned} />
            </div>
            {messageMenu.length > 0 && (
              <PopoverButton
                ref={popupMenuRef}
                data={messageMenu}
                onSelected={(menu) => {
                  setHover(false);
                  onMenuSelected(menu);
                }}
                onClose={() => setHover(false)}
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

const mapStateToProps = (state: any) => {
  return {
    reactReducer: state.reactReducer,
    userData: state.user.userData,
    teamUserData: state.user.teamUserData,
    teamId: state.user.currentTeam?.team_id,
  };
};

export default connect(mapStateToProps)(MessageReplyItem);
