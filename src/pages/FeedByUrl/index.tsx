import React, { memo, useEffect, useMemo, useState } from "react";
import styles from "./index.module.scss";
import { useParams } from "react-router-dom";

const FeedByUrl = () => {
  const [loading, setLoading] = useState(false);
  const params = useParams<{ url: string }>();
  const url = useMemo(() => params?.url, [params?.url]);
  useEffect(() => {
    if (url) {
      console.log("XXX: ", url);
    }
  }, [url]);
  return <div className={styles.container}></div>;
};

export default memo(FeedByUrl);
