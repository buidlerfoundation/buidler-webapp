import React, { useEffect, useState, useRef } from 'react';
import './index.scss';
import MessageHead from '../MessageHead';
import { connect, useSelector } from 'react-redux';
import {
  extractContent,
  getMentionData,
  normalizeMessage,
} from '../../helpers/MessageHelper';
import MessageItem from '../MessageItem';
import Dropzone from 'react-dropzone';
import { getUniqueId } from '../../helpers/GenerateUUID';
import api from '../../api';
import SocketUtils from '../../utils/SocketUtils';
import MessageInput from '../MessageInput';
import { debounce } from 'lodash';
import { encryptMessage } from 'helpers/ChannelHelper';

type ConversationViewProps = {
  message: any;
  onEsc: () => void;
  teamUserData?: Array<any>;
  currentTeam: any;
  currentChannel: any;
  onAddReact?: (id: string, name: string, userId: string) => void;
  onRemoveReact?: (id: string, name: string, userId: string) => void;
};

const ConversationView = ({
  message,
  onEsc,
  teamUserData = [],
  currentTeam,
  currentChannel,
  onAddReact,
  onRemoveReact,
}: ConversationViewProps) => {
  const inputRef = useRef<any>();
  const channelPrivateKey = useSelector(
    (state: any) => state.configs.channelPrivateKey
  );
  const [isScrolling, setScrolling] = useState(false);
  const [messageEdit, setMessageEdit] = useState<any>(null);
  const timeoutScrollRef = useRef<any>(null);
  const [files, setFiles] = useState<Array<any>>([]);
  const generateId = useRef<string>('');
  const inputFileRef = useRef<any>();
  const [text, setText] = useState('');
  const messageHead =
    message.conversation_data[message.conversation_data.length - 1];
  const senderHead = teamUserData.find(
    (u) => u.user_id === messageHead.sender_id
  );
  useEffect(() => {
    inputRef.current?.focus();
    const keyDownListener = (e: any) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onEsc();
      }
    };
    window.addEventListener('keydown', keyDownListener);
    return () => window.removeEventListener('keydown', keyDownListener);
  }, []);
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
      api.editMessage(messageEdit.message_id, content, plain_text);
      setText('');
      setFiles([]);
      setMessageEdit(null);
      generateId.current = '';
    }
  }, 100);
  const submitMessage = debounce(async () => {
    const loadingAttachment = files.find((att: any) => att.loading);
    if (loadingAttachment != null) return;
    if (extractContent(text).trim() !== '' || files.length > 0) {
      const msg: any = {
        channel_id: currentChannel.channel_id,
        content: text.trim(),
        plain_text: extractContent(text.trim()),
        parent_id: message.parent_id,
        mentions: getMentionData(text.trim()),
      };
      if (currentChannel.channel_type === 'Private') {
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
      setText('');
      setFiles([]);
      generateId.current = '';
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
        type: f.type,
      };
      setFiles((current) => [...current, attachment]);
      api.uploadFile(currentTeam.team_id, generateId.current, f).then((res) => {
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
  const onMenuMessage = (msg: any) => (menu: any) => {
    if (menu.value === 'Edit') {
      // setMessageReply(null);
      // setReplyTask(null);
      setMessageEdit(msg);
      setText(msg.content);
      setTimeout(() => {
        inputRef.current?.focus?.();
      }, 0);
    }
  };
  return (
    <Dropzone onDrop={onAddFiles}>
      {({ getRootProps, getInputProps }) => (
        <div className="conversation-view__container" {...getRootProps()}>
          <div
            className="conversation-view__body"
            onScroll={(e: any) => {
              if (!isScrolling) {
                setScrolling(true);
              }
              if (timeoutScrollRef.current) {
                clearTimeout(timeoutScrollRef.current);
              }
              timeoutScrollRef.current = setTimeout(() => {
                setScrolling(false);
              }, 500);
            }}
          >
            <MessageHead
              message={messageHead}
              sender={senderHead}
              teamId={currentTeam.team_id}
            />
            <div className="conversation-body__messages">
              <div style={{ marginTop: 15 }} />
              {normalizeMessage(message.conversation_data.slice(0, -1)).map(
                (msg, index) => (
                  <MessageItem
                    key={msg.message_id}
                    message={msg}
                    onCreateTask={() => {}}
                    disableHover={isScrolling}
                    zIndex={message.conversation_data.length - index}
                    onRemoveReact={onRemoveReact}
                    onAddReact={onAddReact}
                    onMenuSelected={onMenuMessage(msg)}
                  />
                )
              )}
            </div>
          </div>
          <MessageInput
            placeholder="Enter your message"
            onCircleClick={onCircleClick}
            onKeyDown={onKeyDown}
            text={text}
            setText={setText}
            attachments={files}
            onPaste={_onPaste}
            onRemoveFile={(file) => {
              setFiles((current) => current.filter((f) => f.id !== file.id));
            }}
            inputRef={inputRef}
            messageEdit={messageEdit}
          />
          <input
            {...getInputProps()}
            ref={inputFileRef}
            accept="image/*,video/*"
            onChange={(e: any) => {
              onAddFiles(e.target.files);
              e.target.value = null;
            }}
          />
        </div>
      )}
    </Dropzone>
  );
};
const mapStateToProps = (state: any) => {
  return {
    teamUserData: state.user.teamUserData,
    currentTeam: state.user.currentTeam,
    currentChannel: state.user.currentChannel,
  };
};

export default connect(mapStateToProps)(ConversationView);
