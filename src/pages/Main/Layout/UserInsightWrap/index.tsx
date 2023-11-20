import React, { memo, useCallback, useEffect, useMemo } from "react";
import styles from "./index.module.scss";
import IconArrowBack from "shared/SVG/IconArrowBack";
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import useFCUserByName from "hooks/useFCUserByName";
import useAppDispatch from "hooks/useAppDispatch";
import {
  getActivities,
  getDataActivities,
  getDataEngagement,
  getNonFollowUsers,
  getTopInteractions,
  getUser,
} from "reducers/FCAnalyticReducers";
import useAppSelector from "hooks/useAppSelector";
import { ActivityPeriod } from "models/FC";

const UserInsightWrap = () => {
  const params = useParams<{ username: string }>();
  const [search] = useSearchParams();
  const location = useLocation();
  const user = useAppSelector((state) => state.fcUser.data);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const username = useMemo(() => params?.username, [params?.username]);
  const fcUser = useFCUserByName(username);
  const period = useMemo(
    () => (search.get("period") || "7d") as ActivityPeriod,
    [search]
  );
  const goBack = useCallback(() => {
    if (location.state?.goBack) {
      navigate(-1);
    } else {
      navigate("/insights", { replace: true });
    }
  }, [location.state?.goBack, navigate]);
  useEffect(() => {
    if (username) {
      dispatch(getUser({ username }));
      dispatch(getNonFollowUsers({ username, page: 1, limit: 10 }));
      dispatch(getDataEngagement({ username }));
      dispatch(getDataActivities({ username }));
    }
  }, [dispatch, username]);
  useEffect(() => {
    if (username) {
      dispatch(getActivities({ username, type: period }));
    }
  }, [dispatch, period, username]);
  useEffect(() => {
    if (username) {
      dispatch(
        getTopInteractions({ username, page: 1, limit: user?.fid ? 50 : 3 })
      );
    }
  }, [dispatch, user?.fid, username]);
  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <div className={styles.head}>
          <div className={styles["btn-back"]} onClick={goBack}>
            <div className={styles["icon-wrap"]}>
              <IconArrowBack />
            </div>
            <span>{fcUser?.data?.display_name}</span>
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  );
};

export default memo(UserInsightWrap);
