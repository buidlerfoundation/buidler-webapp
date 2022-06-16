import React, { useCallback } from "react";
import images from "renderer/common/images";
import { normalizeUserName } from "renderer/helpers/MessageHelper";
import { UserData } from "renderer/models";
import AvatarView from "../AvatarView";
import "./index.scss";

type TeamUserItemProps = {
  user: UserData;
  isSelected?: boolean;
  onClick?: (user: UserData, isSelected?: boolean) => void;
  disabled?: boolean;
};

const TeamUserItem = ({
  user,
  isSelected,
  onClick,
  disabled,
}: TeamUserItemProps) => {
  const handleClick = useCallback(() => {
    return disabled ? undefined : onClick?.(user, isSelected);
  }, [disabled, isSelected, onClick, user]);
  return (
    <div className="user-item" onClick={handleClick}>
      <AvatarView user={user} size={25} />
      <span className={`user-name ${isSelected && "selected"}`}>
        {normalizeUserName(user.user_name)}
      </span>
      <div style={{ flex: 1 }} />
      {isSelected && <img alt="" src={images.icCheckWhite} />}
    </div>
  );
};

export default TeamUserItem;
