import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  memo,
} from "react";
import "./index.scss";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import Popper from "@material-ui/core/Popper";
import useAppSelector from "renderer/hooks/useAppSelector";
import { UserData } from "renderer/models";
import images from "../../common/images";
import { getIconByStatus } from "../../helpers/TaskHelper";
import AvatarView from "../AvatarView";
import GlobalVariable from "../../services/GlobalVariable";
import {
  extractContent,
  getLastIndexOfMention,
  normalizeUserName,
  removeTagHTML,
} from "../../helpers/MessageHelper";
import AttachmentItem from "../AttachmentItem";

type MentionItemProps = {
  item: UserData;
  index: number;
  selectedMentionIndex: number;
  onEnter: (index: number) => void;
  enterMention: () => void;
};

const MentionItem = ({
  item,
  index,
  selectedMentionIndex,
  onEnter,
  enterMention,
}: MentionItemProps) => {
  const onMouseEnter = useCallback(() => onEnter(index), [index, onEnter]);
  return (
    <div
      className={`mention-item ${index === selectedMentionIndex && "active"}`}
      onMouseEnter={onMouseEnter}
      onClick={enterMention}
    >
      <AvatarView user={item} size={25} />
      <span className="mention-name">{normalizeUserName(item.user_name)}</span>
    </div>
  );
};

type MessageInputProps = {
  placeholder: string;
  inputRef?: React.RefObject<HTMLElement>;
  onCircleClick: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  onPaste: (e: React.ClipboardEvent<HTMLDivElement>) => void;
  attachments?: Array<any>;
  onRemoveFile: (file: any) => void;
  messageReply?: any;
  onRemoveReply?: () => void;
  replyTask?: any;
  messageEdit?: any;
};

