import React from 'react';
import GlobalVariable from '../../services/GlobalVariable';

const AppTextArea = (props: React.InputHTMLAttributes<any>) => {
  return (
    <textarea
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

export default AppTextArea;
