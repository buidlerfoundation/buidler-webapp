import React from 'react';
import './index.scss';
import images from '../../common/images';
import AvatarView from '../AvatarView';
import { normalizeUserName } from 'helpers/MessageHelper';

type AssignItemProps = {
  isSelected: boolean;
  user: any;
  onClick: () => void;
};

const AssignItem = ({ isSelected, onClick, user }: AssignItemProps) => {
  return (
    <div className="assign__item normal-button" onClick={onClick}>
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
