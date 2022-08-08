import { ethers } from "ethers";
import React, { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { useHistory } from "react-router-dom";
import { logout } from "renderer/actions/UserActions";
import api from "renderer/api";
import { AsyncKey } from "renderer/common/AppConfig";
import { clearData, getDeviceCode, setCookie } from "renderer/common/Cookie";
import useAppDispatch from "renderer/hooks/useAppDispatch";
import useAppSelector from "renderer/hooks/useAppSelector";
import ModalConfirmDelete from "renderer/shared/ModalConfirmDelete";
import NormalButton from "renderer/shared/NormalButton";
import "./index.scss";

const SwitchAccountMetaMask = () => {
  const metaMaskAccount = useAppSelector(
    (state) => state.network.metaMaskAccount
  );
  const [openLogout, setOpenLogout] = useState(false);
  const history = useHistory();
  const dispatch = useAppDispatch();
  const toggleLogout = useCallback(
    () => setOpenLogout((current) => !current),
    []
  );
  const handleSignMessage = useCallback(async () => {
    if (!metaMaskAccount) return;
    try {
      const nonceRes = await api.requestNonceWithAddress(metaMaskAccount);
      const message = nonceRes.data?.message;
      if (nonceRes.statusCode !== 200 || !message) {
        return false;
      }
      const metamaskProvider: any = window.ethereum;
      const provider = new ethers.providers.Web3Provider(metamaskProvider);
      const signer = provider.getSigner();
      const signature = await signer.signMessage(message);
      const res = await api.verifyNonce(message, signature);
      if (res.statusCode === 200) {
        await setCookie(AsyncKey.accessTokenKey, res?.token);
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error.message);
    }
  }, [metaMaskAccount]);
  const handleLogout = useCallback(async () => {
    const deviceCode = await getDeviceCode();
    await api.removeDevice({
      device_code: deviceCode,
    });
    clearData(() => {
      history.replace("/started");
      dispatch(logout?.());
    });
  }, [dispatch, history]);
  return (
    <div className="switch-account__container">
      <div className="top-view" />
      <div className="page-body">
        <div className="side-bar-view" />
        <div className="switch-account-view">
          <span className="switch-account-text">
            You've changed primary address in your wallet. You should sign new
            authentication message
          </span>
          <div className="switch-account-buttons">
            <NormalButton
              title="Sign message"
              onPress={handleSignMessage}
              type="main"
            />
            <NormalButton title="Logout" onPress={toggleLogout} type="danger" />
          </div>
        </div>
      </div>
      <ModalConfirmDelete
        open={openLogout}
        handleClose={toggleLogout}
        title="Logout"
        description="Buidler will automatically remove all your data from this account if you log out. Are you sure you want to log out?"
        onDelete={handleLogout}
        contentDelete="Logout"
      />
    </div>
  );
};

export default SwitchAccountMetaMask;
