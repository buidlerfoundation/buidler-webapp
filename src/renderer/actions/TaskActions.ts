import { Dispatch } from "redux";
import api from "../api";
import actionTypes from "./ActionTypes";
import store from "../store";
import { getCookie } from "renderer/common/Cookie";
import { AsyncKey, LoginType } from "renderer/common/AppConfig";
import { ethers, utils } from "ethers";
import WalletConnectUtils from "renderer/services/connectors/WalletConnectUtils";
import toast from "react-hot-toast";

export const uploadToIPFS =
  (pinPostId: string, channelId: string) => async (dispatch: Dispatch) => {
    dispatch({
      type: actionTypes.UPDATE_TASK_REQUEST,
      payload: {
        taskId: pinPostId,
        data: { uploadingIPFS: true },
        channelId,
      },
    });
    dispatch({
      type: actionTypes.TOGGLE_MODAL_CONFIRM_SIGN_MESSAGE,
      payload: true,
    });
    try {
      const loginType = await getCookie(AsyncKey.loginType);
      const timestamp = new Date().getTime();
      const message = `Nonce: ${timestamp}`;
      let signature = "";
      if (loginType === LoginType.Metamask) {
        if (!window.ethereum?.selectedAddress) {
          await window.ethereum?.request({
            method: "eth_requestAccounts",
          });
        }
        const metamaskProvider: any = window.ethereum;
        const provider = new ethers.providers.Web3Provider(metamaskProvider);
        const signer = provider.getSigner();
        signature = await signer.signMessage(message);
      } else if (loginType === LoginType.WalletConnect) {
        const { accounts } = WalletConnectUtils.connector || {};
        const address = accounts?.[0];
        const params = [utils.hexlify(utils.toUtf8Bytes(message)), address];
        signature = await WalletConnectUtils.connector?.signPersonalMessage(
          params
        );
      }
      dispatch({
        type: actionTypes.TOGGLE_MODAL_CONFIRM_SIGN_MESSAGE,
        payload: false,
      });
      if (signature) {
        api
          .uploadToIPFS(pinPostId, {
            timestamp,
            signature,
            sign_message: message,
          })
          .catch((error) => {
            toast.error(error.message);
          })
          .finally(() => {
            dispatch({
              type: actionTypes.UPDATE_TASK_REQUEST,
              payload: {
                taskId: pinPostId,
                data: { uploadingIPFS: false },
                channelId,
              },
            });
          });
      }
    } catch (error: any) {
      toast.error(error.message);
      dispatch({
        type: actionTypes.UPDATE_TASK_REQUEST,
        payload: {
          taskId: pinPostId,
          data: { uploadingIPFS: false },
          channelId,
        },
      });
      dispatch({
        type: actionTypes.TOGGLE_MODAL_CONFIRM_SIGN_MESSAGE,
        payload: false,
      });
    }
  };

export const getPinPostDetail =
  (postId: string) => async (dispatch: Dispatch) => {
    dispatch({ type: actionTypes.PP_DETAIL_REQUEST, payload: { postId } });
    try {
      const postRes = await api.getPostById(postId);
      if (postRes.success) {
        dispatch({ type: actionTypes.PP_DETAIL_SUCCESS, payload: postRes });
      } else {
        dispatch({ type: actionTypes.PP_DETAIL_FAIL, payload: postRes });
      }
      return postRes;
    } catch (error: any) {
      const postRes = { success: false, message: error };
      dispatch({
        type: actionTypes.PP_DETAIL_FAIL,
        payload: postRes,
      });
      return postRes;
    }
  };

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
            archivedCount: archivedCountRes.data?.total,
          },
        });
      } else {
        dispatch({
          type: actionTypes.TASK_FAIL,
          payload: { message: "Error", taskRes, archivedCountRes },
        });
      }
    } catch (e) {
      dispatch({ type: actionTypes.TASK_FAIL, payload: { message: e } });
    }
  };

export const getTasks =
  (channelId: string, id?: string) => async (dispatch: Dispatch) => {
    const lastController = store.getState().task.apiController;
    lastController?.abort?.();
    const controller = new AbortController();
    if (id) {
      dispatch({
        type: actionTypes.TASK_MORE,
        payload: { channelId, id, controller: controller },
      });
    } else {
      dispatch({
        type: actionTypes.TASK_REQUEST,
        payload: { channelId, controller: controller },
      });
    }
    try {
      const taskRes = await api.getTasks(channelId, id, undefined, controller);
      if (taskRes.statusCode === 200) {
        dispatch({
          type: actionTypes.TASK_SUCCESS,
          payload: {
            channelId,
            tasks: taskRes.data,
            id,
          },
        });
      } else {
        dispatch({
          type: actionTypes.TASK_FAIL,
          payload: { message: "Error", taskRes },
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
      return res.statusCode === 200;
    } catch (e) {
      dispatch({
        type: actionTypes.CREATE_TASK_FAIL,
        payload: { message: e },
      });
      return false;
    }
  };

export const updateTask =
  (taskId: string, channelId: string, data: any) =>
  async (dispatch: Dispatch) => {
    try {
      if (data.channels) {
        data.channel_ids = data.channels.map((c: any) => c.channel_id);
      }
      const res = await api.updateTask(data, taskId);
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
  (channelId: string, id?: string) => async (dispatch: Dispatch) => {
    if (id) {
      dispatch({
        type: actionTypes.ARCHIVED_TASK_MORE,
        payload: {
          channelId,
          id,
        },
      });
    } else {
      dispatch({
        type: actionTypes.ARCHIVED_TASK_REQUEST,
        payload: {
          channelId,
        },
      });
    }
    try {
      const res = await api.getArchivedTasks(channelId, id);
      dispatch({
        type: actionTypes.ARCHIVED_TASK_SUCCESS,
        payload: {
          res: res.data,
          channelId,
          id,
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
