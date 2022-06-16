import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
  memo,
} from "react";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import { ProgressStatus } from "renderer/common/AppConfig";
import GlobalVariable from "renderer/services/GlobalVariable";
import { ReactReducerData, TaskData } from "renderer/models";
import useAppSelector from "renderer/hooks/useAppSelector";
import { updateTask } from "renderer/actions/TaskActions";
import { addReact, removeReact } from "renderer/actions/ReactActions";
import ImageHelper from "../../common/ImageHelper";
import images from "../../common/images";
import { getIconByStatus } from "../../helpers/TaskHelper";
import EmojiPicker from "../EmojiPicker";
import ImgLightBox from "../ImgLightBox";
import PopoverButton, { PopoverItem } from "../PopoverButton";
import "./index.scss";
import ReactView from "../ReactView";
import { taskFromNow } from "../../utils/DateUtils";
import AssignPopup from "../AssignPopup";
import PopupChannel from "../PopupChannel";
import DatePickerV2 from "../DatePickerV2";
import AvatarView from "../AvatarView";
import { normalizeMessageText } from "../../helpers/MessageHelper";
import StatusSelectionPopup from "../StatusSelectionPopup";
import useAppDispatch from "renderer/hooks/useAppDispatch";

type TaskItemProps = {
  task: TaskData;
  onUpdateStatus: (task: TaskData, status: string) => void;
  onMenuSelected: (menu: PopoverItem, task: TaskData) => void;
  onClick: (task: TaskData) => void;
  teamId: string;
  channelId?: string;
  onReplyTask: (task: TaskData) => void;
  reacts: Array<ReactReducerData>;
};

const taskMenu: Array<PopoverItem> = [
  {
    label: "Delete",
    value: "Delete",
    type: "destructive",
  },
];

