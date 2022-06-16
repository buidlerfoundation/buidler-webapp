import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "@material-ui/core";
import "./index.scss";
import useAppSelector from "renderer/hooks/useAppSelector";
import actionTypes from "renderer/actions/ActionTypes";
import api from "renderer/api";
import { getDeviceCode } from "renderer/common/Cookie";
import toast from "react-hot-toast";
import WalletConnectUtils from "renderer/services/connectors/WalletConnectUtils";
import NormalButton from "../NormalButton";
import useAppDispatch from "renderer/hooks/useAppDispatch";
import MetamaskUtils from "renderer/services/connectors/MetamaskUtils";

const ModalOTP = () => {
  const dispatch = useAppDispatch();
  const openOTP = useAppSelector(
    (state) =>
      state.configs.openOTP &&
      !WalletConnectUtils.connector?.connected &&
      !MetamaskUtils.connected
  );
  const requestOtpCode = useAppSelector(
    (state) => state.configs.requestOtpCode
  );
  const [otp, setOtp] = useState("");
  const verifyOtp = useCallback(
    async (str: string) => {
      const deviceCode = await getDeviceCode();
      const body = {
        device_code: deviceCode,
        otp_code: str,
      };
      const res = await api.verifyOtp(body);
      if (res.statusCode === 200) {
        dispatch({ type: actionTypes.TOGGLE_OTP });
        toast.success("Your account was verified.");
      }
    },
    [dispatch]
  );
  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      if (value.length === 4) {
        verifyOtp(value);
      }
      setOtp(value);
    },
    [verifyOtp]
  );
  const handleClose = useCallback(() => {
    dispatch({ type: actionTypes.TOGGLE_OTP });
  }, [dispatch]);
  useEffect(() => {
    setOtp(requestOtpCode || "");
  }, [requestOtpCode]);
  return (
    <Modal className="modal-otp" open={openOTP} onClose={handleClose}>
      <div className="otp-view__container">
        <span className="otp__title">
          {requestOtpCode ? "OTP code" : "Enter OTP code"}{" "}
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
            onChange={onInputChange}
            maxLength={4}
            autoFocus
            disabled={!!requestOtpCode}
          />
        </div>
        <div className="otp-des">
          <span>
            {requestOtpCode
              ? "Verification code to log in your new device."
              : "A code was sent to your Buidler app in other devices."}
          </span>
        </div>
        <div className="otp-bottom">
          <NormalButton
            type="normal"
            title={requestOtpCode ? "Dismiss" : "Skip"}
            onPress={handleClose}
          />
        </div>
      </div>
    </Modal>
  );
};

export default ModalOTP;
