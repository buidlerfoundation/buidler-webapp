import React, { useState } from 'react';
import './index.scss';

type ModalFullScreenProps = {
  open: boolean;
  onClosed: () => void;
  children: any;
  position?: 'center' | 'right';
};

const ModalFullScreen = ({
  onClosed,
  children,
  open,
  position = 'center',
}: ModalFullScreenProps) => {
  const [isOpen, setOpen] = useState(open);
  if (!isOpen) return null;
  return (
    <div
      className="modal-fullscreen__container modal-fullscreen__backdrop"
      onClick={(e) => {
        setOpen(false);
        onClosed();
      }}
    >
      <div
        className={`modal-fullscreen__view modal-fullscreen__${position}`}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ModalFullScreen;
