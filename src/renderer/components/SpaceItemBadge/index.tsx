import React from 'react';
import IconStar from '../SVG/IconStar';
import './index.scss';

type SpaceBadgeProps = {
  color: string;
  backgroundColor: string;
  onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
};

const SpaceItemBadge = ({
  color,
  backgroundColor,
  onClick,
}: SpaceBadgeProps) => {
  return (
    <div
      className="space-badge__container"
      style={{ backgroundColor: backgroundColor || '#56C1951A' }}
      onClick={onClick}
    >
      <IconStar fill={color || '#56C195'} size={10} />
    </div>
  );
};

export default SpaceItemBadge;
