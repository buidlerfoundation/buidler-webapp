import React from 'react';
import './index.scss';

type IconButtonProps = {
  title: string;
  icon: any;
  onPress?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  imgStyle?: any;
  color?: string;
};

const IconButton = ({
  title,
  icon,
  onPress,
  imgStyle,
  color,
}: IconButtonProps) => {
  return (
    <div className="icon-button__container normal-button" onClick={onPress}>
      <img
        alt=""
        src={icon}
        style={{ height: 15, width: 'auto', ...imgStyle }}
      />
      <span style={{ marginLeft: 10, color }}>{title}</span>
    </div>
  );
};

IconButton.defaultProps = {
  imgStyle: {},
};

export default IconButton;
