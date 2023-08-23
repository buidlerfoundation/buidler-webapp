import React, { memo, useCallback, useMemo } from "react";
import styles from "./index.module.scss";
import { Community } from "models/Community";
import { useImage } from "providers/ImageProvider";
import IconCommunityDirect from "shared/SVG/IconCommunityDirect";
import DefaultSpaceIcon from "shared/DefaultSpaceIcon";
import ImageView from "shared/ImageView";
import IconMenuClose from "shared/SVG/IconMenuClose";
import useUser from "hooks/useUser";

type TeamItemProps = {
  t: Community;
  isSelected: boolean;
  onChangeTeam: (team: Community) => void;
  onContextMenu?: (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>,
    team: Community
  ) => void;
  onRemove: (team: Community) => void;
};

const TeamItem = ({
  t,
  isSelected,
  onChangeTeam,
  onContextMenu,
  onRemove,
}: TeamItemProps) => {
  const userData = useUser();
  const imageHelper = useImage();
  const handleClick = useCallback(() => {
    if (!isSelected) onChangeTeam(t);
  }, [isSelected, onChangeTeam, t]);
  const handleRemove = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
      onRemove(t);
    },
    [onRemove, t]
  );
  const handleContextMenu = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (t.direct) return;
      onContextMenu?.(e, t);
    },
    [onContextMenu, t]
  );
  const renderCommunityIcon = useCallback(() => {
    if (t?.direct) return <IconCommunityDirect />;
    if (t?.community_image)
      return (
        <ImageView
          alt=""
          className="team-icon-mini"
          src={imageHelper.normalizeImage(t?.community_image, t?.community_id, {
            w: 40,
            h: 40,
            radius: 5,
          })}
        />
      );
    return (
      <DefaultSpaceIcon
        name={t.community_name ? t.community_name.charAt(0) : ""}
        size={20}
        borderRadius={5}
        fontSize={12}
      />
    );
  }, [
    imageHelper,
    t?.direct,
    t.community_name,
    t?.community_image,
    t?.community_id,
  ]);
  const isUnseen = useMemo(() => {
    return false;
  }, []);
  const communityDisplayName = useMemo(
    () => t.community_url || t.community_name,
    [t.community_name, t.community_url]
  );
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
      <span className={styles["team-name"]}>{communityDisplayName}</span>
      {!!userData.user_id && (
        <div className={styles["btn-close"]} onClick={handleRemove}>
          <IconMenuClose size={20} background="var(--color-secondary-text)" />
        </div>
      )}
    </div>
  );
};

export default memo(TeamItem);
