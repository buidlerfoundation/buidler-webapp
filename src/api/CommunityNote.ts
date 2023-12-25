import { INote, IRating } from "models/CommunityNote";
import Caller from "./Caller";

export const getListNotesByUrl = (params: {
  url: string;
  page: number;
  limit: number;
}) =>
  Caller.get<INote[]>(
    `community-notes?${new URLSearchParams({
      url: params.url,
      page: `${params.page}`,
      limit: `${params.limit}`,
    })}`
  );

export const submitRating = (noteId: string, body: any) =>
  Caller.post<IRating>(`community-notes/${noteId}/ratings`, body);

export const deleteRating = (noteId: string) =>
  Caller.delete(`community-notes/${noteId}/ratings`);
