import React, { useState, useRef } from 'react';
import images from '../../common/images';
import PopoverButton from '../PopoverButton';
import PopupChannel from '../PopupChannel';
import './index.scss';

type TagViewProps = {
  channels: Array<any>;
  currentChannel: any;
  onChange: (channels: Array<any>) => void;
  isUserChannel?: boolean;
};

const TagView = ({
  channels,
  currentChannel,
  onChange,
  isUserChannel,
}: TagViewProps) => {
  const [hoverChannel, setHoverChannel] = useState(false);
  const popupChannelRef = useRef<any>();
  const data = channels.filter(
    (c) => c.channel_id !== currentChannel.channel_id
  );
  const onItemClick = (e: any) => {
    popupChannelRef.current?.show(e.currentTarget, {
      x: e.pageX,
      y: e.pageY,
    });
  };
  const renderFirstChannel = () => {
    if (data.length === 0) {
      const firstChannelName =
        isUserChannel || currentChannel.channel_type === 'Direct'
          ? 'channels'
          : currentChannel.channel_name;
      return (
        <div
          className="tag-view__item normal-button"
          style={{ marginRight: 10 }}
          onClick={onItemClick}
        >
          <span># {firstChannelName}</span>
        </div>
      );
    }
    return null;
  };
  return (
    <div
      className="tag-view__container"
      onMouseEnter={() => setHoverChannel(true)}
      onMouseLeave={() => setHoverChannel(false)}
    >
      {renderFirstChannel()}
      {data.map((c) => (
        <div
          className="tag-view__item normal-button"
          style={{ marginRight: 10 }}
          key={c.channel_id}
          onClick={onItemClick}
        >
          <span># {c.channel_name}</span>
        </div>
      ))}
      {hoverChannel && (
        <PopoverButton
          ref={popupChannelRef}
          onClose={() => {
            setHoverChannel(false);
          }}
          componentButton={
            <div className="button-add-channel">
              <img alt="" src={images.icPlus} />
            </div>
          }
          componentPopup={
            <PopupChannel
              selected={isUserChannel ? data : [currentChannel, ...data]}
              onChange={(val) => {
                onChange(val);
                popupChannelRef.current?.hide();
              }}
            />
          }
        />
      )}
    </div>
  );
};

export default TagView;
