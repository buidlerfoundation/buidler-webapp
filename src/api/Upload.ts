import toast from "react-hot-toast";
import AppConfig from "common/AppConfig";
import Caller from "./Caller";
import { BaseDataApi, FileApiData } from "models/User";
import { AttachmentData } from "models/Message";

export const uploadFile = (
  teamId?: string,
  attachmentId?: string,
  file?: any,
  messageEntityType?: string,
  fileId?: string
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
  if (messageEntityType) {
    data.append("message_entity_type", messageEntityType);
  }
  if (fileId) {
    data.append("file_id", fileId);
  }
  data.append("file", file);
  return Caller.post<FileApiData>(`file`, data);
};

export const removeFile = (fileId: string) => Caller.delete(`file/${fileId}`);

export const getSpaceFile = (spaceId: string) =>
  Caller.get<Array<AttachmentData>>(`file/space/${spaceId}`);

export const getChannelFile = (channelId: string) =>
  Caller.get<Array<AttachmentData>>(`file/channel/${channelId}`);
