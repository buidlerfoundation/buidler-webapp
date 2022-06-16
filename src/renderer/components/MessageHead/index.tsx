import React from 'react';
import { normalizeUserName } from 'renderer/helpers/MessageHelper';
import images from '../../common/images';
import AvatarView from '../AvatarView';
import MessagePhotoItem from '../MessagePhotoItem';
import './index.scss';

type MessageHeadProps = {
  message: any;
  sender: any;
  teamId?: string;
};

const MessageHead = ({ message, sender, teamId }: MessageHeadProps) => {
  return (
    <div className="message-head__container">
      <div className="message-head__avatar-view">
        <AvatarView user={sender} size={35} />
      </div>
      <div className="message-head__content">
        <div className="message-head__user">
          <span className="message-head__user-name">
            {normalizeUserName(sender?.user_name)}
          </span>
        </div>
        <div
          className="message-head__message enable-user-select"
          dangerouslySetInnerHTML={{ __html: message?.content }}
        />
        <MessagePhotoItem
          photos={message?.message_attachment || []}
          teamId={teamId}
          isHead
        />
      </div>
      <div className="normal-icon normal-button">
        <img alt="" src={images.icMore} />
      </div>
      <div style={{ width: 20 }} />
    </div>
  );
};

export default MessageHead;
