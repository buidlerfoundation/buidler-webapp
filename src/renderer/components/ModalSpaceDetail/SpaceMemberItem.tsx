import React from 'react';
import ImageHelper from 'renderer/common/ImageHelper';
import { normalizeUserName } from 'renderer/helpers/MessageHelper';
import { SpaceMember } from 'renderer/models';

type SpaceMemberItemProps = {
  item: SpaceMember;
};

const SpaceMemberItem = ({ item }: SpaceMemberItemProps) => {
  return (
    <div className="space-member-item__container">
      <img
        className="member-avatar"
        src={ImageHelper.normalizeImage(item.avatar_url, item.user_id)}
        alt=""
      />
      <span className="member-user-name text-ellipsis">
        {normalizeUserName(item.user_name)}
      </span>
    </div>
  );
};

export default SpaceMemberItem;
