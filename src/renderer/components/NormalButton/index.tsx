import React, { useCallback, useEffect } from 'react';
import './index.scss';
import { CircularProgress } from '@material-ui/core';

type ButtonType = 'success' | 'primary' | 'normal' | 'main' | 'danger';

type NormalButtonProps = {
  title: string;
  type: ButtonType;
  onPress: () => void;
  loading?: boolean;
};

const NormalButton = ({ title, type, onPress, loading }: NormalButtonProps) => {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (event.metaKey && event.key === 'Enter' && type === 'main') {
        event.preventDefault();
        onPress?.();
      }
    };
    document.addEventListener('keydown', listener);
    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, [onPress, type]);
  const handleClick = useCallback(() => {
    if (loading) return;
    onPress?.();
  }, [loading, onPress]);
  return (
    <div
      className={`normal-button__container button-${type}`}
      onClick={handleClick}
    >
      <span className={`${loading ? 'invisible' : ''}`}>{title}</span>
      {loading && (
        <div className="loading-container">
          <CircularProgress size={16} color="inherit" />
        </div>
      )}
    </div>
  );
};

export default NormalButton;
