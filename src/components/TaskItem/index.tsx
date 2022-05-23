import React, { useState, useRef, useEffect } from 'react';
import ImageHelper from '../../common/ImageHelper';
import images from '../../common/images';
import { getIconByStatus } from '../../helpers/TaskHelper';
import EmojiPicker from '../EmojiPicker';
import ImgLightBox from '../ImgLightBox';
import PopoverButton, { PopoverItem } from '../PopoverButton';
import './index.scss';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import ReactView from '../ReactView';
import { connect } from 'react-redux';
import { taskFromNow } from '../../utils/DateUtils';
import AssignPopup from '../AssignPopup';
import PopupChannel from '../PopupChannel';
import DatePickerV2 from '../DatePickerV2';
import GlobalVariable from '../../services/GlobalVariable';
import AvatarView from '../AvatarView';
import { normalizeMessageText } from '../../helpers/MessageHelper';
import StatusSelectionPopup from '../StatusSelectionPopup';
import { ProgressStatus } from 'common/AppConfig';

type TaskItemProps = {
  reactReducer?: any;
  task: any;
  onUpdateStatus: (status: string) => void;
  onMenuSelected: (menu: PopoverItem) => void;
  onClick: () => void;
  teamId: string;
  onHover?: () => void;
  onLeave?: () => void;
  updateTask?: (taskId: string, channelId: string, data: any) => any;
  channelId?: string;
  onAddReact?: (id: string, name: string, userId: string) => void;
  onRemoveReact?: (id: string, name: string, userId: string) => void;
  userData: any;
  onReplyTask?: (task: any) => void;
  teamUserData?: Array<any>;
  isSelected?: boolean;
};

const taskMenu: Array<PopoverItem> = [
  {
    label: 'Delete',
    value: 'Delete',
    type: 'destructive',
  },
];

const pinnedMenu: Array<PopoverItem> = [
  {
    label: 'Todo',
    value: 'todo',
  },
  {
    label: 'Doing',
    value: 'doing',
  },
  {
    label: 'Done',
    value: 'done',
  },
  {
    label: 'Archived',
    value: 'archived',
  },
];

