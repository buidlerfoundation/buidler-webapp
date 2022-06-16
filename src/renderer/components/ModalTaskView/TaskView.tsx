import { Popover } from "@material-ui/core";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from "react";
import { debounce } from "lodash";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import moment from "moment";
import ContentEditable, { ContentEditableEvent } from "react-contenteditable";
import TextareaAutosize from "react-textarea-autosize";
import Dropzone from "react-dropzone";
import useAppSelector from "renderer/hooks/useAppSelector";
import { updateTask } from "renderer/actions/TaskActions";
import { getConversations } from "renderer/actions/MessageActions";
import { getActivities } from "renderer/actions/ActivityActions";
import { TaskData } from "renderer/models";
import { ProgressStatus } from "../../common/AppConfig";
import images from "../../common/images";
import { fromNow, isOverDate } from "../../utils/DateUtils";
import StatusSelectionPopup from "../StatusSelectionPopup";
import "./index.scss";
import PopoverButton, { PopoverItem } from "../PopoverButton";
import PopupChannel from "../PopupChannel";
import MessageInput from "../MessageInput";
import { getUniqueId } from "../../helpers/GenerateUUID";
import api from "../../api";
import SocketUtils from "../../utils/SocketUtils";
import MessageItem from "../MessageItem";
import {
  extractContent,
  getMentionData,
  normalizeMessage,
  normalizeUserName,
} from "../../helpers/MessageHelper";
import AssignPopup from "../AssignPopup";
import GlobalVariable from "../../services/GlobalVariable";
import TaskAttachmentItem from "./TaskAttachmentItem";
import ActivityBody from "./ActivityBody";
import DatePickerV2 from "../DatePickerV2";
import AvatarView from "../AvatarView";
import useAppDispatch from "renderer/hooks/useAppDispatch";

type TaskViewProps = {
  task?: TaskData;
  teamId: string;
  channelId: string;
  onEsc: () => void;
  conversations: Array<any>;
  activities: Array<any>;
  onDeleteTask: (task: any) => void;
};

const taskMenu: Array<PopoverItem> = [
  {
    label: "Delete",
    value: "Delete",
    type: "destructive",
  },
];

