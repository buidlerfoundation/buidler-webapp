import React, { memo, useCallback, useMemo } from "react";
import styles from "./index.module.scss";
import { Community } from "models/Community";
import { useImage } from "providers/ImageProvider";
import IconCommunityDirect from "shared/SVG/IconCommunityDirect";
import DefaultSpaceIcon from "shared/DefaultSpaceIcon";
import ImageView from "shared/ImageView";

type TeamItemProps = {
  t: Community;
  isSelected: boolean;
  onChangeTeam: (team: Community) => void;
  onContextMenu?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    team: Community
  ) => void;
};

const TeamItem = ({
  t,
  isSelected,
  onChangeTeam,
  onContextMenu,
}: TeamItemProps) => {
  const imageHelper = useImage();
  const handleClick = useCallback(() => {
    if (!isSelected) onChangeTeam(t);
  }, [isSelected, onChangeTeam, t]);
  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (t.direct) return;
      onContextMenu?.(e, t);
    },
    [onContextMenu, t]
  );
  const renderCommunityIcon = useCallback(() => {
    if (t?.direct) return <IconCommunityDirect />;
    if (t?.team_icon)
      return (
        <ImageView
          alt=""
          className="team-icon-mini"
          src={imageHelper.normalizeImage(t?.team_icon, t?.team_id, {
            w: 40,
            h: 40,
            radius: 5,
          })}
        />
      );
    return (
      <DefaultSpaceIcon
        name={t.team_display_name ? t.team_display_name.charAt(0) : ""}
        size={20}
        borderRadius={5}
        fontSize={12}
      />
    );
  }, [imageHelper, t?.direct, t.team_display_name, t?.team_icon, t?.team_id]);
  const isUnseen = useMemo(() => {
    return !t.seen;
  }, [t.seen]);
  return (
    <div
      className={`${styles["team-item"]} ${
        isSelected ? styles["team-selected"] : ""
      }`}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
    >
      <div className={styles["team-icon-mini__wrap"]}>
        {renderCommunityIcon()}
        {isUnseen && <div className={styles["badge-unseen"]} />}
      </div>
      <span className={styles["team-name"]}>{t.team_display_name}</span>
    </div>
  );
};

export default memo(TeamItem);
