import React, { memo, useCallback } from "react";
import styles from "./index.module.scss";
import useAppSelector from "hooks/useAppSelector";
import IconArrowBack from "shared/SVG/IconArrowBack";
import { Link, useNavigate } from "react-router-dom";
import Spinner from "shared/Spinner";
import LoadingItem from "shared/LoadingItem";
import CastItem from "shared/CastItem";
import { ICast } from "models/FC";

const FeedByUrl = () => {
  const navigate = useNavigate();
  const explore = useAppSelector((state) => state.homeFeed.explore);
  const renderFeed = useCallback(
    (cast: ICast) => <CastItem cast={cast} key={cast.hash} homeFeed />,
    []
  );
  const renderBody = useCallback(() => {
    if (explore.loading) return <Spinner size={30} />;
    return (
      <ol className={styles.list}>
        {explore?.data?.map(renderFeed)}
        {explore?.loadMore && <LoadingItem />}
      </ol>
    );
  }, [explore?.data, explore?.loadMore, explore.loading, renderFeed]);
  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);
  return (
    <div className={styles.container}>
      <nav className={styles.head}>
        <div className="normal-button-clear" onClick={goBack}>
          <IconArrowBack />
        </div>
      </nav>
      {renderBody()}
    </div>
  );
};

export default memo(FeedByUrl);
