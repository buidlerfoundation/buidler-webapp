import React from "react";
import images from "renderer/common/images";
import TaskDetailField from "renderer/shared/TaskDetailField";
import "./index.scss";
import { TaskDetailUIConfigures } from "./UIConfigures";

const TaskDetailView = () => {
  return (
    <div className="task-detail__container task-detail__backdrop">
      <div className="task-detail__view">
        <div className="task-detail__header">
          <span className="task-detail__title">Task Detail</span>
          <div style={{ flex: 1 }} />
          <div className="normal-icon normal-button">
            <img alt="" src={images.icMore} />
          </div>
          <div style={{ width: 20 }} />
        </div>
        <div className="task-detail__body">
          <div className="task-detail__task normal-button">
            <img className="ml20" alt="" src={images.icCheckOutline} />
            <span className="task-detail__task-name ml20 mr20">
              Add socket to load realtime message unread
            </span>
          </div>
          {TaskDetailUIConfigures.map((ui) => (
            <TaskDetailField item={ui} key={ui.id} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailView;
