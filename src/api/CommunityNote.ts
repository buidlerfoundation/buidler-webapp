import {
  IDashboardLink,
  INote,
  IRating,
  IReport,
  IReportCategory,
} from "models/CommunityNote";
import Caller from "./Caller";

export const getListNotesByUrl = (params: {
  url: string;
  page: number;
  limit: number;
}) =>
  Caller.get<INote[]>(
    `community-notes/notes?${new URLSearchParams({
      url: params.url,
      page: `${params.page}`,
      limit: `${params.limit}`,
    })}`
  );

export const submitNote = (payload: any) =>
  Caller.post<INote>(`community-notes/notes`, payload);

export const submitRating = (noteId: string, body: any) =>
  Caller.post<IRating>(`community-notes/notes/${noteId}/ratings`, body);

export const updateRating = (noteId: string, body: any) =>
  Caller.put<IRating>(`community-notes/notes/${noteId}/ratings`, body);

export const deleteRating = (noteId: string) =>
  Caller.delete(`community-notes/notes/${noteId}/ratings`);

export const getReports = () =>
  Caller.get<IReport[]>("community-notes/reports");

export const getReportCategories = () =>
  Caller.get<IReportCategory[]>("community-notes/report-categories");

export const getDashboardLinks = (status: string) =>
  Caller.get<IDashboardLink[]>(
    `community-notes/dashboard/notes?note_status=${status}`
  );

export const getDashboardLinksReportOnly = () =>
  Caller.get<IDashboardLink[]>("community-notes/dashboard/reports");

export const createReport = (body: any) =>
  Caller.post("community-notes/reports", body);

export const getReportsByUrl = (url: string) =>
  Caller.get<IReport[]>(
    `community-notes/reports?${new URLSearchParams({ url })}`
  );

export const getNotesByUrl = (url: string) =>
  Caller.get<INote[]>(`community-notes/notes?${new URLSearchParams({ url })}`);

export const getDashboardLinkDetail = (url: string) =>
  Caller.get<IDashboardLink>(
    `community-notes/dashboard?${new URLSearchParams({ url })}`
  );
