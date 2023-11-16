import React, { memo, useCallback, useEffect, useMemo } from "react";
import styles from "./index.module.scss";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import IconArrowBack from "shared/SVG/IconArrowBack";
import useFCUserByName from "hooks/useFCUserByName";
import useAppDispatch from "hooks/useAppDispatch";
import {
  getActivities,
  getDataActivities,
  getDataEngagement,
  getUser,
} from "reducers/FCAnalyticReducers";
import UserInfo from "./UserInfo";
import Analytics from "./Analytics";
import { ActivityPeriod } from "models/FC";

const UserAnalytic = () => {
  const dispatch = useAppDispatch();
  const [search] = useSearchParams();
  const params = useParams<{ username: string }>();
  const username = useMemo(() => params?.username, [params?.username]);
  const fcUser = useFCUserByName(username);
  const period = useMemo(
    () => (search.get("period") || "1d") as ActivityPeriod,
    [search]
  );
  const navigate = useNavigate();
  const goBack = useCallback(() => {
    if (window?.history?.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate("/home", { replace: true });
    }
  }, [navigate]);
  useEffect(() => {
    if (username) {
      dispatch(getUser({ username }));
      dispatch(getDataEngagement({ username }));
      dispatch(getDataActivities({ username }));
    }
  }, [dispatch, username]);
  useEffect(() => {
    if (username) {
      dispatch(getActivities({ username, type: period }));
    }
  }, [dispatch, period, username]);
  return (
    <div className={styles.container}>
      <nav className={styles.head}>
        <div className={styles["btn-back"]} onClick={goBack}>
          <div className={styles["icon-wrap"]}>
            <IconArrowBack />
          </div>
          <span>{fcUser?.data?.display_name}</span>
        </div>
      </nav>
      <div className={styles.body}>
        {fcUser?.data && <UserInfo user={fcUser?.data} />}
        <Analytics username={username} period={period} />
      </div>
    </div>
  );
};

export default memo(UserAnalytic);
