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
import MessageReply from "../MessageReply";
import PopoverButton, { PopoverItem } from "../PopoverButton";
import ReactView from "../ReactView";
import "./index.scss";
import { useNavigate } from "react-router-dom";

type MessageItemProps = {
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
  onMenuSelected?: (menu: PopoverItem) => void;
  onSelectTask?: (task: any) => void;
};

const MessageItem = ({
  reactReducer,
  message,
  teamUserData = [],
  teamId,
  onCreateTask,
  onClick,
  disableHover,
  disableMenu = false,
  zIndex,
  onReplyPress,
  userData,
  onAddReact,
  onRemoveReact,
  onMenuSelected,
  onSelectTask,
}: MessageItemProps) => {
  const navigate = useNavigate();
  const messageMenu: Array<PopoverItem> = [];
  const popupMenuRef = useRef<any>();
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
  const { isHead, isSending } = message;
  const renderSpaceLeft = () => {
    if (isHead) return null;
    if (isHover && !disableHover) {
      return (
        <div className="message-item__space-left">
          <span className="message-item__time">
            {dateFormatted(message.createdAt, "HH:mm A")}
          </span>
        </div>
      );
    }
    return <div className="message-item__space-left" />;
  };
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
  const msgStyle = zIndex ? { zIndex } : {};
  const onUserClick = () => {
    navigate(`/home?user_id=${sender.user_id}`, { replace: true });
  };
  return (
    <div className="message-item-wrapper">
      {isHead && <div style={{ height: 15 }} />}
      <div
        className="message-item-container"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        {isHead && (
          <div className="message-item__avatar-view" onClick={onUserClick}>
            <AvatarView user={sender} size={35} />
          </div>
        )}
        {renderSpaceLeft()}
        <div className="message-item__content">
          {isHead && (
            <div className="message-item__user" onClick={onUserClick}>
              <span className="message-item__user-name">
                {normalizeUserName(sender?.user_name)}
              </span>
              <span className="message-item__time" style={{ marginLeft: 5 }}>
                {messageFromNow(message.createdAt)}
              </span>
            </div>
          )}
          <div>
            {!!message.task && (
              <div
                className={`message-task ${
                  isHead ? "message-head__message" : ""
                }`}
                onClick={() => onSelectTask?.(message.task)}
              >
                <div className="message-task__indicator" />
                <span className="view-task">View task</span>
              </div>
            )}
            <div
              className={`message-item__message ${
                isHead ? "message-head__message" : ""
              } ${isSending ? "message-item-sending" : ""}`}
              dangerouslySetInnerHTML={{
                __html: normalizeMessageText(message.content),
              }}
            />
          </div>

          <MessagePhotoItem
            photos={message?.message_attachment || []}
            teamId={teamId}
            isHead={isHead}
          />
          {message?.conversation_data?.length > 0 && (
            <>
              <span
                className={`message-item__reply ${
                  isHead ? "message-item__reply-head" : ""
                }`}
                onClick={() => onClick?.()}
              >
                {message?.conversation_data?.length} Replies
              </span>
              <MessageReply
                message={message?.conversation_data[0]}
                teamUserData={teamUserData}
              />
            </>
          )}
          {reacts.length > 0 && (
            <div
              className={`message-item__reacts ${
                isHead && "message-item__reacts-head"
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
          <div className="message-item__menu" style={msgStyle}>
            <PopoverButton
              ref={popupEmojiRef}
              onClose={() => setHover(false)}
              componentButton={
                <div className="message-item__menu-item">
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
              className="message-item__menu-item"
              onClick={() => onReplyPress?.()}
            >
              <img alt="" src={images.icReply} />
            </div>
            <div className="message-item__menu-item" onClick={onCreateTask}>
              <img alt="" src={images.icPinned} />
            </div>
            {messageMenu.length > 0 && (
              <PopoverButton
                ref={popupMenuRef}
                data={messageMenu}
                onSelected={(menu) => {
                  setHover(false);
                  onMenuSelected?.(menu);
                }}
                onClose={() => setHover(false)}
                componentButton={
                  <div className="message-item__menu-item">
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

export default connect(mapStateToProps)(MessageItem);
