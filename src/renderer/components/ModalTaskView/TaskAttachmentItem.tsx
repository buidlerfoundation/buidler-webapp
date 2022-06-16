import { CircularProgress } from '@material-ui/core';
import React, { useState } from 'react';
import api from '../../api';
import ImageHelper from '../../common/ImageHelper';
import images from '../../common/images';
import ImgLightBox from '../ImgLightBox';
import './index.scss';

type TaskAttachmentItemProps = {
  attachment: any;
  teamId: string;
  onRemoveAttachment: (attachment: any) => void;
};

const TaskAttachmentItem = ({
  attachment,
  teamId,
  onRemoveAttachment,
}: TaskAttachmentItemProps) => {
  if (attachment.mimetype?.includes?.('video')) {
    return (
      <div className="attachment-view">
        <video className="attachment-item" controls>
          <source
            src={
              attachment.file ||
              ImageHelper.normalizeImage(attachment.file_url, teamId)
            }
            type="video/mp4"
          />
        </video>
        {attachment.loading && (
          <div className="attachment-loading">
            <CircularProgress />
          </div>
        )}
        {attachment.file_id && (
          <div
            className="attachment-delete"
            onClick={async () => {
              await api.removeFile(attachment.file_id);
              onRemoveAttachment(attachment);
            }}
          >
            <img alt="" src={images.icCircleClose} />
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="attachment-view normal-button">
      <ImgLightBox
        originalSrc={
          attachment.file ||
          ImageHelper.normalizeImage(attachment.file_url, teamId)
        }
      >
        <div className="attachment-item-wrapper">
          <img
            className="attachment-item"
            alt=""
            src={
              attachment.file ||
              ImageHelper.normalizeImage(attachment.file_url, teamId, {
                h: 120,
              })
            }
          />
          <div className="attachment-name">
            <span className="text">{attachment.original_name}</span>
          </div>
        </div>
      </ImgLightBox>
      {attachment.loading && (
        <div className="attachment-loading">
          <CircularProgress />
        </div>
      )}
      {attachment.file_id && (
        <div
          className="attachment-delete"
          onClick={async () => {
            await api.removeFile(attachment.file_id);
            onRemoveAttachment(attachment);
          }}
        >
          <img alt="" src={images.icCircleClose} />
        </div>
      )}
    </div>
  );
};

export default TaskAttachmentItem;
