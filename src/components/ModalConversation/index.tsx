import React from 'react';
import './index.scss';
import ModalFullScreen from '../ModalFullScreen';
import ConversationView from './ConversationView';

type ModalConversationProps = {
  message: any;
  open: boolean;
  handleClose: () => void;
  onAddReact?: (id: string, name: string, userId: string) => void;
  onRemoveReact?: (id: string, name: string, userId: string) => void;
};

const ModalConversation = ({
  handleClose,
  message,
  open,
  onAddReact,
  onRemoveReact,
}: ModalConversationProps) => {
  if (!open) return null;
  return (
    <ModalFullScreen onClosed={handleClose} open={open} position="right">
      <ConversationView
        message={message}
        onEsc={handleClose}
        onAddReact={onAddReact}
        onRemoveReact={onRemoveReact}
      />
    </ModalFullScreen>
  );
};

export default ModalConversation;
