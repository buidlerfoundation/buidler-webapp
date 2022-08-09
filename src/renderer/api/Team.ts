import { UserData } from "renderer/models";
import ApiCaller from "./ApiCaller";
import Caller from "./Caller";

// {
//   "team_display_name": "Today",
//   "team_url": "today",
//   "team_icon": "https://geographical.co.uk/media/k2/items/cache/8e4e30c8fc08507de1b0b5afc7d32a85_XL.jpg"
// }

export const createTeam = (body: any) => ApiCaller.post("team", body);

export const getTeamUsers = (teamId: string, controller?: AbortController) =>
  Caller.get<Array<UserData>>(`team/${teamId}/members`, undefined, controller);

export const invitation = (teamId: string) =>
  Caller.post<{ invitation_url: string }>(`team/invitation/${teamId}/members`);

export const updateTeam = (teamId: string, body: any) =>
  ApiCaller.put(`team/${teamId}`, body);

export const removeTeam = (teamId: string) =>
  ApiCaller.delete(`team/${teamId}`);
