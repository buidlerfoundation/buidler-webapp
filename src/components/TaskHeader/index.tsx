import React from 'react';
import { useSelector } from 'react-redux';
import images from '../../common/images';
import AvatarView from '../AvatarView';
import './index.scss';

type TaskHeaderProps = {
  title: string;
  count?: number | null;
  toggle: () => void;
  onCreate?: () => void;
  filterValue?: string;
};

const TaskHeader = ({
  title,
  count = null,
  toggle,
  onCreate,
  filterValue,
}: TaskHeaderProps) => {
  const teamUserData = useSelector((state: any) => state.user.teamUserData);
  const user =
    filterValue === 'Assignee' && title !== 'Unassigned'
      ? teamUserData.find((el: any) => el.user_id === title)
      : null;
  return (
    <div className="task-header-container">
      <div className="task-header-label__wrapper">
        <div
          className={`task-header__label normal-button ${title.toLowerCase()}`}
          onClick={toggle}
        >
          {user ? (
            <>
              <AvatarView user={user} />
              <span className="user-name">{user.user_name}</span>
            </>
          ) : (
            <span>{title}</span>
          )}
        </div>
        {!!onCreate && (
          <div className="create-task-button" onClick={onCreate}>
            <img src={images.icPlus} alt="" />
          </div>
        )}
      </div>
      {count !== null && (
        <div className="task-count normal-button" onClick={toggle}>
          <span>{count}</span>
        </div>
      )}
    </div>
  );
};

export default TaskHeader;
