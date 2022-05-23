import React, { useState } from 'react';
import './index.scss';
import images from '../../../../../../common/images';
import TaskChild from '../TaskChild';

type GroupChildProps = {
  title: string;
  type: string;
  isSelected?: boolean;
  onPress?: () => void;
  isPrivate?: boolean;
  isUnSeen?: boolean;
  isMuted?: boolean;
  isQuiet?: boolean;
};

const GroupChild = ({
  title,
  type,
  isSelected,
  onPress = () => {},
  isPrivate,
  isUnSeen,
  isMuted,
  isQuiet,
}: GroupChildProps) => {
  const [isHover, setHover] = useState(false);
  if (type === 'task') {
    return <TaskChild title={title} />;
  }
  const prefix = !isPrivate ? '# ' : '';
  const filter: any =
    isSelected || isUnSeen || isHover
      ? null
      : isMuted
      ? 'brightness(0.2)'
      : 'brightness(0.5)';

  return (
    <div
      className={`group-child-container ${isMuted && 'muted'} ${
        isSelected && 'group-selected'
      } ${isUnSeen && 'group-un-seen'} normal-button`}
      onClick={onPress}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ width: 25 }} />
      <div
        className="ml15"
        style={{ display: 'flex', alignItems: 'center', flex: 1 }}
      >
        {isPrivate && (
          <img
            style={{ marginLeft: 5, marginBottom: 4, filter }}
            alt=""
            src={images.icPrivateWhite}
          />
        )}
        <div style={{ flex: 1 }}>
          <span className="group-child__title ml5">
            {prefix}
            {title}
          </span>
        </div>
        {isQuiet && (
          <img
            style={{ marginLeft: 5, marginRight: 15, filter }}
            alt=""
            src={images.icBellQuite}
          />
        )}
      </div>
    </div>
  );
};

GroupChild.defaultProps = {
  isSelected: false,
};

export default GroupChild;
