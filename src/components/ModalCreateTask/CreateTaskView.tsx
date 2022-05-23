import React, { useState, useRef } from 'react';
import images from '../../common/images';
import IconButton from '../IconButton';
import NormalButton from '../NormalButton';
import TagView from '../TagView';
import './index.scss';
import Popover from '@material-ui/core/Popover';
import StatusSelectionPopup from '../StatusSelectionPopup';
import AssignPopup from '../AssignPopup';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import DatePickerV2 from '../DatePickerV2';
import { dateFormatted } from '../../utils/DateUtils';
import Dropzone, { useDropzone } from 'react-dropzone';
import { CircularProgress } from '@material-ui/core';
import TextareaAutosize from 'react-textarea-autosize';
import PopoverButton from '../PopoverButton';
import { normalizeUserName } from 'helpers/MessageHelper';
import { useSelector } from 'react-redux';
import AttachmentItem from '../AttachmentItem';

type CreateTaskViewProps = {
  onCancel: () => void;
  onCreate: () => void;
  toggleFullScreen: () => void;
  taskData: any;
  update: (key: string, val: any) => void;
  onAddFiles: (files: any) => void;
  onRemoveFile: (file: any) => void;
  currentChannel: any;
};

const CreateTaskView = ({
  onCancel,
  onCreate,
  toggleFullScreen,
  taskData,
  update,
  onAddFiles,
  onRemoveFile,
  currentChannel,
}: CreateTaskViewProps) => {
  const pasteFile = useRef(false);
  const inputRef = useRef<any>();
  const currentTeam = useSelector((state: any) => state.user.currentTeam);
  const popupDatePickerRef = useRef<any>();
  const [anchorPopupStatus, setPopupStatus] = useState(null);
  const [anchorPopupAssignee, setPopupAssignee] = useState(null);
  const openStatus = Boolean(anchorPopupStatus);
  const openAssignee = Boolean(anchorPopupAssignee);
  const idPopupStatus = openStatus ? 'status-popover' : undefined;
  const idPopupAssignee = openAssignee ? 'assign-popover' : undefined;
  const openStatusSelection = (event: any) => {
    setPopupStatus(event.currentTarget);
  };
  const openAssigneeSelection = (event: any) => {
    setPopupAssignee(event.currentTarget);
  };
  const handleDateChange = (date: MaterialUiPickersDate) => {
    popupDatePickerRef.current?.hide();
    update('dueDate', date);
  };
  const renderAttachment = (att: any, index: number) => {
    return (
      <AttachmentItem
        att={att}
        key={att.randomId || att.id || index}
        onRemove={() => onRemoveFile(att)}
        teamId={currentTeam.team_id}
      />
    );
    if (att.type.includes('video')) {
      return (
        <div
          className="attachment-item"
          key={att.randomId || att.id || index}
          style={{ marginRight: 16, marginBottom: 16 }}
        >
          <video>
            <source src={att.file} type="video/mp4" />
          </video>
          <div
            className="attachment-delete normal-button"
            onClick={() => onRemoveFile(att)}
          >
            <img alt="" src={images.icCircleClose} />
          </div>
        </div>
      );
    }
    return (
      <div
        className="attachment-item"
        key={att.randomId || att.id || index}
        style={{ marginRight: 16, marginBottom: 16 }}
      >
        <img className="attachment-image" alt="" src={att.file || att.url} />
        {att.loading && (
          <div className="attachment-loading">
            <CircularProgress />
          </div>
        )}
        <div
          className="attachment-delete normal-button"
          onClick={() => onRemoveFile(att)}
        >
          <img alt="" src={images.icCircleClose} />
        </div>
      </div>
    );
  };
  const _onPaste = (e: any) => {
    const { files } = e.clipboardData;
    if (files?.length > 0) {
      onAddFiles(files);
    }
    pasteFile.current = files?.length > 0;
  };
  return (
    <Dropzone onDrop={onAddFiles}>
      {({ getRootProps, getInputProps }) => (
        <div className="create-task-view__container" {...getRootProps()}>
          <div className="task_view__header">
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
              <span
                className={`task-status__name ${taskData.currentStatus.type}`}
              >
                {taskData.currentStatus.title}
              </span>
            </div>
          </div>

          <TextareaAutosize
            className="task-title"
            minRows={2}
            maxRows={12}
            placeholder="Add title"
            onChange={(e) => {
              if (pasteFile.current) {
                pasteFile.current = false;
                update('title', taskData.title);
                return;
              }
              let { value } = e.target;
              const subStr = value.substring(0, 4);
              if (subStr.toLowerCase() !== 'http') {
                value = value.charAt(0).toUpperCase() + value.slice(1);
              }
              update('title', value);
            }}
            value={taskData.title || ''}
            autoFocus
            onPaste={_onPaste}
          />
          <TextareaAutosize
            className="task-note"
            minRows={2}
            maxRows={12}
            placeholder="Add note"
            value={taskData.notes || ''}
            onChange={(e) => {
              if (pasteFile.current) {
                pasteFile.current = false;
                update('notes', taskData.notes);
                return;
              }
              update('notes', e.target.value);
            }}
            onPaste={_onPaste}
          />
          <div className="task__attachment-view">
            {taskData.attachments.map(renderAttachment)}
          </div>
          <div className="task__tag-view">
            <TagView
              currentChannel={currentChannel}
              channels={taskData.channels}
              onChange={(channels) => {
                update('channels', channels);
              }}
            />
          </div>
          <div className="task__actions">
            <IconButton
              title={
                normalizeUserName(taskData?.assignee?.user_name) || 'Unassigned'
              }
              icon={taskData.assignee?.avatar_url || images.icUser}
              onPress={openAssigneeSelection}
              imgStyle={
                taskData?.assignee
                  ? { height: 15, width: 15, borderRadius: '50%' }
                  : {}
              }
            />
            <div style={{ width: 10 }} />
            <div className="task__due-date-container">
              <PopoverButton
                ref={popupDatePickerRef}
                onClose={() => {}}
                componentButton={
                  <IconButton
                    title={
                      taskData?.dueDate
                        ? dateFormatted(taskData?.dueDate)
                        : 'Due Date'
                    }
                    icon={images.icCalendar}
                    imgStyle={{ filter: 'brightness(0.5)' }}
                    onPress={() => {}}
                  />
                }
                componentPopup={
                  <DatePickerV2
                    selectedDate={taskData?.dueDate || new Date()}
                    handleDateChange={handleDateChange}
                    onClear={() => handleDateChange(null)}
                  />
                }
              />
            </div>
            <div style={{ width: 10 }} />
            <IconButton
              title="Attach"
              icon={images.icAttachment}
              onPress={() => {
                inputRef.current?.click();
              }}
            />
          </div>
          <div className="task__bottom">
            <NormalButton title="Cancel" onPress={onCancel} type="normal" />
            <div style={{ width: 10 }} />
            <NormalButton title="Create" onPress={onCreate} type="main" />
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
          <input
            {...getInputProps()}
            ref={inputRef}
            accept="image/*,video/*,application/*"
            onChange={(e: any) => {
              onAddFiles(e.target.files);
              e.target.value = null;
            }}
          />
        </div>
      )}
    </Dropzone>
  );
};

export default CreateTaskView;
