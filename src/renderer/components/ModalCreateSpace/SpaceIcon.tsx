import React, { useCallback } from "react";
import "./index.scss";
import { Emoji } from "emoji-mart";
import { CircularProgress } from "@material-ui/core";
import { CreateSpaceData } from "renderer/models";
import images from "renderer/common/images";
import ImageHelper from "renderer/common/ImageHelper";
import useAppSelector from "renderer/hooks/useAppSelector";

type SpaceIconProps = {
  spaceData: CreateSpaceData;
  showDefault?: boolean;
  emojiSize?: number;
};

const SpaceIcon = ({
  spaceData,
  showDefault,
  emojiSize = 40,
}: SpaceIconProps) => {
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const renderSpaceIcon = useCallback(() => {
    if (spaceData.attachment) {
      return (
        <>
          <img className="space-icon" src={spaceData.attachment.file} alt="" />
          {spaceData?.attachment?.loading && (
            <div className="attachment-loading">
              <CircularProgress size={50} />
            </div>
          )}
        </>
      );
    }
    if (spaceData.url) {
      return (
        <img
          className="space-icon"
          src={ImageHelper.normalizeImage(spaceData.url, currentTeam.team_id)}
          alt=""
        />
      );
    }
    if (spaceData.emoji) {
      return <Emoji emoji={spaceData.emoji} set="apple" size={emojiSize} />;
    }
    return <img alt="" src={images.icCameraSolid} />;
  }, [
    emojiSize,
    currentTeam?.team_id,
    spaceData.attachment,
    spaceData.emoji,
    spaceData.url,
  ]);
  if (!spaceData.attachment && !spaceData.emoji && !showDefault) return null;
  return <div className="space-icon__wrapper">{renderSpaceIcon()}</div>;
};

export default SpaceIcon;
