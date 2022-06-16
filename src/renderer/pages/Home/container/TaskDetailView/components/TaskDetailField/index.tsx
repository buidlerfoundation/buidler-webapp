import React from 'react';
import AppInput from '../../../../../../components/AppInput';
import './index.scss';

type TaskDetailFieldProps = { item: any };

const TaskDetailField = ({ item }: TaskDetailFieldProps) => {
  const { placeholder, type, title } = item;
  return (
    <div className="task-detail-field__container">
      <span className="task-detail-field__title ml20">{title}</span>
      <div className="task-detail-field__body">
        <AppInput placeholder={placeholder} />
      </div>
    </div>
  );
};

export default TaskDetailField;
