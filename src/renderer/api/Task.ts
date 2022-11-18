import { TaskData } from "renderer/models";
import Caller from "./Caller";

export const uploadToIPFS = (taskId: string, body: any) =>
  Caller.post<TaskData>(`task/${taskId}/ipfs`, body);

export const createTask = (body: any) => Caller.post("task", body);

export const updateTask = (body: any, id: string) =>
  Caller.put(`task/${id}`, body);

export const deleteTask = (id: string) => Caller.delete(`task/${id}`);

export const getTasks = (
  channelId: string,
  id?: string,
  limit?: number,
  controller?: AbortController
) => {
  let uri = `tasks/${channelId}?pagination[limit]=${limit || 10}`;
  if (id) {
    uri += `&pagination[before]=${id}`;
  }
  return Caller.get<Array<TaskData>>(uri, undefined, controller);
};

export const getArchivedTasks = (
  channelId: string,
  id?: string,
  limit?: number
) => {
  let uri = `tasks/${channelId}?archived=true&pagination[limit]=${limit || 10}`;
  if (id) {
    uri += `&pagination[before]=${id}`;
  }
  return Caller.get<TaskData[]>(uri);
};

export const getArchivedTaskCount = (
  channelId: string,
  controller?: AbortController
) =>
  Caller.get<{ total: number }>(
    `task/${channelId}/count?archived=true`,
    undefined,
    controller
  );

export const getTaskActivity = (taskId: string) =>
  Caller.get(`task/${taskId}/task_activity`);

export const getTeamActivity = (teamId: string) =>
  Caller.get(`tasks/${teamId}/task_activities`);

export const getTaskFromUser = (userId: string, teamId: string) =>
  Caller.get(`tasks/${userId}/user/${teamId}?archived=false`);

export const getArchivedTaskFromUser = (userId: string, teamId?: string) =>
  Caller.get(`tasks/${userId}/user/${teamId}?archived=true`);

export const getArchivedTaskCountFromUser = (userId: string, teamId: string) =>
  Caller.get<{ total: number }>(
    `task/${userId}/user/${teamId}/count?archived=true`
  );

export const getPostById = (postId: string) =>
  Caller.get<TaskData>(`task/${postId}`);
