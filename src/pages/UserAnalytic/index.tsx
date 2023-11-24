import React, { memo, useEffect, useMemo } from "react";
import styles from "./index.module.scss";
import { useLocation, useParams, useSearchParams } from "react-router-dom";
import useFCUserByName from "hooks/useFCUserByName";
import UserInfo from "./UserInfo";
import Analytics from "./Analytics";
import { ActivityPeriod } from "models/FC";
import GoogleAnalytics from "services/analytics/GoogleAnalytics";

const UserAnalytic = () => {
  const [search] = useSearchParams();
  const location = useLocation();
  const params = useParams<{ username: string }>();
  const username = useMemo(() => params?.username, [params?.username]);
  const fcUser = useFCUserByName(username);
  const period = useMemo(
    () => (search.get("period") || "7d") as ActivityPeriod,
    [search]
  );
  const followUserViewEvent = useMemo(() => {
    if (location.state?.from === "/non-follower") return "Non Follower Viewed";
    if (location.state?.from === "/follower") return "Follower Viewed";
    if (location.state?.from === "/following") return "Following Viewed";
    return "";
  }, [location.state?.from]);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    GoogleAnalytics.tracking("Page Viewed", {
      category: "Traffic",
      page_name: "Insights Detail",
      source: query.get("ref") || "",
      path: location.pathname,
    });
  }, [location.pathname]);
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
        <Analytics fid={fcUser?.data?.fid} period={period} />
      </div>
    </div>
  );
};

export default memo(UserAnalytic);
