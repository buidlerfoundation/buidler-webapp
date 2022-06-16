import React from 'react';
import { spaceNameToAvatar } from 'renderer/helpers/ChannelHelper';
import './index.scss';

type DefaultSpaceIconProps = {
  name: string;
  size?: number;
  borderRadius?: number;
  fontSize?: number;
  fontMarginTop?: number;
};

const DefaultSpaceIcon = ({
  name,
  size = 30,
  borderRadius = 8,
  fontSize = 13,
  fontMarginTop = 4,
}: DefaultSpaceIconProps) => {
  return (
    <div
      className="default-space-icon__container"
      style={{ width: size, height: size, borderRadius }}
    >
      <span className="text" style={{ fontSize, marginTop: fontMarginTop }}>
        {spaceNameToAvatar(name)}
      </span>
    </div>
  );
};

export default DefaultSpaceIcon;
