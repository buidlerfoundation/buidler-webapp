import React, { useState, useRef, useCallback } from 'react';
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
  const popupChannelRef = useRef<any>();
  const data = channels.filter(
    (c) => c.channel_id !== currentChannel.channel_id
  );
  const onItemClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      popupChannelRef.current?.show(e.currentTarget, {
        x: e.pageX,
        y: e.pageY,
      });
    },
    []
  );
  const renderFirstChannel = useCallback(() => {
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
  }, [
    currentChannel?.channel_name,
    currentChannel?.channel_type,
    data.length,
    isUserChannel,
    onItemClick,
  ]);
  const renderChannel = useCallback(
    (c) => (
      <div
        className="tag-view__item normal-button"
        style={{ marginRight: 10 }}
        key={c.channel_id}
        onClick={onItemClick}
      >
        <span># {c.channel_name}</span>
      </div>
    ),
    [onItemClick]
  );
  const handleUpdateChannel = useCallback(
    (val) => {
      onChange(val);
      popupChannelRef.current?.hide();
    },
    [onChange]
  );
  return (
    <div className="tag-view__container">
      {renderFirstChannel()}
      {data.map(renderChannel)}
      <PopoverButton
        ref={popupChannelRef}
        componentButton={
          <div className="button-add-channel">
            <img alt="" src={images.icPlus} />
          </div>
        }
        componentPopup={
          <PopupChannel
            selected={isUserChannel ? data : [currentChannel, ...data]}
            onChange={handleUpdateChannel}
          />
        }
      />
    </div>
  );
};

export default TagView;
