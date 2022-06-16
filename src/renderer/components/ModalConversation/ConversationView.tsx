import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
  memo,
} from "react";
import "./index.scss";
import useAppSelector from "renderer/hooks/useAppSelector";
import Dropzone from "react-dropzone";
import { ConversationData } from "renderer/models";
import { debounce } from "lodash";
import { encryptMessage } from "renderer/helpers/ChannelHelper";
import { deleteMessage } from "renderer/actions/MessageActions";
import {
  extractContent,
  getMentionData,
  normalizeMessage,
} from "../../helpers/MessageHelper";
import MessageItem from "../MessageItem";
import MessageHead from "../MessageHead";
import { getUniqueId } from "../../helpers/GenerateUUID";
import api from "../../api";
import SocketUtils from "../../utils/SocketUtils";
import MessageInput from "../MessageInput";
import { PopoverItem } from "../PopoverButton";
import useAppDispatch from "renderer/hooks/useAppDispatch";

type ConversationViewProps = {
  onEsc: () => void;
  conversations: Array<ConversationData>;
};

const ConversationView = ({ onEsc, conversations }: ConversationViewProps) => {
  const dispatch = useAppDispatch();
  const inputRef = useRef<any>();
  const { currentChannel, currentTeam, teamUserData } = useAppSelector(
    (state) => state.user
  );
  const channelPrivateKey = useAppSelector(
    (state) => state.configs.channelPrivateKey
  );
  const reactData = useAppSelector((state) => state.reactReducer.reactData);
  const [isScrolling, setScrolling] = useState(false);
  const [messageEdit, setMessageEdit] = useState<any>(null);
  const timeoutScrollRef = useRef<any>(null);
  const [files, setFiles] = useState<Array<any>>([]);
  const generateId = useRef<string>("");
  const inputFileRef = useRef<any>();
  const [text, setText] = useState("");
  const messageHead = useMemo(
    () => conversations?.[conversations?.length - 1],
    [conversations]
  );
  const senderHead = useMemo(
    () => teamUserData.find((u) => u.user_id === messageHead?.sender_id),
    [messageHead?.sender_id, teamUserData]
  );
  useEffect(() => {
    inputRef.current?.focus();
    const keyDownListener = (e: any) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onEsc();
      }
    };
    window.addEventListener("keydown", keyDownListener);
    return () => window.removeEventListener("keydown", keyDownListener);
  }, [onEsc]);
  const editMessage = useCallback(async () => {
    const loadingAttachment = files.find((att: any) => att.loading);
    if (loadingAttachment != null) return;
    if (extractContent(text).trim() !== "" || files.length > 0) {
      let content = text.trim();
      let plain_text = extractContent(text.trim());
      if (currentChannel.channel_type === "Private") {
        const { key } =
          channelPrivateKey[currentChannel.channel_id][
            channelPrivateKey[currentChannel.channel_id].length - 1
          ];
        content = await encryptMessage(content, key);
        plain_text = await encryptMessage(plain_text, key);
      }
      api.editMessage(messageEdit.message_id, content, plain_text);
      setText("");
      setFiles([]);
      setMessageEdit(null);
      generateId.current = "";
    }
  }, [
    channelPrivateKey,
    currentChannel?.channel_id,
    currentChannel?.channel_type,
    files,
    messageEdit?.message_id,
    text,
  ]);
  const submitMessage = useCallback(async () => {
    const loadingAttachment = files.find((att: any) => att.loading);
    if (loadingAttachment != null) return;
    if (extractContent(text).trim() !== "" || files.length > 0) {
      const msg: any = {
        channel_id: currentChannel.channel_id,
        content: text.trim(),
        plain_text: extractContent(text.trim()),
        parent_id: messageHead.parent_id,
        mentions: getMentionData(text.trim()),
      };
      if (currentChannel.channel_type === "Private") {
        const { key } =
          channelPrivateKey[currentChannel.channel_id][
            channelPrivateKey[currentChannel.channel_id].length - 1
          ];
        const content = await encryptMessage(msg.content, key);
        const plain_text = await encryptMessage(msg.plain_text, key);
        msg.content = content;
        msg.plain_text = plain_text;
      }
      if (files.length > 0) {
        msg.message_id = generateId.current;
      } else {
        msg.message_id = getUniqueId();
      }
      SocketUtils.sendMessage(msg);
      setText("");
      setFiles([]);
      generateId.current = "";
    }
  }, [
    channelPrivateKey,
    currentChannel?.channel_id,
    currentChannel?.channel_type,
    files,
    messageHead?.parent_id,
    text,
  ]);
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.code === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (messageEdit) {
          editMessage();
        } else {
          submitMessage();
        }
      }
    },
    [editMessage, messageEdit, submitMessage]
  );
  const onAddFiles = useCallback(
    (fs: any) => {
      inputRef.current?.focus();
      if (fs == null) return;
      if (generateId.current === "") {
        generateId.current = getUniqueId();
      }
      const data = [...fs];
      data.forEach((f) => {
        const attachment = {
          file: URL.createObjectURL(f),
          randomId: Math.random(),
          loading: true,
          type: f.type,
        };
        setFiles((current) => [...current, attachment]);
        api
          .uploadFile(currentTeam.team_id, generateId.current, f)
          .then((res) => {
            setFiles((current) => {
              let newAttachments = [...current];
              if (res.statusCode === 200) {
                const index = newAttachments.findIndex(
                  (a: any) => a.randomId === attachment.randomId
                );
                newAttachments[index] = {
                  ...newAttachments[index],
                  loading: false,
                  url: res.data?.file_url,
                  id: res.data?.file?.file_id,
                };
              } else {
                newAttachments = newAttachments.filter(
                  (el) => el.randomId !== attachment.randomId
                );
              }

              return newAttachments;
            });
            return null;
          })
          .catch((err) => console.log(err));
      });
    },
    [currentTeam?.team_id]
  );
  const onScrollMessage = useCallback(() => {
    setScrolling((current) => {
      if (!current) return true;
      return current;
    });
    if (timeoutScrollRef.current) {
      clearTimeout(timeoutScrollRef.current);
    }
    timeoutScrollRef.current = setTimeout(() => {
      setScrolling(false);
    }, 500);
  }, []);
  const openFile = useCallback(() => {
    inputFileRef.current?.click();
  }, []);
  const onPaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      const fs = e.clipboardData.files;
      if (fs?.length > 0) {
        onAddFiles(fs);
      }
    },
    [onAddFiles]
  );
  const onMenuMessage = useCallback(
    (menu: PopoverItem, msg: ConversationData) => {
      if (menu.value === "Delete") {
        dispatch(
          deleteMessage(
            msg.message_id,
            msg.parent_id,
            currentChannel.channel_id
          )
        );
      }
      if (menu.value === "Edit") {
        setMessageEdit(msg);
        setText(msg.content);
        setTimeout(() => {
          inputRef.current?.focus?.();
        }, 0);
      }
    },
    [currentChannel?.channel_id, dispatch]
  );
  const handleRemoveFile = useCallback((file: any) => {
    setFiles((current) => current.filter((f) => f.id !== file.id));
  }, []);
  const onChangeFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onAddFiles(e.target.files);
      e.target.value = "";
    },
    [onAddFiles]
  );
  const renderMessage = useCallback(
    (msg: ConversationData) => (
      <MessageItem
        key={msg.message_id}
        message={msg}
        onMenuSelected={onMenuMessage}
        content={msg.content}
        reacts={reactData?.[msg.message_id]}
      />
    ),
    [onMenuMessage, reactData]
  );
  return (
    <Dropzone onDrop={onAddFiles}>
      {({ getRootProps, getInputProps }) => (
        <div className="conversation-view__container" {...getRootProps()}>
          <div className="conversation-view__body">
            <MessageHead
              message={messageHead}
              sender={senderHead}
              teamId={currentTeam.team_id}
            />
            <div
              className="conversation-body__messages"
              onScroll={onScrollMessage}
            >
              <div style={{ marginTop: 15 }} />
              <div
                className="conversation-message-list"
                style={{ pointerEvents: isScrolling ? "none" : "initial" }}
              >
                {normalizeMessage(conversations.slice(0, -1)).map(
                  renderMessage
                )}
              </div>
            </div>
          </div>
          <MessageInput
            placeholder="Enter your message"
            onCircleClick={openFile}
            onKeyDown={debounce(onKeyDown, 100)}
            text={text}
            setText={setText}
            attachments={files}
            onPaste={onPaste}
            onRemoveFile={handleRemoveFile}
            inputRef={inputRef}
            messageEdit={messageEdit}
          />
          <input
            {...getInputProps()}
            ref={inputFileRef}
            accept="image/*,video/*"
            onChange={onChangeFile}
          />
        </div>
      )}
    </Dropzone>
  );
};

export default memo(ConversationView);
