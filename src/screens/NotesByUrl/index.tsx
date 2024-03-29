"use client";

import React, { memo, useCallback, useMemo } from "react";
import styles from "./index.module.scss";
import useQuery from "hooks/useQuery";
import useNotesData from "hooks/useNotesData";
import LoadingItem from "shared/LoadingItem";
import Spinner from "shared/Spinner";
import { INote } from "models/CommunityNote";
import NoteItem from "shared/DashboardLinkItem/NoteItem";
import useAppDispatch from "hooks/useAppDispatch";
import { COMMUNITY_NOTE_ACTION } from "reducers/CommunityNoteReducers";
import useDashboardLinkDetailData from "hooks/useDashboardLinkDetailData";
import { useParams } from "next/navigation";

interface INotesByUrl {
  searchUrl?: string;
}

const NotesByUrl = ({ searchUrl }: INotesByUrl) => {
  const dispatch = useAppDispatch();
  const params = useParams<{ url: string }>();
  const exploreUrl = useMemo(() => {
    if (searchUrl !== undefined) return searchUrl;
    const url = params.url;
    if (!url) return "";
    return decodeURIComponent(url);
  }, [params.url, searchUrl]);
  const notesData = useNotesData(exploreUrl);
  const dashboardDetail = useDashboardLinkDetailData(exploreUrl);
  const notes = useMemo(() => notesData?.data || [], [notesData?.data]);
  const onOpenRateNote = useCallback(
    (note?: INote) => {
      dispatch(
        COMMUNITY_NOTE_ACTION.updateModalRateNote({
          note,
          metadata: dashboardDetail?.data?.metadata,
        })
      );
    },
    [dashboardDetail?.data?.metadata, dispatch]
  );
  const renderNote = useCallback(
    (note: INote) => (
      <NoteItem
        key={note.id}
        note={note}
        onOpenRateNote={onOpenRateNote}
        metadata={dashboardDetail?.data?.metadata}
      />
    ),
    [dashboardDetail?.data?.metadata, onOpenRateNote]
  );
  return (
    <div className="page-container">
      {notes.length > 0 ? (
        <>
          {notes.map(renderNote)}
          {notesData?.loadMore && <LoadingItem />}
        </>
      ) : notesData?.loading ? (
        <Spinner size={30} />
      ) : null}
    </div>
  );
};

export default memo(NotesByUrl);
