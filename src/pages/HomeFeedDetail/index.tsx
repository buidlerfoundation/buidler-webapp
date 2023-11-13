import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import styles from "./index.module.scss";
import IconArrowBack from "shared/SVG/IconArrowBack";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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

const HomeFeedDetail = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const loading = useAppSelector((state) => state.homeFeed.castDetail.loading);
  const params = useParams<{ hash: string }>();
  const hash = useMemo(() => params?.hash, [params?.hash]);
  const [otherCasts, setOtherCasts] = useState<ICast[]>([]);
  const otherCastsFiltered = useMemo(
    () => otherCasts.filter((el) => el.hash !== hash),
    [hash, otherCasts]
  );
  const castDetail = useAppSelector((state) => state.homeFeed.castDetail.data);
  const castRepliesData = useFeedRepliesData(hash);
  const renderOther = useMemo(
    () => !castRepliesData.canMore && otherCastsFiltered.length > 0 && !loading,
    [castRepliesData.canMore, loading, otherCastsFiltered.length]
  );
  const goBack = useCallback(() => {
    if (window?.history?.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate("/home", { replace: true });
    }
  }, [navigate]);
  useEffect(() => {
    if (hash) {
      dispatch(
        getCastDetail({
          hash,
          page: 1,
          limit: 20,
          cast_author_fid: location.state?.cast_author_fid,
        })
      );
    }
  }, [dispatch, hash, location.state?.cast_author_fid]);
  useEffect(() => {
    if (castDetail?.metadata?.url) {
      api
        .listCasts({ text: castDetail?.metadata?.url, page: 1, limit: 20 })
        .then((res) => setOtherCasts(res.data || []));
    }
  }, [castDetail?.metadata?.url]);
  const onLogin = useCallback(() => {
    const loginElement = document.getElementById("btn-login");
    loginElement?.click();
  }, []);
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
      {loading && <Spinner size={30} />}
      {!loading && castDetail && (
        <div
          className={styles.body}
          style={{ marginBottom: renderOther ? 0 : 70 }}
        >
          <div className={styles.metadata}>
            <MetadataFeed metadata={castDetail.metadata} />
          </div>
          <div className={styles["list-cast"]}>
            <CastDetailItem
              cast={castDetail}
              replyCount={
                castDetail?.replies?.count || castRepliesData?.data?.length || 0
              }
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
          <span className={styles["other-title"]}>
            What other people say about this link
          </span>
          <div className={styles["list-other-cast"]}>
            {otherCastsFiltered?.map((el) => (
              <CastItem
                cast={el}
                key={el.hash}
                comment
                homeFeed
                onLogin={onLogin}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default memo(HomeFeedDetail);
