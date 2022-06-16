import './index.scss';
import React from 'react';
import images from '../../common/images';
import AvatarView from '../AvatarView';
import { normalizeUserName } from 'renderer/helpers/MessageHelper';

type UserItemProps = {
  isSelected: boolean;
  user: any;
  onClick: () => void;
};

const UserItem = ({ isSelected, onClick, user }: UserItemProps) => {
  return (
    <div className="team-user__item normal-button" onClick={onClick}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <AvatarView user={user} />
        <span style={{ marginLeft: 15 }} className="username">
          {normalizeUserName(user.user_name)}
        </span>
      </div>
      {isSelected && <img alt="" src={images.icCheck} />}
    </div>
  );
};

export default UserItem;
