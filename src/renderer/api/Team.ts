import { DirectCommunity } from "renderer/common/AppConfig";
import { ProfileApiData, UserData } from "renderer/models";
import Caller from "./Caller";

// {
//   "team_display_name": "Today",
//   "team_url": "today",
//   "team_icon": "https://geographical.co.uk/media/k2/items/cache/8e4e30c8fc08507de1b0b5afc7d32a85_XL.jpg"
// }

export const createTeam = (body: any) => Caller.post("team", body);

export const getDirectChannelUsers = (controller?: AbortController) =>
  Caller.get<UserData[]>(
    "direct-channel/members?channel_types[]=Direct&channel_types[]=Multiple Direct",
    undefined,
    controller
  );

export const getTeamUsers = (teamId: string, controller?: AbortController) => {
  if (teamId === DirectCommunity.team_id)
    return getDirectChannelUsers(controller);
  return Caller.get<Array<UserData>>(
    `team/${teamId}/members`,
    undefined,
    controller
  );
};

export const invitation = (teamId: string) =>
  Caller.post<{ invitation_url: string }>(`team/invitation/${teamId}/members`);

export const updateTeam = (teamId: string, body: any) =>
  Caller.put(`team/${teamId}`, body);

export const removeTeam = (teamId: string) => Caller.delete(`team/${teamId}`);

export const getProfile = (name: string) =>
  Caller.get<ProfileApiData>(`profiles/${name}/extensions`);
