"use client";

import React, { memo, useCallback, useEffect, useMemo } from "react";
import styles from "./index.module.scss";
import useReportFeedData from "hooks/useReportFeedData";
import useAppDispatch from "hooks/useAppDispatch";
import { getReports } from "reducers/CommunityNoteReducers";
import LoadingItem from "shared/LoadingItem";
import Spinner from "shared/Spinner";
import { IReport } from "models/CommunityNote";
import ReportItem from "shared/ReportItem";

interface INoteFeed {
  filter: string;
}

const NoteFeed = ({ filter }: INoteFeed) => {
  const dispatch = useAppDispatch();
  const feedData = useReportFeedData(filter);
  const feeds = useMemo(() => feedData?.data || [], [feedData?.data]);

  const renderFeed = useCallback(
    (report: IReport) => <ReportItem key={report.id} report={report} />,
    []
  );

  useEffect(() => {
    if (!feedData) {
      dispatch(getReports({ type: filter, page: 1, limit: 20 }));
    }
  }, [dispatch, feedData, filter]);
  return (
    <ol className={styles.list}>
      {feeds.length > 0 ? (
        <>
          {feeds.map(renderFeed)}
          {feedData?.loadMore && <LoadingItem />}
        </>
      ) : feedData?.loading ? (
        <Spinner size={30} />
      ) : null}
    </ol>
  );
};

export default memo(NoteFeed);
