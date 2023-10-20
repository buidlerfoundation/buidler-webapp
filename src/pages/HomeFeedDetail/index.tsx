import React, { memo, useCallback, useEffect, useMemo } from "react";
import styles from "./index.module.scss";
import IconArrowBack from "shared/SVG/IconArrowBack";
import { useNavigate, useParams } from "react-router-dom";
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
  const navigate = useNavigate();
  const loading = useAppSelector((state) => state.homeFeed.castDetail.loading);
  const params = useParams<{ hash: string }>();
  const hash = useMemo(() => params?.hash, [params?.hash]);
  const castDetail = useAppSelector((state) => state.homeFeed.castDetail.data);
  const castRepliesData = useFeedRepliesData(hash);
  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);
  useEffect(() => {
    if (hash) {
      dispatch(getCastDetail({ hash }));
    }
  }, [dispatch, hash]);
  const onLogin = useCallback(() => {
    const loginElement = document.getElementById("btn-login");
    loginElement?.click();
  }, []);
  return (
    <div className={styles.container}>
      <nav className={styles.head}>
        <div
          className={`${styles["btn-back"]} normal-button-clear`}
          onClick={goBack}
        >
          <IconArrowBack />
          <span>Post</span>
        </div>
      </nav>
      {loading && <Spinner size={30} />}
      {!loading && castDetail && (
        <div className={styles.body}>
          <div className={styles.metadata}>
            <MetadataFeed metadata={castDetail.metadata} />
          </div>
          <CastDetailItem
            cast={castDetail}
            replyCount={
              castRepliesData?.data?.length || castDetail?.replies?.count || 0
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
      )}
    </div>
  );
};

export default memo(HomeFeedDetail);
