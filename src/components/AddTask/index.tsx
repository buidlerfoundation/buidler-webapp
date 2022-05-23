import React from 'react';
import images from '../../common/images';
import './index.scss';

type AddTaskProps = {
  onClick: () => void;
};

const AddTask = ({ onClick }: AddTaskProps) => {
  return (
    <div className="add-task-container normal-button" onClick={onClick}>
      <img alt="" src={images.icPlus} className="add-task__icon" />
      <span className="add-task__name">Add task</span>
    </div>
  );
};

export default AddTask;
