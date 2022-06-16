import { CircularProgress } from '@material-ui/core';
import React, { useCallback } from 'react';
import api from '../../api';
import ImageHelper from '../../common/ImageHelper';
import images from '../../common/images';
import './index.scss';

type AttachmentItemProps = {
  att: any;
  onRemove: (att: any) => void;
  teamId: string;
};

const AttachmentItem = ({ att, onRemove, teamId }: AttachmentItemProps) => {
  const handleRemoveClick = useCallback(async () => {
    await api.removeFile(att.id);
    onRemove(att);
  }, [att, onRemove]);
  const renderPreviewAttachment = useCallback(() => {
    const file = att.file || ImageHelper.normalizeImage(att.file_url, teamId);
    if (att.type.includes('video')) {
      return (
        <video className="message-attachment__img">
          <source src={file} type="video/mp4" />
        </video>
      );
    }
    return <img alt="" className="message-attachment__img" src={file} />;
  }, [att?.file, att?.file_url, att?.type, teamId]);
  if (att.type.includes('application')) {
    return (
      <div className="message-attachment__item" style={{ width: '100%' }}>
        <div className="message-attachment__file">
          <img alt="" src={images.icFile} style={{ marginLeft: 20 }} />
          <span style={{ flex: 1, margin: '0 20px' }}>{att.name}</span>
        </div>
        {att.loading && (
          <div className="attachment-loading">
            <CircularProgress />
          </div>
        )}
        {att.id && (
          <div className="attachment-delete" onClick={handleRemoveClick}>
            <img alt="" src={images.icCircleClose} />
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="message-attachment__item">
      {renderPreviewAttachment()}
      {att.loading && (
        <div className="attachment-loading">
          <CircularProgress />
        </div>
      )}
      {att.id && (
        <div className="attachment-delete" onClick={handleRemoveClick}>
          <img alt="" src={images.icCircleClose} />
        </div>
      )}
    </div>
  );
};

export default AttachmentItem;