const MessageInput = ({
  placeholder,
  inputRef,
  onCircleClick,
  onKeyDown,
  text,
  setText,
  onPaste,
  attachments = [],
  onRemoveFile,
  messageReply,
  onRemoveReply,
  replyTask,
  messageEdit,
}: MessageInputProps) => {
  const { teamUserData, currentTeam, currentChannel } = useAppSelector(
    (state) => state.user
  );
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  const [mentionPos, setMentionPos] = useState({ start: -1, end: -1 });
  const [mentionStr, setMentionStr] = useState<string | null>(null);
  const [anchorPopup, setPopup] = useState<any>(null);
  const sender = useMemo(
    () => teamUserData?.find?.((u) => u?.user_id === messageReply?.sender_id),
    [messageReply?.sender_id, teamUserData]
  );
  const containerRef = useRef<any>();
  const renderReply = useCallback(() => {
    if (messageEdit) {
      return (
        <div className="message-input__reply-container">
          <div className="message-reply__indicator" />
          <div style={{ width: 16 }} />
          <img src={images.icEdit} alt="" className="reply-icon" />
          <div style={{ width: 10 }} />
          <span className="message-reply__message">Edit message</span>
          <div style={{ width: 10 }} />
          <div
            className="normal-button remove-icon"
            onClick={onRemoveReply}
            style={{ padding: 5, borderRadius: 5 }}
          >
            <img alt="" src={images.icCircleClose} />
          </div>
          <div style={{ width: 10 }} />
        </div>
      );
    }
    if (replyTask) {
      return (
        <div className="message-input__reply-container">
          <div className="message-reply__indicator" />
          <div style={{ width: 16 }} />
          <img
            alt=""
            src={getIconByStatus(replyTask.status)}
            className="reply-icon"
          />
          <div style={{ width: 10 }} />
          <span className="message-reply__message">
            {extractContent(replyTask.title)}
          </span>
          <div style={{ width: 10 }} />
          <div
            className="normal-button remove-icon"
            onClick={onRemoveReply}
            style={{ padding: 5, borderRadius: 5 }}
          >
            <img alt="" src={images.icCircleClose} />
          </div>
          <div style={{ width: 10 }} />
        </div>
      );
    }
    if (messageReply) {
      return (
        <div className="message-input__reply-container">
          <div className="message-reply__indicator" />
          <div style={{ width: 16 }} />
          <div className="reply-icon">
            <AvatarView user={sender} />
          </div>
          <div style={{ width: 10 }} />
          <span className="message-reply__message">
            {messageReply.plain_text || "Attachment"}
          </span>
          <div style={{ width: 10 }} />
          <div
            className="normal-button remove-icon"
            onClick={onRemoveReply}
            style={{ padding: 5, borderRadius: 5 }}
          >
            <img alt="" src={images.icCircleClose} />
          </div>
          <div style={{ width: 10 }} />
        </div>
      );
    }
    return null;
  }, [messageEdit, messageReply, onRemoveReply, replyTask, sender]);
  const getCaretIndex = useCallback((element?: any) => {
    let position = 0;
    if (!element) return position;
    const isSupported = typeof window.getSelection !== "undefined";
    if (isSupported) {
      const selection: any = window.getSelection();
      if (selection.rangeCount !== 0) {
        const range: any = window?.getSelection?.()?.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        position = preCaretRange.toString().length;
      }
    }
    return position;
  }, []);
  const users = useMemo<Array<any>>(() => {
    if (!currentChannel) return [];
    const { channel_type, channel_member } = currentChannel;
    if (channel_type === "Public") {
      return teamUserData;
    }
    if (!channel_member) return [];
    return channel_member
      .filter((id: string) => !!teamUserData.find((el) => el?.user_id === id))
      .map((id: any) => teamUserData.find((el) => el?.user_id === id));
  }, [currentChannel, teamUserData]);
  const dataMention = useMemo(
    () =>
      users.filter((el: UserData) =>
        el?.user_name
          ?.toLowerCase?.()
          ?.includes?.(mentionStr?.toLowerCase?.() || "")
      ),
    [mentionStr, users]
  );
  const onCloseMention = useCallback(() => {
    setPopup(null);
    inputRef?.current?.focus();
    setMentionPos({ start: -1, end: -1 });
  }, [inputRef]);
  const findMentionIndexHtml = useCallback(() => {
    const idx = getCaretIndex(inputRef?.current);
    const str = extractContent(text).replaceAll("\n", "");
    const regex = new RegExp(`@${mentionStr}`, "g");
    let result1;
    let result2;
    const indices1: Array<any> = [];
    const indices2: Array<any> = [];
    while ((result1 = regex.exec(str.substring(0, idx)))) {
      indices1.push(result1.index);
    }
    while ((result2 = regex.exec(text))) {
      indices2.push(result2.index);
    }
    return indices2[indices1.length - 1];
  }, [getCaretIndex, inputRef, mentionStr, text]);
  const enterMention = useCallback(() => {
    const el = dataMention[selectedMentionIndex];
    const idx = findMentionIndexHtml();
    const newText = `${text.substring(
      0,
      idx
    )} <a href='$mention_location?user_id=${
      el.user_id
    }' class='mention-string'>@${el.user_name}</a>&nbsp;${text.substring(
      idx + 1 + (mentionStr?.length || 0)
    )}`;
    setText(newText);
    setTimeout(onCloseMention, 0);
  }, [
    dataMention,
    findMentionIndexHtml,
    selectedMentionIndex,
    mentionStr?.length,
    setText,
    text,
    onCloseMention,
  ]);
  useEffect(() => {
    const keyDownListener = (e: any) => {
      if (e.key === "Escape") {
        if (anchorPopup) {
          setPopup(null);
        } else {
          inputRef?.current?.blur?.();
        }
      } else if (e.code === "ArrowDown" && !!anchorPopup) {
        e.preventDefault();
        setSelectedMentionIndex((current) =>
          current === dataMention.length - 1 ? 0 : current + 1
        );
      } else if (e.code === "ArrowUp" && !!anchorPopup) {
        e.preventDefault();
        setSelectedMentionIndex((current) =>
          current === 0 ? dataMention.length - 1 : current - 1
        );
      }
      if (e.code === "Enter" && !!anchorPopup) {
        e.preventDefault();
        enterMention();
      } else {
        onKeyDown(e);
      }
    };
    document.onclick = () => {
      if (anchorPopup) {
        setPopup(null);
      }
    };
    window.addEventListener("keydown", keyDownListener);
    return () => {
      window.removeEventListener("keydown", keyDownListener);
    };
  }, [anchorPopup, onKeyDown, enterMention, text, dataMention, inputRef]);
  useEffect(() => {
    const str = extractContent(text).replaceAll("\n", "");
    if (mentionPos.start >= 0 && mentionPos.start < str.length) {
      const res = str.substring(mentionPos.start + 1, mentionPos.end);
      setMentionStr(res);
    } else {
      setMentionStr(null);
    }
  }, [mentionPos, text]);
  useEffect(() => {
    if (
      mentionStr !== null &&
      users.filter((el: any) =>
        el.user_name.toLowerCase().includes(mentionStr.toLowerCase())
      ).length > 0 &&
      text.length > 0
    ) {
      setPopup(containerRef.current);
    } else {
      setPopup(null);
    }
  }, [mentionStr, inputRef, mentionPos.start, text, users]);
  const checkTriggerMention = useCallback(
    (value: string) => {
      const idx = getCaretIndex(inputRef?.current);
      const str = extractContent(value || text).replaceAll("\n", "");
      const start = str.substring(0, idx).lastIndexOf("@");
      setMentionPos({ start, end: idx });
      setSelectedMentionIndex(0);
    },
    [getCaretIndex, inputRef, text]
  );
  const handleMentionEnter = useCallback(
    (index: number) => setSelectedMentionIndex(index),
    []
  );
  const handleFocus = useCallback(() => {
    GlobalVariable.isInputFocus = true;
  }, []);
  const handleBlur = useCallback(() => {
    GlobalVariable.isInputFocus = false;
  }, []);
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" && !e.metaKey && !e.shiftKey) e.preventDefault();
    },
    []
  );
  const handleChangeText = useCallback(
    (e: ContentEditableEvent) => {
      const valueTrimmed = e.target.value.trim();
      if (
        extractContent(text) === extractContent(e.target.value) &&
        valueTrimmed[0] === "<" &&
        valueTrimmed[valueTrimmed.length - 1] === ">" &&
        valueTrimmed.substring(valueTrimmed.length - 4) !== "<br>"
      ) {
        setText("");
      } else if (valueTrimmed.substring(valueTrimmed.length - 4) === "</a>") {
        const lastIdx = getLastIndexOfMention(valueTrimmed);
        if (lastIdx === 0) {
          setText("");
        } else if (lastIdx > 0) {
          setText(valueTrimmed.substring(0, lastIdx));
        } else {
          setText(valueTrimmed);
        }
      } else {
        setText(removeTagHTML(e.target.value));
        checkTriggerMention(e.target.value);
      }
    },
    [checkTriggerMention, setText, text]
  );
  const renderAttachment = useCallback(
    (att: any, index: number) => {
      return (
        <AttachmentItem
          att={att}
          key={att.randomId || att.id || index}
          onRemove={onRemoveFile}
          teamId={currentTeam.team_id}
        />
      );
    },
    [currentTeam?.team_id, onRemoveFile]
  );
  const renderMentionItem = useCallback(
    (el: UserData, index: number) => (
      <MentionItem
        key={el.user_id}
        item={el}
        index={index}
        selectedMentionIndex={selectedMentionIndex}
        onEnter={handleMentionEnter}
        enterMention={enterMention}
      />
    ),
    [enterMention, handleMentionEnter, selectedMentionIndex]
  );

  return (
    <div className="message-input__container">
      {renderReply()}
      <div className="message-input__input-container" ref={containerRef}>
        <div className="normal-icon normal-button ml5" onClick={onCircleClick}>
          <img alt="" src={images.icPlusCircle} />
        </div>
        {text.length === 0 && (
          <div className="placeholder-input text-ellipsis">{placeholder}</div>
        )}
        <ContentEditable
          id="message-input"
          innerRef={inputRef}
          html={text}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          onChange={handleChangeText}
          placeholder={placeholder}
          className="message-input__input hide-scroll-bar"
          onPaste={onPaste}
        />
      </div>
      {attachments.length > 0 && (
        <div className="attachment-container">
          {attachments.map(renderAttachment)}
        </div>
      )}
      <Popper
        id="popup-mention"
        open={!!anchorPopup}
        anchorEl={anchorPopup}
        style={{ zIndex: 1000 }}
      >
        <div className="popup-mention__container">
          {dataMention.map(renderMentionItem)}
        </div>
      </Popper>
    </div>
  );
};

export default memo(MessageInput);
