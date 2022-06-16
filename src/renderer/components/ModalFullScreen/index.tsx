import React, { useCallback, useEffect, useState } from 'react';
import './index.scss';

type ModalFullScreenProps = {
  open: boolean;
  onClosed: () => void;
  children: React.ReactElement;
  position?: 'center' | 'right';
};

const ModalFullScreen = ({
  onClosed,
  children,
  open,
  position = 'center',
}: ModalFullScreenProps) => {
  const [isOpen, setOpen] = useState(open);
  useEffect(() => {
    setOpen(open);
  }, [open]);
  const onParentClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
    },
    []
  );
  const onBackgroundClick = useCallback(() => {
    setOpen(false);
    onClosed();
  }, [onClosed]);
  if (!isOpen) return null;
  return (
    <div
      className="modal-fullscreen__container modal-fullscreen__backdrop"
      onClick={onBackgroundClick}
    >
      <div
        className={`modal-fullscreen__view modal-fullscreen__${position}`}
        onClick={onParentClick}
      >
        {children}
      </div>
    </div>
  );
};

export default ModalFullScreen;
