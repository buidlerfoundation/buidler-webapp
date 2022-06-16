import React, { memo } from 'react';
import './index.scss';
import { ConversationData } from 'renderer/models';
import ModalFullScreen from '../ModalFullScreen';
import ConversationView from './ConversationView';

type ModalConversationProps = {
  open: boolean;
  handleClose: () => void;
  conversations: Array<ConversationData>;
};

const ModalConversation = ({
  handleClose,
  open,
  conversations,
}: ModalConversationProps) => {
  if (!open) return null;
  return (
    <ModalFullScreen onClosed={handleClose} open={open} position="right">
      <ConversationView onEsc={handleClose} conversations={conversations} />
    </ModalFullScreen>
  );
};

export default memo(ModalConversation);
