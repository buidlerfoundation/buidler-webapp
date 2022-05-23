import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react';
import images from '../../../../common/images';
import MessageItem from '../../../../components/MessageItem';
import {
  extractContent,
  getMentionData,
  normalizeMessage,
  normalizeMessages,
  normalizeUserName,
} from '../../../../helpers/MessageHelper';
import SocketUtils from '../../../../utils/SocketUtils';
import './index.scss';
import Dropzone from 'react-dropzone';
import { getUniqueId } from '../../../../helpers/GenerateUUID';
import api from '../../../../api';
import MessageInput from '../../../../components/MessageInput';
import MessageReplyItem from '../../../../components/MessageReplyItem';
import { debounce } from 'lodash';
import { CircularProgress } from '@material-ui/core';
import ChannelHeader from './ChannelHeader';
import { useLocation } from 'react-router-dom';
import { titleMessageFromNow } from '../../../../utils/DateUtils';
import { useSelector } from 'react-redux';
import {
  createMemberChannelData,
  encryptMessage,
} from 'helpers/ChannelHelper';
import DirectDescription from './DirectDescription';
import toast from 'react-hot-toast';

type ChannelViewProps = {
  currentChannel: any;
  messages: Array<any>;
  inputRef: any;
  currentTeam: any;
  createTask?: (channelId: string, body: any) => any;
  openConversation: (message: any) => void;
  onMoreMessage: () => void;
  loadMoreMessage: boolean;
  messageCanMore: boolean;
  scrollData?: any;
  setScrollData?: (channelId: string, data: any) => any;
  replyTask?: any;
  setReplyTask: (task?: any) => void;
  onAddReact?: (id: string, name: string, userId: string) => void;
  onRemoveReact?: (id: string, name: string, userId: string) => void;
  deleteMessage?: (
    messageId: string,
    parentId: string,
    channelId: string
  ) => any;
  openTaskView: boolean;
  isOpenConversation: boolean;
  onSelectTask: (task: any) => void;
  teamUserData: Array<any>;
  onRemoveAttachment?: (
    channelId: string,
    messageId: string,
    fileId: string
  ) => any;
  setCurrentChannel?: (channel: any) => any;
  channel?: any;
  deleteChannel?: (channelId: string) => any;
  updateChannel?: (channelId: string, body: any) => any;
  uploadChannelAvatar?: (teamId: string, channelId: string, file: any) => any;
};

