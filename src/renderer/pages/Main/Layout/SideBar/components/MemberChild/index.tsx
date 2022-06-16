import { memo, useCallback } from 'react';
import { normalizeUserName } from 'renderer/helpers/MessageHelper';
import { UserData } from 'renderer/models';
import AvatarView from '../../../../../../components/AvatarView';
import './index.scss';

type MemberChildProps = {
  user: UserData;
  onPress?: (u: UserData) => void;
  isUnSeen?: boolean;
  isSelected?: boolean;
  onContextChannel?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    u: UserData
  ) => void;
};

const MemberChild = ({
  user,
  onPress,
  isUnSeen,
  isSelected,
  onContextChannel,
}: MemberChildProps) => {
  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      onContextChannel?.(e, user);
    },
    [onContextChannel, user]
  );
  const handleClick = useCallback(() => {
    onPress?.(user);
  }, [onPress, user]);
  return (
    <div
      className={`member-child-container ${isSelected ? 'active' : ''} ${
        isUnSeen ? 'un-seen' : ''
      }`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div style={{ marginLeft: 20 }}>
        <AvatarView user={user} />
      </div>
      <span className="member-child__username ml10">
        {normalizeUserName(user.user_name)}
      </span>
    </div>
  );
};

export default MemberChild;
