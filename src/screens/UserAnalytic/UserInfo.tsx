import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import styles from "./index.module.scss";
import { IFCUser } from "models/FC";
import ImageView from "shared/ImageView";
import { normalizeContentUrl } from "helpers/CastHelper";
import numeral from "numeral";
import IconMore from "shared/SVG/IconMore";
import PopoverButton from "shared/PopoverButton";
import useAppSelector from "hooks/useAppSelector";
import useAppDispatch from "hooks/useAppDispatch";
import ModalCheckActiveBadge from "shared/ModalCheckActiveBadge";
import useFCUserActiveBadgeCheck from "hooks/useFCUserActiveBadgeCheck";
import IconActiveBadge from "shared/SVG/FC/IconActiveBadge";
import IconFC from "shared/SVG/FC/IconFC";
import IconUnfollow from "shared/SVG/FC/IconUnfollow";
import IconFollow from "shared/SVG/FC/IconFollow";
import IconCheckActiveBadge from "shared/SVG/FC/IconCheckActiveBadge";
import PopupUserInsight from "shared/PopupUserInsight";
import { Tooltip } from "@mui/material";
import GoogleAnalytics from "services/analytics/GoogleAnalytics";
import { FC_USER_ACTIONS } from "reducers/FCUserReducers";
import Link from "next/link";
import { followUser, unfollowUser } from "reducers/InsightReducers";
import { usePathname } from "next/navigation";

interface IUserInfo {
  user?: IFCUser;
  loading?: boolean;
}