const TaskItem = ({
  reacts,
  task,
  onUpdateStatus,
  onMenuSelected,
  onClick,
  teamId,
  channelId,
  onReplyTask,
}: TaskItemProps) => {
  console.log("Render Task");
  const dispatch = useAppDispatch();
  const { userData, teamUserData } = useAppSelector((state) => state.user);
  const popupMenuRef = useRef<any>();
  const addChannelRef = useRef<any>();
  const popupEmojiRef = useRef<any>();
  const popupAssigneeRef = useRef<any>();
  const popupDatePickerRef = useRef<any>();
  const dueDateRef = useRef<any>();
  const assigneeRef = useRef<any>();
  const popupChannelRef = useRef<any>();
  const popupPinnedMenuRef = useRef<any>();
  const statusRef = useRef<any>();
  const [isHighLight, setHighLight] = useState(task.isHighLight);
  const otherChannels = useMemo(
    () => task?.channel?.filter?.((c: any) => c.channel_id !== channelId) || [],
    [channelId, task?.channel]
  );
  const assignee = useMemo(
    () => teamUserData.find((u) => u.user_id === task?.assignee?.user_id),
    [task?.assignee?.user_id, teamUserData]
  );
  useEffect(() => {
    if (task.isHighLight) {
      setTimeout(() => {
        setHighLight(false);
      }, 1000);
    }
  }, [task.isHighLight]);
  useEffect(() => {
    const keyDownListener = (e: any) => {
      if (e.key === "c" && !e.metaKey) {
        if (GlobalVariable.isInputFocus) return;
        const taskElement = document.getElementById("task-list");
        const taskHoverElement = taskElement?.querySelector(
          ".task-item__wrap:hover"
        );
        if (taskHoverElement?.id === task.task_id) {
          popupChannelRef.current?.show(statusRef.current);
        } else {
          popupChannelRef.current?.hide();
        }
      }
    };
    window.addEventListener("keydown", keyDownListener);
    return () => {
      window.removeEventListener("keydown", keyDownListener);
    };
  }, [task.task_id]);
  const onReactPress = useCallback(
    (name: string) => {
      const isExisted = !!reacts?.find(
        (react: any) => react.reactName === name && react?.isReacted
      );
      if (isExisted) {
        dispatch(removeReact(task.task_id, name, userData.user_id));
      } else {
        dispatch(addReact(task.task_id, name, userData.user_id));
      }
    },
    [dispatch, reacts, task.task_id, userData?.user_id]
  );
  const handleClickTask = useCallback(() => {
    onClick(task);
  }, [onClick, task]);
  const handleClickStatus = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
      if (task.status === "pinned") {
        popupPinnedMenuRef.current?.show(e.currentTarget, {
          x: e.pageX,
          y: e.pageY,
        });
      } else {
        onUpdateStatus(
          task,
          task.status !== "done" && task.status !== "archived" ? "done" : "todo"
        );
      }
    },
    [onUpdateStatus, task]
  );
  const handleUpdateEmoji = useCallback(
    (emoji) => {
      onReactPress(emoji.id);
      popupEmojiRef.current?.hide();
    },
    [onReactPress]
  );
  const handleUpdateAssignee = useCallback(
    (u) => {
      popupAssigneeRef.current?.hide();
      if (!channelId) return;
      dispatch(
        updateTask(task.task_id, channelId, {
          assignee_id: u?.user_id || null,
          assignee: u,
          team_id: teamId,
        })
      );
    },
    [channelId, dispatch, task.task_id, teamId]
  );
  const handleReply = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
      onReplyTask(task);
    },
    [onReplyTask, task]
  );
  const handleDateChange = useCallback(
    (date: MaterialUiPickersDate) => {
      popupDatePickerRef.current?.hide();
      if (!channelId) return;
      dispatch(
        updateTask(task.task_id, channelId, { due_date: date, team_id: teamId })
      );
    },
    [channelId, dispatch, task.task_id, teamId]
  );
  const handleClearDate = useCallback(
    () => handleDateChange(null),
    [handleDateChange]
  );
  const handleSelectMenu = useCallback(
    (menu: PopoverItem) => {
      onMenuSelected(menu, task);
    },
    [onMenuSelected, task]
  );
  const handleUpdateChannel = useCallback(
    async (channels) => {
      if (!channelId) return;
      await dispatch(
        updateTask(task.task_id, channelId, {
          channel: channels.map((c: any) => ({
            channel_id: c.channel_id,
            channel_name: c.channel_name,
          })),
          team_id: teamId,
        })
      );
    },
    [channelId, dispatch, task.task_id, teamId]
  );
  const handleOpenDate = useCallback(
    (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
      e.stopPropagation();
      popupDatePickerRef.current?.show(dueDateRef.current);
    },
    []
  );
  const handleOpenAssignee = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
      popupAssigneeRef.current?.show(assigneeRef.current);
    },
    []
  );
  const handleSelectStatus = useCallback(
    async (status) => {
      onUpdateStatus(task, status.id);
    },
    [onUpdateStatus, task]
  );
  const renderOtherChannel = useCallback(
    (c: any) => (
      <div
        className={`task-channel-item ${
          task.status === "archived" ? "archived" : ""
        }`}
        key={c.channel_id}
      >
        <span># {c.channel_name}</span>
      </div>
    ),
    [task.status]
  );
  const renderAttachment = useCallback(
    (att: any) => {
      if (att.mimetype.includes("application")) {
        return (
          <div
            className="file-item"
            onClick={() => {
              window.open(
                ImageHelper.normalizeImage(att.file_url, teamId, {}, true),
                "_blank"
              );
            }}
            key={`${att?.file_id}`}
          >
            <img alt="" src={images.icFile} />
            <span className="file-name">{att.original_name}</span>
            <img alt="" src={images.icDownload} />
          </div>
        );
      }
      if (att.mimetype?.includes?.("video")) {
        return (
          <video className="task-attachment" controls key={att.file_id}>
            <source
              src={ImageHelper.normalizeImage(att.file_url, teamId)}
              type="video/mp4"
            />
          </video>
        );
      }
      return (
        <ImgLightBox
          originalSrc={ImageHelper.normalizeImage(att.file_url, teamId)}
          key={att.file_id}
        >
          <img
            className="task-attachment"
            alt=""
            src={ImageHelper.normalizeImage(att.file_url, teamId, {
              h: 120,
            })}
          />
        </ImgLightBox>
      );
    },
    [teamId]
  );
  return (
    <div
      className={`normal-button task-item__wrap ${
        isHighLight ? "task__high-light" : ""
      }`}
      style={{ borderRadius: 0 }}
      onContextMenu={(e) => {
        if (process.env.NODE_ENV === "development") {
          return;
        }
        popupMenuRef.current?.show(e.currentTarget, {
          x: e.pageX,
          y: e.pageY,
        });
      }}
      onClick={handleClickTask}
      id={task.task_id}
    >
      <div className="task-item-container">
        <div
          className="task-item__check-box"
          onClick={handleClickStatus}
          ref={statusRef}
        >
          <img alt="" src={getIconByStatus(task.status)} />
        </div>
        <div
          className={`task-item__name ${
            task.status === "archived" ? "archived" : ""
          }`}
          dangerouslySetInnerHTML={{
            __html: normalizeMessageText(task.title, !!task.notes),
          }}
        />
        <div className="task-item__menu">
          <PopoverButton
            ref={popupEmojiRef}
            componentButton={
              <div className="task-item__menu-item">
                <img alt="" src={images.icReact} />
              </div>
            }
            componentPopup={
              <div className="emoji-picker__container">
                <EmojiPicker onClick={handleUpdateEmoji} />
              </div>
            }
          />
          <PopoverButton
            ref={popupAssigneeRef}
            componentButton={
              <div className="task-item__menu-item">
                <img alt="" src={images.icAddFriend} />
              </div>
            }
            componentPopup={
              <AssignPopup
                selected={task?.assignee}
                onChanged={handleUpdateAssignee}
              />
            }
          />
          <div className="task-item__menu-item" onClick={handleReply}>
            <img alt="" src={images.icReply} />
          </div>
          <PopoverButton
            ref={popupDatePickerRef}
            componentButton={
              <div className="task-item__menu-item">
                <img alt="" src={images.icCalendar} />
              </div>
            }
            componentPopup={
              <DatePickerV2
                selectedDate={task?.due_date}
                handleDateChange={handleDateChange}
                onClear={handleClearDate}
              />
            }
          />
          <PopoverButton
            ref={popupMenuRef}
            data={taskMenu}
            onSelected={handleSelectMenu}
            componentButton={
              <div className="task-item__menu-item">
                <img alt="" src={images.icMoreWhite} />
              </div>
            }
          />
        </div>
      </div>
      <div className="task-item__bottom">
        <div className="task-item__bottom-left">
          <div
            className="task-channel"
            style={{ padding: otherChannels.length > 0 ? "4px 0 14px 0" : 0 }}
          >
            {otherChannels.map(renderOtherChannel)}
            {task.status !== "archived" && (
              <PopoverButton
                ref={popupChannelRef}
                componentButton={
                  otherChannels.length > 0 ? (
                    <div className="button-add-channel" ref={addChannelRef}>
                      <img alt="" src={images.icPlus} />
                    </div>
                  ) : (
                    <div />
                  )
                }
                componentPopup={
                  <PopupChannel
                    selected={task.channel || []}
                    onChange={handleUpdateChannel}
                  />
                }
              />
            )}
          </div>
          <div className="task-attachment__container">
            {task.task_attachment.map(renderAttachment)}
          </div>
          <div className="task-item__reacts">
            <ReactView
              reacts={reacts}
              onClick={onReactPress}
              teamUserData={teamUserData}
              parentId={task.task_id}
            />
          </div>
        </div>
        <div className="task-item__right">
          {task.comment_count > 0 && (
            <div className="task-item__comment">
              <img
                alt=""
                src={images.icReply}
                style={{ filter: "brightness(0.5)" }}
              />
              <span className="count">{task.comment_count}</span>
            </div>
          )}
          {task.due_date && (
            <span
              className="task-item__date"
              onClick={handleOpenDate}
              ref={dueDateRef}
            >
              {taskFromNow(task.due_date)}
            </span>
          )}
          {assignee && (
            <div
              onClick={handleOpenAssignee}
              ref={assigneeRef}
              style={{ paddingRight: 10 }}
            >
              <AvatarView user={assignee} />
            </div>
          )}
        </div>
      </div>
      <PopoverButton
        popupOnly
        ref={popupPinnedMenuRef}
        componentPopup={
          <StatusSelectionPopup
            onSelectedStatus={handleSelectStatus}
            data={ProgressStatus.filter((el) => el.id !== "pinned")}
          />
        }
      />
    </div>
  );
};

export default memo(TaskItem);
