import React from 'react';
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
  return (
    <div
      className={`normal-button__container button-${type}`}
      onClick={() => {
        if (loading) return;
        onPress();
      }}
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
