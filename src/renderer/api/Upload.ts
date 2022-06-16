import { AttachmentData, FileApiData } from "renderer/models";
import ApiCaller from "./ApiCaller";
import Caller from "./Caller";

export const uploadFile = (
  teamId?: string,
  attachmentId?: string,
  file?: any
) => {
  const data = new FormData();
  if (teamId) {
    data.append("team_id", teamId);
  }
  if (attachmentId) {
    data.append("attachment_id", attachmentId);
  }
  data.append("file", file);
  return Caller.post<FileApiData>(`file`, data);
};

export const removeFile = (fileId: string) =>
  ApiCaller.delete(`file/${fileId}`);

export const getSpaceFile = (spaceId: string) =>
  Caller.get<Array<AttachmentData>>(`file/space/${spaceId}`);

export const getChannelFile = (channelId: string) =>
  Caller.get<Array<AttachmentData>>(`file/channel/${channelId}`);
