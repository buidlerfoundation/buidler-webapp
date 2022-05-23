import ApiCaller from './ApiCaller';

export const uploadFile = (
  teamId?: string,
  attachmentId?: string,
  file?: any
) => {
  const data = new FormData();
  if (teamId) {
    data.append('team_id', teamId);
  }
  if (attachmentId) {
    data.append('attachment_id', attachmentId);
  }
  data.append('file', file);
  return ApiCaller.post(`file`, data);
};

export const removeFile = (fileId: string) =>
  ApiCaller.delete(`file/${fileId}`);

export const getSpaceFile = (spaceId: string) =>
  ApiCaller.get(`file/space/${spaceId}`);

export const getChannelFile = (channelId: string) =>
  ApiCaller.get(`file/channel/${channelId}`);
