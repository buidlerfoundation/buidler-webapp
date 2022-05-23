import React from 'react';
import './index.scss';

type TaskChildProps = {
  title: string;
};

const TaskChild = ({ title }: TaskChildProps) => {
  return (
    <div className="task-child-container normal-button">
      <div style={{ width: 25 }} />
      <span className={`task-child__title ml15 ${title}`}>{`# ${title}`}</span>
    </div>
  );
};

export default TaskChild;
