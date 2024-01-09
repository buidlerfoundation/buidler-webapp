"use client";

import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import styles from "./index.module.scss";
import IconArrowBack from "shared/SVG/IconArrowBack";
import MetadataFeed from "shared/MetadataFeed";
import useAppSelector from "hooks/useAppSelector";
import useFeedRepliesData from "hooks/useFeedRepliesData";
import useAppDispatch from "hooks/useAppDispatch";
import { getCastDetail, getCastReplies } from "reducers/HomeFeedReducers";
import Spinner from "shared/Spinner";
import CastDetailItem from "shared/CastDetailItem";
import CastItem from "shared/CastItem";
import LoadingItem from "shared/LoadingItem";
import { ICast } from "models/FC";
import api from "api";
import GoogleAnalytics from "services/analytics/GoogleAnalytics";
import { FC_USER_ACTIONS } from "reducers/FCUserReducers";
import { useParams, usePathname, useRouter } from "next/navigation";
import useCastDetail from "hooks/useCastDetail";
import AppConfig from "common/AppConfig";

const HomeFeedDetail = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ hash: string }>();
  const hash = useMemo(() => params?.hash, [params?.hash]);
  const [otherCasts, setOtherCasts] = useState<ICast[]>([]);
  const otherCastsFiltered = useMemo(
    () =>
      otherCasts.filter(
        (el) => `0x${el.hash.slice(0, AppConfig.castDetailHashLength)}` !== hash
      ),
    [hash, otherCasts]
  );
  const castDetail = useCastDetail(hash);
  const castRepliesData = useFeedRepliesData(hash);
  const replyCount = useMemo(
    () =>
      castDetail?.data?.replies?.count || castRepliesData?.data?.length || 0,
    [castDetail?.data?.replies?.count, castRepliesData?.data?.length]
  );
  const renderOther = useMemo(
    () =>
      !castRepliesData.canMore &&
      otherCastsFiltered.length > 0 &&
      !castDetail?.loading,
    [castRepliesData.canMore, castDetail?.loading, otherCastsFiltered.length]
  );
  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.replace("/home");
    }
  }, [router]);
  useEffect(() => {
    if (hash) {
      dispatch(
        getCastDetail({
          hash,
          page: 1,
          limit: 20,
        })
      );
      setOtherCasts([]);
    }
  }, [dispatch, hash]);
  useEffect(() => {
    if (castDetail?.data?.metadata?.url) {
      api
        .listCasts({
          text: castDetail?.data?.metadata?.url,
          page: 1,
          limit: 20,
        })
        .then((res) => setOtherCasts(res.data || []));
    }
  }, [castDetail?.data?.metadata?.url]);
  const onLogin = useCallback(() => {
    dispatch(FC_USER_ACTIONS.updateLoginSource("Home Feed Detail"));
    const loginElement = document.getElementById("btn-login");
    loginElement?.click();
  }, [dispatch]);
  const onPageEndReach = useCallback(() => {
    if (castRepliesData?.canMore && !castRepliesData?.loadMore && hash) {
      dispatch(
        getCastReplies({
          hash,
          page: (castRepliesData?.currentPage || 1) + 1,
          limit: 20,
        })
      );
    }
  }, [
    castRepliesData?.canMore,
    castRepliesData?.currentPage,
    castRepliesData?.loadMore,
    dispatch,
    hash,
  ]);
  const windowScrollListener = useCallback(() => {
    if (
      Math.ceil(window.innerHeight + document.documentElement.scrollTop) ===
      Math.ceil(document.documentElement.offsetHeight)
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
  useEffect(() => {
    window?.scrollTo?.({
      top: 0,
      behavior: "auto",
    });
  }, []);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    GoogleAnalytics.tracking("Page Viewed", {
      category: "Traffic",
      page_name: "News Detail",
      source: query.get("ref") || "",
      path: pathname || "",
    });
  }, [pathname]);
  return (
    <div className={styles.container}>
      <nav className={styles.head}>
        <div className={styles["btn-back"]} onClick={goBack}>
          <div className={styles["icon-wrap"]}>
            <IconArrowBack />
          </div>
          <span>Post</span>
        </div>
      </nav>
      {!castDetail?.data && castDetail?.loading && <Spinner size={30} />}
      {castDetail?.data && (
        <div
          className={styles.body}
          style={{ marginBottom: renderOther ? 0 : 70 }}
        >
          <div className={styles.metadata}>
            <MetadataFeed metadata={castDetail?.data?.metadata} />
          </div>
          <div className={styles["list-cast"]}>
            <CastDetailItem
              cast={castDetail?.data}
              replyCount={replyCount}
              homeFeed
              onLogin={onLogin}
            />
            {castRepliesData?.data?.map((el) => (
              <CastItem
                cast={el}
                key={el.hash}
                comment
                homeFeed
                onLogin={onLogin}
              />
            ))}
          </div>
          {castRepliesData?.loadMore && <LoadingItem />}
        </div>
      )}
      {renderOther && (
        <>
          <span
            className={styles["other-title"]}
            style={replyCount === 0 ? { borderTop: "none" } : {}}
          >
            What other people say about this link
          </span>
          <div className={styles["list-other-cast"]}>
            {otherCastsFiltered?.map((el) => (
              <CastItem cast={el} key={el.hash} homeFeed onLogin={onLogin} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default memo(HomeFeedDetail);
