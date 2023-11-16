import React, { memo, useMemo } from "react";
import styles from "./index.module.scss";
import { IFCUser } from "models/FC";
import ImageView from "shared/ImageView";
import { normalizeContentUrl } from "helpers/CastHelper";
import numeral from "numeral";

interface IUserInfo {
  user: IFCUser;
}

const UserInfo = ({ user }: IUserInfo) => {
  const bio = useMemo(
    () => user?.profile?.bio?.text,
    [user?.profile?.bio?.text]
  );
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
          <div className={styles["user-relate-info"]}>
            <div className={styles["relate-item"]}>
              <span className={styles["main-text"]}>
                {numeral(user?.total_following).format("0[.][0]a")}
              </span>
              <span className={styles["sub-text"]}>Following</span>
            </div>
            <div className={styles["relate-item"]}>
              <span className={styles["main-text"]}>
                {numeral(user?.total_follower).format("0[.][0]a")}
              </span>
              <span className={styles["sub-text"]}>Followers</span>
            </div>
            <div className={styles["relate-item"]}>
              <span className={styles["main-text"]}>
                {numeral(user?.total_cast).format("0[.][0]a")}
              </span>
              <span className={styles["sub-text"]}>Casts</span>
            </div>
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
    </div>
  );
};

export default memo(UserInfo);
