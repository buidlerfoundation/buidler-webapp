import React, { memo, useCallback, useEffect, useMemo } from "react";
import styles from "./index.module.scss";
import IconArrowBack from "shared/SVG/IconArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import LoadingItem from "shared/LoadingItem";
import CastItem from "shared/CastItem";
import CastDetailItem from "shared/CastDetailItem";
import useAppDispatch from "hooks/useAppDispatch";
import { getCastDetail } from "reducers/FCCastReducers";
import useAppSelector from "hooks/useAppSelector";
import useCastRepliesData from "hooks/useCastReplies";

const FCDetail = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const onBack = useCallback(() => navigate(-1), [navigate]);
  const params = useParams<{ cast_hash: string }>();
  const castHash = useMemo(() => params?.cast_hash, [params?.cast_hash]);
  const loading = useAppSelector((state) => state.fcCast.castDetail.loading);
  const castDetail = useAppSelector((state) => state.fcCast.castDetail.data);
  const castRepliesData = useCastRepliesData(castHash);
  const getCast = useCallback(async () => {
    if (castHash) {
      dispatch(getCastDetail({ hash: castHash }));
    }
  }, [castHash, dispatch]);
  useEffect(() => {
    getCast();
  }, [getCast]);
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
        <div className={styles["cast-detail__wrap"]}>
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
        </div>
      )}
    </div>
  );
};

export default memo(FCDetail);
