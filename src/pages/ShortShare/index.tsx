import React, { memo, useEffect, useState } from "react";
import styles from "./index.module.scss";
import { useNavigate, useParams } from "react-router-dom";
import api from "api";
import PageNotFound from "shared/PageNotFound";

const ShortShare = () => {
  const [error, setError] = useState(false);
  const params = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const shareId = params.share_id;
    if (shareId) {
      api.getCommunityDataFromShareId(shareId).then((res) => {
        if (res.success) {
          navigate(
            `/channels/${res.data?.community?.community_id}/${res.data?.channel?.channel_id}`
          );
        } else {
          setError(true);
        }
      });
    }
  }, [navigate, params.share_id]);
  if (error) return <PageNotFound />;
  return <div className={styles.container} />;
};

export default memo(ShortShare);
