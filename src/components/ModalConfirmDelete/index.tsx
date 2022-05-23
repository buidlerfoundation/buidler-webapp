import React from 'react';
import Modal from '@material-ui/core/Modal';
import './index.scss';
import NormalButton from '../NormalButton';

type ModalConfirmDeleteProps = {
  open: boolean;
  handleClose: () => void;
  onDelete: () => void;
  title: string;
  description: string;
  contentName?: string;
  contentDelete: string;
};

const ModalConfirmDelete = ({
  open,
  handleClose,
  onDelete,
  title,
  description,
  contentName,
  contentDelete,
}: ModalConfirmDeleteProps) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="confirm-delete-channel-modal"
      style={{ backgroundColor: 'var(--color-backdrop)' }}
    >
      <div style={{ display: 'table' }}>
        <div className="confirm-delete-channel-view__container">
          <span className="confirm-delete-channel__title">{title}</span>
          <div style={{ height: 24 }} />
          <div className="confirm-delete-channel__content-wrapper">
            <span
              className="confirm-delete-channel__content"
              style={{ whiteSpace: 'break-spaces' }}
            >
              {description}
            </span>
            {contentName && (
              <div className="channel-name">
                <span>{contentName}</span>
              </div>
            )}
          </div>
          <div className="confirm-delete-channel__bottom">
            <NormalButton title="Cancel" onPress={handleClose} type="normal" />
            <div style={{ width: 10 }} />
            <NormalButton
              title={contentDelete}
              onPress={onDelete}
              type="danger"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ModalConfirmDelete;
