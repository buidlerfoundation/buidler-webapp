import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import styles from "./index.module.scss";
import IconArrowBack from "shared/SVG/IconArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import { ICast } from "models/FC";
import api from "api";
import LoadingItem from "shared/LoadingItem";
import CastItem from "shared/CastItem";
import CastDetailItem from "shared/CastDetailItem";

const FCDetail = () => {
  const navigate = useNavigate();
  const onBack = useCallback(() => navigate(-1), [navigate]);
  const params = useParams<{ cast_hash: string }>();
  const castHash = useMemo(() => params?.cast_hash, [params?.cast_hash]);
  const [castDetail, setCastDetail] = useState<ICast | undefined | null>(null);
  const [loading, setLoading] = useState(false);
  const getCast = useCallback(async () => {
    if (castHash) {
      setLoading(true);
      const res = await api.getCastDetail(castHash);
      setCastDetail(res.data);
      setLoading(false);
    }
  }, [castHash]);
  useEffect(() => {
    getCast();
  }, [getCast]);
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles["back__wrap"]} onClick={onBack}>
          <IconArrowBack style={{ marginRight: 10 }} />
          <span>Conversation</span>
        </div>
      </div>
      {loading && <LoadingItem />}
      {!loading && castDetail && (
        <div className={styles["cast-detail__wrap"]}>
          <CastDetailItem cast={castDetail} />
          {castDetail.replies?.casts?.map((el) => (
            <CastItem cast={el} key={el.hash} comment />
          ))}
        </div>
      )}
    </div>
  );
};

export default memo(FCDetail);
