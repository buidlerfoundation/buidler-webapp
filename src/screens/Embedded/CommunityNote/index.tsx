"use client";

import React, { memo, useCallback, useEffect, useMemo } from "react";
import styles from "./index.module.scss";
import useQuery from "hooks/useQuery";
import useDashboardLinkDetailData from "hooks/useDashboardLinkDetailData";
import Metadata from "shared/DashboardLinkItem/Metadata";
import NoteItem from "shared/DashboardLinkItem/NoteItem";
import Attribute from "shared/DashboardLinkItem/Attribute";
import useAppDispatch from "hooks/useAppDispatch";
import { getDashboardLinkByUrl } from "reducers/CommunityNoteReducers";

const CommunityNoteEmbedded = () => {
  const dispatch = useAppDispatch();
  const query = useQuery();
  const exploreUrl = useMemo(() => query.get("url") || "", [query]);
  const dashboardDetail = useDashboardLinkDetailData(exploreUrl);
  const onOpenRateNote = useCallback(() => {}, []);
  useEffect(() => {
    if (exploreUrl) {
      dispatch(getDashboardLinkByUrl({ url: exploreUrl }));
    }
  }, [dispatch, exploreUrl]);
  return (
    <div className={styles.container}>
      {dashboardDetail?.data && (
        <div className={styles.body}>
          <Metadata
            url={dashboardDetail?.data?.url}
            metadata={dashboardDetail?.data?.metadata}
          />
          <NoteItem
            onOpenRateNote={onOpenRateNote}
            metadata={dashboardDetail?.data?.metadata}
          />
          <Attribute
            totalNotes={dashboardDetail?.data?.total_notes}
            totalReports={dashboardDetail?.data?.total_reports}
            url={encodeURIComponent(dashboardDetail?.data?.url)}
            embedded
          />
        </div>
      )}
    </div>
  );
};

export default memo(CommunityNoteEmbedded);
