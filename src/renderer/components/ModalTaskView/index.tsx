import React, { memo } from 'react';
import './index.scss';
import ModalFullScreen from '../ModalFullScreen';
import TaskView from './TaskView';

type ModalTaskViewProps = {
  task?: any;
  open: boolean;
  handleClose: () => void;
  teamId: string;
  channelId: string;
  conversations: Array<any>;
  activities: Array<any>;
  onDeleteTask: (task: any) => void;
};

const ModalTaskView = ({
  open,
  handleClose,
  task,
  teamId,
  channelId,
  conversations,
  activities,
  onDeleteTask,
}: ModalTaskViewProps) => {
  if (!open) return null;
  return (
    <ModalFullScreen onClosed={handleClose} open={open}>
      <TaskView
        onEsc={handleClose}
        task={task}
        teamId={teamId}
        channelId={channelId}
        conversations={conversations}
        activities={activities}
        onDeleteTask={onDeleteTask}
      />
    </ModalFullScreen>
  );
};

export default memo(ModalTaskView);
