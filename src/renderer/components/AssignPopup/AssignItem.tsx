import React, { useCallback } from 'react';
import './index.scss';
import { normalizeUserName } from 'renderer/helpers/MessageHelper';
import images from '../../common/images';
import AvatarView from '../AvatarView';

type AssignItemProps = {
  isSelected: boolean;
  user: any;
  onClick: (user?: any) => void;
};

const AssignItem = ({ isSelected, onClick, user }: AssignItemProps) => {
  const handleClick = useCallback(() => {
    onClick(user);
  }, [onClick, user]);
  return (
    <div className="assign__item normal-button" onClick={handleClick}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {(user.user_id && <AvatarView user={user} />) || (
          <img src={images.icUserCircle} alt="" />
        )}
        <span style={{ marginLeft: 15 }} className="username">
          {normalizeUserName(user.user_name)}
        </span>
      </div>
      {isSelected && <img alt="" src={images.icCheck} />}
    </div>
  );
};

export default AssignItem;