const TaskItem = ({
  reactReducer,
  task,
  onUpdateStatus,
  onMenuSelected,
  onClick,
  teamId,
  onHover,
  onLeave,
  updateTask,
  channelId,
  onAddReact,
  onRemoveReact,
  userData,
  onReplyTask,
  teamUserData = [],
  isSelected,
}: TaskItemProps) => {
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
  const otherChannels = task?.channel?.filter?.(
    (c: any) => c.channel_id !== channelId
  );
  const sender = teamUserData.find(
    (u) => u.user_id === task?.assignee?.user_id
  );
  useEffect(() => {
    if (isHighLight) {
      setTimeout(() => {
        setHighLight(false);
      }, 1000);
    }
  }, []);
  useEffect(() => {
    const keyDownListener = (e: any) => {
      if (e.key === 'c' && !e.metaKey) {
        if (GlobalVariable.isInputFocus) return;
        if (isSelected) {
          if (popupChannelRef.current?.isOpen) {
            popupChannelRef.current?.hide();
          } else {
            popupChannelRef.current?.show(statusRef.current);
          }
        }
      }
    };
    window.addEventListener('keydown', keyDownListener);
    return () => {
      window.removeEventListener('keydown', keyDownListener);
    };
  }, [isSelected]);
  const handleDateChange = (date: MaterialUiPickersDate) => {
    popupDatePickerRef.current?.hide();
    if (!channelId) return;
    updateTask?.(task.task_id, channelId, { due_date: date, team_id: teamId });
  };
  const reacts = reactReducer?.reactData?.[task.task_id] || [];
  const onReactPress = (name: string) => {
    const isExisted = !!reacts.find(
      (react: any) => react.reactName === name && react?.isReacted
    );
    if (isExisted) {
      onRemoveReact?.(task.task_id, name, userData.user_id);
    } else {
      onAddReact?.(task.task_id, name, userData.user_id);
    }
  };
  return (
    <div
      className={`normal-button ${isHighLight ? 'task__high-light' : ''}`}
      style={{ borderRadius: 0 }}
      onMouseEnter={() => {
        onHover?.();
      }}
      onMouseLeave={(e) => {
        onLeave?.();
      }}
      onContextMenu={(e) => {
        if (process.env.NODE_ENV === 'development') {
          return;
        }
        popupMenuRef.current?.show(e.currentTarget, {
          x: e.pageX,
          y: e.pageY,
        });
      }}
      onClick={() => {
        if (
          popupMenuRef.current?.isOpen ||
          popupEmojiRef.current?.isOpen ||
          popupAssigneeRef.current?.isOpen ||
          popupChannelRef.current?.isOpen ||
          popupDatePickerRef.current?.isOpen
        ) {
          return;
        }
        onClick();
        setTimeout(() => {
          onHover?.();
        }, 200);
      }}
    >
      <div className="task-item-container">
        <div
          className="task-item__check-box"
          onClick={(e) => {
            e.stopPropagation();
            if (task.status === 'pinned') {
              popupPinnedMenuRef.current?.show(e.currentTarget, {
                x: e.pageX,
                y: e.pageY,
              });
            } else {
              onUpdateStatus(
                task.status !== 'done' && task.status !== 'archived'
                  ? 'done'
                  : 'todo'
              );
            }
          }}
          ref={statusRef}
        >
          <img alt="" src={getIconByStatus(task.status)} />
        </div>
        <div
          className={`task-item__name ${
            task.status === 'archived' ? 'archived' : ''
          }`}
          dangerouslySetInnerHTML={{
            __html: normalizeMessageText(task.title, !!task.notes),
          }}
        />

        {isSelected && (
          <div className="task-item__menu">
            <PopoverButton
              ref={popupEmojiRef}
              onClose={() => {
                // setHover(false);
              }}
              componentButton={
                <div className="task-item__menu-item">
                  <img alt="" src={images.icReact} />
                </div>
              }
              componentPopup={
                <div className="emoji-picker__container">
                  <EmojiPicker
                    onClick={(emoji) => {
                      onReactPress(emoji.id);
                      popupEmojiRef.current?.hide();
                    }}
                  />
                </div>
              }
            />
            <PopoverButton
              ref={popupAssigneeRef}
              onClose={() => {
                // setHover(false)
              }}
              componentButton={
                <div className="task-item__menu-item">
                  <img alt="" src={images.icAddFriend} />
                </div>
              }
              componentPopup={
                <AssignPopup
                  selected={task?.assignee}
                  onChanged={(u) => {
                    popupAssigneeRef.current?.hide();
                    // setHover(false);
                    if (!channelId) return;
                    updateTask?.(task.task_id, channelId, {
                      assignee_id: u?.user_id || null,
                      assignee: u,
                      team_id: teamId,
                    });
                  }}
                />
              }
            />
            <div
              className="task-item__menu-item"
              onClick={(e) => {
                e.stopPropagation();
                onReplyTask?.(task);
              }}
            >
              <img alt="" src={images.icReply} />
            </div>
            <PopoverButton
              ref={popupDatePickerRef}
              onClose={() => {
                // setHover(false);
              }}
              componentButton={
                <div className="task-item__menu-item">
                  <img alt="" src={images.icCalendar} />
                </div>
              }
              componentPopup={
                <DatePickerV2
                  selectedDate={task?.due_date}
                  handleDateChange={handleDateChange}
                  onClear={() => handleDateChange(null)}
                />
              }
            />
            <PopoverButton
              ref={popupMenuRef}
              data={taskMenu}
              onSelected={(menu) => {
                // setHover(false);
                onMenuSelected(menu);
              }}
              onClose={() => {
                // setHover(false)
              }}
              componentButton={
                <div className="task-item__menu-item">
                  <img alt="" src={images.icMoreWhite} />
                </div>
              }
            />
          </div>
        )}
      </div>
      <div className="task-item__bottom">
        <div className="task-item__bottom-left">
          <div
            className="task-channel"
            style={{ padding: otherChannels.length > 0 ? '4px 0 14px 0' : 0 }}
          >
            {otherChannels.map((c: any) => (
              <div
                className={`task-channel-item ${
                  task.status === 'archived' ? 'archived' : ''
                }`}
                key={c.channel_id}
              >
                <span># {c.channel_name}</span>
              </div>
            ))}
            {isSelected && task.status !== 'archived' && (
              <PopoverButton
                ref={popupChannelRef}
                onClose={() => {
                  // setHover(false)
                }}
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
                    selected={task.channel}
                    onChange={async (channels) => {
                      if (!channelId) return;
                      await updateTask?.(task.task_id, channelId, {
                        channel: channels.map((c: any) => ({
                          channel_id: c.channel_id,
                          channel_name: c.channel_name,
                        })),
                        team_id: teamId,
                      });
                    }}
                  />
                }
              />
            )}
          </div>
          <div className="task-attachment__container">
            {task.task_attachment.map((att: any) => {
              if (att.mimetype.includes('application')) {
                return (
                  <div
                    className="file-item"
                    onClick={() => {
                      window.open(
                        ImageHelper.normalizeImage(
                          att.file_url,
                          teamId,
                          {},
                          true
                        ),
                        '_blank'
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
              if (att.mimetype?.includes?.('video')) {
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
            })}
          </div>
          <div className="task-item__reacts">
            <ReactView
              reacts={reacts.map((r: any) => ({
                name: r.reactName,
                count: r.count,
                isReacted: r.isReacted,
              }))}
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
                style={{ filter: 'brightness(0.5)' }}
              />
              <span className="count">{task.comment_count}</span>
            </div>
          )}
          {task.due_date && (
            <span
              className="task-item__date"
              onClick={(e) => {
                e.stopPropagation();
                popupDatePickerRef.current?.show(dueDateRef.current);
              }}
              ref={dueDateRef}
            >
              {taskFromNow(task.due_date)}
            </span>
          )}
          {sender && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                popupAssigneeRef.current?.show(assigneeRef.current);
              }}
              ref={assigneeRef}
              style={{ paddingRight: 10 }}
            >
              <AvatarView user={sender} />
            </div>
          )}
        </div>
      </div>
      <PopoverButton
        popupOnly
        ref={popupPinnedMenuRef}
        onClose={() => {}}
        componentPopup={
          <StatusSelectionPopup
            onSelectedStatus={async (status) => {
              onUpdateStatus(status.id);
            }}
            data={ProgressStatus.filter((el) => el.id !== 'pinned')}
          />
        }
      />
    </div>
  );
};

const mapStateToProps = (state: any) => {
  return {
    reactReducer: state.reactReducer,
    userData: state.user.userData,
    teamUserData: state.user.teamUserData,
  };
};

export default connect(mapStateToProps)(TaskItem);
