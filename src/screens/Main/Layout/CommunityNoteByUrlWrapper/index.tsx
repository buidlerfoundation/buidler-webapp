"use client";

import React, {
  ReactNode,
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import styles from "./index.module.scss";
import { useParams, usePathname, useRouter } from "next/navigation";
import IconArrowBack from "shared/SVG/IconArrowBack";
import Link from "next/link";
import useQuery from "hooks/useQuery";
import useAppDispatch from "hooks/useAppDispatch";
import {
  COMMUNITY_NOTE_ACTION,
  getDashboardLinkByUrl,
  getNotesByUrl,
  getReportsByUrl,
} from "reducers/CommunityNoteReducers";
import useDashboardLinkDetailData from "hooks/useDashboardLinkDetailData";
import Metadata from "shared/DashboardLinkItem/Metadata";
import NoteItem from "shared/DashboardLinkItem/NoteItem";
import DomainInput from "shared/DomainInput";
import { IMetadataUrl } from "models/FC";
import ExploreEmpty from "./ExploreEmpty";

interface IExploreContext {
  searchUrl: string;
}

export const ExploreContext = createContext<IExploreContext>({
  searchUrl: "",
});

export function useExploreContext() {
  return useContext(ExploreContext);
}

interface ICommunityNoteByUrlWrapper {
  children: React.ReactNode;
}

const CommunityNoteByUrlWrapper = ({
  children,
}: ICommunityNoteByUrlWrapper) => {
  const dispatch = useAppDispatch();
  const [inputMetadata, setInputMetadata] = useState<
    IMetadataUrl | null | undefined
  >();
  const pathname = usePathname();
  const isExplore = useMemo(
    () => pathname === "/community-notes/explore",
    [pathname]
  );
  const [searchUrl, setSearchUrl] = useState("");
  const router = useRouter();
  const query = useQuery();
  const exploreUrl = useMemo(() => {
    if (isExplore) return searchUrl || "";
    const url = query.get("url");
    if (!url) return "";
    return decodeURIComponent(url);
  }, [query, isExplore, searchUrl]);
  const dashboardDetail = useDashboardLinkDetailData(exploreUrl);
  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace("/community-notes");
    }
  }, [router]);
  const activeNote = useMemo(() => pathname.includes("/notes"), [pathname]);
  const activeReport = useMemo(() => pathname.includes("/reports"), [pathname]);
  const totalNotes = useMemo(
    () => dashboardDetail?.data?.total_notes || 0,
    [dashboardDetail?.data?.total_notes]
  );
  const totalReports = useMemo(
    () => dashboardDetail?.data?.total_reports || 0,
    [dashboardDetail?.data?.total_reports]
  );
  const isExploreEmpty = useMemo(
    () => isExplore && dashboardDetail && !totalNotes && !totalReports,
    [dashboardDetail, isExplore, totalNotes, totalReports]
  );
  const onOpenRateNote = useCallback(() => {
    dispatch(
      COMMUNITY_NOTE_ACTION.updateModalRateNote({
        note: dashboardDetail?.data?.note,
        metadata: dashboardDetail?.data?.metadata,
      })
    );
  }, [dashboardDetail?.data?.metadata, dashboardDetail?.data?.note, dispatch]);
  const onChangedMetadata = useCallback((metadata?: IMetadataUrl | null) => {
    setSearchUrl(metadata?.url || "");
    setInputMetadata(metadata);
  }, []);
  const onAddNote = useCallback(() => {
    dispatch(COMMUNITY_NOTE_ACTION.updateModalNote(inputMetadata));
  }, [dispatch, inputMetadata]);
  const onAddReport = useCallback(() => {
    dispatch(COMMUNITY_NOTE_ACTION.updateModalReport(inputMetadata));
  }, [dispatch, inputMetadata]);
  useEffect(() => {
    if (exploreUrl) {
      dispatch(getDashboardLinkByUrl({ url: exploreUrl }));
      dispatch(getNotesByUrl({ url: exploreUrl, page: 1, limit: 20 }));
      dispatch(getReportsByUrl({ url: exploreUrl, page: 1, limit: 20 }));
    }
  }, [dispatch, exploreUrl]);
  return (
    <ExploreContext.Provider value={{ searchUrl }}>
      <div className={styles.container}>
        <nav className={styles.head}>
          {isExplore ? (
            <div className={styles["btn-back"]} onClick={goBack}>
              <span>Search notes on link.</span>
            </div>
          ) : (
            <div className={styles["btn-back"]} onClick={goBack}>
              <div className={styles["icon-wrap"]}>
                <IconArrowBack />
              </div>
              <span>Note</span>
            </div>
          )}
        </nav>
        {isExplore && <DomainInput onChangedMetadata={onChangedMetadata} />}
        {isExploreEmpty ? (
          <ExploreEmpty onAddReport={onAddReport} onAddNote={onAddNote} />
        ) : (
          <>
            {dashboardDetail?.data && (
              <div className={styles.body}>
                <Metadata
                  url={dashboardDetail?.data?.url}
                  metadata={dashboardDetail?.data?.metadata}
                />
                {dashboardDetail?.data?.note && (
                  <NoteItem
                    note={dashboardDetail?.data?.note}
                    onOpenRateNote={onOpenRateNote}
                    metadata={dashboardDetail?.data?.metadata}
                  />
                )}
                <NoteItem
                  onOpenRateNote={onOpenRateNote}
                  metadata={dashboardDetail?.data?.metadata}
                />
              </div>
            )}
            {!isExplore && (
              <div className={styles.tabs}>
                {totalNotes > 0 && (
                  <Link
                    href={`/community-notes/explore/notes?url=${encodeURIComponent(
                      exploreUrl
                    )}`}
                    className={`${styles["btn-tab"]} ${
                      activeNote ? styles["btn-active"] : ""
                    }`}
                    replace
                  >
                    {totalNotes} Notes
                  </Link>
                )}
                {totalReports > 0 && (
                  <Link
                    href={`/community-notes/explore/reports?url=${encodeURIComponent(
                      exploreUrl
                    )}`}
                    className={`${styles["btn-tab"]} ${
                      activeReport ? styles["btn-active"] : ""
                    }`}
                    replace
                  >
                    {totalReports} Reports
                  </Link>
                )}
              </div>
            )}
            {children}
          </>
        )}
      </div>
    </ExploreContext.Provider>
  );
};

export default memo(CommunityNoteByUrlWrapper);
