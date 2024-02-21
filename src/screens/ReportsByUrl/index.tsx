"use client";

import React, { memo, useCallback, useMemo } from "react";
import styles from "./index.module.scss";
import useQuery from "hooks/useQuery";
import useReportsData from "hooks/useReportsData";
import { IReport } from "models/CommunityNote";
import LoadingItem from "shared/LoadingItem";
import Spinner from "shared/Spinner";
import { useParams } from "next/navigation";

interface IReportsByUrl {
  searchUrl?: string;
}

const ReportsByUrl = ({ searchUrl }: IReportsByUrl) => {
  const params = useParams<{ url: string }>();
  const exploreUrl = useMemo(() => {
    if (searchUrl !== undefined) return searchUrl;
    const url = params.url;
    if (!url) return "";
    return decodeURIComponent(url);
  }, [params.url, searchUrl]);
  const reportsData = useReportsData(exploreUrl);
  const reports = useMemo(() => reportsData?.data || [], [reportsData?.data]);
  const renderReport = useCallback((report: IReport) => {
    return (
      <div className={styles["report-category-item"]} key={report.id}>
        {report.category?.name || "Other"}
      </div>
    );
  }, []);
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
