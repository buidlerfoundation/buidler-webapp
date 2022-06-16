import React, { useState, useRef, useCallback } from "react";
import "./index.scss";
import Popover from "@material-ui/core/Popover";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import Dropzone, { useDropzone } from "react-dropzone";
import { CircularProgress } from "@material-ui/core";
import TextareaAutosize from "react-textarea-autosize";
import { normalizeUserName } from "renderer/helpers/MessageHelper";
import { useSelector } from "react-redux";
import ImageHelper from "renderer/common/ImageHelper";
import AttachmentItem from "../AttachmentItem";
import StatusSelectionPopup from "../StatusSelectionPopup";
import AssignPopup from "../AssignPopup";
import PopoverButton from "../PopoverButton";
import images from "../../common/images";
import IconButton from "../IconButton";
import NormalButton from "../NormalButton";
import TagView from "../TagView";
import DatePickerV2 from "../DatePickerV2";
import { dateFormatted } from "../../utils/DateUtils";

type CreateTaskViewProps = {
  onCancel: () => void;
  onCreate: () => void;
  taskData: any;
  update: (key: string, val: any) => void;
  onAddFiles: (files: any) => void;
  onRemoveFile: (file: any) => void;
  currentChannel: any;
};

const CreateTaskView = ({
  onCancel,
  onCreate,
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
  const [anchorPopupStatus, setPopupStatus] = useState<Element | null>(null);
  const [anchorPopupAssignee, setPopupAssignee] = useState<Element | null>(
    null
  );
  const openStatus = Boolean(anchorPopupStatus);
  const openAssignee = Boolean(anchorPopupAssignee);
  const idPopupStatus = openStatus ? "status-popover" : undefined;
  const idPopupAssignee = openAssignee ? "assign-popover" : undefined;
  const openStatusSelection = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      setPopupStatus(event.currentTarget);
    },
    []
  );
  const handleUpdateChannel = useCallback(
    (channels: any) => {
      update("channels", channels);
    },
    [update]
  );
  const openAssigneeSelection = useCallback(
    (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      setPopupAssignee(event.currentTarget);
    },
    []
  );
  const handleDateChange = useCallback(
    (date?: MaterialUiPickersDate) => {
      popupDatePickerRef.current?.hide();
      update("dueDate", date);
    },
    [update]
  );
  const renderAttachment = useCallback(
    (att: any, index: number) => {
      return (
        <AttachmentItem
          att={att}
          key={att.randomId || att.id || index}
          onRemove={onRemoveFile}
          teamId={currentTeam.team_id}
        />
      );
    },
    [currentTeam?.team_id, onRemoveFile]
  );
  const handleUpdateTitle = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (pasteFile.current) {
        pasteFile.current = false;
        update("title", taskData.title);
        return;
      }
      let { value } = e.target;
      const subStr = value.substring(0, 4);
      if (subStr.toLowerCase() !== "http") {
        value = value.charAt(0).toUpperCase() + value.slice(1);
      }
      update("title", value);
    },
    [taskData.title, update]
  );
  const handleUpdateNote = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (pasteFile.current) {
        pasteFile.current = false;
        update("notes", taskData.notes);
        return;
      }
      update("notes", e.target.value);
    },
    [taskData.notes, update]
  );
  const _onPaste = useCallback(
    (e: any) => {
      const { files } = e.clipboardData;
      if (files?.length > 0) {
        onAddFiles(files);
      }
      pasteFile.current = files?.length > 0;
    },
    [onAddFiles]
  );
  const handleClearDate = useCallback(
    () => handleDateChange(null),
    [handleDateChange]
  );
  const handleAttachClick = useCallback(() => {
    inputRef.current?.click();
  }, []);
  const handleCloseAssignee = useCallback(() => setPopupAssignee(null), []);
  const handleSelectAssignee = useCallback(
    (u: any) => {
      setPopupAssignee(null);
      update("assignee", u);
    },
    [update]
  );
  const handleCloseStatus = useCallback(() => setPopupStatus(null), []);
  const handleSelectStatus = useCallback(
    (status: any) => {
      setPopupStatus(null);
      update("currentStatus", status);
    },
    [update]
  );
  const onChangeFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onAddFiles(e.target.files);
      e.target.value = "";
    },
    [onAddFiles]
  );
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
            onChange={handleUpdateTitle}
            value={taskData.title || ""}
            autoFocus
            onPaste={_onPaste}
          />
          <TextareaAutosize
            className="task-note"
            minRows={2}
            maxRows={12}
            placeholder="Add note"
            value={taskData.notes || ""}
            onChange={handleUpdateNote}
            onPaste={_onPaste}
          />
          <div className="task__attachment-view">
            {taskData.attachments.map(renderAttachment)}
          </div>
          <div className="task__tag-view">
            <TagView
              currentChannel={currentChannel}
              channels={taskData.channels}
              onChange={handleUpdateChannel}
            />
          </div>
          <div className="task__actions">
            <IconButton
              title={
                normalizeUserName(taskData?.assignee?.user_name) || "Unassigned"
              }
              icon={
                taskData.assignee?.user_id
                  ? ImageHelper.normalizeImage(
                      taskData.assignee?.avatar_url,
                      taskData.assignee?.user_id
                    )
                  : images.icUser
              }
              onPress={openAssigneeSelection}
              imgStyle={
                taskData?.assignee
                  ? { height: 15, width: 15, borderRadius: "50%" }
                  : {}
              }
            />
            <div style={{ width: 10 }} />
            <div className="task__due-date-container">
              <PopoverButton
                ref={popupDatePickerRef}
                componentButton={
                  <IconButton
                    title={
                      taskData?.dueDate
                        ? dateFormatted(taskData?.dueDate)
                        : "Due Date"
                    }
                    icon={images.icCalendar}
                    imgStyle={{ filter: "brightness(0.5)" }}
                  />
                }
                componentPopup={
                  <DatePickerV2
                    selectedDate={taskData?.dueDate || new Date()}
                    handleDateChange={handleDateChange}
                    onClear={handleClearDate}
                  />
                }
              />
            </div>
            <div style={{ width: 10 }} />
            <IconButton
              title="Attach"
              icon={images.icAttachment}
              onPress={handleAttachClick}
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
            onClose={handleCloseAssignee}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            <AssignPopup
              selected={taskData?.assignee}
              onChanged={handleSelectAssignee}
            />
          </Popover>
          <Popover
            elevation={0}
            id={idPopupStatus}
            open={openStatus}
            anchorEl={anchorPopupStatus}
            onClose={handleCloseStatus}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            <StatusSelectionPopup onSelectedStatus={handleSelectStatus} />
          </Popover>
          <input
            {...getInputProps()}
            ref={inputRef}
            accept="image/*,video/*,application/*"
            onChange={onChangeFile}
          />
        </div>
      )}
    </Dropzone>
  );
};

export default CreateTaskView;
