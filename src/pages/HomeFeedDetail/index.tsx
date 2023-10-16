import React, { memo, useEffect, useMemo } from "react";
import styles from "./index.module.scss";
import IconArrowBack from "shared/SVG/IconArrowBack";
import { Link, useParams } from "react-router-dom";
import MetadataFeed from "shared/MetadataFeed";
import useAppSelector from "hooks/useAppSelector";
import useFeedRepliesData from "hooks/useFeedRepliesData";
import useAppDispatch from "hooks/useAppDispatch";
import { getCastDetail } from "reducers/HomeFeedReducers";
import Spinner from "shared/Spinner";
import CastDetailItem from "shared/CastDetailItem";
import CastItem from "shared/CastItem";

const HomeFeedDetail = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.homeFeed.castDetail.loading);
  const params = useParams<{ hash: string }>();
  const hash = useMemo(() => params?.hash, [params?.hash]);
  const castDetail = useAppSelector((state) => state.homeFeed.castDetail.data);
  const castRepliesData = useFeedRepliesData(hash);
  useEffect(() => {
    if (hash) {
      dispatch(getCastDetail({ hash }));
    }
  }, [dispatch, hash]);
  return (
    <div className={styles.container}>
      <div className={styles.head}>
        <Link className={styles["btn-back"]} to="..">
          <IconArrowBack />
          <span>Post</span>
        </Link>
      </div>
      {loading && <Spinner size={30} />}
      {!loading && castDetail && (
        <div className={styles.body}>
          <div className={styles.metadata}>
            <MetadataFeed />
          </div>
          <CastDetailItem
            cast={castDetail}
            replyCount={
              castRepliesData?.data?.length || castDetail?.replies?.count || 0
            }
          />
          {castRepliesData?.data?.map((el) => (
            <CastItem cast={el} key={el.hash} comment />
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(HomeFeedDetail);
