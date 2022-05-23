import React, { useEffect, useState } from 'react';
import images from '../../../../common/images';
import PopoverButton, {
  PopoverItem,
} from '../../../../components/PopoverButton';
import TaskHeader from '../../../../components/TaskHeader';
import TaskItem from '../../../../components/TaskItem';
import {
  getGroupTask,
  getToggleState,
  groupTaskByFiltered,
} from '../../../../helpers/TaskHelper';
import './index.scss';
import { Droppable, Draggable } from 'react-beautiful-dnd';

type TaskListViewProps = {
  onAddTask: (title: string) => void;
  tasks: Array<any>;
  archivedTasks: Array<any>;
  onUpdateStatus: (task: any, status: string) => void;
  filter: PopoverItem;
  filterData: Array<PopoverItem>;
  onUpdateFilter: (filter: PopoverItem) => void;
  onDeleteTask: (task: any) => void;
  onSelectTask: (task: any) => void;
  teamId: string;
  archivedCount?: number;
  getArchivedTasks?: (
    channelId: string,
    userId?: string,
    teamId?: string
  ) => any;
  channelId?: string;
  onHoverChange: (key: string, index: number) => void;
  onHoverLeave: () => void;
  updateTask?: (taskId: string, channelId: string, data: any) => any;
  onAddReact?: (id: string, name: string, userId: string) => void;
  onRemoveReact?: (id: string, name: string, userId: string) => void;
  onReplyTask?: (task: any) => void;
  hoverTask?: any;
  directUserId?: string;
};

