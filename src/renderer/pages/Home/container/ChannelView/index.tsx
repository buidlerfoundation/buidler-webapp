import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useMemo,
  memo,
} from "react";
import Dropzone from "react-dropzone";
import {
  AttachmentData,
  Channel,
  Community,
  ConversationData,
  MessageData,
  MessageGroup,
} from "renderer/models";
import { PopoverItem } from "renderer/shared/PopoverButton";
import { debounce } from "lodash";
import { CircularProgress } from "@material-ui/core";
import { createTask } from "renderer/actions/TaskActions";
import {
  deleteMessage,
  onRemoveAttachment,
  setScrollData,
} from "renderer/actions/MessageActions";
import {
  createMemberChannelData,
  encryptMessage,
} from "renderer/helpers/ChannelHelper";
import toast from "react-hot-toast";
import useAppSelector from "renderer/hooks/useAppSelector";
import { titleMessageFromNow } from "../../../../utils/DateUtils";
import images from "../../../../common/images";
import MessageItem from "../../../../shared/MessageItem";
import {
  extractContent,
  getMentionData,
  normalizeMessages,
  normalizeUserName,
} from "../../../../helpers/MessageHelper";
import SocketUtils from "../../../../utils/SocketUtils";
import "./index.scss";
import { getUniqueId } from "../../../../helpers/GenerateUUID";
import api from "../../../../api";
import MessageInput from "../../../../shared/MessageInput";
import MessageReplyItem from "../../../../shared/MessageReplyItem";
import ChannelHeader from "./ChannelHeader";
import DirectDescription from "./DirectDescription";
import useAppDispatch from "renderer/hooks/useAppDispatch";
import { useLocation } from "react-router-dom";

type ChannelViewProps = {
  currentChannel: Channel;
  messages: Array<MessageData>;
  inputRef: any;
  currentTeam: Community;
  openConversation: (message: MessageData) => void;
  onMoreMessage: (lastCreatedAt: string) => void;
  loadMoreMessage: boolean;
  messageCanMore: boolean;
  scrollData?: any;
  replyTask?: any;
  setReplyTask: (task?: any) => void;
  openTaskView: boolean;
  isOpenConversation: boolean;
  onSelectTask: (task: any) => void;
  teamUserData: Array<any>;
};

