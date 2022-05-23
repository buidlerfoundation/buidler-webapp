import ApiCaller from './ApiCaller';

// {
//   "team_display_name": "Today",
//   "team_url": "today",
//   "team_icon": "https://geographical.co.uk/media/k2/items/cache/8e4e30c8fc08507de1b0b5afc7d32a85_XL.jpg"
// }

export const createTeam = (body: any) => ApiCaller.post('team', body);

export const getTeamUsers = (teamId: string) =>
  ApiCaller.get(`team/${teamId}/members`);

export const invitation = (teamId: string) =>
  ApiCaller.post(`team/invitation/${teamId}/members`);

export const updateTeam = (teamId: string, body: any) =>
  ApiCaller.put(`team/${teamId}`, body);

export const removeTeam = (teamId: string) =>
  ApiCaller.delete(`team/${teamId}`);
