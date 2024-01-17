"use client";

import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import styles from "./index.module.scss";
import { useExploreContext } from "screens/Main/Layout/CommunityNoteByUrlWrapper";
import useDashboardLinkDetailData from "hooks/useDashboardLinkDetailData";
import NotesByUrl from "screens/NotesByUrl";
import ReportsByUrl from "screens/ReportsByUrl";

const CommunityNoteExplore = () => {
  const { searchUrl } = useExploreContext();
  const dashboardDetail = useDashboardLinkDetailData(searchUrl);
  const [activeTab, setActiveTab] = useState<"note" | "report">("note");
  const activeNote = useMemo(() => activeTab === "note", [activeTab]);
  const activeReport = useMemo(() => activeTab === "report", [activeTab]);
  const totalNotes = useMemo(
    () => dashboardDetail?.data?.total_notes || 0,
    [dashboardDetail?.data?.total_notes]
  );
  const totalReports = useMemo(
    () => dashboardDetail?.data?.total_reports || 0,
    [dashboardDetail?.data?.total_reports]
  );
  const activeNoteTab = useCallback(() => {
    setActiveTab("note");
  }, []);
  const activeReportTab = useCallback(() => {
    setActiveTab("report");
  }, []);
  useEffect(() => {
    if (!totalNotes && totalReports) {
      activeReportTab();
    }
  }, [activeReportTab, totalNotes, totalReports]);
  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        {totalNotes > 0 && (
          <div
            className={`${styles["btn-tab"]} ${
              activeNote ? styles["btn-active"] : ""
            }`}
            onClick={activeNoteTab}
          >
            {totalNotes} Notes
          </div>
        )}
        {totalReports > 0 && (
          <div
            className={`${styles["btn-tab"]} ${
              activeReport ? styles["btn-active"] : ""
            }`}
            onClick={activeReportTab}
          >
            {totalReports} Reports
          </div>
        )}
      </div>
      {activeNote && <NotesByUrl searchUrl={searchUrl} />}
      {activeReport && <ReportsByUrl searchUrl={searchUrl} />}
    </div>
  );
};

export default memo(CommunityNoteExplore);
