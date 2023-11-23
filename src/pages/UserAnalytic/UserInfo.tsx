import React, { memo, useCallback, useMemo, useRef, useState } from "react";
import styles from "./index.module.scss";
import { IFCUser } from "models/FC";
import ImageView from "shared/ImageView";
import { normalizeContentUrl } from "helpers/CastHelper";
import numeral from "numeral";
import { Link } from "react-router-dom";
import IconMore from "shared/SVG/IconMore";
import PopoverButton, { PopoverItem } from "shared/PopoverButton";
import useAppSelector from "hooks/useAppSelector";
import useAppDispatch from "hooks/useAppDispatch";
import { followUser, unfollowUser } from "reducers/FCAnalyticReducers";
import toast from "react-hot-toast";
import ModalCheckActiveBadge from "shared/ModalCheckActiveBadge";
import useFCUserActiveBadgeCheck from "hooks/useFCUserActiveBadgeCheck";
import IconShare from "shared/SVG/FC/IconShare";

interface IUserInfo {
  user?: IFCUser;
  loading?: boolean;
}

const UserInfo = ({ user, loading }: IUserInfo) => {
  const dispatch = useAppDispatch();
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
  const userMenu = useMemo(
    () => [
      {
        label: `Check active badge`,
        value: "active-badge",
      },
      {
        label: `Copy link to profile`,
        value: "copy-link",
      },
      {
        label: `View on Warpcast`,
        value: "view-on-wc",
      },
      {
        label: "Report bugs",
        value: "report-bugs",
      },
    ],
    []
  );
  const toggleCheckBadgeActive = useCallback(
    () => setOpenCheckBadgeActive((current) => !current),
    []
  );
  const onShareProfile = useCallback(() => {
    window.open(
      `https://warpcast.com/~/compose?embeds[]=${encodeURIComponent(
        window.location.origin + window.location.pathname
      )}`,
      "_blank"
    );
  }, []);
  const onBugsReport = useCallback(() => {
    const reportElement = document.getElementById("btn-bugs-report");
    reportElement?.click();
  }, []);
  const onCheckActiveBadge = useCallback(() => {
    toggleCheckBadgeActive();
  }, [toggleCheckBadgeActive]);
  const onCopyLinkProfile = useCallback(async () => {
    await navigator.clipboard.writeText(
      window.location.origin + window.location.pathname
    );
    toast.success("Copied");
  }, []);
  const onViewOnWC = useCallback(() => {
    window.open(`https://warpcast.com/${user?.username}`, "_blank");
  }, [user?.username]);
  const handleSelectedMenu = useCallback(
    async (menu: PopoverItem) => {
      switch (menu.value) {
        case "active-badge":
          onCheckActiveBadge();
          break;
        case "copy-link":
          onCopyLinkProfile();
          break;
        case "view-on-wc":
          onViewOnWC();
          break;
        case "report-bugs":
          onBugsReport();
          break;
        default:
          break;
      }
    },
    [onBugsReport, onCheckActiveBadge, onCopyLinkProfile, onViewOnWC]
  );
  const onUnfollow = useCallback(async () => {
    if (requesting || !user?.fid) return;
    setRequesting(true);
    await dispatch(unfollowUser({ username: user?.fid }));
    setRequesting(false);
  }, [dispatch, requesting, user?.fid]);
  const onFollow = useCallback(async () => {
    if (requesting || !user?.fid) return;
    if (!fcUser?.fid) {
      const loginElement = document.getElementById("btn-login");
      loginElement?.click();
      return;
    }
    setRequesting(true);
    await dispatch(followUser({ username: user?.fid }));
    setRequesting(false);
  }, [dispatch, fcUser?.fid, requesting, user?.fid]);
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
            className={styles["name-wrap"]}
            to={`https://warpcast.com/${user?.username}`}
            target="_blank"
          >
            <span className={styles.name}>{user?.display_name}</span>
            <span className={styles.username}>@{user?.username}</span>
          </Link>
          <div className={styles.actions}>
            <PopoverButton
              ref={popupMenuRef}
              data={userMenu}
              onSelected={handleSelectedMenu}
              componentButton={
                <div className={styles["btn-more"]}>
                  <IconMore size={30} fill="var(--color-secondary-text)" />
                </div>
              }
              popupStyle={{ marginTop: 0 }}
              style={{ marginTop: 10 }}
            />
            <div
              className={`${styles["btn-share"]} hide-xs`}
              onClick={onShareProfile}
            >
              Share
            </div>
            <div
              className={`${styles["btn-share"]} hide-desktop`}
              onClick={onShareProfile}
            >
              <IconShare />
            </div>
            {!sameUser && (
              <>
                {user?.is_followed ? (
                  <div className={styles["btn-unfollow"]} onClick={onUnfollow}>
                    Unfollow
                  </div>
                ) : (
                  <div className={styles["btn-follow"]} onClick={onFollow}>
                    Follow
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      {bio && (
        <div
          className={styles.bio}
          dangerouslySetInnerHTML={{
            __html: normalizeContentUrl(bio),
          }}
        />
      )}
      <div className={styles["user-relate-info"]}>
        <Link
          className={styles["relate-item"]}
          to="following"
          state={{ goBack: true }}
        >
          <span>
            <span className={styles["main-text"]}>
              {numeral(user?.total_following).format("0[.][0]a")}
            </span>{" "}
            <span className={styles["sub-text"]}> Following</span>
          </span>
        </Link>
        <Link
          className={styles["relate-item"]}
          to="follower"
          state={{ goBack: true }}
        >
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