const ChannelView = forwardRef(
  (
    {
      currentChannel,
      messages,
      inputRef,
      currentTeam,
      openConversation,
      onMoreMessage,
      loadMoreMessage,
      messageCanMore,
      scrollData,
      replyTask,
      setReplyTask,
      openTaskView,
      onSelectTask,
      teamUserData,
      isOpenConversation,
    }: ChannelViewProps,
    ref
  ) => {
    const location = useLocation();
    const dispatch = useAppDispatch();
    const reactData = useAppSelector((state) => state.reactReducer.reactData);
    const messagesGroup = useMemo<Array<MessageGroup>>(() => {
      return normalizeMessages(messages);
    }, [messages]);
    const userData = useAppSelector((state) => state.user.userData);
    const channelPrivateKey = useAppSelector(
      (state) => state.configs.channelPrivateKey
    );
    const [messageReply, setMessageReply] = useState<
      MessageData | ConversationData | null
    >(null);
    const [messageEdit, setMessageEdit] = useState<
      MessageData | ConversationData | null
    >(null);
    const [isScrolling, setScrolling] = useState(false);
    const [files, setFiles] = useState<Array<any>>([]);
    const timeoutScrollRef = useRef<any>(null);
    const msgListRef = useRef<any>();
    const headerRef = useRef<any>();
    const generateId = useRef<string>("");
    const [text, setText] = useState("");
    const inputFileRef = useRef<any>();
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
            type: f.type || "application",
            name: f.name,
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
                    id: res.data?.file.file_id,
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
      [currentTeam?.team_id, inputRef]
    );
    const onChangeFiles = useCallback(
      (e: any) => {
        onAddFiles(e.target.files);
        e.target.value = null;
      },
      [onAddFiles]
    );
    const onMessageScroll = useCallback(
      (e: any) => {
        setScrolling((current) => {
          if (!current) return true;
          return current;
        });
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        const showScrollDown = scrollTop < -80;
        if (showScrollDown !== scrollData?.showScrollDown) {
          dispatch(
            setScrollData(currentChannel?.channel_id, {
              showScrollDown,
              unreadCount: showScrollDown ? scrollData?.unreadCount : 0,
            })
          );
        }
        const compare = Math.round(scrollTop + scrollHeight);
        if (
          (compare === clientHeight + 1 || compare === clientHeight) &&
          messageCanMore
        ) {
          onMoreMessage(messages?.[messages?.length - 1].createdAt);
        }
        if (timeoutScrollRef.current) {
          clearTimeout(timeoutScrollRef.current);
        }
        timeoutScrollRef.current = setTimeout(() => {
          setScrolling(false);
        }, 500);
      },
      [
        currentChannel?.channel_id,
        messageCanMore,
        messages,
        onMoreMessage,
        scrollData?.showScrollDown,
        scrollData?.unreadCount,
        dispatch,
      ]
    );
    const onCreateTaskFromMessage = useCallback(
      (msg: MessageData | ConversationData) => {
        const body: any = {
          title: msg?.content,
          status: "pinned",
          channel_ids:
            currentChannel.channel_type === "Direct"
              ? currentChannel?.user?.user_channels
              : [currentChannel?.channel_id],
          file_ids: msg?.message_attachment?.map?.(
            (a: AttachmentData) => a.file_id
          ),
          task_id: msg.message_id,
          team_id: currentTeam.team_id,
          assignee_id:
            msg.message_tag?.[0]?.mention_id || currentChannel?.user?.user_id,
        };
        dispatch(createTask(currentChannel?.channel_id, body));
      },
      [
        dispatch,
        currentChannel?.channel_id,
        currentChannel.channel_type,
        currentChannel?.user?.user_channels,
        currentChannel?.user?.user_id,
        currentTeam.team_id,
      ]
    );
    const onReplyPress = useCallback(
      (msg: MessageData | ConversationData) => {
        setMessageReply(msg);
        setReplyTask(null);
        setMessageEdit(null);
        inputRef.current?.focus?.();
      },
      [inputRef, setReplyTask]
    );
    const onMenuMessage = useCallback(
      (menu: PopoverItem, msg: MessageData | ConversationData) => {
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
          setMessageReply(null);
          setReplyTask(null);
          setMessageEdit(msg);
          setFiles(
            msg.message_attachment.map((el: any) => ({
              ...el,
              type: el.mimetype,
              id: el.file_id,
              name: el.original_name,
            }))
          );
          setText(msg.content);
          const el = inputRef.current;
          setTimeout(() => {
            el.focus();
            const selection: any = window.getSelection();
            const range = document.createRange();
            selection.removeAllRanges();
            range.selectNodeContents(el);
            range.collapse(false);
            selection.addRange(range);
          }, 0);
        }
      },
      [currentChannel?.channel_id, dispatch, inputRef, setReplyTask]
    );
    const scrollDown = useCallback(() => {
      msgListRef.current?.scrollTo?.(0, 0);
    }, []);
    const onRemoveReply = useCallback(() => {
      if (
        messageReply ||
        replyTask ||
        messageEdit ||
        currentChannel.channel_id
      ) {
        setText("");
        inputRef.current?.blur();
      }
      setMessageReply(null);
      setReplyTask(null);
      setMessageEdit(null);
      setFiles([]);
      generateId.current = "";
    }, [
      messageReply,
      replyTask,
      messageEdit,
      inputRef,
      setMessageReply,
      setReplyTask,
      setMessageEdit,
      currentChannel.channel_id,
    ]);
    const openFile = useCallback(() => {
      inputFileRef.current?.click();
    }, []);
    const _onPaste = useCallback(
      (e: any) => {
        const fs = e.clipboardData.files;
        if (fs?.length > 0) {
          onAddFiles(fs);
        }
      },
      [onAddFiles]
    );
    const onCircleClick = useCallback(() => {
      openFile();
    }, [openFile]);
    useEffect(() => {
      const keyDownListener = (e: any) => {
        if (e.key === "Escape") {
          onRemoveReply();
        }
      };
      window.addEventListener("keydown", keyDownListener);
      return () => {
        window.removeEventListener("keydown", keyDownListener);
      };
    }, [onRemoveReply]);
    useEffect(() => {
      if (replyTask) {
        setMessageReply(null);
        setMessageEdit(null);
        inputRef.current?.focus?.();
      }
    }, [replyTask, inputRef]);
    useImperativeHandle(ref, () => {
      return {
        hideReply: onRemoveReply,
        showSetting: (action: string) => {
          headerRef.current.showSetting(action);
        },
        // hideSetting: headerRef.current.hideSetting,
      };
    });
    const editMessage = useCallback(async () => {
      const loadingAttachment = files.find((att: any) => att.loading);
      if (loadingAttachment != null || !messageEdit?.message_id) return;
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
        api.editMessage(
          messageEdit.message_id,
          content,
          plain_text,
          files.map((el) => el.id)
        );
        setText("");
        setFiles([]);
        setMessageEdit(null);
        generateId.current = "";
        scrollDown();
      }
    }, [
      files,
      text,
      currentChannel?.channel_type,
      currentChannel?.channel_id,
      messageEdit?.message_id,
      scrollDown,
      channelPrivateKey,
    ]);
    const submitMessage = useCallback(async () => {
      const loadingAttachment = files.find((att: any) => att.loading);
      if (loadingAttachment != null) return;
      if (extractContent(text).trim() !== "" || files.length > 0) {
        const message: any = {
          content: text.trim(),
          plain_text: extractContent(text),
          mentions: getMentionData(text.trim()),
          text,
        };
        if (
          currentChannel.channel_type === "Private" ||
          (currentChannel.channel_type === "Direct" &&
            currentChannel.channel_id)
        ) {
          const { key } =
            channelPrivateKey?.[currentChannel.channel_id]?.[
              channelPrivateKey?.[currentChannel.channel_id]?.length - 1
            ] || {};
          if (!key) {
            setText("");
            setFiles([]);
            generateId.current = "";
            toast.error("Missing channel private key");
            return;
          }
          const content = await encryptMessage(message.content, key);
          const plain_text = await encryptMessage(message.plain_text, key);
          message.content = content;
          message.plain_text = plain_text;
        }
        if (currentChannel.channel_id) {
          message.channel_id = currentChannel.channel_id;
        } else if (currentChannel.user) {
          message.other_user_id = currentChannel?.user?.user_id;
          message.team_id = currentTeam.team_id;
          const members = [{ user_id: message.other_user_id }];
          if (message.other_user_id !== userData.user_id) {
            members.push({ user_id: userData.user_id });
          }
          const { res, privateKey } = await createMemberChannelData(members);
          const content = await encryptMessage(message.content, privateKey);
          const plain_text = await encryptMessage(
            message.plain_text,
            privateKey
          );
          message.content = content;
          message.plain_text = plain_text;
          message.channel_member_data = res;
        }
        if (messageReply) {
          message.parent_id = messageReply.parent_id || messageReply.message_id;
        } else if (replyTask) {
          message.parent_id = replyTask.task_id;
        }
        if (files.length > 0) {
          message.message_id = generateId.current;
        } else {
          message.message_id = getUniqueId();
        }
        SocketUtils.sendMessage(message);
        setText("");
        setFiles([]);
        generateId.current = "";
        scrollDown();
      }
    }, [
      channelPrivateKey,
      currentChannel?.channel_id,
      currentChannel?.channel_type,
      currentChannel?.user,
      currentTeam?.team_id,
      files,
      messageReply,
      replyTask,
      text,
      userData?.user_id,
      scrollDown,
    ]);
    const handleRemoveFile = useCallback(
      (file) => {
        if (messageEdit) {
          dispatch(
            onRemoveAttachment(
              currentChannel.channel_id,
              messageEdit.message_id,
              file.id
            )
          );
        }
        setFiles((current) => current.filter((f) => f.id !== file.id));
      },
      [currentChannel?.channel_id, messageEdit, dispatch]
    );
    const onKeyDown = useCallback(
      (e: any) => {
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

    const renderMessage = useCallback(
      (msg: MessageData) => {
        if (msg.conversation_data?.length > 0) {
          return (
            <MessageReplyItem
              key={msg.message_id}
              message={msg}
              onCreateTask={onCreateTaskFromMessage}
              onClick={openConversation}
              onReplyPress={onReplyPress}
              onMenuSelected={onMenuMessage}
              onSelectTask={onSelectTask}
              content={msg.content}
              reacts={reactData?.[msg.message_id]}
              replyCount={msg.conversation_data?.length - 1}
              task={msg.task}
            />
          );
        }
        return (
          <MessageItem
            key={msg.message_id}
            message={msg}
            onCreateTask={onCreateTaskFromMessage}
            onReplyPress={onReplyPress}
            onMenuSelected={onMenuMessage}
            onSelectTask={onSelectTask}
            content={msg.content}
            reacts={reactData?.[msg.message_id]}
            task={msg.task}
          />
        );
      },
      [
        onCreateTaskFromMessage,
        onMenuMessage,
        onReplyPress,
        onSelectTask,
        openConversation,
        reactData,
      ]
    );

    const renderMessageGroup = useCallback(
      (el: MessageGroup) => {
        return (
          <div className="column-reverse" key={el.date}>
            <div className="column-reverse">
              {el.messages.map(renderMessage)}
            </div>
            <div className="date-title">
              <div className="separate-line" />
              <span>{titleMessageFromNow(el.date)}</span>
              <div className="separate-line" />
              <div />
            </div>
          </div>
        );
      },
      [renderMessage]
    );

    if (!currentChannel?.channel_name && !currentChannel?.user)
      return <div className="channel-view-container" />;
    return (
      <Dropzone onDrop={onAddFiles}>
        {({ getRootProps, getInputProps }) => (
          <div className="channel-view-container" {...getRootProps()}>
            <ChannelHeader
              ref={headerRef}
              currentChannel={currentChannel}
              teamUserData={teamUserData}
              teamId={currentTeam.team_id}
            />
            {!currentChannel.channel_id && (
              <DirectDescription
                currentChannel={currentChannel}
                teamId={currentTeam.team_id}
              />
            )}
            <div
              ref={msgListRef}
              className="channel-view__body"
              onScroll={onMessageScroll}
            >
              <div style={{ marginTop: 15 }} />
              <div
                className="channel-view-message-list"
                style={{ pointerEvents: isScrolling ? "none" : "initial" }}
              >
                {messagesGroup.map(renderMessageGroup)}
              </div>
            </div>
            {loadMoreMessage && (
              <div className="message-load-more">
                <CircularProgress size={30} color="inherit" />
              </div>
            )}
            {currentChannel.channel_id && (
              <div className="message-bottom">
                <div style={{ position: "relative" }}>
                  {scrollData?.showScrollDown &&
                    !openTaskView &&
                    !isOpenConversation &&
                    !location.pathname.includes("user") && (
                      <div className="message-scroll-down__wrapper">
                        {scrollData?.unreadCount > 0 && (
                          <div className="unread-count">
                            <span>{scrollData?.unreadCount}</span>
                          </div>
                        )}
                        <div
                          className="btn-scroll-down normal-button"
                          onClick={scrollDown}
                        >
                          <img src={images.icScrollDown} alt="" />
                        </div>
                      </div>
                    )}
                </div>
                <MessageInput
                  placeholder={`Message to ${
                    currentChannel?.user?.user_name
                      ? normalizeUserName(currentChannel?.user?.user_name)
                      : `# ${currentChannel?.channel_name}`
                  }`}
                  attachments={files}
                  onRemoveFile={handleRemoveFile}
                  inputRef={inputRef}
                  onKeyDown={debounce(onKeyDown, 100)}
                  onPaste={_onPaste}
                  text={text}
                  setText={setText}
                  onCircleClick={onCircleClick}
                  messageReply={messageReply}
                  replyTask={replyTask}
                  onRemoveReply={onRemoveReply}
                  messageEdit={messageEdit}
                />
              </div>
            )}
            <input
              {...getInputProps()}
              ref={inputFileRef}
              accept="image/*,video/*,application/*"
              onChange={onChangeFiles}
            />
          </div>
        )}
      </Dropzone>
    );
  }
);

export default memo(ChannelView);
