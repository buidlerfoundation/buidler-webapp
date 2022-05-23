import React from 'react';
import ModalFullScreen from '../ModalFullScreen';
import CreateTaskFullScreenView from './CreateTaskFullScreenView';

type ModalCreateTaskFullScreenProps = {
  open: boolean;
  handleClose: () => void;
  onCreateTask: () => void;
  taskData: any;
  update: (key: string, val: any) => void;
};

const ModalCreateTaskFullScreen = ({
  handleClose,
  onCreateTask,
  open,
  taskData,
  update,
}: ModalCreateTaskFullScreenProps) => {
  return (
    <ModalFullScreen onClosed={handleClose} open={open}>
      <CreateTaskFullScreenView
        onCreateTask={onCreateTask}
        taskData={taskData}
        update={update}
        onCancel={handleClose}
      />
    </ModalFullScreen>
  );
};

export default ModalCreateTaskFullScreen;
