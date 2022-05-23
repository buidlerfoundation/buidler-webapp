import React from 'react';
import './index.scss';
import ModalFullScreen from '../ModalFullScreen';
import TaskView from './TaskView';

type ModalTaskViewProps = {
  task?: any;
  open: boolean;
  handleClose: () => void;
  teamId: string;
  updateTask?: (taskId: string, channelId: string, data: any) => any;
  channelId: string;
  getConversations?: (
    parentId: string,
    before?: string,
    isFresh?: boolean
  ) => any;
  conversations: Array<any>;
  getActivities?: (taskId: string) => any;
  activities: Array<any>;
  onDeleteTask?: (task: any) => void;
};

const ModalTaskView = ({
  open,
  handleClose,
  task,
  teamId,
  updateTask,
  channelId,
  getConversations,
  conversations,
  getActivities,
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
        updateTask={updateTask}
        getConversations={getConversations}
        conversations={conversations}
        getActivities={getActivities}
        activities={activities}
        onDeleteTask={onDeleteTask}
      />
    </ModalFullScreen>
  );
};

export default ModalTaskView;
