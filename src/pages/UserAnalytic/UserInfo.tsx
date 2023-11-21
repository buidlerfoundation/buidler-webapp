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

interface IUserInfo {
  user: IFCUser;
}

const UserInfo = ({ user }: IUserInfo) => {
  const dispatch = useAppDispatch();
  const [requesting, setRequesting] = useState(false);
  const popupMenuRef = useRef<any>();
  const fcUser = useAppSelector((state) => state.fcUser.data);
  const sameUser = useMemo(
    () => user.fid === fcUser?.fid,
    [fcUser?.fid, user.fid]
  );
  const bio = useMemo(
    () => user?.profile?.bio?.text,
    [user?.profile?.bio?.text]
  );
  const userMenu = useMemo(
    () => [
      {
        label: `Share ${sameUser ? "your" : "this"} profile`,
        value: "share-profile",
      },
      {
        label: "Report bugs",
        value: "report-bugs",
      },
    ],
    [sameUser]
  );
  const onShareProfile = useCallback(() => {
    const shareElement = document.getElementById("btn-share-profile");
    shareElement?.click();
  }, []);
  const onBugsReport = useCallback(() => {
    const reportElement = document.getElementById("btn-bugs-report");
    reportElement?.click();
  }, []);
  const handleSelectedMenu = useCallback(
    async (menu: PopoverItem) => {
      switch (menu.value) {
        case "share-profile":
          onShareProfile();
          break;
        case "report-bugs":
          onBugsReport();
          break;
        default:
          break;
      }
    },
    [onBugsReport, onShareProfile]
  );
  const onUnfollow = useCallback(async () => {
    if (requesting) return;
    setRequesting(true);
    await dispatch(unfollowUser({ username: user.fid }));
    setRequesting(false);
  }, [dispatch, requesting, user.fid]);
  const onFollow = useCallback(async () => {
    if (requesting) return;
    setRequesting(true);
    await dispatch(followUser({ username: user.fid }));
    setRequesting(false);
  }, [dispatch, requesting, user.fid]);
  return (
    <div className={styles["user-wrap"]}>
      <div className={styles["user-head"]}>
        <ImageView
          alt="avatar"
          src={user?.pfp?.url}
          className={styles.avatar}
        />
        <div className={styles["user-info"]}>
          <div className={styles["name-wrap"]}>
            <span className={styles.name}>{user?.display_name}</span>
            <span className={styles.username}>@{user?.username}</span>
          </div>
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
            {fcUser?.fid && !sameUser && (
              <>
                {user.is_followed ? (
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
    </div>
  );
};

export default memo(UserInfo);