const TaskView = ({
  task,
  teamId,
  channelId,
  onEsc,
  conversations,
  activities,
  onDeleteTask,
}: TaskViewProps) => {
  const dispatch = useAppDispatch();
  const teamUserData = useAppSelector((state) => state.user.teamUserData);
  const popupMenuRef = useRef<any>();
  const reactData = useAppSelector((state) => state.reactReducer.reactData);
  const [activeIndex, setActiveIndex] = useState(0);
  const bottomBodyRef = useRef() as React.MutableRefObject<HTMLDivElement>;
  const popupChannelRef = useRef<any>();
  const popupDatePickerRef = useRef<any>();
  const inputTitleRef = useRef<any>();
  const inputDesRef = useRef<any>();
  const inputRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Array<any>>([]);
  const [anchorPopupStatus, setPopupStatus] = useState(null);
  const generateId = useRef<string>("");
  const popupAssigneeRef = useRef<any>();
  const inputFileRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const addFileRef = useRef() as React.MutableRefObject<HTMLInputElement>;
  const [taskData, setTaskData] = useState({
    currentStatus:
      ProgressStatus.find((st) => st.id === task?.status) || ProgressStatus[0],
    assignee: task?.assignee,
    dueDate: task?.due_date ? new Date(task?.due_date) : "",
    channels: task?.channel,
    title: task?.title,
    notes: task?.notes,
    attachments: task?.task_attachment,
  });
  const idPopupStatus = useMemo(
    () => (!!anchorPopupStatus ? "task-status-popover" : undefined),
    [anchorPopupStatus]
  );
  const dispatchUpdateTask = useCallback(
    (body: any) => {
      if (!task?.task_id) return false;
      return dispatch(updateTask(task?.task_id, channelId, body));
    },
    [channelId, dispatch, task?.task_id]
  );
  const openStatusSelection = useCallback((event: any) => {
    setPopupStatus(event.currentTarget);
  }, []);
  useEffect(() => {
    const keyDownListener = (e: any) => {
      if (e.key === "Escape") {
        e.preventDefault();
        if (document.activeElement === inputTitleRef.current) {
          inputTitleRef.current?.blur();
        }
        if (document.activeElement === inputDesRef.current) {
          inputDesRef.current?.blur();
        }
        onEsc();
      } else if (e.metaKey && e.key === "Enter") {
        if (document.activeElement === inputTitleRef.current) {
          inputDesRef.current?.focus();
        } else if (document.activeElement === inputDesRef.current) {
          inputDesRef.current?.blur();
        }
      }
    };
    window.addEventListener("keydown", keyDownListener);
    if (task?.task_id) {
      dispatch(getConversations(task?.task_id));
    }
    return () => window.removeEventListener("keydown", keyDownListener);
  }, [dispatch, onEsc, task?.task_id]);
  const onAddAttachment = useCallback(
    async (files: any) => {
      if (files == null || !task?.task_id) return;
      if (generateId.current === "") {
        generateId.current = getUniqueId();
      }
      const data = [...files];
      const preAtt: Array<any> = data.map((el) => ({
        file: URL.createObjectURL(el),
        randomId: Math.random(),
        loading: true,
        mimetype: el.type,
        original_name: el.name,
      }));
      setTaskData((current) => ({
        ...current,
        attachments: [...(current?.attachments || []), ...preAtt],
      }));
      const res = await Promise.all(
        data.map(async (el, idx) => {
          const r = await api.uploadFile(teamId, task.task_id, el);
          if (r.data && r.statusCode === 200) {
            return {
              ...r.data.file,
              file_url: r.data.file_url,
              randomId: preAtt[idx].randomId,
              id: r.data.file.file_id,
            };
          }
          return {
            randomId: preAtt[idx].randomId,
            file_url: null,
          };
        })
      );
      const task_attachment = [
        ...(taskData?.attachments || []),
        ...res.filter((el) => !!el.file_url),
      ];
      dispatchUpdateTask({
        task_attachment,
        file_ids: task_attachment.map((el: any) => el.file_id),
        team_id: teamId,
      });
      setTaskData((current) => {
        return {
          ...current,
          attachments:
            current?.attachments?.map((el: any) => {
              if (el.randomId) {
                return {
                  ...el,
                  loading: false,
                  ...res.find((item) => item.randomId === el.randomId),
                };
              }
              return el;
            }) || [],
        };
      });
    },
    [taskData.attachments, dispatchUpdateTask, teamId, task?.task_id]
  );
  const onAddFiles = useCallback(
    (fs: any) => {
      if (fs == null) return;
      if (generateId.current === "") {
        generateId.current = getUniqueId();
      }
      const data = [...fs];
      data.forEach((f) => {
        const attachment = {
          file: URL.createObjectURL(f),
          randomId: Math.random(),
          loading: true,
          type: f.type,
        };
        setAttachments((current) => [...current, attachment]);
        api
          .uploadFile(teamId, generateId.current, f)
          .then((res) => {
            setAttachments((current) => {
              let newAttachments = [...current];
              if (res.statusCode === 200) {
                const index = newAttachments.findIndex(
                  (a: any) => a.randomId === attachment.randomId
                );
                newAttachments[index] = {
                  ...newAttachments[index],
                  loading: false,
                  url: res.data?.file_url,
                  id: res.data?.file.file_id,
                };
              } else {
                newAttachments = newAttachments.filter(
                  (el) => el.randomId !== attachment.randomId
                );
              }

              return newAttachments;
            });
            return null;
          })
          .catch((err) => console.log(err));
      });
    },
    [teamId]
  );
  const openFile = useCallback(() => {
    inputFileRef.current?.click();
  }, []);
  const _onPaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      const { files } = e.clipboardData;
      if (files?.length > 0) {
        onAddFiles(files);
      }
    },
    [onAddFiles]
  );
  const handleSelectMenu = useCallback(
    (menu: PopoverItem) => {
      if (menu.value === "Delete") {
        onDeleteTask(task);
        onEsc();
      }
    },
    [onDeleteTask, onEsc, task]
  );
  const handleFocus = useCallback(() => {
    GlobalVariable.isInputFocus = true;
  }, []);
  const handleBlurTitle = useCallback(
    (e: React.FocusEvent<HTMLDivElement, Element>) => {
      GlobalVariable.isInputFocus = false;
      dispatchUpdateTask({
        title: e.target.innerHTML,
        team_id: teamId,
      });
    },
    [dispatchUpdateTask, teamId]
  );
  const handleChangeTitle = useCallback((e: ContentEditableEvent) => {
    setTaskData((data) => ({ ...data, title: e.target.value }));
  }, []);
  const _onPasteAttachmentTask = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement | HTMLTextAreaElement>) => {
      const { files } = e.clipboardData;
      if (files?.length > 0) {
        onAddAttachment(files);
      }
    },
    [onAddAttachment]
  );
  const submitMessage = useCallback(async () => {
    const loadingAttachment = attachments.find((att: any) => att.loading);
    if (loadingAttachment != null) return;
    if (extractContent(text).trim() !== "" || attachments.length > 0) {
      const msg: any = {
        channel_id: channelId,
        content: text.trim(),
        plain_text: extractContent(text.trim()),
        parent_id: task?.task_id,
        mentions: getMentionData(text.trim()),
      };
      if (attachments.length > 0) {
        msg.message_id = generateId.current;
      } else {
        msg.message_id = getUniqueId();
      }
      SocketUtils.sendMessage(msg);
      setText("");
      setAttachments([]);
      generateId.current = "";
    }
  }, [attachments, channelId, task?.task_id, text]);
  const handleAddFileClick = useCallback(() => {
    addFileRef?.current?.click();
  }, []);
  const handleConversationClick = useCallback(() => setActiveIndex(0), []);
  const handleActivitiesClick = useCallback(() => {
    if (!task?.task_id) return;
    dispatch(getActivities(task.task_id));
    setActiveIndex(1);
  }, [dispatch, task?.task_id]);
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.code === "Enter" && !e.shiftKey) {
        e.preventDefault();
        submitMessage();
        setTimeout(() => {
          bottomBodyRef.current?.scrollIntoView?.({ behavior: "smooth" });
        }, 300);
      }
    },
    [submitMessage]
  );
  const handleBlurNote = useCallback(
    (e: React.FocusEvent<HTMLTextAreaElement, Element>) => {
      GlobalVariable.isInputFocus = false;
      dispatchUpdateTask({
        notes: e.target.value,
        team_id: teamId,
      });
    },
    [dispatchUpdateTask, teamId]
  );
  const handleChangeNote = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) =>
      setTaskData((data) => ({ ...data, notes: e.target.value })),
    []
  );
  const handleOpenChannel = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      popupChannelRef.current?.show(e.currentTarget, {
        x: e.pageX,
        y: e.pageY,
      });
    },
    []
  );
  const handleChannelChange = useCallback(
    async (channels: any) => {
      const res = await dispatchUpdateTask({
        channel: channels.map((c: any) => ({
          channel_id: c.channel_id,
          channel_name: c.channel_name,
        })),
        team_id: teamId,
      });
      if (res) {
        setTaskData((data) => ({ ...data, channels }));
      }
      popupChannelRef.current?.hide();
    },
    [dispatchUpdateTask, teamId]
  );
  const handleAssigneeChange = useCallback(
    (u: any) => {
      popupAssigneeRef.current?.hide();
      if (!channelId) return;
      setTaskData((current) => ({ ...current, assignee: u }));
      dispatchUpdateTask({
        assignee_id: u?.user_id || null,
        assignee: u,
        team_id: teamId,
      });
    },
    [channelId, dispatchUpdateTask, teamId]
  );
  const handleDateChange = useCallback(
    async (date: MaterialUiPickersDate) => {
      popupDatePickerRef.current?.hide();
      if (!date) return;
      const res = await dispatchUpdateTask({
        due_date: moment(date).format("YYYY-MM-DD HH:mm:ss.SSSZ"),
        team_id: teamId,
      });
      if (res) {
        setTaskData((data) => ({ ...data, dueDate: date.toDateString() }));
      }
      popupChannelRef.current?.hide();
    },
    [dispatchUpdateTask, teamId]
  );
  const handleClearDate = useCallback(
    () => handleDateChange(null),
    [handleDateChange]
  );
  const onRemoveAttachment = useCallback(
    (attachment: any) => {
      const task_attachment =
        taskData?.attachments?.filter(
          (el: any) => !!el.file_id && el.file_id !== attachment.file_id
        ) || [];
      setTaskData((data) => ({ ...data, attachments: task_attachment }));
      dispatchUpdateTask({
        task_attachment,
        file_ids: task_attachment.map((el: any) => el.file_id),
        team_id: teamId,
      });
    },
    [dispatchUpdateTask, taskData.attachments, teamId]
  );
  const date = useMemo(() => taskData?.dueDate, [taskData?.dueDate]);
  const handleRemoveAttachment = useCallback((file: any) => {
    setAttachments((current) => current.filter((f) => f.id !== file.id));
  }, []);
  const handleClosePopupStatus = useCallback(() => setPopupStatus(null), []);
  const handleSelectStatus = useCallback(
    async (status: any) => {
      setPopupStatus(null);
      const res = await dispatchUpdateTask({
        status: status.id,
        team_id: teamId,
      });
      if (res) setTaskData((data) => ({ ...data, currentStatus: status }));
    },
    [dispatchUpdateTask, teamId]
  );
  const handleChangeFile = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onAddFiles(e.target.files);
    },
    [onAddFiles]
  );
  const handleChangeFileAttachment = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onAddAttachment(e.target.files);
      e.target.value = "";
    },
    [onAddAttachment]
  );
  const renderMessage = useCallback(
    (cvs: any) => (
      <MessageItem
        key={cvs.message_id}
        message={cvs}
        disableMenu
        content={cvs.content}
        reacts={reactData?.[cvs.message_id]}
      />
    ),
    [reactData]
  );
  return (
    <Dropzone onDrop={onAddFiles}>
      {({ getRootProps, getInputProps }) => (
        <div className="task-view__container" {...getRootProps()}>
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
              <span
                className={`task-status__name ${taskData.currentStatus.type}`}
              >
                {taskData.currentStatus.title}
              </span>
            </div>
            <div style={{ flex: 1 }} />
            <PopoverButton
              ref={popupMenuRef}
              data={taskMenu}
              onSelected={handleSelectMenu}
              onClose={() => {}}
              componentButton={
                <div className="normal-icon">
                  <img alt="" src={images.icMore} />
                </div>
              }
            />
            <div style={{ width: 10 }} />
          </div>
          <div className="task__body">
            <div className="area-wrapper">
              <ContentEditable
                innerRef={inputTitleRef}
                html={taskData.title || ""}
                onFocus={handleFocus}
                onBlur={handleBlurTitle}
                onChange={handleChangeTitle}
                className="task-title-input hide-scroll-bar"
                onPaste={_onPasteAttachmentTask}
              />
            </div>
            <div className="area-wrapper">
              <TextareaAutosize
                ref={inputDesRef}
                onPaste={_onPasteAttachmentTask}
                maxRows={12}
                className="task-note"
                placeholder="Add note"
                value={taskData.notes || ""}
                onBlur={handleBlurNote}
                onChange={handleChangeNote}
              />
            </div>
            <div className="task-row">
              <div className="label">
                <span>Channels</span>
              </div>
              <div className="value channel__wrap">
                {taskData.channels?.map?.((c: any) => (
                  <div
                    className="channel-item normal-button"
                    key={c.channel_id}
                    onClick={handleOpenChannel}
                  >
                    <span># {c.channel_name}</span>
                  </div>
                ))}
                <PopoverButton
                  ref={popupChannelRef}
                  componentButton={
                    <div className="button-add-channel">
                      <img alt="" src={images.icPlus} />
                    </div>
                  }
                  componentPopup={
                    <PopupChannel
                      selected={taskData.channels || []}
                      onChange={handleChannelChange}
                    />
                  }
                />
              </div>
            </div>
            <div className="task-row">
              <div className="label">
                <span>Assignee</span>
              </div>
              <div className="value">
                <PopoverButton
                  ref={popupAssigneeRef}
                  componentButton={
                    <div className="task-assignee__wrapper">
                      {taskData.assignee?.avatar_url ? (
                        <AvatarView
                          user={teamUserData.find(
                            (u) => u.user_id === taskData?.assignee?.user_id
                          )}
                        />
                      ) : (
                        <img
                          className="task-un-assigned"
                          src={images.icUser}
                          alt=""
                        />
                      )}
                      <span
                        className={`${
                          taskData.assignee?.avatar_url
                            ? "assignee-text"
                            : "un-assigned-text"
                        }`}
                      >
                        {normalizeUserName(
                          taskData.assignee?.user_name || ""
                        ) || "Unassigned"}
                      </span>
                    </div>
                  }
                  componentPopup={
                    <AssignPopup
                      selected={taskData?.assignee}
                      onChanged={handleAssigneeChange}
                    />
                  }
                />
              </div>
            </div>
            <div className="task-row">
              <div className="label">
                <span>Due Date</span>
              </div>
              <div className="value" style={{ position: "relative" }}>
                <PopoverButton
                  ref={popupDatePickerRef}
                  componentButton={
                    <div
                      className={`date-item normal-button ${
                        isOverDate(date) ? "over-date" : ""
                      }`}
                    >
                      <span>{date ? fromNow(date) : "Due date"}</span>
                    </div>
                  }
                  componentPopup={
                    <DatePickerV2
                      selectedDate={date || new Date()}
                      handleDateChange={handleDateChange}
                      onClear={handleClearDate}
                    />
                  }
                />
              </div>
            </div>
            <div className="task-column">
              <div className="label">
                <span>Attachments</span>
              </div>
              <div style={{ height: 20 }} />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  marginLeft: 20,
                }}
              >
                {taskData.attachments?.map((attachment: any) => {
                  return (
                    <TaskAttachmentItem
                      key={attachment.file_id || attachment.randomId}
                      attachment={attachment}
                      teamId={teamId}
                      onRemoveAttachment={onRemoveAttachment}
                    />
                  );
                })}
                <div
                  className="btn-add-attachment normal-button"
                  onClick={handleAddFileClick}
                >
                  <img
                    src={images.icPlus}
                    alt=""
                    style={{ width: 24, height: 24 }}
                  />
                </div>
              </div>
            </div>
            <div className="bottom-tab-wrapper">
              <div
                className={`tab-label normal-button ${
                  activeIndex === 0 ? "active-tab" : ""
                }`}
                onClick={handleConversationClick}
              >
                <span>Conversation</span>
              </div>
              <div
                className={`tab-label normal-button ${
                  activeIndex === 1 ? "active-tab" : ""
                }`}
                onClick={handleActivitiesClick}
              >
                <span>Activities</span>
              </div>
            </div>
            <div style={{ height: 5 }} />
            {activeIndex === 0 && (
              <div className="conversation-body">
                <div style={{ height: 15 }} />
                {normalizeMessage(conversations.slice(0, -1)).map(
                  renderMessage
                )}
              </div>
            )}
            {activeIndex === 1 && (
              <ActivityBody activities={activities || []} />
            )}
            <div ref={bottomBodyRef} />
          </div>
          {activeIndex === 0 && (
            <MessageInput
              placeholder="Add comment"
              onCircleClick={openFile}
              onKeyDown={debounce(onKeyDown, 100)}
              text={text}
              inputRef={inputRef}
              setText={setText}
              onPaste={_onPaste}
              attachments={attachments}
              onRemoveFile={handleRemoveAttachment}
            />
          )}
          <Popover
            elevation={0}
            id={idPopupStatus}
            open={!!anchorPopupStatus}
            anchorEl={anchorPopupStatus}
            onClose={handleClosePopupStatus}
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
            ref={inputFileRef}
            accept="image/*,video/*"
            onChange={handleChangeFile}
          />
          <input
            {...getInputProps()}
            ref={addFileRef}
            accept="image/*,video/*"
            multiple
            onChange={handleChangeFileAttachment}
          />
        </div>
      )}
    </Dropzone>
  );
};

export default memo(TaskView);
