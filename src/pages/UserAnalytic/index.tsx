"use client";

import React, { memo, useEffect, useMemo } from "react";
import styles from "./index.module.scss";
import useFCUserByName from "hooks/useFCUserByName";
import UserInfo from "./UserInfo";
import Analytics from "./Analytics";
import { ActivityPeriod } from "models/FC";
import GoogleAnalytics from "services/analytics/GoogleAnalytics";
import { useParams, usePathname, useSearchParams } from "next/navigation";

const UserAnalytic = () => {
  const search = useSearchParams();
  const pathname = usePathname();
  const params = useParams<{ username: string }>();
  const username = useMemo(() => params?.username, [params?.username]);
  const fcUser = useFCUserByName(username);
  const period = useMemo(
    () => (search?.get("period") || "7d") as ActivityPeriod,
    [search]
  );
  const followUserViewEvent = useMemo(() => {
    // if (location.state?.from === "/non-follower") return "Non Follower Viewed";
    // if (location.state?.from === "/follower") return "Follower Viewed";
    // if (location.state?.from === "/following") return "Following Viewed";
    return "";
  }, []);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    GoogleAnalytics.tracking("Page Viewed", {
      category: "Traffic",
      page_name: "Insights Detail",
      source: query.get("ref") || "",
      path: pathname || "",
    });
  }, [pathname]);
  useEffect(() => {
    if (username) {
      GoogleAnalytics.tracking("Insights User Viewed", {
        category: "Insights",
        username,
      });
    }
  }, [username]);
  useEffect(() => {
    if (followUserViewEvent && username) {
      GoogleAnalytics.tracking(followUserViewEvent, {
        category: "Insights",
        username,
      });
    }
  }, [followUserViewEvent, username]);
  return (
    <div className={styles.container}>
      <div className={styles.body}>
        <UserInfo user={fcUser?.data} loading={fcUser?.loading} />
        <Analytics
          fid={fcUser?.data?.fid}
          username={username}
          period={period}
        />
      </div>
    </div>
  );
};

export default memo(UserAnalytic);
