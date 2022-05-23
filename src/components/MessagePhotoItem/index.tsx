import React from 'react';
import './index.scss';
import ImgLightBox from '../ImgLightBox';
import ImageHelper from '../../common/ImageHelper';
import images from '../../common/images';

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
  if (!teamId) return null;
  return (
    <div
      className="message-photo-container"
      style={{ marginLeft: isHead ? 20 : 0 }}
    >
      {photos.map((photo) => {
        if (photo.mimetype.includes('application')) {
          return (
            <div
              className="file-item"
              onClick={() => {
                window.open(
                  ImageHelper.normalizeImage(photo.file_url, teamId, {}, true),
                  '_blank'
                );
              }}
              key={`${photo?.file_id}`}
            >
              <img alt="" src={images.icFile} />
              <span className="file-name">{photo.original_name}</span>
              <img alt="" src={images.icDownload} />
            </div>
          );
        }
        if (photo.mimetype.includes('video')) {
          return (
            <video
              className="photo-item video"
              controls
              key={`${photo?.file_id}`}
            >
              <source
                src={ImageHelper.normalizeImage(photo.file_url, teamId)}
                type="video/mp4"
              />
            </video>
          );
        }
        return (
          <ImgLightBox
            key={`${photo?.file_id}`}
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
      })}
    </div>
  );
};

export default MessagePhotoItem;
