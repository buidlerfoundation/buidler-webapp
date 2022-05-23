import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '@material-ui/core';
import './index.scss';
import { useDispatch, useSelector } from 'react-redux';
import actionTypes from 'actions/ActionTypes';
import NormalButton from '../NormalButton';
import api from 'api';
import { getDeviceCode } from 'common/Cookie';
import toast from 'react-hot-toast';

const ModalOTP = () => {
  const dispatch = useDispatch();
  const openOTP = useSelector((state: any) => state.configs.openOTP);
  const requestOtpCode = useSelector(
    (state: any) => state.configs.requestOtpCode
  );
  const handleClose = () => {
    dispatch({ type: actionTypes.TOGGLE_OTP });
  };
  const [otp, setOtp] = useState('');
  useEffect(() => {
    setOtp(requestOtpCode || '');
  }, [requestOtpCode]);
  const verifyOtp = async (str: string) => {
    const deviceCode = await getDeviceCode();
    const body = {
      device_code: deviceCode,
      otp_code: str,
    };
    const res = await api.verifyOtp(body);
    if (res.statusCode === 200) {
      dispatch({ type: actionTypes.TOGGLE_OTP });
      toast.success('Your account was verified.');
    }
  };
  return (
    <Modal className="modal-otp" open={openOTP} onClose={handleClose}>
      <div className="otp-view__container">
        <span className="otp__title">
          {requestOtpCode ? 'OTP code' : 'Enter OTP code'}{' '}
        </span>
        {!requestOtpCode && (
          <div className="resend-button normal-button">
            <span>Resend code</span>
          </div>
        )}
        <div className="otp-input__wrapper">
          <div className="otp-item">
            <span>{otp?.[0]}</span>
          </div>
          <div className="otp-item">
            <span>{otp?.[1]}</span>
          </div>
          <div className="otp-item">
            <span>{otp?.[2]}</span>
          </div>
          <div className="otp-item">
            <span>{otp?.[3]}</span>
          </div>
          <input
            className="otp-input"
            value={otp}
            onChange={(e) => {
              const { value } = e.target;
              if (value.length === 4) {
                verifyOtp(value);
              }
              setOtp(value);
            }}
            maxLength={4}
            autoFocus
            disabled={requestOtpCode}
          />
        </div>
        <div className="otp-des">
          <span>
            {requestOtpCode
              ? 'Verification code to log in your new device.'
              : 'A code was sent to your Buidler app in other devices.'}
          </span>
        </div>
        <div className="otp-bottom">
          <NormalButton
            type="normal"
            title={requestOtpCode ? 'Dismiss' : 'Skip'}
            onPress={handleClose}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ModalOTP;
