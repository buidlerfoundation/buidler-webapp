import React, { useCallback } from "react";
import "./index.scss";
import ImgLightBox from "../ImgLightBox";
import ImageHelper from "../../common/ImageHelper";
import images from "../../common/images";

type PhotoItemProps = {
  photo: any;
  handleFileClick: (file: any) => void;
  teamId: string;
};

const PhotoItem = ({ photo, handleFileClick, teamId }: PhotoItemProps) => {
  const handleClick = useCallback(
    () => handleFileClick(photo),
    [handleFileClick, photo]
  );
  if (photo.mimetype.includes("application")) {
    return (
      <div className="file-item" onClick={handleClick}>
        <img alt="" src={images.icFile} />
        <span className="file-name">{photo.original_name}</span>
        <img alt="" src={images.icDownload} />
      </div>
    );
  }
  if (photo.mimetype.includes("video")) {
    return (
      <video className="photo-item video" controls>
        <source
          src={ImageHelper.normalizeImage(photo.file_url, teamId)}
          type="video/mp4"
        />
      </video>
    );
  }
  return (
    <ImgLightBox
      originalSrc={ImageHelper.normalizeImage(photo.file_url, teamId)}
    >
      <img
        className="photo-item"
        alt=""
        src={ImageHelper.normalizeImage(photo.file_url, teamId, {
          h: 120,
        })}
      />
    </ImgLightBox>
  );
};

type MessagePhotoItemProps = {
  photos: Array<any>;
  teamId?: string;
  isHead: boolean;
};

const MessagePhotoItem = ({
  photos,
  teamId,
  isHead,
}: MessagePhotoItemProps) => {
  const handleFileClick = useCallback(
    (photo: any) => {
      window.open(
        ImageHelper.normalizeImage(photo.file_url, teamId || "", {}, true),
        "_blank"
      );
    },
    [teamId]
  );
  const renderPhoto = useCallback(
    (photo: any) => (
      <PhotoItem
        photo={photo}
        handleFileClick={handleFileClick}
        teamId={teamId || ""}
        key={`${photo?.file_id}`}
      />
    ),
    [handleFileClick, teamId]
  );
  if (!teamId) return null;
  return (
    <div
      className="message-photo-container"
      style={{ marginLeft: isHead ? 20 : 0 }}
    >
      {photos.map(renderPhoto)}
    </div>
  );
};

export default MessagePhotoItem;