const UserInfo = ({ user, loading }: IUserInfo) => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const isPlugin = useMemo(
    () => pathname.includes("/plugin-fc/insights"),
    [pathname]
  );
  const [openCheckBadgeActive, setOpenCheckBadgeActive] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const popupMenuRef = useRef<any>();
  const userActiveBadge = useFCUserActiveBadgeCheck(user?.fid);
  const fcUser = useAppSelector((state) => state.fcUser.data);
  const sameUser = useMemo(
    () => user?.fid === fcUser?.fid,
    [fcUser?.fid, user?.fid]
  );
  const bio = useMemo(
    () => user?.profile?.bio?.text,
    [user?.profile?.bio?.text]
  );
  const tracking = useCallback((event: string) => {
    GoogleAnalytics.tracking(event, { category: "Insights" });
  }, []);
  const onCloseMenu = useCallback(() => {
    popupMenuRef.current?.hide();
  }, []);
  const toggleCheckBadgeActive = useCallback(
    () => setOpenCheckBadgeActive((current) => !current),
    []
  );
  const onShareProfile = useCallback(() => {
    tracking("Share Insights To Warpcast");
    const shareUrl = `https://warpcast.com/~/compose?embeds[]=${encodeURIComponent(
      window.location.origin + window.location.pathname
    )}`;
    if (isPlugin) {
      window.top?.postMessage(
        { type: "b-fc-plugin-update-current-url", payload: shareUrl },
        { targetOrigin: "*" }
      );
    } else {
      window.open(shareUrl, "_blank");
    }
  }, [isPlugin, tracking]);
  const onCheckActiveBadge = useCallback(() => {
    toggleCheckBadgeActive();
    tracking("Check Badge Active");
  }, [toggleCheckBadgeActive, tracking]);
  const onUnfollow = useCallback(async () => {
    if (requesting || !user?.fid || !user?.username) return;
    tracking("Unfollow User");
    setRequesting(true);
    await dispatch(unfollowUser({ username: user?.username, fid: user?.fid }));
    setRequesting(false);
  }, [dispatch, requesting, tracking, user?.fid, user?.username]);
  const onFollow = useCallback(async () => {
    if (requesting || !user?.fid || !user?.username) return;
    if (!fcUser?.fid) {
      const loginElement = document.getElementById("btn-login");
      dispatch(FC_USER_ACTIONS.updateLoginSource("Follow"));
      loginElement?.click();
      return;
    }
    tracking("Follow User");
    setRequesting(true);
    await dispatch(followUser({ username: user?.username, fid: user?.fid }));
    setRequesting(false);
  }, [dispatch, fcUser?.fid, requesting, tracking, user?.fid, user?.username]);
  if (loading && !user) return null;
  return (
    <div className={styles["user-wrap"]}>
      <div className={styles["user-head"]}>
        <ImageView
          alt="avatar"
          src={user?.pfp?.url}
          className={styles.avatar}
        />
        <div className={styles["user-info"]}>
          <Link
            className={`${styles["name-wrap"]} hide-xs`}
            href={`https://warpcast.com/${user?.username}`}
            target="_blank"
          >
            <span className={styles.name}>
              {user?.display_name}
              {user?.has_active_badge && (
                <IconActiveBadge style={{ marginLeft: 4 }} />
              )}
            </span>
            <span className={styles.username}>@{user?.username}</span>
          </Link>
          <div className={styles.actions}>
            <PopoverButton
              ref={popupMenuRef}
              componentButton={
                <div className={styles["btn-more"]}>
                  <IconMore size={30} fill="var(--color-primary-text)" />
                </div>
              }
              popupStyle={{ marginTop: 0 }}
              style={{ marginTop: 10 }}
              componentPopup={
                <PopupUserInsight
                  onCloseMenu={onCloseMenu}
                  user={user}
                  tracking={tracking}
                />
              }
            />
            <Tooltip title="Check active badge">
              <div className={styles["btn-more"]} onClick={onCheckActiveBadge}>
                <IconCheckActiveBadge />
              </div>
            </Tooltip>
            {!sameUser && (
              <>
                {user?.is_followed ? (
                  <Tooltip title="Unfollow">
                    <div className={styles["btn-more"]} onClick={onUnfollow}>
                      <IconUnfollow />
                    </div>
                  </Tooltip>
                ) : (
                  <Tooltip title="Follow">
                    <div className={styles["btn-more"]} onClick={onFollow}>
                      <IconFollow />
                    </div>
                  </Tooltip>
                )}
              </>
            )}
            <div className={styles["btn-share"]} onClick={onShareProfile}>
              <span>Share</span>
              <IconFC />
            </div>
          </div>
        </div>
      </div>
      <Link
        className={`${styles["name-wrap"]} hide-desktop`}
        href={`https://warpcast.com/${user?.username}`}
        target="_blank"
      >
        <span className={styles.name}>
          {user?.display_name}
          {user?.has_active_badge && (
            <IconActiveBadge style={{ marginLeft: 4 }} />
          )}
        </span>
        <span className={styles.username}>@{user?.username}</span>
      </Link>
      {bio && (
        <div
          className={styles.bio}
          dangerouslySetInnerHTML={{
            __html: normalizeContentUrl(bio),
          }}
        />
      )}
      <div className={styles["user-relate-info"]}>
        <Link className={styles["relate-item"]} href={`${pathname}/following`}>
          <span>
            <span className={styles["main-text"]}>
              {numeral(user?.total_following).format("0[.][0]a")}
            </span>{" "}
            <span className={styles["sub-text"]}> Following</span>
          </span>
        </Link>
        <Link className={styles["relate-item"]} href={`${pathname}/follower`}>
          <span>
            <span className={styles["main-text"]}>
              {numeral(user?.total_follower).format("0[.][0]a")}
            </span>{" "}
            <span className={styles["sub-text"]}>Followers</span>
          </span>
        </Link>
        <div className={styles["relate-item"]}>
          <span>
            <span className={styles["main-text"]}>
              {numeral(user?.total_cast).format("0[.][0]a")}
            </span>{" "}
            <span className={styles["sub-text"]}>Casts</span>
          </span>
        </div>
      </div>
      <ModalCheckActiveBadge
        open={openCheckBadgeActive}
        handleClose={toggleCheckBadgeActive}
        userActiveBadge={userActiveBadge?.data}
      />
    </div>
  );
};

export default memo(UserInfo);
