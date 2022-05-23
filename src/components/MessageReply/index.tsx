import React from 'react';
import { normalizeMessageText } from '../../helpers/MessageHelper';
import AvatarView from '../AvatarView';
import './index.scss';

type MessageReplyProps = {
  message: any;
  teamUserData?: Array<any>;
};

const MessageReply = ({ message, teamUserData = [] }: MessageReplyProps) => {
  const msgHead =
    message.conversation_data[message.conversation_data.length - 1];
  const senderHead = teamUserData.find((u) => u.user_id === msgHead.sender_id);
  if (!senderHead) return null;
  return (
    <div className="message-reply__container">
      <div className="message-reply__avatar-view">
        <AvatarView user={senderHead} />
      </div>
      <div
        className="message-reply__message"
        dangerouslySetInnerHTML={{
          __html: normalizeMessageText(msgHead.content || 'Attachment'),
        }}
      />
    </div>
  );
};

export default MessageReply;
