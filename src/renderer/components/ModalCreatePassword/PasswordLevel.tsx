import React from 'react';
import './index.scss';

type PasswordLevelProps = {
  level: number;
};

const PasswordLevel = ({ level }: PasswordLevelProps) => {
  if (level === 0) return null;
  const levelObj = () => {
    if (level <= 2) {
      return {
        label: 'Weak',
        size: 66,
        color: 'var(--color-primary-text)',
      };
    }
    if (level === 3) {
      return {
        label: 'Good',
        size: 134,
        color: 'var(--color-success)',
      };
    }
    return {
      label: 'Excellent',
      size: 200,
      color: 'var(--color-success)',
    };
  };
  const { label, color, size } = levelObj();
  return (
    <div className="password-level">
      <span
        style={{
          color,
          fontWeight: 600,
          fontSize: 12,
          lineHeight: '24px',
        }}
      >
        {label}
      </span>
      <div
        style={{
          width: size,
          height: 8,
          borderRadius: 2,
          marginLeft: 10,
          backgroundColor: color,
        }}
      />
    </div>
  );
};

export default PasswordLevel;
