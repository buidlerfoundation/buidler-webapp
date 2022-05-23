import { Popover, CircularProgress } from "@material-ui/core";
import React, { useState, useEffect, useRef } from "react";
import { ProgressStatus } from "../../common/AppConfig";
import images from "../../common/images";
import { fromNow, isOverDate } from "../../utils/DateUtils";
import StatusSelectionPopup from "../StatusSelectionPopup";
import "./index.scss";
import TextareaAutosize from "react-textarea-autosize";
import PopoverButton, { PopoverItem } from "../PopoverButton";
import PopupChannel from "../PopupChannel";
import MessageInput from "../MessageInput";
import Dropzone from "react-dropzone";
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
import { debounce } from "lodash";
import AssignPopup from "../AssignPopup";
import GlobalVariable from "../../services/GlobalVariable";
import TaskAttachmentItem from "./TaskAttachmentItem";
import ActivityBody from "./ActivityBody";
import DatePickerV2 from "../DatePickerV2";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import moment from "moment";
import AvatarView from "../AvatarView";
import { connect } from "react-redux";
import ContentEditable from "react-contenteditable";

type TaskViewProps = {
  task?: any;
  teamId: string;
  updateTask?: (taskId: string, channelId: string, data: any) => any;
  getConversations?: (
    parentId: string,
    before?: string,
    isFresh?: boolean
  ) => any;
  channelId: string;
  onEsc: () => void;
  conversations: Array<any>;
  getActivities?: (taskId: string) => any;
  activities: Array<any>;
  teamUserData: Array<any>;
  onDeleteTask?: (task: any) => void;
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
  updateTask,
  channelId,
  onEsc,
  getConversations,
  conversations,
  getActivities,
  activities,
  teamUserData,
  onDeleteTask,
}: TaskViewProps) => {
  const popupMenuRef = useRef<any>();
  const [activeIndex, setActiveIndex] = useState(0);
  const bottomBodyRef = useRef<any>();
  const popupChannelRef = useRef<any>();
  const popupDatePickerRef = useRef<any>();
  const inputTitleRef = useRef<any>();
  const inputDesRef = useRef<any>();
  const inputRef = useRef<any>();
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<Array<any>>([]);
  const [hoverChannel, setHoverChannel] = useState(false);
  const [anchorPopupStatus, setPopupStatus] = useState(null);
  const generateId = useRef<string>("");
  const popupAssigneeRef = useRef<any>();
  const inputFileRef = useRef<any>();
  const addFileRef = useRef<any>();
  const [taskData, setTaskData] = useState({
    currentStatus:
      ProgressStatus.find((st) => st.id === task.status) || ProgressStatus[0],
    assignee: task.assignee,
    dueDate: task.due_date ? new Date(task.due_date) : "",
    channels: task.channel,
    title: task.title,
    notes: task.notes,
    attachments: task.task_attachment,
  });
  const openStatus = Boolean(anchorPopupStatus);
  const idPopupStatus = openStatus ? "task-status-popover" : undefined;
  const openStatusSelection = (event: any) => {
    setPopupStatus(event.currentTarget);
  };
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
    getConversations?.(task.task_id);
    return () => window.removeEventListener("keydown", keyDownListener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onAddAttachment = async (files: any) => {
    if (files == null) return;
    if (generateId.current === "") {
      generateId.current = getUniqueId();
    }
    const data = [...files];
    const preAtt = data.map((el) => ({
      file: URL.createObjectURL(el),
      randomId: Math.random(),
      loading: true,
      mimetype: el.type,
      original_name: el.name,
    }));
    setTaskData((current) => ({
      ...current,
      attachments: [...current.attachments, ...preAtt],
    }));
    const res = await Promise.all(
      data.map(async (el, idx) => {
        const r = await api.uploadFile(teamId, task.task_id, el);
        if (r.statusCode === 200) {
          return {
            ...r.file,
            file_url: r.file_url,
            randomId: preAtt[idx].randomId,
            id: r.file.file_id,
          };
        }
        return {
          ...r.file,
          file_url: null,
        };
      })
    );
    const task_attachment = [
      ...taskData.attachments,
      ...res.filter((el) => !!el.file_url),
    ];
    updateTask?.(task.task_id, channelId, {
      task_attachment,
      file_ids: task_attachment.map((el: any) => el.file_id),
      team_id: teamId,
    });
    setTaskData((current) => {
      return {
        ...current,
        attachments: current.attachments.map((el: any) => {
          if (el.randomId) {
            return {
              ...el,
              loading: false,
              ...res.find((item) => item.randomId === el.randomId),
            };
          }
          return el;
        }),
      };
    });
  };
  const onAddFiles = (fs: any) => {
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
      api.uploadFile(teamId, generateId.current, f).then((res) => {
        setAttachments((current) => {
          let newAttachments = [...current];
          if (res.statusCode === 200) {
            const index = newAttachments.findIndex(
              (a: any) => a.randomId === attachment.randomId
            );
            newAttachments[index] = {
              ...newAttachments[index],
              loading: false,
              url: res.file_url,
              id: res.file.file_id,
            };
          } else {
            newAttachments = newAttachments.filter(
              (el) => el.randomId !== attachment.randomId
            );
          }

          return newAttachments;
        });
        return null;
      });
    });
  };
  const openFile = () => {
    inputFileRef.current?.click();
  };
  const onCircleClick = () => {
    openFile();
  };
  const _onPaste = (e: any) => {
    const { files } = e.clipboardData;
    if (files?.length > 0) {
      onAddFiles(files);
    }
  };
  const _onPasteAttachmentTask = (e: any) => {
    const { files } = e.clipboardData;
    if (files?.length > 0) {
      onAddAttachment(files);
    }
  };
  const submitMessage = debounce(async () => {
    const loadingAttachment = attachments.find((att: any) => att.loading);
    if (loadingAttachment != null) return;
    if (extractContent(text).trim() !== "" || attachments.length > 0) {
      const msg: any = {
        channel_id: channelId,
        content: text.trim(),
        plain_text: extractContent(text.trim()),
        parent_id: task.task_id,
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
  }, 100);
  const onKeyDown = (e: any) => {
    if (e.code === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitMessage();
      setTimeout(() => {
        bottomBodyRef.current?.scrollIntoView?.({ behavior: "smooth" });
      }, 300);
    }
  };
  const handleDateChange = async (date: MaterialUiPickersDate) => {
    popupDatePickerRef.current?.hide();
    if (!date) return;
    const res = await updateTask?.(task.task_id, channelId, {
      due_date: moment(date).format("YYYY-MM-DD HH:mm:ss.SSSZ"),
      team_id: teamId,
    });
    if (res) {
      setTaskData((data) => ({ ...data, dueDate: date.toDateString() }));
    }
    popupChannelRef.current?.hide();
  };
  const onRemoveAttachment = (attachment: any) => {
    const task_attachment = taskData.attachments.filter(
      (el: any) => !!el.file_id && el.file_id !== attachment.file_id
    );
    setTaskData((data) => ({ ...data, attachments: task_attachment }));
    updateTask?.(task.task_id, channelId, {
      task_attachment,
      file_ids: task_attachment.map((el: any) => el.file_id),
      team_id: teamId,
    });
  };
  const date: any = taskData?.dueDate;
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
              onSelected={(menu) => {
                if (menu.value === "Delete") {
                  onDeleteTask?.(task);
                  onEsc();
                }
              }}
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
                html={taskData.title}
                onFocus={() => {
                  GlobalVariable.isInputFocus = true;
                }}
                onBlur={(e) => {
                  GlobalVariable.isInputFocus = false;
                  updateTask?.(task.task_id, channelId, {
                    title: e.target.innerHTML,
                    team_id: teamId,
                  });
                }}
                onChange={(e) => {
                  setTaskData((data) => ({ ...data, title: e.target.value }));
                }}
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
                onBlur={(e) => {
                  GlobalVariable.isInputFocus = false;
                  updateTask?.(task.task_id, channelId, {
                    notes: e.target.value,
                    team_id: teamId,
                  });
                }}
                onChange={(e) =>
                  setTaskData((data) => ({ ...data, notes: e.target.value }))
                }
              />
            </div>
            <div className="task-row">
              <div className="label">
                <span>Channels</span>
              </div>
              <div
                className="value"
                onMouseEnter={() => setHoverChannel(true)}
                onMouseLeave={() => setHoverChannel(false)}
              >
                {taskData.channels?.map?.((c: any) => (
                  <div
                    className="channel-item normal-button"
                    key={c.channel_id}
                    onClick={(e) => {
                      popupChannelRef.current?.show(e.currentTarget, {
                        x: e.pageX,
                        y: e.pageY,
                      });
                    }}
                  >
                    <span># {c.channel_name}</span>
                  </div>
                ))}
                {hoverChannel && (
                  <PopoverButton
                    ref={popupChannelRef}
                    onClose={() => {
                      setHoverChannel(false);
                    }}
                    componentButton={
                      <div className="button-add-channel">
                        <img alt="" src={images.icPlus} />
                      </div>
                    }
                    componentPopup={
                      <PopupChannel
                        selected={taskData.channels}
                        onChange={async (channels) => {
                          const res = await updateTask?.(
                            task.task_id,
                            channelId,
                            {
                              channel: channels.map((c: any) => ({
                                channel_id: c.channel_id,
                                channel_name: c.channel_name,
                              })),
                              team_id: teamId,
                            }
                          );
                          if (res) {
                            setTaskData((data) => ({ ...data, channels }));
                          }
                          popupChannelRef.current?.hide();
                        }}
                      />
                    }
                  />
                )}
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
                        {normalizeUserName(taskData.assignee?.user_name) ||
                          "Unassigned"}
                      </span>
                    </div>
                  }
                  componentPopup={
                    <AssignPopup
                      selected={taskData?.assignee}
                      onChanged={(u) => {
                        popupAssigneeRef.current?.hide();
                        if (!channelId) return;
                        setTaskData((current) => ({ ...current, assignee: u }));
                        updateTask?.(task.task_id, channelId, {
                          assignee_id: u?.user_id || null,
                          assignee: u,
                          team_id: teamId,
                        });
                      }}
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
                  onClose={() => {}}
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
                      onClear={() => handleDateChange(null)}
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
                  onClick={() => {
                    addFileRef.current.click();
                  }}
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
                onClick={() => setActiveIndex(0)}
              >
                <span>Conversation</span>
              </div>
              <div
                className={`tab-label normal-button ${
                  activeIndex === 1 ? "active-tab" : ""
                }`}
                onClick={() => {
                  getActivities?.(task.task_id);
                  setActiveIndex(1);
                }}
              >
                <span>Activities</span>
              </div>
            </div>
            <div style={{ height: 5 }} />
            {activeIndex === 0 && (
              <div className="conversation-body">
                <div style={{ height: 15 }} />
                {normalizeMessage(conversations.slice(0, -1)).map((cvs) => (
                  <MessageItem
                    key={cvs.message_id}
                    message={cvs}
                    onCreateTask={() => {}}
                    disableMenu
                  />
                ))}
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
              onCircleClick={onCircleClick}
              onKeyDown={onKeyDown}
              text={text}
              inputRef={inputRef}
              setText={setText}
              onPaste={_onPaste}
              attachments={attachments}
              onRemoveFile={(file) => {
                setAttachments((current) =>
                  current.filter((f) => f.id !== file.id)
                );
              }}
            />
          )}
          <Popover
            elevation={0}
            id={idPopupStatus}
            open={openStatus}
            anchorEl={anchorPopupStatus}
            onClose={() => setPopupStatus(null)}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "left",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "left",
            }}
          >
            <StatusSelectionPopup
              onSelectedStatus={async (status) => {
                setPopupStatus(null);
                const res = await updateTask?.(task.task_id, channelId, {
                  status: status.id,
                  team_id: teamId,
                });
                if (res)
                  setTaskData((data) => ({ ...data, currentStatus: status }));
              }}
            />
          </Popover>
          <input
            {...getInputProps()}
            ref={inputFileRef}
            accept="image/*,video/*"
            onChange={(e: any) => {
              onAddFiles(e.target.files);
            }}
          />
          <input
            {...getInputProps()}
            ref={addFileRef}
            accept="image/*,video/*"
            multiple
            onChange={(e: any) => {
              onAddAttachment(e.target.files);
              e.target.value = null;
            }}
          />
        </div>
      )}
    </Dropzone>
  );
};

const mapStateToProps = (state: any) => {
  return {
    teamUserData: state.user.teamUserData,
  };
};

export default connect(mapStateToProps)(TaskView);
