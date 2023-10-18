import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import styles from "./index.module.scss";
import useAppSelector from "hooks/useAppSelector";
import IconArrowBack from "shared/SVG/IconArrowBack";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "shared/Spinner";
import LoadingItem from "shared/LoadingItem";
import CastItem from "shared/CastItem";
import { ICast, IMetadataUrl } from "models/FC";
import { getURLObject } from "helpers/CastHelper";
import api from "api";
import MetadataFeed from "shared/MetadataFeed";
import FeedItem from "shared/FeedItem";

const FeedByUrl = () => {
  const navigate = useNavigate();
  const params = useParams<{ url: string }>();
  const exploreUrl = useMemo(() => params?.url, [params?.url]);
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
  const renderFeed = useCallback(
    (cast: ICast) => {
      if (isDomain) {
        return <FeedItem cast={cast} key={cast.hash} explore />;
      }
      return <CastItem cast={cast} key={cast.hash} homeFeed />;
    },
    [isDomain]
  );
  const renderBody = useCallback(() => {
    if (explore.loading) return <Spinner size={30} />;
    return (
      <ol className={styles.list}>
        {metadata && (
          <div className={styles.metadata}>
            <MetadataFeed metadata={metadata} hideTitle={isDomain} />
          </div>
        )}
        {explore?.data?.map(renderFeed)}
        {explore?.loadMore && <LoadingItem />}
      </ol>
    );
  }, [
    explore?.data,
    explore?.loadMore,
    explore.loading,
    isDomain,
    metadata,
    renderFeed,
  ]);
  const goBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);
  useEffect(() => {
    if (exploreUrl) {
      api.getEmbeddedMetadata(exploreUrl).then((res) => {
        if (res.success) {
          setMetadata(res.data);
        }
      });
    }
  }, [exploreUrl]);
  return (
    <div className={styles.container}>
      <nav className={styles.head}>
        <div className={styles["btn-back"]} onClick={goBack}>
          <IconArrowBack />
          <span>{pageTitle}</span>
        </div>
      </nav>
      {renderBody()}
    </div>
  );
};

export default memo(FeedByUrl);
