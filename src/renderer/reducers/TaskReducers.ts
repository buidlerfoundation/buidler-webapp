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
  pinPostDetail?: TaskData | null;
};

const initialState: TaskReducerState = {
  taskData: {},
  apiController: null,
  pinPostDetail: null,
};

const taskReducers: Reducer<TaskReducerState, AnyAction> = (
  state = initialState,
  action
) => {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.PP_DETAIL_SUCCESS: {
      return {
        ...state,
        pinPostDetail: payload.data,
      };
    }
    case actionTypes.DELETE_MESSAGE: {
      const { entityType, channelId, currentChannelId } = payload;
      let pinPostDetail = state.pinPostDetail;
      const newTasks = state.taskData[currentChannelId]?.tasks;
      if ((!newTasks && !pinPostDetail) || entityType !== "post") {
        return {
          ...state,
        };
      }
      if (pinPostDetail && pinPostDetail?.task_id === channelId) {
        pinPostDetail = {
          ...pinPostDetail,
          total_messages: `${
            parseInt(pinPostDetail.total_messages || "0") - 1
          }`,
        };
      }
      return {
        ...state,
        taskData: {
          ...state.taskData,
          [currentChannelId]: {
            ...state.taskData[currentChannelId],
            tasks: newTasks?.map((el) => {
              if (el.task_id === channelId) {
                return {
                  ...el,
                  total_messages: `${parseInt(el.total_messages || "0") - 1}`,
                };
              }
              return el;
            }),
          },
        },
        pinPostDetail,
      };
    }
    case actionTypes.RECEIVE_MESSAGE: {
      const { data, currentChannelId } = payload;
      const newTasks = state.taskData[currentChannelId]?.tasks;
      let pinPostDetail = state.pinPostDetail;
      if ((!newTasks && !pinPostDetail) || data.entity_type !== "post") {
        return {
          ...state,
        };
      }
      if (pinPostDetail && pinPostDetail?.task_id === data.entity_id) {
        pinPostDetail = {
          ...pinPostDetail,
          total_messages: `${
            parseInt(pinPostDetail.total_messages || "0") + 1
          }`,
          latest_reply_senders: [
            data.sender_id,
            ...(pinPostDetail.latest_reply_senders?.filter(
              (uId) => uId !== data.sender_id
            ) || []),
          ],
          latest_reply_message_at: data.createdAt,
        };
      }
      return {
        ...state,
        taskData: {
          ...state.taskData,
          [currentChannelId]: {
            ...state.taskData[currentChannelId],
            tasks: newTasks?.map((el) => {
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
        pinPostDetail,
      };
    }
    case actionTypes.LOGOUT: {
      return initialState;
    }
    case actionTypes.ARCHIVED_TASK_SUCCESS: {
      const { channelId, res, createdAt } = payload;
      return {
        ...state,
        taskData: {
          ...state.taskData,
          [channelId]: {
            ...(state.taskData[channelId] || {}),
            archivedTasks: !createdAt
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
      const { channelId, tasks, createdAt } = payload;
      return {
        ...state,
        taskData: {
          ...state.taskData,
          [channelId]: {
            ...(state.taskData[channelId] || {}),
            tasks: !createdAt
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
      if (data.task_id === state.pinPostDetail?.task_id) {
        state.pinPostDetail = {
          ...state.pinPostDetail,
          ...data,
        };
      }
      if (!data.channels) {
        data.channels = task?.channels || [];
      }
      if (!task?.channels?.find((el) => el.channel_id === channelId)) {
        return {
          ...state,
        };
      }
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
        if (!data.channels.find((el) => el.channel_id === channelId)) {
          newTasks = newTasks.filter((el) => el.task_id !== taskId);
        } else if (!newTasks.find((el) => el.task_id === taskId)) {
          newTasks.push(data);
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
