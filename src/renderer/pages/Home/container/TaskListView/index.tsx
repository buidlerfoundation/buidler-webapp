import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { getArchivedTasks } from "renderer/actions/TaskActions";
import useAppDispatch from "renderer/hooks/useAppDispatch";
import { TaskData } from "renderer/models";
import images from "../../../../common/images";
import PopoverButton, {
  PopoverItem,
} from "../../../../shared/PopoverButton";
import {
  getGroupTask,
  getToggleState,
  groupTaskByFiltered,
} from "../../../../helpers/TaskHelper";
import "./index.scss";
import TaskGroupItem from "./TaskGroupItem";

type TaskListViewProps = {
  onAddTask: (title: string) => void;
  tasks: Array<TaskData>;
  archivedTasks: Array<TaskData>;
  onUpdateStatus: (task: TaskData, status: string) => void;
  filter: PopoverItem;
  filterData: Array<PopoverItem>;
  onUpdateFilter: (filter: PopoverItem) => void;
  onDeleteTask: (task: TaskData) => void;
  onSelectTask: (task: TaskData) => void;
  teamId: string;
  archivedCount?: number;
  channelId?: string;
  onReplyTask: (task: TaskData) => void;
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
  channelId,
  onReplyTask,
  directUserId,
}: TaskListViewProps) => {
  const dispatch = useAppDispatch();
  const [showArchived, setShowArchived] = useState(false);
  const taskGrouped = useMemo(
    () => groupTaskByFiltered(filter.value, tasks),
    [filter.value, tasks]
  );
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
  const toggleArchived = useCallback(() => {
    if (archivedCount !== null && channelId) {
      dispatch(getArchivedTasks(channelId, directUserId, teamId));
    }
    setShowArchived((current) => !current);
  }, [archivedCount, channelId, directUserId, dispatch, teamId]);
  const shouldArchived = useMemo(
    () => (archivedCount || 0) > 0 || (archivedTasks?.length || 0) > 0,
    [archivedCount, archivedTasks?.length]
  );
  const handleToggleGroupTask = useCallback((key: string) => {
    setToggleState((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }, []);
  const handleMenuSelected = useCallback(
    (menu: PopoverItem, task: TaskData) => {
      if (menu.value === "Delete") {
        onDeleteTask(task);
      }
    },
    [onDeleteTask]
  );
  const renderTaskGroup = useCallback(
    (key) => {
      return (
        <TaskGroupItem
          key={key}
          keyProp={key}
          title={getGroupTask(filter.value, key)}
          filterValue={filter.value}
          onAddTask={onAddTask}
          count={toggleState[key] ? null : taskGrouped[key].length}
          toggle={handleToggleGroupTask}
          tasks={taskGrouped[key]}
          isShow={toggleState[key]}
          channelId={channelId || ""}
          teamId={teamId}
          onSelectTask={onSelectTask}
          onUpdateStatus={onUpdateStatus}
          onMenuSelected={handleMenuSelected}
          onReplyTask={onReplyTask}
        />
      );
    },
    [
      channelId,
      filter.value,
      handleMenuSelected,
      handleToggleGroupTask,
      onAddTask,
      onReplyTask,
      onSelectTask,
      onUpdateStatus,
      taskGrouped,
      teamId,
      toggleState,
    ]
  );
  return (
    <div className="task-list-container" id="task-list">
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
          .filter((key) => taskGrouped[key].length > 0 || key === "pinned")
          .map(renderTaskGroup)}
        {shouldArchived && (
          <TaskGroupItem
            keyProp="archived"
            title="Archived"
            filterValue={filter.value}
            count={showArchived ? null : archivedCount || archivedTasks?.length}
            toggle={toggleArchived}
            tasks={archivedTasks}
            isShow={showArchived}
            channelId={channelId || ""}
            teamId={teamId}
            onSelectTask={onSelectTask}
            onUpdateStatus={onUpdateStatus}
            onMenuSelected={handleMenuSelected}
            onReplyTask={onReplyTask}
          />
        )}
      </div>
    </div>
  );
};

export default memo(TaskListView);
