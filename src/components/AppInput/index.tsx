import React from 'react';
import GlobalVariable from '../../services/GlobalVariable';

const AppInput = (props: React.InputHTMLAttributes<any>) => {
  return (
    <input
      {...props}
      onFocus={(evt) => {
        GlobalVariable.isInputFocus = true;
        props?.onFocus?.(evt);
      }}
      onBlur={(evt) => {
        GlobalVariable.isInputFocus = false;
        props?.onBlur?.(evt);
      }}
    />
  );
};

export default AppInput;