const TaskListView = ({
  onAddTask,
  tasks,
  onUpdateStatus,
  onUpdateFilter,
  filter,
  filterData,
  onDeleteTask,
  onSelectTask,
  teamId,
  archivedTasks,
  archivedCount,
  getArchivedTasks,
  channelId,
  onHoverChange,
  updateTask,
  onAddReact,
  onRemoveReact,
  onReplyTask,
  onHoverLeave,
  hoverTask,
  directUserId,
}: TaskListViewProps) => {
  const [showArchived, setShowArchived] = useState(false);
  const taskGrouped = groupTaskByFiltered(filter.value, tasks);
  const [toggleState, setToggleState] = useState<any>({});
  useEffect(() => {
    const grouped = groupTaskByFiltered(filter.value, tasks);
    setToggleState((current: any) => ({
      ...getToggleState(grouped),
      ...current,
    }));
  }, [filter.value, tasks]);
  useEffect(() => {
    setShowArchived(false);
  }, [channelId]);
  const getItemStyle = (isDragging: boolean, draggableStyle: any) => ({
    // some basic styles to make the items look a bit nicer
    userSelect: 'none',

    // change background colour if dragging
    // background: isDragging ? 'var(--color-highlight-action)' : 'none',

    // styles we need to apply on draggables
    ...draggableStyle,
  });
  const getListStyle = (isDraggingOver: boolean) => ({
    // background: isDraggingOver ? 'var(--color-highlight-action)' : 'none',
  });
  const toggleArchived = () => {
    if (archivedCount !== null && channelId) {
      getArchivedTasks?.(channelId, directUserId, teamId);
    }
    setShowArchived(!showArchived);
  };
  const shouldArchived =
    (archivedCount || 0) > 0 || (archivedTasks?.length || 0) > 0;
  return (
    <div className="task-list-container">
      <div className="task-list__header">
        <div style={{ width: 20 }} />
        <span className="task-list__title">All tasks: {tasks.length}</span>
        <div style={{ flex: 1 }} />
        <div className="task-list__actions">
          <PopoverButton
            title={filter.value}
            icon={images.icCollapse}
            data={filterData}
            onSelected={onUpdateFilter}
          />
        </div>
      </div>
      <div className="task-list__body">
        {Object.keys(taskGrouped)
          .filter((key) => taskGrouped[key].length > 0 || key === 'pinned')
          .map((key) => {
            const title = getGroupTask(filter.value, key);
            return (
              <div key={key}>
                <TaskHeader
                  onCreate={
                    filter.value === 'Status'
                      ? () => {
                          onAddTask(title);
                        }
                      : undefined
                  }
                  title={title}
                  count={toggleState[key] ? null : taskGrouped[key].length}
                  toggle={() => {
                    setToggleState((state: any) => ({
                      ...state,
                      [key]: !state[key],
                    }));
                  }}
                  filterValue={filter.value}
                />
                <Droppable droppableId={`${key}`} isCombineEnabled>
                  {(provided, snapshot) => {
                    return (
                      <div
                        ref={provided.innerRef}
                        style={getListStyle(snapshot.isDraggingOver)}
                        {...provided.droppableProps}
                      >
                        <div style={{ height: 0.1, marginTop: 19.9 }} />
                        {toggleState[key] &&
                          taskGrouped[key].map((task: any, index: number) => (
                            <Draggable
                              key={task.task_id}
                              draggableId={task.task_id}
                              index={index}
                              isDragDisabled={filter.value === 'Channel'}
                            >
                              {(dragProvided, dragSnapshot) => (
                                <div
                                  ref={dragProvided.innerRef}
                                  {...dragProvided.draggableProps}
                                  {...dragProvided.dragHandleProps}
                                  style={getItemStyle(
                                    dragSnapshot.isDragging,
                                    dragProvided.draggableProps.style
                                  )}
                                >
                                  <TaskItem
                                    isSelected={
                                      hoverTask?.task_id === task.task_id
                                    }
                                    updateTask={updateTask}
                                    channelId={channelId}
                                    onHover={() => {
                                      onHoverChange(key, index);
                                    }}
                                    onLeave={onHoverLeave}
                                    teamId={teamId}
                                    onClick={() => {
                                      onSelectTask(task);
                                    }}
                                    task={task}
                                    onUpdateStatus={(status) => {
                                      onUpdateStatus(task, status);
                                    }}
                                    onMenuSelected={(menu) => {
                                      if (menu.value === 'Delete') {
                                        onDeleteTask(task);
                                      }
                                    }}
                                    onAddReact={onAddReact}
                                    onRemoveReact={onRemoveReact}
                                    onReplyTask={onReplyTask}
                                  />
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    );
                  }}
                </Droppable>
              </div>
            );
          })}
        {shouldArchived && (
          <div>
            <TaskHeader
              title="Archived"
              count={
                showArchived ? null : archivedCount || archivedTasks?.length
              }
              toggle={toggleArchived}
            />
            <Droppable droppableId="archived">
              {(provided, snapshot) => {
                return (
                  <div
                    ref={provided.innerRef}
                    style={getListStyle(snapshot.isDraggingOver)}
                    {...provided.droppableProps}
                  >
                    <div style={{ height: 0.1, marginTop: 19.9 }} />
                    {showArchived &&
                      archivedTasks.map((task: any, index: number) => (
                        <Draggable
                          key={task.task_id}
                          draggableId={task.task_id}
                          index={index}
                        >
                          {(dragProvided, dragSnapshot) => (
                            <div
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              style={getItemStyle(
                                dragSnapshot.isDragging,
                                dragProvided.draggableProps.style
                              )}
                            >
                              <TaskItem
                                isSelected={hoverTask?.task_id === task.task_id}
                                updateTask={updateTask}
                                channelId={channelId}
                                teamId={teamId}
                                onClick={() => {
                                  onSelectTask(task);
                                }}
                                task={task}
                                onUpdateStatus={(status) => {
                                  onUpdateStatus(task, status);
                                }}
                                onMenuSelected={(menu) => {
                                  if (menu.value === 'Delete') {
                                    onDeleteTask(task);
                                  }
                                }}
                                onAddReact={onAddReact}
                                onRemoveReact={onRemoveReact}
                                onReplyTask={onReplyTask}
                                onHover={() => {
                                  onHoverChange('archived', index);
                                }}
                                onLeave={onHoverLeave}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                );
              }}
            </Droppable>
            <div style={{ height: 60 }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskListView;
