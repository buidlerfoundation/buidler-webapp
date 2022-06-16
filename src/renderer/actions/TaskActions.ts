import { Dispatch } from 'redux';
import api from '../api';
import { isFilterStatus } from '../helpers/TaskHelper';
import actionTypes from './ActionTypes';
import moment from 'moment';
import store from '../store';
import toast from 'react-hot-toast';

export const getTaskFromUser =
  (userId: string, channelId: string, teamId: string) =>
  async (dispatch: Dispatch) => {
    dispatch({ type: actionTypes.TASK_REQUEST, payload: { channelId } });
    try {
      const [taskRes, archivedCountRes] = await Promise.all([
        api.getTaskFromUser(userId, teamId),
        api.getArchivedTaskCountFromUser(userId, teamId),
      ]);
      if (taskRes.statusCode === 200 && archivedCountRes.statusCode === 200) {
        dispatch({
          type: actionTypes.TASK_SUCCESS,
          payload: {
            channelId,
            tasks: taskRes.data,
            archivedCount: archivedCountRes.total,
          },
        });
      } else {
        dispatch({
          type: actionTypes.TASK_FAIL,
          payload: { message: 'Error', taskRes, archivedCountRes },
        });
      }
    } catch (e) {
      dispatch({ type: actionTypes.TASK_FAIL, payload: { message: e } });
    }
  };

export const getTasks = (channelId: string) => async (dispatch: Dispatch) => {
  dispatch({ type: actionTypes.TASK_REQUEST, payload: { channelId } });
  try {
    const [taskRes, archivedCountRes] = await Promise.all([
      api.getTasks(channelId),
      api.getArchivedTaskCount(channelId),
    ]);
    if (taskRes.statusCode === 200 && archivedCountRes.statusCode === 200) {
      dispatch({
        type: actionTypes.TASK_SUCCESS,
        payload: {
          channelId,
          tasks: taskRes.data,
          archivedCount: archivedCountRes.total,
        },
      });
    } else {
      dispatch({
        type: actionTypes.TASK_FAIL,
        payload: { message: 'Error', taskRes, archivedCountRes },
      });
    }
  } catch (e) {
    dispatch({ type: actionTypes.TASK_FAIL, payload: { message: e } });
  }
};

export const dropTask =
  (result: any, channelId: string, upVote: number, teamId: string) =>
  async (dispatch: Dispatch) => {
    const { source, destination, draggableId } = result;
    dispatch({
      type: actionTypes.DROP_TASK,
      payload: { result, channelId, upVote, teamId },
    });
    if (!destination) return;
    if (source.droppableId === destination.droppableId) {
      api.updateTask({ up_votes: upVote, team_id: teamId }, draggableId);
    } else if (!isFilterStatus(destination.droppableId)) {
      const newDate = moment(destination.droppableId).format(
        'YYYY-MM-DD HH:mm:ss.SSSZ'
      );
      if (source.droppableId === 'archived') {
        api.updateTask(
          {
            due_date: newDate,
            up_votes: upVote,
            status: 'todo',
            team_id: teamId,
          },
          draggableId
        );
      } else {
        api.updateTask(
          { due_date: newDate, up_votes: upVote, team_id: teamId },
          draggableId
        );
      }
    } else {
      const newStatus = destination.droppableId;
      api.updateTask(
        { status: newStatus, up_votes: upVote, team_id: teamId },
        draggableId
      );
    }
  };

export const deleteTask =
  (taskId: string, channelId: string) => async (dispatch: Dispatch) => {
    dispatch({
      type: actionTypes.DELETE_TASK_REQUEST,
      payload: { taskId, channelId },
    });
    try {
      const res = await api.deleteTask(taskId);
      dispatch({
        type: actionTypes.DELETE_TASK_SUCCESS,
        payload: { taskId, res },
      });
    } catch (e) {
      dispatch({
        type: actionTypes.DELETE_TASK_FAIL,
        payload: { message: e },
      });
    }
  };

export const createTask =
  (channelId: string, body: any) => async (dispatch: Dispatch) => {
    dispatch({
      type: actionTypes.CREATE_TASK_REQUEST,
      payload: { channelId, body },
    });
    try {
      const data = body;
      delete data.attachments;
      const res = await api.createTask(data);
      if (res.statusCode === 200) {
        toast.success('Created!');
      }
    } catch (e) {
      dispatch({
        type: actionTypes.CREATE_TASK_FAIL,
        payload: { message: e },
      });
    }
  };

export const updateTask =
  (taskId: string, channelId: string, data: any) =>
  async (dispatch: Dispatch) => {
    const user: any = store.getState()?.user;
    const { currentChannel } = user || {};
    try {
      if (data.channel) {
        data.channel_ids = data.channel.map((c: any) => c.channel_id);
      }
      const res = await api.updateTask(
        { ...data, assignee: null, channel: null, task_attachment: null },
        taskId
      );
      if (res.statusCode === 200) {
        dispatch({
          type: actionTypes.UPDATE_TASK_REQUEST,
          payload: {
            taskId,
            data,
            channelId,
            direct_channel: currentChannel?.user?.direct_channel,
          },
        });
      }
      return res.statusCode === 200;
    } catch (e) {
      dispatch({
        type: actionTypes.UPDATE_TASK_FAIL,
        payload: {
          message: e,
        },
      });
      return false;
    }
  };

export const getArchivedTasks =
  (channelId: string, userId?: string, teamId?: string) =>
  async (dispatch: Dispatch) => {
    dispatch({
      type: actionTypes.ARCHIVED_TASK_REQUEST,
      payload: {
        channelId,
        userId,
      },
    });
    try {
      const res = userId
        ? await api.getArchivedTaskFromUser(userId, teamId)
        : await api.getArchivedTasks(channelId);
      dispatch({
        type: actionTypes.ARCHIVED_TASK_SUCCESS,
        payload: {
          res: res.data,
          channelId,
        },
      });
    } catch (e) {
      dispatch({
        type: actionTypes.ARCHIVED_TASK_FAIL,
        payload: {
          message: e,
        },
      });
    }
  };
