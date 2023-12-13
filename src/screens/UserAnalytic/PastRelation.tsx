import React, { memo, useCallback, useMemo, useState } from "react";
import styles from "./index.module.scss";
import { IPastRelationData } from "models/FC";
import { dateFormatted } from "utils/DateUtils";
import { Tooltip } from "@mui/material";
import RecentRelation from "./RecentRelation";
import useFCUserPastRelationCast from "hooks/useFCUserPastRelationCast";
import useFCUserPastRelationReaction from "hooks/useFCUserPastRelationReaction";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useUserRelationTabs from "hooks/useUserRelationTabs";
import useAppSelector from "hooks/useAppSelector";
import useAppDispatch from "hooks/useAppDispatch";
import { FC_USER_ACTIONS } from "reducers/FCUserReducers";

interface IPastRelation {
  data?: IPastRelationData;
  name?: string;
  fid?: string;
}

const PastRelation = ({ data, name, fid }: IPastRelation) => {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const user = useAppSelector((state) => state.fcUser.data);
  const [currentRelationIndex, setRelationIndex] = useState(0);
  const userRelationTabs = useUserRelationTabs();
  const dataPastRelationCastReply = useFCUserPastRelationCast("reply", fid);
  const dataPastRelationCastMention = useFCUserPastRelationCast("mention", fid);
  const dataPastRelationReaction = useFCUserPastRelationReaction(fid);
  const totalLikes = useMemo(() => data?.likes || 0, [data?.likes]);
  const totalRecasts = useMemo(() => data?.recasts || 0, [data?.recasts]);
  const totalReplyCasts = useMemo(
    () => data?.replied_casts || 0,
    [data?.replied_casts]
  );
  const totalMentions = useMemo(() => data?.mentions || 0, [data?.mentions]);
  const since = useMemo(
    () => data?.first_interacted_at || new Date(),
    [data?.first_interacted_at]
  );
  const total = useMemo(() => {
    return totalLikes + totalRecasts + totalReplyCasts + totalMentions;
  }, [totalLikes, totalMentions, totalRecasts, totalReplyCasts]);
  const dataPastRelation = useMemo(
    () => [
      { label: "Replied", color: "rgb(124, 101, 193)", count: totalReplyCasts },
      { label: "Liked", color: "var(--color-mention)", count: totalLikes },
      { label: "Recast", color: "var(--color-recast)", count: totalRecasts },
      { label: "Mentioned", color: "var(--color-blue)", count: totalMentions },
    ],
    [totalLikes, totalMentions, totalRecasts, totalReplyCasts]
  );
  const onLoginClick = useCallback(() => {
    const loginElement = document.getElementById("btn-login");
    dispatch(FC_USER_ACTIONS.updateLoginSource("View Past Interaction"));
    loginElement?.click();
  }, [dispatch]);
  const renderBody = useCallback(() => {
    if (!user?.fid) {
      return (
        <div
          className={`${styles["empty-box"]} normal-button-clear`}
          style={{ marginTop: 10 }}
          onClick={onLoginClick}
        >
          <span style={{ textAlign: "center" }}>
            See your past moments with this person (likes, replies, mentions,
            recasts, etc.)
          </span>
          <div className={styles["btn-login"]}>Login</div>
        </div>
      );
    }
    if (!data) return null;
    if (total > 0) {
      return (
        <>
          <p className={styles.description}>
            <span className={styles.highlight}>You</span> and{" "}
            <span className={styles.highlight}>{name}</span> have interacted{" "}
            <span className={styles.highlight}>{total} times</span> since{" "}
            {dateFormatted(since, "MMMM DD, YYYY")}
          </p>
          <div className={styles["past-relation-chart"]}>
            {dataPastRelation.map((el) => (
              <Tooltip
                title={`${el.count} ${el.label}`}
                key={el.label}
                placement="top"
              >
                <div
                  className={styles["past-relation-item"]}
                  style={{
                    width: `${Math.round((el.count * 1000) / total) / 10}%`,
                    background: el.color,
                  }}
                />
              </Tooltip>
            ))}
          </div>
          <div className={styles["past-relation-category"]}>
            {dataPastRelation.map((el) => (
              <div className={styles["category-item"]} key={el.label}>
                <div style={{ width: 10, height: 10, background: el.color }} />
                <span>{el.label}</span>
              </div>
            ))}
          </div>
          <RecentRelation
            dataMention={dataPastRelationCastMention}
            dataReaction={dataPastRelationReaction}
            dataReply={dataPastRelationCastReply}
            name={name}
            currentRelationIndex={currentRelationIndex}
            setRelationIndex={setRelationIndex}
          />
        </>
      );
    }
    return (
      <div className={styles["empty-box"]} style={{ marginTop: 10 }}>
        Seems like you and {name} haven't had any interactions yet.
      </div>
    );
  }, [
    currentRelationIndex,
    data,
    dataPastRelation,
    dataPastRelationCastMention,
    dataPastRelationCastReply,
    dataPastRelationReaction,
    name,
    onLoginClick,
    since,
    total,
    user?.fid,
  ]);
  return (
    <div className={styles["chart-item"]} style={{ height: "unset", gap: 10 }}>
      <div className={styles["label-wrap"]}>
        <span className={styles.label}>Memories with @{name}</span>
        {total > 0 && (
          <Link
            className={styles["btn-view-all"]}
            href={`${pathname}${userRelationTabs[currentRelationIndex].path}`}
          >
            View all
          </Link>
        )}
      </div>
      {renderBody()}
    </div>
  );
};

export default memo(PastRelation);