const ChannelView = forwardRef(
  (
    {
      currentChannel,
      messages,
      inputRef,
      currentTeam,
      createTask,
      openConversation,
      onMoreMessage,
      loadMoreMessage,
      messageCanMore,
      setScrollData,
      scrollData,
      replyTask,
      setReplyTask,
      onAddReact,
      onRemoveReact,
      openTaskView,
      onSelectTask,
      teamUserData,
      onRemoveAttachment,
      setCurrentChannel,
      channel,
      isOpenConversation,
      deleteMessage,
      deleteChannel,
      updateChannel,
      uploadChannelAvatar,
    }: ChannelViewProps,
    ref
  ) => {
    const userData = useSelector((state: any) => state.user.userData);
    const channelPrivateKey = useSelector(
      (state: any) => state.configs.channelPrivateKey
    );
    const location = useLocation();
    const [messageReply, setMessageReply] = useState<any>(null);
    const [messageEdit, setMessageEdit] = useState<any>(null);
    const [isScrolling, setScrolling] = useState(false);
    const [files, setFiles] = useState<Array<any>>([]);
    const timeoutScrollRef = useRef<any>(null);
    const msgListRef = useRef<any>();
    const headerRef = useRef<any>();
    const generateId = useRef<string>('');
    const [text, setText] = useState('');
    const inputFileRef = useRef<any>();
    const scrollDown = () => {
      msgListRef.current?.scrollTo?.(0, 0);
    };
    const onRemoveReply = useCallback(() => {
      if (
        messageReply ||
        replyTask ||
        messageEdit ||
        currentChannel.channel_id
      ) {
        setText('');
        inputRef.current?.blur();
      }
      setMessageReply(null);
      setReplyTask(null);
      setMessageEdit(null);
      setFiles([]);
      generateId.current = '';
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
    useEffect(() => {
      const userId = location.search.split('user_id=')?.[1];
      const channelId = location.search.split('channel_id=')?.[1];
      onRemoveReply?.();
      if (userId) {
        const u = teamUserData.find((el) => el.user_id === userId);
        if (u) {
          const directChannel = channel.find(
            (c: any) => c?.channel_id === u.direct_channel
          );
          setCurrentChannel?.({
            channel_id: u.direct_channel || '',
            channel_name: '',
            channel_type: 'Direct',
            user: u,
            notification_type: directChannel?.notification_type || 'Alert',
            channel_member: directChannel?.channel_member || [],
          });
        }
      } else if (
        channelId &&
        !!channel.find((c: any) => c?.channel_id === channelId)
      ) {
        setCurrentChannel?.(
          channel.find((c: any) => c?.channel_id === channelId)
        );
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);
    useEffect(() => {
      const keyDownListener = (e: any) => {
        if (e.key === 'Escape') {
          onRemoveReply();
        }
      };
      window.addEventListener('keydown', keyDownListener);
      return () => {
        window.removeEventListener('keydown', keyDownListener);
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
    const editMessage = debounce(async () => {
      const loadingAttachment = files.find((att: any) => att.loading);
      if (loadingAttachment != null) return;
      if (extractContent(text).trim() !== '' || files.length > 0) {
        let content = text.trim();
        let plain_text = extractContent(text.trim());
        if (currentChannel.channel_type === 'Private') {
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
        setText('');
        setFiles([]);
        setMessageEdit(null);
        generateId.current = '';
        scrollDown();
      }
    }, 100);
    const submitMessage = debounce(async () => {
      const loadingAttachment = files.find((att: any) => att.loading);
      if (loadingAttachment != null) return;
      if (extractContent(text).trim() !== '' || files.length > 0) {
        const message: any = {
          content: text.trim(),
          plain_text: extractContent(text),
          mentions: getMentionData(text.trim()),
          text,
        };
        if (
          currentChannel.channel_type === 'Private' ||
          (currentChannel.channel_type === 'Direct' &&
            currentChannel.channel_id)
        ) {
          const { key } =
            channelPrivateKey?.[currentChannel.channel_id]?.[
              channelPrivateKey?.[currentChannel.channel_id]?.length - 1
            ] || {};
          if (!key) {
            setText('');
            setFiles([]);
            generateId.current = '';
            toast.error('Missing channel private key');
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
        setText('');
        setFiles([]);
        generateId.current = '';
        scrollDown();
      }
    }, 100);
    const onKeyDown = (e: any) => {
      if (e.code === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (messageEdit) {
          editMessage();
        } else {
          submitMessage();
        }
      }
    };
    const onAddFiles = (fs: any) => {
      inputRef.current?.focus();
      if (fs == null) return;
      if (generateId.current === '') {
        generateId.current = getUniqueId();
      }
      const data = [...fs];
      data.forEach((f) => {
        const attachment = {
          file: URL.createObjectURL(f),
          randomId: Math.random(),
          loading: true,
          type: f.type || 'application',
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
                  url: res.file_url,
                  id: res.file.file_id,
                };
              } else {
                newAttachments = newAttachments.filter(
                  (el) => el.randomId !== attachment.randomId
                );
              }

              return newAttachments;
            });
            return null;
          });
      });
    };
    const openFile = () => {
      inputFileRef.current?.click();
    };
    const onCircleClick = () => {
      openFile();
    };
    const _onPaste = (e: any) => {
      const fs = e.clipboardData.files;
      if (fs?.length > 0) {
        onAddFiles(fs);
      }
    };
    const onCreateTaskFromMessage = (msg: any) => () => {
      const body: any = {
        title: msg?.content,
        status: 'pinned',
        channel_ids:
          currentChannel.channel_type === 'Direct'
            ? currentChannel?.user?.user_channels
            : [currentChannel?.channel_id],
        file_ids: msg?.message_attachment?.map?.((a: any) => a.file_id),
        task_id: msg.message_id,
        team_id: currentTeam.team_id,
        assignee_id:
          msg.message_tag?.[0]?.mention_id || currentChannel?.user?.user_id,
      };
      createTask?.(currentChannel?.channel_id, body);
    };
    const onReplyPress = (msg: any) => () => {
      setMessageReply(msg);
      setReplyTask(null);
      setMessageEdit(null);
      inputRef.current?.focus?.();
    };
    const onMenuMessage = (msg: any) => (menu: any) => {
      if (menu.value === 'Delete') {
        deleteMessage?.(msg.message_id, msg.parent_id, currentChannel?.channel_id);
      }
      if (menu.value === 'Edit') {
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
    };
    if (!currentChannel?.channel_name && !currentChannel?.user)
      return <div className="channel-view-container" />;
    const onMessageScroll = (e: any) => {
      if (!isScrolling) {
        setScrolling(true);
      }
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      const showScrollDown = scrollTop < -80;
      if (showScrollDown !== scrollData?.showScrollDown) {
        setScrollData?.(currentChannel?.channel_id, {
          showScrollDown,
          unreadCount: showScrollDown ? scrollData.unreadCount : 0,
        });
      }
      if (
        (scrollTop + scrollHeight === clientHeight + 1 ||
          scrollTop + scrollHeight === clientHeight) &&
        messageCanMore
      ) {
        onMoreMessage();
      }
      if (timeoutScrollRef.current) {
        clearTimeout(timeoutScrollRef.current);
      }
      timeoutScrollRef.current = setTimeout(() => {
        setScrolling(false);
      }, 500);
    };
    return (
      <Dropzone onDrop={onAddFiles}>
        {({ getRootProps, getInputProps }) => (
          <div className="channel-view-container" {...getRootProps()}>
            <ChannelHeader
              ref={headerRef}
              currentChannel={currentChannel}
              teamUserData={teamUserData}
              setCurrentChannel={setCurrentChannel}
              deleteChannel={deleteChannel}
              updateChannel={updateChannel}
              teamId={currentTeam.team_id}
              uploadChannelAvatar={uploadChannelAvatar}
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
              {normalizeMessages(messages).map((el) => {
                return (
                  <div className="column-reverse" key={el.date}>
                    <div className="column-reverse">
                      {normalizeMessage(el.messages).map((msg, index) => {
                        if (msg.conversation_data?.length > 0) {
                          return (
                            <MessageReplyItem
                              key={msg.message_id}
                              message={msg}
                              onCreateTask={onCreateTaskFromMessage(msg)}
                              onClick={() => openConversation(msg)}
                              disableHover={isScrolling}
                              zIndex={messages.length - index}
                              onReplyPress={onReplyPress(msg)}
                              onAddReact={onAddReact}
                              onRemoveReact={onRemoveReact}
                              onMenuSelected={onMenuMessage(msg)}
                              onSelectTask={onSelectTask}
                            />
                          );
                        }
                        return (
                          <MessageItem
                            key={msg.message_id}
                            message={msg}
                            onCreateTask={onCreateTaskFromMessage(msg)}
                            onClick={() => openConversation(msg)}
                            disableHover={isScrolling}
                            zIndex={messages.length - index}
                            onReplyPress={onReplyPress(msg)}
                            onAddReact={onAddReact}
                            onRemoveReact={onRemoveReact}
                            onMenuSelected={onMenuMessage(msg)}
                            onSelectTask={onSelectTask}
                          />
                        );
                      })}
                    </div>
                    <div className="date-title">
                      <div className="separate-line" />
                      <span>{titleMessageFromNow(el.date)}</span>
                      <div className="separate-line" />
                      <div />
                    </div>
                  </div>
                );
              })}
            </div>
            {loadMoreMessage && (
              <div className="message-load-more">
                <CircularProgress size={30} color="inherit" />
              </div>
            )}
            {currentChannel.channel_id && (
              <div className="message-bottom">
                <div style={{ position: 'relative' }}>
                  {scrollData?.showScrollDown &&
                    !openTaskView &&
                    !isOpenConversation && (
                      <div className="message-scroll-down__wrapper">
                        {scrollData.unreadCount > 0 && (
                          <div className="unread-count">
                            <span>{scrollData.unreadCount}</span>
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
                  onRemoveFile={(file) => {
                    if (messageEdit) {
                      onRemoveAttachment?.(
                        currentChannel.channel_id,
                        messageEdit.message_id,
                        file.id
                      );
                    }
                    setFiles((current) =>
                      current.filter((f) => f.id !== file.id)
                    );
                  }}
                  inputRef={inputRef}
                  onKeyDown={onKeyDown}
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
              onChange={(e: any) => {
                onAddFiles(e.target.files);
                e.target.value = null;
              }}
            />
          </div>
        )}
      </Dropzone>
    );
  }
);

export default ChannelView;
