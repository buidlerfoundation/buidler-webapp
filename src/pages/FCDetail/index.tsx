import React, { memo, useCallback, useEffect, useMemo } from "react";
import styles from "./index.module.scss";
import IconArrowBack from "shared/SVG/IconArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import LoadingItem from "shared/LoadingItem";
import CastItem from "shared/CastItem";
import CastDetailItem from "shared/CastDetailItem";
import useAppDispatch from "hooks/useAppDispatch";
import useAppSelector from "hooks/useAppSelector";
import useFeedRepliesData from "hooks/useFeedRepliesData";
import { getCastDetail, getCastReplies } from "reducers/HomeFeedReducers";

const FCDetail = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const onBack = useCallback(() => navigate(-1), [navigate]);
  const params = useParams<{ cast_hash: string }>();
  const castHash = useMemo(() => params?.cast_hash, [params?.cast_hash]);
  const loading = useAppSelector((state) => state.homeFeed.castDetail.loading);
  const castDetail = useAppSelector((state) => state.homeFeed.castDetail.data);
  const castRepliesData = useFeedRepliesData(castHash);
  const getCast = useCallback(async () => {
    if (castHash) {
      dispatch(getCastDetail({ hash: castHash, page: 1, limit: 20 }));
    }
  }, [castHash, dispatch]);
  useEffect(() => {
    getCast();
  }, [getCast]);
  const onScroll = useCallback(
    (e: any) => {
      const { scrollTop, scrollHeight, clientHeight } = e.target;
      const compare = Math.round(scrollTop + clientHeight);
      if (
        (compare === scrollHeight + 1 || compare === scrollHeight) &&
        castRepliesData.canMore &&
        !castRepliesData.loadMore &&
        castHash
      ) {
        dispatch(
          getCastReplies({
            hash: castHash,
            page: (castRepliesData.currentPage || 1) + 1,
            limit: 20,
          })
        );
      }
    },
    [
      castHash,
      castRepliesData.canMore,
      castRepliesData.currentPage,
      castRepliesData.loadMore,
      dispatch,
    ]
  );
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles["back__wrap"]} onClick={onBack}>
          <IconArrowBack style={{ marginRight: 10 }} />
          <span>Post</span>
        </div>
      </div>
      {loading && <LoadingItem />}
      {!loading && castDetail && (
        <div className={styles["cast-detail__wrap"]} onScroll={onScroll}>
          <CastDetailItem
            cast={castDetail}
            replyCount={
              castRepliesData?.data?.length || castDetail?.replies?.count || 0
            }
            postMessageOpenImageFullscreen
          />
          {castRepliesData?.data?.map((el) => (
            <CastItem
              cast={el}
              key={el.hash}
              comment
              postMessageOpenImageFullscreen
            />
          ))}
          {castRepliesData.loadMore && <LoadingItem />}
        </div>
      )}
    </div>
  );
};

export default memo(FCDetail);
