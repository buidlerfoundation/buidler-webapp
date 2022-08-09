import { TaskData } from "renderer/models";
import ApiCaller from "./ApiCaller";
import Caller from "./Caller";

// {
//   "title": "notification not working",
//   "notes": "trên desktop app không nhận được push notification",
//   "status": 0,
//   "due_date": "2021-04-08T03:09:32.209Z",
//   "channel_id": "{{CHANNEL_ID}}",
//   "member_id": "{{USER_ID}}"
// }

export const createTask = (body: any) => ApiCaller.post("task", body);

export const updateTask = (body: any, id: string) =>
  ApiCaller.put(`task/${id}`, body);

export const deleteTask = (id: string) => ApiCaller.delete(`task/${id}`);

export const getTasks = (channelId: string, controller?: AbortController) =>
  Caller.get<Array<TaskData>>(`tasks/${channelId}`, undefined, controller);

export const getArchivedTasks = (channelId: string) =>
  ApiCaller.get(`tasks/${channelId}?archived=true`);

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
  ApiCaller.get(`task/${taskId}/task_activity`);

export const getTeamActivity = (teamId: string) =>
  ApiCaller.get(`tasks/${teamId}/task_activities`);

export const getTaskFromUser = (userId: string, teamId: string) =>
  ApiCaller.get(`tasks/${userId}/user/${teamId}?archived=false`);

export const getArchivedTaskFromUser = (userId: string, teamId?: string) =>
  ApiCaller.get(`tasks/${userId}/user/${teamId}?archived=true`);

export const getArchivedTaskCountFromUser = (userId: string, teamId: string) =>
  Caller.get<{ total: number }>(
    `task/${userId}/user/${teamId}/count?archived=true`
  );
