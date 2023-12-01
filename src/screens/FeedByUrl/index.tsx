"use client";

import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import styles from "./index.module.scss";
import useAppSelector from "hooks/useAppSelector";
import IconArrowBack from "shared/SVG/IconArrowBack";
import Spinner from "shared/Spinner";
import LoadingItem from "shared/LoadingItem";
import CastItem from "shared/CastItem";
import { ICast, IMetadataUrl } from "models/FC";
import { getURLObject } from "helpers/CastHelper";
import api from "api";
import MetadataFeed from "shared/MetadataFeed";
import useAppDispatch from "hooks/useAppDispatch";
import { getFeedByUrl } from "reducers/HomeFeedReducers";
import { useParams, useRouter } from "next/navigation";

const FeedByUrl = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const params = useParams<{ url: string }>();
  const exploreUrl = useMemo(
    () => (params?.url ? decodeURIComponent(params?.url) : ""),
    [params?.url]
  );
  const explore = useAppSelector((state) => state.homeFeed.explore);
  const [metadata, setMetadata] = useState<undefined | IMetadataUrl>();
  const urlObject = useMemo(() => getURLObject(exploreUrl), [exploreUrl]);
  const isDomain = useMemo(
    () => urlObject?.path === "/" && urlObject?.domain === urlObject?.host,
    [urlObject?.domain, urlObject?.host, urlObject?.path]
  );
  const pageTitle = useMemo(() => {
    if (isDomain) return `All post from ${urlObject?.siteName}`;
    return "What people say about this link";
  }, [isDomain, urlObject?.siteName]);
  const onLogin = useCallback(() => {
    const loginElement = document.getElementById("btn-login");
    loginElement?.click();
  }, []);
  const renderFeed = useCallback(
    (cast: ICast) => {
      return (
        <CastItem cast={cast} key={cast.hash} homeFeed onLogin={onLogin} />
      );
    },
    [onLogin]
  );
  const renderBody = useCallback(() => {
    if (explore.loading) return <Spinner size={30} />;
    return (
      <>
        {metadata && (
          <div className={styles.metadata}>
            <MetadataFeed metadata={metadata} />
          </div>
        )}
        <ol className={styles["list-cast"]}>
          {explore?.data?.map(renderFeed)}
          {explore?.loadMore && <LoadingItem />}
        </ol>
      </>
    );
  }, [explore?.data, explore?.loadMore, explore.loading, metadata, renderFeed]);
  const goBack = useCallback(() => {
    router.back();
  }, [router]);
  const onPageEndReach = useCallback(() => {
    if (exploreUrl && explore?.canMore && !explore?.loadMore) {
      dispatch(
        getFeedByUrl({
          text: exploreUrl,
          page: (explore?.currentPage || 1) + 1,
          limit: 20,
        })
      );
    }
  }, [
    dispatch,
    explore?.canMore,
    explore?.currentPage,
    explore?.loadMore,
    exploreUrl,
  ]);
  useEffect(() => {
    if (exploreUrl) {
      api.getEmbeddedMetadata(exploreUrl).then((res) => {
        if (res.success && res.data) {
          const data = res.data;
          data.url = exploreUrl;
          setMetadata(data);
        }
      });
    }
  }, [exploreUrl]);
  const windowScrollListener = useCallback(() => {
    if (
      window.innerHeight + document.documentElement.scrollTop ===
      document.documentElement.offsetHeight
    ) {
      onPageEndReach();
    }
  }, [onPageEndReach]);
  useEffect(() => {
    window.addEventListener("scroll", windowScrollListener);
    return () => {
      window.removeEventListener("scroll", windowScrollListener);
    };
  }, [windowScrollListener]);
  return (
    <div className={styles.container}>
      <nav className={styles.head}>
        <div className={styles["btn-back"]} onClick={goBack}>
          <div className={styles["icon-wrap"]}>
            <IconArrowBack />
          </div>
          <span>{pageTitle}</span>
        </div>
      </nav>
      <div className={styles.body}>{renderBody()}</div>
    </div>
  );
};

export default memo(FeedByUrl);
