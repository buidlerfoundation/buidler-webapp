import React from 'react';
import AppInput from '../AppInput';
import './index.scss';

type TextFieldProps = {
  placeholder?: string;
  rightButton?: {
    text: string;
    onPress?: () => void;
    disabled?: boolean;
  };
};

const TextField = ({ placeholder, rightButton }: TextFieldProps) => {
  return (
    <div className="text-field-container">
      <AppInput className="text-input" placeholder={placeholder} />
      {rightButton && (
        <div
          className={`right-button ${rightButton.disabled ? 'disabled' : ''}`}
          onClick={rightButton.onPress}
        >
          <span>{rightButton.text}</span>
        </div>
      )}
    </div>
  );
};

export default TextField;
