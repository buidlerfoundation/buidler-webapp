"use client";

import api from "api";
import useAppDispatch from "hooks/useAppDispatch";
import { useParams, useRouter } from "next/navigation";
import React, { memo, useEffect, useMemo } from "react";
import { COMMUNITY_NOTE_ACTION } from "reducers/CommunityNoteReducers";

const DashboardByNoteId = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams<{ note_id: string }>();
  const noteId = useMemo(() => params.note_id, [params.note_id]);
  useEffect(() => {
    if (noteId) {
      api
        .getDashboardLinkByNoteId(noteId)
        .then((res) => {
          if (res.success) {
            dispatch(
              COMMUNITY_NOTE_ACTION.updateModalRateNote({
                detail: true,
                note: res.data?.note,
                metadata: res?.data?.metadata,
              })
            );
          }
        })
        .finally(() => {
          router.replace("/community-notes");
        });
    }
  }, [dispatch, noteId, router]);
  return null;
};

export default memo(DashboardByNoteId);
