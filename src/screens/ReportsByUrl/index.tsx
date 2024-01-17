"use client";

import React, { memo, useCallback, useMemo } from "react";
import styles from "./index.module.scss";
import useQuery from "hooks/useQuery";
import useReportsData from "hooks/useReportsData";
import { IReport } from "models/CommunityNote";
import LoadingItem from "shared/LoadingItem";
import Spinner from "shared/Spinner";

interface IReportsByUrl {
  searchUrl?: string;
}

const ReportsByUrl = ({ searchUrl }: IReportsByUrl) => {
  const query = useQuery();
  const exploreUrl = useMemo(() => {
    if (searchUrl !== undefined) return searchUrl;
    const url = query.get("url");
    if (!url) return "";
    return decodeURIComponent(url);
  }, [query, searchUrl]);
  const reportsData = useReportsData(exploreUrl);
  const reports = useMemo(() => reportsData?.data || [], [reportsData?.data]);
  const renderReport = useCallback(
    (report: IReport) => (
      <div className={styles["report-category-item"]} key={report.id}>
        {report.category.name}
      </div>
    ),
    []
  );
  return (
    <div className="page-container">
      {reports.length > 0 ? (
        <>
          {reports.map(renderReport)}
          {reportsData?.loadMore && <LoadingItem />}
        </>
      ) : reportsData?.loading ? (
        <Spinner size={30} />
      ) : null}
    </div>
  );
};

export default memo(ReportsByUrl);
