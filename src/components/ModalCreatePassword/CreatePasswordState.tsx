import React, { useMemo, useState } from 'react';
import { passwordRules } from '../../helpers/PasswordHelper';
import AppInput from '../AppInput';
import PasswordLevel from './PasswordLevel';
import './index.scss';

type CreatePasswordStateProps = {
  password: string;
  onChangeText: (e: any) => void;
};

const CreatePasswordState = ({
  password,
  onChangeText,
}: CreatePasswordStateProps) => {
  // const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(true);
  const togglePassword = () => setShowPassword(!showPassword);
  const passwordLevel = useMemo(() => {
    const requiredPassRules = passwordRules().filter((el) => el.isRequired);
    const passRequired = requiredPassRules.filter((el) =>
      el.regex.test(password)
    );
    if (
      requiredPassRules.length > 0 &&
      passRequired.length < requiredPassRules.length
    )
      return 0;
    return passwordRules().filter((el) => el.regex.test(password)).length;
  }, [password]);
  return (
    <div className="modal-state__container">
      <span className="title">Create password</span>
      <div className="input-password__wrapper">
        <AppInput
          className="app-input-highlight"
          placeholder="Your wallet password"
          type={showPassword ? 'text' : 'password'}
          style={{ paddingRight: 80, width: 'calc(100% - 100px)' }}
          value={password}
          onChange={onChangeText}
        />
        <div className="toggle-password normal-button" onClick={togglePassword}>
          {showPassword ? 'Hide' : 'Show'}
        </div>
      </div>
      <div className="recommend-wrapper">
        <span className="sub-text">Recommendation</span>
        <PasswordLevel level={passwordLevel} />
      </div>
      {passwordRules().map((el) => {
        const match = el.regex.test(password);
        const suffix = el.isRequired ? ' *' : '';
        return (
          <span
            key={el.label}
            className={`sub-text ${passwordLevel > 0 && match && 'match'}`}
          >
            {' '}
            • {el.label}
            {suffix}
          </span>
        );
      })}
      {/* <a
        className="password-des"
        href="https://google.com"
        target="_blank"
        rel="noreferrer"
      >
        How does Buidler store your password?
      </a> */}
    </div>
  );
};

export default CreatePasswordState;
