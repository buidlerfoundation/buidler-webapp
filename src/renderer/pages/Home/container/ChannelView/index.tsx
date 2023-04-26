import React, {
  useState,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useMemo,
  memo,
  useEffect,
} from "react";
import Dropzone from "react-dropzone";
import {
  Channel,
  Community,
  ConversationData,
  LocalAttachment,
  MessageData,
  MessageDateData,
  TaskData,
  UserData,
} from "renderer/models";
import { PopoverItem } from "renderer/shared/PopoverButton";
import { debounce } from "lodash";
import { CircularProgress } from "@material-ui/core";
import { updateTask, uploadToIPFS } from "renderer/actions/TaskActions";
import {
  deleteMessage,
  getAroundMessage,
  getMessages,
  onRemoveAttachment,
  setScrollData,
} from "renderer/actions/MessageActions";
import { encryptMessage } from "renderer/helpers/ChannelHelper";
import toast from "react-hot-toast";
import useAppSelector from "renderer/hooks/useAppSelector";
import { titleMessageFromNow } from "../../../../utils/DateUtils";
import images from "../../../../common/images";
import MessageItem from "../../../../shared/MessageItem";
import {
  extractContent,
  extractContentMessage,
  getMentionData,
  normalizeMessages,
  normalizeMessageText,
} from "../../../../helpers/MessageHelper";
import SocketUtils from "../../../../utils/SocketUtils";
import "./index.scss";
import { getUniqueId } from "../../../../helpers/GenerateUUID";
import api from "../../../../api";
import MessageInput from "../../../../shared/MessageInput";
import ChannelHeader from "./ChannelHeader";
import useAppDispatch from "renderer/hooks/useAppDispatch";
import { useLocation } from "react-router-dom";
import GoogleAnalytics from "renderer/services/analytics/GoogleAnalytics";
import useMatchCommunityId from "renderer/hooks/useMatchCommunityId";
import useTotalTeamUserData from "renderer/hooks/useTotalMemberUser";
import actionTypes from "renderer/actions/ActionTypes";
import ModalConfirmPin from "renderer/shared/ModalConfirmPin";
import ModalConfirmDelete from "renderer/shared/ModalConfirmDelete";
import useUserRole from "renderer/hooks/useUserRole";
import useChannel from "renderer/hooks/useChannel";
import { DirectCommunity, LoginType } from "renderer/common/AppConfig";
import useDirectChannelUser from "renderer/hooks/useDirectChannelUser";
import DirectEmpty from "renderer/shared/DirectEmpty";
import DirectNotSupport from "renderer/shared/DirectNotSupport";
import useMessageLoading from "renderer/hooks/useMessageLoading";

type ChannelViewProps = {
  currentChannel: Channel;
  messages?: Array<MessageData>;
  inputRef: any;
  currentTeam: Community;
  onMoreMessage: (lastCreatedAt: string) => void;
  onMoreAfterMessage: (message: MessageData) => void;
  loadMoreMessage: boolean;
  loadMoreAfterMessage?: boolean;
  messageCanMore: boolean;
  messageCanMoreAfter: boolean;
  scrollData?: any;
  teamUserData: Array<UserData>;
  onEditPinPost?: (data: TaskData) => void;
  hideScrollDown?: boolean;
};

