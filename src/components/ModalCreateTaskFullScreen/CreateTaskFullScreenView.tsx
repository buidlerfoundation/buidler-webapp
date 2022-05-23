import React, { useState } from 'react';
import './index.scss';
import Popover from '@material-ui/core/Popover';
import StatusSelectionPopup from '../StatusSelectionPopup';
import AssignPopup from '../AssignPopup';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import DataPicker from '../DatePicker';
import { dateFormatted } from '../../utils/DateUtils';
import images from '../../common/images';
import NormalButton from '../NormalButton';
import AppInput from '../AppInput';

type CreateTaskFullScreenViewProps = {
  onCreateTask: () => void;
  taskData: any;
  update: (key: string, val: any) => void;
  onCancel: () => void;
};

const CreateTaskFullScreenView = ({
  onCreateTask,
  taskData,
  update,
  onCancel,
}: CreateTaskFullScreenViewProps) => {
  const [anchorPopupStatus, setPopupStatus] = useState(null);
  const [anchorPopupAssignee, setPopupAssignee] = useState(null);
  const openStatus = Boolean(anchorPopupStatus);
  const openAssignee = Boolean(anchorPopupAssignee);
  const idPopupStatus = openStatus ? 'full-status-popover' : undefined;
  const idPopupAssignee = openAssignee ? 'full-assign-popover' : undefined;
  const openStatusSelection = (event: any) => {
    setPopupStatus(event.currentTarget);
  };
  const openAssigneeSelection = (event: any) => {
    setPopupAssignee(event.currentTarget);
  };
  const handleDateChange = (date: MaterialUiPickersDate) => {
    update('dueDate', date);
  };
  return (
    <div className="task__view">
      <div className="task__header">
        <div style={{ width: 10 }} />
        <div
          className="task-view__status normal-button"
          aria-describedby={idPopupStatus}
          onClick={openStatusSelection}
        >
          <img
            alt=""
            src={taskData.currentStatus.icon}
            className="task-status__check-box"
          />
          <span className={`task-status__name ${taskData.currentStatus.type}`}>
            {taskData.currentStatus.title}
          </span>
        </div>
        <div style={{ flex: 1 }} />
        <NormalButton title="Cancel" onPress={onCancel} type="normal" />
        <div style={{ width: 10 }} />
        <NormalButton title="Add Task" onPress={onCreateTask} type="success" />
        <div style={{ width: 20 }} />
      </div>
      <div className="task__body">
        <AppInput
          className="task-title"
          placeholder="Add task"
          onChange={(e) => update('title', e.target.value)}
        />
        <div className="task-field__container">
          <div className="task-field__title">
            <span className="task-field__title ml20">Notes</span>
          </div>
          <div className="task-field__body ml10">
            <AppInput
              placeholder="Add notes"
              onChange={(e) => update('notes', e.target.value)}
            />
          </div>
        </div>
        <div className="task-field__container">
          <div className="task-field__title">
            <span className="task-field__title ml20">Channels</span>
          </div>
          <div className="task-field__body">
            <div className="task-field__body-button normal-button">
              <span className="task-field__body__title">Add channel</span>
            </div>
          </div>
        </div>
        <div className="task-field__container">
          <div className="task-field__title">
            <span className="task-field__title ml20">Tags</span>
          </div>
          <div className="task-field__body">
            <div className="task-field__body-button normal-button">
              <span className="task-field__body__title">Add tag</span>
            </div>
          </div>
        </div>
        <div className="task-field__container">
          <div className="task-field__title">
            <span className="task-field__title ml20">Members</span>
          </div>
          <div className="task-field__body">
            <div className="task-field__body-button normal-button">
              <span className="task-field__body__title">Add members</span>
            </div>
          </div>
        </div>
        <div className="task-field__container">
          <div className="task-field__title">
            <span className="task-field__title ml20">Due Date</span>
          </div>
          <div className="task-field__body">
            <div className="task-field__body-button normal-button">
              <span className="task-field__body__title">Add due date</span>
            </div>
          </div>
        </div>
        <div className="task-field__container">
          <div className="task-field__title">
            <span className="task-field__title ml20">Files</span>
          </div>
          <div className="task-field__body">
            <div className="task-field__body-button normal-button">
              <span className="task-field__body__title">Add attachment</span>
            </div>
          </div>
        </div>
        <div className="task-field__container">
          <div className="task-field__title">
            <span className="task-field__title ml20">Activity</span>
          </div>
        </div>
      </div>
      <div className="task__bottom">
        <div className="normal-icon normal-button ml5">
          <img alt="" src={images.icPlus} />
        </div>
        <AppInput placeholder="Add comment" className="task__bottom__input" />
      </div>
      <Popover
        elevation={0}
        id={idPopupAssignee}
        open={openAssignee}
        anchorEl={anchorPopupAssignee}
        onClose={() => setPopupAssignee(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <AssignPopup
          selected={taskData?.assignee}
          onChanged={(u) => {
            setPopupAssignee(null);
            update('assignee', u);
          }}
        />
      </Popover>
      <Popover
        elevation={0}
        id={idPopupStatus}
        open={openStatus}
        anchorEl={anchorPopupStatus}
        onClose={() => setPopupStatus(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <StatusSelectionPopup
          onSelectedStatus={(status) => {
            setPopupStatus(null);
            update('currentStatus', status);
          }}
        />
      </Popover>
    </div>
  );
};

export default CreateTaskFullScreenView;
