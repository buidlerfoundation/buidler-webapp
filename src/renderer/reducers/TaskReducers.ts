import { AnyAction, Reducer } from "redux";
import { TaskData } from "renderer/models";
import actionTypes from "../actions/ActionTypes";
import { sortPinPost } from "../helpers/TaskHelper";

type TaskReducerState = {
  taskData: {
    [key: string]: {
      archivedCount: number;
      tasks: Array<TaskData>;
      archivedTasks: Array<TaskData>;
      canMoreTask: boolean;
      canMoreArchivedTask: boolean;
    };
  };
  apiController?: AbortController | null;
};

const initialState: TaskReducerState = {
  taskData: {},
  apiController: null,
};

const taskReducers: Reducer<TaskReducerState, AnyAction> = (
  state = initialState,
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.RECEIVE_MESSAGE: {
      const { data, currentChannelId } = payload;
      const newTasks = state.taskData[currentChannelId]?.tasks;
      if (!newTasks || data.entity_type !== "post") {
        return {
          ...state,
        };
      }
      return {
        ...state,
        taskData: {
          ...state.taskData,
          [currentChannelId]: {
            ...state.taskData[currentChannelId],
            tasks: newTasks.map((el) => {
              if (el.task_id === data.entity_id) {
                return {
                  ...el,
                  total_messages: `${parseInt(el.total_messages || "0") + 1}`,
                  latest_reply_senders: [
                    data.sender_id,
                    ...(el.latest_reply_senders?.filter(
                      (uId) => uId !== data.sender_id
                    ) || []),
                  ],
                  latest_reply_message_at: data.createdAt,
                };
              }
              return el;
            }),
          },
        },
      };
    }
    case actionTypes.LOGOUT: {
      return initialState;
    }
    case actionTypes.ARCHIVED_TASK_SUCCESS: {
      const { channelId, res, before } = payload;
      return {
        ...state,
        taskData: {
          ...state.taskData,
          [channelId]: {
            ...(state.taskData[channelId] || {}),
            archivedTasks: !before
              ? res
              : [...(state.taskData[channelId]?.archivedTasks || []), ...res],
            canMoreArchivedTask: res.length === 10,
          },
        },
      };
    }
    case actionTypes.TASK_REQUEST: {
      return {
        ...state,
        apiController: payload.controller,
      };
    }
    case actionTypes.TASK_SUCCESS: {
      const { channelId, tasks, before } = payload;
      return {
        ...state,
        taskData: {
          ...state.taskData,
          [channelId]: {
            ...(state.taskData[channelId] || {}),
            tasks: !before
              ? tasks
              : [...(state.taskData[channelId]?.tasks || []), ...tasks],
            canMoreTask: tasks.length === 10,
          },
        },
        apiController: null,
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
            ...state.taskData[channelId],
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
      const { taskId, data, channelId } = payload;
      if (!state.taskData[channelId]) return state;
      const { tasks, archivedTasks } = state.taskData[channelId];
      let newTasks = [...(tasks || [])];
      let newArchivedTasks = [...(archivedTasks || [])];
      const task =
        newTasks.find((t) => t.task_id === taskId) ||
        newArchivedTasks.find((t) => t.task_id === taskId);
      const taskStatus = data?.status || task?.status;
      if (taskStatus === "archived") {
        newTasks = newTasks.filter((t) => t.task_id !== taskId);
        newArchivedTasks = newArchivedTasks.filter((t) => t.task_id !== taskId);
        newArchivedTasks.push({ ...task, ...data });
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
            ...state.taskData[channelId],
            tasks: newTasks.sort(sortPinPost),
            archivedTasks: newArchivedTasks.sort(sortPinPost),
          },
        },
      };
    }
    case actionTypes.DROP_TASK: {
      const { channelId, result, upVote } = payload;
      const { draggableId } = result;
      const { tasks } = state.taskData[channelId];
      return {
        ...state,
        taskData: {
          ...state.taskData,
          [channelId]: {
            ...(state.taskData[channelId] || {}),
            tasks: tasks
              .map((el) => {
                if (el.task_id === draggableId) {
                  el.up_votes = upVote;
                }
                return el;
              })
              .sort(sortPinPost),
          },
        },
      };
    }
    default:
      return state;
  }
};

export default taskReducers;