const ChannelView = forwardRef(
  (
    {
      currentChannel,
      messages,
      inputRef,
      currentTeam,
      onMoreMessage,
      onMoreAfterMessage,
      loadMoreMessage,
      loadMoreAfterMessage,
      messageCanMore,
      messageCanMoreAfter,
      scrollData,
      teamUserData,
      onEditPinPost,
      hideScrollDown,
    }: ChannelViewProps,
    ref
  ) => {
    const location = useLocation();
    const dispatch = useAppDispatch();
    const totalTeamUser = useTotalTeamUserData();
    const communityId = useMatchCommunityId();
    const loading = useMessageLoading();
    const reactData = useAppSelector((state) => state.reactReducer.reactData);
    const channels = useChannel();
    const userRole = useUserRole();
    const loginType = useAppSelector((state) => state.configs.loginType);
    const isDirect = useMemo(
      () => communityId === DirectCommunity.team_id,
      [communityId]
    );
    const directUser = useDirectChannelUser();
    const messageHighLightId = useAppSelector(
      (state) => state.message.highlightMessageId
    );
    const messagesGroup = useMemo<Array<
      MessageData | MessageDateData
    > | null>(() => {
      if (!messages) return null;
      return normalizeMessages(messages);
    }, [messages]);
    const userData = useAppSelector((state) => state.user.userData);
    const channelPrivateKey = useAppSelector(
      (state) => state.configs.channelPrivateKey
    );
    const [openConfirmDeleteMessage, setOpenConfirmDeleteMessage] =
      useState(false);
    const [openConfirmPin, setOpenConfirmPin] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<MessageData | null>(
      null
    );
    const [messageReply, setMessageReply] = useState<MessageData | null>(null);
    const [messageEdit, setMessageEdit] = useState<MessageData | null>(null);
    const [isScrolling, setScrolling] = useState(false);
    const [files, setFiles] = useState<Array<LocalAttachment>>([]);
    const timeoutScrollRef = useRef<any>(null);
    const msgListRef = useRef<any>();
    const headerRef = useRef<any>();
    const generateId = useRef<string>("");
    const [text, setText] = useState("");
    const inputFileRef = useRef<any>();
    const toggleConfirmDeleteMessage = useCallback(
      () => setOpenConfirmDeleteMessage((current) => !current),
      []
    );
    const toggleConfirmPin = useCallback(
      () => setOpenConfirmPin((current) => !current),
      []
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
          const attachment: LocalAttachment = {
            file: URL.createObjectURL(f),
            randomId: getUniqueId(),
            loading: true,
            type: f.type || "application",
            fileName: f.name,
          };
          setFiles((current) => [...current, attachment]);
          api
            .uploadFile(
              currentTeam.team_id,
              generateId.current,
              f,
              "channel",
              attachment.randomId
            )
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
        if (
          scrollTop === 0 &&
          messageCanMoreAfter &&
          !loadMoreAfterMessage &&
          messages?.[0]
        ) {
          onMoreAfterMessage(messages?.[0]);
        } else {
          const showScrollDown = scrollTop < 0;
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
            messageCanMore &&
            messages
          ) {
            onMoreMessage(messages?.[messages?.length - 1].createdAt);
          }
        }
        if (timeoutScrollRef.current) {
          clearTimeout(timeoutScrollRef.current);
        }
        timeoutScrollRef.current = setTimeout(() => {
          setScrolling(false);
        }, 500);
      },
      [
        messageCanMoreAfter,
        onMoreAfterMessage,
        messages,
        scrollData?.showScrollDown,
        scrollData?.unreadCount,
        messageCanMore,
        dispatch,
        currentChannel?.channel_id,
        onMoreMessage,
        loadMoreAfterMessage,
      ]
    );
    const onCreateTaskFromMessage = useCallback(
      (msg: MessageData) => {
        setSelectedMessage(msg);
        toggleConfirmPin();
      },
      [toggleConfirmPin]
    );
    const onReplyPress = useCallback(
      (msg: MessageData | ConversationData) => {
        setMessageReply(msg);
        setMessageEdit(null);
        inputRef.current?.focus?.();
      },
      [inputRef]
    );
    const onEditMessage = useCallback(
      (msg: MessageData) => {
        setMessageReply(null);
        setMessageEdit(msg);
        setFiles(
          msg.message_attachments?.map?.((el) => ({
            ...el,
            type: el.mimetype,
            id: el.file_id,
            fileName: el.original_name,
            url: el.file_url,
          }))
        );
        setText(normalizeMessageText(msg.content, undefined, true));
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
      },
      [inputRef]
    );
    const onMenuMessage = useCallback(
      (menu: PopoverItem, msg: MessageData | ConversationData) => {
        switch (menu.value) {
          case "Upload to IPFS":
            if (msg.task?.task_id) {
              dispatch(
                uploadToIPFS(
                  msg.task?.task_id,
                  currentChannel.channel_id,
                  msg.task?.content
                )
              );
            }
            break;
          case "Delete":
            setSelectedMessage(msg);
            toggleConfirmDeleteMessage();
            break;
          case "Archive":
            dispatch(
              updateTask(msg.message_id, currentChannel.channel_id, {
                status: "archived",
              })
            );
            break;
          case "Unarchive":
            dispatch(
              updateTask(msg.message_id, currentChannel.channel_id, {
                status: "pinned",
              })
            );
            break;
          default:
            break;
        }
      },
      [currentChannel.channel_id, dispatch, toggleConfirmDeleteMessage]
    );
    const scrollDown = useCallback(async () => {
      msgListRef.current?.scrollTo?.(0, 0);
    }, []);
    useEffect(() => {
      if (currentChannel.channel_id) {
        scrollDown();
      }
    }, [currentChannel.channel_id, scrollDown]);
    const onScrollDownPress = useCallback(async () => {
      if (messageCanMoreAfter) {
        await dispatch(getMessages(currentChannel.channel_id));
      }
      scrollDown();
    }, [currentChannel.channel_id, dispatch, messageCanMoreAfter, scrollDown]);
    const onClearText = useCallback(() => {
      inputRef.current?.blur();
      setText("");
      setMessageReply(null);
      setMessageEdit(null);
      setFiles([]);
      generateId.current = "";
    }, [inputRef]);
    const onRemoveReply = useCallback(() => {
      if (messageReply || messageEdit) {
        setText("");
      }
      inputRef.current?.blur();
      setMessageReply(null);
      setMessageEdit(null);
      setFiles([]);
      generateId.current = "";
    }, [messageReply, messageEdit, inputRef, setMessageReply, setMessageEdit]);
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
    useImperativeHandle(ref, () => {
      return {
        onJumpToMessage,
        hideReply: onRemoveReply,
        clearText: onClearText,
        showSetting: (action: string) => {
          headerRef.current.showSetting(action);
        },
        // hideSetting: headerRef.current.hideSetting,
      };
    });
    const editMessage = useCallback(async () => {
      if (!messageEdit?.message_id) return;
      if (extractContent(text).trim() !== "" || files.length > 0) {
        let content = extractContentMessage(text.trim());
        let plain_text = extractContent(text.trim());
        if (
          currentChannel.channel_type === "Private" ||
          (currentChannel.channel_type === "Direct" &&
            currentChannel.channel_id)
        ) {
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
          files.map((el) => el.id || "")
        );
        GoogleAnalytics.tracking("Message Edited", {
          category: "Message",
        });
        setText("");
        setFiles([]);
        setMessageEdit(null);
        generateId.current = "";
      }
    }, [
      files,
      text,
      currentChannel?.channel_type,
      currentChannel?.channel_id,
      messageEdit?.message_id,
      channelPrivateKey,
    ]);
    const submitMessage = useCallback(async () => {
      if (messageCanMoreAfter) {
        await dispatch(getMessages(currentChannel.channel_id));
      }
      if (extractContent(text).trim() !== "" || files.length > 0) {
        const message: any = {
          content: extractContentMessage(text.trim()),
          plain_text: extractContent(text),
          mentions: getMentionData(text.trim()),
          text,
          entity_type: "channel",
        };
        if (files.length > 0) {
          message.file_ids = files.map((el) => el.randomId);
        }
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
          message.entity_id = currentChannel.channel_id;
        }
        if (messageReply) {
          message.reply_message_id = messageReply.message_id;
        }
        if (files.length > 0) {
          message.message_id = generateId.current;
        } else {
          message.message_id = getUniqueId();
        }
        let gaLabel = "";
        if (message.content) {
          gaLabel += "text";
        }
        if (files?.find((el) => el?.type?.includes("image"))) {
          gaLabel += ", image";
        }
        if (files?.find((el) => el?.type?.includes("video"))) {
          gaLabel += ", video";
        }
        if (files?.find((el) => el?.type?.includes("application"))) {
          gaLabel += ", file";
        }
        GoogleAnalytics.tracking("Message Sent", {
          category: "Message",
          type: gaLabel,
          is_reply: `${!!messageReply}`,
          is_exclusive_space: `${
            currentChannel?.space?.space_type === "Private"
          }`,
          total_member: `${totalTeamUser}`,
        });
        SocketUtils.sendMessage(message);
        setText("");
        setFiles([]);
        generateId.current = "";
        scrollDown();
      }
    }, [
      files,
      messageCanMoreAfter,
      text,
      dispatch,
      currentChannel.channel_id,
      currentChannel.channel_type,
      currentChannel?.space?.space_type,
      messageReply,
      totalTeamUser,
      scrollDown,
      channelPrivateKey,
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
        if (e.key === "Escape") {
          onRemoveReply();
        } else if (e.code === "Enter" && !e.shiftKey) {
          e.preventDefault();
          if (messageEdit) {
            editMessage();
          } else {
            submitMessage();
          }
        }
      },
      [editMessage, messageEdit, onRemoveReply, submitMessage]
    );

    const onJumpToMessage = useCallback(
      async (messageId: string) => {
        dispatch({
          type: actionTypes.UPDATE_HIGHLIGHT_MESSAGE,
          payload: messageId,
        });
        if (messages?.find((el) => el.message_id === messageId)) {
          setTimeout(() => {
            const element = document.getElementById(messageId);
            element?.scrollIntoView({ behavior: "smooth", block: "start" });
          }, 0);
        } else {
          const success = await dispatch(
            getAroundMessage(messageId, currentChannel.channel_id)
          );
          if (!!success) {
            setTimeout(() => {
              const element = document.getElementById(messageId);
              element?.scrollIntoView({ behavior: "smooth", block: "start" });
            }, 500);
          }
        }
        setTimeout(() => {
          dispatch({
            type: actionTypes.UPDATE_HIGHLIGHT_MESSAGE,
            payload: null,
          });
        }, 1500);
      },
      [currentChannel.channel_id, dispatch, messages]
    );

    const renderMessage = useCallback(
      (msg: any) => {
        if (msg.type === "date") {
          return (
            <li className="date-title" key={msg.value}>
              <div className="separate-line" />
              <span>{titleMessageFromNow(msg.value)}</span>
              <div className="separate-line" />
              <div />
            </li>
          );
        }
        return (
          <MessageItem
            key={msg.message_id}
            message={msg}
            reacts={reactData?.[msg.message_id]}
            onCreateTask={onCreateTaskFromMessage}
            onReplyPress={onReplyPress}
            onMenuSelected={onMenuMessage}
            onEditMessage={onEditMessage}
            onEditPinPost={onEditPinPost}
            communityId={communityId}
            userId={userData.user_id}
            onJumpToMessage={onJumpToMessage}
            isHighlight={messageHighLightId === msg.message_id}
          />
        );
      },
      [
        reactData,
        onCreateTaskFromMessage,
        onReplyPress,
        onMenuMessage,
        onEditMessage,
        onEditPinPost,
        communityId,
        userData.user_id,
        onJumpToMessage,
        messageHighLightId,
      ]
    );
    const onDeleteMessage = useCallback(() => {
      if (!selectedMessage) return;
      dispatch(
        deleteMessage(
          selectedMessage.message_id,
          selectedMessage.reply_message_id,
          currentChannel.channel_id
        )
      );
      GoogleAnalytics.tracking("Message Deleted", {
        category: "Message",
      });
      toggleConfirmDeleteMessage();
    }, [
      currentChannel.channel_id,
      dispatch,
      selectedMessage,
      toggleConfirmDeleteMessage,
    ]);
    const canChat = useMemo(() => {
      if (!currentChannel.is_chat_deactivated) return true;
      return userRole === "Owner" || userRole === "Admin";
    }, [currentChannel.is_chat_deactivated, userRole]);
    if (isDirect && loginType !== LoginType.WalletImport) {
      return <DirectNotSupport />;
    }
    if (isDirect && channels.length === 0) {
      return <DirectEmpty />;
    }
    if (!currentChannel?.channel_id)
      return <div className="channel-view-container" />;
    return (
      <Dropzone onDrop={onAddFiles}>
        {({ getRootProps, getInputProps }) => (
          <div
            className="channel-view-container"
            style={{
              backgroundColor: isDirect
                ? "var(--color-darkest-background)"
                : "initial",
            }}
            {...getRootProps()}
          >
            <ChannelHeader
              ref={headerRef}
              currentChannel={currentChannel}
              teamUserData={teamUserData}
              teamId={communityId}
            />
            <div className="channel-view__body">
              {messagesGroup && messagesGroup?.length > 0 && (
                <ol
                  ref={msgListRef}
                  className={`channel-view-message-list hide-scroll-bar ${
                    isScrolling ? "channel-view-scrolling" : ""
                  }`}
                  onScroll={onMessageScroll}
                >
                  {messagesGroup?.map(renderMessage)}
                </ol>
              )}
              {!loading && messagesGroup?.length === 0 && (
                <span className="channel-view-message-empty">
                  No messages here yet. Send your first message.
                </span>
              )}
              {loadMoreAfterMessage && (
                <div className="message-load-more-after">
                  <CircularProgress size={30} color="inherit" />
                </div>
              )}
              <div style={{ marginTop: 15 }} />
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
                    !hideScrollDown &&
                    !location.pathname.includes("user") && (
                      <div className="message-scroll-down__wrapper">
                        {scrollData?.unreadCount > 0 && (
                          <div className="unread-count">
                            <span>{scrollData?.unreadCount}</span>
                          </div>
                        )}
                        <div
                          className="btn-scroll-down normal-button"
                          onClick={onScrollDownPress}
                        >
                          <img src={images.icScrollDown} alt="" />
                        </div>
                      </div>
                    )}
                </div>
                <MessageInput
                  placeholder={
                    canChat
                      ? `Message to ${
                          isDirect && directUser
                            ? `@ ${directUser.user_name}`
                            : `# ${currentChannel?.channel_name}`
                        }`
                      : "You do not have permission to send messages in this channel."
                  }
                  attachments={files}
                  onRemoveFile={handleRemoveFile}
                  inputRef={inputRef}
                  onKeyDown={debounce(onKeyDown, 100)}
                  onPaste={_onPaste}
                  text={text}
                  setText={setText}
                  onCircleClick={onCircleClick}
                  messageReply={messageReply}
                  onRemoveReply={onRemoveReply}
                  messageEdit={messageEdit}
                  inputId="message-input-channel"
                  disabled={!canChat}
                />
              </div>
            )}
            <input
              {...getInputProps()}
              ref={inputFileRef}
              accept="image/*,video/*,application/*"
              onChange={onChangeFiles}
            />
            <ModalConfirmPin
              open={openConfirmPin}
              handleClose={toggleConfirmPin}
              selectedMessage={selectedMessage}
            />
            <ModalConfirmDelete
              open={openConfirmDeleteMessage}
              handleClose={toggleConfirmDeleteMessage}
              title="Delete message"
              description="Are you sure you want delete this message"
              onDelete={onDeleteMessage}
              contentDelete="Delete"
            />
          </div>
        )}
      </Dropzone>
    );
  }
);

export default memo(ChannelView);
