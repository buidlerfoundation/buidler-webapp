import {
  IDashboardLink,
  INote,
  IRating,
  IReport,
  IReportCategory,
} from "models/CommunityNote";
import Caller from "./Caller";
import { ICommunityNoteInvitation } from "models/FC";
import { IPagingParams } from "models/User";

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

export const getDashboardLinks = (params: {
  status: string;
  page: number;
  limit: number;
}) =>
  Caller.get<IDashboardLink[]>(
    `community-notes/dashboard/notes?${new URLSearchParams({
      "note_status[]": params.status,
      page: `${params.page}`,
      limit: `${params.limit}`,
    })}`
  );

export const getDashboardLinksReportOnly = (params: {
  page: number;
  limit: number;
}) =>
  Caller.get<IDashboardLink[]>(
    `community-notes/dashboard/reports?${new URLSearchParams({
      page: `${params.page}`,
      limit: `${params.limit}`,
    })}`
  );

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

export const requestCommunityNoteWriter = () =>
  Caller.post<ICommunityNoteInvitation>("community-notes/invitations");

export const getMyDashboardLinkNotes = (params: IPagingParams) =>
  Caller.get<IDashboardLink[]>(
    `community-notes/contributors/notes?${new URLSearchParams({
      page: `${params.page}`,
      limit: `${params.limit}`,
    })}`
  );

export const getMyDashboardLinkRatings = (params: IPagingParams) =>
  Caller.get<IDashboardLink[]>(
    `community-notes/contributors/ratings?${new URLSearchParams({
      page: `${params.page}`,
      limit: `${params.limit}`,
    })}`
  );
