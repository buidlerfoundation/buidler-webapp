"use client";

import React, { memo, useCallback, useEffect, useMemo } from "react";
import styles from "./index.module.scss";
import IconArrowBack from "shared/SVG/IconArrowBack";
import useFCUserByName from "hooks/useFCUserByName";
import useAppSelector from "hooks/useAppSelector";
import { ActivityPeriod } from "models/FC";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import Link from "next/link";
import useUserTabs from "hooks/useUserTabs";
import useAppDispatch from "hooks/useAppDispatch";
import {
  getActivities,
  getDataActiveBadgeCheck,
  getDataActivities,
  getDataEngagement,
  getDataFollowUsers,
  getTopInteractions,
  getUserProfile,
} from "reducers/InsightReducers";

interface IUserInsightWrap {
  children: React.ReactNode;
}

const UserInsightWrap = ({ children }: IUserInsightWrap) => {
  const dispatch = useAppDispatch();
  const params = useParams<{ username: string }>();
  const search = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const username = useMemo(() => params?.username, [params?.username]);
  const user = useAppSelector((state) => state.fcUser.data);
  const userTabs = useUserTabs();
  const fcUser = useFCUserByName(username);
  const userTabsFiltered = useMemo(() => {
    if (user?.fid) return userTabs;
    return userTabs?.filter((el) => el.path !== "/non-follower");
  }, [user?.fid, userTabs]);
  const period = useMemo(
    () => (search?.get("period") || "7d") as ActivityPeriod,
    [search]
  );
  const showTab = useMemo(
    () => userTabs?.find((el) => !!pathname?.includes(el.path)),
    [pathname, userTabs]
  );
  const goBack = useCallback(() => {
    if (window.history.length > 0) {
      router.back();
    } else {
      router.replace("/insights");
    }
  }, [router]);
  useEffect(() => {
    if (username) {
      dispatch(getUserProfile({ username }))
        .unwrap()
        .then((res) => {
          if (res.success && res.data?.fid) {
            dispatch(
              getDataFollowUsers({
                username: res.data?.fid,
                page: 1,
                limit: 20,
                path: "/non-follower",
              })
            );
            dispatch(getDataEngagement({ username: res.data?.fid }));
            dispatch(getDataActivities({ username: res.data?.fid }));
            dispatch(getDataActiveBadgeCheck({ username: res.data?.fid }));
          }
        });
    }
  }, [dispatch, username]);
  useEffect(() => {
    if (fcUser?.data?.fid) {
      dispatch(getActivities({ username: fcUser?.data?.fid, type: period }));
    }
  }, [dispatch, fcUser?.data?.fid, period]);
  useEffect(() => {
    if (fcUser?.data?.fid) {
      dispatch(
        getTopInteractions({
          username: fcUser?.data?.fid,
          page: 1,
          limit: user?.fid ? 50 : 3,
        })
      );
    }
  }, [dispatch, user?.fid, fcUser?.data?.fid]);
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
            {userTabsFiltered?.map((el) => (
              <Link
                href={`/insights/${username}${el.path}`}
                key={el.path}
                className={`${styles["tab-item"]} ${
                  pathname?.includes(el.path) ? styles.active : ""
                }`}
              >
                {el.label}
              </Link>
            ))}
          </div>
        )}
      </nav>
      {children}
    </div>
  );
};

export default memo(UserInsightWrap);
