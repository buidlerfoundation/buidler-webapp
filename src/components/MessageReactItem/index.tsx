import React from 'react';
import './index.scss';
import { Emoji } from 'emoji-mart';

type MessageReactItemProps = {
  emojis: Array<any>;
};

const MessageReactItem = ({ emojis }: MessageReactItemProps) => {
  return (
    <div className="message-react-container">
      {emojis.map((emj) => (
        <div className="react-item__view" key={emj.name}>
          <Emoji emoji={emj.name} set="apple" size={16} />
          {/* <span className="react-item">{emoji.getUnicode(emj.name)}</span> */}
          <span className="react-item__count">{emj.count}</span>
        </div>
      ))}
    </div>
  );
};

export default MessageReactItem;
