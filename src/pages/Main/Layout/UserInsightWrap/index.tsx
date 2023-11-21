import React, { memo, useCallback, useEffect, useMemo } from "react";
import styles from "./index.module.scss";
import IconArrowBack from "shared/SVG/IconArrowBack";
import {
  Link,
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
  getDataFollowUsers,
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
  const userTabs = useAppSelector((state) => state.fcAnalytic.userTabs);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const username = useMemo(() => params?.username, [params?.username]);
  const fcUser = useFCUserByName(username);
  const period = useMemo(
    () => (search.get("period") || "7d") as ActivityPeriod,
    [search]
  );
  const showTab = useMemo(
    () => userTabs.find((el) => !!location.pathname.includes(el.path)),
    [location.pathname, userTabs]
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
      dispatch(
        getDataFollowUsers({
          username,
          page: 1,
          limit: 10,
          path: "/non-follower",
        })
      );
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
        {showTab && (
          <div className={styles.tabs}>
            {userTabs.map((el) => (
              <Link
                to={`/insights/${username}${el.path}`}
                key={el.path}
                className={`${styles["tab-item"]} ${
                  location.pathname.includes(el.path) ? styles.active : ""
                }`}
                replace
                state={{ goBack: true }}
              >
                {el.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
      <Outlet />
    </div>
  );
};

export default memo(UserInsightWrap);
