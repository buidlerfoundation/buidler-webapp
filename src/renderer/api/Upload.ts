import toast from "react-hot-toast";
import AppConfig from "renderer/common/AppConfig";
import { AttachmentData, BaseDataApi, FileApiData } from "renderer/models";
import ApiCaller from "./ApiCaller";
import Caller from "./Caller";

export const uploadFile = (
  teamId?: string,
  attachmentId?: string,
  file?: any
): Promise<BaseDataApi<FileApiData>> => {
  if (file?.size > AppConfig.maximumFileSize) {
    toast.error("Your file upload is too large. Maximum file size 100 MB.");
    return Promise.resolve({ success: false, statusCode: 400 });
  }
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
