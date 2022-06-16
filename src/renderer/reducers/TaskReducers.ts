import moment from 'moment';
import { AnyAction, Reducer } from 'redux';
import { TaskData } from 'renderer/models';
import actionTypes from '../actions/ActionTypes';
import { isFilterStatus } from '../helpers/TaskHelper';

type TaskReducerState = {
  taskData: {
    [key: string]: {
      archivedCount: number;
      tasks: Array<TaskData>;
      archivedTasks: Array<TaskData>;
    };
  };
};

const initialState: TaskReducerState = {
  taskData: {},
};

const taskReducers: Reducer<TaskReducerState, AnyAction> = (
  state = initialState,
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.LOGOUT: {
      return {
        taskData: {},
      };
    }
    case actionTypes.ARCHIVED_TASK_SUCCESS: {
      const { channelId, res } = payload;
      return {
        ...state,
        taskData: {
          ...state.taskData,
          [channelId]: {
            ...(state.taskData[channelId] || {}),
            archivedTasks: res,
            archivedCount: null,
          },
        },
      };
    }
    case actionTypes.TASK_SUCCESS: {
      const { channelId, tasks, archivedCount } = payload;
      return {
        ...state,
        taskData: {
          ...state.taskData,
          [channelId]: {
            ...(state.taskData[channelId] || {}),
            tasks,
            archivedCount,
          },
        },
      };
    }
    case actionTypes.DELETE_TASK_REQUEST: {
      const { taskId, channelId } = payload;
      const current = state.taskData?.[channelId] || {};
      const { tasks, archivedTasks } = current;
      const newTasks = tasks ? tasks.filter((t) => t.task_id !== taskId) : [];
      const newArchivedTasks = archivedTasks
        ? archivedTasks.filter((t) => t.task_id !== taskId)
        : [];

      return {
        ...state,
        taskData: {
          ...state.taskData,
          [channelId]: {
            tasks: newTasks,
            archivedTasks: newArchivedTasks,
          },
        },
      };
    }
    case actionTypes.CREATE_TASK_SUCCESS: {
      const { res, channelId } = payload;
      const currentTasks = state.taskData?.[channelId]?.tasks || [];
      const upVotes =
        currentTasks.length > 0
          ? Math.max(...currentTasks.map((t) => t.up_votes))
          : 0;
      return {
        ...state,
        taskData: {
          ...state.taskData,
          [channelId]: {
            ...state.taskData[channelId],
            tasks: [
              { ...res, isHighLight: true, up_votes: upVotes + 1 },
              ...(state.taskData[channelId]?.tasks || []),
            ],
          },
        },
      };
    }
    case actionTypes.UPDATE_TASK_REQUEST: {
      const { taskId, data, channelId, direct_channel, channelUserId } =
        payload;
      if (!state.taskData[channelId]) return state;
      const { tasks, archivedTasks, archivedCount } = state.taskData[channelId];
      let newTasks = [...(tasks || [])];
      let newArchivedTasks = [...(archivedTasks || [])];
      let newArchivedCount = archivedCount;
      const task =
        newTasks.find((t) => t.task_id === taskId) ||
        newArchivedTasks.find((t) => t.task_id === taskId);
      const taskStatus = data?.status || task?.status;
      const { channel } = data;
      if (channelUserId && channelUserId === data.assignee_id) {
        if (taskStatus === 'archived') {
          if (newArchivedCount !== null) {
            newArchivedCount += 1;
          } else {
            newArchivedTasks = newArchivedTasks.filter(
              (t) => t.task_id !== taskId
            );
            newArchivedTasks.push({ ...task, ...data });
          }
        } else {
          newTasks = newTasks.map((t) => {
            if (t.task_id !== taskId) return t;
            return { ...t, ...data };
          });
        }
      } else if (
        (!direct_channel &&
          channel != null &&
          !channel.find((c) => c.channel_id === channelId)) ||
        (channelUserId && channelUserId !== data.assignee_id) ||
        (direct_channel && (data.assignee_id || data.assignee_id === null))
      ) {
        newTasks = newTasks.filter((t) => t.task_id !== taskId);
        newArchivedTasks = newArchivedTasks.filter((t) => t.task_id !== taskId);
      } else if (taskStatus === 'archived') {
        newTasks = newTasks.filter((t) => t.task_id !== taskId);
        if (newArchivedCount !== null) {
          newArchivedCount += 1;
        } else {
          newArchivedTasks = newArchivedTasks.filter(
            (t) => t.task_id !== taskId
          );
          newArchivedTasks.push({ ...task, ...data });
        }
      } else {
        const archivedTask = newArchivedTasks.find((t) => t.task_id === taskId);
        if (archivedTask) {
          newTasks.push({ ...archivedTask, ...data });
          newArchivedTasks = newArchivedTasks.filter(
            (t) => t.task_id !== taskId
          );
        } else {
          newTasks = newTasks.map((t) => {
            if (t.task_id !== taskId) return t;
            return { ...t, ...data };
          });
          newArchivedTasks = newArchivedTasks.map((t) => {
            if (t.task_id !== taskId) return t;
            return { ...t, ...data };
          });
        }
      }
      return {
        ...state,
        taskData: {
          ...state.taskData,
          [channelId]: {
            tasks: newTasks,
            archivedCount: newArchivedCount,
            archivedTasks: newArchivedTasks,
          },
        },
      };
    }
    case actionTypes.DROP_TASK: {
      const { channelId, result, upVote } = payload;
      const { source, destination, draggableId } = result;
      const { tasks, archivedTasks, archivedCount } = state.taskData[channelId];
      let newTasks = tasks;
      let newArchivedTasks = archivedTasks;
      let newArchivedCount = archivedCount;
      if (!isFilterStatus(destination.droppableId)) {
        const newDate = moment(destination.droppableId).format(
          'YYYY-MM-DD HH:mm:ss.SSSZ'
        );
        if (source.droppableId === 'archived') {
          const task: any = archivedTasks.find((t) => t.task_id === draggableId);
          newArchivedTasks = archivedTasks.filter(
            (t) => t.task_id !== draggableId
          );
          newTasks = [
            { ...task, status: 'todo', due_date: newDate, up_votes: upVote },
            ...tasks,
          ];
        } else {
          newTasks = tasks.map((t) => {
            if (t.task_id === draggableId) {
              return {
                ...t,
                due_date: newDate,
                up_votes: upVote,
              };
            }
            return t;
          });
        }
      } else {
        const newStatus = destination.droppableId;
        const oldStatus = source.droppableId;
        if (newStatus === 'archived') {
          const task: any = tasks.find((t) => t.task_id === draggableId);
          newTasks = tasks.filter((t) => t.task_id !== draggableId);
          if (archivedTasks != null) {
            newArchivedTasks = [
              { ...task, status: newStatus, up_votes: upVote },
              ...archivedTasks,
            ];
          } else {
            newArchivedCount = archivedCount + 1;
          }
        } else if (oldStatus === 'archived') {
          const task: any = archivedTasks.find((t) => t.task_id === draggableId);
          newArchivedTasks = archivedTasks.filter(
            (t) => t.task_id !== draggableId
          );
          newTasks = [
            { ...task, status: newStatus, up_votes: upVote },
            ...tasks,
          ];
        } else {
          newTasks = tasks.map((t) => {
            if (t.task_id === draggableId) {
              t.status = newStatus;
              t.up_votes = upVote;
            }
            return t;
          });
        }
      }
      return {
        ...state,
        taskData: {
          ...state.taskData,
          [channelId]: {
            ...(state.taskData[channelId] || {}),
            tasks: newTasks,
            archivedTasks: newArchivedTasks,
            archivedCount: newArchivedCount,
          },
        },
      };
    }
    default:
      return state;
  }
};

export default taskReducers;
